import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { createParticipantSchema } from '@/server/validators/participant';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission('participant.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);
    const searchParams = req.nextUrl.searchParams;

    // Filters
    const competitionId = searchParams.get('competition_id');
    const rawLptkId = searchParams.get('lptk_id');
    const villageId = searchParams.get('village_id');
    const categoryId = searchParams.get('category_id');
    const genderCode = searchParams.get('gender_code');
    const statusCode = searchParams.get('status_code');

    // Operator scoping
    let lptkId = rawLptkId;
    if (user.role_code === 'OPERATOR_LPTK') {
      if (!user.lptk_id) {
        return errorResponse('FORBIDDEN', 'Akun Operator Anda belum terhubung dengan LPTK manapun.', 403);
      }
      lptkId = user.lptk_id;
    }

    // Build conditions dynamically with parameter binding
    const whereConditions: string[] = ['p.deleted_at IS NULL'];
    const queryParams: any[] = [];
    let pIndex = 1;

    if (q) {
      whereConditions.push(`(p.name ILIKE $${pIndex} OR p.nik ILIKE $${pIndex} OR p.school_or_institution ILIKE $${pIndex})`);
      queryParams.push(`%${q}%`);
      pIndex++;
    }

    if (competitionId) {
      whereConditions.push(`p.competition_id = $${pIndex}`);
      queryParams.push(competitionId);
      pIndex++;
    }

    if (lptkId) {
      whereConditions.push(`p.lptk_id = $${pIndex}`);
      queryParams.push(lptkId);
      pIndex++;
    }

    if (villageId) {
      whereConditions.push(`l.village_id = $${pIndex}`);
      queryParams.push(villageId);
      pIndex++;
    }

    if (genderCode) {
      whereConditions.push(`p.gender_code = $${pIndex}`);
      queryParams.push(genderCode);
      pIndex++;
    }

    if (statusCode) {
      whereConditions.push(`p.status_code = $${pIndex}`);
      queryParams.push(statusCode);
      pIndex++;
    }

    if (categoryId) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM public.participant_categories pc WHERE pc.participant_id = p.id AND pc.category_id = $${pIndex}
      )`);
      queryParams.push(categoryId);
      pIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Count Query
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.participants p
      JOIN public.lptks l ON p.lptk_id = l.id
      WHERE ${whereClause};
    `;
    const countRes = await db.raw(countSql, queryParams);
    const totalItems = countRes[0]?.count || 0;

    // List Query
    const listSql = `
      SELECT 
        p.id, p.competition_id, comp.name AS competition_name,
        p.lptk_id, l.name AS lptk_name,
        l.village_id, v.name AS village_name,
        p.name, p.nik, p.gender_code, p.birth_place, p.birth_date,
        p.phone, p.status_code, p.photo_url, p.submitted_at, p.created_at, p.updated_at,
        COALESCE(
          json_agg(json_build_object('id', cat.id, 'name', cat.name)) FILTER (WHERE cat.id IS NOT NULL),
          '[]'
        ) AS categories,
        COUNT(DISTINCT pd.id)::int AS documents_count
      FROM public.participants p
      JOIN public.competitions comp ON p.competition_id = comp.id
      JOIN public.lptks l ON p.lptk_id = l.id
      JOIN public.villages v ON l.village_id = v.id
      LEFT JOIN public.participant_categories pc ON p.id = pc.participant_id
      LEFT JOIN public.categories cat ON pc.category_id = cat.id
      LEFT JOIN public.participant_documents pd ON p.id = pd.participant_id
      WHERE ${whereClause}
      GROUP BY p.id, comp.name, l.name, l.village_id, v.name
      ORDER BY p.${sort} ${order.toUpperCase()}
      LIMIT $${pIndex} OFFSET $${pIndex + 1};
    `;

    queryParams.push(pageSize, offset);
    const items = await db.raw(listSql, queryParams);

    return successResponse(items, createPaginationMeta(totalItems, page, pageSize));
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission('participant.write');
    const body = await req.json();
    const parsed = createParticipantSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const {
      competition_id,
      lptk_id,
      name,
      nik,
      gender_code,
      birth_place,
      birth_date,
      address,
      phone,
      school_or_institution,
      father_name,
      mother_name,
      category_ids,
    } = parsed.data;

    // Operator scope verification
    if (user.role_code === 'OPERATOR_LPTK') {
      if (user.lptk_id !== lptk_id) {
        return errorResponse('FORBIDDEN', 'Operator hanya dapat mendaftarkan peserta untuk LPTK-nya sendiri.', 403);
      }
    }

    // Check NIK duplication in this competition
    const dupNik = await db.query`
      SELECT id FROM public.participants 
      WHERE competition_id = ${competition_id} AND nik = ${nik} AND deleted_at IS NULL 
      LIMIT 1;
    `;
    if (dupNik.length > 0) {
      return errorResponse('DUPLICATE_NIK', 'NIK ini sudah terdaftar dalam perlombaan yang sama.', 400);
    }

    // Insert participant
    const rows = await db.query`
      INSERT INTO public.participants (
        competition_id, lptk_id, name, nik, gender_code, birth_place, birth_date,
        address, phone, school_or_institution, father_name, mother_name,
        status_code, created_by
      ) VALUES (
        ${competition_id}, ${lptk_id}, ${name}, ${nik}, ${gender_code}, ${birth_place}, ${birth_date},
        ${address}, ${phone}, ${school_or_institution || null}, ${father_name || null}, ${mother_name || null},
        'DRAFT', ${user.id}
      )
      RETURNING id, name, nik, status_code, created_at;
    `;

    const newParticipant = rows[0];

    // Link categories
    for (const catId of category_ids) {
      await db.query`
        INSERT INTO public.participant_categories (participant_id, category_id)
        VALUES (${newParticipant.id}, ${catId})
        ON CONFLICT DO NOTHING;
      `;
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'CREATE_PARTICIPANT',
      entityType: 'participant',
      entityId: newParticipant.id,
      newData: { id: newParticipant.id, name, nik, lptk_id, competition_id },
    });

    return successResponse(newParticipant, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
