import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('cdn.read');
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key')?.trim();

    if (!key) {
      return errorResponse('VALIDATION_ERROR', 'Parameter key berkas wajib disertakan.', 400);
    }

    const cleanPath = key.replace(/^cdn\//, '');
    const urlPattern = `%${cleanPath}%`;
    const keyPattern = `%${key}%`;

    const usages: string[] = [];

    // 1. Check system settings (logo, stamp, hero, branding)
    try {
      const settings = await db.query`
        SELECT key, value FROM public.system_settings 
        WHERE value::text ILIKE ${urlPattern} OR value::text ILIKE ${keyPattern};
      `;
      for (const s of settings) {
        if (s.key === 'app_logo_url') usages.push('Logo Resmi Website');
        else if (s.key === 'app_stamp_url') usages.push('Stempel Resmi LPTQ');
        else usages.push(`Pengaturan Sistem: ${s.key}`);
      }
    } catch {}

    // 2. Check posts / articles
    try {
      const posts = await db.query`
        SELECT title FROM public.posts 
        WHERE deleted_at IS NULL 
          AND (
            cover_image_url ILIKE ${urlPattern} 
            OR cover_image_url ILIKE ${keyPattern}
            OR content ILIKE ${urlPattern}
            OR gallery_images::text ILIKE ${urlPattern}
          )
        LIMIT 5;
      `;
      for (const p of posts) {
        usages.push(`Berita: ${p.title}`);
      }
    } catch {}

    // 3. Check hero slides
    try {
      const heroSlides = await db.query`
        SELECT title FROM public.hero_slides 
        WHERE image_url ILIKE ${urlPattern} OR image_url ILIKE ${keyPattern}
        LIMIT 5;
      `;
      for (const h of heroSlides) {
        usages.push(`Slide Hero: ${h.title || 'Banner Depan'}`);
      }
    } catch {}

    return successResponse({
      key,
      is_used: usages.length > 0,
      usages,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
