import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, handleServerError } from '@/server/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const [partStats, villageStats, catStats] = await Promise.all([
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
    ]);

    const stats = {
      total_participants: partStats[0]?.total_participants || 0,
      verified_participants: partStats[0]?.verified_participants || 0,
      in_review_participants: partStats[0]?.in_review_participants || 0,
      total_villages: villageStats[0]?.total_villages || 11,
      total_branches: 6,
      total_categories: catStats[0]?.total_categories || 25,
      event_name: 'MTQ XIX Tingkat Kecamatan Tambusai Utara Tahun 2026',
      host_village: 'Desa Mahato',
      event_date_start: '2026-11-09T08:00:00Z',
      event_date_end: '2026-11-13T22:00:00Z',
      secretariat_address: 'Kantor KUA - Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara',
    };

    return successResponse(stats);
  } catch (err) {
    return handleServerError(err);
  }
}
