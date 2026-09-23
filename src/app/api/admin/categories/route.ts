import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { createCategorySchema } from '@/server/validators/category';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('category.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);
    const searchParams = req.nextUrl.searchParams;
    const competitionId = searchParams.get('competition_id');

    let countQuery;
    let listQuery;

    if (competitionId && q) {
      const searchPattern = `%${q}%`;
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.categories 
        WHERE competition_id = ${competitionId} AND deleted_at IS NULL AND name ILIKE ${searchPattern}
      `;
      const rawSql = `
        SELECT 
          cat.id, cat.competition_id, comp.name AS competition_name,
          cat.name, cat.gender_code, cat.age_min, cat.age_max, 
          cat.requirements, cat.active, cat.created_at, cat.updated_at
        FROM public.categories cat
        JOIN public.competitions comp ON cat.competition_id = comp.id
        WHERE cat.competition_id = $1 AND cat.deleted_at IS NULL AND cat.name ILIKE $2
        ORDER BY cat.${sort} ${order.toUpperCase()}
        LIMIT $3 OFFSET $4;
      `;
      listQuery = db.raw(rawSql, [competitionId, searchPattern, pageSize, offset]);
    } else if (competitionId) {
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.categories 
        WHERE competition_id = ${competitionId} AND deleted_at IS NULL
      `;
      const rawSql = `
        SELECT 
          cat.id, cat.competition_id, comp.name AS competition_name,
          cat.name, cat.gender_code, cat.age_min, cat.age_max, 
          cat.requirements, cat.active, cat.created_at, cat.updated_at
        FROM public.categories cat
        JOIN public.competitions comp ON cat.competition_id = comp.id
        WHERE cat.competition_id = $1 AND cat.deleted_at IS NULL
        ORDER BY cat.${sort} ${order.toUpperCase()}
        LIMIT $2 OFFSET $3;
      `;
      listQuery = db.raw(rawSql, [competitionId, pageSize, offset]);
    } else if (q) {
      const searchPattern = `%${q}%`;
      countQuery = db.query`
        SELECT COUNT(*)::int AS count 
        FROM public.categories 
        WHERE deleted_at IS NULL AND name ILIKE ${searchPattern}
      `;
      const rawSql = `
        SELECT 
          cat.id, cat.competition_id, comp.name AS competition_name,
          cat.name, cat.gender_code, cat.age_min, cat.age_max, 
          cat.requirements, cat.active, cat.created_at, cat.updated_at
        FROM public.categories cat
        JOIN public.competitions comp ON cat.competition_id = comp.id
        WHERE cat.deleted_at IS NULL AND cat.name ILIKE $1
        ORDER BY cat.${sort} ${order.toUpperCase()}
        LIMIT $2 OFFSET $3;
      `;
      listQuery = db.raw(rawSql, [searchPattern, pageSize, offset]);
    } else {
      countQuery = db.query`SELECT COUNT(*)::int AS count FROM public.categories WHERE deleted_at IS NULL`;
      const rawSql = `
        SELECT 
          cat.id, cat.competition_id, comp.name AS competition_name,
          cat.name, cat.gender_code, cat.age_min, cat.age_max, 
          cat.requirements, cat.active, cat.created_at, cat.updated_at
        FROM public.categories cat
        JOIN public.competitions comp ON cat.competition_id = comp.id
        WHERE cat.deleted_at IS NULL
        ORDER BY cat.${sort} ${order.toUpperCase()}
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
    const user = await requirePermission('category.write');
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const { competition_id, name, gender_code, age_min, age_max, requirements, active } = parsed.data;

    const rows = await db.query`
      INSERT INTO public.categories (
        competition_id, name, gender_code, age_min, age_max, requirements, active
      ) VALUES (
        ${competition_id}, ${name}, ${gender_code}, ${age_min}, ${age_max}, ${requirements || null}, ${active}
      )
      RETURNING id, competition_id, name, gender_code, age_min, age_max, requirements, active, created_at, updated_at;
    `;

    const newCategory = rows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'CREATE_CATEGORY',
      entityType: 'category',
      entityId: newCategory.id,
      newData: newCategory,
    });

    return successResponse(newCategory, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
