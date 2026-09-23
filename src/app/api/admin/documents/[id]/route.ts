import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('document.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        pd.id, pd.participant_id, pd.document_type_id,
        pd.file_name, pd.mime_type, pd.file_size_bytes, pd.sha256_hash, pd.status_code, pd.created_at,
        p.name AS participant_name, p.lptk_id,
        dt.code AS document_type_code, dt.name AS document_type_name
      FROM public.participant_documents pd
      JOIN public.participants p ON pd.participant_id = p.id
      JOIN public.document_types dt ON pd.document_type_id = dt.id
      WHERE pd.id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Dokumen tidak ditemukan.', 404);
    }

    const doc = rows[0];
    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== doc.lptk_id) {
      return errorResponse('FORBIDDEN', 'Anda tidak berhak melihat dokumen peserta ini.', 403);
    }

    return successResponse(doc);
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
    const user = await requirePermission('document.delete');
    const { id } = params;

    const rows = await db.query`
      SELECT pd.id, pd.file_name, p.lptk_id, p.status_code
      FROM public.participant_documents pd
      JOIN public.participants p ON pd.participant_id = p.id
      WHERE pd.id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Dokumen tidak ditemukan.', 404);
    }

    const doc = rows[0];
    if (user.role_code === 'OPERATOR_LPTK') {
      if (user.lptk_id !== doc.lptk_id) {
        return errorResponse('FORBIDDEN', 'Anda hanya dapat menghapus dokumen peserta milik LPTK Anda.', 403);
      }
      if (doc.status_code !== 'DRAFT' && doc.status_code !== 'REVISION_REQUIRED') {
        return errorResponse('STATUS_LOCKED', `Dokumen tidak dapat dihapus pada status [${doc.status_code}].`, 400);
      }
    }

    await db.query`DELETE FROM public.participant_documents WHERE id = ${id};`;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_DOCUMENT',
      entityType: 'document',
      entityId: id,
      oldData: doc,
    });

    return successResponse({ message: 'Dokumen berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
