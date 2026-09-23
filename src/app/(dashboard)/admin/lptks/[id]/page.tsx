'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  MapPin,
  Phone,
  User,
  Eye,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LptkDetail {
  id: string;
  code: string;
  name: string;
  village_id: string;
  village_name: string;
  leader_name: string;
  phone: string;
  address: string;
  active: boolean;
  created_at: string;
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
    school_or_institution?: string;
    category_name?: string;
    competition_name?: string;
  }>;
}

export default function LptkDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<LptkDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLptk = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lptks/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load LPTK detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchLptk();
    }
  }, [id, fetchLptk]);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['No', 'Nama Peserta', 'NIK', 'Jenis Kelamin', 'Kategori', 'Asal Lembaga', 'Status'],
      ...data.participants.map((p, idx) => [
        (idx + 1).toString(),
        `"${p.name}"`,
        `'${p.nik}`,
        p.gender_code === 'MALE' ? 'Putra' : 'Putri',
        `"${p.category_name || '-'}"`,
        `"${p.school_or_institution || '-'}"`,
        p.status_code,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kafilah_${data.name.replace(/\s+/g, '_').toLowerCase()}.csv`);
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
        Memuat detail LPTK...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
        Data LPTK tidak ditemukan.{' '}
        <Link href="/admin/lptks" className="text-black font-bold underline">
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
          <Link href="/admin/lptks">
            <Button variant="outline" size="sm" className="gap-1.5 font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-black">{data.name}</h1>
              <span className="font-mono text-xs px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-semibold text-neutral-700">
                {data.code}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neutral-400" />
                {data.village_name}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-neutral-400" />
                {data.leader_name}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-neutral-400" />
                {data.phone}
              </span>
            </div>
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
          <Link href={`/admin/lptks/${data.id}/edit`}>
            <Button size="sm" className="gap-1.5 font-bold">
              <Edit2 className="w-3.5 h-3.5" />
              Ubah
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 p-3.5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Total Kafilah</span>
            <Users className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold text-black mt-2 font-mono">
            {data.stats.total_participants}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Peserta terdaftar</div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Putra / Putri</span>
            <Building2 className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold text-black mt-2 font-mono">
            {data.stats.male_participants} / {data.stats.female_participants}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Komposisi gender</div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Terverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold text-black mt-2 font-mono">
            {data.stats.verified_participants}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Lolos verifikasi</div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Menunggu / Revisi</span>
            <Clock className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold text-black mt-2 font-mono">
            {data.stats.pending_participants} / {data.stats.revision_participants}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Status seleksi</div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black">
            Daftar Peserta Kafilah ({data.participants.length})
          </h2>
          <span className="text-[11px] text-neutral-500">Alamat: {data.address}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-black">
            <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-2.5 whitespace-nowrap">Nama Peserta</th>
                <th className="px-4 py-2.5 whitespace-nowrap">NIK</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Gender</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Cabang/Kategori</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Sekolah/Lembaga</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-2.5 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-neutral-400">
                    Belum ada peserta terdaftar dalam kafilah ini.
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
                    <td className="px-4 py-2.5 whitespace-nowrap text-neutral-600">
                      {p.gender_code === 'MALE' ? 'Putra' : 'Putri'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-neutral-700">
                      {p.category_name || '-'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-neutral-500">
                      {p.school_or_institution || '-'}
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
      </div>
    </div>
  );
}
