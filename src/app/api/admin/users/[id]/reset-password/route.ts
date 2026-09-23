import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db/client';
import { resetPasswordSchema } from '@/server/validators/user';
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
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { new_password } = parsed.data;
    const passwordHash = await bcrypt.hash(new_password, 10);

    const rows = await db.query`
      UPDATE auth.users
      SET password_hash = ${passwordHash}, must_change_password = true, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Pengguna tidak ditemukan.', 404);
    }

    // Invalidate user active sessions
    await db.query`DELETE FROM auth.sessions WHERE user_id = ${id};`;

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'RESET_PASSWORD',
      entityType: 'user',
      entityId: id,
      newData: { reset_by: admin.email },
    });

    return successResponse({ message: 'Kata sandi berhasil disetel ulang.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
