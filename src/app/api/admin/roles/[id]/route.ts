import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('role.read');
    const { id } = params;

    const rows = await db.query`
      SELECT id, code, name, description, is_system, created_at, updated_at
      FROM auth.roles
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peran tidak ditemukan.', 404);
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
    const admin = await requirePermission('role.write');
    const { id } = params;
    const body = await req.json();

    const existingRows = await db.query`
      SELECT id, code, name, description, is_system FROM auth.roles WHERE id = ${id} LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peran tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const { name, description } = body;

    const updated = await db.query`
      UPDATE auth.roles
      SET 
        name = COALESCE(${name || null}, name),
        description = COALESCE(${description !== undefined ? description : null}, description),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, code, name, description, is_system, updated_at;
    `;

    const newData = updated[0];

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'UPDATE_ROLE',
      entityType: 'role',
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
    const admin = await requirePermission('role.write');
    const { id } = params;

    const existingRows = await db.query`
      SELECT id, code, is_system FROM auth.roles WHERE id = ${id} LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peran tidak ditemukan.', 404);
    }

    if (existingRows[0].is_system) {
      return errorResponse('SYSTEM_ROLE_PROTECTED', 'Peran bawaan sistem tidak boleh dihapus.', 400);
    }

    // Check users
    const userRef = await db.query`SELECT id FROM auth.users WHERE role_id = ${id} LIMIT 1;`;
    if (userRef.length > 0) {
      return errorResponse('DATA_REFERENCED', 'Peran masih digunakan oleh akun pengguna.', 400);
    }

    await db.query`DELETE FROM auth.roles WHERE id = ${id};`;

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'DELETE_ROLE',
      entityType: 'role',
      entityId: id,
      oldData: existingRows[0],
    });

    return successResponse({ message: 'Peran berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
