import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { updatePostSchema } from '@/server/validators/post';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('post.read');

    const rows = await db.query`
      SELECT 
        id, title, slug, category, excerpt, content, cover_image_url,
        author_name, is_published, published_at, created_at, updated_at
      FROM public.posts
      WHERE id = ${params.id} AND deleted_at IS NULL
    `;

    if (rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Artikel/Berita tidak ditemukan', 404);
    }

    return successResponse(rows[0]);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('post.write');

    const rows = await db.query`
      SELECT * FROM public.posts WHERE id = ${params.id} AND deleted_at IS NULL
    `;

    if (rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Artikel/Berita tidak ditemukan', 404);
    }

    const currentPost = rows[0];
    const body = await req.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0]?.message || 'Input tidak valid', 400);
    }

    const data = parsed.data;

    if (data.slug && data.slug !== currentPost.slug) {
      const slugCheck = await db.query`
        SELECT id FROM public.posts WHERE slug = ${data.slug} AND id != ${params.id} AND deleted_at IS NULL
      `;
      if (slugCheck.length > 0) {
        return errorResponse('SLUG_EXISTS', 'Slug URL sudah digunakan oleh artikel lain.', 409);
      }
    }

    const title = data.title ?? currentPost.title;
    const slug = data.slug ?? currentPost.slug;
    const category = data.category ?? currentPost.category;
    const excerpt = data.excerpt ?? currentPost.excerpt;
    const content = data.content ?? currentPost.content;
    const cover_image_url = data.cover_image_url !== undefined ? data.cover_image_url : currentPost.cover_image_url;
    const author_name = data.author_name ?? currentPost.author_name;
    const is_published = data.is_published !== undefined ? data.is_published : currentPost.is_published;
    const published_at = data.published_at ? new Date(data.published_at) : currentPost.published_at;

    const updatedRows = await db.query`
      UPDATE public.posts
      SET 
        title = ${title},
        slug = ${slug},
        category = ${category},
        excerpt = ${excerpt},
        content = ${content},
        cover_image_url = ${cover_image_url},
        author_name = ${author_name},
        is_published = ${is_published},
        published_at = ${published_at},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING id, title, slug, category, excerpt, content, cover_image_url, author_name, is_published, published_at, updated_at;
    `;

    const updatedPost = updatedRows[0];

    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPDATE_POST',
      entityType: 'post',
      entityId: params.id,
      oldData: currentPost,
      newData: updatedPost,
    });

    return successResponse(updatedPost);
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
    const user = await requirePermission('post.write');

    const rows = await db.query`
      SELECT id, title FROM public.posts WHERE id = ${params.id} AND deleted_at IS NULL
    `;

    if (rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Artikel/Berita tidak ditemukan', 404);
    }

    await db.query`
      UPDATE public.posts
      SET deleted_at = NOW()
      WHERE id = ${params.id}
    `;

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_POST',
      entityType: 'post',
      entityId: params.id,
      oldData: rows[0],
    });

    return successResponse({ message: 'Artikel berhasil dihapus' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
