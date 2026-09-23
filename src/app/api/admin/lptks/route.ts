import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { createLptkSchema } from '@/server/validators/lptk';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission('lptk.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);

    // If Operator, lock to own LPTK
    const isOperator = user.role_code === 'OPERATOR_LPTK' && user.lptk_id;

    let countQuery;
    let listQuery;

    if (isOperator) {
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.lptks 
        WHERE id = ${user.lptk_id} AND deleted_at IS NULL
      `;
      listQuery = db.query`
        SELECT 
          l.id, l.village_id, v.name AS village_name, l.code, l.name, 
          l.leader_name, l.phone, l.address, l.active, l.created_at, l.updated_at
        FROM public.lptks l
        JOIN public.villages v ON l.village_id = v.id
        WHERE l.id = ${user.lptk_id} AND l.deleted_at IS NULL
        LIMIT 1;
      `;
    } else if (q) {
      const searchPattern = `%${q}%`;
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.lptks l
        JOIN public.villages v ON l.village_id = v.id
        WHERE l.deleted_at IS NULL AND (
          l.name ILIKE ${searchPattern} OR 
          l.code ILIKE ${searchPattern} OR 
          l.leader_name ILIKE ${searchPattern} OR
          v.name ILIKE ${searchPattern}
        )
      `;
      const rawSql = `
        SELECT 
          l.id, l.village_id, v.name AS village_name, l.code, l.name, 
          l.leader_name, l.phone, l.address, l.active, l.created_at, l.updated_at
        FROM public.lptks l
        JOIN public.villages v ON l.village_id = v.id
        WHERE l.deleted_at IS NULL AND (
          l.name ILIKE $1 OR 
          l.code ILIKE $1 OR 
          l.leader_name ILIKE $1 OR
          v.name ILIKE $1
        )
        ORDER BY l.${sort} ${order.toUpperCase()}
        LIMIT $2 OFFSET $3;
      `;
      listQuery = db.raw(rawSql, [searchPattern, pageSize, offset]);
    } else {
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.lptks 
        WHERE deleted_at IS NULL
      `;
      const rawSql = `
        SELECT 
          l.id, l.village_id, v.name AS village_name, l.code, l.name, 
          l.leader_name, l.phone, l.address, l.active, l.created_at, l.updated_at
        FROM public.lptks l
        JOIN public.villages v ON l.village_id = v.id
        WHERE l.deleted_at IS NULL
        ORDER BY l.${sort} ${order.toUpperCase()}
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
    const user = await requirePermission('lptk.write');
    const body = await req.json();
    const parsed = createLptkSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { village_id, code, name, leader_name, phone, address, active } = parsed.data;

    // Check code duplication
    const existing = await db.query`
      SELECT id FROM public.lptks WHERE code = ${code} AND deleted_at IS NULL LIMIT 1;
    `;
    if (existing.length > 0) {
      return errorResponse('DUPLICATE_CODE', 'Kode LPTK sudah digunakan.', 400);
    }

    const rows = await db.query`
      INSERT INTO public.lptks (village_id, code, name, leader_name, phone, address, active)
      VALUES (${village_id}, ${code}, ${name}, ${leader_name}, ${phone}, ${address}, ${active})
      RETURNING id, village_id, code, name, leader_name, phone, address, active, created_at, updated_at;
    `;

    const newLptk = rows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'CREATE_LPTK',
      entityType: 'lptk',
      entityId: newLptk.id,
      newData: newLptk,
    });

    return successResponse(newLptk, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
