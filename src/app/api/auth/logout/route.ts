import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, handleServerError } from '@/server/utils/response';
import {
  hashToken,
  SESSION_COOKIE_NAME,
  getSessionUser,
} from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const tokenHash = hashToken(token);
      await db.query`DELETE FROM auth.sessions WHERE token_hash = ${tokenHash}`;
    }

    if (user) {
      await recordAuditLog({
        userId: user.id,
        actionCode: 'LOGOUT',
        entityType: 'auth',
        entityId: user.id,
      });
    }

    // Clear cookie header
    const clearCookieHeader = `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    return successResponse(
      { message: 'Berhasil keluar dari sistem.' },
      undefined,
      200,
      { 'Set-Cookie': clearCookieHeader }
    );
  } catch (err) {
    return handleServerError(err);
  }
}
