import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('audit.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);
    const searchParams = req.nextUrl.searchParams;

    const userId = searchParams.get('user_id');
    const actionCode = searchParams.get('action_code');
    const entityType = searchParams.get('entity_type');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    const whereConditions: string[] = ['1=1'];
    const queryParams: any[] = [];
    let pIndex = 1;

    if (q) {
      whereConditions.push(`(a.action_code ILIKE $${pIndex} OR a.entity_type ILIKE $${pIndex} OR u.full_name ILIKE $${pIndex})`);
      queryParams.push(`%${q}%`);
      pIndex++;
    }

    if (userId) {
      whereConditions.push(`a.user_id = $${pIndex}`);
      queryParams.push(userId);
      pIndex++;
    }

    if (actionCode) {
      whereConditions.push(`a.action_code = $${pIndex}`);
      queryParams.push(actionCode);
      pIndex++;
    }

    if (entityType) {
      whereConditions.push(`a.entity_type = $${pIndex}`);
      queryParams.push(entityType);
      pIndex++;
    }

    if (dateFrom) {
      whereConditions.push(`a.created_at >= $${pIndex}`);
      queryParams.push(new Date(dateFrom));
      pIndex++;
    }

    if (dateTo) {
      whereConditions.push(`a.created_at <= $${pIndex}`);
      queryParams.push(new Date(dateTo));
      pIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.audit_logs a
      LEFT JOIN auth.users u ON a.user_id = u.id
      WHERE ${whereClause};
    `;
    const countRes = await db.raw(countSql, queryParams);
    const totalItems = countRes[0]?.count || 0;

    const listSql = `
      SELECT 
        a.id, a.user_id, u.full_name AS user_name, u.email AS user_email,
        a.action_code, a.entity_type, a.entity_id, a.ip_address, a.user_agent,
        a.old_data, a.new_data, a.created_at
      FROM public.audit_logs a
      LEFT JOIN auth.users u ON a.user_id = u.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${pIndex} OFFSET $${pIndex + 1};
    `;

    queryParams.push(pageSize, offset);
    const items = await db.raw(listSql, queryParams);

    return successResponse(items, createPaginationMeta(totalItems, page, pageSize));
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
