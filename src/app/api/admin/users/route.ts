import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db/client';
import { createUserSchema } from '@/server/validators/user';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('user.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);

    let countQuery;
    let listQuery;

    if (q) {
      const searchPattern = `%${q}%`;
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM auth.users u
        LEFT JOIN public.lptks l ON u.lptk_id = l.id
        WHERE u.full_name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern} OR l.name ILIKE ${searchPattern}
      `;
      const rawSql = `
        SELECT 
          u.id, u.email, u.full_name, u.role_id, u.lptk_id, u.active, 
          u.must_change_password, u.last_login_at, u.created_at, u.updated_at,
          r.code AS role_code, r.name AS role_name,
          l.name AS lptk_name
        FROM auth.users u
        JOIN auth.roles r ON u.role_id = r.id
        LEFT JOIN public.lptks l ON u.lptk_id = l.id
        WHERE u.full_name ILIKE $1 OR u.email ILIKE $1 OR l.name ILIKE $1
        ORDER BY u.${sort} ${order.toUpperCase()}
        LIMIT $2 OFFSET $3;
      `;
      listQuery = db.raw(rawSql, [searchPattern, pageSize, offset]);
    } else {
      countQuery = db.query`SELECT COUNT(*)::int AS count FROM auth.users`;
      const rawSql = `
        SELECT 
          u.id, u.email, u.full_name, u.role_id, u.lptk_id, u.active, 
          u.must_change_password, u.last_login_at, u.created_at, u.updated_at,
          r.code AS role_code, r.name AS role_name,
          l.name AS lptk_name
        FROM auth.users u
        JOIN auth.roles r ON u.role_id = r.id
        LEFT JOIN public.lptks l ON u.lptk_id = l.id
        ORDER BY u.${sort} ${order.toUpperCase()}
        LIMIT $1 OFFSET $2;
      `;
      listQuery = db.raw(rawSql, [pageSize, offset]);
    }

    const [totalRes, items] = await Promise.all([countQuery, listQuery]);
    const totalItems = totalRes[0]?.count || 0;

    return successResponse(items, createPaginationMeta(totalItems, page, pageSize));
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requirePermission('user.write');
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { full_name, email, password, role_id, lptk_id, active, must_change_password } = parsed.data;

    // Check duplicate email
    const existing = await db.query`
      SELECT id FROM auth.users WHERE email = ${email} LIMIT 1;
    `;
    if (existing.length > 0) {
      return errorResponse('DUPLICATE_EMAIL', 'Email sudah terdaftar.', 400);
    }

    // Default password to 'password123' if not provided
    const rawPass = password || 'password123';
    const passwordHash = await bcrypt.hash(rawPass, 10);

    const rows = await db.query`
      INSERT INTO auth.users (
        full_name, email, password_hash, role_id, lptk_id, active, must_change_password
      ) VALUES (
        ${full_name}, ${email}, ${passwordHash}, ${role_id}, ${lptk_id || null}, ${active}, ${must_change_password}
      )
      RETURNING id, full_name, email, role_id, lptk_id, active, must_change_password, created_at, updated_at;
    `;

    const newUser = rows[0];

    await recordAuditLog({
      userId: admin.id,
      actionCode: 'CREATE_USER',
      entityType: 'user',
      entityId: newUser.id,
      newData: { id: newUser.id, email: newUser.email, role_id: newUser.role_id },
    });

    return successResponse(newUser, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
