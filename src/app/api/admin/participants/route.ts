import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { db } from '@/server/db/client';
import { createParticipantSchema, createCollectiveParticipantSchema } from '@/server/validators/participant';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';
import { generateParticipantNumber } from '@/server/utils/participant-number';

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
    const teamId = searchParams.get('team_id');

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
      whereConditions.push(`(p.name ILIKE $${pIndex} OR p.nik ILIKE $${pIndex} OR p.school_or_institution ILIKE $${pIndex} OR p.participant_number ILIKE $${pIndex} OR p.team_name ILIKE $${pIndex})`);
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

    if (teamId) {
      whereConditions.push(`p.team_id = $${pIndex}`);
      queryParams.push(teamId);
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
        p.participant_number, p.team_id, p.team_name, p.team_role, p.team_leader_name, p.emergency_phone,
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

    // -------------------------------------------------------------
    // Branch A: Collective Team Registration (Syarhil, Fahmil, etc.)
    // -------------------------------------------------------------
    if (body.is_collective || Array.isArray(body.members)) {
      const parsedCollective = createCollectiveParticipantSchema.safeParse(body);
      if (!parsedCollective.success) {
        return errorResponse(
          'VALIDATION_ERROR',
          parsedCollective.error.errors[0]?.message || 'Input pendaftaran regu tidak valid',
          400
        );
      }

      const {
        competition_id,
        lptk_id,
        category_id,
        team_name,
        team_leader_name,
        emergency_phone,
        school_or_institution,
        delegation_letter_url,
        payment_proof_url,
        members,
      } = parsedCollective.data;

      // Operator scoping
      let effectiveLptkId = lptk_id;
      if (user.role_code === 'OPERATOR_LPTK') {
        if (!user.lptk_id) {
          return errorResponse('FORBIDDEN', 'Akun Operator Anda belum terhubung dengan data LPTK Desa manapun.', 403);
        }
        effectiveLptkId = user.lptk_id;
      }

      // Check duplicate NIKs within the submitted team
      const nikSet = new Set<string>();
      for (const m of members) {
        if (nikSet.has(m.nik)) {
          return errorResponse('DUPLICATE_NIK', `NIK ${m.nik} ganda dalam daftar anggota regu yang diinput.`, 400);
        }
        nikSet.add(m.nik);
      }

      // Check if any member NIK is already registered in this competition
      const existingNiks = await db.raw(
        `SELECT nik, name FROM public.participants WHERE competition_id = $1 AND nik = ANY($2::text[]) AND deleted_at IS NULL;`,
        [competition_id, Array.from(nikSet)]
      );
      if (existingNiks && existingNiks.length > 0) {
        return errorResponse(
          'DUPLICATE_NIK',
          `Peserta ${existingNiks[0].name} (NIK: ${existingNiks[0].nik}) sudah terdaftar dalam perlombaan ini.`,
          400
        );
      }

      // Generate sequential team participant number (e.g. SQ-01, FQ-01)
      const participantNumber = await generateParticipantNumber(competition_id, category_id, true);
      const teamId = crypto.randomUUID();

      const createdMembers = [];

      for (const m of members) {
        const rows = await db.query`
          INSERT INTO public.participants (
            competition_id, lptk_id, name, nik, gender_code, birth_place, birth_date,
            address, phone, school_or_institution, father_name, mother_name, photo_url,
            participant_number, team_id, team_name, team_role, team_leader_name, emergency_phone,
            delegation_letter_url, payment_proof_url,
            status_code, created_by
          ) VALUES (
            ${competition_id}, ${effectiveLptkId}, ${m.name}, ${m.nik}, ${m.gender_code}, ${m.birth_place}, ${m.birth_date},
            ${m.address || null}, ${m.phone || emergency_phone}, ${m.school_or_institution || school_or_institution || null},
            ${m.father_name || null}, ${m.mother_name || null}, ${m.photo_url || null},
            ${participantNumber}, ${teamId}, ${team_name}, ${m.team_role}, ${team_leader_name}, ${emergency_phone},
            ${delegation_letter_url || null}, ${payment_proof_url || null},
            'DRAFT', ${user.id}
          )
          RETURNING id, name, nik, participant_number, team_id, team_name, team_role, status_code, created_at;
        `;

        const newMem = rows[0];
        createdMembers.push(newMem);

        // Link category
        await db.query`
          INSERT INTO public.participant_categories (participant_id, category_id)
          VALUES (${newMem.id}, ${category_id})
          ON CONFLICT DO NOTHING;
        `;
      }

      await recordAuditLog({
        userId: user.id,
        actionCode: 'CREATE_PARTICIPANT_TEAM',
        entityType: 'participant_team',
        entityId: teamId,
        newData: { team_id: teamId, team_name, participant_number: participantNumber, member_count: members.length },
      });

      return successResponse(
        {
          id: createdMembers[0].id,
          team_id: teamId,
          team_name,
          participant_number: participantNumber,
          members: createdMembers,
        },
        undefined,
        201
      );
    }

    // -------------------------------------------------------------
    // Branch B: Individual Participant Registration
    // -------------------------------------------------------------
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
      photo_url,
      category_ids,
      team_id,
      team_name,
      team_role,
      team_leader_name,
      emergency_phone,
      delegation_letter_url,
      payment_proof_url,
    } = parsed.data;

    // Operator scope verification & auto-assignment
    let effectiveLptkId = lptk_id;
    if (user.role_code === 'OPERATOR_LPTK') {
      if (!user.lptk_id) {
        return errorResponse('FORBIDDEN', 'Akun Operator Anda belum terhubung dengan data LPTK Desa manapun.', 403);
      }
      effectiveLptkId = user.lptk_id;
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

    // Generate sequential participant number (e.g. TLW-01, TRT-01, H1J-01)
    const participantNumber = await generateParticipantNumber(competition_id, category_ids[0], false);

    // Insert participant
    const rows = await db.query`
      INSERT INTO public.participants (
        competition_id, lptk_id, name, nik, gender_code, birth_place, birth_date,
        address, phone, school_or_institution, father_name, mother_name, photo_url,
        participant_number, team_id, team_name, team_role, team_leader_name, emergency_phone,
        delegation_letter_url, payment_proof_url,
        status_code, created_by
      ) VALUES (
        ${competition_id}, ${effectiveLptkId}, ${name}, ${nik}, ${gender_code}, ${birth_place}, ${birth_date},
        ${address}, ${phone}, ${school_or_institution || null}, ${father_name || null}, ${mother_name || null}, ${photo_url || null},
        ${participantNumber}, ${team_id || null}, ${team_name || null}, ${team_role || null}, ${team_leader_name || null}, ${emergency_phone || null},
        ${delegation_letter_url || null}, ${payment_proof_url || null},
        'DRAFT', ${user.id}
      )
      RETURNING id, name, nik, participant_number, status_code, created_at;
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
      newData: { id: newParticipant.id, name, nik, participant_number: participantNumber, lptk_id: effectiveLptkId, competition_id },
    });

    return successResponse(newParticipant, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

