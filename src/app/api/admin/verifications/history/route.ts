import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('verification.read');
    const { page, pageSize, offset } = parseListParams(req.url);

    const [countRes, items] = await Promise.all([
      db.query`SELECT COUNT(*)::int AS count FROM public.verifications`,
      db.query`
        SELECT 
          v.id, v.participant_id, v.decision, v.note, v.created_at,
          p.name AS participant_name, p.nik AS participant_nik,
          u.full_name AS verifier_name
        FROM public.verifications v
        JOIN public.participants p ON v.participant_id = p.id
        JOIN auth.users u ON v.verifier_id = u.id
        ORDER BY v.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset};
      `,
    ]);

    const totalItems = countRes[0]?.count || 0;
    return successResponse(items, createPaginationMeta(totalItems, page, pageSize));
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
