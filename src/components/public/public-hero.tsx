'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Search, FileDown, Layers, Users, Sparkles, ArrowRight } from 'lucide-react';

interface EventStats {
  total_participants: number;
  verified_participants: number;
  total_villages: number;
  total_branches: number;
  total_categories: number;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  hero_image_caption: string;
  countdown_target: string;
  host_village: string;
}

export function PublicHero() {
  const [stats, setStats] = useState<EventStats>({
    total_participants: 0,
    verified_participants: 0,
    total_villages: 11,
    total_branches: 6,
    total_categories: 25,
    hero_title: "MTQ XIX Tingkat Kecamatan Tambusai Utara",
    hero_subtitle: "Portal informasi resmi dan verifikasi data peserta MTQ XIX Tahun 2026 di Desa Mahato.",
    hero_image_url: '/api/cdn/hero/mtq-hero-mahato.jpg',
    hero_image_caption: 'Mimbar Utama Musabaqah - Desa Mahato',
    countdown_target: '2026-11-09T08:00:00+07:00',
    host_village: 'Desa Mahato',
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
            hero_title: json.data.hero_title || prev.hero_title,
            hero_subtitle: json.data.hero_subtitle || prev.hero_subtitle,
            hero_image_url: json.data.hero_image_url || prev.hero_image_url,
            hero_image_caption: json.data.hero_image_caption || prev.hero_image_caption,
            countdown_target: json.data.countdown_target || prev.countdown_target,
            host_village: json.data.host_village || prev.host_village,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const targetDate = new Date(stats.countdown_target).getTime() || new Date('2026-11-09T08:00:00+07:00').getTime();

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
  }, [stats.countdown_target]);

  return (
    <section className="bg-white text-neutral-900 pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-amber-900 font-semibold text-[11px] sm:text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            Tuan Rumah: {stats.host_village}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-[11px] sm:text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            09 – 13 November 2026
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-full text-neutral-600 text-[11px] sm:text-xs">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Tambusai Utara
          </span>
        </div>

        {/* Main Grid: Headline Left, Media Card Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          {/* Left Column: Compact Typography & 1-2 Sentences Text */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              {stats.hero_title}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xl">
              {stats.hero_subtitle}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="#cek-status"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs min-h-[42px]"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Cek Status Peserta</span>
              </a>

              <Link
                href="/cabang"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-800 font-semibold text-xs rounded-xl border border-stone-300 transition-colors min-h-[42px]"
              >
                <Layers className="w-4 h-4 text-emerald-800" />
                <span>Cabang Lomba</span>
              </Link>

              <Link
                href="/kafilah"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-800 font-semibold text-xs rounded-xl border border-stone-300 transition-colors min-h-[42px]"
              >
                <Users className="w-4 h-4 text-amber-700" />
                <span>11 Kafilah</span>
              </Link>

              <a
                href="#dokumen"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-800 font-semibold text-xs rounded-xl border border-stone-300 transition-colors min-h-[42px]"
              >
                <FileDown className="w-4 h-4 text-neutral-600" />
                <span>Juknis</span>
              </a>
            </div>

            {/* Compact Countdown Bar */}
            <div className="pt-3 border-t border-stone-200">
              <div className="flex items-center justify-between max-w-xs mb-2 text-[11px] font-mono">
                <span className="text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Menuju Pembukaan MTQ XIX
                </span>
                <span className="text-neutral-500">09 Nov 2026</span>
              </div>

              <div className="grid grid-cols-4 gap-2 max-w-xs text-center font-mono">
                <div className="bg-stone-100 border border-stone-200 rounded-lg p-2">
                  <div className="text-base sm:text-lg font-extrabold text-neutral-900">{timeLeft.days}</div>
                  <div className="text-[10px] text-neutral-500 uppercase">Hari</div>
                </div>
                <div className="bg-stone-100 border border-stone-200 rounded-lg p-2">
                  <div className="text-base sm:text-lg font-extrabold text-neutral-900">{timeLeft.hours}</div>
                  <div className="text-[10px] text-neutral-500 uppercase">Jam</div>
                </div>
                <div className="bg-stone-100 border border-stone-200 rounded-lg p-2">
                  <div className="text-base sm:text-lg font-extrabold text-neutral-900">{timeLeft.minutes}</div>
                  <div className="text-[10px] text-neutral-500 uppercase">Mnt</div>
                </div>
                <div className="bg-stone-100 border border-stone-200 rounded-lg p-2">
                  <div className="text-base sm:text-lg font-extrabold text-emerald-800">{timeLeft.seconds}</div>
                  <div className="text-[10px] text-neutral-500 uppercase">Dtk</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Emerald Card for Photography & Stats */}
          <div className="lg:col-span-5">
            <div className="bg-emerald-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-800 shadow-sm space-y-4">
              {/* Photo Frame */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/10] bg-emerald-900/60 border border-emerald-700/80">
                <img
                  src={stats.hero_image_url}
                  alt={stats.hero_image_caption}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to elegant placeholder if custom CDN not yet uploaded
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-400 text-neutral-950 font-bold rounded">
                    Mimbar Utama
                  </span>
                  <div className="text-xs font-medium text-white truncate mt-1">
                    {stats.hero_image_caption}
                  </div>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-emerald-900/70 border border-emerald-800 rounded-xl p-2.5">
                  <div className="text-xs sm:text-sm font-bold font-mono text-amber-300">
                    {stats.total_villages} Desa
                  </div>
                  <div className="text-[10px] text-emerald-200/80 mt-0.5">Kafilah Resmi</div>
                </div>
                <div className="bg-emerald-900/70 border border-emerald-800 rounded-xl p-2.5">
                  <div className="text-xs sm:text-sm font-bold font-mono text-white">
                    {stats.total_branches} Cabang
                  </div>
                  <div className="text-[10px] text-emerald-200/80 mt-0.5">{stats.total_categories} Golongan</div>
                </div>
                <div className="bg-emerald-900/70 border border-emerald-800 rounded-xl p-2.5">
                  <div className="text-xs sm:text-sm font-bold font-mono text-emerald-300">
                    {stats.verified_participants}
                  </div>
                  <div className="text-[10px] text-emerald-200/80 mt-0.5">Peserta Lolos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
