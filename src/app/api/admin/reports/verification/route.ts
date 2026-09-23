import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('report.read');

    const sql = `
      SELECT 
        u.id AS verifier_id, u.full_name AS verifier_name,
        COUNT(v.id)::int AS total_decisions,
        COUNT(v.id) FILTER (WHERE v.decision = 'VERIFIED')::int AS verified_count,
        COUNT(v.id) FILTER (WHERE v.decision = 'REVISION_REQUIRED')::int AS revision_count,
        COUNT(v.id) FILTER (WHERE v.decision = 'REJECTED')::int AS rejected_count
      FROM auth.users u
      JOIN public.verifications v ON u.id = v.verifier_id
      GROUP BY u.id
      ORDER BY total_decisions DESC;
    `;

    const rows = await db.raw(sql);
    return successResponse(rows);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
