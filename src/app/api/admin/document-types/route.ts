import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { createDocumentTypeSchema } from '@/server/validators/document-type';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('document_type.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);

    let countQuery;
    let listQuery;

    if (q) {
      const searchPattern = `%${q}%`;
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.document_types 
        WHERE deleted_at IS NULL AND (name ILIKE ${searchPattern} OR code ILIKE ${searchPattern})
      `;
      const rawSql = `
        SELECT id, code, name, is_required, active, created_at, updated_at
        FROM public.document_types
        WHERE deleted_at IS NULL AND (name ILIKE $1 OR code ILIKE $1)
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT $2 OFFSET $3;
      `;
      listQuery = db.raw(rawSql, [searchPattern, pageSize, offset]);
    } else {
      countQuery = db.query`SELECT COUNT(*)::int AS count FROM public.document_types WHERE deleted_at IS NULL`;
      const rawSql = `
        SELECT id, code, name, is_required, active, created_at, updated_at
        FROM public.document_types
        WHERE deleted_at IS NULL
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT $1 OFFSET $2;
      `;
      listQuery = db.raw(rawSql, [pageSize, offset]);
    }

    const [totalRes, items] = await Promise.all([countQuery, listQuery]);
    const totalItems = totalRes[0]?.count || 0;

    return successResponse(items, createPaginationMeta(totalItems, page, pageSize));
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission('document_type.write');
    const body = await req.json();
    const parsed = createDocumentTypeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { code, name, is_required, active } = parsed.data;
    const cleanCode = code.toUpperCase().trim().replace(/\s+/g, '_');

    const dup = await db.query`SELECT id FROM public.document_types WHERE code = ${cleanCode} AND deleted_at IS NULL LIMIT 1;`;
    if (dup.length > 0) {
      return errorResponse('DUPLICATE_CODE', 'Kode jenis dokumen sudah digunakan.', 400);
    }

    const rows = await db.query`
      INSERT INTO public.document_types (code, name, is_required, active)
      VALUES (${cleanCode}, ${name}, ${is_required}, ${active})
      RETURNING id, code, name, is_required, active, created_at, updated_at;
    `;

    const newDocType = rows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'CREATE_DOCUMENT_TYPE',
      entityType: 'document_type',
      entityId: newDocType.id,
      newData: newDocType,
    });

    return successResponse(newDocType, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
