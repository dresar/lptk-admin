import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updateDocumentTypeSchema } from '@/server/validators/document-type';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('document_type.read');
    const { id } = params;

    const rows = await db.query`
      SELECT id, code, name, is_required, active, created_at, updated_at
      FROM public.document_types
      WHERE id = ${id} AND deleted_at IS NULL
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Jenis dokumen tidak ditemukan.', 404);
    }

    return successResponse(rows[0]);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('document_type.write');
    const { id } = params;
    const body = await req.json();
    const parsed = updateDocumentTypeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const existingRows = await db.query`
      SELECT * FROM public.document_types WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Jenis dokumen tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const { code, name, is_required, active } = parsed.data;

    const updatedRows = await db.query`
      UPDATE public.document_types
      SET
        code = COALESCE(${code || null}, code),
        name = COALESCE(${name || null}, name),
        is_required = COALESCE(${is_required ?? null}, is_required),
        active = COALESCE(${active ?? null}, active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, code, name, is_required, active, created_at, updated_at;
    `;

    const newData = updatedRows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_DOCUMENT_TYPE',
      entityType: 'document_type',
      entityId: id,
      oldData,
      newData,
    });

    return successResponse(newData);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('document_type.write');
    const { id } = params;

    // Check if participant documents reference this document type
    const docRef = await db.query`
      SELECT id FROM public.participant_documents WHERE document_type_id = ${id} LIMIT 1;
    `;
    if (docRef.length > 0) {
      return errorResponse(
        'DATA_REFERENCED',
        'Jenis dokumen tidak dapat dihapus karena sudah memiliki berkas terunggah oleh peserta.',
        400
      );
    }

    const deleted = await db.query`
      UPDATE public.document_types SET deleted_at = NOW() WHERE id = ${id} AND deleted_at IS NULL RETURNING id, name;
    `;

    if (!deleted || deleted.length === 0) {
      return errorResponse('NOT_FOUND', 'Jenis dokumen tidak ditemukan atau sudah dihapus.', 404);
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_DOCUMENT_TYPE',
      entityType: 'document_type',
      entityId: id,
      oldData: deleted[0],
    });

    return successResponse({ message: 'Jenis dokumen berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
