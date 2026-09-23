'use client';

import React, { useEffect, useState } from 'react';
import { FileDown, BarChart3, Building2, Tags, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Competition } from '@/types/database';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'participants' | 'lptks' | 'categories' | 'verification'>('participants');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/meta/options')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.competitions) {
          setCompetitions(json.data.competitions);
        }
      });
  }, []);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      try {
        const compParam = selectedComp ? `?competition_id=${selectedComp}` : '';
        const res = await fetch(`/api/admin/reports/${activeTab}${compParam}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [activeTab, selectedComp]);

  const handleExport = () => {
    const compParam = selectedComp ? `&competition_id=${selectedComp}` : '';
    window.open(`/api/admin/reports/export?type=${activeTab}${compParam}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Laporan</h1>
          <p className="text-xs text-neutral-500">Rekapitulasi dan ekspor data administratif perlombaan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleExport} className="gap-1.5">
            <FileDown className="w-3.5 h-3.5" />
            Ekspor
          </Button>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Strictly 1-Word Tabs */}
        <div className="inline-flex rounded border border-neutral-300 p-0.5 bg-neutral-100 text-xs">
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeTab === 'participants' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Peserta
          </button>
          <button
            onClick={() => setActiveTab('lptks')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeTab === 'lptks' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
            }`}
          >
            LPTK
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeTab === 'categories' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Kategori
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeTab === 'verification' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Verifikasi
          </button>
        </div>

        {activeTab !== 'verification' && (
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
          >
            <option value="">Semua Lomba</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Memuat laporan...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">Belum ada rekapitulasi data.</div>
        ) : activeTab === 'participants' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Status Pendaftaran</th>
                  <th className="px-4 py-2.5">Jenis Kelamin</th>
                  <th className="px-4 py-2.5 text-right">Jumlah Peserta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-semibold text-black">{row.status_code}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{row.gender_code}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-black">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'lptks' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Kode</th>
                  <th className="px-4 py-2.5">Nama LPTK</th>
                  <th className="px-4 py-2.5">Desa</th>
                  <th className="px-4 py-2.5 text-right">Total Pendaftar</th>
                  <th className="px-4 py-2.5 text-right">Terverifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.map((row) => (
                  <tr key={row.lptk_id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-mono text-neutral-500">{row.lptk_code}</td>
                    <td className="px-4 py-2.5 font-semibold text-black">{row.lptk_name}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{row.village_name}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-black">{row.total_participants}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-black">{row.verified_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'categories' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Cabang Kategori</th>
                  <th className="px-4 py-2.5">Lomba</th>
                  <th className="px-4 py-2.5">Gender</th>
                  <th className="px-4 py-2.5 text-right">Pendaftar</th>
                  <th className="px-4 py-2.5 text-right">Valid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.map((row) => (
                  <tr key={row.category_id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-semibold text-black">{row.category_name}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{row.competition_name}</td>
                    <td className="px-4 py-2.5 font-mono text-neutral-600">{row.gender_code}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-black">{row.total_registered}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-black">{row.verified_count}</td>
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
                  <th className="px-4 py-2.5">Nama Petugas Verifikator</th>
                  <th className="px-4 py-2.5 text-right">Total Telaah</th>
                  <th className="px-4 py-2.5 text-right">Disetujui</th>
                  <th className="px-4 py-2.5 text-right">Revisi</th>
                  <th className="px-4 py-2.5 text-right">Ditolak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono">
                {data.map((row) => (
                  <tr key={row.verifier_id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-sans font-semibold text-black">{row.verifier_name}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-black">{row.total_decisions}</td>
                    <td className="px-4 py-2.5 text-right text-black">{row.verified_count}</td>
                    <td className="px-4 py-2.5 text-right text-black">{row.revision_count}</td>
                    <td className="px-4 py-2.5 text-right text-black">{row.rejected_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
