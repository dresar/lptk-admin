import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updateUserSchema } from '@/server/validators/user';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('user.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        u.id, u.email, u.full_name, u.role_id, u.lptk_id, u.active, 
        u.must_change_password, u.last_login_at, u.created_at, u.updated_at,
        r.code AS role_code, r.name AS role_name,
        l.name AS lptk_name
      FROM auth.users u
      JOIN auth.roles r ON u.role_id = r.id
      LEFT JOIN public.lptks l ON u.lptk_id = l.id
      WHERE u.id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Pengguna tidak ditemukan.', 404);
    }

    return successResponse(rows[0]);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requirePermission('user.write');
    const { id } = params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const existingRows = await db.query`
      SELECT id, email, full_name, role_id, lptk_id, active, must_change_password 
      FROM auth.users WHERE id = ${id} LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Pengguna tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const { full_name, email, role_id, lptk_id, active, must_change_password } = parsed.data;

    if (email && email !== oldData.email) {
      const dup = await db.query`
        SELECT id FROM auth.users WHERE email = ${email} AND id != ${id} LIMIT 1;
      `;
      if (dup.length > 0) {
        return errorResponse('DUPLICATE_EMAIL', 'Email sudah digunakan pengguna lain.', 400);
      }
    }

    const updatedRows = await db.query`
      UPDATE auth.users
      SET
        full_name = COALESCE(${full_name || null}, full_name),
        email = COALESCE(${email || null}, email),
        role_id = COALESCE(${role_id || null}, role_id),
        lptk_id = ${lptk_id !== undefined ? lptk_id : oldData.lptk_id},
        active = COALESCE(${active ?? null}, active),
        must_change_password = COALESCE(${must_change_password ?? null}, must_change_password),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, full_name, role_id, lptk_id, active, must_change_password, updated_at;
    `;

    const newData = updatedRows[0];

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'UPDATE_USER',
      entityType: 'user',
      entityId: id,
      oldData,
      newData,
    });

    return successResponse(newData);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requirePermission('user.write');
    const { id } = params;

    // Prevent deleting own account
    if (admin.id === id) {
      return errorResponse('SELF_DELETION_FORBIDDEN', 'Anda tidak dapat menghapus akun Anda sendiri.', 400);
    }

    // Check if user has verification records
    const verifCount = await db.query`
      SELECT count(*)::int as count FROM public.verifications WHERE verifier_id = ${id};
    `;
    if (verifCount[0]?.count > 0) {
      await db.query`UPDATE auth.users SET active = false, updated_at = NOW() WHERE id = ${id}`;
      await db.query`DELETE FROM auth.sessions WHERE user_id = ${id}`;
      return successResponse({
        message: 'Pengguna memiliki riwayat verifikasi berkas. Akun dinonaktifkan demi integritas audit musabaqah.',
      });
    }

    // Detach nullable user references to prevent FK constraint errors
    await db.query`UPDATE public.participants SET created_by = NULL WHERE created_by = ${id}`;
    await db.query`UPDATE public.posts SET created_by = NULL WHERE created_by = ${id}`;
    await db.query`UPDATE public.system_settings SET updated_by = NULL WHERE updated_by = ${id}`;
    await db.query`DELETE FROM auth.sessions WHERE user_id = ${id}`;

    const deleted = await db.query`
      DELETE FROM auth.users WHERE id = ${id} RETURNING id, email;
    `;

    if (!deleted || deleted.length === 0) {
      return errorResponse('NOT_FOUND', 'Pengguna tidak ditemukan.', 404);
    }

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'DELETE_USER',
      entityType: 'user',
      entityId: id,
      oldData: deleted[0],
    });

    return successResponse({ message: 'Pengguna berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
