import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '@/server/db/client';
import { AuthUser, RoleCode } from '@/types/auth';

export const SESSION_COOKIE_NAME = 'auth_session';
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  try {
    // Query active session and user
    const rows = await db.query`
      SELECT 
        s.id AS session_id,
        s.expires_at,
        s.last_active_at,
        u.id AS user_id,
        u.email,
        u.full_name,
        u.active AS user_active,
        u.lptk_id,
        r.code AS role_code,
        r.name AS role_name
      FROM auth.sessions s
      JOIN auth.users u ON s.user_id = u.id
      JOIN auth.roles r ON u.role_id = r.id
      WHERE s.token_hash = ${tokenHash}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return null;
    }

    const session = rows[0];

    // Check user active status
    if (!session.user_active) {
      // Invalidate session if user disabled
      await db.query`DELETE FROM auth.sessions WHERE token_hash = ${tokenHash}`;
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const lastActiveAt = new Date(session.last_active_at);

    // Check absolute timeout
    if (now > expiresAt) {
      await db.query`DELETE FROM auth.sessions WHERE token_hash = ${tokenHash}`;
      return null;
    }

    // Check idle timeout
    if (now.getTime() - lastActiveAt.getTime() > IDLE_TIMEOUT_MS) {
      await db.query`DELETE FROM auth.sessions WHERE token_hash = ${tokenHash}`;
      return null;
    }

    // Update last_active_at
    await db.query`
      UPDATE auth.sessions 
      SET last_active_at = NOW() 
      WHERE token_hash = ${tokenHash};
    `;

    // Fetch user permissions
    const permRows = await db.query`
      SELECT DISTINCT p.code
      FROM auth.permissions p
      JOIN auth.role_permissions rp ON p.id = rp.permission_id
      JOIN auth.roles r ON rp.role_id = r.id
      WHERE r.code = ${session.role_code};
    `;

    const permissions = permRows.map((p) => p.code);

    return {
      id: session.user_id,
      email: session.email,
      full_name: session.full_name,
      role_code: session.role_code as RoleCode,
      role_name: session.role_name,
      lptk_id: session.lptk_id || null,
      permissions,
    };
  } catch (error) {
    console.error('Session lookup error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError('UNAUTHORIZED', 'Sesi tidak valid atau telah berakhir. Silakan masuk kembali.');
  }
  return user;
}

export async function requirePermission(permissionCode: string): Promise<AuthUser> {
  const user = await requireAuth();

  // Super admin has unrestricted bypass
  if (user.role_code === 'SUPER_ADMIN') {
    return user;
  }

  if (!user.permissions.includes(permissionCode)) {
    throw new AuthError('FORBIDDEN', `Anda tidak memiliki hak akses [${permissionCode}].`);
  }

  return user;
}

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}
