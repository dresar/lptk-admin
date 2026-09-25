import { db } from '@/server/db/client';

export function getCategoryPrefix(categoryName: string): string {
  const n = (categoryName || '').toLowerCase();
  if (n.includes('fahmil')) return 'FQ';
  if (n.includes('syarhil')) return 'SQ';
  if (n.includes('rebana')) return 'RBN';
  if (n.includes('kaligrafi') || n.includes('khattil')) return 'MKQ';
  if (n.includes('1 juz')) return 'H1J';
  if (n.includes('5 juz')) return 'H5J';
  if (n.includes('10 juz')) return 'H10';
  if (n.includes('tartil')) return 'TRT';
  if (n.includes('tilawah')) return 'TLW';
  return 'MTQ';
}

export async function generateParticipantNumber(
  competitionId: string,
  categoryId: string,
  isCollective: boolean = false
): Promise<string> {
  // 1. Fetch category name
  const catRows = await db.query`
    SELECT name FROM public.categories WHERE id = ${categoryId} LIMIT 1;
  `;
  const catName = catRows[0]?.name || '';
  const prefix = getCategoryPrefix(catName);

  // 2. Count existing entries in this category
  let countSql: string;
  if (isCollective) {
    countSql = `
      SELECT COUNT(DISTINCT COALESCE(p.team_id::text, p.id::text))::int AS cnt
      FROM public.participants p
      JOIN public.participant_categories pc ON p.id = pc.participant_id
      WHERE p.competition_id = $1 AND pc.category_id = $2 AND p.deleted_at IS NULL;
    `;
  } else {
    countSql = `
      SELECT COUNT(DISTINCT p.id)::int AS cnt
      FROM public.participants p
      JOIN public.participant_categories pc ON p.id = pc.participant_id
      WHERE p.competition_id = $1 AND pc.category_id = $2 AND p.deleted_at IS NULL;
    `;
  }

  const countRes = await db.raw(countSql, [competitionId, categoryId]);
  let seq = (countRes[0]?.cnt || 0) + 1;

  // 3. Collision guard: Ensure generated number is unique in this competition
  let participantNumber = `${prefix}-${String(seq).padStart(2, '0')}`;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 50) {
    const checkSql = `
      SELECT id FROM public.participants 
      WHERE competition_id = $1 AND participant_number = $2 AND deleted_at IS NULL 
      LIMIT 1;
    `;
    const checkRes = await db.raw(checkSql, [competitionId, participantNumber]);
    if (!checkRes || checkRes.length === 0) {
      exists = false;
    } else {
      seq++;
      participantNumber = `${prefix}-${String(seq).padStart(2, '0')}`;
      attempts++;
    }
  }

  return participantNumber;
}
