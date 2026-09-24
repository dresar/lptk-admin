/**
 * Data Resmi Template Petunjuk Teknis MTQ ke-XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato
 * Dasar Hukum: Surat Keputusan / Edaran LPTQ No. 09/LPTQ-T.U/MTQ/IX/2026 tertanggal 10 September 2026
 * Ditandatangani oleh Ketua Umum LPTQ Kecamatan Tambusai Utara: RAHMAT SAPUTRA
 */

export interface JuknisHeader {
  instansi_baris1: string;
  instansi_baris2: string;
  instansi_baris3: string;
  alamat_sekretariat: string;
  nomor_surat: string;
  lampiran: string;
  perihal: string;
  tujuan: string[];
}

export interface JuknisPageContent {
  page_number: number;
  title?: string;
  sections: Array<{
    heading?: string;
    subheading?: string;
    paragraphs?: string[];
    items?: Array<{
      label?: string;
      text: string;
      subitems?: string[];
    }>;
  }>;
  show_signature?: boolean;
}

export const JUKNIS_OFFICIAL_HEADER: JuknisHeader = {
  instansi_baris1: "LEMBAGA PENGEMBANGAN TILAWATIL QUR'AN",
  instansi_baris2: 'LPTQ KEC. TAMBUSAI UTARA',
  instansi_baris3: 'Kecamatan Tambusai Utara Kabupaten Rokan Hulu',
  alamat_sekretariat: 'Kantor KUA - Jl. Raya Rantau Kasai Desa Rantau Kasai Kecamatan Tambusai Utara, Kabupaten Rokan Hulu - Riau',
  nomor_surat: '09/LPTQ-T.U/MTQ/IX/2026',
  lampiran: '-',
  perihal: 'Petunjuk Teknis Cabang Lomba Pelaksanaan MTQ ke-XIX 2026',
  tujuan: [
    'Kepala Desa se-Kecamatan Tambusai Utara',
    'LPTQ Desa se-Kecamatan Tambusai Utara',
    'BK-LPTQ se-Kecamatan Tambusai Utara',
  ],
};

export const JUKNIS_PAGES: JuknisPageContent[] = [
  // Halaman 1: Surat Pengantar Edaran Resmi
  {
    page_number: 1,
    sections: [
      {
        heading: 'SURAT PENGANTAR PETUNJUK TEKNIS CABANG LOMBA MTQ KE-XIX',
        paragraphs: [
          'Assalamualaikum, wr, wb',
          'Seiring salam dan do’a kehadiran Allah SWT semoga Bpk/Ibu/sdr dalam keadaan sehat wal afiat dan sukses selalu dalam menjalankan aktivitas sehari-hari....amin',
          'Sehubungan dengan pelaksanaan Musabaqah Tilawatil Qur’an (MTQ) ke-XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato yang pelaksanaannya di rencanakan dibulan November 2026 minggu ke-II, maka kami sampaikan pedoman teknis penyelenggaraan MTQ Kecamatan tersebut jauh sebelum pelaksanaan MTQ nantinya sebagaimana terlampir.',
          'Demikian panduan teknis ini kami sampaikan agar dapat di pedomani sebagaimana mestinya sebagai langkah persiapan kafilah dan masing-masing Desa. Atas kerjasamanya kami ucapkan terimakasih...',
          'Wassalamualaikum, wr, wb',
        ],
      },
    ],
    show_signature: true,
  },

  // Halaman 2: Waktu Penyelenggaraan & Cabang/Golongan Musabaqah
  {
    page_number: 2,
    title: 'PETUNJUK TEKNIS PENYELENGGARAAN MTQ KE-XIX TINGKAT KECAMATAN TAMBUSAI UTARA TAHUN 2026',
    sections: [
      {
        heading: 'I. Waktu Penyelenggaraan',
        paragraphs: [
          'Musabaqah Tilawatil Qur’an Tingkat Kecamatan Tambusai Utara akan dilaksanakan pada tanggal 09 – 13 November 2026 di Desa Mahato.',
        ],
      },
      {
        heading: 'II. CABANG/GOLONGAN MUSABAQOH DAN PESERTA',
        items: [
          {
            label: 'A. CABANG SENI BACA AL-QUR’AN terdiri dari:',
            text: '',
            subitems: [
              '1. Gol. Tartil Qur’an Pa/Pi, umur maksimal 12 tahun 11 bulan 29 hari.',
              '2. Gol. Tilawah Anak-Anak Pa/Pi, umur maksimal 14 tahun 11 bulan 29 hari.',
              '3. Gol. Tilawah Remaja Pa/Pi, umur maksimal 24 tahun 11 bulan 29 hari.',
              '4. Gol. Tilawah Dewasa Pa/Pi, umur maksimal 40 tahun 11 bulan 29 hari.',
            ],
          },
          {
            label: 'B. CABANG HAFALAN AL-QUR’AN',
            text: '',
            subitems: [
              '1. Gol. 1 Juz dan Tilawah Pa/Pi, umur maksimal 15 tahun 11 bulan 29 hari.',
              '2. Gol. 5 Juz dan Tilawah Pa/Pi, umur maksimal 20 tahun 11 bulan 29 hari.',
              '3. Gol. 10 Juz Pa/Pi, umur maksimal 22 tahun 11 bulan 29 hari.',
            ],
          },
          {
            label: 'C. CABANG FAHMIL AL-QUR’AN terdiri dari:',
            text: '',
            subitems: [
              '1. Gol. Anak Campuran, Peserta adalah regu (kelompok) yang terdiri atas 3 (tiga) Pa/Pi, usia maksimal 13 tahun 11 bulan 29 hari.',
              '2. Peserta adalah regu (kelompok) yang terdiri atas 3 (tiga) orang putra dan 3 (tiga) orang putri, umur maksimal 18 tahun 11 bulan 29 hari.',
            ],
          },
          {
            label: 'D. CABANG SYARHIL AL-QUR’AN terdiri dari:',
            text: '',
            subitems: [
              '1. Gol. Anak Campuran, Peserta adalah regu (kelompok) yang terdiri atas 3 (tiga) Pa/Pi, usia maksimal 13 tahun 11 bulan 29 hari.',
              '2. Peserta adalah regu (kelompok) yang terdiri atas 3 (tiga) orang putra dan 3 (tiga) orang putri, umur maksimal 18 tahun 11 bulan 29 hari.',
            ],
          },
          {
            label: 'E. CABANG SENI KALIGRAFI AL-QUR’AN terdiri dari:',
            text: '',
            subitems: [
              '1. Gol. Naskah Pa/Pi, umur maksimal 34 tahun 11 bulan 29 hari.',
              '2. Gol. Hiasan Pa/Pi, umur maksimal 34 tahun 11 bulan 29 hari.',
              '3. Gol. Dekorasi Pa/Pi, umur maksimal 34 tahun 11 bulan 29 hari.',
              '4. Gol. Kontemporer Pa/Pi, umur maksimal 34 Thun 11 bulan 29 hari.',
            ],
          },
          {
            label: 'F. CABANG REBANA KLASIK',
            text: '',
            subitems: [
              '1. Peserta adalah regu (kelompok) yang terdiri atas 11 orang Pa/Pi.',
              '2. Cabang rebana remaja dan dewasa (campuran) usia maksimal 38 tahun 11 bulan 29 hari.',
            ],
          },
        ],
      },
    ],
  },

  // Halaman 3: Materi Musabaqah dan Waktu Tampil (Cabang Seni Baca & Hafalan)
  {
    page_number: 3,
    sections: [
      {
        heading: 'III. MATERI MUSABAQAH DAN WAKTU TAMPIL',
        subheading: 'A. CABANG SENI BACA AL-QUR’AN',
        items: [
          {
            label: '1. GOLONGAN TARTIL AL-QUR’AN',
            text: '',
            subitems: [
              'Materi bacaan dari Juz 1 s/d Juz 10.',
              'Durasi penampilan 5-7 menit.',
              'Penentuan Maqro’ adalah 16 jam sebelum penampilan.',
            ],
          },
          {
            label: '2. GOLONGAN TILAWAH ANAK-ANAK',
            text: '',
            subitems: [
              'Materi bacaan DARI Juz 1 s/d Juz 20.',
              'Durasi penampilan 6-8 menit.',
              'Penentuan Maqra’ adalah 16 jam sebelum penampilan.',
            ],
          },
          {
            label: '3. GOLONGAN TILAWAH REMAJA',
            text: '',
            subitems: [
              'Materi bacaan dari Juz 1 s/d Juz 20',
              'Durasi penampilan 7-9 menit',
              'Penentuan Maqra’ adalah 16 jam sebelum penampilan',
            ],
          },
          {
            label: '4. GOLONGAN TILAWAH DEWASA',
            text: '',
            subitems: [
              'Materi bacaan dari Juz 1 s/d 30',
              'Durasi penampilan 9-10 menit',
              'Penentuan Maqra’ adalah ketika peserta akan naik mimbar tilawah.',
            ],
          },
        ],
      },
      {
        heading: 'B. CABANG HAFALAN AL-QUR’AN',
        items: [
          {
            label: '1. GOLONGAN 1 JUZ DAN TILAWAH',
            text: '',
            subitems: [
              'Materi Tilawah Juz 1 s/d Juz 10 dan untuk Hafalan adalah salah satu dari Juz 1 atau Juz 30',
              'Durasi penampilan 6-7 menit untuk tilawah dengan membawakan minimal 3 lagu sedangkan untuk hafalan terdiri atas 3 (tiga) pertanyaan dan setiap jawaban antara 5-8 baris Al-Qur’an Bahriyyah',
              'Penentuan Maqra’ Tilawah 16 jam sebelum penampilan',
              'Teknis penampilan dimulai dengan tilawah dan dilanjutkan dengan tahfidz',
            ],
          },
          {
            label: '2. GOLONGAN 5 JUZ DAN TILAWAH',
            text: '',
            subitems: [
              'Materi Tilawah Juz 1 s/d Juz 20 dan untuk Hafalan adalah salah satu dari Juz 1 atau Juz 30',
              'Durasi penampilan 7-8 menit untuk tilawah dengan membawakan minimal 3 lagu sedangkan untuk hafalan terdiri atas 3 (tiga) pertanyaan dan setiap jawaban antara 6-10 baris Al-Qur’an Bahriyyah',
              'Penentuan Maqra’ Tilawah 16 jam sebelum penampilan',
              'Teknis penampilan dimulai dengan tilawah dan dilanjutkan dengan tahfidz',
            ],
          },
        ],
      },
    ],
  },

  // Halaman 4: Golongan 10 Juz, Fahmil Qur'an & Syarhil Qur'an
  {
    page_number: 4,
    sections: [
      {
        heading: '3. GOLONGAN 10 JUZ',
        paragraphs: ['Materi hafalan golongan 10 Juz adalah 1 s/d 10'],
      },
      {
        heading: 'C. CABANG FAHMIL AL-QUR’AN',
        items: [
          {
            label: '1. Materi Soal:',
            text: 'Materi soal adalah perpaduan antara kurikulum Madrasah Aliyah dan kurikulum Pondok Pesantren, wawasan Al-Qur’an serta wawasan umum yang meliputi wawasan kebangsaan dan dunia islam.',
          },
          {
            label: '2. Sesi Pertandingan:',
            text: 'Pada setiap sesi babak penyisihan dan semi final diikuti oleh 3 (tiga) atau 4 (empat) regu, sedangkan babak final hanya diikuti oleh 3 (tiga) regu.',
          },
          {
            label: '3. Paket Soal (2 Macam):',
            text: '',
            subitems: [
              'a. Paket soal regu, yakni masing-masing regu mendapat 10-12 pertanyaan.',
              'b. Paket soal rebutan, yakni pertanyaan yang diberikan untuk semua regu dan dijawab secara rebutan, sebanyak 10-15 pertanyaan.',
            ],
          },
        ],
      },
      {
        heading: 'D. CABANG SYARHIL AL-QUR’AN',
        items: [
          {
            label: '1. Penampilan Terdiri Dari Tiga Unsur:',
            text: '',
            subitems: [
              'a. Tilawah Al-Qur’an, pembacaan ayat-ayat sesuai dengan materi yang disampaikan.',
              'b. Terjemahan ayat secara deklamasi sesuai dengan konteks.',
              'c. Penyampaian dengan teknik berpidato (retorika dakwah) yang natural dan tanpa teks.',
            ],
          },
          {
            label: '2. Durasi Penampilan:',
            text: 'Durasi penampilan 15-20 menit.',
          },
          {
            label: '3. Tema dan Judul:',
            text: '',
            subitems: [
              'a. Peserta memilih 3 dari 9 tema yang ditentukan LPTQ dan melaporkan 3 judul yang dipilih pada saat pendaftaran ulang.',
              'b. Setiap tema hanya boleh diambil/dijadikan satu judul syarahan.',
              'c. Penentuan judul: Babak Penyisihan (diperoleh 1 dari 3 judul 24 jam sebelum tampil); Babak Final (menyerahkan 2 judul lain paling lambat 3 jam sebelum final, diundi 60 menit sebelum mulai).',
            ],
          },
        ],
        paragraphs: [
          'd. Tema Cabang Syarhil Al-Qur’an pada MTQ XIX tahun 2026 terdiri atas:',
          '1. Optimalisasi Pengelolaan Zakat untuk Pemberdayaan Ekonomi Umat.',
          '2. Toleransi Umat Beragama dalam Kehidupan Berbangsa.',
        ],
      },
    ],
  },

  // Halaman 5: 9 Tema Lanjutan & Cabang Seni Kaligrafi Al-Qur'an
  {
    page_number: 5,
    sections: [
      {
        heading: 'Tema Syarhil Al-Qur’an (Lanjutan):',
        paragraphs: [
          '3. Optimalisasi Fungsi Masjid dalam Pembangunan Bangsa.',
          '4. Perspektif Islam Tentang Lingkungan Hidup.',
          '5. Literasi Waqaf untuk Kemandirian Umat.',
          '6. Narkoba Musuh Bersama Umat dan Bangsa.',
          '7. Pendidikan Ramah Anak Menurut Al-Qur’an.',
          '8. Generasi Muda Beradab untuk Indonesia Emas 2045.',
          '9. Pemberantasan Korupsi Menurut Al-Qur’an.',
        ],
      },
      {
        heading: 'E. CABANG SENI KALIGRAFI AL-QUR’AN',
        items: [
          {
            label: '1. Golongan Naskah Penulisan ayat Al-Qur’an sebagaimana terdapat pada teks mushaf:',
            text: '',
            subitems: [
              'Kaligrafi wajib (Naskhi) dan 4 (empat) jenis kaligrafi pilihan (selain Naskh).',
              'Penentuan 4 (empat) Jenis Kaligrafi pilihan dilakukan dengan cara diundi pada saat musabaqah.',
              'Panjang Teks: Antara 5–10 baris ukuran Mushaf Standar Kemenag RI terbitan tahun terakhir untuk kaligrafi wajib, dan antara 4–5 baris untuk kaligrafi pilihan.',
              'Peserta menulis 2 tulisan yang terdiri dari ayat wajib dan ayat pilihan.',
              'Setiap peserta akan mendapatkan 2 lembar kertas karton, 1 kertas karton untuk menulis ayat wajib dan 1 untuk menulis ayat pilihan.',
              'Karya dibuat diatas kertas karton penuh.',
              'Penulisan ayat wajib dan pilihan dikerjakan selama: 480 menit (8 jam), sudah termasuk waktu istirahat.',
            ],
          },
          {
            label: '2. Golongan Hiasan Mushaf Penulisan ayat Al-Qur’an dengan hiasan tepi yang bisa menjadi dekorasi dinding:',
            text: '',
            subitems: [
              'Teks antara 4–5 baris ukuran mushaf.',
              'Penulisan ayat wajib dan pilihan dikerjakan selama 480 menit (8 jam) termasuk istirahat.',
              'Gaya hiasan atau iluminasi dan ornament harus menggambarkan halaman pertama mushaf Al-Qur’an sebagaimana tercermin pada halaman surah Al-Fatihah dan halaman awal surah Al-Baqarah.',
              'Penentuan jenis kaligrafi dilakukan dengan cara diundi pada saat musabaqah.',
              'Karya dibuat diatas 1 lembar kertas karton penuh.',
              'Alokasi waktu selama 480 menit (8 jam) termasuk istirahat.',
            ],
          },
          {
            label: '3. Golongan Dekorasi adalah penulis ayat-ayat Al-Qur’an yang diberi hiasan tepi yang biasa menjadi dekorasi dinding:',
            text: '',
          },
        ],
      },
    ],
  },

  // Halaman 6: Kaligrafi Lanjutan, Rebana Klasik & Pendaftaran Peserta
  {
    page_number: 6,
    sections: [
      {
        heading: 'Golongan Dekorasi (Lanjutan):',
        paragraphs: [
          'Jenis kaligrafi yang dimusabaqahkan adalah 5 (lima) dari 7 (tujuh) jenis kaligrafi.',
          'Penentuan jenis kaligrafi dilakukan dengan cara diundi pada saat musabaqah.',
          'Karya dibuat diatas bahan triplek ukuran 122 cm x 80 cm.',
          'Alokasi waktu selama 480 menit (8 Jam) termasuk istirahat.',
        ],
      },
      {
        heading: '4. Golongan Kontemporer:',
        paragraphs: [
          'Salah satu dari 4 (empat) gaya khat kontemporer yang dimusabaqahkan, yaitu: kontemporer tradisional, figural, simbolik dan ekspresionis.',
          'Penentuan jenis kaligrafi dilakukan dengan cara diundi pada saat musabaqah.',
          'Teks ayat antara 0,5-1,5 baris (ayat penuh atau potongan ayat) ukuran mushaf.',
          'Karya dibuat di atas kain kanvas berspanram ukuran 60 x 80 cm.',
          'Dilarangan menggunakan imajinasi makhluk hidup dan hewan.',
          'Alokasi waktu selama 480 menit (8 jam) termasuk istirahat.',
        ],
      },
      {
        heading: 'F. CABANG REBANA KLASIK',
        items: [
          {
            label: '1. Melantunkan 2 Qasidah (1 Wajib dan 1 Pilihan):',
            text: '',
            subitems: [
              'Qasidah wajib : "Al-Qur’an" dipopulerkan oleh Hj. Nur Asiah Djamil.',
              'Qasidah pilihan: a. Magadir, b. Perdamaian, c. Kasih sayangnya bunda, d. Jilbab putih.',
            ],
          },
          {
            label: '2. Ketentuan Tampil & Perlengkapan:',
            text: '',
            subitems: [
              'Waktu lomba selama maksimal 15 menit (sudah termasuk persiapan alat dan cek sound).',
              'Isyarat lomba kondisional dari juri.',
              'Peserta hadir 30 menit sebelum acara.',
              'Alat membawa sendiri.',
              'Dilarang menggunakan alat berirama nada notasi (Contoh: Seruling, Piano, Belera, Biola, dsb).',
              'Tidak diperkenankan menggunakan alat music elektrik.',
            ],
          },
        ],
      },
      {
        heading: 'IV. PENDAFTARAN PESERTA',
        subheading: 'A. PERSYARATAN ADMINISTRASI :',
        paragraphs: [
          '1. Surat Mandat dari Desa.',
          '2. Surat Keterangan Berdomisili minimal.',
          '3. Photo Copy Ijazah Sekolah.',
          '4. Photo Copy Akte Kelahiran.',
        ],
      },
    ],
  },

  // Halaman 7: Persyaratan Berkas Lanjutan, Map Biru, Sanksi & Penilaian Dewan Hakim
  {
    page_number: 7,
    sections: [
      {
        heading: 'Persyaratan Administrasi (Lanjutan):',
        paragraphs: [
          '5. Photo Copy Kartu Keluarga yang memakai NIK.',
          '6. Surat Pernyataan Kebenaran Dokumen.',
        ],
      },
      {
        heading: 'B. BERKAS PENDAFTARAN PESERTA',
        paragraphs: [
          'BERKAS PENDAFTARAN PESERTA DISERTAI DENGAN DOKUMEN ASLI DAN PHOTO COPYNYA RANGKAP 1 (SATU) DIMASUKKAN KEDALAM MAP WARNA BIRU DISAMPAIKAN DI SEKRETARIAT LPTQ KECAMATAN/BAGIAN ADMINISTRASI MTQ DESA MAHATO.',
        ],
      },
      {
        heading: 'C. SANKSI-SANKSI',
        paragraphs: [
          '1. Peserta yang tidak memenuhi persyaratan tidak mendapat pengesahan dan tidak berhak untuk mengikuti Musabaqah;',
          '2. Peserta yang diketahui menggunakan persyaratan palsu seperti manipulasi umur, gugur hak tampilnya.',
        ],
      },
      {
        heading: 'D. PESERTA TERBAIK',
        items: [
          {
            label: '1. Penentuan Nilai Tertinggi:',
            text: 'Peserta terbaik adalah urutan tertinggi dalam perolehan nilai tampil.',
          },
          {
            label: '2. Apabila Nilai Sama (Cabang Tilawah):',
            text: 'Ditentukan secara berurut nilai tertinggi tajwidnya, kemudian lagu dan suara apabila masih sama, dimungkinkan adanya juara kembar.',
          },
          {
            label: '3. Cabang Hifzhil Qur’an:',
            text: '',
            subitems: [
              'Golongan 1 Juz dan 5 Juz penentuannya secara berturut-turut pada nilai tertinggi kelompok Tahfidz, apabila pada kelompok tersebut sama, maka penentuan pada nilai Tajwid Kelompok Tahfidz. Apabila masih sama, ditentukan nilai tajwid pada kelompok Tilawah. Apabila tetap sama dimungkinkan juara kembar.',
              'Golongan 10 Juz penentuannya secara berturut pada nilai tertinggi tajwid, kemudian tahfidz, apabila masih sama dimungkinkan juara kembar.',
            ],
          },
          {
            label: '4. Keputusan Dewan Hakim:',
            text: 'Cabang-cabang yang lainnya menyesuaikan, keputusan tertinggi dan tidak bisa diganggu gugat ada pada Dewan Hakim MTQ XIX Kecamatan Tambusai Utara Tahun 2026.',
          },
        ],
      },
    ],
  },

  // Halaman 8: Ketentuan Umum Kafilah (6 Poin Wajib) & Tanda Tangan/Stempel Resmi
  {
    page_number: 8,
    title: 'KETENTUAN UMUM KAFILAH MTQ KE-XIX TINGKAT KECAMATAN TAMBUSAI UTARA TAHUN 2026',
    sections: [
      {
        items: [
          {
            label: '1.',
            text: 'Setiap Desa wajib berpartisipasi mengirimkan peserta kafilah pada MTQ Tingkat Kecamatan.',
          },
          {
            label: '2.',
            text: 'Peserta /kafilah adalah putra putri asal Tambusai Utara dan tidak di benarkan setiap desa yang mengirim peserta/kafilah dari putra putri di luar Tambusai Utara.',
          },
          {
            label: '3.',
            text: 'Setiap peserta hanya boleh mengikuti 1 cabang musabaqoh.',
          },
          {
            label: '4.',
            text: 'Setiap Desa boleh membawa peserta /kafilah dari desa lain, selagi itu putra putri Tambusai Utara apabila terdapat keterbatasan dan kekurangan peserta dan wajib mendapat rekomendasi dari LPTQ desa di mana peserta/kafilah tersebut berdomisili.',
          },
          {
            label: '5.',
            text: 'Kepada desa/LPTQ yang membawa perwakilan peserta/kafilah dari desa lain harus bertanggung jawab terhadap keperluan dan perlengkapan yang dibutuhkan peserta/kafilah pada saat mengikuti musabaqoh menurut keperluan semestinya.',
          },
          {
            label: '6.',
            text: 'Kepada desa/peserta yg terdapat membawa peserta/kafilah di luar Tambusai Utara maka akan langsung di diskualifikasi dan tidak dapat tampil mengikuti MTQ.',
          },
        ],
      },
    ],
    show_signature: true,
  },
];

export interface JuknisBranch {
  id: string;
  name: string;
  shortName: string;
  format: 'INDIVIDU' | 'REGU_3' | 'REGU_11';
  formatLabel: string;
  personelCount: number;
  expectedCategoryCount: number;
}

export const JUKNIS_BRANCHES: JuknisBranch[] = [
  {
    id: 'seni-baca',
    name: "Cabang Seni Baca Al-Qur'an",
    shortName: 'Seni Baca',
    format: 'INDIVIDU',
    formatLabel: 'Individu (1 Orang)',
    personelCount: 1,
    expectedCategoryCount: 8,
  },
  {
    id: 'hafalan',
    name: "Cabang Hafalan Al-Qur'an (Hifzil)",
    shortName: 'Hafalan',
    format: 'INDIVIDU',
    formatLabel: 'Individu (1 Orang)',
    personelCount: 1,
    expectedCategoryCount: 6,
  },
  {
    id: 'fahmil',
    name: "Cabang Fahmil Al-Qur'an",
    shortName: 'Fahmil',
    format: 'REGU_3',
    formatLabel: 'Regu (3 Orang)',
    personelCount: 3,
    expectedCategoryCount: 3,
  },
  {
    id: 'syarhil',
    name: "Cabang Syarhil Al-Qur'an",
    shortName: 'Syarhil',
    format: 'REGU_3',
    formatLabel: 'Regu (3 Orang)',
    personelCount: 3,
    expectedCategoryCount: 3,
  },
  {
    id: 'kaligrafi',
    name: "Cabang Seni Kaligrafi Al-Qur'an",
    shortName: 'Kaligrafi',
    format: 'INDIVIDU',
    formatLabel: 'Individu (1 Orang)',
    personelCount: 1,
    expectedCategoryCount: 4,
  },
  {
    id: 'rebana',
    name: 'Cabang Rebana Klasik',
    shortName: 'Rebana',
    format: 'REGU_11',
    formatLabel: 'Regu (11 Orang)',
    personelCount: 11,
    expectedCategoryCount: 1,
  },
];

export function getCategoryBranchInfo(categoryName: string): {
  branchId: string;
  branchName: string;
  shortBranchName: string;
  format: 'INDIVIDU' | 'REGU_3' | 'REGU_11';
  formatLabel: string;
  personelCount: number;
} {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('tartil') || name.includes('tilawah')) {
    return {
      branchId: 'seni-baca',
      branchName: "Cabang Seni Baca Al-Qur'an",
      shortBranchName: 'Seni Baca',
      format: 'INDIVIDU',
      formatLabel: 'Individu (1 Orang)',
      personelCount: 1,
    };
  }
  if (name.includes('hifzil') || name.includes('tahfidz') || name.includes('hafalan')) {
    return {
      branchId: 'hafalan',
      branchName: "Cabang Hafalan Al-Qur'an (Hifzil)",
      shortBranchName: 'Hafalan',
      format: 'INDIVIDU',
      formatLabel: 'Individu (1 Orang)',
      personelCount: 1,
    };
  }
  if (name.includes('fahmil')) {
    return {
      branchId: 'fahmil',
      branchName: "Cabang Fahmil Al-Qur'an",
      shortBranchName: 'Fahmil',
      format: 'REGU_3',
      formatLabel: 'Regu (3 Orang)',
      personelCount: 3,
    };
  }
  if (name.includes('syarhil')) {
    return {
      branchId: 'syarhil',
      branchName: "Cabang Syarhil Al-Qur'an",
      shortBranchName: 'Syarhil',
      format: 'REGU_3',
      formatLabel: 'Regu (3 Orang)',
      personelCount: 3,
    };
  }
  if (name.includes('kaligrafi')) {
    return {
      branchId: 'kaligrafi',
      branchName: "Cabang Seni Kaligrafi Al-Qur'an",
      shortBranchName: 'Kaligrafi',
      format: 'INDIVIDU',
      formatLabel: 'Individu (1 Orang)',
      personelCount: 1,
    };
  }
  if (name.includes('rebana')) {
    return {
      branchId: 'rebana',
      branchName: 'Cabang Rebana Klasik',
      shortBranchName: 'Rebana',
      format: 'REGU_11',
      formatLabel: 'Regu (11 Orang)',
      personelCount: 11,
    };
  }
  return {
    branchId: 'lainnya',
    branchName: 'Lainnya',
    shortBranchName: 'Lainnya',
    format: 'INDIVIDU',
    formatLabel: 'Individu',
    personelCount: 1,
  };
}

export const JUKNIS_REQUIRED_DOCUMENTS = [
  {
    code: 'SURAT_MANDAT',
    name: 'Surat Mandat dari Desa',
    hint: 'Surat tugas/mandat resmi yang ditandatangani Kepala Desa pengirim kafilah.',
  },
  {
    code: 'SURAT_DOMISILI',
    name: 'Surat Keterangan Berdomisili Minimal Tambusai Utara',
    hint: 'Bukti domisili bahwa peserta adalah putra/putri asal Kecamatan Tambusai Utara.',
  },
  {
    code: 'IJAZAH',
    name: 'Photo Copy Ijazah Sekolah',
    hint: 'Fotokopi ijazah formal atau raport/surat keterangan sekolah/madrasah.',
  },
  {
    code: 'AKTE_KELAHIRAN',
    name: 'Photo Copy Akte Kelahiran',
    hint: 'Fotokopi akte kelahiran untuk validasi batas usia per 09 November 2026.',
  },
  {
    code: 'KARTU_KELUARGA',
    name: 'Photo Copy Kartu Keluarga yang Memakai NIK',
    hint: 'Fotokopi Kartu Keluarga yang mencantumkan NIK 16 digit yang valid.',
  },
  {
    code: 'SURAT_PERNYATAAN',
    name: 'Surat Pernyataan Kebenaran Dokumen',
    hint: 'Surat pernyataan keabsahan dan kebenaran seluruh dokumen pendaftaran bermaterai.',
  },
];

