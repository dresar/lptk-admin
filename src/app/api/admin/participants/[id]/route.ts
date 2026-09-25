import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updateParticipantSchema } from '@/server/validators/participant';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('participant.read');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        p.*,
        c.name AS competition_name,
        l.name AS lptk_name,
        v.name AS village_name,
        v.id AS village_id
      FROM public.participants p
      JOIN public.competitions c ON p.competition_id = c.id
      JOIN public.lptks l ON p.lptk_id = l.id
      JOIN public.villages v ON l.village_id = v.id
      WHERE p.id = ${id} AND p.deleted_at IS NULL
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peserta tidak ditemukan.', 404);
    }

    const participant = rows[0];

    // Operator scoping
    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== participant.lptk_id) {
      return errorResponse('FORBIDDEN', 'Anda tidak memiliki hak akses untuk melihat peserta dari LPTK lain.', 403);
    }

    // Query categories & documents
    const [categories, documents, verifications] = await Promise.all([
      db.query`
        SELECT cat.id, cat.name, cat.gender_code, cat.age_min, cat.age_max, cat.requirements
        FROM public.categories cat
        JOIN public.participant_categories pc ON cat.id = pc.category_id
        WHERE pc.participant_id = ${id} AND cat.deleted_at IS NULL;
      `,
      db.query`
        SELECT 
          pd.id, pd.document_type_id, dt.code AS document_type_code, dt.name AS document_type_name,
          pd.file_name, pd.mime_type, pd.file_size_bytes, pd.sha256_hash, pd.status_code, pd.created_at
        FROM public.participant_documents pd
        JOIN public.document_types dt ON pd.document_type_id = dt.id
        WHERE pd.participant_id = ${id}
        ORDER BY pd.created_at ASC;
      `,
      db.query`
        SELECT v.id, v.decision, v.note, v.created_at, u.full_name AS verifier_name
        FROM public.verifications v
        JOIN auth.users u ON v.verifier_id = u.id
        WHERE v.participant_id = ${id}
        ORDER BY v.created_at DESC;
      `,
    ]);

    return successResponse({
      ...participant,
      categories,
      documents,
      verifications,
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
    const user = await requirePermission('participant.write');
    const { id } = params;
    const body = await req.json();
    const parsed = updateParticipantSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const existingRows = await db.query`
      SELECT * FROM public.participants WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peserta tidak ditemukan.', 404);
    }
    const current = existingRows[0];

    // Operator Scoping
    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== current.lptk_id) {
      return errorResponse('FORBIDDEN', 'Anda hanya dapat mengubah peserta milik LPTK Anda.', 403);
    }

    // Status check: Operator cannot edit if not DRAFT or REVISION_REQUIRED
    if (user.role_code === 'OPERATOR_LPTK') {
      if (current.status_code !== 'DRAFT' && current.status_code !== 'REVISION_REQUIRED') {
        return errorResponse(
          'STATUS_LOCKED',
          `Data peserta terkunci untuk penyuntingan pada status [${current.status_code}].`,
          400
        );
      }
    }

    const {
      lptk_id,
      name,
      nik,
      gender_code,
      birth_place,
      birth_date,
      address,
      phone,
      school_or_institution,
      father_name,
      mother_name,
      category_ids,
    } = parsed.data;

    // Check duplicate NIK if changed
    if (nik && nik !== current.nik) {
      const dup = await db.query`
        SELECT id FROM public.participants 
        WHERE competition_id = ${current.competition_id} AND nik = ${nik} AND id != ${id} AND deleted_at IS NULL 
        LIMIT 1;
      `;
      if (dup.length > 0) {
        return errorResponse('DUPLICATE_NIK', 'NIK sudah terdaftar dalam perlombaan ini.', 400);
      }
    }

    const updatedRows = await db.query`
      UPDATE public.participants
      SET
        lptk_id = COALESCE(${user.role_code === 'OPERATOR_LPTK' ? user.lptk_id : (lptk_id || null)}, lptk_id),
        name = COALESCE(${name || null}, name),
        nik = COALESCE(${nik || null}, nik),
        gender_code = COALESCE(${gender_code || null}, gender_code),
        birth_place = COALESCE(${birth_place || null}, birth_place),
        birth_date = COALESCE(${birth_date || null}, birth_date),
        address = COALESCE(${address || null}, address),
        phone = COALESCE(${phone || null}, phone),
        school_or_institution = COALESCE(${school_or_institution !== undefined ? school_or_institution : null}, school_or_institution),
        father_name = COALESCE(${father_name !== undefined ? father_name : null}, father_name),
        mother_name = COALESCE(${mother_name !== undefined ? mother_name : null}, mother_name),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, nik, status_code, updated_at;
    `;

    // Update categories if provided
    if (category_ids && category_ids.length > 0) {
      await db.query`DELETE FROM public.participant_categories WHERE participant_id = ${id};`;
      for (const catId of category_ids) {
        await db.query`
          INSERT INTO public.participant_categories (participant_id, category_id)
          VALUES (${id}, ${catId})
          ON CONFLICT DO NOTHING;
        `;
      }
    }

    const newData = updatedRows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_PARTICIPANT',
      entityType: 'participant',
      entityId: id,
      oldData: current,
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
    const user = await requirePermission('participant.write');
    const { id } = params;

    const existingRows = await db.query`
      SELECT id, name, lptk_id, status_code FROM public.participants WHERE id = ${id} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!existingRows || existingRows.length === 0) {
      return errorResponse('NOT_FOUND', 'Peserta tidak ditemukan.', 404);
    }
    const current = existingRows[0];

    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== current.lptk_id) {
      return errorResponse('FORBIDDEN', 'Anda hanya dapat menghapus peserta milik LPTK Anda.', 403);
    }

    if (current.status_code === 'VERIFIED') {
      return errorResponse('CANNOT_DELETE_VERIFIED', 'Peserta yang telah terverifikasi tidak dapat dihapus.', 400);
    }

    await db.query`UPDATE public.participants SET deleted_at = NOW() WHERE id = ${id};`;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_PARTICIPANT',
      entityType: 'participant',
      entityId: id,
      oldData: current,
    });

    return successResponse({ message: 'Peserta berhasil dihapus.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
