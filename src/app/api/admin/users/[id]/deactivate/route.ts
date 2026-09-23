import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requirePermission('user.write');
    const { id } = params;

    if (admin.id === id) {
      return errorResponse('CANNOT_DEACTIVATE_SELF', 'Anda tidak dapat menonaktifkan akun sendiri.', 400);
    }

    const rows = await db.query`
      UPDATE auth.users SET active = false, updated_at = NOW() WHERE id = ${id} RETURNING id, email, active;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Pengguna tidak ditemukan.', 404);
    }

    // Immediately kill their active sessions
    await db.query`DELETE FROM auth.sessions WHERE user_id = ${id};`;

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'DEACTIVATE_USER',
      entityType: 'user',
      entityId: id,
    });

    return successResponse({ message: 'Pengguna berhasil dinonaktifkan.', user: rows[0] });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
