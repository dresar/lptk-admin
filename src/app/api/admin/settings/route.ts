import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('setting.read');

    const rows = await db.query`
      SELECT s.key, s.value, s.description, s.updated_at, u.full_name AS updated_by_name
      FROM public.system_settings s
      LEFT JOIN auth.users u ON s.updated_by = u.id
      ORDER BY s.key ASC;
    `;

    return successResponse(rows);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requirePermission('setting.write');
    const body = await req.json();

    const { settings } = body; // Array of { key, value }
    if (!Array.isArray(settings)) {
      return errorResponse('VALIDATION_ERROR', 'Field settings harus berupa array objek { key, value }.', 400);
    }

    for (const item of settings) {
      if (!item.key) continue;
      await db.query`
        INSERT INTO public.system_settings (key, value, updated_by, updated_at)
        VALUES (${item.key}, ${JSON.stringify(item.value)}, ${user.id}, NOW())
        ON CONFLICT (key) DO UPDATE 
        SET value = ${JSON.stringify(item.value)}, updated_by = ${user.id}, updated_at = NOW();
      `;
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_SETTINGS',
      entityType: 'settings',
      newData: { updated_keys: settings.map((s) => s.key) },
    });

    return successResponse({ message: 'Pengaturan sistem berhasil diperbarui.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
