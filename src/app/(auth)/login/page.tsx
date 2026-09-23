'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
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
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Terjadi kendala jaringan saat menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100">
      <div className="w-full max-w-sm bg-white border border-neutral-300 rounded shadow-md p-6">
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto bg-black text-white rounded flex items-center justify-center font-black text-base mb-2">
            L
          </div>
          <h1 className="text-lg font-bold text-black tracking-tight">Admin Panel</h1>
          <p className="text-xs text-neutral-500">Sistem Pendataan & Verifikasi LPTK</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-neutral-100 border border-neutral-400 text-black text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-black mb-1">Email</label>
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
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1">Sandi</label>
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
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>
          </div>

          {/* 1-Word Button: Masuk */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full text-xs py-2.5 font-semibold"
          >
            Masuk
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-200 text-center text-[10px] text-neutral-400">
          Tingkat Kecamatan • Monochrome Black/White
        </div>
      </div>
    </div>
  );
}
