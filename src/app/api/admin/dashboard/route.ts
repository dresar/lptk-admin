import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission('dashboard.read');

    const isOperator = user.role_code === 'OPERATOR_LPTK' && user.lptk_id;

    // Run statistical queries
    const [villagesRes, lptksRes, usersRes, storageRes] = await Promise.all([
      db.query`SELECT COUNT(*)::int AS count FROM public.villages WHERE deleted_at IS NULL`,
      db.query`SELECT COUNT(*)::int AS count FROM public.lptks WHERE deleted_at IS NULL`,
      db.query`SELECT COUNT(*)::int AS count FROM auth.users WHERE active = true`,
      db.query`SELECT COALESCE(SUM(file_size_bytes), 0)::bigint AS bytes FROM public.participant_documents`,
    ]);

    // Participant statistics with operator scoping
    let participantsStats;
    if (isOperator) {
      participantsStats = await db.query`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status_code = 'SUBMITTED')::int AS submitted,
          COUNT(*) FILTER (WHERE status_code = 'IN_REVIEW')::int AS in_review,
          COUNT(*) FILTER (WHERE status_code = 'VERIFIED')::int AS verified,
          COUNT(*) FILTER (WHERE status_code = 'REVISION_REQUIRED')::int AS revision_required,
          COUNT(*) FILTER (WHERE status_code = 'REJECTED')::int AS rejected
        FROM public.participants
        WHERE deleted_at IS NULL AND lptk_id = ${user.lptk_id};
      `;
    } else {
      participantsStats = await db.query`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status_code = 'SUBMITTED')::int AS submitted,
          COUNT(*) FILTER (WHERE status_code = 'IN_REVIEW')::int AS in_review,
          COUNT(*) FILTER (WHERE status_code = 'VERIFIED')::int AS verified,
          COUNT(*) FILTER (WHERE status_code = 'REVISION_REQUIRED')::int AS revision_required,
          COUNT(*) FILTER (WHERE status_code = 'REJECTED')::int AS rejected
        FROM public.participants
        WHERE deleted_at IS NULL;
      `;
    }

    const pStat = participantsStats[0] || {};

    return successResponse({
      total_villages: villagesRes[0]?.count || 0,
      total_lptks: lptksRes[0]?.count || 0,
      total_users: usersRes[0]?.count || 0,
      total_participants: pStat.total || 0,
      total_submitted: pStat.submitted || 0,
      total_in_review: pStat.in_review || 0,
      total_verified: pStat.verified || 0,
      total_revision_required: pStat.revision_required || 0,
      total_rejected: pStat.rejected || 0,
      storage_used_bytes: Number(storageRes[0]?.bytes || 0),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
