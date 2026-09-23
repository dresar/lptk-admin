import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requireAuth, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    return successResponse({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
