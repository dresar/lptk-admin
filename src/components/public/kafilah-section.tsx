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
    <section id="kafilah" className="bg-emerald-950 text-white py-16 border-b border-emerald-900 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-900 border border-emerald-700 rounded-full text-amber-300">
            <span className="text-amber-400 font-bold">۞</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>11 Desa Se-Kecamatan Tambusai Utara</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Profil Kafilah 11 Desa MTQ XIX 2026
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
            Sebelas kontingen desa yang mengirimkan kafilah putra dan putri terbaik pada perhelatan akbar di Desa Mahato
          </p>
        </div>

        {/* 11 Villages Grid with Loading and Error States */}
        {loading ? (
          <div className="p-8 text-center bg-emerald-900/30 border border-emerald-800 rounded-2xl text-xs text-emerald-300">
            Memuat profil 11 kafilah desa...
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-emerald-900/30 border border-rose-800 rounded-2xl text-xs text-rose-300">
            {error}
          </div>
        ) : kafilahList.length === 0 ? (
          <div className="p-8 text-center bg-emerald-900/30 border border-emerald-800 rounded-2xl text-xs text-emerald-300">
            Belum ada data kafilah terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kafilahList.map((k) => {
              const isMahatoHost = k.village_name.toLowerCase().includes('mahato') && !k.village_name.toLowerCase().includes('sakti');

              return (
                <div
                  key={k.code}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                    isMahatoHost
                      ? 'bg-emerald-900/90 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-emerald-900/40 border-emerald-800 hover:border-emerald-600 hover:bg-emerald-900/60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[11px] text-emerald-300/80 block mb-0.5">
                          KODE: {k.code}
                        </span>
                        <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-1.5">
                          {isMahatoHost ? (
                            <span className="text-amber-400">۞</span>
                          ) : (
                            <span className="text-emerald-500">۞</span>
                          )}
                          <span>{k.village_name}</span>
                        </h3>
                      </div>

                      {isMahatoHost && (
                        <span className="px-2.5 py-1 bg-amber-400 text-emerald-950 font-bold rounded-full text-[10px] uppercase shadow-xs flex items-center gap-1">
                          <span>★</span>
                          <span>Tuan Rumah</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-emerald-100/90">
                      <div className="flex items-center gap-2 bg-emerald-950/60 p-2 rounded-lg">
                        <User className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate font-medium">{k.leader_name}</span>
                      </div>

                      <div className="flex items-start gap-2 bg-emerald-950/60 p-2 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] text-emerald-200 line-clamp-2">{k.address}</span>
                      </div>

                      {k.phone && (
                        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-300 px-2">
                          <Phone className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{k.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-300">Peserta Terdaftar</span>
                    <span
                      className={`font-bold px-2.5 py-1 rounded-lg border ${
                        isMahatoHost
                          ? 'bg-amber-400 text-emerald-950 border-amber-300'
                          : 'bg-emerald-950 text-white border-emerald-700'
                      }`}
                    >
                      {k.participants_count} Orang
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Official Kafilah Rules Box (From Official Juknis SK No. 09) */}
        <div className="mt-10 p-6 bg-emerald-900/50 border border-emerald-700 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 font-mono uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Ketentuan Wajib Kafilah (SK LPTQ No. 09/LPTQ-T.U/MTQ/IX/2026):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-100">
            <div className="p-3 bg-emerald-950/70 rounded-xl border border-emerald-800/80">
              <span className="font-bold text-amber-300">1. Asal Daerah: </span>
              Peserta wajib putra/putri asal Tambusai Utara. Dilarang membawa peserta dari luar kecamatan.
            </div>
            <div className="p-3 bg-emerald-950/70 rounded-xl border border-emerald-800/80">
              <span className="font-bold text-amber-300">2. Satu Cabang: </span>
              Setiap peserta hanya boleh mengikuti 1 cabang musabaqah.
            </div>
            <div className="p-3 bg-emerald-950/70 rounded-xl border border-emerald-800/80">
              <span className="font-bold text-amber-300">3. Rekomendasi LPTQ: </span>
              Peminjaman peserta antar-desa se-Tambusai Utara wajib disertai surat rekomendasi resmi.
            </div>
            <div className="p-3 bg-emerald-950/70 rounded-xl border border-emerald-800/80">
              <span className="font-bold text-amber-300">4. Sanksi Diskualifikasi: </span>
              Desa yang terbukti membawa peserta luar Tambusai Utara akan langsung didiskualifikasi.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
