'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, ShieldCheck, Search, Sparkles } from 'lucide-react';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/api/cdn/cdn/logos/lptq-logo.png');
  const [appName, setAppName] = useState('MTQ XIX TAMBUSAI UTARA');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {});

    fetch('/api/meta/branding')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.app_logo_url) setLogoUrl(json.data.app_logo_url);
        if (json?.data?.app_name) setAppName(json.data.app_name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Cek Status', href: '/#cek-status' },
    { label: 'Cabang Lomba', href: '/#cabang' },
    { label: 'Kafilah 11 Desa', href: '/#kafilah' },
    { label: 'Warta MTQ', href: '/#berita' },
    { label: 'Juknis Resmi', href: '/#dokumen' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-emerald-950/95 backdrop-blur-md text-white border-b border-emerald-800/60 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-lg py-1"
        >
          <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-amber-400/80">
            <img
              src={logoUrl}
              alt="LPTQ Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white leading-none group-hover:text-amber-300 transition-colors">
                MTQ XIX TAMBUSAI UTARA
              </span>
              <span className="hidden sm:inline-block text-[10px] text-amber-400 font-bold">۞</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-200/90 font-medium tracking-tight mt-0.5">
              Tahun 2026 • Tuan Rumah Desa Mahato
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-emerald-100/90">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-amber-300 transition-colors py-2 focus:outline-none focus:text-amber-300 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="#cek-status"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Cek Status NIK</span>
          </a>

          {isLoggedIn ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-900/90 hover:bg-emerald-800 text-white border border-emerald-700/80 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-900/90 hover:bg-emerald-800 text-white border border-emerald-700/80 rounded-lg transition-colors"
            >
              <span>Masuk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-emerald-200 hover:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center bg-emerald-900/60 border border-emerald-800"
          aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950/98 border-b border-emerald-800 px-4 py-4 space-y-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-emerald-100">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleLinkClick}
                className="px-3.5 py-2.5 rounded-lg hover:bg-emerald-900/80 hover:text-amber-300 transition-colors min-h-[44px] flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span className="text-amber-400 text-xs">۞</span>
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-emerald-800/80 flex flex-col gap-2">
            <a
              href="#cek-status"
              onClick={handleLinkClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-lg transition-colors min-h-[44px]"
            >
              <Search className="w-4 h-4" />
              <span>Cek Status Peserta / NIK</span>
            </a>
            <Link
              href={isLoggedIn ? '/admin' : '/login'}
              onClick={handleLinkClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-emerald-900 text-white border border-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors min-h-[44px]"
            >
              {isLoggedIn ? 'Buka Dashboard Admin' : 'Masuk Portal Admin'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
