# PRD & BLUEPRINT
## SISTEM PENDATAAN DAN VERIFIKASI PESERTA LOMBA LPTK KECAMATAN
### ADMIN PANEL — BACKEND FIRST — NEON + GITHUB CDN

**Versi:** 3.0  
**Status:** BASELINE / DIKUNCI  
**Fokus:** Admin Panel + Backend API  
**Platform:** Web Application  
**Framework:** Next.js  
**Language:** TypeScript  
**Database:** Neon PostgreSQL  
**Authentication:** Neon Database-Backed Auth  
**Frontend:** Admin Panel monolith dalam Next.js  
**UI Theme:** Monochrome Black/White  
**Icon:** SVG library gratis  
**CDN:** GitHub / jsDelivr  
**Deployment:** Vercel  
**Source Code:** GitHub  

---

# 1. KEPUTUSAN UTAMA

Dokumen ini mengganti PRD sebelumnya dan mengunci keputusan berikut:

1. Sistem dibangun sebagai satu aplikasi Next.js.
2. Backend dan frontend berada dalam satu repository dan satu aplikasi.
3. Pengembangan difokuskan ke backend terlebih dahulu.
4. Semua operasi admin panel memakai API internal.
5. Tidak ada halaman publik.
6. Halaman hanya:
   - login;
   - admin panel setelah login.
7. Semua modul CRUD wajib berfungsi.
8. UI admin panel wajib mobile-first.
9. Tema UI hitam-putih.
10. Dilarang memakai warna neon.
11. Dilarang tampil berlebihan seperti template AI.
12. Tampilan standar industri, bersih, fungsional.
13. Button maksimal 1 kata.
14. Sidebar maksimal 1 kata.
15. List tidak menampilkan deskripsi panjang.
16. Icon wajib memakai SVG dari library gratis.
17. Create dan edit memakai form yang sama.
18. Jika form lebih dari 3 field, wajib halaman khusus.
19. Jika form hanya 2 field, boleh modal.
20. Hapus massal wajib ada.
21. Pagination default 20 item.
22. List memiliki mode list dan grid.
23. CDN menggunakan GitHub / jsDelivr untuk asset publik.
24. Storage dokumen privat tidak boleh dipublikasikan ke GitHub CDN secara sembarangan.

---

# 2. RUANG LINGKUP

## 2.1 Termasuk

- Authentication admin panel.
- Authorization role dan permission.
- API admin panel.
- Dashboard admin.
- Master Desa.
- Master LPTK.
- User.
- Role.
- Permission.
- Event / Lomba.
- Kategori Lomba.
- Document Type.
- Peserta.
- Dokumen Peserta.
- Verifikasi.
- Laporan.
- Audit Log.
- Pengaturan Sistem.
- Asset CDN berbasis GitHub.
- Bulk delete.
- Pagination.
- List/grid view.
- Mobile responsive admin UI.

## 2.2 Tidak Termasuk

- Landing page.
- Website publik.
- Portal peserta publik.
- Registrasi user mandiri.
- Halaman publik pencarian peserta.
- Notifikasi WhatsApp.
- Notifikasi email.
- Import Excel.
- Export PDF kompleks.
- QR Code.
- Mobile app native.

Fitur di atas masuk fase lanjutan dan tidak boleh mengganggu MVP.

---

# 3. ARSITEKTUR SISTEM

```text
Google AI Studio
       ↓
Next.js + TypeScript
       ↓
GitHub
       ↓
Vercel
       ↓
Neon PostgreSQL
       ├── Database
       ├── Auth Data
       ├── Permission
       ├── Audit Log
       ├── Configuration
       └── Private Document Storage
       
GitHub CDN
       ├── Logo
       ├── Icon
       ├── Empty State
       └── Public Asset
```

## 3.1 Prinsip Arsitektur

1. Next.js menjadi satu aplikasi untuk frontend admin dan backend API.
2. Backend memakai Route Handlers Next.js.
3. Frontend admin memakai Server Component dan Client Component secukupnya.
4. Semua data bisnis diambil dari database.
5. Semua aksi penting dicatat ke audit log.
6. Tidak ada hardcode data bisnis.
7. Tidak ada halaman publik.
8. Asset statis publik diambil dari GitHub CDN.
9. Dokumen privat tidak disimpan sebagai file publik.

---

# 4. STRUKTUR FOKUS BACKEND

Struktur backend wajib rapi.

```text
src/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── admin/
│   │   │   ├── meta/
│   │   │   ├── dashboard/
│   │   │   ├── villages/
│   │   │   ├── lptks/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── competitions/
│   │   │   ├── categories/
│   │   │   ├── document-types/
│   │   │   ├── participants/
│   │   │   ├── documents/
│   │   │   ├── verifications/
│   │   │   ├── reports/
│   │   │   ├── audit-logs/
│   │   │   ├── settings/
│   │   │   └── cdn/
│   │
│   ├── login/
│   └── admin/
│
├── server/
│   ├── repositories/
│   ├── services/
│   ├── validators/
│   ├── middlewares/
│   └── utils/
│
├── components/
│
├── lib/
│
└── types/
```

---

# 5. PRINSIP BACKEND-FIRST

Semua fitur admin panel wajib memiliki endpoint API yang jelas.

Frontend tidak boleh:

- query database langsung dari browser;
- menyimpan logika bisnis penting di client;
- menentukan hak akses final di client;
- mengakses file privat tanpa endpoint resmi.

Backend wajib:

- validasi input;
- cek authentication;
- cek permission;
- cek kepemilikan data;
- mencatat audit log;
- mengembalikan response standar;
- menangani error dengan aman.

---

# 6. STANDAR API

## 6.1 Base URL

Semua API admin berada di bawah:

```text
/api/admin
```

Auth berada di:

```text
/api/auth
```

## 6.2 Format Response Sukses

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## 6.3 Format Response List

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_items": 120,
    "total_pages": 6
  }
}
```

## 6.4 Format Response Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid."
  }
}
```

## 6.5 Query Parameter List

Semua endpoint list wajib mendukung:

```text
page
q
sort
order
```

Default:

```text
page = 1
page_size = 20
sort = created_at
order = desc
```

Contoh:

```text
GET /api/admin/participants?page=1&q=Ahmad&status_code=SUBMITTED
```

## 6.6 Bulk Delete Standard

Request:

```json
{
  "ids": [
    "uuid-1",
    "uuid-2"
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "deleted": 2,
    "failed": []
  }
}
```

Jika ada gagal:

```json
{
  "success": true,
  "data": {
    "deleted": 1,
    "failed": [
      {
        "id": "uuid-2",
        "reason": "DATA_REFERENCED"
      }
    ]
  }
}
```

---

# 7. AUTHENTICATION

## 7.1 Konsep

Authentication menggunakan database-backed auth di Neon PostgreSQL.

Data auth tersimpan di:

```text
auth.users
auth.roles
auth.permissions
auth.role_permissions
auth.sessions
auth.login_attempts
```

## 7.2 Auth Endpoints

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| POST | `/api/auth/login` | public | Login |
| POST | `/api/auth/logout` | auth | Logout |
| GET | `/api/auth/me` | auth | Ambil user aktif |
| POST | `/api/auth/change-password` | auth | Ganti password |

## 7.3 Login Request

```json
{
  "email": "admin@mail.com",
  "password": "password"
}
```

## 7.4 Login Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@mail.com",
      "full_name": "Admin",
      "role_code": "SUPER_ADMIN"
    }
  }
}
```

## 7.5 Ketentuan Session

- Session disimpan di database.
- Token disimpan sebagai hash.
- Cookie HttpOnly.
- Cookie Secure.
- Cookie SameSite.
- Session absolute timeout: 12 jam.
- Session idle timeout: 30 menit.
- Logout menghapus session di database.

---

# 8. AUTHORIZATION

## 8.1 Role Utama

```text
SUPER_ADMIN
ADMIN_KECAMATAN
OPERATOR_LPTK
```

## 8.2 Permission

Permission disimpan di database.

Contoh:

```text
dashboard.read
village.read
village.write
lptk.read
lptk.write
user.read
user.write
role.read
role.write
competition.read
competition.write
category.read
category.write
participant.read
participant.write
participant.submit
document.read
document.write
document.download
document.delete
verification.read
verification.decide
report.read
report.export
audit.read
setting.read
setting.write
cdn.read
cdn.write
```

## 8.3 Menu Sidebar

Menu sidebar diambil dari:

```text
GET /api/admin/meta/menu
```

Menu tidak boleh hardcode berdasarkan role di frontend.

---

# 9. META & OPTIONS API

Endpoint untuk mengambil konfigurasi UI admin.

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/meta/menu` | auth | Ambil menu sidebar |
| GET | `/api/admin/meta/options` | auth | Ambil option global |
| GET | `/api/admin/dashboard` | dashboard.read | Statistik dashboard |

## 9.1 Options

Endpoint options mengembalikan:

- roles;
- statuses;
- genders;
- event statuses;
- participant statuses;
- document statuses;
- document types;
- lptks;
- villages;
- competitions;
- categories.

Options dipakai untuk select/filter.

---

# 10. DASHBOARD API

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/dashboard` | dashboard.read | Statistik |

Response contoh:

```json
{
  "success": true,
  "data": {
    "total_villages": 20,
    "total_lptks": 20,
    "total_users": 25,
    "total_participants": 350,
    "total_submitted": 45,
    "total_in_review": 10,
    "total_verified": 280,
    "total_revision_required": 20,
    "total_rejected": 5,
    "storage_used_bytes": 104857600
  }
}
```

---

# 11. MASTER DESA API

## 11.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/villages` | village.read | List desa |
| POST | `/api/admin/villages` | village.write | Tambah desa |
| GET | `/api/admin/villages/:id` | village.read | Detail desa |
| PATCH | `/api/admin/villages/:id` | village.write | Edit desa |
| DELETE | `/api/admin/villages/:id` | village.write | Hapus desa |
| POST | `/api/admin/villages/bulk-delete` | village.write | Hapus massal |

## 11.2 Field Form

```text
code
name
```

Karena hanya 2 field, form desa boleh memakai modal.

## 11.3 List Query

```text
GET /api/admin/villages?page=1&q=Desa
```

## 11.4 Aturan Hapus

- Desa yang sudah memiliki LPTK tidak boleh dihapus permanen.
- Sistem melakukan soft delete atau menolak hapus.
- UI menampilkan error singkat.

---

# 12. MASTER LPTK API

## 12.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/lptks` | lptk.read | List LPTK |
| POST | `/api/admin/lptks` | lptk.write | Tambah LPTK |
| GET | `/api/admin/lptks/:id` | lptk.read | Detail LPTK |
| PATCH | `/api/admin/lptks/:id` | lptk.write | Edit LPTK |
| DELETE | `/api/admin/lptks/:id` | lptk.write | Hapus LPTK |
| POST | `/api/admin/lptks/bulk-delete` | lptk.write | Hapus massal |
| GET | `/api/admin/lptks/:id/users` | lptk.read | User LPTK |
| GET | `/api/admin/lptks/:id/participants` | participant.read | Peserta LPTK |

## 12.2 Field Form

```text
village_id
code
name
leader_name
phone
address
active
```

Karena lebih dari 3 field, form LPTK wajib halaman khusus.

## 12.3 Frontend Route

```text
/admin/lptks/new
/admin/lptks/:id/edit
```

---

# 13. USER API

## 13.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/users` | user.read | List user |
| POST | `/api/admin/users` | user.write | Tambah user |
| GET | `/api/admin/users/:id` | user.read | Detail user |
| PATCH | `/api/admin/users/:id` | user.write | Edit user |
| DELETE | `/api/admin/users/:id` | user.write | Hapus user |
| POST | `/api/admin/users/bulk-delete` | user.write | Hapus massal |
| POST | `/api/admin/users/:id/reset-password` | user.write | Reset password |
| POST | `/api/admin/users/:id/activate` | user.write | Aktifkan user |
| POST | `/api/admin/users/:id/deactivate` | user.write | Nonaktifkan user |

## 13.2 Field Form

```text
full_name
email
role_id
lptk_id
active
must_change_password
```

Form user wajib halaman khusus.

## 13.3 Frontend Route

```text
/admin/users/new
/admin/users/:id/edit
```

---

# 14. ROLE & PERMISSION API

## 14.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/roles` | role.read | List role |
| POST | `/api/admin/roles` | role.write | Tambah role |
| GET | `/api/admin/roles/:id` | role.read | Detail role |
| PATCH | `/api/admin/roles/:id` | role.write | Edit role |
| DELETE | `/api/admin/roles/:id` | role.write | Hapus role |
| GET | `/api/admin/roles/:id/permissions` | role.read | Permission role |
| PATCH | `/api/admin/roles/:id/permissions` | role.write | Ubah permission |
| GET | `/api/admin/permissions` | permission.read | List permission |

## 14.2 Aturan

- Role sistem tidak boleh dihapus.
- Permission disimpan di database.
- Perubahan permission dicatat di audit log.

---

# 15. EVENT / LOMBA API

## 15.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/competitions` | competition.read | List event |
| POST | `/api/admin/competitions` | competition.write | Tambah event |
| GET | `/api/admin/competitions/:id` | competition.read | Detail event |
| PATCH | `/api/admin/competitions/:id` | competition.write | Edit event |
| DELETE | `/api/admin/competitions/:id` | competition.write | Hapus event |
| POST | `/api/admin/competitions/bulk-delete` | competition.write | Hapus massal |
| GET | `/api/admin/competitions/:id/categories` | category.read | Kategori event |
| GET | `/api/admin/competitions/:id/statistics` | competition.read | Statistik event |

## 15.2 Field Form

```text
name
description
period_year
status_code
registration_open_at
registration_close_at
```

Form event wajib halaman khusus.

## 15.3 Frontend Route

```text
/admin/competitions/new
/admin/competitions/:id/edit
```

---

# 16. KATEGORI LOMBA API

## 16.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/categories` | category.read | List kategori |
| POST | `/api/admin/categories` | category.write | Tambah kategori |
| GET | `/api/admin/categories/:id` | category.read | Detail kategori |
| PATCH | `/api/admin/categories/:id` | category.write | Edit kategori |
| DELETE | `/api/admin/categories/:id` | category.write | Hapus kategori |
| POST | `/api/admin/categories/bulk-delete` | category.write | Hapus massal |
| GET | `/api/admin/categories/:id/document-requirements` | category.read | Dokumen wajib |
| PATCH | `/api/admin/categories/:id/document-requirements` | category.write | Ubah dokumen wajib |

## 16.2 Query List

```text
GET /api/admin/categories?competition_id=uuid
```

## 16.3 Field Form

```text
competition_id
name
gender_code
age_min
age_max
requirements
active
```

Form kategori wajib halaman khusus.

---

# 17. DOCUMENT TYPE API

## 17.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/document-types` | document.read | List jenis dokumen |
| POST | `/api/admin/document-types` | document.write | Tambah jenis |
| PATCH | `/api/admin/document-types/:id` | document.write | Edit jenis |
| DELETE | `/api/admin/document-types/:id` | document.write | Hapus jenis |
| POST | `/api/admin/document-types/bulk-delete` | document.write | Hapus massal |

## 17.2 Field Form

```text
code
name
is_required
active
```

---

# 18. PESERTA API

Ini modul inti.

## 18.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/participants` | participant.read | List peserta |
| POST | `/api/admin/participants` | participant.write | Tambah peserta |
| GET | `/api/admin/participants/:id` | participant.read | Detail peserta |
| PATCH | `/api/admin/participants/:id` | participant.write | Edit peserta |
| DELETE | `/api/admin/participants/:id` | participant.write | Hapus peserta |
| POST | `/api/admin/participants/bulk-delete` | participant.write | Hapus massal |
| POST | `/api/admin/participants/:id/submit` | participant.submit | Submit peserta |
| GET | `/api/admin/participants/:id/categories` | participant.read | Kategori peserta |
| POST | `/api/admin/participants/:id/categories` | participant.write | Tambah kategori |
| DELETE | `/api/admin/participants/:id/categories/:categoryId` | participant.write | Hapus kategori |
| GET | `/api/admin/participants/:id/documents` | document.read | Dokumen peserta |
| POST | `/api/admin/participants/:id/documents` | document.write | Upload dokumen |
| GET | `/api/admin/participants/:id/verifications` | verification.read | Riwayat verifikasi |
| GET | `/api/admin/participants/export` | report.export | Export list |

## 18.2 Filter List

```text
page
q
competition_id
lptk_id
village_id
category_id
gender_code
status_code
```

Contoh:

```text
GET /api/admin/participants?status_code=SUBMITTED&lptk_id=uuid&page=1
```

## 18.3 Form Peserta

Field:

```text
competition_id
lptk_id
name
nik
gender_code
birth_place
birth_date
address
phone
school_or_institution
father_name
mother_name
categories
```

Form peserta wajib halaman khusus.

## 18.4 Frontend Route

```text
/admin/participants/new
/admin/participants/:id/edit
/admin/participants/:id
```

## 18.5 Aturan Peserta

- Operator hanya dapat mengakses peserta milik LPTK sendiri.
- Admin kecamatan dapat mengakses semua peserta.
- Super admin dapat mengakses semua.
- NIK duplikat wajib terdeteksi.
- Peserta draft bisa diedit.
- Peserta submitted tidak bisa diedit bebas.
- Peserta revision_required bisa diperbaiki.
- Peserta verified tidak boleh diubah operator.
- Submit hanya boleh jika dokumen wajib lengkap.

---

# 19. DOKUMEN API

## 19.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/documents/:id` | document.read | Detail dokumen |
| GET | `/api/admin/documents/:id/download` | document.download | Unduh dokumen |
| DELETE | `/api/admin/documents/:id` | document.delete | Hapus dokumen |
| POST | `/api/admin/documents/bulk-delete` | document.delete | Hapus massal |
| POST | `/api/admin/documents/:id/replace` | document.write | Ganti dokumen |

## 19.2 Upload Dokumen

Upload dilakukan melalui endpoint peserta:

```text
POST /api/admin/participants/:id/documents
```

Body multipart:

```text
file
document_type_id
```

## 19.3 Validasi Upload

- Max file size dari database.
- MIME type dari database.
- Magic bytes diperiksa.
- Kuota peserta diperiksa.
- Kuota event diperiksa.
- SHA-256 dihitung.
- Audit log dicatat.

---

# 20. VERIFIKASI API

## 20.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/verifications` | verification.read | Antrian verifikasi |
| GET | `/api/admin/verifications/history` | verification.read | Riwayat |
| POST | `/api/admin/participants/:id/verification` | verification.decide | Keputusan |
| GET | `/api/admin/participants/:id/verification` | verification.read | Riwayat peserta |

## 20.2 Decision Request

```json
{
  "decision": "REVISION_REQUIRED",
  "note": "Dokumen buram."
}
```

Decision valid:

```text
VERIFIED
REVISION_REQUIRED
REJECTED
IN_REVIEW
```

## 20.3 Aturan

- Decision harus mengikuti tabel transisi status.
- REVISION_REQUIRED wajib memiliki note.
- REJECTED wajib memiliki note.
- Setiap decision dicatat ke audit log.
- Operator dapat melihat note jika status perlu perbaikan.

---

# 21. LAPORAN API

## 21.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/reports/participants` | report.read | Rekap peserta |
| GET | `/api/admin/reports/lptks` | report.read | Rekap LPTK |
| GET | `/api/admin/reports/categories` | report.read | Rekap kategori |
| GET | `/api/admin/reports/verification` | report.read | Rekap verifikasi |
| GET | `/api/admin/reports/export` | report.export | Export |

## 21.2 Query Export

```text
GET /api/admin/reports/export?type=participants&format=csv&status_code=VERIFIED
```

Format awal:

```text
csv
```

Export wajib mengikuti filter dan permission.

---

# 22. AUDIT LOG API

## 22.1 Endpoints

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/audit-logs` | audit.read | List audit |
| GET | `/api/admin/audit-logs/:id` | audit.read | Detail audit |

## 22.2 Filter

```text
page
q
user_id
action_code
entity_type
date_from
date_to
```

## 22.3 Action Codes Lengkap

```text
LOGIN
LOGIN_FAILED
LOGOUT
CHANGE_PASSWORD
CREATE_VILLAGE
UPDATE_VILLAGE
DELETE_VILLAGE
BULK_DELETE_VILLAGES
CREATE_LPTK
UPDATE_LPTK
DELETE_LPTK
BULK_DELETE_LPTKS
CREATE_USER
UPDATE_USER
DELETE_USER
BULK_DELETE_USERS
RESET_PASSWORD
ACTIVATE_USER
DEACTIVATE_USER
CREATE_ROLE
UPDATE_ROLE
DELETE_ROLE
UPDATE_ROLE_PERMISSIONS
CREATE_COMPETITION
UPDATE_COMPETITION
DELETE_COMPETITION
BULK_DELETE_COMPETITIONS
CREATE_CATEGORY
UPDATE_CATEGORY
DELETE_CATEGORY
BULK_DELETE_CATEGORIES
UPDATE_CATEGORY_REQUIREMENTS
CREATE_DOCUMENT_TYPE
UPDATE_DOCUMENT_TYPE
DELETE_DOCUMENT_TYPE
BULK_DELETE_DOCUMENT_TYPES
CREATE_PARTICIPANT
UPDATE_PARTICIPANT
DELETE_PARTICIPANT
BULK_DELETE_PARTICIPANTS
SUBMIT_PARTICIPANT
UPLOAD_DOCUMENT
DELETE_DOCUMENT
REPLACE_DOCUMENT
DOWNLOAD_DOCUMENT
BULK_DELETE_DOCUMENTS
VERIFY_PARTICIPANT
REVISE_PARTICIPANT
REJECT_PARTICIPANT
IN_REVIEW_PARTICIPANT
EXPORT_REPORT
UPDATE_SETTINGS
```

---

# 23. PENGATURAN SISTEM API

Modul untuk mengelola konfigurasi operasional aplikasi tanpa perlu deploy ulang kode.

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/settings` | setting.read | Ambil semua konfigurasi |
| PATCH | `/api/admin/settings` | setting.write | Perbarui konfigurasi |

Item Konfigurasi:
- `max_upload_size_mb` (Default: 5 MB)
- `allowed_mime_types` (Default: `["application/pdf", "image/jpeg", "image/png"]`)
- `system_maintenance` (Default: `false`)
- `participant_auto_lock_hours` (Default: `24`)

---

# 24. ASSET & GITHUB CDN INTEGRATION

| Method | Endpoint | Permission | Fungsi |
|---|---|---|---|
| GET | `/api/admin/cdn` | cdn.read | Daftar asset statis |

## 24.1 Aturan CDN

- Digunakan untuk aset statis publik (Logo Kecamatan, Logo LPTK default, Ikon antarmuka, Empty state illustration).
- Penyajian melalui jsDelivr CDN terdistribusi:
  ```text
  https://cdn.jsdelivr.net/gh/<organization>/<repository>@<branch>/assets/...
  ```
- **Penting:** File privat peserta (KTP, Akta, dsb.) **DILARANG** di-upload ke repository GitHub atau diarahkan ke CDN publik.

---

# 25. ATURAN TRANSISI STATUS & INTEGRITAS BISNIS

1. **DRAFT -> SUBMITTED**:
   - Hanya dapat dilakukan jika seluruh dokumen berstatus `is_mandatory = true` telah diunggah.
2. **SUBMITTED -> IN_REVIEW**:
   - Terjadi saat Verifikator membuka antrean dan mulai memeriksa dokumen.
3. **IN_REVIEW -> VERIFIED**:
   - Semua dokumen dinyatakan sah. Peserta resmi berhak mengikuti lomba.
4. **IN_REVIEW -> REVISION_REQUIRED**:
   - Wajib menyertakan catatan `note`. Status peserta berubah agar Operator dapat mengunggah perbaikan dokumen.
5. **IN_REVIEW -> REJECTED**:
   - Wajib menyertakan catatan `note`. Pendaftaran gugur.
6. **REVISION_REQUIRED -> SUBMITTED**:
   - Operator mengunggah dokumen pengganti dan menekan tombol `Kirim` ulang.
