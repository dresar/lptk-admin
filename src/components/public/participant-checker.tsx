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
          label: 'Terverifikasi Sah',
          icon: CheckCircle,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'SUBMITTED':
      case 'IN_REVIEW':
        return {
          label: 'Dalam Peninjauan',
          icon: Clock,
          className: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'REVISION_REQUIRED':
        return {
          label: 'Perlu Revisi',
          icon: AlertTriangle,
          className: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'REJECTED':
        return {
          label: 'Tidak Memenuhi Syarat',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-300',
        };
      default:
        return {
          label: 'Draf',
          icon: FileQuestion,
          className: 'bg-neutral-100 text-neutral-800 border-neutral-300',
        };
    }
  };

  return (
    <section id="cek-status" className="bg-stone-50 text-neutral-900 py-12 border-b border-neutral-300 scroll-mt-14">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-100 border border-emerald-300 rounded-md text-emerald-800">
            <span className="text-amber-600 font-bold">۞</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verifikasi Mandiri Kafilah Desa</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Cek Keabsahan Peserta MTQ XIX
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Periksa status verifikasi berkas kafilah desa melalui NIK atau nama lengkap peserta.
          </p>
        </div>

        {/* Search Box: Rectangular with subtle rounded corners */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="bg-white p-2 border border-neutral-300 rounded-md shadow-xs flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Ketik 16 Digit NIK atau Nama Lengkap Peserta..."
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-md transition-colors shadow-xs disabled:opacity-50 min-h-[42px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Mengecek...</span>
                </>
              ) : (
                <>
                  <span>Cek Status</span>
                  <span className="text-amber-300">۞</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
            <span className="text-emerald-700">✓</span>
            <span>Privasi terlindungi: NIK disamarkan otomatis (contoh: 140608******0001)</span>
          </div>
        </form>

        {/* Results Area */}
        {loading ? (
          <div className="p-8 text-center bg-white border border-neutral-300 rounded-md shadow-xs text-xs text-neutral-500 space-y-2">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Menghubungkan ke basis data verifikasi MTQ XIX...</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="p-8 text-center bg-white border border-neutral-300 rounded-md shadow-xs space-y-3">
            <FileQuestion className="w-10 h-10 text-neutral-400 mx-auto" />
            <div className="text-base font-bold text-neutral-900">Data Peserta Tidak Ditemukan</div>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              Tidak ditemukan data peserta dengan kata kunci &quot;<span className="font-semibold text-neutral-900">{query}</span>&quot;. Pastikan penulisan NIK atau nama sudah sesuai.
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 px-1">
              <span>Ditemukan {results.length} data pendaftaran resmi:</span>
              <span className="text-[11px] font-mono text-neutral-500">KUA Tambusai Utara</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {results.map((item) => {
                const badge = getStatusBadge(item.status_code);
                const IconComp = badge.icon;
                const isVerified = item.status_code === 'VERIFIED';

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-md p-4 sm:p-5 shadow-xs transition-all space-y-3 relative overflow-hidden ${
                      isVerified
                        ? 'border-emerald-600 ring-1 ring-emerald-600/20'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm sm:text-base text-neutral-900 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        <div className="text-xs font-mono text-neutral-500">
                          NIK: {item.masked_nik}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold border rounded-sm ${badge.className}`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    {/* Participant Details */}
                    <div className="text-xs space-y-2 pt-3 border-t border-neutral-100">
                      <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-sm border border-neutral-200">
                        <span className="text-neutral-500">Asal Kafilah:</span>
                        <span className="font-bold text-emerald-900 flex items-center gap-1">
                          <span className="text-amber-500">۞</span>
                          <span>{item.village_name}</span>
                        </span>
                      </div>

                      <div className="bg-neutral-50 p-2 rounded-sm border border-neutral-200 space-y-1">
                        <span className="text-neutral-500 block text-[11px]">Golongan Musabaqah:</span>
                        <div className="font-semibold text-neutral-900">
                          {item.categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.categories.map((c, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm text-[11px]"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-neutral-400">Belum Ditentukan</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification Status Notes */}
                    {isVerified && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium text-[11px]">
                          Berkas dinyatakan sah & memenuhi syarat Juknis MTQ XIX.
                        </span>
                      </div>
                    )}

                    {item.status_code === 'REVISION_REQUIRED' && item.rejection_note && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-800">
                        <span className="font-bold block mb-0.5">Catatan Perbaikan:</span>
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
