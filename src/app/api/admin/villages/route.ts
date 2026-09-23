import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { createVillageSchema } from '@/server/validators/village';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('village.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);

    let countQuery;
    let listQuery;

    if (q) {
      const searchPattern = `%${q}%`;
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.villages 
        WHERE deleted_at IS NULL AND (name ILIKE ${searchPattern} OR code ILIKE ${searchPattern})
      `;
      // Direct raw query with safe sanitized sort and order
      const rawSql = `
        SELECT id, code, name, created_at, updated_at
        FROM public.villages
        WHERE deleted_at IS NULL AND (name ILIKE $1 OR code ILIKE $1)
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT $2 OFFSET $3;
      `;
      listQuery = db.raw(rawSql, [searchPattern, pageSize, offset]);
    } else {
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.villages 
        WHERE deleted_at IS NULL
      `;
      const rawSql = `
        SELECT id, code, name, created_at, updated_at
        FROM public.villages
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
    const user = await requirePermission('village.write');
    const body = await req.json();
    const parsed = createVillageSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { code, name } = parsed.data;

    // Check duplicate code
    const existing = await db.query`
      SELECT id FROM public.villages WHERE code = ${code} AND deleted_at IS NULL LIMIT 1;
    `;
    if (existing.length > 0) {
      return errorResponse('DUPLICATE_CODE', 'Kode desa sudah digunakan.', 400);
    }

    const rows = await db.query`
      INSERT INTO public.villages (code, name)
      VALUES (${code}, ${name})
      RETURNING id, code, name, created_at, updated_at;
    `;

    const newVillage = rows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'CREATE_VILLAGE',
      entityType: 'village',
      entityId: newVillage.id,
      newData: newVillage,
    });

    return successResponse(newVillage, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
