import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('document.download');
    const { id } = params;

    const rows = await db.query`
      SELECT 
        pd.id, pd.file_name, pd.mime_type, pd.file_size_bytes, pd.file_data,
        p.lptk_id, p.name AS participant_name
      FROM public.participant_documents pd
      JOIN public.participants p ON pd.participant_id = p.id
      WHERE pd.id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Dokumen tidak ditemukan.', 404);
    }

    const doc = rows[0];

    // Operator scoping
    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id !== doc.lptk_id) {
      return errorResponse('FORBIDDEN', 'Anda tidak berhak mengunduh dokumen peserta ini.', 403);
    }

    if (!doc.file_data) {
      return errorResponse('DATA_CORRUPTED', 'Konten berkas tidak tersedia dalam database.', 404);
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'DOWNLOAD_DOCUMENT',
      entityType: 'document',
      entityId: id,
      newData: { file_name: doc.file_name, size: doc.file_size_bytes },
    });

    const fileBuffer = Buffer.from(doc.file_data);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': doc.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.file_name)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
