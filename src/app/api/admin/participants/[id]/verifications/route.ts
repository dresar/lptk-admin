import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('verification.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        v.id, v.participant_id, v.verifier_id, v.decision, v.note, v.created_at,
        u.full_name AS verifier_name
      FROM public.verifications v
      JOIN auth.users u ON v.verifier_id = u.id
      WHERE v.participant_id = ${id}
      ORDER BY v.created_at DESC;
    `;

    return successResponse(rows);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
