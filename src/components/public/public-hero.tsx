'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  FileDown,
  Layers,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { HeroSlide, DEFAULT_HERO_SLIDES } from '@/types/website';

interface EventStats {
  total_participants: number;
  verified_participants: number;
  total_villages: number;
  total_branches: number;
  total_categories: number;
  hero_title: string;
  hero_subtitle: string;
  countdown_target: string;
  host_village: string;
  hero_slides: HeroSlide[];
}

export function PublicHero() {
  const [stats, setStats] = useState<EventStats>({
    total_participants: 29,
    verified_participants: 16,
    total_villages: 11,
    total_branches: 6,
    total_categories: 25,
    hero_title: "Musabaqah Tilawatil Qur'an XIX Tingkat Kecamatan Tambusai Utara",
    hero_subtitle: "Pusat informasi resmi dan portal verifikasi data peserta MTQ XIX Tahun 2026 di Desa Mahato.",
    countdown_target: '2026-11-09T08:00:00+07:00',
    host_village: 'Desa Mahato',
    hero_slides: DEFAULT_HERO_SLIDES,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Fetch dynamic stats and slides from backend
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
            countdown_target: json.data.countdown_target || prev.countdown_target,
            host_village: json.data.host_village || prev.host_village,
            hero_slides:
              Array.isArray(json.data.hero_slides) && json.data.hero_slides.length > 0
                ? json.data.hero_slides.slice(0, 5)
                : prev.hero_slides,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const slides = stats.hero_slides.length > 0 ? stats.hero_slides.slice(0, 5) : DEFAULT_HERO_SLIDES;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-slide transition every 5 seconds (paused when user hovers)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length, nextSlide]);

  // Countdown calculations
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

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <>
      {/* 1. HERO SECTION: Full section on mobile Android, expansive background images, large bold text, strictly no cluttering buttons or badges */}
      <section
        className="relative w-full overflow-hidden bg-neutral-950 text-white h-[calc(100svh-64px)] min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center border-b border-neutral-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Auto-slider Images (Up to 5 Slides) */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-0 scale-100' : 'opacity-0 z-[-1] pointer-events-none'
            }`}
          >
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=80';
              }}
            />
          </div>
        ))}

        {/* Balanced Dark Overlay so the background image remains clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-neutral-950/30 pointer-events-none z-10" />

        {/* Left/Right Slider Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Slide Sebelumnya"
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-md bg-black/40 hover:bg-black/80 text-white items-center justify-center border border-white/20 transition-all backdrop-blur-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Slide Selanjutnya"
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-md bg-black/40 hover:bg-black/80 text-white items-center justify-center border border-white/20 transition-all backdrop-blur-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Text Overlaid on Background: Clean, Big, Focused (NO BADGES, NO CLUTTER) */}
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 relative z-20 w-full text-center flex flex-col items-center justify-center">
          {/* Large Bold Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight max-w-4xl drop-shadow-md">
            {activeSlide.title || stats.hero_title}
          </h1>

          {/* Concise Subtitle (1 line) */}
          <p className="text-xs sm:text-base text-neutral-200 leading-relaxed max-w-2xl mt-3 sm:mt-4 drop-shadow-sm">
            {activeSlide.subtitle || stats.hero_subtitle}
          </p>

          {/* Action Buttons under Title */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin/participants/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold text-xs sm:text-sm rounded-md shadow-md transition-colors"
            >
              <UserCheck className="w-4 h-4 text-neutral-900" />
              <span>Daftar Peserta</span>
            </Link>
            <a
              href="#cek-status"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-md shadow-md transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Cek Status</span>
            </a>
            <Link
              href="/cabang"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900/80 hover:bg-neutral-900 text-white font-semibold text-xs sm:text-sm rounded-md border border-white/20 backdrop-blur-xs transition-colors shadow-md"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Cabang Lomba</span>
            </Link>
          </div>
        </div>

        {/* Slide Indicator Dots (Rectangular / Subtle rounded) */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-md bg-black/50 backdrop-blur-xs border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-xs transition-all ${
                  idx === currentSlide ? 'w-7 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. STATS & QUICK ACTIONS SECTION: Placed right below the hero with rectangular cards matching screenshot */}
      <section className="bg-stone-50 py-8 border-b border-neutral-300">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* 4 Rectangular Metric Cards (Exact match to User Screenshot 2) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: PESERTA */}
            <div className="bg-white border border-neutral-300 rounded-md p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono">
                  PESERTA
                </span>
                <UserCheck className="w-5 h-5 text-neutral-800 stroke-[1.75]" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono">
                  {stats.total_participants}
                </span>
              </div>
            </div>

            {/* Card 2: LPTK */}
            <div className="bg-white border border-neutral-300 rounded-md p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono">
                  LPTK
                </span>
                <Building2 className="w-5 h-5 text-neutral-800 stroke-[1.75]" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono">
                  {stats.total_villages}
                </span>
              </div>
            </div>

            {/* Card 3: DESA */}
            <div className="bg-white border border-neutral-300 rounded-md p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono">
                  DESA
                </span>
                <MapPin className="w-5 h-5 text-neutral-800 stroke-[1.75]" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono">
                  {stats.total_villages}
                </span>
              </div>
            </div>

            {/* Card 4: CABANG / GOLONGAN */}
            <div className="bg-white border border-neutral-300 rounded-md p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono">
                  CABANG
                </span>
                <Layers className="w-5 h-5 text-neutral-800 stroke-[1.75]" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono">
                  {stats.total_branches}
                </span>
                <span className="text-xs text-neutral-500 ml-1.5 font-mono">
                  ({stats.total_categories} Gol)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Row: Clean rectangular buttons with subtle rounded corners */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href="#cek-status"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-md transition-colors shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Cek Status Peserta</span>
            </a>

            <Link
              href="/cabang"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs sm:text-sm rounded-md border border-neutral-300 transition-colors shadow-xs"
            >
              <Layers className="w-4 h-4 text-emerald-800" />
              <span>Cabang Lomba</span>
            </Link>

            <Link
              href="/kafilah"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs sm:text-sm rounded-md border border-neutral-300 transition-colors shadow-xs"
            >
              <Users className="w-4 h-4 text-amber-700" />
              <span>11 Kafilah</span>
            </Link>

            <a
              href="#dokumen"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs sm:text-sm rounded-md border border-neutral-300 transition-colors shadow-xs"
            >
              <FileDown className="w-4 h-4 text-neutral-700" />
              <span>Unduh Juknis</span>
            </a>
          </div>

          {/* Countdown Timer Row: Rectangular cards */}
          <div className="bg-white border border-neutral-300 rounded-md p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider font-mono">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Hitung Mundur Pembukaan MTQ XIX • 09 November 2026</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="bg-neutral-100 border border-neutral-200 rounded-md px-3 py-1.5 min-w-[60px]">
                <div className="text-base sm:text-lg font-bold text-neutral-900">{timeLeft.days}</div>
                <div className="text-[10px] text-neutral-500 uppercase">Hari</div>
              </div>
              <div className="bg-neutral-100 border border-neutral-200 rounded-md px-3 py-1.5 min-w-[60px]">
                <div className="text-base sm:text-lg font-bold text-neutral-900">{timeLeft.hours}</div>
                <div className="text-[10px] text-neutral-500 uppercase">Jam</div>
              </div>
              <div className="bg-neutral-100 border border-neutral-200 rounded-md px-3 py-1.5 min-w-[60px]">
                <div className="text-base sm:text-lg font-bold text-neutral-900">{timeLeft.minutes}</div>
                <div className="text-[10px] text-neutral-500 uppercase">Mnt</div>
              </div>
              <div className="bg-neutral-100 border border-neutral-200 rounded-md px-3 py-1.5 min-w-[60px]">
                <div className="text-base sm:text-lg font-bold text-emerald-800">{timeLeft.seconds}</div>
                <div className="text-[10px] text-neutral-500 uppercase">Dtk</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
