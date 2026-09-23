import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updateLptkSchema } from '@/server/validators/lptk';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('lptk.read');
    const { id } = params;

    // Operator scope check
    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== id) {
      return errorResponse('FORBIDDEN', 'Anda hanya dapat mengakses data LPTK Anda sendiri.', 403);
    }

    const rows = await db.query`
      SELECT 
        l.id, l.village_id, v.name AS village_name, l.code, l.name, 
        l.leader_name, l.phone, l.address, l.active, l.created_at, l.updated_at
      FROM public.lptks l
      JOIN public.villages v ON l.village_id = v.id
      WHERE l.id = ${id} AND l.deleted_at IS NULL
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'LPTK tidak ditemukan.', 404);
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
    const user = await requirePermission('lptk.write');
    const { id } = params;
    const body = await req.json();
    const parsed = updateLptkSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const existingRows = await db.query`
      SELECT * FROM public.lptks WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'LPTK tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const { village_id, code, name, leader_name, phone, address, active } = parsed.data;

    // Check code duplication
    if (code && code !== oldData.code) {
      const dup = await db.query`
        SELECT id FROM public.lptks WHERE code = ${code} AND id != ${id} AND deleted_at IS NULL LIMIT 1;
      `;
      if (dup.length > 0) {
        return errorResponse('DUPLICATE_CODE', 'Kode LPTK sudah digunakan.', 400);
      }
    }

    const updatedRows = await db.query`
      UPDATE public.lptks
      SET
        village_id = COALESCE(${village_id || null}, village_id),
        code = COALESCE(${code || null}, code),
        name = COALESCE(${name || null}, name),
        leader_name = COALESCE(${leader_name || null}, leader_name),
        phone = COALESCE(${phone || null}, phone),
        address = COALESCE(${address || null}, address),
        active = COALESCE(${active ?? null}, active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, village_id, code, name, leader_name, phone, address, active, created_at, updated_at;
    `;

    const newData = updatedRows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_LPTK',
      entityType: 'lptk',
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
    const user = await requirePermission('lptk.write');
    const { id } = params;

    // Check if referenced by participants
    const partRef = await db.query`
      SELECT id FROM public.participants WHERE lptk_id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (partRef.length > 0) {
      return errorResponse(
        'DATA_REFERENCED',
        'LPTK tidak dapat dihapus karena telah memiliki pendaftaran peserta.',
        400
      );
    }

    const deletedRows = await db.query`
      UPDATE public.lptks
      SET deleted_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id, code, name;
    `;

    if (!deletedRows || deletedRows.length === 0) {
      return errorResponse('NOT_FOUND', 'LPTK tidak ditemukan atau sudah dihapus.', 404);
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_LPTK',
      entityType: 'lptk',
      entityId: id,
      oldData: deletedRows[0],
    });

    return successResponse({ message: 'LPTK berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
