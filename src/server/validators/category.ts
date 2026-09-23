import { z } from 'zod';

export const createCategorySchema = z.object({
  competition_id: z.string().uuid('ID Lomba tidak valid'),
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(150),
  gender_code: z.enum(['MALE', 'FEMALE', 'ANY']).default('ANY'),
  age_min: z.number().int().min(0).default(0),
  age_max: z.number().int().min(0).default(100),
  requirements: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ competition_id: true });

export const updateCategoryRequirementsSchema = z.object({
  document_type_ids: z.array(z.string().uuid()),
});
