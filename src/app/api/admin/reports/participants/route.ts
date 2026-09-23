import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requirePermission, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission('report.read');
    const searchParams = req.nextUrl.searchParams;
    const competitionId = searchParams.get('competition_id');

    let whereClause = 'p.deleted_at IS NULL';
    const params: any[] = [];
    if (competitionId) {
      whereClause += ' AND p.competition_id = $1';
      params.push(competitionId);
    }
    if (user.role_code === 'OPERATOR_LPTK' && user.lptk_id) {
      whereClause += ` AND p.lptk_id = '${user.lptk_id}'`;
    }

    const sql = `
      SELECT 
        p.status_code,
        p.gender_code,
        COUNT(*)::int AS total
      FROM public.participants p
      WHERE ${whereClause}
      GROUP BY p.status_code, p.gender_code;
    `;

    const rows = await db.raw(sql, params);
    return successResponse(rows);
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
