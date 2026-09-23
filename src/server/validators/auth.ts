import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Password lama wajib diisi'),
  new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid('ID harus berupa UUID yang valid')).min(1, 'Minimal satu ID wajib disertakan'),
});
