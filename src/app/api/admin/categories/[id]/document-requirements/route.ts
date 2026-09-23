import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updateCategoryRequirementsSchema } from '@/server/validators/category';
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
      SELECT dt.id, dt.code, dt.name, dt.is_required, cdr.is_mandatory
      FROM public.document_types dt
      JOIN public.category_document_requirements cdr ON dt.id = cdr.document_type_id
      WHERE cdr.category_id = ${id} AND dt.deleted_at IS NULL
      ORDER BY dt.name ASC;
    `;

    return successResponse(rows);
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
    const parsed = updateCategoryRequirementsSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { document_type_ids } = parsed.data;

    // Reset and re-assign
    await db.query`DELETE FROM public.category_document_requirements WHERE category_id = ${id};`;

    for (const dtId of document_type_ids) {
      await db.query`
        INSERT INTO public.category_document_requirements (category_id, document_type_id, is_mandatory)
        VALUES (${id}, ${dtId}, true)
        ON CONFLICT DO NOTHING;
      `;
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_CATEGORY_REQUIREMENTS',
      entityType: 'category',
      entityId: id,
      newData: { category_id: id, count: document_type_ids.length },
    });

    return successResponse({ message: 'Persyaratan dokumen kategori berhasil diperbarui.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
