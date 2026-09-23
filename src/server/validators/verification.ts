import { z } from 'zod';

export const verificationDecisionSchema = z
  .object({
    decision: z.enum(['VERIFIED', 'REVISION_REQUIRED', 'REJECTED', 'IN_REVIEW']),
    note: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if ((data.decision === 'REVISION_REQUIRED' || data.decision === 'REJECTED') && (!data.note || data.note.trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Catatan alasan (note) wajib diisi untuk keputusan Revisi atau Ditolak.',
      path: ['note'],
    }
  );
