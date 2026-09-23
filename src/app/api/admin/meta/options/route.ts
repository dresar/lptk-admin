import { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requireAuth, AuthError } from '@/server/middlewares/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    // Query active master data in parallel
    const [roles, villages, lptks, competitions, categories, documentTypes] = await Promise.all([
      db.query`SELECT id, code, name FROM auth.roles ORDER BY name ASC`,
      db.query`SELECT id, code, name FROM public.villages WHERE deleted_at IS NULL ORDER BY name ASC`,
      db.query`SELECT id, code, name, village_id FROM public.lptks WHERE deleted_at IS NULL AND active = true ORDER BY name ASC`,
      db.query`SELECT id, name, period_year, status_code FROM public.competitions WHERE deleted_at IS NULL ORDER BY period_year DESC, name ASC`,
      db.query`SELECT id, competition_id, name, gender_code, age_min, age_max FROM public.categories WHERE deleted_at IS NULL AND active = true ORDER BY name ASC`,
      db.query`SELECT id, code, name, is_required FROM public.document_types WHERE deleted_at IS NULL AND active = true ORDER BY name ASC`,
    ]);

    const genders = [
      { code: 'MALE', label: 'Laki-laki' },
      { code: 'FEMALE', label: 'Perempuan' },
      { code: 'ANY', label: 'Semua' },
    ];

    const participantStatuses = [
      { code: 'DRAFT', label: 'Draf' },
      { code: 'SUBMITTED', label: 'Terkirim' },
      { code: 'IN_REVIEW', label: 'Ditinjau' },
      { code: 'VERIFIED', label: 'Terverifikasi' },
      { code: 'REVISION_REQUIRED', label: 'Perlu Revisi' },
      { code: 'REJECTED', label: 'Ditolak' },
    ];

    const competitionStatuses = [
      { code: 'DRAFT', label: 'Draf' },
      { code: 'OPEN', label: 'Dibuka' },
      { code: 'CLOSED', label: 'Ditutup' },
      { code: 'COMPLETED', label: 'Selesai' },
    ];

    return successResponse({
      roles,
      villages,
      lptks,
      competitions,
      categories,
      document_types: documentTypes,
      genders,
      participant_statuses: participantStatuses,
      competition_statuses: competitionStatuses,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
