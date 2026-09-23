import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { bulkDeleteSchema } from '@/server/validators/auth';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission('competition.write');
    const body = await req.json();
    const parsed = bulkDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { ids } = parsed.data;
    let deletedCount = 0;
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      const partRef = await db.query`
        SELECT id FROM public.participants WHERE competition_id = ${id} AND deleted_at IS NULL LIMIT 1;
      `;
      if (partRef.length > 0) {
        failed.push({ id, reason: 'DATA_REFERENCED' });
        continue;
      }

      const res = await db.query`
        UPDATE public.competitions SET deleted_at = NOW() WHERE id = ${id} AND deleted_at IS NULL RETURNING id;
      `;

      if (res && res.length > 0) {
        deletedCount++;
      } else {
        failed.push({ id, reason: 'NOT_FOUND' });
      }
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'BULK_DELETE_COMPETITIONS',
      entityType: 'competition',
      newData: { requested: ids.length, deleted: deletedCount, failed },
    });

    return successResponse({ deleted: deletedCount, failed });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
