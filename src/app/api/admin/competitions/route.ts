import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { createCompetitionSchema } from '@/server/validators/competition';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('competition.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);

    let countQuery;
    let listQuery;

    if (q) {
      const searchPattern = `%${q}%`;
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.competitions 
        WHERE deleted_at IS NULL AND (name ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
      `;
      const rawSql = `
        SELECT 
          c.id, c.name, c.description, c.period_year, c.status_code, 
          c.registration_open_at, c.registration_close_at, c.created_at, c.updated_at,
          COUNT(DISTINCT cat.id)::int AS categories_count,
          COUNT(DISTINCT p.id)::int AS participants_count
        FROM public.competitions c
        LEFT JOIN public.categories cat ON c.id = cat.competition_id AND cat.deleted_at IS NULL
        LEFT JOIN public.participants p ON c.id = p.competition_id AND p.deleted_at IS NULL
        WHERE c.deleted_at IS NULL AND (c.name ILIKE $1 OR c.description ILIKE $1)
        GROUP BY c.id
        ORDER BY c.${sort} ${order.toUpperCase()}
        LIMIT $2 OFFSET $3;
      `;
      listQuery = db.raw(rawSql, [searchPattern, pageSize, offset]);
    } else {
      countQuery = db.query`SELECT COUNT(*)::int AS count FROM public.competitions WHERE deleted_at IS NULL`;
      const rawSql = `
        SELECT 
          c.id, c.name, c.description, c.period_year, c.status_code, 
          c.registration_open_at, c.registration_close_at, c.created_at, c.updated_at,
          COUNT(DISTINCT cat.id)::int AS categories_count,
          COUNT(DISTINCT p.id)::int AS participants_count
        FROM public.competitions c
        LEFT JOIN public.categories cat ON c.id = cat.competition_id AND cat.deleted_at IS NULL
        LEFT JOIN public.participants p ON c.id = p.competition_id AND p.deleted_at IS NULL
        WHERE c.deleted_at IS NULL
        GROUP BY c.id
        ORDER BY c.${sort} ${order.toUpperCase()}
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
    const user = await requirePermission('competition.write');
    const body = await req.json();
    const parsed = createCompetitionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { name, description, period_year, status_code, registration_open_at, registration_close_at } = parsed.data;

    const rows = await db.query`
      INSERT INTO public.competitions (
        name, description, period_year, status_code, registration_open_at, registration_close_at
      ) VALUES (
        ${name}, ${description || null}, ${period_year}, ${status_code}, 
        ${new Date(registration_open_at)}, ${new Date(registration_close_at)}
      )
      RETURNING id, name, description, period_year, status_code, registration_open_at, registration_close_at, created_at, updated_at;
    `;

    const newComp = rows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'CREATE_COMPETITION',
      entityType: 'competition',
      entityId: newComp.id,
      newData: newComp,
    });

    return successResponse(newComp, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
