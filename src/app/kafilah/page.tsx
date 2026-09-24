'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { MobileBottomNav } from '@/components/public/mobile-bottom-nav';
import { Users, MapPin, Phone, User, CheckCircle2, ArrowLeft, Search, Sparkles } from 'lucide-react';

interface KafilahItem {
  id: string;
  name: string;
  code: string;
  leader_name: string;
  phone: string;
  address: string;
  village_name: string;
  participants_count: number;
  verified_count: number;
}

export default function KafilahPage() {
  const [kafilahList, setKafilahList] = useState<KafilahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/public/kafilah')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          setKafilahList(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? kafilahList.filter(
        (k) =>
          k.name.toLowerCase().includes(search.toLowerCase()) ||
          k.village_name.toLowerCase().includes(search.toLowerCase()) ||
          k.leader_name.toLowerCase().includes(search.toLowerCase())
      )
    : kafilahList;

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-amber-200">
      <PublicHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-[11px] font-mono text-neutral-500">
            11 Desa Se-Kecamatan Tambusai Utara
          </span>
        </div>

        {/* Header Section */}
        <div className="bg-white border border-stone-200 rounded-md p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 text-xs">۞</span>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-800">
              Direktori Kontingen Resmi
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Kafilah 11 Desa MTQ XIX 2026
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            Data profil resmi sebelas kontingen desa se-Kecamatan Tambusai Utara yang berpartisipasi di Desa Mahato.
          </p>

          {/* Quick Search */}
          <div className="mt-5 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama desa, LPTK, atau pimpinan..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-md text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Villages Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-stone-200 rounded-md shadow-xs">
            Memuat direktori 11 kafilah desa...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-stone-200 rounded-md shadow-xs">
            Tidak ada kafilah desa yang sesuai pencarian.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((k) => {
              const isMahatoHost =
                k.village_name.toLowerCase().includes('mahato') &&
                !k.village_name.toLowerCase().includes('sakti');

              return (
                <div
                  key={k.code}
                  className={`bg-white rounded-md border p-5 transition-all flex flex-col justify-between shadow-xs ${
                    isMahatoHost
                      ? 'border-2 border-amber-400 shadow-md ring-1 ring-amber-400/20'
                      : 'border-stone-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[11px] text-neutral-400 block mb-0.5">
                          KODE: {k.code}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-neutral-900 leading-snug">
                          {k.name}
                        </h3>
                      </div>
                      {isMahatoHost && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-sm border border-amber-300 flex-shrink-0">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Tuan Rumah</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-stone-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{k.address || `Desa ${k.village_name}, Tambusai Utara`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        <span className="font-medium text-neutral-800">{k.leader_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="font-mono text-[11px]">{k.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-mono text-[11px]">
                      Peserta:{' '}
                      <strong className="text-neutral-900 font-bold">{k.participants_count}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{k.verified_count} Lolos</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}
