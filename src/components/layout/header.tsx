'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, User, Globe, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { AuthUser } from '@/types/auth';

const PATH_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/villages': 'Desa',
  '/admin/lptks': 'LPTK',
  '/admin/users': 'Pengguna',
  '/admin/roles': 'Peran',
  '/admin/competitions': 'Lomba',
  '/admin/categories': 'Kategori',
  '/admin/document-types': 'Dokumen',
  '/admin/participants': 'Peserta',
  '/admin/verifications': 'Verifikasi',
  '/admin/reports': 'Laporan',
  '/admin/audit-logs': 'Audit',
  '/admin/settings': 'Pengaturan',
  '/admin/profile': 'Profil',
  '/admin/juknis': 'Juknis',
  '/admin/cdn': 'Media CDN',
};

export interface HeaderProps {
  onToggleSidebar: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export function Header({ onToggleSidebar, currentUser, onLogout }: HeaderProps) {
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  // Close dropdown on route change
  React.useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  const currentTitle = PATH_TITLES[pathname] || 'Admin';

  const initials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-neutral-200 shadow-sm">
      {/* Left: Mobile Hamburger & Current Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-black hover:bg-neutral-100 rounded-md lg:hidden border border-neutral-200 transition-colors focus:outline-none focus:ring-1 focus:ring-black"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-black tracking-tight uppercase">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Right: Web Publik & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Link to Public Website (Opens in new tab) */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 hover:text-black bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md transition-colors"
          title="Buka Website Publik"
        >
          <Globe className="w-3.5 h-3.5 text-black" />
          <span className="hidden sm:inline">Web Publik</span>
          <ExternalLink className="w-3 h-3 text-neutral-500" />
        </a>

        {/* Profile Trigger & Dropdown Menu */}
        {currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1 rounded-md hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200 focus:outline-none"
              title="Menu Akun"
            >
              <div className="w-8 h-8 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-black leading-tight truncate max-w-[120px]">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-tight">
                  {currentUser.role_code.replace(/_/g, ' ')}
                </div>
              </div>
            </button>

            {/* Profile Dropdown Modal */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-300 rounded-md shadow-lg p-2 z-50 animate-in fade-in duration-100 space-y-1">
                <div className="px-2.5 py-2 border-b border-neutral-200">
                  <p className="text-xs font-bold text-black truncate">{currentUser.full_name}</p>
                  <p className="text-[10px] text-neutral-500 font-mono truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-sm bg-neutral-100 border border-neutral-300 text-neutral-800">
                    {currentUser.role_code.replace(/_/g, ' ')}
                  </span>
                </div>

                <Link
                  href="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Lihat Profil</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
