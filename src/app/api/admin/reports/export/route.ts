import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';
import { recordAuditLog } from '@/server/utils/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission('report.export');
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'participants';
    const competitionId = searchParams.get('competition_id');

    if (type === 'lptks') {
      const sql = `
        SELECT 
          l.code AS kode_lptk, l.name AS nama_lptk, v.name AS nama_desa,
          l.leader_name, l.phone,
          COUNT(p.id)::int AS total_peserta,
          COUNT(p.id) FILTER (WHERE p.status_code = 'VERIFIED')::int AS terverifikasi
        FROM public.lptks l
        JOIN public.villages v ON l.village_id = v.id
        LEFT JOIN public.participants p ON l.id = p.lptk_id AND p.deleted_at IS NULL
        WHERE l.deleted_at IS NULL
        GROUP BY l.id, v.name
        ORDER BY l.name ASC;
      `;
      const rows = await db.raw(sql);

      const headers = ['Kode LPTK', 'Nama LPTK', 'Desa', 'Pimpinan', 'Telepon', 'Total Peserta', 'Terverifikasi'];
      const lines = [headers.join(',')];
      for (const r of rows) {
        lines.push(
          [
            `"${r.kode_lptk}"`,
            `"${r.nama_lptk}"`,
            `"${r.nama_desa}"`,
            `"${r.leader_name}"`,
            `"${r.phone}"`,
            r.total_peserta,
            r.terverifikasi,
          ].join(',')
        );
      }

      await recordAuditLog({
        userId: user.id,
        actionCode: 'EXPORT_REPORT',
        entityType: 'lptk_report',
        newData: { type: 'lptks', count: rows.length },
      });

      return new NextResponse(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rekap_lptk_${Date.now()}.csv"`,
        },
      });
    }

    // Default to participants report
    const whereConditions: string[] = ['p.deleted_at IS NULL'];
    const queryParams: any[] = [];
    let pIndex = 1;

    if (competitionId) {
      whereConditions.push(`p.competition_id = $${pIndex}`);
      queryParams.push(competitionId);
      pIndex++;
    }

    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id) {
      whereConditions.push(`p.lptk_id = $${pIndex}`);
      queryParams.push(user.lptk_id);
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

    const headers = ['NIK', 'Nama', 'JK', 'Tempat Lahir', 'Tgl Lahir', 'Telepon', 'LPTK', 'Desa', 'Lomba', 'Status', 'Tgl Daftar'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push(
        [
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
        ].join(',')
      );
    }

    await recordAuditLog({
      userId: user.id,
      actionCode: 'EXPORT_REPORT',
      entityType: 'participant_report',
      newData: { type: 'participants', count: rows.length },
    });

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rekap_peserta_${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
