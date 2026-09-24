'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/api/cdn/logos/lptq-logo.png');
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
        if (json?.data?.app_logo_url) {
          const clean = json.data.app_logo_url.replace('/api/cdn/cdn/', '/api/cdn/');
          setLogoUrl(clean);
        }
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
    { label: 'Cabang Lomba', href: '/cabang' },
    { label: 'Kafilah 11 Desa', href: '/kafilah' },
    { label: 'Berita & Warta', href: '/berita' },
    { label: 'Juknis', href: '/#dokumen' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md text-neutral-900 border-b border-stone-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-1 focus:ring-emerald-700 rounded-lg py-1"
        >
          <div className="w-9 h-9 rounded-full bg-stone-50 p-1 flex items-center justify-center flex-shrink-0 shadow-xs ring-1 ring-stone-300">
            <img
              src={logoUrl}
              alt="LPTQ Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // If logo fails, show Islamic crescent star icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="font-extrabold text-xs sm:text-sm tracking-wide text-neutral-900 flex items-center gap-1">
              <span>{appName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold hidden sm:inline-block">
                DESA MAHATO
              </span>
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">
              Kecamatan Tambusai Utara • Rokan Hulu
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-neutral-700">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3 py-2 rounded-lg hover:text-emerald-800 hover:bg-stone-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              href="/admin/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-neutral-800 rounded-xl border border-stone-300 transition-colors"
            >
              <span>Masuk Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-stone-100 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-6 space-y-2 text-xs shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={handleLinkClick}
                className="block px-3 py-2.5 rounded-lg text-neutral-800 font-semibold hover:bg-stone-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/admin/dashboard"
                onClick={handleLinkClick}
                className="w-full text-center px-4 py-2.5 bg-emerald-800 text-white font-bold rounded-xl text-xs"
              >
                Buka Admin Panel
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="w-full text-center px-4 py-2.5 bg-emerald-800 text-white font-bold rounded-xl text-xs"
              >
                Masuk Portal Petugas & Kafilah
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
