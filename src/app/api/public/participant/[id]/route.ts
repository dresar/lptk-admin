import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';

export const dynamic = 'force-dynamic';

function maskNik(nik: string): string {
  if (!nik || nik.length < 8) return '****';
  return nik.slice(0, 6) + '******' + nik.slice(-4);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const rows = await db.query`
      SELECT 
        p.id,
        p.name,
        p.nik,
        p.gender_code,
        p.birth_place,
        p.birth_date,
        p.status_code,
        p.participant_number,
        p.team_id,
        p.team_name,
        p.team_role,
        p.photo_url AS direct_photo_url,
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
      WHERE p.id = ${id} AND p.deleted_at IS NULL
      GROUP BY p.id, l.name, v.name, c.name
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Data peserta tidak ditemukan.', 404);
    }

    const p = rows[0];

    // Check for photo document if no direct photo_url
    let photoUrl = p.direct_photo_url || null;
    if (!photoUrl) {
      const photoRows = await db.query`
        SELECT pd.id
        FROM public.participant_documents pd
        JOIN public.document_types dt ON pd.document_type_id = dt.id
        WHERE pd.participant_id = ${id}
          AND (dt.code = 'PAS_FOTO' OR dt.code = 'FOTO')
        LIMIT 1;
      `;
      if (photoRows.length > 0) {
        photoUrl = `/api/admin/documents/${photoRows[0].id}/download`;
      }
    }

    return successResponse({
      id: p.id,
      name: p.name,
      masked_nik: maskNik(p.nik),
      gender_code: p.gender_code,
      birth_place: p.birth_place,
      birth_date: p.birth_date,
      status_code: p.status_code,
      participant_number: p.participant_number,
      team_id: p.team_id,
      team_name: p.team_name,
      team_role: p.team_role,
      lptk_name: p.lptk_name,
      village_name: p.village_name,
      competition_name: p.competition_name,
      categories: p.category_names || [],
      photo_url: photoUrl,
      submitted_at: p.submitted_at,
    });
  } catch (err) {
    return handleServerError(err);
  }
}
