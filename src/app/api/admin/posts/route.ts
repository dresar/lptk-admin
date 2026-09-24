import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { createPostSchema } from '@/server/validators/post';
import { parseListParams, createPaginationMeta } from '@/server/utils/pagination';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('post.read');
    const { page, pageSize, offset, q, sort, order } = parseListParams(req.url);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // 'published', 'draft'

    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIdx = 1;

    if (q) {
      conditions.push(`(title ILIKE $${paramIdx} OR excerpt ILIKE $${paramIdx} OR category ILIKE $${paramIdx})`);
      params.push(`%${q}%`);
      paramIdx++;
    }

    if (category) {
      conditions.push(`category = $${paramIdx}`);
      params.push(category);
      paramIdx++;
    }

    if (status === 'published') {
      conditions.push('is_published = true');
    } else if (status === 'draft') {
      conditions.push('is_published = false');
    }

    const whereClause = conditions.join(' AND ');
    const countSql = `SELECT COUNT(*)::int AS count FROM public.posts WHERE ${whereClause}`;
    const totalRes = await db.raw(countSql, params);
    const totalItems = totalRes[0]?.count || 0;

    const allowedSortColumns = ['title', 'category', 'is_published', 'published_at', 'created_at'];
    const safeSort = allowedSortColumns.includes(sort) ? sort : 'published_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const listSql = `
      SELECT 
        id, title, slug, category, excerpt, cover_image_url, 
        author_name, is_published, published_at, created_at, updated_at
      FROM public.posts
      WHERE ${whereClause}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const items = await db.raw(listSql, [...params, pageSize, offset]);

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
    const user = await requirePermission('post.write');
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const {
      title,
      slug,
      category,
      excerpt,
      content,
      cover_image_url,
      author_name,
      is_published,
      published_at,
    } = parsed.data;

    // Check slug collision
    const existing = await db.query`
      SELECT id FROM public.posts WHERE slug = ${slug} AND deleted_at IS NULL
    `;
    if (existing.length > 0) {
      return errorResponse('SLUG_EXISTS', 'Slug URL sudah digunakan. Silakan gunakan slug lain.', 409);
    }

    const pubDate = published_at ? new Date(published_at) : new Date();

    const rows = await db.query`
      INSERT INTO public.posts (
        title, slug, category, excerpt, content, cover_image_url,
        author_name, is_published, published_at, created_by
      ) VALUES (
        ${title}, ${slug}, ${category}, ${excerpt}, ${content}, ${cover_image_url || null},
        ${author_name || 'Sekretariat LPTQ'}, ${is_published}, ${pubDate}, ${user.id}
      )
      RETURNING id, title, slug, category, excerpt, cover_image_url, author_name, is_published, published_at, created_at;
    `;

    const newPost = rows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'CREATE_POST',
      entityType: 'post',
      entityId: newPost.id,
      newData: newPost,
    });

    return successResponse(newPost, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
