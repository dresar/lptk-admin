import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, handleServerError } from '@/server/utils/response';
import { DEFAULT_HERO_SLIDES, HeroSlide } from '@/types/website';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const [partStats, villageStats, catStats, webSettingsRows] = await Promise.all([
      db.query`
        SELECT 
          COUNT(*)::int AS total_participants,
          COUNT(CASE WHEN status_code = 'VERIFIED' THEN 1 END)::int AS verified_participants,
          COUNT(CASE WHEN status_code IN ('SUBMITTED', 'IN_REVIEW') THEN 1 END)::int AS in_review_participants
        FROM public.participants
        WHERE deleted_at IS NULL
      `,
      db.query`
        SELECT COUNT(*)::int AS total_villages FROM public.villages WHERE deleted_at IS NULL
      `,
      db.query`
        SELECT COUNT(*)::int AS total_categories FROM public.categories WHERE deleted_at IS NULL
      `,
      db.query`
        SELECT key, value FROM public.system_settings WHERE key LIKE 'website_%'
      `,
    ]);

    const webConfig: Record<string, any> = {};
    let customSlides: HeroSlide[] = [];

    if (webSettingsRows && Array.isArray(webSettingsRows)) {
      for (const row of webSettingsRows) {
        if (row.key && row.value !== undefined) {
          if (row.key === 'website_hero_slides') {
            try {
              let parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
              if (Array.isArray(parsed) && parsed.length > 0) {
                customSlides = parsed.slice(0, 5).map((s: any, idx: number) => ({
                  id: s.id || `slide-${idx + 1}`,
                  image_url: String(s.image_url || '').replace('/api/cdn/cdn/', '/api/cdn/'),
                  title: String(s.title || ''),
                  subtitle: String(s.subtitle || ''),
                  info: String(s.info || ''),
                }));
              }
            } catch {}
          } else {
            let val = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : String(row.value);
            if (val.includes('/api/cdn/cdn/')) {
              val = val.replace('/api/cdn/cdn/', '/api/cdn/');
            }
            webConfig[row.key] = val;
          }
        }
      }
    }

    const slides = customSlides.length > 0 ? customSlides : DEFAULT_HERO_SLIDES;

    const stats = {
      total_participants: partStats[0]?.total_participants || 0,
      verified_participants: partStats[0]?.verified_participants || 0,
      in_review_participants: partStats[0]?.in_review_participants || 0,
      total_villages: villageStats[0]?.total_villages || 11,
      total_branches: 6,
      total_categories: catStats[0]?.total_categories || 25,
      event_name: webConfig.website_hero_title || 'MTQ XIX Tingkat Kecamatan Tambusai Utara Tahun 2026',
      hero_title: webConfig.website_hero_title || "Musabaqah Tilawatil Qur'an XIX Tingkat Kecamatan Tambusai Utara",
      hero_subtitle: webConfig.website_hero_subtitle || "Pusat informasi resmi dan portal verifikasi data peserta MTQ XIX Tahun 2026. Diikuti oleh 11 kafilah desa se-Kecamatan Tambusai Utara.",
      hero_image_url: webConfig.website_hero_image_url || '/api/cdn/hero/mtq-hero-mahato.jpg',
      hero_image_caption: webConfig.website_hero_image_caption || 'Mimbar Utama Musabaqah - Desa Mahato 2026',
      countdown_target: webConfig.website_countdown_target || '2026-11-09T08:00:00+07:00',
      announcement: webConfig.website_announcement || 'Pemberkasan fisik Map Biru diserahkan di Kantor KUA Rantau Kasai.',
      host_village: webConfig.website_host_village || 'Desa Mahato',
      contact_phone: webConfig.website_contact_phone || '0812-6845-1120 / 0813-7123-9988',
      secretariat_address: webConfig.website_contact_address || 'Kantor KUA - Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara',
      hero_slides: slides,
    };

    return successResponse(stats);
  } catch (err) {
    return handleServerError(err);
  }
}
