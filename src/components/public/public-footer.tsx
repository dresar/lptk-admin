'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, ArrowUpRight } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-neutral-900 text-white border-t border-neutral-800 pt-12 pb-24 lg:pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Calligraphy Banner */}
        <div className="text-center pb-8 border-b border-neutral-800">
          <p className="font-serif text-base sm:text-lg text-amber-400/90 tracking-widest">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="flex items-center justify-center gap-2 mt-1.5 text-neutral-500 text-xs">
            <span>————————</span>
            <span className="text-amber-400">۞</span>
            <span>————————</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-neutral-800">
          {/* Col 1: Instansi & Identitas */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-white p-1 flex items-center justify-center flex-shrink-0 ring-1 ring-amber-400 shadow-xs">
                <img
                  src="/api/cdn/logos/lptq-logo.png"
                  alt="LPTQ Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="font-bold text-sm tracking-wide text-white">
                  LPTQ KECAMATAN TAMBUSAI UTARA
                </div>
                <div className="text-xs text-amber-400 font-mono">
                  Kabupaten Rokan Hulu, Provinsi Riau
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
              Pusat informasi resmi penyelenggaraan MTQ XIX Tingkat Kecamatan Tambusai Utara di Mimbar Utama Desa Mahato tanggal 09 sampai 13 November 2026.
            </p>

            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-start gap-2 bg-neutral-800/60 p-2.5 rounded-md border border-neutral-700/60">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300 text-[11px] sm:text-xs">
                  Kantor KUA, Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara
                </span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-800/60 p-2.5 rounded-md border border-neutral-700/60">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-mono text-neutral-300 text-[11px] sm:text-xs">
                  0812-6845-1120 / 0813-7123-9988
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat Halaman */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-400">
              Halaman Publik
            </div>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda Utama
                </Link>
              </li>
              <li>
                <Link href="/#cek-status" className="hover:text-white transition-colors">
                  Cek Status NIK Peserta
                </Link>
              </li>
              <li>
                <Link href="/cabang" className="hover:text-white transition-colors">
                  Cabang & Golongan Lomba
                </Link>
              </li>
              <li>
                <Link href="/kafilah" className="hover:text-white transition-colors">
                  Profil 11 Kafilah Desa
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-white transition-colors">
                  Warta & Berita MTQ
                </Link>
              </li>
              <li>
                <Link href="/#dokumen" className="hover:text-white transition-colors">
                  Unduh Juknis Resmi PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Petugas & Kafilah */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-400">
              Akses Sistem
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Khusus operator desa, panitia kecamatan, dan verifikator berkas MTQ XIX.
            </p>
            <div className="pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md border border-emerald-700 transition-colors"
              >
                <span>Login Operator Desa</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-500 font-mono">
          <div>
            © 2026 Lembaga Pengembangan Tilawatil Qur&apos;an (LPTQ) Kecamatan Tambusai Utara
          </div>
          <div>
            Sistem Informasi Registrasi & Verifikasi Musabaqah (e-MTQ Mahato)
          </div>
        </div>
      </div>
    </footer>
  );
}
