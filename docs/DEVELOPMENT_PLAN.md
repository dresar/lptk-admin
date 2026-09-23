# DEVELOPMENT PLAN — LPTK Admin (`rocky`)

Berdasarkan `docs/AUDIT_REPORT.md`. Urutan = dampak. Effort: **S** ≤1 jam · **M** 1–4 jam · **L** >4 jam.
Kode mulai dari `0b134c5` (main). **Hindari** commit campur aduk antara perbaikan & pengembangan fitur.

---

## FASE 1 — Blocker & Kritis (keamanan, build, deploy)
> Syarat: deploy production HANYA setelah Fase 1 selesai.

| ID | Perbaikan | File terkait | Langkah konkret | Acceptance criteria | Effort |
|---|---|---|---|---|---|
| F1-01 (SEC-01) | **Login lockout/throttle** | `src/app/api/auth/login/route.ts`, `scripts/schema.sql` | Bacakan `auth.login_attempts`: blokir email/IP yang ≥ 5 gagal dalam 15 menit → 429 + backoff; opsional flag `lockout_until` di `auth.users`. Tambah migration. | Gagal 5× berturut → login ke-6 ditolak 15 menit; audit log mencatat `LOCKOUT` | M |
| F1-02 (SEC-02) | **Lengkapi `.env.example`** | `.env.example` | Tambah 7 key yang hilang (`S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ENDPOINT_URL_S3`, `NEON_AUTH_URL`, `NEON_JWKS_URL`) + beri placeholder & komentar "fill via Vercel dashboard, JANGAN commit nilai asli". | `git clone` + `cp .env.example .env` + build → tidak crash saat import `s3.ts` (cukup placeholder kosong yang jelas) | S |
| F1-03 (DEPLOY-01) | **Set 11 env vars di Vercel** | Vercel dashboard project `lptk-mahato` | Set semua env di DEPLOY-01 (encrypted, target production+preview+development). Ganti `SESSION_SECRET` dengan random 64-hex. Verifikasi via `vercel env ls` / API. | Deployment production live, login berhasil, `GET /api/admin/dashboard` 200 | S |
| F1-04 (BLD-01) | **ESLint config** | `.eslintrc.json` (next core-web-vitals + typescript) | Tambah config + deps dev; perbaiki temuan ringan. | `next lint` lulus non-interaktif (0 error) & bisa masuk CI | S |
| F1-05 (SEC-03) | **Zod untuk 5 route** | `roles/route.ts`, `roles/[id]/route.ts`, `roles/[id]/permissions/route.ts`, `settings/route.ts`, `profile/route.ts` + `src/server/validators/*` | Buat `roleSchema`, `settingsSchema`, `profileSchema`; ganti `req.json()` + check ad-hoc dengan `schema.safeParse`. | Semua route 400 dengan `VALIDATION_ERROR` yang konsisten pada input invalid | M |

## FASE 2 — Tinggi (hardening & konsistensi)

| ID | Perbaikan | File | Langkah | Acceptance | Effort |
|---|---|---|---|---|---|
| F2-01 (SEC-04) | **Whitelist column per-tabel untuk ORDER BY** | `src/server/utils/pagination.ts` + 15 route | `parseListParams(url, allowedColumns)` — validasi `sort` terhadap set kolom yang dimiliki tabel; fallback `created_at`. | `?sort=col_tidak_ada` → diabaikan (bukan 500); tambah unit test | M |
| F2-02 (UX-01) | **Buat `DESIGN_SYSTEM.md`** | repo root | Terapkan skill `ui-ux-kit`: token warna/spacing/typography dari Tailwind config; dokumentasi pola komponen (table, form, modal, action menu, empty state) + rule "anti-AI-slop"; jadikan referensi wajib semua halaman. | File ada + 3 halaman besar (participants, competitions, lptks) sudah sesuai token; review visual konsisten | M |
| F2-03 (SEC-05) | **Bersihkan unused deps** | `package.json` | Hapus `pg` & `@types/pg` (client = `@neondatabase/serverless`); pastikan `scripts/*.mjs` tidak pakai `pg` (memakai `pg` via neon pooler? verifikasi dulu: `grep -r "from 'pg'" scripts/`). | `npm ls pg` → empty; build masih lulus | S |
| F2-04 (FEAT-01/02) | **End-to-end dokumen + requirement** | pipeline upload S3 | Uji upload dokumen peserta → S3 + download presigned; isi `category_document_requirements` (migrasi seed atau UI admin). | 1 dokumen ter-upload & ter-download; verifikasi dokumen menolak peserta yang belum lengkap | M |
| F2-05 (BLD-02) | **Test suite awal** | `vitest` + `@testing-library/react` | Unit test: `pagination.ts`, `validators/*`, `response.ts`; integration test (supertest-ish) 3 route kritis (login, participants list, verification decision). | `npm test` lulus; threshold coverage utils ≥ 80% | L |

## FASE 3 — Fitur yang masih kurang (sekaligus roadmap)

| ID | Fitur | Catatan | Effort |
|---|---|---|---|
| F3-01 | **Laporan PDF** (PRD 21 hanya CSV) | `reports/export` → tambah opsi PDF (puppeteer serverless, atau client-side print CSS). | M |
| F3-02 | **Retensi `audit_logs` & `login_attempts`** (SEC-06/07) | Cron/branch-level cleanup: hapus > 90 hari (audit) & > 30 hari (login_attempts); `recordAuditLog` tambah log terpusat (structured log + metric gagal). | S |
| F3-03 | **Monitoring/alert Vercel + Neon** | Alert: build gagal, 5xx > threshold (Vercel alerts), storage Neon free-plan (dashboard), error S3. | S |
| F3-04 | **UI a11y pass** (UX-02) | Label semua input, focus trap di modal, kontras (WCAG AA) pada warna Tailwind, keyboard nav di table + action menu. Verifikasi dengan `react-aria` / audit Lighthouse. | M |
| F3-05 | **Detail pages: verifikasi konsistensi** (hasil commit `0b134c5`) | `competitions/[id]`, `lptks/[id]`, `villages/[id]` + `action-menu`/`column-toggle` → pastikan lolos lint/test setelah F1-04/F2-05 (belum ada pengujian). | S |

## FASE 4 — Polish

| ID | Item | Effort |
|---|---|---|
| F4-01 | Dark mode opsional (token Tailwind) | M |
| F4-02 | Virtualization table jika data > 1000 baris | S |
| F4-03 | i18n framework (jika perlu bahasa selain ID) | L |
| F4-04 | Kolom legacy `participant_documents.file_data` (bytea) → rencana deprecation ke S3-only | S |

---

## Checklist SEBELUM PRODUCTION
- [ ] F1-01..F1-05 selesai + teruji
- [ ] 11 env vars ter-set di Vercel (DATABASE_URL, SESSION_SECRET*random, NODE_ENV, NEXT_PUBLIC_CDN_BASE_URL, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_ENDPOINT_URL_S3, NEON_AUTH_URL, NEON_JWKS_URL)
- [ ] `next lint` lulus; `tsc --noEmit` 0 error; build lulus
- [ ] Repo GitHub **public** (syarat jsDelivr CDN, DEPLOY-02) + asset ter-push
- [ ] Login lockout aktif; tes brute-force sederhana
- [ ] Backup: Neon PITR (retensi 6 jam aktif) + dump rutin `audit_logs`/`participants` (ops. cron)
- [ ] Monitoring: Vercel alerts 5xx + budget storage Neon free-plan + log S3
- [ ] Smoke test end-to-end di preview deployment: login → dashboard → upload dokumen → verifikasi → laporan
- [ ] Update `.env.example` sebagai source-of-truth env (dokumentasi deploy)
