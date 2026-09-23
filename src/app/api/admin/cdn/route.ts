import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://cdn.jsdelivr.net/gh';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('cdn.read');

    // Manifest of public assets accessible through GitHub/jsDelivr CDN
    const assets = [
      { key: 'logo_default', type: 'image/svg+xml', url: `${CDN_BASE_URL}/twbs/icons@main/icons/award.svg`, label: 'Logo Resmi' },
      { key: 'avatar_placeholder', type: 'image/svg+xml', url: `${CDN_BASE_URL}/twbs/icons@main/icons/person.svg`, label: 'Avatar Default' },
      { key: 'empty_state', type: 'image/svg+xml', url: `${CDN_BASE_URL}/twbs/icons@main/icons/inbox.svg`, label: 'Ilustrasi Kosong' },
      { key: 'file_icon_pdf', type: 'image/svg+xml', url: `${CDN_BASE_URL}/twbs/icons@main/icons/file-earmark-pdf.svg`, label: 'Ikon PDF' },
      { key: 'file_icon_image', type: 'image/svg+xml', url: `${CDN_BASE_URL}/twbs/icons@main/icons/file-earmark-image.svg`, label: 'Ikon Gambar' },
    ];

    return successResponse({ cdn_base_url: CDN_BASE_URL, assets });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
