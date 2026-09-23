'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User } from 'lucide-react';
import { Button } from '../ui/button';
import { AuthUser } from '@/types/auth';

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.user) {
            setUser(json.data.user);
          }
        }
      } catch (err) {
        console.error('Failed to get current user:', err);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-neutral-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 text-black hover:bg-neutral-100 rounded lg:hidden"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 text-right">
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-black leading-tight">
                {user.full_name}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wide">
                {user.role_code.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-neutral-100 border border-neutral-300 flex items-center justify-center text-black">
              <User className="w-4 h-4" />
            </div>
          </div>
        ) : null}

        {/* 1-Word Button: Keluar */}
        <Button
          variant="outline"
          size="sm"
          isLoading={loggingOut}
          onClick={handleLogout}
          className="text-xs gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </Button>
      </div>
    </header>
  );
}
