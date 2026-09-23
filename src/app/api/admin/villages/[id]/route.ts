import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updateVillageSchema } from '@/server/validators/village';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('village.read');
    const { id } = params;

    const rows = await db.query`
      SELECT id, code, name, created_at, updated_at
      FROM public.villages
      WHERE id = ${id} AND deleted_at IS NULL
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Desa tidak ditemukan.', 404);
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
    const user = await requirePermission('village.write');
    const { id } = params;
    const body = await req.json();
    const parsed = updateVillageSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const existingRows = await db.query`
      SELECT id, code, name FROM public.villages WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Desa tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const { code, name } = parsed.data;

    // Check code duplication if updated
    if (code && code !== oldData.code) {
      const dup = await db.query`
        SELECT id FROM public.villages WHERE code = ${code} AND id != ${id} AND deleted_at IS NULL LIMIT 1;
      `;
      if (dup.length > 0) {
        return errorResponse('DUPLICATE_CODE', 'Kode desa sudah digunakan.', 400);
      }
    }

    const updatedRows = await db.query`
      UPDATE public.villages
      SET 
        code = COALESCE(${code || null}, code),
        name = COALESCE(${name || null}, name),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, code, name, created_at, updated_at;
    `;

    const newData = updatedRows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_VILLAGE',
      entityType: 'village',
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
    const user = await requirePermission('village.write');
    const { id } = params;

    // Check if referenced by any LPTK
    const lptkRef = await db.query`
      SELECT id FROM public.lptks WHERE village_id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (lptkRef.length > 0) {
      return errorResponse(
        'DATA_REFERENCED',
        'Desa tidak dapat dihapus karena masih memiliki data LPTK terkait.',
        400
      );
    }

    const deletedRows = await db.query`
      UPDATE public.villages
      SET deleted_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id, code, name;
    `;

    if (!deletedRows || deletedRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Desa tidak ditemukan atau sudah dihapus.', 404);
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_VILLAGE',
      entityType: 'village',
      entityId: id,
      oldData: deletedRows[0],
    });

    return successResponse({ message: 'Desa berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
