'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
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
    { label: 'Kafilah Desa', href: '/#kafilah' },
    { label: 'Berita', href: '/#berita' },
    { label: 'Juknis', href: '/#dokumen' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950 text-white border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-1 focus:ring-white rounded">
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
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white leading-none">
              MTQ XIX TAMBUSAI UTARA
            </span>
            <span className="text-[10px] text-neutral-400 font-mono tracking-tight mt-0.5">
              Tahun 2026 : Desa Mahato
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-300">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-white transition-colors py-2 focus:outline-none focus:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-black hover:bg-neutral-200 rounded transition-colors min-h-[44px]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Admin</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-black hover:bg-neutral-200 rounded transition-colors min-h-[44px]"
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
          className="md:hidden p-2 text-neutral-300 hover:text-white rounded focus:outline-none focus:ring-1 focus:ring-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1 text-sm font-medium text-neutral-200">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleLinkClick}
                className="px-3 py-2.5 rounded hover:bg-neutral-800 hover:text-white transition-colors min-h-[44px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-neutral-800">
            <Link
              href={isLoggedIn ? '/admin' : '/login'}
              onClick={handleLinkClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white text-black rounded hover:bg-neutral-200 transition-colors min-h-[44px]"
            >
              {isLoggedIn ? 'Portal Admin' : 'Masuk'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
