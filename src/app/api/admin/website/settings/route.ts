import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export const dynamic = 'force-dynamic';

const DEFAULT_WEBSITE_SETTINGS: Record<string, string> = {
  website_hero_title: "Musabaqah Tilawatil Qur'an XIX Tingkat Kecamatan Tambusai Utara",
  website_hero_subtitle: "Pusat informasi resmi dan portal verifikasi data peserta MTQ XIX Tahun 2026. Diikuti oleh 11 kafilah desa se-Kecamatan Tambusai Utara.",
  website_hero_image_url: "/api/cdn/hero/mtq-hero-mahato.jpg",
  website_hero_image_caption: "Mimbar Utama Musabaqah - Desa Mahato 2026",
  website_countdown_target: "2026-11-09T08:00:00+07:00",
  website_announcement: "Pendaftaran dan perbaikan berkas fisik Map Biru dibuka di Sekretariat KUA Rantau Kasai.",
  website_host_village: "Desa Mahato",
  website_contact_phone: "0812-6845-1120 / 0813-7123-9988",
  website_contact_address: "Kantor KUA, Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara",
};

export async function GET(req: NextRequest) {
  try {
    await requirePermission('setting.read');

    const rows = await db.query`
      SELECT key, value
      FROM public.system_settings
      WHERE key LIKE 'website_%'
    `;

    const settings: Record<string, string> = { ...DEFAULT_WEBSITE_SETTINGS };

    if (rows && Array.isArray(rows)) {
      for (const row of rows) {
        if (row.key && row.value !== undefined && row.value !== null) {
          let val = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : String(row.value);
          if (val.includes('/api/cdn/cdn/')) {
            val = val.replace('/api/cdn/cdn/', '/api/cdn/');
          }
          settings[row.key] = val;
        }
      }
    }

    return successResponse(settings);
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

    const allowedKeys = Object.keys(DEFAULT_WEBSITE_SETTINGS);
    const updatedKeys: string[] = [];

    for (const [key, rawValue] of Object.entries(body)) {
      if (!allowedKeys.includes(key)) continue;

      let value = String(rawValue || '').trim();
      // Clean any accidental double cdn prefix
      if (value.includes('/api/cdn/cdn/')) {
        value = value.replace('/api/cdn/cdn/', '/api/cdn/');
      }

      await db.query`
        INSERT INTO public.system_settings (key, value, updated_by, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, ${user.id}, NOW())
        ON CONFLICT (key) DO UPDATE 
        SET value = ${JSON.stringify(value)}, updated_by = ${user.id}, updated_at = NOW();
      `;
      updatedKeys.push(key);
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_WEBSITE_SETTINGS',
      entityType: 'website_settings',
      newData: { updated_keys: updatedKeys },
    });

    return successResponse({
      message: 'Pengaturan website berhasil disimpan.',
      updated_keys: updatedKeys,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
