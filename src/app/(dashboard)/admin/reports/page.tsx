'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FileDown,
  Building2,
  Tags,
  CheckSquare,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
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
      })
      .catch(() => {});
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

  // Calculations for Participants Tab
  const participantStats = useMemo(() => {
    if (activeTab !== 'participants' || !data.length) return null;
    let total = 0;
    let verified = 0;
    let submitted = 0;
    let revision = 0;
    let rejected = 0;
    let male = 0;
    let female = 0;

    data.forEach((row) => {
      const count = Number(row.total) || 0;
      total += count;
      if (row.status_code === 'VERIFIED') verified += count;
      if (row.status_code === 'SUBMITTED') submitted += count;
      if (row.status_code === 'REVISION_REQUIRED') revision += count;
      if (row.status_code === 'REJECTED') rejected += count;

      if (row.gender_code === 'M') male += count;
      if (row.gender_code === 'F') female += count;
    });

    const verifiedPct = total > 0 ? Math.round((verified / total) * 100) : 0;
    const submittedPct = total > 0 ? Math.round((submitted / total) * 100) : 0;
    const revisionPct = total > 0 ? Math.round((revision / total) * 100) : 0;
    const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0;
    const malePct = total > 0 ? Math.round((male / total) * 100) : 0;
    const femalePct = total > 0 ? Math.round((female / total) * 100) : 0;

    return {
      total,
      verified,
      submitted,
      revision,
      rejected,
      male,
      female,
      verifiedPct,
      submittedPct,
      revisionPct,
      rejectedPct,
      malePct,
      femalePct,
    };
  }, [activeTab, data]);

  // Calculations for LPTK Tab
  const lptkStats = useMemo(() => {
    if (activeTab !== 'lptks' || !data.length) return null;
    const totalVillages = data.length;
    const totalParticipants = data.reduce((acc, r) => acc + (Number(r.total_participants) || 0), 0);
    const totalVerified = data.reduce((acc, r) => acc + (Number(r.verified_count) || 0), 0);
    const maxParticipants = Math.max(...data.map((r) => Number(r.total_participants) || 0), 1);
    return { totalVillages, totalParticipants, totalVerified, maxParticipants };
  }, [activeTab, data]);

  // Calculations for Categories Tab
  const categoryStats = useMemo(() => {
    if (activeTab !== 'categories' || !data.length) return null;
    const totalRegistrations = data.reduce((acc, r) => acc + (Number(r.total_registered) || 0), 0);
    const maxRegistered = Math.max(...data.map((r) => Number(r.total_registered) || 0), 1);
    const top5 = data.slice(0, 5);
    return { totalRegistrations, maxRegistered, top5 };
  }, [activeTab, data]);

  // Calculations for Verifier Tab
  const verifierStats = useMemo(() => {
    if (activeTab !== 'verification' || !data.length) return null;
    const totalDecisions = data.reduce((acc, r) => acc + (Number(r.total_decisions) || 0), 0);
    const totalApproved = data.reduce((acc, r) => acc + (Number(r.verified_count) || 0), 0);
    const totalRevision = data.reduce((acc, r) => acc + (Number(r.revision_count) || 0), 0);
    const totalRejected = data.reduce((acc, r) => acc + (Number(r.rejected_count) || 0), 0);
    const maxDecisions = Math.max(...data.map((r) => Number(r.total_decisions) || 0), 1);
    return { totalDecisions, totalApproved, totalRevision, totalRejected, maxDecisions };
  }, [activeTab, data]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">Laporan</h1>
        </div>
        <div>
          <Button size="sm" onClick={handleExport} className="gap-1.5 text-xs">
            <FileDown className="w-3.5 h-3.5" />
            Ekspor
          </Button>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="inline-flex rounded-md border border-neutral-300 p-0.5 bg-neutral-100 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'participants'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Peserta</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lptks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'lptks'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Kafilah</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Tags className="w-3.5 h-3.5" />
            <span>Kategori</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'verification'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Verifikasi</span>
          </button>
        </div>

        {activeTab !== 'verification' && (
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-black"
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

      {/* Visual Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-300 rounded-md">
          Memuat data...
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: PARTICIPANTS */}
          {activeTab === 'participants' && participantStats && (
            <div className="space-y-4">
              {/* 4 Clean Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Total Peserta</div>
                  <div className="text-2xl font-black text-black mt-1">
                    {participantStats.total}
                  </div>
                </div>

                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    <span>Valid</span>
                  </div>
                  <div className="text-2xl font-black text-black mt-1">
                    {participantStats.verified}
                  </div>
                </div>

                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-black" />
                    <span>Menunggu</span>
                  </div>
                  <div className="text-2xl font-black text-black mt-1">
                    {participantStats.submitted + participantStats.revision}
                  </div>
                </div>

                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 uppercase tracking-wider">
                    <XCircle className="w-3.5 h-3.5 text-black" />
                    <span>Ditolak</span>
                  </div>
                  <div className="text-2xl font-black text-black mt-1">
                    {participantStats.rejected}
                  </div>
                </div>
              </div>

              {/* Status Composition & Gender Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7 bg-white border border-neutral-300 rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Komposisi Status
                    </h2>
                    <span className="text-xs font-mono text-neutral-500">{participantStats.total} peserta</span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-5 w-full rounded-sm overflow-hidden flex bg-neutral-100 border border-neutral-300">
                    {participantStats.verified > 0 && (
                      <div
                        style={{ width: `${participantStats.verifiedPct}%` }}
                        className="bg-neutral-900 h-full flex items-center justify-center text-[10px] font-bold text-white"
                        title={`Valid: ${participantStats.verified} (${participantStats.verifiedPct}%)`}
                      >
                        {participantStats.verifiedPct > 10 ? `${participantStats.verifiedPct}%` : ''}
                      </div>
                    )}
                    {participantStats.submitted > 0 && (
                      <div
                        style={{ width: `${participantStats.submittedPct}%` }}
                        className="bg-neutral-500 h-full flex items-center justify-center text-[10px] font-bold text-white"
                        title={`Terkirim: ${participantStats.submitted} (${participantStats.submittedPct}%)`}
                      >
                        {participantStats.submittedPct > 10 ? `${participantStats.submittedPct}%` : ''}
                      </div>
                    )}
                    {participantStats.revision > 0 && (
                      <div
                        style={{ width: `${participantStats.revisionPct}%` }}
                        className="bg-neutral-400 h-full flex items-center justify-center text-[10px] font-bold text-black"
                        title={`Revisi: ${participantStats.revision} (${participantStats.revisionPct}%)`}
                      >
                        {participantStats.revisionPct > 10 ? `${participantStats.revisionPct}%` : ''}
                      </div>
                    )}
                    {participantStats.rejected > 0 && (
                      <div
                        style={{ width: `${participantStats.rejectedPct}%` }}
                        className="bg-neutral-300 h-full flex items-center justify-center text-[10px] font-bold text-black"
                        title={`Ditolak: ${participantStats.rejected} (${participantStats.rejectedPct}%)`}
                      >
                        {participantStats.rejectedPct > 10 ? `${participantStats.rejectedPct}%` : ''}
                      </div>
                    )}
                  </div>

                  {/* Clean Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="p-2 rounded-sm bg-neutral-50 border border-neutral-200">
                      <div className="text-[10px] uppercase font-semibold text-neutral-500">Valid</div>
                      <div className="text-sm font-bold text-black">{participantStats.verified} ({participantStats.verifiedPct}%)</div>
                    </div>
                    <div className="p-2 rounded-sm bg-neutral-50 border border-neutral-200">
                      <div className="text-[10px] uppercase font-semibold text-neutral-500">Terkirim</div>
                      <div className="text-sm font-bold text-black">{participantStats.submitted} ({participantStats.submittedPct}%)</div>
                    </div>
                    <div className="p-2 rounded-sm bg-neutral-50 border border-neutral-200">
                      <div className="text-[10px] uppercase font-semibold text-neutral-500">Revisi</div>
                      <div className="text-sm font-bold text-black">{participantStats.revision} ({participantStats.revisionPct}%)</div>
                    </div>
                    <div className="p-2 rounded-sm bg-neutral-50 border border-neutral-200">
                      <div className="text-[10px] uppercase font-semibold text-neutral-500">Ditolak</div>
                      <div className="text-sm font-bold text-black">{participantStats.rejected} ({participantStats.rejectedPct}%)</div>
                    </div>
                  </div>
                </div>

                {/* Gender Breakdown */}
                <div className="md:col-span-5 bg-white border border-neutral-300 rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Rasio Gender
                    </h2>
                    <span className="text-xs font-mono text-neutral-500">Putra & Putri</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-black">Putra</span>
                        <span className="font-bold text-black">{participantStats.male} ({participantStats.malePct}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-sm overflow-hidden border border-neutral-300">
                        <div style={{ width: `${participantStats.malePct}%` }} className="h-full bg-black" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-black">Putri</span>
                        <span className="font-bold text-black">{participantStats.female} ({participantStats.femalePct}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-sm overflow-hidden border border-neutral-300">
                        <div style={{ width: `${participantStats.femalePct}%` }} className="h-full bg-neutral-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LPTKS */}
          {activeTab === 'lptks' && lptkStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Kafilah Desa</div>
                  <div className="text-2xl font-black text-black mt-1">{lptkStats.totalVillages} Desa</div>
                </div>
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Total Peserta</div>
                  <div className="text-2xl font-black text-black mt-1">{lptkStats.totalParticipants}</div>
                </div>
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Valid</div>
                  <div className="text-2xl font-black text-black mt-1">{lptkStats.totalVerified}</div>
                </div>
              </div>

              {/* Ranked Bar Chart for Villages */}
              <div className="bg-white border border-neutral-300 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Partisipasi Kafilah
                  </h2>
                  <span className="text-xs font-mono text-neutral-500">11 Desa</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {data.map((row) => {
                    const total = Number(row.total_participants) || 0;
                    const verified = Number(row.verified_count) || 0;

                    return (
                      <div key={row.lptk_id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-black font-semibold">
                            {row.lptk_name}
                          </span>
                          <span className="font-mono text-neutral-600 text-xs">
                            <strong className="text-black">{total}</strong> diajukan, <strong className="text-black">{verified}</strong> valid
                          </span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-sm overflow-hidden flex border border-neutral-200">
                          <div
                            style={{
                              width: `${(verified / lptkStats.maxParticipants) * 100}%`,
                            }}
                            className="bg-black h-full"
                          />
                          <div
                            style={{
                              width: `${((total - verified) / lptkStats.maxParticipants) * 100}%`,
                            }}
                            className="bg-neutral-400 h-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && categoryStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Golongan Lomba</div>
                  <div className="text-2xl font-black text-black mt-1">{data.length} Golongan</div>
                </div>
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Total Pendaftar</div>
                  <div className="text-2xl font-black text-black mt-1">{categoryStats.totalRegistrations}</div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white border border-neutral-300 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Golongan Peminat Terbanyak
                  </h2>
                </div>

                <div className="space-y-2.5 pt-1">
                  {categoryStats.top5.map((row) => {
                    const count = Number(row.total_registered) || 0;
                    const verified = Number(row.verified_count) || 0;
                    const pct = Math.round((count / categoryStats.maxRegistered) * 100);

                    return (
                      <div key={row.category_id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-black">
                            {row.category_name} ({row.gender_code === 'M' ? 'Putra' : 'Putri'})
                          </span>
                          <span className="font-mono text-xs text-neutral-600">
                            <strong className="text-black">{count}</strong> peserta ({verified} valid)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-sm overflow-hidden border border-neutral-200">
                          <div style={{ width: `${pct}%` }} className="h-full bg-black" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION */}
          {activeTab === 'verification' && verifierStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Total Telaah</div>
                  <div className="text-2xl font-black text-black mt-1">{verifierStats.totalDecisions}</div>
                </div>
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Disetujui</div>
                  <div className="text-2xl font-black text-black mt-1">{verifierStats.totalApproved}</div>
                </div>
                <div className="bg-white border border-neutral-300 rounded-md p-4">
                  <div className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Revisi / Tolak</div>
                  <div className="text-2xl font-black text-black mt-1">
                    {verifierStats.totalRevision + verifierStats.totalRejected}
                  </div>
                </div>
              </div>

              {/* Verifier Breakdown */}
              <div className="bg-white border border-neutral-300 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Kinerja Verifikator
                  </h2>
                </div>

                <div className="space-y-3 pt-1">
                  {data.map((row) => {
                    const total = Number(row.total_decisions) || 0;
                    const verified = Number(row.verified_count) || 0;
                    const revision = Number(row.revision_count) || 0;
                    const rejected = Number(row.rejected_count) || 0;

                    const vPct = total > 0 ? (verified / total) * 100 : 0;
                    const rPct = total > 0 ? (revision / total) * 100 : 0;
                    const jPct = total > 0 ? (rejected / total) * 100 : 0;

                    return (
                      <div key={row.verifier_id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-black">{row.verifier_name}</span>
                          <span className="font-mono text-neutral-600 text-xs">
                            <strong className="text-black">{total}</strong> berkas ({verified} setuju, {revision} revisi, {rejected} tolak)
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-neutral-100 rounded-sm overflow-hidden flex border border-neutral-200">
                          {verified > 0 && <div style={{ width: `${vPct}%` }} className="bg-black h-full" />}
                          {revision > 0 && <div style={{ width: `${rPct}%` }} className="bg-neutral-500 h-full" />}
                          {rejected > 0 && <div style={{ width: `${jPct}%` }} className="bg-neutral-300 h-full" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabular Data View */}
      <div className="bg-white border border-neutral-300 rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Rincian Data
          </h2>
          <span className="text-[11px] font-mono text-neutral-500">
            {data.length} baris
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-neutral-500">Memuat rincian...</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500">Belum ada data.</div>
        ) : activeTab === 'participants' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Gender</th>
                  <th className="px-4 py-2.5 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-semibold text-black">
                      <span className="inline-block px-1.5 py-0.5 rounded-sm text-[11px] bg-neutral-200 text-black">
                        {row.status_code}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">
                      {row.gender_code === 'M' ? 'Putra' : 'Putri'}
                    </td>
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
                  <th className="px-4 py-2.5">Kafilah</th>
                  <th className="px-4 py-2.5">Desa</th>
                  <th className="px-4 py-2.5 text-right">Diajukan</th>
                  <th className="px-4 py-2.5 text-right">Valid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.map((row) => (
                  <tr key={row.lptk_id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-mono text-neutral-500">{row.lptk_code}</td>
                    <td className="px-4 py-2.5 font-semibold text-black">{row.lptk_name}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{row.village_name}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-black">{row.total_participants}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-black font-semibold">{row.verified_count}</td>
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
                  <th className="px-4 py-2.5">Golongan</th>
                  <th className="px-4 py-2.5">Cabang</th>
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
                    <td className="px-4 py-2.5 text-right font-mono text-black font-semibold">{row.verified_count}</td>
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
                  <th className="px-4 py-2.5">Verifikator</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
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
                    <td className="px-4 py-2.5 text-right text-black font-semibold">{row.verified_count}</td>
                    <td className="px-4 py-2.5 text-right text-neutral-600">{row.revision_count}</td>
                    <td className="px-4 py-2.5 text-right text-neutral-600">{row.rejected_count}</td>
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
