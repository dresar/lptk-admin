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
      SELECT p.id, p.code, p.group_name, p.name, p.description
      FROM auth.permissions p
      JOIN auth.role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${id}
      ORDER BY p.group_name ASC, p.code ASC;
    `;

    return successResponse(rows);
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

    const { permission_ids } = body;
    if (!Array.isArray(permission_ids)) {
      return errorResponse('VALIDATION_ERROR', 'permission_ids harus berupa array ID.', 400);
    }

    // Role check
    const roleRows = await db.query`SELECT id, code, is_system FROM auth.roles WHERE id = ${id} LIMIT 1;`;
    if (!roleRows || roleRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peran tidak ditemukan.', 404);
    }

    // Replace permissions
    await db.query`DELETE FROM auth.role_permissions WHERE role_id = ${id};`;

    for (const pid of permission_ids) {
      await db.query`
        INSERT INTO auth.role_permissions (role_id, permission_id)
        VALUES (${id}, ${pid})
        ON CONFLICT DO NOTHING;
      `;
    }

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'UPDATE_ROLE_PERMISSIONS',
      entityType: 'role',
      entityId: id,
      newData: { role_code: roleRows[0].code, permissions_count: permission_ids.length },
    });

    return successResponse({ message: 'Hak akses peran berhasil diperbarui.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
