import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updateCategorySchema } from '@/server/validators/category';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('category.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        c.id, c.competition_id, comp.name AS competition_name,
        c.name, c.gender_code, c.age_min, c.age_max, 
        c.requirements, c.active, c.created_at, c.updated_at
      FROM public.categories c
      JOIN public.competitions comp ON c.competition_id = comp.id
      WHERE c.id = ${id} AND c.deleted_at IS NULL
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Kategori tidak ditemukan.', 404);
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
    const user = await requirePermission('category.write');
    const { id } = params;
    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const existingRows = await db.query`
      SELECT * FROM public.categories WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Kategori tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const { name, gender_code, age_min, age_max, requirements, active } = parsed.data;

    const updatedRows = await db.query`
      UPDATE public.categories
      SET
        name = COALESCE(${name || null}, name),
        gender_code = COALESCE(${gender_code || null}, gender_code),
        age_min = COALESCE(${age_min ?? null}, age_min),
        age_max = COALESCE(${age_max ?? null}, age_max),
        requirements = COALESCE(${requirements !== undefined ? requirements : null}, requirements),
        active = COALESCE(${active ?? null}, active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, competition_id, name, gender_code, age_min, age_max, requirements, active, created_at, updated_at;
    `;

    const newData = updatedRows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_CATEGORY',
      entityType: 'category',
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
    const user = await requirePermission('category.write');
    const { id } = params;

    // Check participants
    const partRef = await db.query`
      SELECT participant_id FROM public.participant_categories WHERE category_id = ${id} LIMIT 1;
    `;
    if (partRef.length > 0) {
      return errorResponse(
        'DATA_REFERENCED',
        'Kategori tidak dapat dihapus karena sudah memiliki peserta terdaftar.',
        400
      );
    }

    const deleted = await db.query`
      UPDATE public.categories SET deleted_at = NOW() WHERE id = ${id} AND deleted_at IS NULL RETURNING id, name;
    `;

    if (!deleted || deleted.length === 0) {
      return errorResponse('NOT_FOUND', 'Kategori tidak ditemukan atau sudah dihapus.', 404);
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_CATEGORY',
      entityType: 'category',
      entityId: id,
      oldData: deleted[0],
    });

    return successResponse({ message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
