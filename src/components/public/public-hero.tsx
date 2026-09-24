'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, FileDown, Layers, Users, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
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
    total_participants: 0,
    verified_participants: 0,
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
    <section
      className="relative w-full overflow-hidden bg-neutral-950 text-white min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center border-b border-stone-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Background Slider Images (Up to 5 Slides, Auto-slide) */}
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

      {/* 2. Dark Overlay & Scrim for Crystal Clear Contrast (No Badges) */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/40 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-neutral-950/30 pointer-events-none z-10" />

      {/* 3. Slider Navigation Arrows (Desktop / Tablet) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide Sebelumnya"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white items-center justify-center border border-white/20 transition-all backdrop-blur-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide Selanjutnya"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white items-center justify-center border border-white/20 transition-all backdrop-blur-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* 4. Text Content Overlaid on Background (NO BADGES) */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 relative z-20 w-full">
        <div className="max-w-3xl space-y-4">
          {/* Small Info Text (Strictly Plain Text, NO BADGE) */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-amber-300 font-mono tracking-wide">
            <span>{activeSlide.info || `09 – 13 November 2026 • Mimbar Utama ${stats.host_village}`}</span>
          </div>

          {/* Main Title Over Image */}
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            {activeSlide.title || stats.hero_title}
          </h1>

          {/* Concise Subtitle (1-2 sentences) */}
          <p className="text-xs sm:text-sm text-neutral-200/90 leading-relaxed max-w-2xl drop-shadow-sm">
            {activeSlide.subtitle || stats.hero_subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href="#cek-status"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md min-h-[42px]"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Cek Status Peserta</span>
            </a>

            <Link
              href="/cabang"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/25 transition-all backdrop-blur-xs min-h-[42px]"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Cabang Lomba</span>
            </Link>

            <Link
              href="/kafilah"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/25 transition-all backdrop-blur-xs min-h-[42px]"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>11 Kafilah</span>
            </Link>

            <a
              href="#dokumen"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/25 transition-all backdrop-blur-xs min-h-[42px]"
            >
              <FileDown className="w-4 h-4 text-neutral-300" />
              <span>Juknis</span>
            </a>
          </div>

          {/* Compact Countdown Bar Overlaid on Image */}
          <div className="pt-3 border-t border-white/15">
            <div className="flex items-center gap-2 mb-2 text-[11px] font-mono text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase tracking-wider font-semibold text-amber-300">
                Menuju Pembukaan MTQ XIX
              </span>
              <span>•</span>
              <span>09 Nov 2026</span>
            </div>

            <div className="grid grid-cols-4 gap-2 max-w-xs text-center font-mono text-white">
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-1.5">
                <div className="text-sm sm:text-base font-bold">{timeLeft.days}</div>
                <div className="text-[9px] text-neutral-300 uppercase">Hari</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-1.5">
                <div className="text-sm sm:text-base font-bold">{timeLeft.hours}</div>
                <div className="text-[9px] text-neutral-300 uppercase">Jam</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-1.5">
                <div className="text-sm sm:text-base font-bold">{timeLeft.minutes}</div>
                <div className="text-[9px] text-neutral-300 uppercase">Mnt</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-1.5">
                <div className="text-sm sm:text-base font-bold text-amber-400">{timeLeft.seconds}</div>
                <div className="text-[9px] text-neutral-300 uppercase">Dtk</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Slide Indicator Dots (Bottom Center) */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-xs border border-white/10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
