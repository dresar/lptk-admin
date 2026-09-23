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

    const lptk = rows[0];

    // Fetch stats for this LPTK
    const statsRows = await db.query`
      SELECT 
        count(p.id)::int as total_participants,
        count(p.id) FILTER (WHERE p.gender_code = 'MALE')::int as male_participants,
        count(p.id) FILTER (WHERE p.gender_code = 'FEMALE')::int as female_participants,
        count(p.id) FILTER (WHERE p.status_code = 'VERIFIED')::int as verified_participants,
        count(p.id) FILTER (WHERE p.status_code IN ('SUBMITTED', 'IN_REVIEW', 'DRAFT'))::int as pending_participants,
        count(p.id) FILTER (WHERE p.status_code IN ('REVISION_REQUIRED', 'REJECTED'))::int as revision_participants
      FROM public.participants p
      WHERE p.lptk_id = ${id} AND p.deleted_at IS NULL;
    `;

    // Fetch participants in this LPTK
    const participants = await db.query`
      SELECT 
        p.id, p.name, p.nik, p.gender_code, p.status_code, p.phone, p.photo_url,
        p.school_or_institution, p.birth_place, p.birth_date,
        c.name as category_name,
        comp.name as competition_name
      FROM public.participants p
      LEFT JOIN public.participant_categories pc ON p.id = pc.participant_id
      LEFT JOIN public.categories c ON pc.category_id = c.id
      LEFT JOIN public.competitions comp ON p.competition_id = comp.id
      WHERE p.lptk_id = ${id} AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC;
    `;

    return successResponse({
      ...lptk,
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

    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== id) {
      return errorResponse('FORBIDDEN', 'Anda hanya dapat mengubah data LPTK Anda sendiri.', 403);
    }

    const { village_id, code, name, leader_name, phone, address, active } = parsed.data;

    if (code && code !== oldData.code) {
      const duplicateCode = await db.query`
        SELECT id FROM public.lptks WHERE code = ${code} AND id != ${id} AND deleted_at IS NULL LIMIT 1;
      `;
      if (duplicateCode && duplicateCode.length > 0) {
        return errorResponse('CONFLICT', 'Kode LPTK sudah digunakan.', 409);
      }
    }

    const updatedRows = await db.query`
      UPDATE public.lptks
      SET
        village_id = COALESCE(${village_id}, village_id),
        code = COALESCE(${code}, code),
        name = COALESCE(${name}, name),
        leader_name = COALESCE(${leader_name}, leader_name),
        phone = COALESCE(${phone}, phone),
        address = COALESCE(${address}, address),
        active = COALESCE(${active}, active),
        updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *;
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_LPTK',
      entityType: 'lptk',
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
    const user = await requirePermission('lptk.delete');
    const { id } = params;

    const existingRows = await db.query`
      SELECT * FROM public.lptks WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'LPTK tidak ditemukan.', 404);
    }
    const oldData = existingRows[0];

    const activeParticipants = await db.query`
      SELECT id FROM public.participants WHERE lptk_id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (activeParticipants && activeParticipants.length > 0) {
      return errorResponse('BAD_REQUEST', 'Tidak dapat menghapus LPTK yang masih memiliki peserta aktif.', 400);
    }

    await db.query`
      UPDATE public.lptks
      SET deleted_at = NOW()
      WHERE id = ${id};
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_LPTK',
      entityType: 'lptk',
      entityId: id,
      oldData: oldData,
      newData: null,
      
    });

    return successResponse({ message: 'LPTK berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
