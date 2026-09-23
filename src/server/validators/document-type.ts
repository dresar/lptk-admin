import { z } from 'zod';

export const createDocumentTypeSchema = z.object({
  code: z.string().min(2, 'Kode jenis dokumen minimal 2 karakter').max(50),
  name: z.string().min(2, 'Nama jenis dokumen minimal 2 karakter').max(150),
  is_required: z.boolean().default(true),
  active: z.boolean().default(true),
});

export const updateDocumentTypeSchema = createDocumentTypeSchema.partial();
