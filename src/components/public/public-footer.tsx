'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-800 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-neutral-800/80">
          {/* Col 1: Instansi & Identitas */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-white p-0.5 flex items-center justify-center flex-shrink-0">
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
                <div className="font-bold text-sm tracking-wide text-white">
                  LPTQ KECAMATAN TAMBUSAI UTARA
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Kabupaten Rokan Hulu, Provinsi Riau
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
              Musabaqah Tilawatil Qur&apos;an (MTQ) XIX Tingkat Kecamatan Tambusai Utara Tahun 2026. Penyelenggaraan resmi berpusat di Desa Mahato tanggal 09 sampai 13 November 2026.
            </p>

            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-400">
                  Kantor KUA, Jl. Raya Rantau Kasai Desa Rantau Kasai, Tambusai Utara
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="font-mono text-neutral-400">0812-6845-1120 / 0813-7123-9988</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/#cek-status" className="hover:text-white transition-colors focus:outline-none focus:underline">
                  Cek Status Peserta
                </Link>
              </li>
              <li>
                <Link href="/#cabang" className="hover:text-white transition-colors focus:outline-none focus:underline">
                  Cabang & Golongan
                </Link>
              </li>
              <li>
                <Link href="/#kafilah" className="hover:text-white transition-colors focus:outline-none focus:underline">
                  Profil Kafilah 11 Desa
                </Link>
              </li>
              <li>
                <Link href="/#berita" className="hover:text-white transition-colors focus:outline-none focus:underline">
                  Warta & Pengumuman
                </Link>
              </li>
              <li>
                <Link href="/#dokumen" className="hover:text-white transition-colors focus:outline-none focus:underline">
                  Unduh Petunjuk Teknis
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Admin */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300">
              Portal Panitia
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Akses khusus verifikator kecamatan dan operator LPTQ desa untuk administrasi peserta.
            </p>
            <div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 text-white rounded text-xs font-semibold hover:bg-neutral-800 transition-colors min-h-[44px]"
              >
                <span>Masuk</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400 font-mono">
          <div>
            &copy; 2026 LPTQ Kecamatan Tambusai Utara. Hak Cipta Dilindungi.
          </div>
          <div>
            Penyelenggaraan Resmi MTQ XIX : Desa Mahato
          </div>
        </div>
      </div>
    </footer>
  );
}
