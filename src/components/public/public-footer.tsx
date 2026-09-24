'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-emerald-950 text-white border-t-2 border-amber-500/40 pt-16 pb-28 lg:pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Calligraphy Ornament */}
        <div className="text-center pb-10 border-b border-emerald-800/80">
          <p className="font-serif text-lg sm:text-xl text-amber-300/80 tracking-widest">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-emerald-400/60 text-xs">
            <span>————————</span>
            <span className="text-amber-400">۞</span>
            <span>————————</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10 border-b border-emerald-800/80">
          {/* Col 1: Instansi & Identitas */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center flex-shrink-0 ring-2 ring-amber-400/60 shadow-md">
                <img
                  src="/api/cdn/cdn/logos/lptq-logo.png"
                  alt="LPTQ Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
                  <span>LPTQ KECAMATAN TAMBUSAI UTARA</span>
                </div>
                <div className="text-xs text-amber-300 font-mono">
                  Kabupaten Rokan Hulu, Provinsi Riau
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed max-w-md">
              Musabaqah Tilawatil Qur&apos;an (MTQ) XIX Tingkat Kecamatan Tambusai Utara Tahun 2026. Penyelenggaraan resmi berpusat di Mimbar Utama Desa Mahato tanggal 09 sampai 13 November 2026.
            </p>

            <div className="space-y-2 text-xs text-emerald-100">
              <div className="flex items-start gap-2 bg-emerald-900/50 p-2.5 rounded-xl border border-emerald-800">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-emerald-200">
                  Kantor KUA, Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-900/50 p-2.5 rounded-xl border border-emerald-800">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-mono text-emerald-200">0812-6845-1120 / 0813-7123-9988</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>۞</span>
              <span>Tautan Cepat</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-200">
              <li>
                <Link href="/#cek-status" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>Cek Keabsahan Peserta</span>
                </Link>
              </li>
              <li>
                <Link href="/#cabang" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>6 Cabang & 25 Golongan</span>
                </Link>
              </li>
              <li>
                <Link href="/#kafilah" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>Profil Kafilah 11 Desa</span>
                </Link>
              </li>
              <li>
                <Link href="/#berita" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>Warta & Pengumuman</span>
                </Link>
              </li>
              <li>
                <Link href="/#dokumen" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>Unduh Juknis & Map Biru</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Admin */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>۞</span>
              <span>Portal Panitia</span>
            </h4>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Akses khusus verifikator kecamatan dan operator LPTQ desa untuk administrasi musabaqah.
            </p>
            <div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-900 border border-amber-400/50 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-all shadow-sm min-h-[44px]"
              >
                <span>Masuk Portal Panitia</span>
                <ArrowUpRight className="w-4 h-4 text-amber-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-400 font-mono">
          <div>
            &copy; 2026 LPTQ Kecamatan Tambusai Utara. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <span>۞</span>
            <span>Tuan Rumah Musabaqah : Desa Mahato</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
