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
        registration_open_at, registration_close_at, created_at, updated_at
      FROM public.competitions
      WHERE id = ${id} AND deleted_at IS NULL
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Lomba tidak ditemukan.', 404);
    }

    return successResponse(rows[0]);
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
        name = COALESCE(${name || null}, name),
        description = COALESCE(${description !== undefined ? description : null}, description),
        period_year = COALESCE(${period_year || null}, period_year),
        status_code = COALESCE(${status_code || null}, status_code),
        registration_open_at = COALESCE(${registration_open_at ? new Date(registration_open_at) : null}, registration_open_at),
        registration_close_at = COALESCE(${registration_close_at ? new Date(registration_close_at) : null}, registration_close_at),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, description, period_year, status_code, registration_open_at, registration_close_at, created_at, updated_at;
    `;

    const newData = updatedRows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_COMPETITION',
      entityType: 'competition',
      entityId: id,
      oldData,
      newData,
    });

    return successResponse(newData);
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
    const user = await requirePermission('competition.write');
    const { id } = params;

    // Check participants
    const partRef = await db.query`
      SELECT id FROM public.participants WHERE competition_id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (partRef.length > 0) {
      return errorResponse(
        'DATA_REFERENCED',
        'Lomba tidak dapat dihapus karena telah memiliki pendaftaran peserta.',
        400
      );
    }

    const deleted = await db.query`
      UPDATE public.competitions SET deleted_at = NOW() WHERE id = ${id} AND deleted_at IS NULL RETURNING id, name;
    `;

    if (!deleted || deleted.length === 0) {
      return errorResponse('NOT_FOUND', 'Lomba tidak ditemukan atau sudah dihapus.', 404);
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_COMPETITION',
      entityType: 'competition',
      entityId: id,
      oldData: deleted[0],
    });

    return successResponse({ message: 'Lomba berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
