export type RoleCode = 'SUPER_ADMIN' | 'ADMIN_KECAMATAN' | 'OPERATOR_LPTK';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role_code: RoleCode;
  role_name?: string;
  lptk_id: string | null;
  permissions: string[];
}

export interface AuthSession {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  last_active_at: Date;
}
