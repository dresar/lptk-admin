# SISTEM PENDATAAN & VERIFIKASI PESERTA LOMBA LPTK KECAMATAN
**Versi:** 3.0 Baseline (Dikunci)  
**Stack:** Next.js (App Router) • TypeScript • Neon PostgreSQL • Tailwind CSS (Monochrome)

---

## 📌 Ringkasan Proyek

Aplikasi monolitik berbasis **Backend-First** untuk mendata, mengelola berkas persyaratan, dan memverifikasi peserta lomba LPTK tingkat kecamatan.

- **Frontend & Backend:** Monolith dalam Next.js (TypeScript).
- **Database & Auth:** Neon PostgreSQL (Stateful Database-Backed Session Hashing SHA-256).
- **Tema UI:** Strict Monochrome Black & White (Tanpa warna neon, standar bersih industri).
- **Aturan Ketat PRD:**
  - Label Button maksimal 1 kata.
  - Label Sidebar maksimal 1 kata.
  - Form $\le 3$ field menggunakan Modal dialog.
  - Form $> 3$ field menggunakan Dedicated Page.
  - Proteksi berkas privat tersimpan aman di database (bukan publik CDN).
  - Validasi Magic Bytes (PDF, JPG, PNG) dan SHA-256 checksum.

---

## 🚀 Panduan Menjalankan Proyek

### 1. Konfigurasi Environment Variable
Salin `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi `DATABASE_URL` dengan connection string Neon PostgreSQL Anda:
```env
DATABASE_URL=postgresql://neondb_owner:password@ep-sample-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Migrasi dan Seeding Database
Jalankan perintah berikut untuk mengeksekusi DDL schema dan data awal:
```bash
# Eksekusi DDL PostgreSQL (schema auth dan public)
npm run db:migrate

# Seed data peran, hak akses, jenis dokumen, pengaturan, dan akun Super Admin
npm run db:seed
```

> **Akun Bawaan Seeder:**
> - **Email:** `admin@mail.com`
> - **Kata Sandi:** `password123`

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 4. Build Produksi
```bash
npm run build
npm run start
```

---

## 📂 Dokumentasi Teknis Lengkap

Dokumentasi rancangan dan spesifikasi lengkap tersedia di direktori `docs/`:
- [`docs/PLAN.md`](./docs/PLAN.md) — Master Roadmap, Matriks Hak Akses Peran, dan Kriteria Penerimaan.
- [`docs/IMPLEMENTATION.md`](./docs/IMPLEMENTATION.md) — DDL Skema Neon, Algoritma Sesi, Magic Bytes, dan Panduan UI Monokrom.
- [`docs/PRD_BLUEPRINT_V3.md`](./docs/PRD_BLUEPRINT_V3.md) — Dokumen PRD & Blueprint v3.0 Baseline Resmi.
