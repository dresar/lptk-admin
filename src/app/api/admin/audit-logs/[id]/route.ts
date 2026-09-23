import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('audit.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        a.id, a.user_id, u.full_name AS user_name, u.email AS user_email,
        a.action_code, a.entity_type, a.entity_id, a.ip_address, a.user_agent,
        a.old_data, a.new_data, a.created_at
      FROM public.audit_logs a
      LEFT JOIN auth.users u ON a.user_id = u.id
      WHERE a.id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Catatan audit tidak ditemukan.', 404);
    }

    return successResponse(rows[0]);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
