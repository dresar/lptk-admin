import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { verificationDecisionSchema } from '@/server/validators/verification';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('verification.decide');
    const { id } = params;
    const body = await req.json();
    const parsed = verificationDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { decision, note } = parsed.data;

    const partRows = await db.query`
      SELECT id, name, status_code FROM public.participants WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!partRows || partRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peserta tidak ditemukan.', 404);
    }
    const participant = partRows[0];

    // Record verification history
    const verifRows = await db.query`
      INSERT INTO public.verifications (participant_id, verifier_id, decision, note)
      VALUES (${id}, ${user.id}, ${decision}, ${note || null})
      RETURNING id, decision, note, created_at;
    `;

    // Update participant status
    const updatedPart = await db.query`
      UPDATE public.participants
      SET 
        status_code = ${decision},
        rejection_note = ${note || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, status_code, rejection_note, updated_at;
    `;

    // Audit log
    await recordAuditLog({
      userId: user.id,
      actionCode: `VERIFY_${decision}`,
      entityType: 'participant',
      entityId: id,
      oldData: { status_code: participant.status_code },
      newData: { status_code: decision, note },
    });

    return successResponse({
      message: `Status peserta berhasil diperbarui menjadi [${decision}].`,
      verification: verifRows[0],
      participant: updatedPart[0],
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
