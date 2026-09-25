---
name: ui-ux-text
description: "Ultra-minimalist UI/UX text and microcopy rule: maximum 1 sentence for descriptions, 1-3 words for titles and buttons, strictly zero generic fluff or wordy subtitles."
---

# UI/UX Text: Ultra-Minimalist Microcopy Standard

> **Core Philosophy**: UI is for action and visual clarity, not long-winded essays. Every word must justify its existence. If an action or label is self-evident, cut the description entirely.

---

## 1. Absolute Length Limits

| Element | Max Word / Sentence Count | Examples (Good) | Examples (Bad) |
| :--- | :--- | :--- | :--- |
| **Page / Section Header** | 1 – 3 words | `Tambah Berita`, `Data Desa`, `Laporan` | `Formulir Penambahan Berita Baru ke Sistem Informasi Portal` |
| **Header Subtitles / Descriptions** | 0 – 1 sentence (prefer 0 if title is clear) | *(None, or 1 short sentence max)* | Multi-line paragraph explaining what the page does |
| **Button Labels** | 1 – 2 words | `Simpan`, `Batal`, `Tambah`, `Unduh` | `Klik di Sini untuk Menyimpan Perubahan Data` |
| **Form Labels** | 1 – 3 words | `Judul Berita`, `Kategori`, `Ringkasan` | `Silakan Masukkan Judul Berita yang Ingin Ditampilkan` |
| **Badges / Tags** | 1 – 2 words | `Aktif`, `Selesai`, `Draft` | `Status Saat Ini Sedang Aktif Berjalan` |
| **Empty State Text** | 1 sentence | `Belum ada data tersedia.` | `Saat ini sistem belum menemukan data apapun di database, silakan klik tombol di bawah untuk menambah data baru.` |
| **Confirmation Modals** | 1 – 2 short sentences | `Hapus data ini? Tindakan tidak dapat dibatalkan.` | Long legalistic disclaimers unless strictly required |

---

## 2. Admin Header Anti-Pattern (Strict Prohibition)

### ❌ NEVER:
```tsx
<div>
  <h1>Tambah Berita</h1>
  <p>Halaman ini digunakan oleh administrator untuk menambahkan artikel berita, warta kegiatan, dokumentasi foto, dan pengumuman resmi ke portal publik MTQ XIX Tambusai Utara agar masyarakat dapat membaca informasi terbaru.</p>
</div>
```

### ✅ ALWAYS:
```tsx
<div className="flex items-center justify-between">
  <h1 className="text-lg font-bold text-neutral-900">Tambah Berita</h1>
  <div className="flex gap-2">
    <Button variant="outline">Batal</Button>
    <Button>Simpan</Button>
  </div>
</div>
```

---

## 3. Frontend & Public Microcopy Rules

1. **Hero Section**:
   - Title: Crisp, informative (e.g. `MTQ XIX Tambusai Utara 2026`).
   - Subtitle: 1 punchy sentence with venue/dates (e.g. `Kecamatan Tambusai Utara, Rokan Hulu, Riau`).
   - Buttons: Maximum 2 words per action (`Cek Peserta`, `Jadwal Acara`).
2. **Cards & Widgets**:
   - Card headers must be concise.
   - Limit card summaries/excerpts to 2 lines max with `line-clamp-2`.
3. **Alerts & Toasts**:
   - Success: `Berhasil disimpan.` (Not: `Selamat! Perubahan data Anda telah sukses disimpan ke sistem basis data kami.`)
   - Error: `Gagal menyimpan: [alasan singkat].`
