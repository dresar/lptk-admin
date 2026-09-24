'use client';

import React from 'react';
import { FileText, Download, Check, AlertCircle, FolderArchive } from 'lucide-react';
import { JUKNIS_REQUIRED_DOCUMENTS } from '@/data/juknis-official-data';

export function DocumentsSection() {
  return (
    <section id="dokumen" className="bg-neutral-900 text-white py-14 border-b border-neutral-800 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-300">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Dokumen Resmi
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Petunjuk Teknis & Pedoman Administrasi
          </h2>
          <p className="text-xs text-neutral-400">
            Unduh berkas panduan teknis musabaqah dan ketentuan berkas pendaftaran kafilah desa
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Download Juknis PDF Card */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-6 rounded-lg flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-mono text-neutral-400 block mb-1">
                  SK NO. 09/LPTQ-T.U/MTQ/IX/2026
                </span>
                <h3 className="font-bold text-base text-white">
                  Buku Petunjuk Teknis MTQ ke-XIX Tahun 2026
                </h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Memuat panduan lengkap 6 cabang musabaqah, 25 golongan lomba, kriteria penilaian dewan hakim, format maqra tilawah, dan jadwal pertandingan di Desa Mahato.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded space-y-1 text-xs font-mono text-neutral-400">
                <div className="flex justify-between">
                  <span>Format Berkas:</span>
                  <span className="text-white">PDF Dokumen</span>
                </div>
                <div className="flex justify-between">
                  <span>Ukuran:</span>
                  <span className="text-white">340 KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Penetapan:</span>
                  <span className="text-white">10 September 2026</span>
                </div>
              </div>
            </div>

            <div>
              <a
                href="/documents/juknis-mtq-xix-tambusai-utara-2026.pdf"
                download="juknis-mtq-xix-tambusai-utara-2026.pdf"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-black font-semibold text-xs rounded hover:bg-neutral-200 transition-colors min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Unduh</span>
              </a>
            </div>
          </div>

          {/* Registration Documents Requirements */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 p-6 rounded-lg space-y-5">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-emerald-400" />
                <span>6 Persyaratan Berkas Pendaftaran Kafilah</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Wajib diserahkan dalam rangkap 1 (satu) asli dan fotokopi ke Sekretariat Administrasi
              </p>
            </div>

            <div className="space-y-2.5">
              {JUKNIS_REQUIRED_DOCUMENTS.map((doc, idx) => (
                <div
                  key={doc.code}
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-white">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {doc.hint}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Biru Mandatory Rule */}
            <div className="p-3.5 bg-neutral-900 border border-emerald-700/60 rounded flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-300 leading-relaxed">
                <span className="font-bold text-white block mb-0.5">Ketentuan Map Biru:</span>
                Seluruh berkas pendaftaran beserta dokumen asli dan fotokopi dimasukkan ke dalam <strong className="text-emerald-300">Map Warna Biru</strong> dan diserahkan di Sekretariat LPTQ Kecamatan (Kantor KUA Rantau Kasai) atau Bagian Administrasi MTQ Desa Mahato.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
