import { NextRequest } from 'next/server';
import { listObjectsFromS3, deleteFromS3 } from '@/server/utils/s3';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('cdn.read');

    const s3Assets = await listObjectsFromS3('');

    const assets = s3Assets.map((item) => {
      const parts = item.key.split('/');
      const filename = parts[parts.length - 1];
      const ext = filename.split('.').pop()?.toLowerCase();
      let mime = 'application/octet-stream';
      if (ext === 'png') mime = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
      else if (ext === 'webp') mime = 'image/webp';
      else if (ext === 'svg') mime = 'image/svg+xml';
      else if (ext === 'gif') mime = 'image/gif';
      else if (ext === 'pdf') mime = 'application/pdf';

      const cleanPath = item.key.replace(/^cdn\//, '');

      return {
        key: item.key,
        name: filename,
        folder: parts.length > 1 ? parts[0] === 'cdn' && parts.length > 2 ? parts[1] : parts[0] : 'root',
        type: mime,
        size_bytes: item.size,
        last_modified: item.lastModified,
        url: `/api/cdn/${cleanPath}`,
      };
    });

    return successResponse({
      storage_type: 'neon_s3_storage',
      total_count: assets.length,
      assets,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requirePermission('cdn.write');
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return errorResponse('VALIDATION_ERROR', 'Parameter key berkas wajib disertakan.', 400);
    }

    // Safety check: protect default system logos from accidental deletion
    if (key === 'cdn/logos/lptq-logo.png' || key === 'cdn/logos/lptq-stempel.png') {
      return errorResponse('PROTECTED_ASSET', 'Aset default sistem tidak dapat dihapus.', 400);
    }

    await deleteFromS3(key);

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DELETE_CDN_ASSET',
      entityType: 'cdn',
      newData: { key },
    });

    return successResponse({ message: 'Berkas berhasil dihapus dari CDN Storage.' });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
