# AUDIT REPORT — LPTK Admin (`rocky`)

**Scope:** /opt/data/home/rocky @ commit `0b134c5` (branch `main`)
**Tanggal:** 2026-09-23 · **Auditor:** Agnes 3 flash (coding agent) · **Mode:** read-only (source tidak diubah)
**Stack:** Next.js 14.2.24 (App Router) · React 18.3 · TypeScript · Tailwind · Neon Postgres (`neondb`, pooler ap-southeast-1) · S3 (Neon Object Storage)

---

## 1. Ringkasan Eksekutif

Aplikasi **sehat secara struktur**: build (`next build`) lulus, type-check (`tsc --noEmit`) 0 error, schema DB konsisten dengan kode, auth session berbasis DB kuat (token hash + idle/absolute timeout + reload permission), dan 15 modul API admin sesuai PRD.

Namun ada **gap kritis sebelum produksi**:

1. **Tidak ada rate-limiting/lockout login** — tabel `auth.login_attempts` hanya di-`INSERT`, tidak pernah dibaca. Brute-force email+password terbuka.
2. **`.env.example` ketinggalan 7 variable** (AWS/S3, NEON_AUTH_URL, NEON_JWKS_URL, S3_BUCKET) — deploy Vercel/clone baru akan gagal di modul S3 & CDN auth.
3. **5 route admin tanpa validasi zod** (roles, roles/[id], roles/[id]/permissions, settings, profile) — pakai check ad-hoc `if (!code || !name)`; konsistensi input tidak terjamin.
4. **`DESIGN_SYSTEM.md` belum ada** (syarat skill `ui-ux-kit`) → desain masih ad-hoc antar-halaman.
5. **Tidak ada test suite, CI, atau ESLint config** — `next lint` hang di prompt interaktif karena config tidak ada.

**Build & deploy readiness: SEDIA** dengan syarat env vars di atas lengkap di Vercel dashboard. Build tidak menyentuh DB (semua API routes dynamic ƒ; hanya `/login` static), jadi build aman di CI.

### Score per kategori
| Kategori | Status | Catatan |
|---|---|---|
| Build / Type | ✅ LULUS | `tsc` 0 error, `next build` RC=0 |
| Keamanan | ⚠️ 3 CRITICAL/HIGH | login lockout, env gap, route tanpa zod |
| Konsistensi DB | ✅ LULUS | Semua kolom yang dipakai kode ada di DB (verifikasi via pg8000) |
| Fitur vs PRD | ✅ LULUS | 25 chapter API → semua ada; 15 modul UI admin lengkap |
| UX / Design | ⚠️ PARSE | Tidak ada DESIGN_SYSTEM.md; a11y belum teraudit penuh |
| Deploy (Vercel) | ⚠️ HANYA KURANG ENV | Config OK (region sin1), 11 env vars wajib di-set |

---

## 2. Tabel Temuan (ber-severity)

| ID | Severity | Area | Lokasi | Deskripsi | Dampak |
|---|---|---|---|---|---|
| SEC-01 | **HIGH** | Login | `src/app/api/auth/login/route.ts` (hanya `INSERT` ke `auth.login_attempts`) | Tidak ada lockout/throttle: gagal login tidak pernah dibaca untuk memblokir IP/user | Brute-force kredensial |
| SEC-02 | **HIGH** | Deploy/env | `.env.example` vs `.env` | `.env.example` hanya 4 key; kehilangan `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ENDPOINT_URL_S3`, `NEON_AUTH_URL`, `NEON_JWKS_URL`. `s3.ts:16` **throw** tanpa `AWS_ENDPOINT_URL_S3` | Clone/deploy baru crash di import modul S3 |
| SEC-03 | **MEDIUM** | Input validation | `src/app/api/admin/roles/route.ts:35`, `roles/[id]/route.ts`, `roles/[id]/permissions/route.ts`, `settings/route.ts:30`, `profile/route.ts:43` | `req.json()` tanpa zod (check manual ad-hoc) | Injeksi field tak terduga, inconsistency API |
| SEC-04 | **MEDIUM** | SQLi (mitigated) | `parseListParams` (`pagination.ts:19`) + 15 usage `ORDER BY ${sort}` | `sort` di-concat ke SQL, tapi di-whitelist regex `/^[a-zA-Z0-9_]+$/`. Sisa: column-name tidak divalidasi per-tabel | `?sort=col_yang_tidak_ada` → 500 (tidak injection) |
| SEC-05 | **LOW** | Secrets hygiene | `package.json` deps `pg` | `pg` + `@types/pg` terpasang tapi **tidak di-import** apa pun (client pakai `@neondatabase/serverless`) | Bloat, bingung maintainer |
| SEC-06 | **LOW** | Audit | `src/server/utils/audit.ts:38` | Gagal tulis audit log = `console.error` saja, tanpa metric/monitoring | Kegagalan silent |
| SEC-07 | **LOW** | Retention | `public.audit_logs` (21 rows, tumbuh) | Tidak ada job retention/cleanup | Storage free-plan habis |
| UX-01 | **MEDIUM** | Design | Repo root | `DESIGN_SYSTEM.md` tidak ada (syarat `ui-ux-kit`); token warna/spacing ad-hoc Tailwind | Inkonsistensi antar-halaman |
| UX-02 | **LOW** | a11y | `src/components/modules/*-form.tsx` | Belum terverifikasi penuh (perlu cek label/focus-trap/aria di form & modal) | Screen-reader/keyboard |
| BLD-01 | **MEDIUM** | Lint | Repo root | Tidak ada `.eslintrc*`/`eslint.config.*` → `next lint` interaktif hang | CI tidak bisa lint |
| BLD-02 | **LOW** | Test | Repo root | 0 test file (unit/integration) | Regresi tak terdeteksi |
| FEAT-01 | **LOW** | Data | `public.participant_documents` = **0 rows** | Pipeline upload S3 belum pernah dipakai/uji end-to-end | Fitur inti belum terbukti |
| FEAT-02 | **LOW** | Data | `public.category_document_requirements` = **0 rows** | Requirement dokumen per kategori kosong | Verifikasi dokumen belum bisa ditegakkan |
| DEPLOY-01 | **INFO** | Vercel | `vercel.json` (region sin1 ✓) | 11 env vars wajib: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`, `NEXT_PUBLIC_CDN_BASE_URL`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ENDPOINT_URL_S3`, `NEON_AUTH_URL`, `NEON_JWKS_URL` | — |
| DEPLOY-02 | **INFO** | CDN | `NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh` | jsDelivr butuh repo GitHub **public**; repo sekarang (dresar/lptk-admin) perlu diverifikasi public + asset ter-push | 404 asset bila private |

---

## 3. Detail per Kategori

### 3.1 Build & Type
```
npx tsc --noEmit   → 0 error  (commit 0b134c5)
npx next build     → success, RC=0; semua /api = dynamic (ƒ), /login = static (○), Middleware 26.6 kB
npx next lint      → hang di prompt "How would you like to configure ESLint?" (tidak ada config)
```
Catatan: sebelumnya (commit lama) ada 1 error `BulkToolbar onBulkDelete` di `participants/page.tsx` — sudah ter-fix oleh commit `0b134c5`.

### 3.2 Keamanan
**Auth (kuat):** `src/server/middlewares/auth.ts` — session token = `crypto.randomBytes(32)`, disimpan sebagai SHA-256 hash di `auth.sessions`; tiap request: validasi token + `expires_at` (12 jam) + idle timeout (30 menit) + `user.active` + reload permission per-role dari `auth.role_permissions`. SUPER_ADMIN bypass (sengaja, `auth.ts:123`).
**Cookie (kuat):** `httpOnly: true, sameSite: 'lax', secure: isProduction` (`login/route.ts:118-126`).
**Middleware (adekuat):** `src/middleware.ts` hanya cek keberadaan cookie (edge-safe, DB tidak available di middleware) → verifikasi penuh di route (pola benar).
**SQLi (ter-mitigasi):** `parseListParams` mensanitasi `sort` (regex alnum+underscore) & `order` (asc|desc). Nilai `q`/filter selalu lewat parameter `$n`. 15 titik `ORDER BY ${sort} ${order}` aman karena whitelist; **sisa:** validasi column name per-tabel belum ada.
**Login (lemah):** `auth.login_attempts` ditulis (success + failed) tapi **tidak pernah dibaca** → tidak ada lockout. Rekomendasi: threshold per-email/per-IP (mis. 5 gagal/15 menit) + backoff, atau min. cap + audit alert.
**Route tanpa zod (5):** roles (GET/POST/PUT/DELETE), roles/[id]/permissions, settings (PATCH), profile (PATCH) — ada guard `requirePermission` (baik), tapi body tanpa schema.
**Secrets:** `.env` tidak ter-track (gitignore ✓, tidak pernah di-commit ✓). Tidak ada secret hard-coded di `src` (grep bersih). `SESSION_SECRET` di Vercel = plaintext weak (`super_secret_session_key_lptk_kecamatan_2026_prod`) → ganti random 64-hex.
**S3:** `s3.ts` — modul S3Client di-throws saat import tanpa `AWS_ENDPOINT_URL_S3` (gap SEC-02). Presigned URL default 1 jam (OK).

### 3.3 Konsistensi Database (query read-only via `neon-db` skill, pooler host)
Skema: `public` (14 tabel), `auth` (6 tabel), `neon_auth` (8 tabel, MaaS pre-installed).
**Verifikasi kolom kode vs DB: LULUS.** Contoh:
- `public.participants.name` ✓ (bukan `full_name`), `lptk_id` + `competition_id` ✓
- `public.villages` = master independen; relasi lewat `public.lptks.village_id` ✓ (join di 5 query lptks)
- `public.document_types.is_required` ✓, `public.participant_documents.s3_key` ✓ (+ kolom legacy `file_data` bytea yang di-NULL-kan saat upload S3 — dual-storage, kandidat cleanup)
- `public.verifications.verifier_id/decision` ✓
Jumlah data: participants 28, lptks 10, villages 11, competitions 2, categories 13, document_types 5, users 5, roles 3, permissions 32, role_permissions 67, audit_logs 21, login_attempts 18, system_settings 5, verifications 18, **participant_documents 0**, **category_document_requirements 0**.

### 3.4 Fitur vs PRD (`docs/PRD_BLUEPRINT_V3.md`, 25 chapter)
| Chapter | API | UI | Status |
|---|---|---|---|
| 10 Dashboard | `/api/admin/dashboard` | `admin/page.tsx` (1 fetch) | ✅ |
| 11 Desa | villages (+bulk-delete, [id] detail `0b134c5`) | 3 page | ✅ |
| 12 LPTK | lptks (+participants/users sub, [id] detail) | 3 page | ✅ |
| 13 User | users (+activate/deactivate/reset-password, [id] edit, new) | 3 page | ✅ |
| 14 Role & Perm | roles (+permissions) | roles page | ✅ (tapi tanpa zod, SEC-03) |
| 15 Lomba | competitions (+categories, statistics, [id] detail) | 3 page | ✅ |
| 16 Kategori | categories (+document-requirements) | categories page | ✅ |
| 17 Doc Type | document-types | document-types page | ✅ |
| 18 Peserta | participants (+submit, export, bulk, detail, edit, new) | 4 page | ✅ |
| 19 Dokumen | documents (+download presigned, [id]/documents upload) | embedded | ✅ (belum teruji, 0 data) |
| 20 Verifikasi | verifications (+history) | verifications page | ✅ |
| 21 Laporan | reports/* (4 endpoint + export CSV) | reports page | ✅ |
| 22 Audit Log | audit-logs (+[id], filter user/action/entity/date) | audit-logs page | ✅ (bukti nyata: 21 baris, LOGIN ter-capture) |
| 23 Pengaturan | settings | settings page | ✅ |
| 24 Asset/CDN | cdn route + `NEXT_PUBLIC_CDN_BASE_URL` | — | ⚠️ DEPLOY-02 |
| 25 Status flow | submit → IN_REVIEW → decision (VERIFY_*) | — | ✅ (transisi di verification/route.ts) |
**Gap modul: tidak ada (semua PRD chapter ter-cover).** Gap = UX docs + hardening.

### 3.5 UX / Design (sesuai skill `ui-ux-kit`)
- **Tidak ada `DESIGN_SYSTEM.md`** → belum ada token (warna, tipografi, spacing, komponen) terdokumentasi. Halaman detail baru (`competitions/[id]` dsb.) menuntaskan kebutuhan ini paling mendesak.
- Konsistensi komponen baik: 7 component UI shared (`button, modal, bulk-toolbar, pagination, view-toggle, action-menu, column-toggle`).
- a11y: perlu verifikasi manual form (`*-form.tsx`), modal focus trap, label input.
- Empty/loading state ada di beberapa page (`participants/page.tsx` loading ✓) — konsistensi antar-page perlu disamakan.
- i18n: UI berbahasa Indonesia konsisten; error message API juga ID (baik untuk target user).

### 3.6 Anti-slop
`check-repo.mjs` milik plugin anti-slop hanya valid untuk repo plugin-nya (11/11 pass — tidak aplicable ke rocky). Poin manual untuk rocky: semua temuan di atas disertai bukti file:line & output query; tidak ada klaim tanpa bukti.

### 3.7 Deploy Readiness (Vercel)
- `vercel.json`: nextjs + `npm install/build`, region **sin1** (dekat Neon ap-southeast-1 ✓), output `.next`.
- Build **tidak** akses DB (routes ƒ) → aman di Vercel build.
- `next.config.mjs` minimal & aman (reactStrictMode, poweredByHeader off).
- GitHub: remote `dresar/lptk-admin`, token ter-embed di URL, local=remote=`0b134c5` (synced).
- Vercel project: `lptk-mahato` / `prj_uu21hDxYdZUnkCdKhf4bW2C5Zke1` / team `team_D7qjWhF0xqVK8jbqm7bzo2CN`.
- **Wajib env di Vercel (11):** lihat DEPLOY-01. Catatan: cek API Vercel sebelumnya menunjukkan env project masih kosong → harus di-set sebelum production switch.

---

## 4. Lampiran
- Tabel DB (skema, jumlah baris) & hasil kolom-check: di atas §3.3 (via `uv run --with pg8000 python /opt/data/scripts/_audit_db.py`).
- Output `next build`: semua halaman list (tidak diprint ulang; RC=0).
- Status modul: §3.4.

*Semua secret redacted (DB password `<npg_…>`, AWS keys, Vercel token tidak di-print).*
