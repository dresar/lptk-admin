'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

interface MenuItem {
  title: string; // Max 1 word
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

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/admin/meta/menu');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.menu) {
            setMenuItems(json.data.menu);
          }
        }
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-56 bg-black text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-neutral-800">
          <Link href="/admin" className="flex items-center gap-2 font-bold tracking-wider text-sm uppercase">
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-black text-xs">
              L
            </div>
            <span>LPTK Admin</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-neutral-400 hover:text-white rounded"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items - Strictly 1 Word */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {loading ? (
            <div className="p-4 text-xs text-neutral-500">Memuat...</div>
          ) : (
            menuItems.map((item) => {
              const IconComponent = ICON_MAP[item.icon] || FileText;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })
          )}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-neutral-800 text-[10px] text-neutral-400 text-center">
          LPTK Kecamatan v3.0
        </div>
      </aside>
    </>
  );
}
