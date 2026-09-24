import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';

export const dynamic = 'force-dynamic';

function maskNik(nik: string): string {
  if (!nik || nik.length < 8) return '****';
  return nik.slice(0, 6) + '******' + nik.slice(-4);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 3) {
      return errorResponse('VALIDATION_ERROR', 'Masukkan minimal 3 karakter NIK atau nama peserta', 400);
    }

    const searchPattern = `%${q}%`;

    const sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.nik,
        p.gender_code,
        p.status_code,
        p.rejection_note,
        p.submitted_at,
        p.created_at,
        l.name AS lptk_name,
        v.name AS village_name,
        c.name AS competition_name,
        ARRAY_AGG(DISTINCT cat.name) FILTER (WHERE cat.name IS NOT NULL) AS category_names
      FROM public.participants p
      JOIN public.lptks l ON p.lptk_id = l.id
      JOIN public.villages v ON l.village_id = v.id
      JOIN public.competitions c ON p.competition_id = c.id
      LEFT JOIN public.participant_categories pc ON p.id = pc.participant_id
      LEFT JOIN public.categories cat ON pc.category_id = cat.id AND cat.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
        AND (
          p.nik ILIKE $1 
          OR p.name ILIKE $1 
          OR p.id::text ILIKE $1
        )
      GROUP BY p.id, l.name, v.name, c.name
      ORDER BY p.name ASC
      LIMIT 15;
    `;

    const rawRows = await db.raw(sqlQuery, [searchPattern]);

    const results = rawRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      masked_nik: maskNik(r.nik),
      gender_code: r.gender_code,
      status_code: r.status_code,
      rejection_note: r.status_code === 'REVISION_REQUIRED' ? r.rejection_note : null,
      lptk_name: r.lptk_name,
      village_name: r.village_name,
      competition_name: r.competition_name,
      categories: r.category_names || [],
      submitted_at: r.submitted_at,
    }));

    return successResponse(results);
  } catch (err) {
    return handleServerError(err);
  }
}
