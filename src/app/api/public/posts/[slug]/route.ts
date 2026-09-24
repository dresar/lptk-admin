import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rows = await db.query`
      SELECT 
        id, title, slug, category, excerpt, content, cover_image_url, 
        author_name, published_at
      FROM public.posts
      WHERE slug = ${params.slug} AND deleted_at IS NULL AND is_published = true
      LIMIT 1
    `;

    if (rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Artikel/Berita tidak ditemukan', 404);
    }

    return successResponse(rows[0]);
  } catch (err) {
    return handleServerError(err);
  }
}
