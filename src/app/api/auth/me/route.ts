import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requireAuth, AuthError, SESSION_COOKIE_NAME } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    return successResponse({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      const res = errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
      if (err.code === 'UNAUTHORIZED') {
        res.cookies.set(SESSION_COOKIE_NAME, '', {
          path: '/',
          expires: new Date(0),
          httpOnly: true,
          sameSite: 'lax',
        });
      }
      return res;
    }
    return handleServerError(err);
  }
}
