import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, handleServerError } from '@/server/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rawSql = `
      SELECT 
        l.id,
        l.code,
        l.name,
        l.leader_name,
        l.phone,
        l.address,
        v.name AS village_name,
        COUNT(p.id)::int AS participants_count,
        COUNT(CASE WHEN p.status_code = 'VERIFIED' THEN 1 END)::int AS verified_count
      FROM public.lptks l
      JOIN public.villages v ON l.village_id = v.id
      LEFT JOIN public.participants p ON l.id = p.lptk_id AND p.deleted_at IS NULL
      WHERE l.deleted_at IS NULL AND v.deleted_at IS NULL
      GROUP BY l.id, l.code, l.name, l.leader_name, l.phone, l.address, v.name
      ORDER BY v.name ASC;
    `;

    const items = await db.raw(rawSql);
    return successResponse(items);
  } catch (err) {
    return handleServerError(err);
  }
}
