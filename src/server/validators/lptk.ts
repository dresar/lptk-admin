import { z } from 'zod';

export const createLptkSchema = z.object({
  village_id: z.string().uuid('ID Desa tidak valid'),
  code: z.string().min(2, 'Kode LPTK minimal 2 karakter').max(50),
  name: z.string().min(2, 'Nama LPTK minimal 2 karakter').max(150),
  leader_name: z.string().min(2, 'Nama pimpinan minimal 2 karakter').max(150),
  phone: z.string().min(8, 'Nomor telepon minimal 8 digit').max(30),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  active: z.boolean().default(true),
});

export const updateLptkSchema = createLptkSchema.partial();
