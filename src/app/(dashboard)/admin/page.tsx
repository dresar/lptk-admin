'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  MapPin,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HardDrive,
  ArrowRight,
  FileCheck,
  Printer,
  FileUp,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-context';

interface DashboardStats {
  total_villages: number;
  total_lptks: number;
  total_users: number;
  total_participants: number;
  total_submitted: number;
  total_in_review: number;
  total_verified: number;
  total_revision_required: number;
  total_rejected: number;
  storage_used_bytes: number;
}

export default function DashboardPage() {
  const { isDesaOperator, isKecamatanAdmin, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setStats(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const pendingVerification = (stats?.total_submitted || 0) + (stats?.total_in_review || 0);

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          {isDesaOperator ? (
            <>
              <Link href="/admin/participants/new">
                <Button size="sm">Daftar</Button>
              </Link>
              <Link href="/admin/participants">
                <Button variant="outline" size="sm">Cetak Kartu</Button>
              </Link>
            </>
          ) : isKecamatanAdmin ? (
            <>
              <Link href="/admin/verifications">
                <Button size="sm">Verifikasi</Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" size="sm">Laporan</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/admin/participants/new">
                <Button size="sm">Daftar</Button>
              </Link>
              <Link href="/admin/verifications">
                <Button variant="outline" size="sm">Verifikasi</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Core Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-md border border-neutral-300">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">
              {isDesaOperator ? 'Peserta Kafilah' : 'Total Peserta'}
            </span>
            <UserCheck className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black">
            {loading ? '-' : stats?.total_participants || 0}
          </div>
        </div>

        {isDesaOperator ? (
          <>
            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Berkas Valid</span>
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : stats?.total_verified || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Perlu Revisi</span>
                <AlertCircle className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : stats?.total_revision_required || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Dalam Proses</span>
                <Clock className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : pendingVerification}
              </div>
            </div>
          </>
        ) : isKecamatanAdmin ? (
          <>
            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Kafilah Desa</span>
                <Building2 className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : stats?.total_lptks || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Menunggu Verifikasi</span>
                <Clock className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : pendingVerification}
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Berkas Valid</span>
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : stats?.total_verified || 0}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">LPTK</span>
                <Building2 className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : stats?.total_lptks || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Desa</span>
                <MapPin className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : stats?.total_villages || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border border-neutral-300">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Pengguna</span>
                <Users className="w-4 h-4 text-black" />
              </div>
              <div className="text-2xl font-black text-black">
                {loading ? '-' : stats?.total_users || 0}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Verification Breakdown Matrix */}
      <div>
        <h2 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
          Status Verifikasi
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-md border border-neutral-300">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-black" />
              <span>Terkirim</span>
            </div>
            <div className="text-xl font-bold text-black">
              {loading ? '-' : stats?.total_submitted || 0}
            </div>
          </div>

          <div className="bg-white p-3 rounded-md border border-neutral-300">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-black" />
              <span>Ditinjau</span>
            </div>
            <div className="text-xl font-bold text-black">
              {loading ? '-' : stats?.total_in_review || 0}
            </div>
          </div>

          <div className="bg-white p-3 rounded-md border border-neutral-300">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
              <span>Valid</span>
            </div>
            <div className="text-xl font-bold text-black">
              {loading ? '-' : stats?.total_verified || 0}
            </div>
          </div>

          <div className="bg-white p-3 rounded-md border border-neutral-300">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-black" />
              <span>Revisi</span>
            </div>
            <div className="text-xl font-bold text-black">
              {loading ? '-' : stats?.total_revision_required || 0}
            </div>
          </div>

          <div className="bg-white p-3 rounded-md border border-neutral-300">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-1 font-medium">
              <XCircle className="w-3.5 h-3.5 text-black" />
              <span>Ditolak</span>
            </div>
            <div className="text-xl font-bold text-black">
              {loading ? '-' : stats?.total_rejected || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Action Grid */}
      {isDesaOperator ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-5 rounded-md border border-neutral-300 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm mb-1">
                <FolderOpen className="w-4 h-4" />
                <span>Data Kafilah</span>
              </div>
              <div className="text-xs text-neutral-500">Lengkapi data kontingen dan pimpinan kafilah.</div>
            </div>
            <Link href="/admin/lptks">
              <Button variant="outline" size="sm" className="w-full">
                Lengkapi
              </Button>
            </Link>
          </div>

          <div className="bg-white p-5 rounded-md border border-neutral-300 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm mb-1">
                <FileUp className="w-4 h-4" />
                <span>Pendaftaran</span>
              </div>
              <div className="text-xs text-neutral-500">Daftarkan peserta dan upload berkas pendukung.</div>
            </div>
            <Link href="/admin/participants/new">
              <Button size="sm" className="w-full">
                Daftar
              </Button>
            </Link>
          </div>

          <div className="bg-white p-5 rounded-md border border-neutral-300 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm mb-1">
                <Printer className="w-4 h-4" />
                <span>Kartu Peserta</span>
              </div>
              <div className="text-xs text-neutral-500">Cetak kartu musabaqah peserta yang telah lolos verifikasi.</div>
            </div>
            <Link href="/admin/participants">
              <Button variant="outline" size="sm" className="w-full">
                Cetak
              </Button>
            </Link>
          </div>
        </div>
      ) : isKecamatanAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-white p-5 rounded-md border border-neutral-300 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-black mb-1">Meja Verifikasi</div>
              <div className="text-xs text-neutral-500">Periksa dan putuskan kelayakan berkas peserta</div>
            </div>
            <Link href="/admin/verifications">
              <Button size="sm" className="gap-1">
                Verifikasi <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="bg-white p-5 rounded-md border border-neutral-300 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-black mb-1">Rekapitulasi</div>
              <div className="text-xs text-neutral-500">Unduh data peserta dan kontingen kecamatan</div>
            </div>
            <Link href="/admin/reports">
              <Button variant="outline" size="sm" className="gap-1">
                Laporan <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-white p-5 rounded-md border border-neutral-300 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-black mb-1">Kapasitas Dokumen</div>
              <div className="text-xs text-neutral-500">Total berkas tersimpan privat di database</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-black flex items-center justify-end gap-1.5">
                <HardDrive className="w-4 h-4 text-black" />
                {loading ? '-' : formatBytes(stats?.storage_used_bytes || 0)}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-md border border-neutral-300 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-black mb-1">Meja Verifikasi</div>
              <div className="text-xs text-neutral-500">Periksa dan putuskan kelayakan berkas peserta</div>
            </div>
            <Link href="/admin/verifications">
              <Button size="sm" className="gap-1">
                Buka <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
