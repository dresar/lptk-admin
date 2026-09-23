import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('participant.submit');
    const { id } = params;

    const partRows = await db.query`
      SELECT id, name, lptk_id, status_code FROM public.participants WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;

    if (!partRows || partRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peserta tidak ditemukan.', 404);
    }

    const participant = partRows[0];

    // Operator scoping
    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== participant.lptk_id) {
      return errorResponse('FORBIDDEN', 'Anda hanya dapat mengirim pendaftaran peserta milik LPTK Anda.', 403);
    }

    // Status check
    if (participant.status_code !== 'DRAFT' && participant.status_code !== 'REVISION_REQUIRED') {
      return errorResponse(
        'INVALID_STATUS',
        `Peserta hanya dapat dikirimkan dari status Draf atau Perlu Revisi (Status saat ini: ${participant.status_code}).`,
        400
      );
    }

    // Check mandatory documents required by participant's categories
    const requiredDocs = await db.query`
      SELECT DISTINCT dt.id, dt.code, dt.name
      FROM public.document_types dt
      JOIN public.category_document_requirements cdr ON dt.id = cdr.document_type_id
      JOIN public.participant_categories pc ON cdr.category_id = pc.category_id
      WHERE pc.participant_id = ${id} AND cdr.is_mandatory = true AND dt.deleted_at IS NULL;
    `;

    if (requiredDocs.length > 0) {
      // Check which ones are uploaded
      const uploadedDocs = await db.query`
        SELECT document_type_id FROM public.participant_documents 
        WHERE participant_id = ${id} AND status_code = 'VALID';
      `;

      const uploadedTypeIds = new Set(uploadedDocs.map((d) => d.document_type_id));
      const missingDocs = requiredDocs.filter((rd) => !uploadedTypeIds.has(rd.id));

      if (missingDocs.length > 0) {
        const missingNames = missingDocs.map((m) => m.name).join(', ');
        return errorResponse(
          'INCOMPLETE_DOCUMENTS',
          `Dokumen wajib belum lengkap: ${missingNames}. Silakan unggah semua berkas yang dipersyaratkan sebelum mengirim.`,
          400
        );
      }
    }

    // Submit participant
    const updatedRows = await db.query`
      UPDATE public.participants
      SET 
        status_code = 'SUBMITTED',
        submitted_at = NOW(),
        rejection_note = NULL,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, status_code, submitted_at;
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'SUBMIT_PARTICIPANT',
      entityType: 'participant',
      entityId: id,
      newData: updatedRows[0],
    });

    return successResponse({
      message: 'Pendaftaran peserta berhasil dikirim ke antrean verifikasi.',
      participant: updatedRows[0],
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
