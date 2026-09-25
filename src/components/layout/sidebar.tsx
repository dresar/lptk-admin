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
  BookOpen,
  Newspaper,
  X,
  LogOut,
  User as UserIcon,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  LayoutTemplate,
  UploadCloud,
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
  Newspaper,
  BookOpen,
  History,
  Settings,
  Globe,
  UploadCloud,
};

// Full modules default fallback: sidebar is NEVER blank
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
  { title: 'Juknis', href: '/admin/juknis', icon: 'BookOpen' },
  { title: 'Audit', href: '/admin/audit-logs', icon: 'History' },
  { title: 'Pengaturan', href: '/admin/settings', icon: 'Settings' },
];

// Clean, task-focused menu for Operator Desa
const DESA_DEFAULT_MENU: MenuItem[] = [
  { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { title: 'Kafilah', href: '/admin/lptks', icon: 'Building2' },
  { title: 'Peserta', href: '/admin/participants', icon: 'UserCheck' },
  { title: 'Juknis', href: '/admin/juknis', icon: 'BookOpen' },
  { title: 'Laporan', href: '/admin/reports', icon: 'BarChart3' },
];

// Clean, task-focused menu for Admin Kecamatan
const KECAMATAN_DEFAULT_MENU: MenuItem[] = [
  { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { title: 'Verifikasi', href: '/admin/verifications', icon: 'CheckSquare' },
  { title: 'Peserta', href: '/admin/participants', icon: 'UserCheck' },
  { title: 'Kafilah', href: '/admin/lptks', icon: 'Building2' },
  { title: 'Laporan', href: '/admin/reports', icon: 'BarChart3' },
  { title: 'Juknis', href: '/admin/juknis', icon: 'BookOpen' },
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

  const isSuperAdmin = currentUser?.role_code === 'SUPER_ADMIN';
  const isDesaOperator = currentUser?.role_code === 'OPERATOR_LPTK';
  const isKecamatanAdmin = currentUser?.role_code === 'ADMIN_KECAMATAN';

  const canAccessWebsite =
    !isDesaOperator &&
    (isSuperAdmin ||
      isKecamatanAdmin ||
      currentUser?.permissions?.includes('setting.write') ||
      currentUser?.permissions?.includes('post.write'));

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    isDesaOperator
      ? DESA_DEFAULT_MENU
      : isKecamatanAdmin
      ? KECAMATAN_DEFAULT_MENU
      : DEFAULT_MENU_ITEMS
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const [websiteOpen, setWebsiteOpen] = useState(true);

  const [logoUrl, setLogoUrl] = useState<string>('/api/cdn/logos/lptq-logo.png');
  const [appName, setAppName] = useState<string>('LPTK MAHATO');

  const isWebsiteActive =
    pathname.startsWith('/admin/website') ||
    pathname.startsWith('/admin/posts') ||
    pathname.startsWith('/admin/cdn');

  useEffect(() => {
    fetch('/api/meta/branding', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.app_logo_url) {
          const clean = json.data.app_logo_url.replace(/\/api\/cdn\/cdn\//g, '/api/cdn/');
          setLogoUrl(clean);
        }
        if (json?.data?.app_name) setAppName(json.data.app_name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/admin/meta/menu');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.menu) && json.data.menu.length > 0) {
            // Filter out website/posts/cdn from generic list as they have a dedicated dropdown
            const filtered = json.data.menu.filter(
              (m: MenuItem) => !['/admin/website', '/admin/posts', '/admin/cdn'].includes(m.href)
            );
            setMenuItems(filtered);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic menu, using fallback:', err);
      }
    }
    fetchMenu();
  }, [isDesaOperator, isKecamatanAdmin]);

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
            <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              <img
                src={logoUrl}
                alt={appName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold leading-none">{appName}</span>
              <span className="text-[9px] text-neutral-400 font-mono tracking-tight lowercase">
                {isDesaOperator ? 'kafilah desa' : isSuperAdmin ? 'super admin' : 'kecamatan panel'}
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

        {/* Public Website Link (Opens in new tab) */}
        <div className="px-2.5 pt-2.5 pb-1 flex-shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 transition-colors"
            title="Buka Website Publik di Tab Baru"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Portal Publik</span>
            </div>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-0.5 custom-scrollbar">
          {/* Main Dashboard Link */}
          <Link
            href="/admin"
            prefetch={true}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
              pathname === '/admin'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Dashboard</span>
          </Link>

          {/* Website Management Dropdown Section (Only for Super Admin & Kecamatan) */}
          {canAccessWebsite && (
            <div className="pt-1.5 pb-1">
              <button
                type="button"
                onClick={() => setWebsiteOpen(!websiteOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  isWebsiteActive
                    ? 'bg-neutral-900 text-amber-300'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Website</span>
                </div>
                {websiteOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </button>

              {websiteOpen && (
                <div className="pl-6 pr-1 pt-1 space-y-0.5 border-l border-neutral-800 ml-4 mt-1">
                  {isSuperAdmin && (
                    <Link
                      href="/admin/website"
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                        pathname === '/admin/website'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tampilan & Hero</span>
                    </Link>
                  )}
                  <Link
                    href="/admin/posts"
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      pathname.startsWith('/admin/posts')
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Berita & Warta</span>
                  </Link>
                  <Link
                    href="/admin/cdn"
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      pathname === '/admin/cdn'
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Media CDN</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Other Standard Modules */}
          {menuItems
            .filter((item) => item.href !== '/admin')
            .map((item) => {
              const IconComponent = ICON_MAP[item.icon] || FileText;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

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
            <Link
              href="/admin/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors group cursor-pointer"
            >
              <div className="w-7 h-7 rounded bg-neutral-800 text-white flex items-center justify-center text-[10px] font-bold border border-neutral-700 group-hover:border-neutral-500">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate leading-tight group-hover:underline">
                  {currentUser.full_name}
                </p>
                <span className="inline-block mt-0.5 px-1 py-0.2 text-[9px] font-mono tracking-tight uppercase bg-neutral-800 text-neutral-300 rounded border border-neutral-700">
                  {currentUser.role_code.replace(/_/g, ' ')}
                </span>
              </div>
            </Link>
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
