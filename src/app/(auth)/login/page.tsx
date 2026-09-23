'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
        setLoading(false);
        return;
      }

      // Smooth SPA redirect to /admin
      router.push('/admin');
    } catch {
      setError('Terjadi kendala jaringan saat menghubungi server.');
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('eka.ckp16799@gmail.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100 selection:bg-black selection:text-white">
      <div className="w-full max-w-sm bg-white border border-neutral-300 rounded-lg shadow-sm p-6 sm:p-7">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto bg-black text-white rounded flex items-center justify-center font-black text-base mb-2.5 shadow-sm">
            L
          </div>
          <h1 className="text-base font-bold text-black tracking-tight uppercase">
            LPTK Mahato
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Sistem Pendataan & Verifikasi Peserta
          </p>
        </div>

        {/* Quick Credential Hint Card */}
        <div
          onClick={handleFillDemo}
          className="mb-5 p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded text-left cursor-pointer transition-colors"
          title="Klik untuk mengisi otomatis"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-black mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kredensial Super Admin (Klik Isi)</span>
          </div>
          <div className="font-mono text-[10px] text-neutral-600 space-y-0.5">
            <div>Email: <span className="text-black font-medium">eka.ckp16799@gmail.com</span></div>
            <div>Sandi: <span className="text-black font-medium">admin123</span></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 bg-neutral-100 border border-neutral-400 text-black text-xs rounded font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@instansi.id"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* 1-Word Button: Masuk */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full text-xs py-2.5 font-bold h-9 mt-1"
          >
            Masuk
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-3.5 border-t border-neutral-200 text-center text-[10px] text-neutral-400 font-mono">
          Tingkat Kecamatan • Monochrome Black/White
        </div>
      </div>
    </div>
  );
}
