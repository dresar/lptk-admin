'use client';

import React, { useEffect, useState } from 'react';
import { Home, Search, Layers, Users, Newspaper, Lock } from 'lucide-react';
import Link from 'next/link';

export function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState('beranda');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['berita', 'kafilah', 'cabang', 'cek-status'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 100) {
            setActiveSection(section);
            return;
          }
        }
      }
      if (window.scrollY < 300) {
        setActiveSection('beranda');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      aria-label="Navigasi Bawah Layar Smartphone"
      className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-neutral-900/95 backdrop-blur-md border border-emerald-800/60 rounded-2xl shadow-2xl px-2 py-1.5 flex items-center justify-around text-neutral-400"
    >
      {/* 1. Beranda */}
      <a
        href="#"
        onClick={() => setActiveSection('beranda')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeSection === 'beranda'
            ? 'text-amber-400 font-bold scale-105'
            : 'hover:text-neutral-200'
        }`}
      >
        <Home className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">Beranda</span>
      </a>

      {/* 2. Cek Status */}
      <a
        href="#cek-status"
        onClick={() => setActiveSection('cek-status')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
          activeSection === 'cek-status'
            ? 'text-emerald-400 font-bold scale-105'
            : 'hover:text-neutral-200'
        }`}
      >
        <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        <Search className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">Cek NIK</span>
      </a>

      {/* 3. Cabang */}
      <a
        href="#cabang"
        onClick={() => setActiveSection('cabang')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeSection === 'cabang'
            ? 'text-amber-400 font-bold scale-105'
            : 'hover:text-neutral-200'
        }`}
      >
        <Layers className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">Cabang</span>
      </a>

      {/* 4. Kafilah */}
      <a
        href="#kafilah"
        onClick={() => setActiveSection('kafilah')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeSection === 'kafilah'
            ? 'text-amber-400 font-bold scale-105'
            : 'hover:text-neutral-200'
        }`}
      >
        <Users className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">Kafilah</span>
      </a>

      {/* 5. Berita */}
      <a
        href="#berita"
        onClick={() => setActiveSection('berita')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeSection === 'berita'
            ? 'text-amber-400 font-bold scale-105'
            : 'hover:text-neutral-200'
        }`}
      >
        <Newspaper className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">Warta</span>
      </a>

      {/* 6. Masuk */}
      <Link
        href="/login"
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-neutral-400 hover:text-white transition-colors"
      >
        <Lock className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">Masuk</span>
      </Link>
    </nav>
  );
}
