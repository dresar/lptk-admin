const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function seedJuknis() {
  console.log('--- Memulai Sinkronisasi Data Juknis MTQ ke-XIX Tambusai Utara 2026 ---');

  // 1. Update Competition to MTQ ke-XIX Tambusai Utara 2026
  console.log('1. Mengupdate data kompetisi MTQ XIX...');
  const compId = 'ff3a241f-8fab-4409-9cdb-570d1df351e3';
  await sql`
    UPDATE competitions
    SET
      name = 'MTQ ke-XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato',
      description = 'Petunjuk Teknis Resmi No: 09/LPTQ-T.U/MTQ/IX/2026 tanggal 10 September 2026. Pelaksanaan: 09 – 13 November 2026 di Desa Mahato, Kecamatan Tambusai Utara, Kabupaten Rokan Hulu, Riau.',
      period_year = 2026,
      status_code = 'OPEN',
      registration_open_at = '2026-08-01 00:00:00',
      registration_close_at = '2026-11-05 23:59:59',
      banner_url = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
      updated_at = NOW()
    WHERE id = ${compId}
  `;

  // 2. Synchronize Document Types (6 Dokumen Persyaratan Administrasi sesuai Juknis Halaman 6-7)
  console.log('2. Menyinkronkan 6 Dokumen Persyaratan Administrasi Juknis...');
  const officialDocTypes = [
    {
      code: 'SURAT_MANDAT',
      name: 'Surat Mandat dari Desa',
      is_required: true
    },
    {
      code: 'SURAT_DOMISILI',
      name: 'Surat Keterangan Berdomisili',
      is_required: true
    },
    {
      code: 'IJAZAH',
      name: 'Photo Copy Ijazah Sekolah',
      is_required: true
    },
    {
      code: 'AKTE_KELAHIRAN',
      name: 'Photo Copy Akte Kelahiran',
      is_required: true
    },
    {
      code: 'KARTU_KELUARGA',
      name: 'Photo Copy Kartu Keluarga yang Memakai NIK',
      is_required: true
    },
    {
      code: 'SURAT_PERNYATAAN',
      name: 'Surat Pernyataan Kebenaran Dokumen',
      is_required: true
    }
  ];

  for (const doc of officialDocTypes) {
    const existing = await sql`SELECT id FROM document_types WHERE code = ${doc.code} LIMIT 1`;
    if (existing.length > 0) {
      await sql`
        UPDATE document_types
        SET
          name = ${doc.name},
          is_required = ${doc.is_required},
          active = true,
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO document_types (code, name, is_required, active)
        VALUES (${doc.code}, ${doc.name}, ${doc.is_required}, true)
      `;
    }
  }

  // 3. Synchronize Categories (Cabang & Golongan Musabaqah sesuai Juknis Halaman 2 - 6)
  console.log('3. Menyinkronkan 25 Cabang & Golongan Musabaqah Juknis...');

  const officialCategories = [
    // A. Seni Baca Al-Qur'an (Tartil, Anak, Remaja, Dewasa)
    {
      name: "Tartil Al-Qur'an Putra",
      gender_code: 'MALE',
      age_min: 6,
      age_max: 12,
      requirements: "Umur maksimal 12 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Juz 1 s/d 10. Durasi 5-7 menit. Penentuan Maqra' 16 jam sebelum tampil."
    },
    {
      name: "Tartil Al-Qur'an Putri",
      gender_code: 'FEMALE',
      age_min: 6,
      age_max: 12,
      requirements: "Umur maksimal 12 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Juz 1 s/d 10. Durasi 5-7 menit. Penentuan Maqra' 16 jam sebelum tampil."
    },
    {
      name: "Tilawah Anak-Anak Putra",
      gender_code: 'MALE',
      age_min: 7,
      age_max: 14,
      requirements: "Umur maksimal 14 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Juz 1 s/d 20. Durasi 6-8 menit. Penentuan Maqra' 16 jam sebelum tampil."
    },
    {
      name: "Tilawah Anak-Anak Putri",
      gender_code: 'FEMALE',
      age_min: 7,
      age_max: 14,
      requirements: "Umur maksimal 14 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Juz 1 s/d 20. Durasi 6-8 menit. Penentuan Maqra' 16 jam sebelum tampil."
    },
    {
      name: "Tilawah Remaja Putra",
      gender_code: 'MALE',
      age_min: 15,
      age_max: 24,
      requirements: "Umur maksimal 24 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Juz 1 s/d 20. Durasi 7-9 menit. Penentuan Maqra' 16 jam sebelum tampil."
    },
    {
      name: "Tilawah Remaja Putri",
      gender_code: 'FEMALE',
      age_min: 15,
      age_max: 24,
      requirements: "Umur maksimal 24 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Juz 1 s/d 20. Durasi 7-9 menit. Penentuan Maqra' 16 jam sebelum tampil."
    },
    {
      name: "Tilawah Dewasa Putra",
      gender_code: 'MALE',
      age_min: 25,
      age_max: 40,
      requirements: "Umur maksimal 40 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Juz 1 s/d 30. Durasi 9-10 menit. Penentuan Maqra' ketika peserta naik mimbar tilawah."
    },
    {
      name: "Tilawah Dewasa Putri",
      gender_code: 'FEMALE',
      age_min: 25,
      age_max: 40,
      requirements: "Umur maksimal 40 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Juz 1 s/d 30. Durasi 9-10 menit. Penentuan Maqra' ketika peserta naik mimbar tilawah."
    },

    // B. Hafalan Al-Qur'an (1 Juz, 5 Juz, 10 Juz)
    {
      name: "Hifzil 1 Juz dan Tilawah Putra",
      gender_code: 'MALE',
      age_min: 7,
      age_max: 15,
      requirements: "Umur maksimal 15 tahun 11 bulan 29 hari per 09 Nov 2026. Tilawah Juz 1-10 (durasi 6-7 mnt min 3 lagu), Hafalan Juz 1 atau Juz 30 (3 pertanyaan 5-8 baris Bahriyyah). Maqra tilawah 16 jam sebelumnya."
    },
    {
      name: "Hifzil 1 Juz dan Tilawah Putri",
      gender_code: 'FEMALE',
      age_min: 7,
      age_max: 15,
      requirements: "Umur maksimal 15 tahun 11 bulan 29 hari per 09 Nov 2026. Tilawah Juz 1-10 (durasi 6-7 mnt min 3 lagu), Hafalan Juz 1 atau Juz 30 (3 pertanyaan 5-8 baris Bahriyyah). Maqra tilawah 16 jam sebelumnya."
    },
    {
      name: "Hifzil 5 Juz dan Tilawah Putra",
      gender_code: 'MALE',
      age_min: 8,
      age_max: 20,
      requirements: "Umur maksimal 20 tahun 11 bulan 29 hari per 09 Nov 2026. Tilawah Juz 1-20 (durasi 7-8 mnt min 3 lagu), Hafalan Juz 1 atau Juz 30 (3 pertanyaan 6-10 baris Bahriyyah). Maqra tilawah 16 jam sebelumnya."
    },
    {
      name: "Hifzil 5 Juz dan Tilawah Putri",
      gender_code: 'FEMALE',
      age_min: 8,
      age_max: 20,
      requirements: "Umur maksimal 20 tahun 11 bulan 29 hari per 09 Nov 2026. Tilawah Juz 1-20 (durasi 7-8 mnt min 3 lagu), Hafalan Juz 1 atau Juz 30 (3 pertanyaan 6-10 baris Bahriyyah). Maqra tilawah 16 jam sebelumnya."
    },
    {
      name: "Hifzil 10 Juz Putra",
      gender_code: 'MALE',
      age_min: 9,
      age_max: 22,
      requirements: "Umur maksimal 22 tahun 11 bulan 29 hari per 09 Nov 2026. Materi hafalan Juz 1 s/d Juz 10 (3 pertanyaan)."
    },
    {
      name: "Hifzil 10 Juz Putri",
      gender_code: 'FEMALE',
      age_min: 9,
      age_max: 22,
      requirements: "Umur maksimal 22 tahun 11 bulan 29 hari per 09 Nov 2026. Materi hafalan Juz 1 s/d Juz 10 (3 pertanyaan)."
    },

    // C. Fahmil Al-Qur'an (MFQ)
    {
      name: "Fahmil Al-Qur'an Golongan Anak Campuran",
      gender_code: 'ANY',
      age_min: 9,
      age_max: 13,
      requirements: "Regu/kelompok terdiri atas 3 (tiga) Pa/Pi. Usia maksimal 13 tahun 11 bulan 29 hari per 09 Nov 2026. Materi: Kurikulum MA & Ponpes, wawasan Al-Qur'an & kebangsaan."
    },
    {
      name: "Fahmil Al-Qur'an Golongan Remaja Putra",
      gender_code: 'MALE',
      age_min: 14,
      age_max: 18,
      requirements: "Regu/kelompok terdiri atas 3 (tiga) orang putra. Usia maksimal 18 tahun 11 bulan 29 hari per 09 Nov 2026. Paket soal regu (10-12 soal) dan rebutan (10-15 soal)."
    },
    {
      name: "Fahmil Al-Qur'an Golongan Remaja Putri",
      gender_code: 'FEMALE',
      age_min: 14,
      age_max: 18,
      requirements: "Regu/kelompok terdiri atas 3 (tiga) orang putri. Usia maksimal 18 tahun 11 bulan 29 hari per 09 Nov 2026. Paket soal regu (10-12 soal) dan rebutan (10-15 soal)."
    },

    // D. Syarhil Al-Qur'an (MSQ)
    {
      name: "Syarhil Al-Qur'an Golongan Anak Campuran",
      gender_code: 'ANY',
      age_min: 9,
      age_max: 13,
      requirements: "Regu terdiri atas 3 Pa/Pi. Usia maksimal 13 tahun 11 bulan 29 hari per 09 Nov 2026. 3 unsur (tilawah, deklamasi, pidato retorika). Durasi 15-20 menit. Mengacu pada 9 Tema Resmi Juknis MTQ XIX."
    },
    {
      name: "Syarhil Al-Qur'an Golongan Remaja Putra",
      gender_code: 'MALE',
      age_min: 14,
      age_max: 18,
      requirements: "Regu terdiri atas 3 orang putra. Usia maksimal 18 tahun 11 bulan 29 hari per 09 Nov 2026. Durasi 15-20 menit tanpa teks. Mengacu pada 9 Tema Resmi Juknis MTQ XIX."
    },
    {
      name: "Syarhil Al-Qur'an Golongan Remaja Putri",
      gender_code: 'FEMALE',
      age_min: 14,
      age_max: 18,
      requirements: "Regu terdiri atas 3 orang putri. Usia maksimal 18 tahun 11 bulan 29 hari per 09 Nov 2026. Durasi 15-20 menit tanpa teks. Mengacu pada 9 Tema Resmi Juknis MTQ XIX."
    },

    // E. Seni Kaligrafi Al-Qur'an (MKQ)
    {
      name: "Kaligrafi Golongan Naskah Pa/Pi",
      gender_code: 'ANY',
      age_min: 15,
      age_max: 34,
      requirements: "Umur maksimal 34 tahun 11 bulan 29 hari per 09 Nov 2026. Khat Naskhi wajib (5-10 baris) & 4 khat pilihan (4-5 baris) diundi. Media 2 karton penuh. Waktu 480 menit (8 jam)."
    },
    {
      name: "Kaligrafi Golongan Hiasan Mushaf Pa/Pi",
      gender_code: 'ANY',
      age_min: 15,
      age_max: 34,
      requirements: "Umur maksimal 34 tahun 11 bulan 29 hari per 09 Nov 2026. Teks 4-5 baris mushaf, ornamen gaya surah Al-Fatihah/Al-Baqarah. Media 1 karton penuh. Waktu 480 menit (8 jam)."
    },
    {
      name: "Kaligrafi Golongan Dekorasi Pa/Pi",
      gender_code: 'ANY',
      age_min: 15,
      age_max: 34,
      requirements: "Umur maksimal 34 tahun 11 bulan 29 hari per 09 Nov 2026. 5 dari 7 khat diundi. Media triplek ukuran 122 cm x 80 cm. Waktu 480 menit (8 jam)."
    },
    {
      name: "Kaligrafi Golongan Kontemporer Pa/Pi",
      gender_code: 'ANY',
      age_min: 15,
      age_max: 34,
      requirements: "Umur maksimal 34 tahun 11 bulan 29 hari per 09 Nov 2026. 4 gaya khat kontemporer diundi. Teks 0,5-1,5 baris. Media kanvas berspanram 60 x 80 cm. Dilarang gambar makhluk hidup. Waktu 480 menit (8 jam)."
    },

    // F. Rebana Klasik
    {
      name: "Cabang Rebana Klasik (Remaja & Dewasa Campuran)",
      gender_code: 'ANY',
      age_min: 15,
      age_max: 38,
      requirements: "Regu terdiri atas 11 orang Pa/Pi. Usia maksimal 38 tahun 11 bulan 29 hari per 09 Nov 2026. 2 Qasidah: 1 Wajib ('Al-Qur'an' - Hj. Nur Asiah Djamil), 1 Pilihan (Magadir, Perdamaian, Kasih sayangnya bunda, Jilbab putih). Waktu maks 15 menit. Alat bawa sendiri tanpa nada notasi/alat elektrik."
    }
  ];

  for (const cat of officialCategories) {
    const existing = await sql`
      SELECT id FROM categories 
      WHERE competition_id = ${compId} AND name = ${cat.name} AND deleted_at IS NULL 
      LIMIT 1
    `;
    if (existing.length > 0) {
      await sql`
        UPDATE categories
        SET
          gender_code = ${cat.gender_code},
          age_min = ${cat.age_min},
          age_max = ${cat.age_max},
          requirements = ${cat.requirements},
          active = true,
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO categories (competition_id, name, gender_code, age_min, age_max, requirements, active)
        VALUES (${compId}, ${cat.name}, ${cat.gender_code}, ${cat.age_min}, ${cat.age_max}, ${cat.requirements}, true)
      `;
    }
  }

  // 4. Update System Settings with official LPTK metadata
  console.log('4. Memperbarui Pengaturan Sistem dengan Identitas LPTK...');
  const settingsToUpdate = [
    { key: 'app_name', val: 'LPTK Tambusai Utara - Mahato 2026', desc: 'Nama resmi aplikasi' },
    { key: 'event_official_name', val: 'Musabaqah Tilawatil Qur’an (MTQ) ke-XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato', desc: 'Nama resmi perhelatan MTQ' },
    { key: 'event_dates', val: '09 – 13 November 2026', desc: 'Jadwal pelaksanaan musabaqah' },
    { key: 'event_location', val: 'Desa Mahato, Kecamatan Tambusai Utara, Kabupaten Rokan Hulu', desc: 'Lokasi tuan rumah penyelenggaraan' },
    { key: 'juknis_letter_no', val: '09/LPTQ-T.U/MTQ/IX/2026', desc: 'Nomor surat edaran petunjuk teknis' },
    { key: 'juknis_letter_date', val: '10 September 2026', desc: 'Tanggal penetapan petunjuk teknis' },
    { key: 'lptq_chairman', val: 'Rahmat Saputra', desc: 'Ketua Umum LPTQ Kecamatan Tambusai Utara' },
    { key: 'lptq_secretariat', val: 'Kantor KUA - Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara, Kab. Rokan Hulu - Riau', desc: 'Alamat sekretariat resmi LPTQ' },
    { key: 'submission_envelope', val: 'Map Warna Biru disampaikan di Sekretariat LPTQ Kecamatan / Bagian Administrasi MTQ Desa Mahato', desc: 'Wadah berkas pendaftaran fisik kafilah' }
  ];

  for (const s of settingsToUpdate) {
    const existing = await sql`SELECT key FROM system_settings WHERE key = ${s.key} LIMIT 1`;
    const jsonVal = JSON.stringify(s.val);
    if (existing.length > 0) {
      await sql`UPDATE system_settings SET value = ${jsonVal}::jsonb, description = ${s.desc}, updated_at = NOW() WHERE key = ${s.key}`;
    } else {
      await sql`INSERT INTO system_settings (key, value, description) VALUES (${s.key}, ${jsonVal}::jsonb, ${s.desc})`;
    }
  }

  // 5. Connect document_types to categories (category_document_requirements)
  console.log('5. Menghubungkan 6 dokumen persyaratan ke seluruh kategori...');
  const allDocTypes = await sql`SELECT id FROM document_types WHERE code IN ('SURAT_MANDAT', 'SURAT_DOMISILI', 'IJAZAH', 'AKTE_KELAHIRAN', 'KARTU_KELUARGA', 'SURAT_PERNYATAAN')`;
  const allCats = await sql`SELECT id FROM categories WHERE competition_id = ${compId} AND deleted_at IS NULL`;

  for (const cat of allCats) {
    for (const dt of allDocTypes) {
      await sql`
        INSERT INTO category_document_requirements (category_id, document_type_id, is_mandatory)
        VALUES (${cat.id}, ${dt.id}, true)
        ON CONFLICT (category_id, document_type_id) DO NOTHING
      `;
    }
  }

  console.log('--- Sinkronisasi Data Juknis Selesai dan Berhasil! ---');
}

seedJuknis().then(() => process.exit(0)).catch((err) => {
  console.error('Error saat seeding juknis:', err);
  process.exit(1);
});
