'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Search,
  Eye,
  Check,
  AlertCircle,
  X,
  Clock,
  Building2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PaginationBar } from '@/components/ui/pagination';
import { PaginationMeta } from '@/types/api';

export default function VerificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Decision Modal
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [decision, setDecision] = useState<'VERIFIED' | 'REVISION_REQUIRED' | 'REJECTED' | 'IN_REVIEW'>('VERIFIED');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const qParam = search ? `&q=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/verifications?page=${page}&page_size=20${qParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load verification queue:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleOpenDecision = (item: any, initialDecision: any) => {
    setSelectedParticipant(item);
    setDecision(initialDecision);
    setNote('');
    setError(null);
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((decision === 'REVISION_REQUIRED' || decision === 'REJECTED') && !note.trim()) {
      setError('Catatan alasan wajib diisi untuk keputusan Revisi atau Ditolak.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/participants/${selectedParticipant.id}/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, note }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Gagal menyimpan keputusan verifikasi.');
        setSubmitting(false);
        return;
      }

      setSelectedParticipant(null);
      fetchQueue();
    } catch (err) {
      setError('Terjadi kendala jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">Verifikasi Dokumen</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIK peserta..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
          />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Memuat antrean verifikasi...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada berkas peserta yang menunggu verifikasi saat ini.
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Nama & NIK</th>
                  <th className="px-4 py-2.5">LPTK</th>
                  <th className="px-4 py-2.5">Lomba</th>
                  <th className="px-4 py-2.5">Dokumen</th>
                  <th className="px-4 py-2.5">Waktu Kirim</th>
                  <th className="w-48 px-4 py-2.5 text-right">Putusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-black">{item.name}</div>
                      <div className="font-mono text-[11px] text-neutral-500">{item.nik}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-black">{item.lptk_name}</div>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700">{item.competition_name}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        {item.documents_count} berkas
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">
                      {item.submitted_at ? new Date(item.submitted_at).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      <Link href={`/admin/participants/${item.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="p-1.5" aria-label="Lihat">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleOpenDecision(item, 'VERIFIED')}
                        className="bg-black hover:bg-neutral-800 text-xs px-2 py-1"
                        aria-label="Valid"
                      >
                        Valid
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDecision(item, 'REVISION_REQUIRED')}
                        className="text-xs px-2 py-1"
                        aria-label="Revisi"
                      >
                        Revisi
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDecision(item, 'REJECTED')}
                        className="text-xs px-2 py-1"
                        aria-label="Tolak"
                      >
                        Tolak
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </div>
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        title={`Keputusan: ${decision}`}
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4">
          {error && (
            <div className="p-2 text-xs bg-neutral-100 border border-neutral-300 rounded text-black">
              {error}
            </div>
          )}

          <div className="text-xs">
            <span className="text-neutral-500">Peserta:</span>
            <div className="font-semibold text-black">{selectedParticipant?.name} ({selectedParticipant?.nik})</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Pilihan Keputusan</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            >
              <option value="VERIFIED">VERIFIED (Semua Dokumen Sah)</option>
              <option value="REVISION_REQUIRED">REVISION_REQUIRED (Perlu Perbaikan)</option>
              <option value="REJECTED">REJECTED (Gugur / Ditolak)</option>
              <option value="IN_REVIEW">IN_REVIEW (Sedang Dalam Pemeriksaan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Catatan Putusan {(decision === 'REVISION_REQUIRED' || decision === 'REJECTED') && '(Wajib)'}
            </label>
            <textarea
              rows={3}
              required={decision === 'REVISION_REQUIRED' || decision === 'REJECTED'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Lampiran KTP buram, harap unggah scan asli..."
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedParticipant(null)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
