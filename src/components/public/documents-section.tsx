'use client';

import React from 'react';
import { FileText, Download, Check, AlertCircle, FolderArchive } from 'lucide-react';
import { JUKNIS_REQUIRED_DOCUMENTS } from '@/data/juknis-official-data';

export function DocumentsSection() {
  return (
    <section id="dokumen" className="bg-emerald-950 text-white py-16 border-b border-emerald-900 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-900 border border-emerald-700 rounded-full text-amber-300">
            <span className="text-amber-400 font-bold">۞</span>
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dokumen Resmi MTQ XIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Petunjuk Teknis & Pedoman Administrasi
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
            Unduh berkas panduan teknis musabaqah dan pelajari ketentuan berkas fisik Map Warna Biru kafilah desa
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Download Juknis PDF Card */}
          <div className="lg:col-span-5 bg-emerald-900/60 border-2 border-emerald-700/80 p-6 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-amber-400 shadow-xs">
                <FileText className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-mono text-amber-300 block mb-1 font-semibold">
                  SK NO. 09/LPTQ-T.U/MTQ/IX/2026
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-white">
                  Buku Petunjuk Teknis MTQ ke-XIX Tahun 2026
                </h3>
                <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
                  Memuat panduan lengkap 6 cabang musabaqah, 25 golongan lomba, kriteria penilaian dewan hakim, format maqra tilawah, dan jadwal pertandingan di Desa Mahato.
                </p>
              </div>

              <div className="p-4 bg-emerald-950/70 border border-emerald-800 rounded-2xl space-y-2 text-xs font-mono text-emerald-200">
                <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                  <span className="text-emerald-400">Format Berkas:</span>
                  <span className="text-white font-bold">PDF Dokumen</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                  <span className="text-emerald-400">Ukuran:</span>
                  <span className="text-white font-bold">340 KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Ditetapkan di:</span>
                  <span className="text-amber-300 font-bold">Rantau Kasai</span>
                </div>
              </div>
            </div>

            <div>
              <a
                href="/documents/juknis-mtq-xix-tambusai-utara-2026.pdf"
                download="juknis-mtq-xix-tambusai-utara-2026.pdf"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm rounded-xl transition-all shadow-md min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Juknis Resmi</span>
                <span className="text-emerald-900">۞</span>
              </a>
            </div>
          </div>

          {/* Registration Documents Requirements */}
          <div className="lg:col-span-7 bg-emerald-900/40 border border-emerald-800 p-6 sm:p-8 rounded-3xl space-y-5 shadow-sm">
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-white flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-amber-400" />
                <span>6 Persyaratan Berkas Pendaftaran Kafilah</span>
              </h3>
              <p className="text-xs text-emerald-200/80 mt-1">
                Wajib diserahkan dalam rangkap 1 (satu) asli dan fotokopi ke Sekretariat Administrasi
              </p>
            </div>

            <div className="space-y-2.5">
              {JUKNIS_REQUIRED_DOCUMENTS.map((doc, idx) => (
                <div
                  key={doc.code}
                  className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm text-white">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                      {doc.hint}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Biru Mandatory Rule */}
            <div className="p-4 bg-blue-950/70 border-2 border-blue-400/80 rounded-2xl flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-100 leading-relaxed">
                <span className="font-bold text-white block mb-0.5 text-sm">
                  Ketentuan Khusus Map Warna Biru:
                </span>
                Seluruh berkas pendaftaran beserta dokumen asli dan fotokopi wajib dimasukkan ke dalam <strong className="text-amber-300 font-bold">Map Warna Biru</strong> dan diserahkan langsung di Sekretariat LPTQ Kecamatan (Kantor KUA Rantau Kasai) atau Bagian Administrasi MTQ Desa Mahato.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
