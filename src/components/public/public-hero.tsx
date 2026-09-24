'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Search, FileDown, Layers, Users, Trophy } from 'lucide-react';

interface EventStats {
  total_participants: number;
  verified_participants: number;
  total_villages: number;
  total_branches: number;
  total_categories: number;
}

export function PublicHero() {
  const [stats, setStats] = useState<EventStats>({
    total_participants: 28,
    verified_participants: 22,
    total_villages: 11,
    total_branches: 6,
    total_categories: 25,
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setStats((prev) => ({
            ...prev,
            total_participants: json.data.total_participants ?? prev.total_participants,
            verified_participants: json.data.verified_participants ?? prev.verified_participants,
            total_villages: json.data.total_villages ?? prev.total_villages,
            total_branches: json.data.total_branches ?? prev.total_branches,
            total_categories: json.data.total_categories ?? prev.total_categories,
          }));
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
    <section className="bg-neutral-950 text-white pt-8 pb-14 border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Tuan Rumah: Desa Mahato
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            09 - 13 November 2026
          </span>
        </div>

        {/* Main Grid: Headline & Action on Left, Photography Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Musabaqah Tilawatil Qur&apos;an XIX Tingkat Kecamatan Tambusai Utara
            </h1>

            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
              Pusat informasi resmi dan layanan cek status verifikasi kafilah MTQ XIX Tahun 2026.
              Diikuti 11 kafilah desa dengan 6 cabang dan 25 golongan musabaqah.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <a
                href="#cek-status"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black font-semibold text-xs rounded hover:bg-neutral-200 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cek Status</span>
              </a>

              <a
                href="#cabang"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white font-medium text-xs border border-neutral-700 rounded hover:bg-neutral-800 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lihat Cabang</span>
              </a>

              <a
                href="#dokumen"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white font-medium text-xs border border-neutral-700 rounded hover:bg-neutral-800 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh Juknis</span>
              </a>

              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-neutral-900 text-white font-medium text-xs border border-neutral-700 rounded hover:bg-neutral-800 transition-colors"
              >
                <span>Masuk Portal</span>
              </Link>
            </div>

            {/* Countdown Display */}
            <div className="pt-3 border-t border-neutral-800/80">
              <span className="block text-[11px] font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                Hitung Mundur Pelaksanaan MTQ XIX
              </span>
              <div className="grid grid-cols-4 gap-2 max-w-sm text-center">
                <div className="bg-neutral-900 border border-neutral-800 p-2 rounded">
                  <span className="block text-lg sm:text-xl font-bold font-mono text-white">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">Hari</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-2 rounded">
                  <span className="block text-lg sm:text-xl font-bold font-mono text-white">
                    {timeLeft.hours}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">Jam</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-2 rounded">
                  <span className="block text-lg sm:text-xl font-bold font-mono text-white">
                    {timeLeft.minutes}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">Menit</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-2 rounded">
                  <span className="block text-lg sm:text-xl font-bold font-mono text-white">
                    {timeLeft.seconds}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">Detik</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Photographic Hero Card from CDN */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] bg-neutral-950 overflow-hidden">
                <img
                  src="/api/cdn/cdn/hero/mtq-hero-mahato.jpg"
                  alt="Arena Utama MTQ XIX Desa Mahato"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 text-white text-[10px] font-mono rounded">
                  Lokasi Musabaqah
                </div>
              </div>

              <div className="p-4 space-y-1">
                <div className="font-semibold text-xs text-white">
                  Kompleks Masjid Raya & Lapangan Utama
                </div>
                <div className="text-[11px] text-neutral-400">
                  Desa Mahato, Kecamatan Tambusai Utara, Rokan Hulu
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Metric Cards (Solid, High-Contrast) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-mono uppercase">Musabaqah</span>
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              {stats.total_branches} Cabang
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Seni Baca s.d Rebana</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-mono uppercase">Golongan</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              {stats.total_categories} Golongan
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Kategori Putra & Putri</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-mono uppercase">Kafilah</span>
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              {stats.total_villages} Desa
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Se-Tambusai Utara</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-mono uppercase">Peserta</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              {stats.total_participants} Terdaftar
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
              {stats.verified_participants} Terverifikasi
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
