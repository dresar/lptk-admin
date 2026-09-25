export interface Village {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Lptk {
  id: string;
  village_id: string;
  village_name?: string;
  code: string;
  name: string;
  leader_name: string;
  phone: string;
  address: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface UserAccount {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  role_code?: string;
  role_name?: string;
  lptk_id?: string | null;
  lptk_name?: string | null;
  active: boolean;
  must_change_password: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  group_name: string;
  name: string;
  description?: string | null;
}

export interface Competition {
  id: string;
  name: string;
  description?: string | null;
  period_year: number;
  status_code: 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED';
  registration_open_at: string;
  registration_close_at: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  competition_id: string;
  competition_name?: string;
  name: string;
  gender_code: 'MALE' | 'FEMALE' | 'ANY';
  age_min: number;
  age_max: number;
  requirements?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  is_required: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type ParticipantStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'VERIFIED'
  | 'REVISION_REQUIRED'
  | 'REJECTED';

export interface Participant {
  id: string;
  competition_id: string;
  competition_name?: string;
  lptk_id: string;
  lptk_name?: string;
  village_id?: string;
  village_name?: string;
  name: string;
  nik: string;
  gender_code: 'MALE' | 'FEMALE';
  birth_place: string;
  birth_date: string;
  address: string;
  phone: string;
  school_or_institution?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  status_code: ParticipantStatus;
  rejection_note?: string | null;
  categories?: Category[];
  participant_number?: string | null;
  team_id?: string | null;
  team_name?: string | null;
  team_role?: string | null;
  team_leader_name?: string | null;
  emergency_phone?: string | null;
  delegation_letter_url?: string | null;
  payment_proof_url?: string | null;
  photo_url?: string | null;
  teammates?: any[];
  created_by?: string;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParticipantDocument {
  id: string;
  participant_id: string;
  document_type_id: string;
  document_type_code?: string;
  document_type_name?: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  status_code: 'VALID' | 'REJECTED';
  created_at: string;
}

export interface Verification {
  id: string;
  participant_id: string;
  verifier_id: string;
  verifier_name?: string;
  decision: 'VERIFIED' | 'REVISION_REQUIRED' | 'REJECTED' | 'IN_REVIEW';
  note?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_name?: string | null;
  action_code: string;
  entity_type: string;
  entity_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  old_data?: any;
  new_data?: any;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image_url?: string | null;
  gallery_images?: string[];
  video_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  content_format?: 'markdown' | 'html';
  author_name: string;
  is_published: boolean;
  published_at: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

