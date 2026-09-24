'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Printer,
  Download,
  Calendar,
  MapPin,
  FileCheck,
  Award,
  Users,
  AlertTriangle,
  Scale,
  Music,
  CheckCircle2,
} from 'lucide-react';

const SYARHIL_THEMES = [
  'Optimalisasi Pengelolaan Zakat untuk Pemberdayaan Ekonomi Umat',
  'Toleransi Umat Beragama dalam Kehidupan Berbangsa',
  'Optimalisasi Fungsi Masjid dalam Pembangunan Bangsa',
  'Perspektif Islam Tentang Lingkungan Hidup',
  'Literasi Waqaf untuk Kemandirian Umat',
  'Narkoba Musuh Bersama Umat dan Bangsa',
  'Pendidikan Ramah Anak Menurut Al-Qur\'an',
  'Generasi Muda Beradab untuk Indonesia Emas 2045',
  'Pemberantasan Korupsi Menurut Al-Qur\'an',
];

const CABANG_LIST = [
  {
    kategori: 'Cabang Seni Baca Al-Qur\'an',
    items: [
      { nama: 'Golongan Tartil Al-Qur\'an Putra & Putri', umur: 'Maks. 12 thn 11 bln 29 hr', durasi: '5 - 7 Menit', maqra: 'Juz 1 s/d Juz 10 (Ditentukan 16 jam sebelum tampil)' },
      { nama: 'Golongan Tilawah Anak-Anak Putra & Putri', umur: 'Maks. 14 thn 11 bln 29 hr', durasi: '6 - 8 Menit', maqra: 'Juz 1 s/d Juz 20 (Ditentukan 16 jam sebelum tampil)' },
      { nama: 'Golongan Tilawah Remaja Putra & Putri', umur: 'Maks. 24 thn 11 bln 29 hr', durasi: '7 - 9 Menit', maqra: 'Juz 1 s/d Juz 20 (Ditentukan 16 jam sebelum tampil)' },
      { nama: 'Golongan Tilawah Dewasa Putra & Putri', umur: 'Maks. 40 thn 11 bln 29 hr', durasi: '9 - 10 Menit', maqra: 'Juz 1 s/d Juz 30 (Ditentukan saat peserta naik mimbar tilawah)' },
    ],
  },
  {
    kategori: 'Cabang Hafalan Al-Qur\'an (Hifzhil Qur\'an)',
    items: [
      { nama: 'Golongan 1 Juz dan Tilawah Putra & Putri', umur: 'Maks. 15 thn 11 bln 29 hr', durasi: '6 - 7 Menit (Tilawah) + 3 Soal Tahfidz', maqra: 'Tilawah: Juz 1-10 (min 3 lagu); Tahfidz: Juz 1 atau Juz 30 (5-8 baris Bahriyyah)' },
      { nama: 'Golongan 5 Juz dan Tilawah Putra & Putri', umur: 'Maks. 20 thn 11 bln 29 hr', durasi: '7 - 8 Menit (Tilawah) + 3 Soal Tahfidz', maqra: 'Tilawah: Juz 1-20 (min 3 lagu); Tahfidz: Juz 1 s/d Juz 5 (6-10 baris Bahriyyah)' },
      { nama: 'Golongan 10 Juz Putra & Putri', umur: 'Maks. 22 thn 11 bln 29 hr', durasi: '3 Pertanyaan Hafalan', maqra: 'Materi hafalan Juz 1 s/d Juz 10' },
    ],
  },
  {
    kategori: 'Cabang Fahmil Al-Qur\'an (MFQ)',
    items: [
      { nama: 'Golongan Remaja Putra & Putri (Regu 3 Orang)', umur: 'Maks. 18 thn 11 bln 29 hr', durasi: 'Babak Penyisihan & Final', maqra: 'Kurikulum Madrasah Aliyah & Ponpes, wawasan Al-Qur\'an & wawasan kebangsaan (10-12 soal regu & 10-15 soal rebutan)' },
      { nama: 'Golongan Anak-anak Campuran (Regu 3 Orang Pa/Pi)', umur: 'Maks. 13 thn 11 bln 29 hr', durasi: 'Babak Penyisihan & Final', maqra: 'Materi dasar keislaman, tajwid, terjemah ayat pilihan, dan pemahaman nilai Al-Qur\'an' },
    ],
  },
  {
    kategori: 'Cabang Syarhil Al-Qur\'an (MSQ)',
    items: [
      { nama: 'Golongan Remaja Putra & Putri (Regu 3 Orang)', umur: 'Maks. 18 thn 11 bln 29 hr', durasi: '15 - 20 Menit', maqra: '3 Unsur (Tilawah, Deklamasi/Terjemah, Pidato Retorika tanpa teks). Mengacu pada 9 Tema Resmi Juknis.' },
      { nama: 'Golongan Anak-anak Campuran (Regu 3 Orang Pa/Pi)', umur: 'Maks. 13 thn 11 bln 29 hr', durasi: '15 - 20 Menit', maqra: '3 Unsur sinergis. Mengacu pada 9 Tema Resmi Juknis MTQ XIX.' },
    ],
  },
  {
    kategori: 'Cabang Seni Kaligrafi Al-Qur\'an (MKQ)',
    items: [
      { nama: 'Golongan Naskah Putra & Putri', umur: 'Maks. 34 thn 11 bln 29 hr', durasi: '480 Menit (8 Jam)', maqra: 'Khat Naskhi wajib (5-10 baris) & 4 jenis khat pilihan (4-5 baris) diundi. Media 2 lembar karton penuh.' },
      { nama: 'Golongan Hiasan Mushaf Putra & Putri', umur: 'Maks. 34 thn 11 bln 29 hr', durasi: '480 Menit (8 Jam)', maqra: 'Teks Al-Qur\'an 4-5 baris mushaf dengan ornamen bingkai iluminasi khas nusantara/Al-Fatihah/Al-Baqarah. Media 1 karton penuh.' },
      { nama: 'Golongan Dekorasi Putra & Putri', umur: 'Maks. 34 thn 11 bln 29 hr', durasi: '480 Menit (8 Jam)', maqra: 'Khat dekoratif (5 dari 7 gaya khat diundi). Media triplek berukuran 122 cm x 80 cm.' },
      { nama: 'Golongan Kontemporer Putra & Putri', umur: 'Maks. 34 thn 11 bln 29 hr', durasi: '480 Menit (8 Jam)', maqra: '4 Gaya kontemporer (Tradisional, Figural, Ekspresionis, Abstrak). Media kanvas 60 x 80 cm berspanram. Dilarang menggambar makhluk bernyawa.' },
    ],
  },
  {
    kategori: 'Cabang Rebana Klasik',
    items: [
      { nama: 'Rebana Klasik Campuran / Putra / Putri (Regu 11 Orang)', umur: 'Maks. 38 thn 11 bln 29 hr', durasi: 'Maks. 15 Menit', maqra: '1 Lagu Wajib: "Al-Qur\'an" (Cipt. Hj. Nur Asiah Djamil). 1 Lagu Pilihan: Magadir, Perdamaian, Kasih sayangnya bunda, Jilbab putih. Alat musik perkusi tradisional tanpa tangga nada / elektrik.' },
    ],
  },
];

const BERKAS_LIST = [
  { no: 1, kode: 'SURAT_MANDAT', nama: 'Surat Mandat dari Desa', ket: 'Surat mandat resmi yang ditandatangani oleh Kepala Desa atau Pengurus LPTK Desa setempat.' },
  { no: 2, kode: 'SURAT_DOMISILI', nama: 'Surat Keterangan Berdomisili', ket: 'Surat keterangan domisili sah yang membuktikan peserta bertempat tinggal di wilayah Kecamatan Tambusai Utara.' },
  { no: 3, kode: 'IJAZAH', nama: 'Photo Copy Ijazah Sekolah', ket: 'Fotokopi ijazah pendidikan formal terakhir atau rapor/surat keterangan aktif sekolah yang telah dilegalisir.' },
  { no: 4, kode: 'AKTE_KELAHIRAN', nama: 'Photo Copy Akte Kelahiran', ket: 'Fotokopi akta kelahiran resmi untuk verifikasi batas usia musabaqah per 09 November 2026.' },
  { no: 5, kode: 'KARTU_KELUARGA', nama: 'Photo Copy Kartu Keluarga yang Memakai NIK', ket: 'Fotokopi KK nasional terbaru yang mencantumkan Nomor Induk Kependudukan (NIK) 16 digit.' },
  { no: 6, kode: 'SURAT_PERNYATAAN', nama: 'Surat Pernyataan Kebenaran Dokumen', ket: 'Surat pernyataan keaslian dan kesiapan mematuhi tata tertib Juknis bermaterai Rp 10.000,-.' },
];

export default function JuknisPage() {
  const [activeTab, setActiveTab] = useState<'umum' | 'cabang' | 'materi' | 'berkas' | 'penilaian'>('umum');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/csv copy of Juknis summary
    const content = `PETUNJUK TEKNIS RESMI MTQ KE-XIX TINGKAT KECAMATAN TAMBUSAI UTARA TAHUN 2026 DI DESA MAHATO
Nomor: 09/LPTQ-T.U/MTQ/IX/2026
Tanggal: 10 September 2026
Ketua Umum LPTQ: Rahmat Saputra
Sekretariat: Kantor KUA Kec. Tambusai Utara, Rantau Kasai, Rokan Hulu, Riau
Pelaksanaan: 09 – 13 November 2026 di Desa Mahato

KETENTUAN UMUM:
1. Peserta adalah warga asli atau berdomisili di Kecamatan Tambusai Utara.
2. Peserta hanya diperbolehkan mengikuti 1 (satu) cabang musabaqah.
3. Seluruh berkas pendaftaran wajib dimasukkan ke dalam Map Warna Biru.
4. Batas usia dihitung secara sah per 09 November 2026.
5. Peserta yang memalsukan identitas atau berasal dari luar wilayah langsung didiskualifikasi.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Juknis_MTQ_XIX_Tambusai_Utara_2026_Desa_Mahato.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Juknis</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Petunjuk Teknis Resmi MTQ ke-XIX Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Unduh
          </Button>
          <Button size="sm" onClick={handlePrint} className="text-xs">
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Cetak
          </Button>
        </div>
      </div>

      {/* Official Header Card (Letterhead style) */}
      <div className="p-6 bg-white border border-neutral-300 rounded shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="text-center pb-5 border-b-2 border-black space-y-1">
          <h2 className="text-xs tracking-widest uppercase font-semibold text-neutral-600">
            Lembaga Pengembangan Tilawatil Qur'an (LPTQ)
          </h2>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-black uppercase">
            Kecamatan Tambusai Utara — Kabupaten Rokan Hulu
          </h1>
          <p className="text-[11px] text-neutral-600 italic">
            Sekretariat: Kantor KUA - Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara, Kab. Rokan Hulu - Riau
          </p>
        </div>

        {/* Decree & Event Subheader */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs bg-neutral-50 p-4 rounded mt-4 border border-neutral-200 print:bg-white print:border-neutral-400">
          <div>
            <div className="text-neutral-500 text-[10px] uppercase font-bold">Surat Keputusan / Edaran</div>
            <div className="font-mono font-semibold text-black mt-0.5">09/LPTQ-T.U/MTQ/IX/2026</div>
            <div className="text-[11px] text-neutral-600 mt-0.5">Tertanggal: 10 September 2026</div>
          </div>
          <div>
            <div className="text-neutral-500 text-[10px] uppercase font-bold">Penyelenggaraan & Tuan Rumah</div>
            <div className="font-semibold text-black mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              Desa Mahato, Tambusai Utara
            </div>
            <div className="text-[11px] text-neutral-600 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" />
              09 – 13 November 2026
            </div>
          </div>
          <div>
            <div className="text-neutral-500 text-[10px] uppercase font-bold">Penanggung Jawab LPTQ</div>
            <div className="font-semibold text-black mt-0.5">Rahmat Saputra</div>
            <div className="text-[11px] text-neutral-600 mt-0.5">Ketua Umum LPTQ Kec. Tambusai Utara</div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs (Hidden in Print) */}
      <div className="flex border-b border-neutral-200 overflow-x-auto print:hidden">
        {[
          { key: 'umum', label: 'Umum' },
          { key: 'cabang', label: 'Cabang' },
          { key: 'materi', label: 'Materi' },
          { key: 'berkas', label: 'Berkas' },
          { key: 'penilaian', label: 'Penilaian' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-black text-black font-bold'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Ketentuan Umum */}
      {(activeTab === 'umum' || typeof window === 'undefined') && (
        <div className="space-y-4">
          <div className="bg-white border border-neutral-300 rounded p-6 space-y-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Ketentuan Umum Peserta & Kafilah
            </h2>
            <div className="space-y-3 text-xs text-neutral-800 leading-relaxed">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                <strong>1. Asal Usul Peserta:</strong> Peserta MTQ ke-XIX adalah putra-putri yang berdomisili di desa-desa dalam wilayah administratif Kecamatan Tambusai Utara, dibuktikan dengan Surat Mandat Kepala Desa, KTP/Surat Keterangan Domisili, dan Kartu Keluarga ber-NIK.
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                <strong>2. Pembatasan Cabang (Aturan Ketat):</strong> Setiap peserta hanya diperbolehkan mengikuti <strong>1 (satu) cabang musabaqah</strong> saja. Peserta yang terbukti merangkap cabang akan didiskualifikasi dari seluruh cabang lomba.
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                <strong>3. Penentuan Usia:</strong> Batas umur maksimal peserta dihitung secara tepat per tanggal pelaksanaan pembukaan MTQ, yaitu <strong>09 November 2026</strong>. Bukti umur wajib didasarkan pada Akta Kelahiran dan Ijazah asli/fotokopi legalisir.
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                <strong>4. Wadah Pengumpulan Berkas Fisik:</strong> Seluruh berkas pendaftaran peserta wajib diserahkan dalam <strong>Map Berwarna Biru</strong> ke Sekretariat LPTQ Kecamatan Tambusai Utara atau Panitia Pendaftaran MTQ di Desa Mahato.
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                <strong>5. Sanksi Diskualifikasi:</strong> Peserta yang terbukti menggunakan identitas palsu, berasal dari luar Kecamatan Tambusai Utara tanpa legalitas mutasi sah, atau memanipulasi usia akan langsung <strong>didiskualifikasi</strong> dan hak kejuaraannya dicabut.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cabang & Batasan Umur */}
      {activeTab === 'cabang' && (
        <div className="space-y-6">
          {CABANG_LIST.map((c, idx) => (
            <div key={idx} className="bg-white border border-neutral-300 rounded p-5 space-y-3">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-neutral-200 pb-2">
                <Award className="w-4 h-4" />
                {c.kategori}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-300 bg-neutral-50 text-[11px] font-semibold text-neutral-700 uppercase">
                      <th className="py-2.5 px-3">Golongan Musabaqah</th>
                      <th className="py-2.5 px-3">Batasan Umur (Per 09 Nov 2026)</th>
                      <th className="py-2.5 px-3">Durasi</th>
                      <th className="py-2.5 px-3">Materi / Maqra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-800">
                    {c.items.map((it, i) => (
                      <tr key={i} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-black">{it.nama}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{it.umur}</td>
                        <td className="py-2.5 px-3">{it.durasi}</td>
                        <td className="py-2.5 px-3 text-neutral-600 leading-tight">{it.maqra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Materi & Ketentuan Khusus (9 Tema Syarhil & Rebana Klasik) */}
      {activeTab === 'materi' && (
        <div className="space-y-6">
          {/* 9 Tema Syarhil Al-Qur'an */}
          <div className="bg-white border border-neutral-300 rounded p-6 space-y-4">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              9 Tema Resmi Cabang Syarhil Al-Qur'an (MSQ)
            </h2>
            <p className="text-xs text-neutral-600">
              Setiap regu Syarhil Al-Qur'an (3 orang) membawakan materi syarahan berdasarkan salah satu dari sembilan tema resmi yang ditetapkan LPTQ Kecamatan Tambusai Utara berikut ini:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SYARHIL_THEMES.map((theme, i) => (
                <div key={i} className="p-3.5 border border-neutral-200 rounded bg-neutral-50 text-xs flex items-start gap-2.5">
                  <span className="font-bold text-black font-mono text-xs">{i + 1}.</span>
                  <span className="text-neutral-800 font-medium leading-snug">{theme}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ketentuan Khusus Rebana Klasik */}
          <div className="bg-white border border-neutral-300 rounded p-6 space-y-4">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4" />
              Ketentuan Khusus Cabang Rebana Klasik
            </h2>
            <div className="space-y-3 text-xs text-neutral-800 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-200 rounded bg-neutral-50 space-y-2">
                  <div className="font-bold text-black uppercase text-[11px]">Format & Personel</div>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                    <li>Jumlah personel: <strong>11 (sebelas) orang</strong> per regu.</li>
                    <li>Komposisi: Putra, Putri, atau Campuran.</li>
                    <li>Batas usia: Maksimal <strong>38 tahun 11 bulan 29 hari</strong> per 09 Nov 2026.</li>
                    <li>Waktu tampil maksimal: <strong>15 (lima belas) menit</strong>.</li>
                  </ul>
                </div>

                <div className="p-4 border border-neutral-200 rounded bg-neutral-50 space-y-2">
                  <div className="font-bold text-black uppercase text-[11px]">Lagu & Instrumen</div>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                    <li><strong>Lagu Wajib:</strong> "Al-Qur'an" (Cipt. Hj. Nur Asiah Djamil).</li>
                    <li><strong>Lagu Pilihan (Pilih 1):</strong> Magadir, Perdamaian, Kasih sayangnya bunda, Jilbab putih.</li>
                    <li>Alat musik rebana dibawa sendiri oleh masing-masing regu.</li>
                    <li><strong>Dilarang:</strong> Alat nada ber-notasi melodi (keyboard, gitar, suling) atau alat bertenaga elektrik.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Persyaratan Berkas */}
      {activeTab === 'berkas' && (
        <div className="bg-white border border-neutral-300 rounded p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              6 Dokumen Persyaratan Administrasi Peserta
            </h2>
            <span className="text-[11px] font-semibold text-black bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300">
              Wadah: Map Warna Biru
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-300 bg-neutral-50 text-[11px] font-semibold text-neutral-700 uppercase">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Kode Dokumen</th>
                  <th className="py-2.5 px-3">Nama Berkas Persyaratan</th>
                  <th className="py-2.5 px-3">Uraian & Ketentuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-800">
                {BERKAS_LIST.map((b) => (
                  <tr key={b.no} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-3 text-center font-mono font-bold">{b.no}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-neutral-600">{b.kode}</td>
                    <td className="py-3 px-3 font-semibold text-black">{b.nama}</td>
                    <td className="py-3 px-3 text-neutral-600">{b.ket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Kriteria Penilaian */}
      {activeTab === 'penilaian' && (
        <div className="bg-white border border-neutral-300 rounded p-6 space-y-4">
          <h2 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-neutral-200 pb-3">
            <Scale className="w-4 h-4" />
            Unsur Penilaian Dewan Hakim MTQ XIX
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 border border-neutral-200 rounded bg-neutral-50 space-y-2">
              <div className="font-bold text-black uppercase text-[11px]">Seni Baca (Tilawah & Tartil)</div>
              <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                <li><strong>Tajwid (30 Poin):</strong> Makharijul huruf, shifatul huruf, ahkamul mad wal qashr.</li>
                <li><strong>Fashahah & Adab (30 Poin):</strong> Ahkamul waqaf wal ibtida, mura'atul huruf wal harakat.</li>
                <li><strong>Lagu & Suara (40 Poin):</strong> Keutuhan tempo, peralihan nada, variasi irama minimal 3 maqam lagu.</li>
              </ul>
            </div>

            <div className="p-4 border border-neutral-200 rounded bg-neutral-50 space-y-2">
              <div className="font-bold text-black uppercase text-[11px]">Hafalan (Hifzhil Qur'an)</div>
              <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                <li><strong>Tahfidz (50 Poin):</strong> Kelancaran hafalan, tidak ada tawaqquf/ragu berlebih, tepat menyambung ayat.</li>
                <li><strong>Tajwid (25 Poin):</strong> Ketepatan hukum tajwid dan makhraj dalam tartil hafalan.</li>
                <li><strong>Fashahah & Adab (25 Poin):</strong> Kesopanan, pakaian islami, dan ketegasan menjawab soal dewan juri.</li>
              </ul>
            </div>

            <div className="p-4 border border-neutral-200 rounded bg-neutral-50 space-y-2">
              <div className="font-bold text-black uppercase text-[11px]">Syarhil & Fahmil Qur'an</div>
              <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                <li><strong>Materi / Syarah (40 Poin):</strong> Kedalaman isi sesuai tema, referensi ayat dan hadits yang relevan.</li>
                <li><strong>Penghayatan & Retorika (30 Poin):</strong> Intonasi, gesture, mimik wajah, dan kekompakan trio penyaji.</li>
                <li><strong>Tilawah & Terjemah (30 Poin):</strong> Kualitas tilawah pembuka dan puitisasi terjemahan ayat Al-Qur'an.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Official Sign-off Footer */}
      <div className="p-6 bg-white border border-neutral-300 rounded text-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-neutral-600 gap-2 border-b border-neutral-200 pb-3">
          <div>Ditetapkan di: Rantau Kasai, Tambusai Utara</div>
          <div>Pada tanggal: 10 September 2026</div>
        </div>
        <div className="flex justify-end pt-2">
          <div className="text-center w-64 space-y-12">
            <div>
              <div className="font-semibold text-black uppercase text-[11px]">Lembaga Pengembangan Tilawatil Qur'an</div>
              <div className="text-neutral-600">Kecamatan Tambusai Utara</div>
              <div className="font-bold text-black mt-1">Ketua Umum,</div>
            </div>
            <div>
              <div className="font-bold text-black text-sm underline">RAHMAT SAPUTRA</div>
              <div className="text-[11px] text-neutral-500 font-mono">LPTQ KEC. TAMBUSAI UTARA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
