'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AuthUser } from '@/types/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          router.replace('/login');
          return;
        }

        const json = await res.json();
        if (!json.success || !json.data?.user) {
          router.replace('/login');
          return;
        }

        if (isMounted) {
          setCurrentUser(json.data.user);
          setCheckingAuth(false);
        }
      } catch {
        router.replace('/login');
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
          {children}
        </main>
      </div>
    </div>
  );
}
