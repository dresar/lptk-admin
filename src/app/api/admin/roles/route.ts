import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('role.read');

    const roles = await db.query`
      SELECT 
        r.id, r.code, r.name, r.description, r.is_system, r.created_at, r.updated_at,
        COUNT(rp.permission_id)::int AS permissions_count,
        COUNT(u.id)::int AS users_count
      FROM auth.roles r
      LEFT JOIN auth.role_permissions rp ON r.id = rp.role_id
      LEFT JOIN auth.users u ON r.id = u.role_id
      GROUP BY r.id
      ORDER BY r.name ASC;
    `;

    return successResponse(roles);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requirePermission('role.write');
    const body = await req.json();

    const { code, name, description } = body;
    if (!code || !name) {
      return errorResponse('VALIDATION_ERROR', 'Kode dan nama peran wajib diisi.', 400);
    }

    const cleanCode = String(code).toUpperCase().trim().replace(/\s+/g, '_');

    const dup = await db.query`SELECT id FROM auth.roles WHERE code = ${cleanCode} LIMIT 1;`;
    if (dup.length > 0) {
      return errorResponse('DUPLICATE_CODE', 'Kode peran sudah terdaftar.', 400);
    }

    const rows = await db.query`
      INSERT INTO auth.roles (code, name, description, is_system)
      VALUES (${cleanCode}, ${name}, ${description || null}, false)
      RETURNING id, code, name, description, is_system, created_at, updated_at;
    `;

    const newRole = rows[0];

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'CREATE_ROLE',
      entityType: 'role',
      entityId: newRole.id,
      newData: newRole,
    });

    return successResponse(newRole, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
