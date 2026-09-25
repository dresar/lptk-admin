'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Shield, Building2, User, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoAccount {
  role: string;
  badge: string;
  name: string;
  email: string;
  password: string;
  icon: React.ElementType;
  description: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Super Admin',
    badge: 'SUPER ADMIN',
    name: 'Eka Syarif Maulana',
    email: 'eka.ckp16799@gmail.com',
    password: 'admin123',
    icon: Shield,
    description: 'Akses penuh seluruh 13 modul & konfigurasi sistem',
  },
  {
    role: 'Admin Kecamatan',
    badge: 'KECAMATAN',
    name: 'H. Faisal Rahman, S.Ag',
    email: 'kecamatan.mahato@rohul.go.id',
    password: 'admin123',
    icon: Building2,
    description: 'Verifikator berkas peserta lomba tingkat kecamatan',
  },
  {
    role: 'Operator Desa',
    badge: 'DESA MAHATO',
    name: 'Rahmat Hidayat, S.Kom',
    email: 'operator.mahato@lptk.id',
    password: 'admin123',
    icon: User,
    description: 'Pendaftaran & unggah berkas peserta Desa Mahato',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('eka.ckp16799@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<string>('Super Admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/api/cdn/logos/lptq-logo.png');
  const [appName, setAppName] = useState('LPTK Mahato');

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

  const handleSelectDemo = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedRole(acc.role);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100 selection:bg-black selection:text-white">
      <div className="w-full max-w-md bg-white border border-neutral-300 rounded-lg shadow-sm p-6 sm:p-7">
        {/* Top Back to Home Navigation */}
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-neutral-200">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            MTQ XIX 2026
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto bg-white p-1 rounded-full border border-neutral-300 flex items-center justify-center mb-2 shadow-sm overflow-hidden">
            <img
              src={logoUrl}
              alt={appName}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-base font-bold text-black tracking-tight uppercase">
            {appName}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Sistem Pendataan & Verifikasi Peserta Lomba
          </p>
        </div>

        {/* Multi-Role Quick Demo Picker */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-black uppercase tracking-wider">
            <span>Pilih Akun Demo:</span>
            <span className="text-[10px] text-neutral-400 font-normal">Klik untuk mengisi form</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = selectedRole === acc.role;
              const IconComponent = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`w-full text-left p-2.5 rounded border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-black shadow-sm'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-black border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs ${
                        isSelected ? 'bg-white text-black' : 'bg-neutral-200 text-neutral-800'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="text-xs font-bold truncate">{acc.role}</span>
                        <span
                          className={`text-[9px] px-1 py-0.5 rounded font-mono uppercase tracking-tight ${
                            isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {acc.badge}
                        </span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {acc.name} • {acc.email}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 bg-neutral-100 border border-neutral-400 text-black text-xs rounded font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 border-t border-neutral-200">
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedRole('');
                }}
                placeholder="nama@instansi.id"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono placeholder:text-neutral-400"
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setSelectedRole('');
                }}
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
            className="w-full text-xs py-2.5 font-bold h-9 mt-1 gap-1.5"
          >
            <span>Masuk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        {/* Bottom Back to Home Link */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Beranda Publik</span>
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-neutral-200 text-center text-[10px] text-neutral-400 font-mono">
          Kecamatan Tambusai Utara • Rokan Hulu, Riau
        </div>
      </div>
    </div>
  );
}
