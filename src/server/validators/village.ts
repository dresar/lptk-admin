import { z } from 'zod';

export const createVillageSchema = z.object({
  code: z.string().min(2, 'Kode desa minimal 2 karakter').max(50),
  name: z.string().min(2, 'Nama desa minimal 2 karakter').max(150),
});

export const updateVillageSchema = createVillageSchema.partial();
