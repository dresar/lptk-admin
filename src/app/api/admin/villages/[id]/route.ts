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

    const village = rows[0];

    // Fetch LPTKs in this village
    const lptks = await db.query`
      SELECT id, code, name, leader_name, phone, address, active, created_at
      FROM public.lptks
      WHERE village_id = ${id} AND deleted_at IS NULL
      ORDER BY name ASC;
    `;

    // Fetch stats for this village
    const statsRows = await db.query`
      SELECT 
        count(DISTINCT l.id)::int as total_lptks,
        count(p.id)::int as total_participants,
        count(p.id) FILTER (WHERE p.status_code = 'VERIFIED')::int as verified_participants,
        count(p.id) FILTER (WHERE p.status_code IN ('SUBMITTED', 'IN_REVIEW', 'DRAFT'))::int as pending_participants,
        count(p.id) FILTER (WHERE p.status_code IN ('REVISION_REQUIRED', 'REJECTED'))::int as rejected_participants
      FROM public.villages v
      LEFT JOIN public.lptks l ON l.village_id = v.id AND l.deleted_at IS NULL
      LEFT JOIN public.participants p ON p.lptk_id = l.id AND p.deleted_at IS NULL
      WHERE v.id = ${id};
    `;

    // Fetch participants in this village
    const participants = await db.query`
      SELECT 
        p.id, p.name, p.nik, p.gender_code, p.status_code, p.phone, p.photo_url,
        l.name as lptk_name,
        c.name as category_name
      FROM public.participants p
      JOIN public.lptks l ON p.lptk_id = l.id
      LEFT JOIN public.participant_categories pc ON p.id = pc.participant_id
      LEFT JOIN public.categories c ON pc.category_id = c.id
      WHERE l.village_id = ${id} AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT 100;
    `;

    return successResponse({
      ...village,
      stats: statsRows[0] || {
        total_lptks: 0,
        total_participants: 0,
        verified_participants: 0,
        pending_participants: 0,
        rejected_participants: 0,
      },
      lptks: lptks || [],
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

    if (code && code !== oldData.code) {
      const duplicateCode = await db.query`
        SELECT id FROM public.villages WHERE code = ${code} AND id != ${id} AND deleted_at IS NULL LIMIT 1;
      `;
      if (duplicateCode && duplicateCode.length > 0) {
        return errorResponse('CONFLICT', 'Kode desa sudah digunakan.', 409);
      }
    }

    const updatedRows = await db.query`
      UPDATE public.villages
      SET 
        code = COALESCE(${code}, code),
        name = COALESCE(${name}, name),
        updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id, code, name, created_at, updated_at;
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_VILLAGE',
      entityType: 'village',
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
    const user = await requirePermission('village.delete');
    const { id } = params;

    const existingRows = await db.query`
      SELECT id, code, name FROM public.villages WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Desa tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const activeLptks = await db.query`
      SELECT id FROM public.lptks WHERE village_id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (activeLptks && activeLptks.length > 0) {
      return errorResponse('BAD_REQUEST', 'Tidak dapat menghapus desa yang masih memiliki LPTK aktif.', 400);
    }

    await db.query`
      UPDATE public.villages
      SET deleted_at = NOW()
      WHERE id = ${id};
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_VILLAGE',
      entityType: 'village',
      entityId: id,
      oldData: oldData,
      newData: null,
      
    });

    return successResponse({ message: 'Desa berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
