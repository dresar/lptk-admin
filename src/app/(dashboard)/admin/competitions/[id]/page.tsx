'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Calendar,
  Layers,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompetitionDetail {
  id: string;
  name: string;
  description: string;
  period_year: number;
  status_code: string;
  registration_open_at: string;
  registration_close_at: string;
  banner_url?: string;
  categories: Array<{
    id: string;
    name: string;
    gender_code: string;
    age_min: number;
    age_max: number;
    requirements: string;
    participant_count: number;
  }>;
  stats: {
    total_participants: number;
    male_participants: number;
    female_participants: number;
    verified_participants: number;
    pending_participants: number;
    revision_participants: number;
  };
  participants: Array<{
    id: string;
    name: string;
    nik: string;
    gender_code: string;
    status_code: string;
    phone: string;
    photo_url?: string;
    lptk_name: string;
    category_name: string;
  }>;
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<CompetitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'participants'>('categories');

  const fetchCompetition = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/competitions/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load competition detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCompetition();
    }
  }, [id, fetchCompetition]);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['No', 'Nama Peserta', 'NIK', 'Jenis Kelamin', 'Kategori', 'Kafilah / LPTK', 'Status'],
      ...data.participants.map((p, idx) => [
        (idx + 1).toString(),
        `"${p.name}"`,
        `'${p.nik}`,
        p.gender_code === 'MALE' ? 'Putra' : 'Putri',
        `"${p.category_name || '-'}"`,
        `"${p.lptk_name || '-'}"`,
        p.status_code,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peserta_${data.name.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
        Memuat detail lomba...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
        Lomba tidak ditemukan.{' '}
        <Link href="/admin/competitions" className="text-black font-bold underline">
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link href="/admin/competitions">
            <Button variant="outline" size="sm" className="gap-1.5 font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-black">{data.name}</h1>
              <span className="font-mono text-xs px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-semibold text-neutral-700">
                {data.period_year}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  data.status_code === 'OPEN'
                    ? 'bg-neutral-900 text-white border-black'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                }`}
              >
                {data.status_code}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">{data.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 font-bold">
            <Download className="w-3.5 h-3.5" />
            Ekspor
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 font-bold">
            <Printer className="w-3.5 h-3.5" />
            Cetak
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 p-3.5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Total Peserta</span>
            <Users className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold text-black mt-2 font-mono">
            {data.stats.total_participants}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Terdaftar di MTQ</div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Cabang/Kategori</span>
            <Layers className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold text-black mt-2 font-mono">{data.categories.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Kategori dilombakan</div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Terverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold text-black mt-2 font-mono">
            {data.stats.verified_participants}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Lolos seleksi</div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Menunggu / Revisi</span>
            <Clock className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold text-black mt-2 font-mono">
            {data.stats.pending_participants} / {data.stats.revision_participants}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Belum tuntas</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-colors ${
              activeTab === 'categories'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Kategori ({data.categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-colors ${
              activeTab === 'participants'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Peserta ({data.participants.length})
          </button>
        </div>

        {activeTab === 'categories' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 whitespace-nowrap">Nama Cabang / Golongan</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Gender</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Rentang Usia</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Ketentuan / Maqra</th>
                  <th className="px-4 py-2.5 whitespace-nowrap text-right">Peserta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.categories.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap font-bold text-black">{c.name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-neutral-600">
                      {c.gender_code === 'MALE'
                        ? 'Putra'
                        : c.gender_code === 'FEMALE'
                        ? 'Putri'
                        : 'Campuran'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-neutral-600 font-mono">
                      {c.age_min} - {c.age_max} tahun
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500 max-w-sm truncate">
                      {c.requirements || '-'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right font-mono font-bold text-black">
                      {c.participant_count} peserta
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 whitespace-nowrap">Nama Peserta</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">NIK</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Kategori</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Kafilah</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Status</th>
                  <th className="px-4 py-2.5 whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-xs text-neutral-400">
                      Belum ada peserta terdaftar dalam event lomba ini.
                    </td>
                  </tr>
                ) : (
                  data.participants.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap font-medium text-black">
                        <div className="flex items-center gap-2">
                          {p.photo_url ? (
                            <img
                              src={p.photo_url}
                              alt={p.name}
                              className="w-6 h-6 rounded-full object-cover border border-neutral-300 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-mono text-neutral-600">
                        {p.nik}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-neutral-700">
                        {p.category_name || '-'}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-neutral-600">
                        {p.lptk_name || '-'}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.status_code === 'VERIFIED'
                              ? 'bg-neutral-900 text-white border-black'
                              : p.status_code === 'REVISION_REQUIRED' || p.status_code === 'REJECTED'
                              ? 'bg-white text-neutral-800 border-neutral-400'
                              : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                          }`}
                        >
                          {p.status_code}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right">
                        <Link href={`/admin/participants/${p.id}`}>
                          <Button variant="outline" size="sm" className="gap-1 font-bold">
                            <Eye className="w-3.5 h-3.5" />
                            Lihat
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
