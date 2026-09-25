import { z } from 'zod';

export const teamMemberSchema = z.object({
  name: z.string().min(2, 'Nama anggota minimal 2 karakter').max(150),
  nik: z
    .string()
    .length(16, 'NIK wajib 16 digit angka')
    .regex(/^\d+$/, 'NIK hanya boleh berisi angka'),
  gender_code: z.enum(['MALE', 'FEMALE']),
  team_role: z.string().min(2, 'Peran anggota regu wajib diisi').max(100),
  birth_place: z.string().min(2, 'Tempat lahir minimal 2 karakter').max(100),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir YYYY-MM-DD'),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  school_or_institution: z.string().max(150).optional().nullable(),
  photo_url: z.string().max(500).optional().nullable(),
  father_name: z.string().max(150).optional().nullable(),
  mother_name: z.string().max(150).optional().nullable(),
});

export const createCollectiveParticipantSchema = z.object({
  competition_id: z.string().uuid('ID Lomba tidak valid'),
  lptk_id: z.string().uuid('ID LPTK tidak valid'),
  category_id: z.string().uuid('ID Cabang Kategori tidak valid'),
  team_name: z.string().min(2, 'Nama regu minimal 2 karakter').max(255),
  team_leader_name: z.string().min(2, 'Nama ketua regu minimal 2 karakter').max(150),
  emergency_phone: z.string().min(8, 'Nomor darurat/WhatsApp minimal 8 digit').max(30),
  school_or_institution: z.string().max(150).optional().nullable(),
  delegation_letter_url: z.string().max(500).optional().nullable(),
  payment_proof_url: z.string().max(500).optional().nullable(),
  members: z.array(teamMemberSchema).min(2, 'Minimal 2 anggota').max(11, 'Maksimal 11 anggota'),
});

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
  photo_url: z.string().max(500).optional().nullable(),
  category_ids: z.array(z.string().uuid()).min(1, 'Peserta wajib memilih minimal satu cabang kategori'),
  team_id: z.string().uuid().optional().nullable(),
  team_name: z.string().max(255).optional().nullable(),
  team_role: z.string().max(100).optional().nullable(),
  team_leader_name: z.string().max(150).optional().nullable(),
  emergency_phone: z.string().max(30).optional().nullable(),
  delegation_letter_url: z.string().max(500).optional().nullable(),
  payment_proof_url: z.string().max(500).optional().nullable(),
});

export const updateParticipantSchema = createParticipantSchema.partial().omit({ competition_id: true });

