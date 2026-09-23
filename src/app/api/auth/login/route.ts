import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db/client';
import { loginSchema } from '@/server/validators/auth';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import {
  generateSessionToken,
  hashToken,
  SESSION_COOKIE_NAME,
  ABSOLUTE_TIMEOUT_MS,
} from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        parsed.error.errors[0]?.message || 'Input data tidak valid',
        400
      );
    }

    const { email, password } = parsed.data;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 1. Check user by email
    const users = await db.query`
      SELECT 
        u.id, 
        u.email, 
        u.password_hash, 
        u.full_name, 
        u.active, 
        u.must_change_password, 
        u.lptk_id,
        r.code AS role_code,
        r.name AS role_name
      FROM auth.users u
      JOIN auth.roles r ON u.role_id = r.id
      WHERE u.email = ${email}
      LIMIT 1;
    `;

    if (!users || users.length === 0) {
      // Record failed attempt
      await db.query`
        INSERT INTO auth.login_attempts (email, ip_address, user_agent, success)
        VALUES (${email}, ${ipAddress}, ${userAgent}, false);
      `;
      return errorResponse('INVALID_CREDENTIALS', 'Email atau kata sandi tidak cocok.', 401);
    }

    const user = users[0];

    // Check if account is active
    if (!user.active) {
      return errorResponse('ACCOUNT_DISABLED', 'Akun Anda dinonaktifkan. Hubungi administrator.', 403);
    }

    // 2. Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      await db.query`
        INSERT INTO auth.login_attempts (email, ip_address, user_agent, success)
        VALUES (${email}, ${ipAddress}, ${userAgent}, false);
      `;
      return errorResponse('INVALID_CREDENTIALS', 'Email atau kata sandi tidak cocok.', 401);
    }

    // 3. Generate session
    const rawToken = generateSessionToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ABSOLUTE_TIMEOUT_MS);

    await db.query`
      INSERT INTO auth.sessions (user_id, token_hash, user_agent, ip_address, expires_at, last_active_at)
      VALUES (${user.id}, ${tokenHash}, ${userAgent}, ${ipAddress}, ${expiresAt}, NOW());
    `;

    // Record successful attempt & update user last_login_at
    await db.query`
      INSERT INTO auth.login_attempts (email, ip_address, user_agent, success)
      VALUES (${email}, ${ipAddress}, ${userAgent}, true);
    `;

    await db.query`
      UPDATE auth.users SET last_login_at = NOW() WHERE id = ${user.id};
    `;

    // Audit log
    await recordAuditLog({
      userId: user.id,
      actionCode: 'LOGIN',
      entityType: 'auth',
      entityId: user.id,
      ipAddress,
      userAgent,
      newData: { email: user.email, role: user.role_code },
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieHeader = `${SESSION_COOKIE_NAME}=${rawToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ABSOLUTE_TIMEOUT_MS / 1000}${
      isProduction ? '; Secure' : ''
    }`;

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role_code: user.role_code,
          role_name: user.role_name,
          lptk_id: user.lptk_id,
          must_change_password: user.must_change_password,
        },
      },
      undefined,
      200,
      { 'Set-Cookie': cookieHeader }
    );
  } catch (err) {
    return handleServerError(err);
  }
}
