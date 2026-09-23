'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, User } from 'lucide-react';
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
};

export interface HeaderProps {
  onToggleSidebar: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export function Header({ onToggleSidebar, currentUser, onLogout }: HeaderProps) {
  const pathname = usePathname();

  // Find matching title
  const currentTitle =
    PATH_TITLES[pathname] ||
    Object.entries(PATH_TITLES).find(([key]) => key !== '/admin' && pathname.startsWith(key))?.[1] ||
    'Admin';

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

      {/* Right: Desktop User Profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 text-right">
            <div>
              <div className="text-xs font-semibold text-black leading-tight">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wide">
                {currentUser.role_code.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-neutral-100 border border-neutral-300 flex items-center justify-center text-black font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* 1-Word Button: Keluar */}
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="text-xs gap-1.5 h-8 px-3 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </Button>
      </div>
    </header>
  );
}
