import { z } from 'zod';

export const createParticipantSchema = z.object({
  competition_id: z.string().uuid('ID Lomba tidak valid'),
  lptk_id: z.string().uuid('ID LPTK tidak valid'),
  name: z.string().min(2, 'Nama peserta minimal 2 karakter').max(150),
  nik: z
    .string()
    .length(16, 'NIK wajib 16 digit angka')
    .regex(/^\d+$/, 'NIK hanya boleh berisi angka'),
  gender_code: z.enum(['MALE', 'FEMALE']),
  birth_place: z.string().min(2, 'Tempat lahir minimal 2 karakter').max(100),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir YYYY-MM-DD'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  phone: z.string().min(8, 'Nomor telepon minimal 8 digit').max(30),
  school_or_institution: z.string().max(150).optional().nullable(),
  father_name: z.string().max(150).optional().nullable(),
  mother_name: z.string().max(150).optional().nullable(),
  category_ids: z.array(z.string().uuid()).min(1, 'Peserta wajib memilih minimal satu cabang kategori'),
});

export const updateParticipantSchema = createParticipantSchema.partial().omit({ competition_id: true });
