'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, User, Users, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

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

export function KafilahSection() {
  const [kafilahList, setKafilahList] = useState<KafilahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public/kafilah')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat profil kafilah.');
        return res.json();
      })
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          setKafilahList(json.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat data kafilah.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="kafilah" className="bg-stone-50 text-neutral-900 py-12 sm:py-16 border-b border-stone-200 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="max-w-xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800">
              <span className="text-amber-600 font-bold">۞</span>
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>11 Kontingen Desa</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Profil Kafilah 11 Desa MTQ XIX 2026
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Sebelas kontingen desa se-Kecamatan Tambusai Utara yang berpartisipasi di Desa Mahato.
            </p>
          </div>

          <div>
            <Link
              href="/kafilah"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-100 text-emerald-900 text-xs font-semibold rounded-xl border border-stone-300 transition-colors shadow-xs"
            >
              <span>Semua Kafilah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 11 Villages Grid */}
        {loading ? (
          <div className="p-8 text-center bg-white border border-stone-200 rounded-2xl text-xs text-neutral-500 shadow-xs">
            Memuat profil 11 kafilah desa...
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white border border-rose-200 rounded-2xl text-xs text-rose-600 shadow-xs">
            {error}
          </div>
        ) : kafilahList.length === 0 ? (
          <div className="p-8 text-center bg-white border border-stone-200 rounded-2xl text-xs text-neutral-500 shadow-xs">
            Belum ada data kafilah terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kafilahList.map((k) => {
              const isMahatoHost =
                k.village_name.toLowerCase().includes('mahato') &&
                !k.village_name.toLowerCase().includes('sakti');

              return (
                <div
                  key={k.code}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between shadow-xs ${
                    isMahatoHost
                      ? 'border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                      : 'border-stone-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-neutral-400 block mb-0.5">
                          KODE: {k.code}
                        </span>
                        <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug">
                          {k.name}
                        </h3>
                      </div>
                      {isMahatoHost && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full border border-amber-300 flex-shrink-0">
                          Tuan Rumah
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-stone-100">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <span className="truncate">{k.address || `Desa ${k.village_name}`}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        <span className="truncate font-medium text-neutral-800">{k.leader_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="font-mono text-[11px]">{k.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-mono text-[11px]">
                      Peserta: <strong className="text-neutral-900 font-bold">{k.participants_count}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{k.verified_count} Lolos</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
