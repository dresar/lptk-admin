'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  FileDown,
  UserCheck,
  Building2,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PaginationBar } from '@/components/ui/pagination';
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';
import { BulkToolbar } from '@/components/ui/bulk-toolbar';
import { Participant, Competition, Lptk } from '@/types/database';
import { PaginationMeta } from '@/types/api';

export default function ParticipantsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedComp, setSelectedComp] = useState('');
  const [selectedLptk, setSelectedLptk] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Custom Delete Modal states
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [lptks, setLptks] = useState<Lptk[]>([]);

  useEffect(() => {
    async function loadFilters() {
      try {
        const res = await fetch('/api/admin/meta/options');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setCompetitions(json.data.competitions || []);
            setLptks(json.data.lptks || []);
          }
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    loadFilters();
  }, []);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      if (search) params.set('q', search);
      if (selectedComp) params.set('competition_id', selectedComp);
      if (selectedLptk) params.set('lptk_id', selectedLptk);
      if (selectedStatus) params.set('status_code', selectedStatus);

      const res = await fetch(`/api/admin/participants?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedComp, selectedLptk, selectedStatus]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Execute single delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/participants/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal menghapus peserta.');
        return;
      }
      setDeleteTarget(null);
      fetchParticipants();
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Execute bulk delete
  const confirmBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/participants/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
        fetchParticipants();
      }
    } catch {
      alert('Gagal melakukan hapus massal.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (selectedComp) params.set('competition_id', selectedComp);
    if (selectedLptk) params.set('lptk_id', selectedLptk);
    if (selectedStatus) params.set('status_code', selectedStatus);
    window.open(`/api/admin/participants/export?${params.toString()}`, '_blank');
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-neutral-100 text-neutral-600 border border-neutral-300 px-2 py-0.5 rounded text-[10px] font-mono">DRAF</span>;
      case 'SUBMITTED':
        return <span className="bg-neutral-200 text-black border border-neutral-400 px-2 py-0.5 rounded text-[10px] font-mono font-medium">TERKIRIM</span>;
      case 'IN_REVIEW':
        return <span className="bg-neutral-800 text-white border border-black px-2 py-0.5 rounded text-[10px] font-mono">DITINJAU</span>;
      case 'VERIFIED':
        return <span className="bg-black text-white border border-black px-2 py-0.5 rounded text-[10px] font-mono font-bold">VALID</span>;
      case 'REVISION_REQUIRED':
        return <span className="bg-white text-black border border-black underline px-2 py-0.5 rounded text-[10px] font-mono">REVISI</span>;
      case 'REJECTED':
        return <span className="bg-neutral-900 text-white line-through px-2 py-0.5 rounded text-[10px] font-mono">DITOLAK</span>;
      default:
        return <span className="text-[10px] font-mono">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black uppercase">Peserta</h1>
          <p className="text-xs text-neutral-500">Pendaftaran dan verifikasi kafilah MTQ/LPTK Mahato</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 font-medium">
            <FileDown className="w-3.5 h-3.5" />
            Ekspor
          </Button>
          <Link href="/admin/participants/new">
            <Button size="sm" className="gap-1.5 font-bold">
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
          />
        </div>

        <select
          value={selectedComp}
          onChange={(e) => {
            setSelectedComp(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
        >
          <option value="">Semua Lomba</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLptk}
          onChange={(e) => {
            setSelectedLptk(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
        >
          <option value="">Semua LPTK</option>
          {lptks.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
        >
          <option value="">Semua Status</option>
          <option value="DRAFT">Draf</option>
          <option value="SUBMITTED">Terkirim</option>
          <option value="IN_REVIEW">Ditinjau</option>
          <option value="VERIFIED">Terverifikasi</option>
          <option value="REVISION_REQUIRED">Perlu Revisi</option>
          <option value="REJECTED">Ditolak</option>
        </select>
      </div>

      {/* Table / Grid Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Memuat data peserta...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada data peserta ditemukan.
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="w-10 px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.length === items.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded border-neutral-300"
                    />
                  </th>
                  <th className="px-4 py-2.5">Peserta</th>
                  <th className="px-4 py-2.5">LPTK Desa</th>
                  <th className="px-4 py-2.5">Lomba & Cabang</th>
                  <th className="px-4 py-2.5">Berkas</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="w-28 px-4 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item: any) => {
                  const initials = item.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-neutral-300"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {item.photo_url ? (
                            <img
                              src={item.photo_url}
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover border border-neutral-200 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-neutral-100 border border-neutral-300 flex items-center justify-center font-bold text-[10px] text-neutral-700 flex-shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link href={`/admin/participants/${item.id}`} className="font-semibold text-black hover:underline block truncate">
                              {item.name}
                            </Link>
                            <span className="font-mono text-[10px] text-neutral-500">{item.nik}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium">{item.lptk_name}</div>
                        <div className="text-[10px] text-neutral-400">{item.village_name}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="text-neutral-700 font-medium truncate max-w-xs">{item.competition_name}</div>
                        {Array.isArray(item.categories) && item.categories.length > 0 && (
                          <div className="text-[10px] text-neutral-500 truncate max-w-xs">
                            {item.categories.map((c: any) => c.name).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-600">
                        {item.documents_count || 0} berkas
                      </td>
                      <td className="px-4 py-2.5">{getStatusBadge(item.status_code)}</td>
                      <td className="px-4 py-2.5 text-right space-x-1">
                        <Link href={`/admin/participants/${item.id}`}>
                          <Button variant="outline" size="sm" className="p-1.5 h-7 w-7" aria-label="Lihat">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/participants/${item.id}/edit`}>
                          <Button variant="outline" size="sm" className="p-1.5 h-7 w-7" aria-label="Ubah">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                          className="p-1.5 h-7 w-7 text-neutral-600 hover:text-black"
                          aria-label="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </div>
      ) : (
        /* Grid Mode With Photos */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item: any) => {
              const initials = item.name
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={item.id}
                  className="bg-white border border-neutral-300 p-3.5 rounded-lg hover:border-black transition-all flex flex-col justify-between shadow-sm group"
                >
                  <div>
                    {/* Header: NIK + Checkbox */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                      <span className="font-mono text-[11px] text-neutral-500 font-medium">{item.nik}</span>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                      />
                    </div>

                    {/* Participant Info & Photo */}
                    <div className="flex items-start gap-3 mb-3">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover border border-neutral-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xs text-neutral-700 flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/participants/${item.id}`}
                          className="font-bold text-sm text-black leading-snug hover:underline line-clamp-1 block"
                        >
                          {item.name}
                        </Link>
                        <div className="text-[11px] text-neutral-600 mt-0.5 flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                          <span className="truncate">{item.lptk_name || item.village_name}</span>
                        </div>
                        {Array.isArray(item.categories) && item.categories.length > 0 && (
                          <div className="mt-1">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 truncate max-w-full">
                              {item.categories.map((c: any) => c.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions & Status */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-neutral-100 mt-2">
                    {getStatusBadge(item.status_code)}
                    <div className="flex gap-1">
                      <Link href={`/admin/participants/${item.id}`}>
                        <Button variant="outline" size="sm" className="p-1.5 h-7 w-7" aria-label="Lihat">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/admin/participants/${item.id}/edit`}>
                        <Button variant="outline" size="sm" className="p-1.5 h-7 w-7" aria-label="Ubah">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                        className="p-1.5 h-7 w-7 text-neutral-600 hover:text-black"
                        aria-label="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 bg-white border border-neutral-200 rounded">
            <PaginationBar meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Floating Bulk Toolbar */}
      <BulkToolbar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onDelete={() => setIsBulkDeleteModalOpen(true)}
        isLoading={bulkLoading}
      />

      {/* Custom Delete Single Item Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded">
            <AlertTriangle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-700 leading-relaxed">
              Anda akan menghapus pendaftaran peserta{' '}
              <strong className="text-black font-semibold">"{deleteTarget?.name}"</strong>.
              Tindakan ini akan memindahkan data ke riwayat terhapus.
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={confirmDelete}
              isLoading={isDeleting}
              className="bg-black hover:bg-neutral-800 text-white font-bold"
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Konfirmasi Hapus Massal"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded">
            <AlertTriangle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-700 leading-relaxed">
              Anda akan menghapus secara massal{' '}
              <strong className="text-black font-semibold">{selectedIds.length}</strong> data peserta terpilih.
              Pastikan Anda telah memeriksa data sebelum melanjutkan.
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              disabled={bulkLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={confirmBulkDelete}
              isLoading={bulkLoading}
              className="bg-black hover:bg-neutral-800 text-white font-bold"
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
