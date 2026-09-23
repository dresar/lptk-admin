import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { bulkDeleteSchema } from '@/server/validators/auth';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission('document.delete');
    const body = await req.json();
    const parsed = bulkDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { ids } = parsed.data;
    let deletedCount = 0;
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      const docRows = await db.query`
        SELECT pd.id, p.lptk_id, p.status_code 
        FROM public.participant_documents pd
        JOIN public.participants p ON pd.participant_id = p.id
        WHERE pd.id = ${id}
        LIMIT 1;
      `;

      if (!docRows || docRows.length === 0) {
        failed.push({ id, reason: 'NOT_FOUND' });
        continue;
      }

      const doc = docRows[0];

      if (user.role_code === 'OPERATOR_LPTK') {
        if (user.lptk_id !== doc.lptk_id) {
          failed.push({ id, reason: 'UNAUTHORIZED_LPTK' });
          continue;
        }
        if (doc.status_code !== 'DRAFT' && doc.status_code !== 'REVISION_REQUIRED') {
          failed.push({ id, reason: 'STATUS_LOCKED' });
          continue;
        }
      }

      await db.query`DELETE FROM public.participant_documents WHERE id = ${id};`;
      deletedCount++;
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'BULK_DELETE_DOCUMENTS',
      entityType: 'document',
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
