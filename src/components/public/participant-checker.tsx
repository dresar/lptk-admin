'use client';

import React, { useState } from 'react';
import { Search, CheckCircle, Clock, AlertTriangle, XCircle, FileQuestion, User, ShieldCheck } from 'lucide-react';

interface ParticipantResult {
  id: string;
  name: string;
  masked_nik: string;
  gender_code: string;
  status_code: string;
  rejection_note?: string | null;
  lptk_name: string;
  village_name: string;
  competition_name: string;
  categories: string[];
  submitted_at?: string;
}

export function ParticipantChecker() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQ = query.trim();
    if (!cleanQ || cleanQ.length < 3) {
      setErrorMsg('Masukkan minimal 3 karakter NIK atau nama lengkap peserta');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/public/search-participant?q=${encodeURIComponent(cleanQ)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal mencari data peserta.');
        setResults([]);
        return;
      }
      setResults(json.data || []);
    } catch {
      setErrorMsg('Terjadi kendala jaringan saat menghubungi server.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'Terverifikasi',
          icon: CheckCircle,
          className: 'bg-emerald-900/30 text-emerald-300 border-emerald-700',
        };
      case 'SUBMITTED':
      case 'IN_REVIEW':
        return {
          label: 'Menunggu Verifikasi',
          icon: Clock,
          className: 'bg-amber-900/30 text-amber-300 border-amber-700',
        };
      case 'REVISION_REQUIRED':
        return {
          label: 'Perbaikan Berkas',
          icon: AlertTriangle,
          className: 'bg-rose-900/30 text-rose-300 border-rose-700',
        };
      case 'REJECTED':
        return {
          label: 'Berkas Ditolak',
          icon: XCircle,
          className: 'bg-red-950 text-red-400 border-red-800',
        };
      default:
        return {
          label: 'Draf',
          icon: FileQuestion,
          className: 'bg-neutral-800 text-neutral-300 border-neutral-700',
        };
    }
  };

  return (
    <section id="cek-status" className="bg-neutral-900 text-white py-12 border-b border-neutral-800 scroll-mt-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verifikasi Resmi Kafilah
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Cek Status Pendaftaran Peserta
          </h2>
          <p className="text-xs text-neutral-400">
            Ketikkan NIK 16 digit atau nama peserta untuk memeriksa keabsahan berkas kafilah MTQ XIX
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Ketik NIK atau Nama Peserta..."
                className="w-full pl-10 pr-4 py-3 text-xs bg-neutral-950 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-black font-semibold text-xs rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {loading ? 'Mencari...' : 'Cek'}
            </button>
          </div>

          {errorMsg && (
            <p className="mt-2 text-xs text-rose-400 font-medium">
              {errorMsg}
            </p>
          )}

          <p className="mt-2 text-[11px] text-neutral-400">
            Privasi terlindungi: NIK peserta ditampilkan dalam format sensor (contoh: 140608******0001).
          </p>
        </form>

        {/* Search Results */}
        {loading ? (
          <div className="p-8 text-center bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-400">
            Sedang memeriksa data pendaftaran peserta...
          </div>
        ) : searched && results.length === 0 ? (
          <div className="p-8 text-center bg-neutral-950 border border-neutral-800 rounded space-y-2">
            <FileQuestion className="w-8 h-8 text-neutral-400 mx-auto" />
            <div className="text-sm font-semibold text-white">Peserta Tidak Ditemukan</div>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Tidak ada data peserta yang cocok dengan kata kunci &quot;{query}&quot;. Pastikan ejaan nama atau NIK sudah benar, atau konfirmasi ke pengurus LPTQ desa Anda.
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs text-neutral-400 font-mono">
              Ditemukan {results.length} data peserta:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((item) => {
                const badge = getStatusBadge(item.status_code);
                const IconComp = badge.icon;

                return (
                  <div
                    key={item.id}
                    className="bg-neutral-950 border border-neutral-800 p-4 rounded hover:border-neutral-700 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        <div className="text-xs font-mono text-neutral-400 mt-0.5">
                          NIK: {item.masked_nik}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border rounded ${badge.className}`}
                      >
                        <IconComp className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="text-xs space-y-1 pt-2 border-t border-neutral-800/80 text-neutral-300">
                      <div>
                        <span className="text-neutral-400">Kafilah: </span>
                        <span className="font-medium text-white">{item.village_name}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Cabang Lomba: </span>
                        <span className="font-medium text-white">
                          {item.categories.length > 0 ? item.categories.join(', ') : 'Belum Ditentukan'}
                        </span>
                      </div>
                    </div>

                    {item.status_code === 'REVISION_REQUIRED' && item.rejection_note && (
                      <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded text-xs text-rose-300">
                        <span className="font-semibold block mb-0.5">Catatan Perbaikan:</span>
                        <span>{item.rejection_note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
