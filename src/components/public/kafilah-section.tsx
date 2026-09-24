'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, User, Users, CheckCircle, ShieldAlert } from 'lucide-react';

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
    <section id="kafilah" className="bg-neutral-900 text-white py-14 border-b border-neutral-800 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-300">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            11 Desa Se-Kecamatan
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Profil Kafilah Desa Tambusai Utara
          </h2>
          <p className="text-xs text-neutral-400">
            Sebelas kontingen desa yang mengirimkan kafilah putra dan putri pada perhelatan MTQ XIX 2026
          </p>
        </div>

        {/* 11 Villages Grid with Loading and Error States */}
        {loading ? (
          <div className="p-8 text-center bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-400">
            Memuat profil 11 kafilah desa...
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-neutral-950 border border-neutral-800 rounded text-xs text-rose-400">
            {error}
          </div>
        ) : kafilahList.length === 0 ? (
          <div className="p-8 text-center bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-400">
            Belum ada data kafilah terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kafilahList.map((k) => (
              <div
                key={k.code}
                className={`p-4 rounded border transition-colors flex flex-col justify-between ${
                  k.village_name.toLowerCase().includes('mahato') && !k.village_name.toLowerCase().includes('sakti')
                    ? 'bg-neutral-950 border-emerald-600'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] text-neutral-400 block mb-0.5">
                        {k.code}
                      </span>
                      <h3 className="font-bold text-sm text-white">
                        {k.village_name}
                      </h3>
                    </div>

                    {k.village_name.toLowerCase().includes('mahato') && !k.village_name.toLowerCase().includes('sakti') && (
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-semibold uppercase">
                        Tuan Rumah
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-300">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{k.leader_name}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] text-neutral-400 line-clamp-2">{k.address}</span>
                    </div>

                    {k.phone && (
                      <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                        <Phone className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span>{k.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Peserta Terdaftar</span>
                  <span className="font-bold text-white px-2 py-0.5 bg-neutral-900 border border-neutral-700 rounded">
                    {k.participants_count} Orang
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Official Kafilah Rules Box (From Official Juknis SK No. 09) */}
        <div className="mt-8 p-5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Ketentuan Wajib Kafilah (SK LPTQ No. 09/LPTQ-T.U/MTQ/IX/2026):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-300">
            <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
              <span className="font-semibold text-white">1. Asal Daerah: </span>
              Peserta wajib putra/putri asal Tambusai Utara. Dilarang membawa peserta dari luar kecamatan.
            </div>
            <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
              <span className="font-semibold text-white">2. Satu Cabang: </span>
              Setiap peserta hanya boleh mengikuti 1 cabang musabaqah.
            </div>
            <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
              <span className="font-semibold text-white">3. Rekomendasi LPTQ: </span>
              Peminjaman peserta antar-desa se-Tambusai Utara wajib disertai surat rekomendasi resmi.
            </div>
            <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
              <span className="font-semibold text-white">4. Sanksi Diskualifikasi: </span>
              Desa yang terbukti membawa peserta luar Tambusai Utara akan langsung didiskualifikasi.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
