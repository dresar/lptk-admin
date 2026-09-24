import { NextRequest } from 'next/server';
import { uploadToS3 } from '@/server/utils/s3';
import { validateMagicBytes } from '@/server/utils/magic-bytes';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission('cdn.write');

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'cdn/uploads';

    if (!file) {
      return errorResponse('VALIDATION_ERROR', 'Berkas (file) wajib disertakan.', 400);
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return errorResponse('FILE_TOO_LARGE', 'Ukuran berkas melebihi batas maksimum 5 MB.', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic bytes for security
    const signatureCheck = validateMagicBytes(buffer);
    if (!signatureCheck.valid) {
      return errorResponse('INVALID_FILE_TYPE', signatureCheck.error || 'Format berkas tidak sah.', 400);
    }

    const mimeType = signatureCheck.detectedMime || file.type;
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const s3Key = `${cleanFolder}/${Date.now()}_${sanitizedName}`;

    // Upload to Neon Object Storage
    await uploadToS3(s3Key, buffer, mimeType);

    // Audit log
    await recordAuditLog({
      userId: user.id,
      actionCode: 'UPLOAD_CDN_ASSET',
      entityType: 'cdn',
      newData: { key: s3Key, file_name: file.name, size: file.size, mime_type: mimeType },
    });

    const cdnUrl = `/api/cdn/${s3Key}`;

    return successResponse({
      key: s3Key,
      url: cdnUrl,
      file_name: file.name,
      file_size_bytes: file.size,
      mime_type: mimeType,
      message: 'Berkas berhasil diunggah ke CDN Neon Storage.',
    }, undefined, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
