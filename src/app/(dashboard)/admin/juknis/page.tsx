'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Printer,
  Download,
  Search,
} from 'lucide-react';
import {
  JUKNIS_OFFICIAL_HEADER,
  JUKNIS_PAGES,
} from '@/data/juknis-official-data';

export default function JuknisPage() {
  const [viewMode, setViewMode] = useState<'dokumen' | 'ringkasan'>('dokumen');
  const [selectedCabangFilter, setSelectedCabangFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState('/api/cdn/cdn/logos/lptq-logo.png');
  const [stampUrl, setStampUrl] = useState('/api/cdn/cdn/logos/lptq-stempel.png');

  useEffect(() => {
    fetch('/api/meta/branding')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.app_logo_url) setLogoUrl(json.data.app_logo_url);
        if (json?.data?.app_stamp_url) setStampUrl(json.data.app_stamp_url);
      })
      .catch(() => {});
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Download the authentic official PDF directly
    const link = document.createElement('a');
    link.href = '/documents/juknis-mtq-xix-tambusai-utara-2026.pdf';
    link.download = 'Juknis_MTQ_XIX_Tambusai_Utara_2026_Desa_Mahato.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data ringkasan cabang musabaqah untuk mode administratif
  const CABANG_DATA = [
    { cabang: 'Seni Baca', golongan: "Tartil Al-Qur'an Pa/Pi", umur: 'Maks. 12 thn 11 bln 29 hr', durasi: '5 - 7 Menit', maqra: 'Juz 1 s/d Juz 10 (16 jam sebelum tampil)' },
    { cabang: 'Seni Baca', golongan: 'Tilawah Anak-Anak Pa/Pi', umur: 'Maks. 14 thn 11 bln 29 hr', durasi: '6 - 8 Menit', maqra: 'Juz 1 s/d Juz 20 (16 jam sebelum tampil)' },
    { cabang: 'Seni Baca', golongan: 'Tilawah Remaja Pa/Pi', umur: 'Maks. 24 thn 11 bln 29 hr', durasi: '7 - 9 Menit', maqra: 'Juz 1 s/d Juz 20 (16 jam sebelum tampil)' },
    { cabang: 'Seni Baca', golongan: 'Tilawah Dewasa Pa/Pi', umur: 'Maks. 40 thn 11 bln 29 hr', durasi: '9 - 10 Menit', maqra: 'Juz 1 s/d 30 (Saat naik mimbar tilawah)' },
    { cabang: 'Hafalan', golongan: '1 Juz dan Tilawah Pa/Pi', umur: 'Maks. 15 thn 11 bln 29 hr', durasi: '6 - 7 Mnt + 3 Soal', maqra: 'Tilawah Juz 1-10; Tahfidz Juz 1 atau Juz 30' },
    { cabang: 'Hafalan', golongan: '5 Juz dan Tilawah Pa/Pi', umur: 'Maks. 20 thn 11 bln 29 hr', durasi: '7 - 8 Mnt + 3 Soal', maqra: 'Tilawah Juz 1-20; Tahfidz Juz 1 s/d Juz 5' },
    { cabang: 'Hafalan', golongan: '10 Juz Pa/Pi', umur: 'Maks. 22 thn 11 bln 29 hr', durasi: '3 Pertanyaan', maqra: 'Materi hafalan Juz 1 s/d Juz 10' },
    { cabang: 'Fahmil', golongan: 'Gol. Anak Campuran (Regu 3 Org)', umur: 'Maks. 13 thn 11 bln 29 hr', durasi: 'Penyisihan & Final', maqra: 'Kurikulum MA, Ponpes, wawasan Al-Qur\'an & kebangsaan' },
    { cabang: 'Fahmil', golongan: 'Gol. Remaja Putra (Regu 3 Org)', umur: 'Maks. 18 thn 11 bln 29 hr', durasi: 'Penyisihan & Final', maqra: 'Paket regu 10-12 soal & rebutan 10-15 soal' },
    { cabang: 'Fahmil', golongan: 'Gol. Remaja Putri (Regu 3 Org)', umur: 'Maks. 18 thn 11 bln 29 hr', durasi: 'Penyisihan & Final', maqra: 'Paket regu 10-12 soal & rebutan 10-15 soal' },
    { cabang: 'Syarhil', golongan: 'Gol. Anak Campuran (Regu 3 Org)', umur: 'Maks. 13 thn 11 bln 29 hr', durasi: '15 - 20 Menit', maqra: '3 Unsur (Tilawah, Deklamasi, Pidato). 9 Tema Resmi.' },
    { cabang: 'Syarhil', golongan: 'Gol. Remaja Putra (Regu 3 Org)', umur: 'Maks. 18 thn 11 bln 29 hr', durasi: '15 - 20 Menit', maqra: '3 Unsur. Penentuan judul 24 jam (penyisihan) / 60 mnt (final)' },
    { cabang: 'Syarhil', golongan: 'Gol. Remaja Putri (Regu 3 Org)', umur: 'Maks. 18 thn 11 bln 29 hr', durasi: '15 - 20 Menit', maqra: '3 Unsur. Penentuan judul 24 jam (penyisihan) / 60 mnt (final)' },
    { cabang: 'Kaligrafi', golongan: 'Gol. Naskah Pa/Pi', umur: 'Maks. 34 thn 11 bln 29 hr', durasi: '480 Menit (8 Jam)', maqra: 'Khat Naskhi wajib & 4 pilihan. Media 2 karton penuh.' },
    { cabang: 'Kaligrafi', golongan: 'Gol. Hiasan Mushaf Pa/Pi', umur: 'Maks. 34 thn 11 bln 29 hr', durasi: '480 Menit (8 Jam)', maqra: 'Teks 4-5 baris, ornamen Al-Fatihah/Al-Baqarah. 1 karton.' },
    { cabang: 'Kaligrafi', golongan: 'Gol. Dekorasi Pa/Pi', umur: 'Maks. 34 thn 11 bln 29 hr', durasi: '480 Menit (8 Jam)', maqra: '5 dari 7 khat diundi. Media triplek 122 x 80 cm.' },
    { cabang: 'Kaligrafi', golongan: 'Gol. Kontemporer Pa/Pi', umur: 'Maks. 34 thn 11 bln 29 hr', durasi: '480 Menit (8 Jam)', maqra: '4 Gaya kontemporer. Kanvas 60 x 80 cm. Tanpa makhluk bernyawa.' },
    { cabang: 'Rebana', golongan: 'Rebana Klasik (Regu 11 Orang)', umur: 'Maks. 38 thn 11 bln 29 hr', durasi: 'Maks. 15 Menit', maqra: 'Lagu Wajib: "Al-Qur\'an" (Hj. Nur Asiah Djamil). 4 Lagu Pilihan.' },
  ];

  const filteredCabang = CABANG_DATA.filter((item) => {
    const matchCabang = selectedCabangFilter === 'ALL' || item.cabang === selectedCabangFilter;
    const matchSearch =
      searchQuery === '' ||
      item.golongan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.maqra.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCabang && matchSearch;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Top Bar Navigation (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-300 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Juknis</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Petunjuk Teknis Resmi MTQ ke-XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle: Dokumen vs Ringkasan */}
          <div className="flex items-center border border-neutral-300 rounded overflow-hidden p-0.5 bg-neutral-100">
            <button
              type="button"
              onClick={() => setViewMode('dokumen')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                viewMode === 'dokumen'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Dokumen
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ringkasan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                viewMode === 'ringkasan'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Ringkasan
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs font-semibold gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-semibold gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak
          </Button>
        </div>
      </div>

      {/* MODE 1: DOKUMEN RESMI (Persis fisik Surat Edaran 8 Halaman, Mobile-Safe & Print-Ready) */}
      {viewMode === 'dokumen' && (
        <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
          {/* Helper notice on web screen */}
          <div className="p-3 bg-neutral-100 border border-neutral-300 text-xs text-neutral-700 rounded print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>
              Format naskah dinas resmi sesuai fisik dokumen <strong>09/LPTQ-T.U/MTQ/IX/2026</strong>. Klik <strong>Cetak</strong> untuk print standar kertas A4.
            </span>
            <span className="font-mono text-[11px] text-neutral-500 font-bold shrink-0">8 Halaman Lengkap</span>
          </div>

          {/* Render all 8 pages as official paper sheets */}
          {JUKNIS_PAGES.map((page) => (
            <div
              key={page.page_number}
              className="w-full max-w-4xl mx-auto bg-white border border-neutral-300 shadow-sm p-4 sm:p-10 lg:p-14 font-serif text-black leading-relaxed relative print:border-none print:shadow-none print:p-0 print:m-0 print:break-after-page mb-6 sm:mb-8 overflow-hidden break-words"
            >
              {/* Header Kop Surat Resmi (Halaman 1) */}
              {page.page_number === 1 && (
                <div className="mb-6 w-full">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 pb-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0 flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt="Logo LPTQ"
                        className="object-contain w-full h-full max-h-20"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-center flex-1 min-w-0">
                      <h2 className="text-xs sm:text-sm font-bold tracking-tight uppercase leading-snug break-words">
                        {JUKNIS_OFFICIAL_HEADER.instansi_baris1}
                      </h2>
                      <h1 className="text-sm sm:text-lg font-black tracking-tight uppercase leading-tight mt-0.5 break-words">
                        {JUKNIS_OFFICIAL_HEADER.instansi_baris2}
                      </h1>
                      <h3 className="text-xs sm:text-xs font-bold leading-tight mt-0.5 break-words">
                        {JUKNIS_OFFICIAL_HEADER.instansi_baris3}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] font-sans text-neutral-700 leading-tight mt-1 italic break-words">
                        {JUKNIS_OFFICIAL_HEADER.alamat_sekretariat}
                      </p>
                    </div>
                  </div>

                  {/* Garis Ganda Kop Surat Resmi */}
                  <div className="border-b-2 border-black pb-0.5"></div>
                  <div className="border-b border-black mt-0.5 mb-5 sm:mb-6"></div>

                  {/* Atribut Surat Resmi */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs font-serif mb-6">
                    <div className="sm:col-span-8 space-y-1.5">
                      <div className="flex items-start">
                        <span className="w-14 sm:w-16 shrink-0 text-neutral-600">No</span>
                        <span className="w-3 shrink-0">:</span>
                        <span className="font-sans font-bold break-all flex-1 min-w-0">
                          {JUKNIS_OFFICIAL_HEADER.nomor_surat}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-14 sm:w-16 shrink-0 text-neutral-600">Lamp</span>
                        <span className="w-3 shrink-0">:</span>
                        <span className="flex-1 min-w-0">{JUKNIS_OFFICIAL_HEADER.lampiran}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-14 sm:w-16 shrink-0 text-neutral-600">Hal</span>
                        <span className="w-3 shrink-0">:</span>
                        <div className="font-bold font-sans flex-1 min-w-0 break-words">
                          Petunjuk Teknis Cabang Lomba<br />
                          Pelaksanaan MTQ ke-XIX 2026
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-4 mt-2 sm:mt-0 font-serif text-xs">
                      <div className="font-bold">Kepada Yth</div>
                      <ol className="list-decimal pl-4 space-y-0.5 mt-1 font-sans text-xs">
                        {JUKNIS_OFFICIAL_HEADER.tujuan.map((t, idx) => (
                          <li key={idx} className="break-words">{t}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Judul Halaman Dokumen jika ada (Halaman 2, 8, dll) */}
              {page.title && (
                <div className="text-center font-bold text-xs sm:text-sm tracking-wide uppercase mb-5 pb-2 border-b border-neutral-300 break-words">
                  {page.title}
                </div>
              )}

              {/* Isi Bagian Dokumen Per Halaman */}
              <div className="space-y-4 text-xs sm:text-sm text-neutral-900 leading-relaxed font-serif break-words">
                {page.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="space-y-2 break-words">
                    {sec.heading && (
                      <div className="font-bold text-xs sm:text-sm text-black tracking-tight break-words uppercase">
                        {sec.heading}
                      </div>
                    )}
                    {sec.subheading && (
                      <div className="font-bold text-xs sm:text-sm text-neutral-800 pl-1 sm:pl-2 break-words">
                        {sec.subheading}
                      </div>
                    )}

                    {sec.paragraphs && sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-left sm:text-justify text-neutral-800 break-words leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {sec.items && (
                      <div className="space-y-3 pl-1 sm:pl-2 break-words">
                        {sec.items.map((it, itIdx) => (
                          <div key={itIdx} className="space-y-1.5 break-words">
                            {/* Jika label adalah judul tanpa teks pendamping */}
                            {it.label && !it.text ? (
                              <div className="font-bold text-black text-xs sm:text-sm leading-snug break-words">
                                {it.label}
                              </div>
                            ) : (
                              /* Jika memiliki label penomoran dan isi teks */
                              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 break-words">
                                {it.label && (
                                  <span
                                    className={`font-bold text-black break-words ${
                                      it.label.length <= 4 ? 'shrink-0' : 'min-w-0 flex-1'
                                    }`}
                                  >
                                    {it.label}
                                  </span>
                                )}
                                {it.text && (
                                  <span className="text-left sm:text-justify text-neutral-800 break-words flex-1 min-w-0">
                                    {it.text}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Sub-item bullet point */}
                            {it.subitems && (
                              <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-xs sm:text-[13px] text-neutral-800">
                                {it.subitems.map((sub, subIdx) => (
                                  <li key={subIdx} className="text-left sm:text-justify break-words leading-relaxed">
                                    {sub}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Blok Tanda Tangan & Stempel Resmi (Halaman 1 & 8) */}
              {page.show_signature && (
                <div className="mt-8 sm:mt-12 flex justify-end font-serif">
                  <div className="w-52 sm:w-64 text-center text-xs space-y-1">
                    <div>Tambusai Utara, 10 September 2026</div>
                    <div className="font-bold uppercase">Ketua Umum</div>
                    <div className="font-sans text-[11px] text-neutral-700">LPTQ Kec.Tambusai Utara</div>
                    
                    {/* Gambar Stempel & Tanda Tangan Resmi */}
                    <div className="py-1 flex justify-center">
                      <img
                        src={stampUrl}
                        alt="Stempel LPTQ & Tanda Tangan Rahmat Saputra"
                        className="object-contain max-w-full h-24"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="font-bold font-sans tracking-wide uppercase border-b border-black inline-block px-2 text-xs">
                      RAHMAT SAPUTRA
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Garis Merah Marun Resmi Sesuai PDF Asli */}
              <div className="mt-10 sm:mt-14 pt-3 border-t border-neutral-300 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-neutral-600 font-sans">
                <div className="bg-[#8B1E1E] text-white font-bold px-2 py-0.5 text-[10px] rounded-xs shrink-0">
                  {page.page_number}
                </div>
                <div className="italic truncate sm:overflow-visible flex-1 min-w-0">
                  MTQ ke-XIX Tingkat Kecamatan Tambusai Utara
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODE 2: RINGKASAN TEKNIS (Matriks Cepat untuk Verifikator & Administrator) */}
      {viewMode === 'ringkasan' && (
        <div className="space-y-6 w-full max-w-full overflow-hidden">
          {/* Filter Bar */}
          <div className="bg-white border border-neutral-300 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL', label: 'Semua' },
                { key: 'Seni Baca', label: 'Seni Baca' },
                { key: 'Hafalan', label: 'Hafalan' },
                { key: 'Fahmil', label: 'Fahmil' },
                { key: 'Syarhil', label: 'Syarhil' },
                { key: 'Kaligrafi', label: 'Kaligrafi' },
                { key: 'Rebana', label: 'Rebana' },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCabangFilter(c.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                    selectedCabangFilter === c.key
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari golongan atau maqra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>
          </div>

          {/* Tabel Matriks Cepat */}
          <div className="bg-white border border-neutral-300 rounded overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-300 bg-neutral-100 text-[11px] font-bold text-neutral-800 uppercase">
                    <th className="py-3 px-3 sm:px-4">Cabang</th>
                    <th className="py-3 px-3 sm:px-4">Golongan Musabaqah</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Batasan Usia (Per 09 Nov 2026)</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Durasi</th>
                    <th className="py-3 px-3 sm:px-4">Materi & Maqra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredCabang.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs text-neutral-500">
                        Tidak ada golongan musabaqah yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredCabang.map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-bold text-black whitespace-nowrap">
                          {row.cabang}
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-semibold text-black">
                          {row.golongan}
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-mono text-[11px] text-neutral-700 whitespace-nowrap">
                          {row.umur}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-neutral-700 whitespace-nowrap">
                          {row.durasi}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-neutral-600 leading-snug break-words">
                          {row.maqra}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ringkasan 6 Dokumen & Ketentuan Map Biru */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-neutral-300 rounded space-y-3">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-2">
                6 Dokumen Persyaratan Administrasi
              </h2>
              <ol className="list-decimal pl-4 space-y-1.5 text-xs text-neutral-800">
                <li><strong>Surat Mandat dari Desa:</strong> Ditandatangani Kepala Desa atau LPTK Desa setempat.</li>
                <li><strong>Surat Keterangan Berdomisili:</strong> Membuktikan berdomisili di Kecamatan Tambusai Utara.</li>
                <li><strong>Fotokopi Ijazah Sekolah:</strong> Berkas ijazah formal terakhir dilegalisir.</li>
                <li><strong>Fotokopi Akte Kelahiran:</strong> Verifikasi batas umur musabaqah per 09 Nov 2026.</li>
                <li><strong>Fotokopi Kartu Keluarga:</strong> Wajib memuat NIK 16 digit.</li>
                <li><strong>Surat Pernyataan Kebenaran Dokumen:</strong> Bermaterai Rp 10.000,-.</li>
              </ol>
            </div>

            <div className="p-5 bg-white border border-neutral-300 rounded space-y-3">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-2">
                Ketentuan Pengumpulan & Sanksi
              </h2>
              <div className="space-y-2 text-xs text-neutral-800 leading-relaxed">
                <p>
                  <strong>Wadah Berkas:</strong> Berkas pendaftaran beserta dokumen asli dan fotokopi rangkap 1 (satu) dimasukkan ke dalam <strong>Map Warna Biru</strong> dan disampaikan di Sekretariat LPTQ Kecamatan / Bagian Administrasi MTQ Desa Mahato.
                </p>
                <p>
                  <strong>Batasan Cabang:</strong> Setiap peserta hanya boleh mengikuti <strong>1 cabang musabaqah</strong>.
                </p>
                <p>
                  <strong>Sanksi:</strong> Peserta yang tidak memenuhi persyaratan tidak berhak tampil. Manipulasi umur atau membawa peserta dari luar Tambusai Utara langsung dikenakan sanksi <strong>diskualifikasi</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
