import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updateCompetitionSchema } from '@/server/validators/competition';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('competition.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        id, name, description, period_year, status_code, 
        registration_open_at, registration_close_at, banner_url, created_at, updated_at
      FROM public.competitions
      WHERE id = ${id} AND deleted_at IS NULL
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Lomba tidak ditemukan.', 404);
    }

    const comp = rows[0];

    // Fetch categories in this competition with participant counts
    const categories = await db.query`
      SELECT 
        c.id, c.name, c.gender_code, c.age_min, c.age_max, c.requirements, c.active,
        count(pc.participant_id)::int as participant_count
      FROM public.categories c
      LEFT JOIN public.participant_categories pc ON c.id = pc.category_id
      LEFT JOIN public.participants p ON pc.participant_id = p.id AND p.deleted_at IS NULL
      WHERE c.competition_id = ${id} AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC;
    `;

    // Fetch stats for this competition
    const statsRows = await db.query`
      SELECT 
        count(p.id)::int as total_participants,
        count(p.id) FILTER (WHERE p.gender_code = 'MALE')::int as male_participants,
        count(p.id) FILTER (WHERE p.gender_code = 'FEMALE')::int as female_participants,
        count(p.id) FILTER (WHERE p.status_code = 'VERIFIED')::int as verified_participants,
        count(p.id) FILTER (WHERE p.status_code IN ('SUBMITTED', 'IN_REVIEW', 'DRAFT'))::int as pending_participants,
        count(p.id) FILTER (WHERE p.status_code IN ('REVISION_REQUIRED', 'REJECTED'))::int as revision_participants
      FROM public.participants p
      WHERE p.competition_id = ${id} AND p.deleted_at IS NULL;
    `;

    // Fetch recent participants
    const participants = await db.query`
      SELECT 
        p.id, p.name, p.nik, p.gender_code, p.status_code, p.phone, p.photo_url,
        l.name as lptk_name,
        c.name as category_name
      FROM public.participants p
      LEFT JOIN public.lptks l ON p.lptk_id = l.id
      LEFT JOIN public.participant_categories pc ON p.id = pc.participant_id
      LEFT JOIN public.categories c ON pc.category_id = c.id
      WHERE p.competition_id = ${id} AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT 100;
    `;

    return successResponse({
      ...comp,
      categories: categories || [],
      stats: statsRows[0] || {
        total_participants: 0,
        male_participants: 0,
        female_participants: 0,
        verified_participants: 0,
        pending_participants: 0,
        revision_participants: 0,
      },
      participants: participants || [],
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('competition.write');
    const { id } = params;
    const body = await req.json();
    const parsed = updateCompetitionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const existingRows = await db.query`
      SELECT * FROM public.competitions WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Lomba tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const { name, description, period_year, status_code, registration_open_at, registration_close_at } = parsed.data;

    const updatedRows = await db.query`
      UPDATE public.competitions
      SET
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        period_year = COALESCE(${period_year}, period_year),
        status_code = COALESCE(${status_code}, status_code),
        registration_open_at = COALESCE(${registration_open_at ? new Date(registration_open_at) : null}, registration_open_at),
        registration_close_at = COALESCE(${registration_close_at ? new Date(registration_close_at) : null}, registration_close_at),
        updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *;
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_COMPETITION',
      entityType: 'competition',
      entityId: id,
      oldData: oldData,
      newData: updatedRows[0],
      
    });

    return successResponse(updatedRows[0]);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('competition.delete');
    const { id } = params;

    const existingRows = await db.query`
      SELECT * FROM public.competitions WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Lomba tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    await db.query`
      UPDATE public.competitions
      SET deleted_at = NOW()
      WHERE id = ${id};
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_COMPETITION',
      entityType: 'competition',
      entityId: id,
      oldData: oldData,
      newData: null,
      
    });

    return successResponse({ message: 'Lomba berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
