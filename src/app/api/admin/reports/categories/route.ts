import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('report.read');
    const searchParams = req.nextUrl.searchParams;
    const competitionId = searchParams.get('competition_id');

    let compFilter = '';
    const params: any[] = [];
    if (competitionId) {
      compFilter = 'AND cat.competition_id = $1';
      params.push(competitionId);
    }

    const sql = `
      SELECT 
        cat.id AS category_id, cat.name AS category_name, cat.gender_code,
        comp.name AS competition_name,
        COUNT(pc.participant_id)::int AS total_registered,
        COUNT(p.id) FILTER (WHERE p.status_code = 'VERIFIED')::int AS verified_count
      FROM public.categories cat
      JOIN public.competitions comp ON cat.competition_id = comp.id
      LEFT JOIN public.participant_categories pc ON cat.id = pc.category_id
      LEFT JOIN public.participants p ON pc.participant_id = p.id AND p.deleted_at IS NULL
      WHERE cat.deleted_at IS NULL ${compFilter}
      GROUP BY cat.id, comp.name
      ORDER BY total_registered DESC;
    `;

    const rows = await db.raw(sql, params);
    return successResponse(rows);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
