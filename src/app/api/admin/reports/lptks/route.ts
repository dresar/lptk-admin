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
      compFilter = 'AND p.competition_id = $1';
      params.push(competitionId);
    }

    const sql = `
      SELECT 
        l.id AS lptk_id, l.code AS lptk_code, l.name AS lptk_name,
        v.name AS village_name,
        COUNT(p.id)::int AS total_participants,
        COUNT(p.id) FILTER (WHERE p.status_code = 'VERIFIED')::int AS verified_count,
        COUNT(p.id) FILTER (WHERE p.status_code = 'SUBMITTED')::int AS submitted_count,
        COUNT(p.id) FILTER (WHERE p.status_code = 'REVISION_REQUIRED')::int AS revision_count
      FROM public.lptks l
      JOIN public.villages v ON l.village_id = v.id
      LEFT JOIN public.participants p ON l.id = p.lptk_id AND p.deleted_at IS NULL ${compFilter}
      WHERE l.deleted_at IS NULL
      GROUP BY l.id, v.name
      ORDER BY total_participants DESC, l.name ASC;
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
