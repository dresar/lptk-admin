import { z } from 'zod';

export const createCompetitionSchema = z.object({
  name: z.string().min(3, 'Nama lomba minimal 3 karakter').max(150),
  description: z.string().optional(),
  period_year: z.number().int().min(2000).max(2100),
  status_code: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'COMPLETED']).default('DRAFT'),
  registration_open_at: z.string().datetime(),
  registration_close_at: z.string().datetime(),
});

export const updateCompetitionSchema = createCompetitionSchema.partial();
