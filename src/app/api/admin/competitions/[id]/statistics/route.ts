import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('competition.read');
    const { id } = params;

    const [compCheck, stats, lptkStats] = await Promise.all([
      db.query`SELECT id, name FROM public.competitions WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;`,
      db.query`
        SELECT 
          COUNT(*)::int AS total_participants,
          COUNT(*) FILTER (WHERE status_code = 'SUBMITTED')::int AS submitted,
          COUNT(*) FILTER (WHERE status_code = 'IN_REVIEW')::int AS in_review,
          COUNT(*) FILTER (WHERE status_code = 'VERIFIED')::int AS verified,
          COUNT(*) FILTER (WHERE status_code = 'REVISION_REQUIRED')::int AS revision_required,
          COUNT(*) FILTER (WHERE status_code = 'REJECTED')::int AS rejected,
          COUNT(*) FILTER (WHERE gender_code = 'MALE')::int AS male_count,
          COUNT(*) FILTER (WHERE gender_code = 'FEMALE')::int AS female_count
        FROM public.participants
        WHERE competition_id = ${id} AND deleted_at IS NULL;
      `,
      db.query`
        SELECT 
          l.id AS lptk_id, l.name AS lptk_name,
          COUNT(p.id)::int AS participants_count
        FROM public.lptks l
        JOIN public.participants p ON l.id = p.lptk_id AND p.competition_id = ${id} AND p.deleted_at IS NULL
        WHERE l.deleted_at IS NULL
        GROUP BY l.id, l.name
        ORDER BY participants_count DESC;
      `,
    ]);

    if (!compCheck || compCheck.length === 0) {
      return errorResponse('NOT_FOUND', 'Lomba tidak ditemukan.', 404);
    }

    return successResponse({
      competition: compCheck[0],
      summary: stats[0] || {},
      by_lptk: lptkStats,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
