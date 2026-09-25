import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const rows = await db.query`
      SELECT key, value
      FROM public.system_settings
      WHERE key IN (
        'app_name',
        'app_logo_url',
        'app_stamp_url',
        'event_official_name',
        'event_dates',
        'event_location',
        'juknis_letter_no',
        'juknis_letter_date',
        'lptq_chairman',
        'lptq_secretariat',
        'submission_envelope'
      );
    `;

    const branding: Record<string, string> = {
      app_name: 'LPTK Tambusai Utara - Mahato 2026',
      app_logo_url: '/api/cdn/logos/lptq-logo.png',
      app_stamp_url: '/api/cdn/logos/lptq-stempel.png',
      event_official_name: 'Musabaqah Tilawatil Qur’an (MTQ) ke-XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato',
      event_dates: '09 – 13 November 2026',
      event_location: 'Desa Mahato, Kecamatan Tambusai Utara, Kabupaten Rokan Hulu',
      juknis_letter_no: '09/LPTQ-T.U/MTQ/IX/2026',
      juknis_letter_date: '10 September 2026',
      lptq_chairman: 'Rahmat Saputra',
      lptq_secretariat: 'Kantor KUA - Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara, Kab. Rokan Hulu - Riau',
      submission_envelope: 'Map Warna Biru disampaikan di Sekretariat LPTQ Kecamatan / Bagian Administrasi MTQ Desa Mahato',
    };

    if (rows && Array.isArray(rows)) {
      for (const row of rows) {
        if (row.key && row.value !== undefined && row.value !== null) {
          let raw = '';
          if (typeof row.value === 'string') {
            raw = row.value.trim().replace(/^"|"$/g, '');
          } else if (typeof row.value === 'object' && row.value !== null) {
            raw = JSON.stringify(row.value).replace(/^"|"$/g, '');
          } else {
            raw = String(row.value || '');
          }

          // Auto-clean any redundant /api/cdn/cdn/ to /api/cdn/
          if (raw.includes('/api/cdn/cdn/')) {
            raw = raw.replace(/\/api\/cdn\/cdn\//g, '/api/cdn/');
          }
          branding[row.key] = raw;
        }
      }
    }

    return NextResponse.json(
      { success: true, data: branding },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Failed to load branding metadata:', err);
    return NextResponse.json(
      {
        success: true,
        data: {
          app_name: 'LPTK Tambusai Utara - Mahato 2026',
          app_logo_url: '/api/cdn/logos/lptq-logo.png',
          app_stamp_url: '/api/cdn/logos/lptq-stempel.png',
        },
      },
      { status: 200 }
    );
  }
}
