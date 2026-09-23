import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('lptk.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        u.id, u.email, u.full_name, u.active, u.last_login_at, u.created_at,
        r.code AS role_code, r.name AS role_name
      FROM auth.users u
      JOIN auth.roles r ON u.role_id = r.id
      WHERE u.lptk_id = ${id}
      ORDER BY u.full_name ASC;
    `;

    return successResponse(rows);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
