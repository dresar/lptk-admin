import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission('report.export');
    const searchParams = req.nextUrl.searchParams;

    const competitionId = searchParams.get('competition_id');
    const rawLptkId = searchParams.get('lptk_id');
    const statusCode = searchParams.get('status_code');

    let lptkId = rawLptkId;
    if (user.role_code === 'OPERATOR_LPTK') {
      lptkId = user.lptk_id;
    }

    const whereConditions: string[] = ['p.deleted_at IS NULL'];
    const queryParams: any[] = [];
    let pIndex = 1;

    if (competitionId) {
      whereConditions.push(`p.competition_id = $${pIndex}`);
      queryParams.push(competitionId);
      pIndex++;
    }

    if (lptkId) {
      whereConditions.push(`p.lptk_id = $${pIndex}`);
      queryParams.push(lptkId);
      pIndex++;
    }

    if (statusCode) {
      whereConditions.push(`p.status_code = $${pIndex}`);
      queryParams.push(statusCode);
      pIndex++;
    }

    const sql = `
      SELECT 
        p.nik, p.name, p.gender_code, p.birth_place, p.birth_date, p.phone,
        l.name AS lptk_name, v.name AS village_name, comp.name AS competition_name,
        p.status_code, p.created_at
      FROM public.participants p
      JOIN public.competitions comp ON p.competition_id = comp.id
      JOIN public.lptks l ON p.lptk_id = l.id
      JOIN public.villages v ON l.village_id = v.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY p.name ASC;
    `;

    const rows = await db.raw(sql, queryParams);

    // Build CSV content
    const headers = [
      'NIK',
      'Nama',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Telepon',
      'LPTK',
      'Desa',
      'Lomba',
      'Status',
      'Tanggal Daftar',
    ];

    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const line = [
        `"${r.nik}"`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${r.gender_code}"`,
        `"${(r.birth_place || '').replace(/"/g, '""')}"`,
        `"${r.birth_date}"`,
        `"${r.phone || ''}"`,
        `"${(r.lptk_name || '').replace(/"/g, '""')}"`,
        `"${(r.village_name || '').replace(/"/g, '""')}"`,
        `"${(r.competition_name || '').replace(/"/g, '""')}"`,
        `"${r.status_code}"`,
        `"${new Date(r.created_at).toISOString().split('T')[0]}"`,
      ];
      csvLines.push(line.join(','));
    }

    const csvData = csvLines.join('\n');

    await recordAuditLog({
      userId: user.id,
      actionCode: 'EXPORT_REPORT',
      entityType: 'participant',
      newData: { count: rows.length, competition_id: competitionId, lptk_id: lptkId },
    });

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="data_peserta_${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
