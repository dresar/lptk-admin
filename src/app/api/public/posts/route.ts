import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, handleServerError } from '@/server/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50);

    let query;
    if (category) {
      query = db.query`
        SELECT 
          id, title, slug, category, excerpt, cover_image_url, 
          author_name, published_at
        FROM public.posts
        WHERE deleted_at IS NULL AND is_published = true AND category = ${category}
        ORDER BY published_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = db.query`
        SELECT 
          id, title, slug, category, excerpt, cover_image_url, 
          author_name, published_at
        FROM public.posts
        WHERE deleted_at IS NULL AND is_published = true
        ORDER BY published_at DESC
        LIMIT ${limit}
      `;
    }

    const items = await query;
    return successResponse(items);
  } catch (err) {
    return handleServerError(err);
  }
}
