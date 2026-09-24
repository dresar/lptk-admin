'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Search, FileDown, Layers, Users, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';

interface EventStats {
  total_participants: number;
  verified_participants: number;
  total_villages: number;
  total_branches: number;
  total_categories: number;
}

export function PublicHero() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [mounted, setMounted] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setStats({
            total_participants: json.data.total_participants ?? 0,
            verified_participants: json.data.verified_participants ?? 0,
            total_villages: json.data.total_villages ?? 11,
            total_branches: json.data.total_branches ?? 6,
            total_categories: json.data.total_categories ?? 25,
          });
        }
      })
      .catch(() => {});

    // Target: 09 November 2026 08:00 WIB (UTC+7)
    const targetDate = new Date('2026-11-09T08:00:00+07:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-emerald-950 text-white pt-8 pb-16 border-b border-emerald-800/80 relative overflow-hidden">
      {/* Subtle Islamic Arch & Star Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-900/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Calligraphy Ornament Banner */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-amber-400 text-sm">۞</span>
          <span className="text-amber-300 font-serif text-sm sm:text-base tracking-widest">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <span className="text-amber-400 text-sm">۞</span>
        </div>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Tuan Rumah: Desa Mahato
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900 border border-emerald-700 rounded-full text-emerald-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            09 – 13 November 2026
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/60 border border-emerald-700/80 rounded-full text-emerald-300">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Tingkat Kecamatan Tambusai Utara
          </span>
        </div>

        {/* Main Grid: Headline on Left, Hero Photography on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Musabaqah Tilawatil Qur&apos;an XIX Tingkat Kecamatan Tambusai Utara
            </h1>

            <p className="text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Pusat informasi resmi dan portal verifikasi data peserta MTQ XIX Tahun 2026.
              Diikuti oleh 11 kafilah desa se-Kecamatan Tambusai Utara dengan 6 cabang dan 25 golongan musabaqah.
            </p>

            {/* Quick Actions (Large Touch Targets for Mobile) */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <a
                href="#cek-status"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 min-h-[46px]"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Cek Status NIK Peserta</span>
              </a>

              <a
                href="#cabang"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-900/90 text-white font-semibold text-xs border border-emerald-700/80 rounded-xl hover:bg-emerald-800 transition-colors min-h-[46px]"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Daftar Cabang Lomba</span>
              </a>

              <a
                href="#dokumen"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-900/90 text-white font-semibold text-xs border border-emerald-700/80 rounded-xl hover:bg-emerald-800 transition-colors min-h-[46px]"
              >
                <FileDown className="w-4 h-4 text-emerald-300" />
                <span>Unduh Juknis</span>
              </a>

              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-3 bg-emerald-900/60 text-emerald-200 font-semibold text-xs border border-emerald-700/60 rounded-xl hover:bg-emerald-800 hover:text-white transition-colors min-h-[46px]"
              >
                <span>Masuk Portal</span>
              </Link>
            </div>

            {/* Countdown Display (Islamic Amber-Emerald Cards) */}
            <div className="pt-4 border-t border-emerald-800/80">
              <div className="flex items-center justify-between max-w-sm mb-2">
                <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Menuju Pembukaan MTQ XIX
                </span>
                <span className="text-[10px] text-emerald-300/80 font-mono">09 Nov 2026</span>
              </div>

              <div className="grid grid-cols-4 gap-2 max-w-sm text-center">
                <div className="bg-emerald-900/90 border border-amber-500/40 p-2.5 rounded-xl shadow-md">
                  <span className="block text-xl sm:text-2xl font-black font-mono text-amber-400">
                    {mounted ? timeLeft.days : '-'}
                  </span>
                  <span className="text-[10px] text-emerald-200 uppercase font-semibold">Hari</span>
                </div>
                <div className="bg-emerald-900/90 border border-amber-500/40 p-2.5 rounded-xl shadow-md">
                  <span className="block text-xl sm:text-2xl font-black font-mono text-amber-400">
                    {mounted ? timeLeft.hours : '-'}
                  </span>
                  <span className="text-[10px] text-emerald-200 uppercase font-semibold">Jam</span>
                </div>
                <div className="bg-emerald-900/90 border border-amber-500/40 p-2.5 rounded-xl shadow-md">
                  <span className="block text-xl sm:text-2xl font-black font-mono text-amber-400">
                    {mounted ? timeLeft.minutes : '-'}
                  </span>
                  <span className="text-[10px] text-emerald-200 uppercase font-semibold">Menit</span>
                </div>
                <div className="bg-emerald-900/90 border border-amber-500/40 p-2.5 rounded-xl shadow-md">
                  <span className="block text-xl sm:text-2xl font-black font-mono text-amber-400">
                    {mounted ? timeLeft.seconds : '-'}
                  </span>
                  <span className="text-[10px] text-emerald-200 uppercase font-semibold">Detik</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Photographic Card from Neon S3 CDN with Islamic Frame */}
          <div className="lg:col-span-5">
            <div className="bg-emerald-900/80 border-2 border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-amber-400 hover:shadow-emerald-900/50">
              <div className="relative aspect-[16/10] bg-emerald-950 overflow-hidden">
                <img
                  src="/api/cdn/cdn/hero/mtq-hero-mahato.jpg"
                  alt="Arena Utama MTQ XIX Desa Mahato"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-950/90 border border-amber-400/60 text-amber-300 text-[10px] font-mono font-bold rounded-full shadow-lg">
                  Mimbar Utama Musabaqah
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono rounded">
                  Desa Mahato 2026
                </div>
              </div>

              <div className="p-4 space-y-1.5 bg-emerald-950/90 border-t border-emerald-800">
                <div className="font-bold text-sm text-white flex items-center justify-between">
                  <span>Kompleks Lapangan Utama MTQ XIX</span>
                  <span className="text-amber-400 text-xs font-mono font-bold">Kafilah Terpadu</span>
                </div>
                <div className="text-xs text-emerald-200/90 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Desa Mahato, Kecamatan Tambusai Utara, Rokan Hulu - Riau</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Metric Cards (Islamic Solid Cards with Warm Accents) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-10">
          <div className="bg-emerald-900/80 border border-emerald-700/80 hover:border-amber-400/60 p-4 rounded-xl shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between text-emerald-200 mb-1">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-300">Cabang</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats ? `${stats.total_branches} Cabang` : '-'}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-1">Seni Baca s.d Rebana</div>
          </div>

          <div className="bg-emerald-900/80 border border-emerald-700/80 hover:border-amber-400/60 p-4 rounded-xl shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between text-emerald-200 mb-1">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-300">Golongan</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats ? `${stats.total_categories} Golongan` : '-'}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-1">Kategori Putra & Putri</div>
          </div>

          <div className="bg-emerald-900/80 border border-emerald-700/80 hover:border-amber-400/60 p-4 rounded-xl shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between text-emerald-200 mb-1">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-300">Kafilah</span>
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats ? `${stats.total_villages} Desa` : '-'}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-1">Se-Tambusai Utara</div>
          </div>

          <div className="bg-emerald-900/80 border border-emerald-700/80 hover:border-amber-400/60 p-4 rounded-xl shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between text-emerald-200 mb-1">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-300">Peserta</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats ? `${stats.total_participants} Terdaftar` : '-'}
            </div>
            <div className="text-[11px] text-emerald-300 font-semibold mt-1">
              {stats ? `${stats.verified_participants} Terverifikasi Sah` : '-'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
