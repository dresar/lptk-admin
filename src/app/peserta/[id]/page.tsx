'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Clock, XCircle, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PublicParticipant {
  id: string;
  name: string;
  masked_nik: string;
  gender_code: string;
  birth_place: string;
  birth_date: string;
  status_code: string;
  participant_number?: string | null;
  team_id?: string | null;
  team_name?: string | null;
  team_role?: string | null;
  lptk_name: string;
  village_name: string;
  competition_name: string;
  categories: string[];
  photo_url?: string | null;
  submitted_at?: string;
}

export default function PublicParticipantPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<PublicParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/public/participant/${id}`);
        if (!res.ok) {
          setError('Data peserta tidak ditemukan.');
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error?.message || 'Data tidak ditemukan.');
        }
      } catch (err) {
        setError('Gagal memuat data peserta.');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white border border-neutral-300 rounded-md p-6 max-w-sm w-full text-center space-y-2">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500 font-mono">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white border border-neutral-300 rounded-md p-6 max-w-sm w-full text-center space-y-3">
          <h1 className="text-sm font-bold text-black">Verifikasi Peserta</h1>
          <p className="text-xs text-neutral-600">{error || 'Peserta tidak ditemukan.'}</p>
          <Link href="/">
            <Button size="sm">Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = data.status_code === 'VERIFIED';
  const regNo = `MTQ19-${data.id.slice(0, 6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white border border-neutral-300 rounded-md overflow-hidden shadow-xs">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-black uppercase tracking-wider">Verifikasi Peserta</h1>
            <span className="text-[10px] text-neutral-500 font-mono">MTQ XIX TAMBUSAI UTARA 2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            {data.participant_number && (
              <span className="px-2 py-0.5 text-[11px] font-black font-mono rounded-sm bg-black text-white">
                {data.participant_number}
              </span>
            )}
            <span
              className={`px-2 py-0.5 text-[11px] font-bold rounded-sm uppercase font-mono ${
                isVerified ? 'bg-black text-white' : 'bg-neutral-200 text-black'
              }`}
            >
              {isVerified ? 'Valid' : data.status_code}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 bg-neutral-100 border border-neutral-300 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
              {data.photo_url ? (
                <img src={data.photo_url} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-neutral-400" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-[10px] text-neutral-500 font-mono block">{regNo}</span>
              <h2 className="text-base font-black text-black uppercase leading-tight truncate">{data.name}</h2>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono rounded-sm bg-neutral-100 border border-neutral-300 text-neutral-800">
                  {data.gender_code === 'M' || data.gender_code === 'MALE' ? 'Putra' : 'Putri'}
                </span>
                {data.team_role && (
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-sm bg-black text-white">
                    {data.team_role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {data.team_name && (
            <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Regu / Kafilah:</span>
              <span className="font-extrabold text-black text-xs uppercase">{data.team_name}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Kafilah Desa</span>
              <span className="font-bold text-black uppercase">{data.village_name || data.lptk_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">NIK Terdaftar</span>
              <span className="font-mono text-black">{data.masked_nik}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-200 text-xs">
            <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Cabang Musabaqah</span>
            <span className="font-bold text-black block mt-0.5">
              {data.categories?.length > 0 ? data.categories.join(', ') : 'Belum Ditentukan'}
            </span>
          </div>

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono text-neutral-600">
            <span>Keabsahan:</span>
            <span className="font-bold text-black">{isVerified ? 'SAH & TERDAFTAR' : 'PROSES TELAIS'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <ArrowLeft className="w-3 h-3" /> Beranda
            </Button>
          </Link>
          <span className="text-[9px] font-mono text-neutral-500">LPTQ Tambusai Utara</span>
        </div>
      </div>
    </div>
  );
}
