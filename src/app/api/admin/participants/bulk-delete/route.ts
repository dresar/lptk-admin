import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { bulkDeleteSchema } from '@/server/validators/auth';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission('participant.write');
    const body = await req.json();
    const parsed = bulkDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { ids } = parsed.data;
    let deletedCount = 0;
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      const partRows = await db.query`
        SELECT id, lptk_id, status_code FROM public.participants WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
      `;

      if (!partRows || partRows.length === 0) {
        failed.push({ id, reason: 'NOT_FOUND' });
        continue;
      }

      const part = partRows[0];

      // Scoping
      if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== part.lptk_id) {
        failed.push({ id, reason: 'UNAUTHORIZED_LPTK' });
        continue;
      }

      // Verified protection
      if (part.status_code === 'VERIFIED') {
        failed.push({ id, reason: 'CANNOT_DELETE_VERIFIED' });
        continue;
      }

      await db.query`UPDATE public.participants SET deleted_at = NOW() WHERE id = ${id};`;
      deletedCount++;
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'BULK_DELETE_PARTICIPANTS',
      entityType: 'participant',
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
