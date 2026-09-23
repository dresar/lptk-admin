import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('verification.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);
    const searchParams = req.nextUrl.searchParams;

    const competitionId = searchParams.get('competition_id');
    const lptkId = searchParams.get('lptk_id');

    const whereConditions: string[] = [
      'p.deleted_at IS NULL',
      "p.status_code IN ('SUBMITTED', 'IN_REVIEW', 'REVISION_REQUIRED')",
    ];
    const queryParams: any[] = [];
    let pIndex = 1;

    if (q) {
      whereConditions.push(`(p.name ILIKE $${pIndex} OR p.nik ILIKE $${pIndex})`);
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

    const whereClause = whereConditions.join(' AND ');

    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.participants p
      WHERE ${whereClause};
    `;
    const countRes = await db.raw(countSql, queryParams);
    const totalItems = countRes[0]?.count || 0;

    const listSql = `
      SELECT 
        p.id, p.competition_id, comp.name AS competition_name,
        p.lptk_id, l.name AS lptk_name,
        p.name, p.nik, p.gender_code, p.status_code, p.submitted_at, p.created_at,
        COUNT(DISTINCT pd.id)::int AS documents_count,
        COALESCE(
          json_agg(json_build_object('id', cat.id, 'name', cat.name)) FILTER (WHERE cat.id IS NOT NULL),
          '[]'
        ) AS categories
      FROM public.participants p
      JOIN public.competitions comp ON p.competition_id = comp.id
      JOIN public.lptks l ON p.lptk_id = l.id
      LEFT JOIN public.participant_categories pc ON p.id = pc.participant_id
      LEFT JOIN public.categories cat ON pc.category_id = cat.id
      LEFT JOIN public.participant_documents pd ON p.id = pd.participant_id
      WHERE ${whereClause}
      GROUP BY p.id, comp.name, l.name
      ORDER BY p.submitted_at ASC NULLS LAST, p.created_at ASC
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
