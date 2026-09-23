import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { validateMagicBytes, computeSha256 } from '@/server/utils/magic-bytes';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('document.read');
    const { id } = params;

    const partRows = await db.query`
      SELECT id, lptk_id FROM public.participants WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!partRows || partRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peserta tidak ditemukan.', 404);
    }

    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== partRows[0].lptk_id) {
      return errorResponse('FORBIDDEN', 'Anda tidak berhak melihat dokumen peserta LPTK lain.', 403);
    }

    const docs = await db.query`
      SELECT 
        pd.id, pd.document_type_id, dt.code AS document_type_code, dt.name AS document_type_name,
        pd.file_name, pd.mime_type, pd.file_size_bytes, pd.sha256_hash, pd.status_code, pd.created_at
      FROM public.participant_documents pd
      JOIN public.document_types dt ON pd.document_type_id = dt.id
      WHERE pd.participant_id = ${id}
      ORDER BY pd.created_at ASC;
    `;

    return successResponse(docs);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('document.write');
    const { id } = params;

    const partRows = await db.query`
      SELECT id, name, lptk_id, status_code FROM public.participants WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!partRows || partRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peserta tidak ditemukan.', 404);
    }
    const participant = partRows[0];

    // Operator Scoping
    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== participant.lptk_id) {
      return errorResponse('FORBIDDEN', 'Anda hanya dapat mengunggah dokumen peserta milik LPTK Anda.', 403);
    }

    // Status check
    if (user.role_code === 'OPERATOR_LPTK') {
      if (participant.status_code !== 'DRAFT' && participant.status_code !== 'REVISION_REQUIRED') {
        return errorResponse(
          'STATUS_LOCKED',
          `Tidak dapat mengunggah dokumen pada status [${participant.status_code}].`,
          400
        );
      }
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentTypeId = formData.get('document_type_id') as string | null;

    if (!file || !documentTypeId) {
      return errorResponse('VALIDATION_ERROR', 'Berkas (file) dan ID jenis dokumen (document_type_id) wajib disertakan.', 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse('FILE_TOO_LARGE', 'Ukuran berkas melebihi batas maksimum 5 MB.', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic bytes
    const signatureCheck = validateMagicBytes(buffer);
    if (!signatureCheck.valid) {
      return errorResponse('INVALID_FILE_TYPE', signatureCheck.error || 'Format berkas tidak sah.', 400);
    }

    const sha256 = computeSha256(buffer);
    const mimeType = signatureCheck.detectedMime || file.type;

    // Check if document of this type already exists for participant -> replace or insert
    const existingDoc = await db.query`
      SELECT id, file_name FROM public.participant_documents 
      WHERE participant_id = ${id} AND document_type_id = ${documentTypeId}
      LIMIT 1;
    `;

    let docResult;
    if (existingDoc && existingDoc.length > 0) {
      const updated = await db.query`
        UPDATE public.participant_documents
        SET
          file_name = ${file.name},
          mime_type = ${mimeType},
          file_size_bytes = ${file.size},
          sha256_hash = ${sha256},
          file_data = ${buffer},
          status_code = 'VALID',
          updated_at = NOW()
        WHERE id = ${existingDoc[0].id}
        RETURNING id, participant_id, document_type_id, file_name, mime_type, file_size_bytes, sha256_hash, status_code, created_at;
      `;
      docResult = updated[0];

      await recordAuditLog({
        userId: user.id,
        actionCode: 'REPLACE_DOCUMENT',
        entityType: 'document',
        entityId: docResult.id,
        newData: { file_name: file.name, size: file.size, sha256 },
      });
    } else {
      const inserted = await db.query`
        INSERT INTO public.participant_documents (
          participant_id, document_type_id, file_name, mime_type, file_size_bytes, sha256_hash, file_data, status_code
        ) VALUES (
          ${id}, ${documentTypeId}, ${file.name}, ${mimeType}, ${file.size}, ${sha256}, ${buffer}, 'VALID'
        )
        RETURNING id, participant_id, document_type_id, file_name, mime_type, file_size_bytes, sha256_hash, status_code, created_at;
      `;
      docResult = inserted[0];

      await recordAuditLog({
        userId: user.id,
        actionCode: 'UPLOAD_DOCUMENT',
        entityType: 'document',
        entityId: docResult.id,
        newData: { file_name: file.name, size: file.size, sha256 },
      });
    }

    return successResponse(docResult, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
