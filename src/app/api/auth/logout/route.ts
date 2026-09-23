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

    const response = successResponse(
      { message: 'Berhasil keluar dari sistem.' },
      undefined,
      200
    );

    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (err) {
    return handleServerError(err);
  }
}
