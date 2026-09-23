import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('participant.read');
    const { id } = params;
    const { page, pageSize, offset } = parseListParams(req.url);

    const [countRes, items] = await Promise.all([
      db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.participants 
        WHERE lptk_id = ${id} AND deleted_at IS NULL
      `,
      db.query`
        SELECT 
          p.id, p.name, p.nik, p.gender_code, p.status_code, p.created_at,
          c.name AS competition_name
        FROM public.participants p
        JOIN public.competitions c ON p.competition_id = c.id
        WHERE p.lptk_id = ${id} AND p.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
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
