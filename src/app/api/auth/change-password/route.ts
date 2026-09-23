import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db/client';
import { changePasswordSchema } from '@/server/validators/auth';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requireAuth, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        parsed.error.errors[0]?.message || 'Input data tidak valid',
        400
      );
    }

    const { current_password, new_password } = parsed.data;

    const rows = await db.query`
      SELECT password_hash FROM auth.users WHERE id = ${user.id} LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Pengguna tidak ditemukan.', 404);
    }

    const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!isMatch) {
      return errorResponse('INVALID_PASSWORD', 'Kata sandi saat ini tidak cocok.', 400);
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await db.query`
      UPDATE auth.users 
      SET password_hash = ${newHash}, must_change_password = false, updated_at = NOW() 
      WHERE id = ${user.id};
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'CHANGE_PASSWORD',
      entityType: 'auth',
      entityId: user.id,
    });

    return successResponse({ message: 'Kata sandi berhasil diperbarui.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
