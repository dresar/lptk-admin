import { z } from 'zod';

export const createUserSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(150),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role_id: z.string().uuid('ID Peran tidak valid'),
  lptk_id: z.string().uuid('ID LPTK tidak valid').nullable().optional(),
  active: z.boolean().default(true),
  must_change_password: z.boolean().default(false),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const resetPasswordSchema = z.object({
  new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
});
