'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FileDown,
  BarChart3,
  Building2,
  Tags,
  CheckSquare,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PieChart as PieIcon,
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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-neutral-900">Laporan Statistik</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleExport} className="gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs">
            <FileDown className="w-3.5 h-3.5" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* 1-Word Tab Buttons */}
        <div className="inline-flex rounded-lg border border-neutral-200 p-1 bg-neutral-100 text-xs shadow-xs">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'participants' ? 'bg-white text-emerald-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Peserta</span>
          </button>
          <button
            onClick={() => setActiveTab('lptks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'lptks' ? 'bg-white text-emerald-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Kafilah</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'categories' ? 'bg-white text-emerald-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Tags className="w-3.5 h-3.5" />
            <span>Kategori</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'verification' ? 'bg-white text-emerald-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-black'
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
            className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-black shadow-xs"
          >
            <option value="">Semua Cabang Lomba</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Visual Charts & Diagrams Section */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded-xl">
          Memuat visualisasi dan statistik...
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: PARTICIPANTS CHARTS */}
          {activeTab === 'participants' && participantStats && (
            <div className="space-y-4">
              {/* Executive Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-neutral-500">Total Pendaftar</div>
                  <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
                    {participantStats.total}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">100% dari seluruh berkas</div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Terverifikasi</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
                    {participantStats.verified}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                    {participantStats.verifiedPct}% memenuhi syarat
                  </div>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Perlu Ditelaah</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-900 mt-1">
                    {participantStats.submitted + participantStats.revision}
                  </div>
                  <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                    {participantStats.submittedPct + participantStats.revisionPct}% dalam antrean
                  </div>
                </div>

                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Ditolak / Gugur</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-900 mt-1">
                    {participantStats.rejected}
                  </div>
                  <div className="text-[10px] text-rose-700 font-mono mt-0.5">
                    {participantStats.rejectedPct}% tidak sesuai juknis
                  </div>
                </div>
              </div>

              {/* Graphical Charts: Donut Status & Gender Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Visual Chart 1: Status Distribution Bar & Proportions */}
                <div className="md:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Komposisi Status Verifikasi
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">Total: {participantStats.total}</span>
                  </div>

                  {/* Horizontal Stacked Bar */}
                  <div className="h-6 w-full rounded-lg overflow-hidden flex bg-neutral-100 border border-neutral-200">
                    {participantStats.verified > 0 && (
                      <div
                        style={{ width: `${participantStats.verifiedPct}%` }}
                        className="bg-emerald-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                        title={`Verified: ${participantStats.verified} (${participantStats.verifiedPct}%)`}
                      >
                        {participantStats.verifiedPct > 8 ? `${participantStats.verifiedPct}%` : ''}
                      </div>
                    )}
                    {participantStats.submitted > 0 && (
                      <div
                        style={{ width: `${participantStats.submittedPct}%` }}
                        className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold text-neutral-900 transition-all"
                        title={`Submitted: ${participantStats.submitted} (${participantStats.submittedPct}%)`}
                      >
                        {participantStats.submittedPct > 8 ? `${participantStats.submittedPct}%` : ''}
                      </div>
                    )}
                    {participantStats.revision > 0 && (
                      <div
                        style={{ width: `${participantStats.revisionPct}%` }}
                        className="bg-sky-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                        title={`Revision: ${participantStats.revision} (${participantStats.revisionPct}%)`}
                      >
                        {participantStats.revisionPct > 8 ? `${participantStats.revisionPct}%` : ''}
                      </div>
                    )}
                    {participantStats.rejected > 0 && (
                      <div
                        style={{ width: `${participantStats.rejectedPct}%` }}
                        className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                        title={`Rejected: ${participantStats.rejected} (${participantStats.rejectedPct}%)`}
                      >
                        {participantStats.rejectedPct > 8 ? `${participantStats.rejectedPct}%` : ''}
                      </div>
                    )}
                  </div>

                  {/* Legends Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="w-3 h-3 rounded-full bg-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold text-neutral-800">Valid</div>
                        <div className="text-xs font-mono font-bold text-emerald-800">
                          {participantStats.verified} ({participantStats.verifiedPct}%)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold text-neutral-800">Menunggu</div>
                        <div className="text-xs font-mono font-bold text-amber-800">
                          {participantStats.submitted} ({participantStats.submittedPct}%)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold text-neutral-800">Revisi</div>
                        <div className="text-xs font-mono font-bold text-sky-800">
                          {participantStats.revision} ({participantStats.revisionPct}%)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold text-neutral-800">Ditolak</div>
                        <div className="text-xs font-mono font-bold text-rose-800">
                          {participantStats.rejected} ({participantStats.rejectedPct}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Chart 2: Gender Breakdown */}
                <div className="md:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Rasio Gender
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">Putra / Putri</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Putra Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-neutral-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          Putra (M)
                        </span>
                        <span className="font-mono font-bold text-neutral-900">
                          {participantStats.male} ({participantStats.malePct}%)
                        </span>
                      </div>
                      <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                        <div
                          style={{ width: `${participantStats.malePct}%` }}
                          className="h-full bg-blue-600 rounded-full transition-all"
                        />
                      </div>
                    </div>

                    {/* Putri Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-neutral-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Putri (F)
                        </span>
                        <span className="font-mono font-bold text-neutral-900">
                          {participantStats.female} ({participantStats.femalePct}%)
                        </span>
                      </div>
                      <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                        <div
                          style={{ width: `${participantStats.femalePct}%` }}
                          className="h-full bg-rose-500 rounded-full transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] text-neutral-600 leading-relaxed">
                    Setiap golongan lomba MTQ XIX Tambusai Utara dibatasi maksimal 1 peserta putra dan 1 peserta putri per kafilah desa.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LPTKS CHARTS */}
          {activeTab === 'lptks' && lptkStats && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-neutral-500">Jumlah Kafilah Desa</div>
                  <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
                    {lptkStats.totalVillages} Desa
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">Kecamatan Tambusai Utara</div>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-neutral-500">Total Peserta Diajukan</div>
                  <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
                    {lptkStats.totalParticipants}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">Seluruh desa</div>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-emerald-700">Telah Terverifikasi</div>
                  <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
                    {lptkStats.totalVerified}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">
                    {lptkStats.totalParticipants > 0
                      ? Math.round((lptkStats.totalVerified / lptkStats.totalParticipants) * 100)
                      : 0}
                    % terverifikasi
                  </div>
                </div>
              </div>

              {/* Ranked Bar Chart for 11 Villages */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Peringkat Partisipasi Kafilah Desa
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">Total & Terverifikasi</span>
                </div>

                <div className="space-y-3">
                  {data.map((row) => {
                    const total = Number(row.total_participants) || 0;
                    const verified = Number(row.verified_count) || 0;
                    const pctOfMax = Math.round((total / lptkStats.maxParticipants) * 100);
                    const verifiedPctOfTotal = total > 0 ? Math.round((verified / total) * 100) : 0;

                    return (
                      <div key={row.lptk_id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-neutral-900 font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {row.lptk_name}
                            <span className="text-[10px] text-neutral-400 font-mono">({row.village_name})</span>
                          </span>
                          <span className="font-mono text-neutral-700">
                            <strong className="text-black">{total}</strong> diajukan (
                            <span className="text-emerald-700">{verified} lolos</span>)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex border border-neutral-200">
                          {/* Verified portion */}
                          <div
                            style={{
                              width: `${(verified / lptkStats.maxParticipants) * 100}%`,
                            }}
                            className="bg-emerald-600 h-full transition-all"
                            title={`Lolos: ${verified}`}
                          />
                          {/* Unverified portion */}
                          <div
                            style={{
                              width: `${((total - verified) / lptkStats.maxParticipants) * 100}%`,
                            }}
                            className="bg-amber-400 h-full transition-all"
                            title={`Belum Lolos: ${total - verified}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES CHARTS */}
          {activeTab === 'categories' && categoryStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-neutral-500">Total Kategori Terbuka</div>
                  <div className="text-xl font-bold font-mono text-neutral-900 mt-1">{data.length} Golongan</div>
                  <div className="text-[10px] text-neutral-400 font-mono">6 Cabang Musabaqah</div>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-emerald-700">Total Pendaftar di Seluruh Kategori</div>
                  <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
                    {categoryStats.totalRegistrations}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">Akumulasi pendaftaran golongan</div>
                </div>
              </div>

              {/* Bar Chart of Top Categories */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Golongan Paling Diminati (Pendaftar Tertinggi)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">Peringkat Teratas</span>
                </div>

                <div className="space-y-3">
                  {categoryStats.top5.map((row) => {
                    const count = Number(row.total_registered) || 0;
                    const verified = Number(row.verified_count) || 0;
                    const pct = Math.round((count / categoryStats.maxRegistered) * 100);

                    return (
                      <div key={row.category_id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                            <span>{row.category_name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded">
                              {row.gender_code === 'M' ? 'Putra' : 'Putri'}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-normal">({row.competition_name})</span>
                          </span>
                          <span className="font-mono font-bold text-neutral-900">
                            {count} peserta <span className="text-emerald-700 font-normal">({verified} valid)</span>
                          </span>
                        </div>
                        <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-emerald-600 rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION CHARTS */}
          {activeTab === 'verification' && verifierStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-neutral-500">Total Telaah Keputusan</div>
                  <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
                    {verifierStats.totalDecisions}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">Keputusan verifikator</div>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-emerald-700">Disetujui</div>
                  <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
                    {verifierStats.totalApproved}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">
                    {verifierStats.totalDecisions > 0
                      ? Math.round((verifierStats.totalApproved / verifierStats.totalDecisions) * 100)
                      : 0}
                    % diterima
                  </div>
                </div>
                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-medium text-rose-700">Revisi & Ditolak</div>
                  <div className="text-xl font-bold font-mono text-rose-900 mt-1">
                    {verifierStats.totalRevision + verifierStats.totalRejected}
                  </div>
                  <div className="text-[10px] text-rose-700 font-mono">Butuh perbaikan / gugur</div>
                </div>
              </div>

              {/* Stacked Bar Chart per Verifier */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Produktivitas Petugas Verifikator
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">Disetujui / Revisi / Ditolak</span>
                </div>

                <div className="space-y-4">
                  {data.map((row) => {
                    const total = Number(row.total_decisions) || 0;
                    const verified = Number(row.verified_count) || 0;
                    const revision = Number(row.revision_count) || 0;
                    const rejected = Number(row.rejected_count) || 0;

                    const vPct = total > 0 ? (verified / total) * 100 : 0;
                    const rPct = total > 0 ? (revision / total) * 100 : 0;
                    const jPct = total > 0 ? (rejected / total) * 100 : 0;

                    return (
                      <div key={row.verifier_id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-900">{row.verifier_name}</span>
                          <span className="font-mono text-neutral-600">
                            <strong>{total}</strong> berkas (
                            <span className="text-emerald-700 font-bold">{verified} disetujui</span>,{' '}
                            <span className="text-amber-600">{revision} revisi</span>,{' '}
                            <span className="text-rose-600">{rejected} ditolak</span>)
                          </span>
                        </div>
                        <div className="h-4 w-full bg-neutral-100 rounded-full overflow-hidden flex border border-neutral-200">
                          {verified > 0 && (
                            <div
                              style={{ width: `${vPct}%` }}
                              className="bg-emerald-600 h-full transition-all"
                              title={`Disetujui: ${verified}`}
                            />
                          )}
                          {revision > 0 && (
                            <div
                              style={{ width: `${rPct}%` }}
                              className="bg-amber-400 h-full transition-all"
                              title={`Revisi: ${revision}`}
                            />
                          )}
                          {rejected > 0 && (
                            <div
                              style={{ width: `${jPct}%` }}
                              className="bg-rose-500 h-full transition-all"
                              title={`Ditolak: ${rejected}`}
                            />
                          )}
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
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Tabel Rincian Data
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            {data.length} baris data tercatat
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Memuat rincian tabel...</div>
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
                    <td className="px-4 py-2.5 font-semibold text-black">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          row.status_code === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status_code === 'SUBMITTED'
                            ? 'bg-amber-100 text-amber-800'
                            : row.status_code === 'REVISION_REQUIRED'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.status_code}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">
                      {row.gender_code === 'M' ? 'Putra (M)' : 'Putri (F)'}
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
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-800 font-semibold">{row.verified_count}</td>
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
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-800 font-semibold">{row.verified_count}</td>
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
                    <td className="px-4 py-2.5 text-right text-emerald-800 font-semibold">{row.verified_count}</td>
                    <td className="px-4 py-2.5 text-right text-amber-700">{row.revision_count}</td>
                    <td className="px-4 py-2.5 text-right text-rose-700">{row.rejected_count}</td>
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
