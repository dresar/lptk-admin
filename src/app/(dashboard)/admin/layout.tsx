'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AuthUser } from '@/types/auth';
import { AuthProvider } from '@/components/providers/auth-context';

function isRouteAllowed(pathname: string, roleCode?: string): boolean {
  if (!roleCode || roleCode === 'SUPER_ADMIN') return true;

  if (roleCode === 'ADMIN_KECAMATAN') {
    const forbiddenPrefixes = [
      '/admin/competitions',
      '/admin/categories',
      '/admin/document-types',
      '/admin/villages',
      '/admin/users',
      '/admin/roles',
      '/admin/settings',
      '/admin/audit-logs',
      '/admin/website',
    ];
    return !forbiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }

  if (roleCode === 'OPERATOR_LPTK') {
    if (pathname === '/admin') return true;
    const allowedPrefixes = [
      '/admin/lptks',
      '/admin/participants',
      '/admin/juknis',
      '/admin/profile',
    ];
    return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }

  return true;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch {}
          window.location.href = '/login?expired=1';
          return;
        }

        const json = await res.json();
        if (!json.success || !json.data?.user) {
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch {}
          window.location.href = '/login?expired=1';
          return;
        }

        if (isMounted) {
          setCurrentUser(json.data.user);
          setCheckingAuth(false);
        }
      } catch {
        clearTimeout(timeoutId);
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        window.location.href = '/login?expired=1';
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setCurrentUser(null);
      router.replace('/login');
    }
  };

  const isAllowed = isRouteAllowed(pathname, currentUser?.role_code);

  useEffect(() => {
    if (!checkingAuth && currentUser && !isAllowed) {
      router.replace('/admin');
    }
  }, [checkingAuth, currentUser, isAllowed, router]);

  // Minimal monochrome loading state during initial session check
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-black text-sm animate-pulse">
          L
        </div>
        <p className="text-xs text-neutral-400 font-mono tracking-wider">Memeriksa sesi...</p>
      </div>
    );
  }

  return (
    <AuthProvider user={currentUser}>
      <div className="min-h-screen bg-neutral-50 text-black flex">
        {/* Sidebar Navigation (Mobile Drawer & Desktop Fixed) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
          <Header
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {!isAllowed ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-neutral-500 font-mono">Mengalihkan...</span>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
