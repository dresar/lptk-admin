import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requireAuth, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Query full user detail with role and LPTK info
    const rows = await db.query`
      SELECT 
        u.id, u.email, u.full_name, u.avatar_url, u.active, u.created_at, u.last_login_at,
        r.code AS role_code, r.name AS role_name,
        l.id AS lptk_id, l.name AS lptk_name, l.code AS lptk_code,
        v.name AS village_name
      FROM auth.users u
      JOIN auth.roles r ON u.role_id = r.id
      LEFT JOIN public.lptks l ON u.lptk_id = l.id
      LEFT JOIN public.villages v ON l.village_id = v.id
      WHERE u.id = ${user.id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('USER_NOT_FOUND', 'Pengguna tidak ditemukan.', 404);
    }

    return successResponse(rows[0]);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body = await req.json();

    // STRICT RULE: Email cannot be changed!
    if (body.email && body.email !== authUser.email) {
      return errorResponse('EMAIL_CHANGE_FORBIDDEN', 'Alamat email akun tidak dapat diubah.', 400);
    }

    const { full_name, avatar_url, current_password, new_password } = body;

    // Get current user password_hash
    const [userRow] = await db.query`
      SELECT id, email, password_hash, full_name, avatar_url FROM auth.users WHERE id = ${authUser.id} LIMIT 1;
    `;

    if (!userRow) {
      return errorResponse('USER_NOT_FOUND', 'Pengguna tidak ditemukan.', 404);
    }

    let newPasswordHash = userRow.password_hash;
    let passwordChanged = false;

    // Password change logic
    if (new_password) {
      if (!current_password) {
        return errorResponse('VALIDATION_ERROR', 'Sandi saat ini wajib diisi untuk mengubah kata sandi.', 400);
      }

      if (new_password.length < 6) {
        return errorResponse('VALIDATION_ERROR', 'Kata sandi baru minimal 6 karakter.', 400);
      }

      const isMatch = await bcrypt.compare(current_password, userRow.password_hash);
      if (!isMatch) {
        return errorResponse('INVALID_PASSWORD', 'Kata sandi saat ini tidak cocok.', 400);
      }

      newPasswordHash = await bcrypt.hash(new_password, 10);
      passwordChanged = true;
    }

    const updatedName = full_name?.trim() ? full_name.trim() : userRow.full_name;
    const updatedAvatar = avatar_url !== undefined ? avatar_url : userRow.avatar_url;

    const [updatedUser] = await db.query`
      UPDATE auth.users
      SET
        full_name = ${updatedName},
        avatar_url = ${updatedAvatar},
        password_hash = ${newPasswordHash},
        updated_at = NOW()
      WHERE id = ${authUser.id}
      RETURNING id, email, full_name, avatar_url, updated_at;
    `;

    await recordAuditLog({
      userId: authUser.id,
      actionCode: passwordChanged ? 'UPDATE_PROFILE_AND_PASSWORD' : 'UPDATE_PROFILE',
      entityType: 'user',
      entityId: authUser.id,
      newData: { full_name: updatedName, password_changed: passwordChanged },
    });

    return successResponse({
      user: updatedUser,
      message: 'Profil berhasil diperbarui.',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
