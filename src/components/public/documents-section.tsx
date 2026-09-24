'use client';

import React from 'react';
import { FileText, Download, Check, AlertCircle, FolderArchive } from 'lucide-react';
import { JUKNIS_REQUIRED_DOCUMENTS } from '@/data/juknis-official-data';

export function DocumentsSection() {
  return (
    <section id="dokumen" className="bg-white text-neutral-900 py-12 sm:py-16 border-b border-stone-200 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-xl mb-6 sm:mb-8 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800">
            <span className="text-amber-600 font-bold">۞</span>
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dokumen Resmi MTQ XIX</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Petunjuk Teknis & Pedoman Administrasi
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Unduh berkas juknis musabaqah dan ketentuan berkas fisik Map Biru kafilah desa.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Download Juknis PDF Card (Emerald Card) */}
          <div className="lg:col-span-5 bg-emerald-950 text-white p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-5 shadow-xs border border-emerald-800">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 border border-emerald-700 flex items-center justify-center text-amber-400 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-amber-300 block mb-1 font-semibold uppercase">
                  SK NO. 09/LPTQ-T.U/MTQ/IX/2026
                </span>
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Buku Petunjuk Teknis MTQ ke-XIX Tahun 2026
                </h3>
                <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
                  Panduan resmi 6 cabang, 25 golongan, kriteria penilaian hakim, format maqra, dan tata tertib musabaqah di Desa Mahato.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-900/60 border border-emerald-800 rounded-xl space-y-1.5 text-xs font-mono text-emerald-200">
                <div className="flex justify-between border-b border-emerald-800/80 pb-1">
                  <span className="text-emerald-400">Format Berkas:</span>
                  <span className="text-white font-bold">PDF Dokumen</span>
                </div>
                <div className="flex justify-between border-b border-emerald-800/80 pb-1">
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
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm min-h-[42px]"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Juknis Resmi PDF</span>
              </a>
            </div>
          </div>

          {/* Registration Documents Requirements (Clean Stone Card) */}
          <div className="lg:col-span-7 bg-stone-50 border border-stone-200 p-6 sm:p-7 rounded-3xl space-y-4 shadow-xs">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-neutral-900 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-emerald-800" />
                <span>6 Persyaratan Berkas Fisik (Map Biru)</span>
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Wajib diserahkan ke Sekretariat KUA Rantau Kasai sebelum batas akhir pendaftaran.
              </p>
            </div>

            <div className="space-y-2">
              {JUKNIS_REQUIRED_DOCUMENTS.map((doc, idx) => (
                <div
                  key={doc.code}
                  className="p-3 bg-white border border-stone-200 rounded-xl flex items-start gap-3 shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-neutral-900">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {doc.hint}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
