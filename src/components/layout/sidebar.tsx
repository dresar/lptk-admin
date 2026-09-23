'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
  Shield,
  Trophy,
  Tags,
  FileText,
  UserCheck,
  CheckSquare,
  BarChart3,
  History,
  Settings,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { AuthUser } from '@/types/auth';

export interface MenuItem {
  title: string; // Strictly 1 word
  href: string;
  icon: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
  Shield,
  Trophy,
  Tags,
  FileText,
  UserCheck,
  CheckSquare,
  BarChart3,
  History,
  Settings,
};

// Full 13 modules default fallback: sidebar is NEVER blank
const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { title: 'Desa', href: '/admin/villages', icon: 'MapPin' },
  { title: 'LPTK', href: '/admin/lptks', icon: 'Building2' },
  { title: 'Pengguna', href: '/admin/users', icon: 'Users' },
  { title: 'Peran', href: '/admin/roles', icon: 'Shield' },
  { title: 'Lomba', href: '/admin/competitions', icon: 'Trophy' },
  { title: 'Kategori', href: '/admin/categories', icon: 'Tags' },
  { title: 'Dokumen', href: '/admin/document-types', icon: 'FileText' },
  { title: 'Peserta', href: '/admin/participants', icon: 'UserCheck' },
  { title: 'Verifikasi', href: '/admin/verifications', icon: 'CheckSquare' },
  { title: 'Laporan', href: '/admin/reports', icon: 'BarChart3' },
  { title: 'Audit', href: '/admin/audit-logs', icon: 'History' },
  { title: 'Pengaturan', href: '/admin/settings', icon: 'Settings' },
];

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export function Sidebar({ isOpen, onClose, currentUser, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/admin/meta/menu');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.menu) && json.data.menu.length > 0) {
            setMenuItems(json.data.menu);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic menu, using fallback:', err);
      }
    }
    fetchMenu();
  }, []);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    } finally {
      setLoggingOut(false);
      onClose();
    }
  };

  // Helper for user initials
  const initials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ES';

  return (
    <>
      {/* Mobile backdrop with smooth fade */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 lg:w-60 bg-neutral-950 text-white flex flex-col border-r border-neutral-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-800 flex-shrink-0">
          <Link
            href="/admin"
            onClick={onClose}
            prefetch={true}
            className="flex items-center gap-2.5 font-bold tracking-wider text-xs uppercase"
          >
            <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center font-black text-xs shadow-sm">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold leading-none">LPTK MAHATO</span>
              <span className="text-[9px] text-neutral-400 font-mono tracking-tight lowercase">
                kecamatan panel
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-md transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items - Strictly 1 Word */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5 custom-scrollbar">
          {menuItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || FileText;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card & Logout in Sidebar (Mobile & Desktop) */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex-shrink-0 space-y-2">
          {currentUser && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded bg-neutral-900 border border-neutral-800">
              <div className="w-7 h-7 rounded bg-neutral-800 text-white flex items-center justify-center text-[10px] font-bold border border-neutral-700">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate leading-tight">
                  {currentUser.full_name}
                </p>
                <span className="inline-block mt-0.5 px-1 py-0.2 text-[9px] font-mono tracking-tight uppercase bg-neutral-800 text-neutral-300 rounded border border-neutral-700">
                  {currentUser.role_code.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Direct Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
