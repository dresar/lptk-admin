import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('category.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        c.id, c.competition_id, c.name, c.gender_code, c.age_min, c.age_max, 
        c.requirements, c.active, c.created_at, c.updated_at,
        COUNT(pc.participant_id)::int AS participants_count
      FROM public.categories c
      LEFT JOIN public.participant_categories pc ON c.id = pc.category_id
      WHERE c.competition_id = ${id} AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC;
    `;

    return successResponse(rows);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
