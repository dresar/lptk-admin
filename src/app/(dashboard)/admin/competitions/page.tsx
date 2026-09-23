'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Trophy,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PaginationBar } from '@/components/ui/pagination';
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';
import { BulkToolbar } from '@/components/ui/bulk-toolbar';
import { ColumnToggle } from '@/components/ui/column-toggle';
import { ActionMenu } from '@/components/ui/action-menu';
import { Competition } from '@/types/database';
import { PaginationMeta } from '@/types/api';

const COMPETITION_COLUMNS = [
  { id: 'tahun', label: 'Tahun' },
  { id: 'status', label: 'Status' },
  { id: 'pendaftaran', label: 'Pendaftaran' },
];

export default function CompetitionsPage() {
  const [items, setItems] = useState<Competition[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Selective Bulk Selection Mode (disabled by default)
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Column Visibility Filter
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'tahun',
    'status',
    'pendaftaran',
  ]);

  // Custom Delete States
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    try {
      const qParam = search ? `&q=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/competitions?page=${page}&page_size=20${qParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load competitions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/competitions/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal menghapus lomba.');
        return;
      }
      setDeleteTarget(null);
      fetchCompetitions();
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/competitions/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedIds([]);
        setIsSelectMode(false);
        setIsBulkDeleteModalOpen(false);
        fetchCompetitions();
      }
    } catch {
      alert('Gagal melakukan hapus massal.');
    } finally {
      setBulkLoading(false);
    }
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

  const handleToggleSelectMode = () => {
    if (isSelectMode) {
      setIsSelectMode(false);
      setSelectedIds([]);
    } else {
      setIsSelectMode(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black uppercase">Lomba</h1>
          <p className="text-xs text-neutral-500">
            Agenda dan perhelatan musabaqah MTQ/STQ Kecamatan Mahato
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={isSelectMode ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggleSelectMode}
            className="gap-1.5 font-bold text-xs"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {isSelectMode ? 'Batal' : 'Pilih'}
          </Button>
          <ColumnToggle
            columns={COMPETITION_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={setVisibleColumns}
          />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Link href="/admin/competitions/new">
            <Button size="sm" className="gap-1.5 font-bold">
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari lomba..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
          />
        </div>
      </div>

      {/* Table / Grid Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Memuat data lomba...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada data lomba ditemukan.
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  {isSelectMode && (
                    <th className="w-10 px-3 py-2.5 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={items.length > 0 && selectedIds.length === items.length}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="rounded border-neutral-300"
                      />
                    </th>
                  )}
                  <th className="px-4 py-2.5 whitespace-nowrap">Nama Lomba</th>
                  {visibleColumns.includes('tahun') && (
                    <th className="px-4 py-2.5 whitespace-nowrap">Tahun</th>
                  )}
                  {visibleColumns.includes('status') && (
                    <th className="px-4 py-2.5 whitespace-nowrap">Status</th>
                  )}
                  {visibleColumns.includes('pendaftaran') && (
                    <th className="px-4 py-2.5 whitespace-nowrap">Masa Pendaftaran</th>
                  )}
                  <th className="px-4 py-2.5 whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    {isSelectMode && (
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-neutral-300"
                        />
                      </td>
                    )}
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium text-black">
                      <Link
                        href={`/admin/competitions/${item.id}`}
                        className="flex items-center gap-2 group hover:underline"
                      >
                        <Trophy className="w-4 h-4 text-black flex-shrink-0" />
                        <div>
                          <div className="font-bold group-hover:text-neutral-700">{item.name}</div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                            <span>{item.categories_count || 0} cabang</span>
                            <span>•</span>
                            <span>{item.participants_count || 0} peserta</span>
                          </div>
                        </div>
                      </Link>
                    </td>
                    {visibleColumns.includes('tahun') && (
                      <td className="px-4 py-2.5 whitespace-nowrap font-mono text-neutral-600">
                        {item.period_year}
                      </td>
                    )}
                    {visibleColumns.includes('status') && (
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-black">
                          {item.status_code}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('pendaftaran') && (
                      <td className="px-4 py-2.5 whitespace-nowrap text-neutral-600 text-[11px] font-mono">
                        {new Date(item.registration_open_at).toLocaleDateString('id-ID')} s/d{' '}
                        {new Date(item.registration_close_at).toLocaleDateString('id-ID')}
                      </td>
                    )}
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      {/* Mobile 3-Dots Action Menu */}
                      <div className="sm:hidden flex justify-end">
                        <ActionMenu
                          detailHref={`/admin/competitions/${item.id}`}
                          editHref={`/admin/competitions/${item.id}/edit`}
                          onDelete={() => setDeleteTarget({ id: item.id, name: item.name })}
                        />
                      </div>

                      {/* Desktop Full Actions */}
                      <div className="hidden sm:inline-flex items-center justify-end gap-1">
                        <Link href={`/admin/competitions/${item.id}`}>
                          <Button variant="outline" size="sm" className="gap-1 font-bold">
                            <Eye className="w-3.5 h-3.5" />
                            Lihat
                          </Button>
                        </Link>
                        <Link href={`/admin/competitions/${item.id}/edit`}>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </div>
      ) : (
        /* Grid Mode: 2 Columns on Mobile / Android, 5 Columns on Desktop */
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="bg-white border border-neutral-300 rounded-lg hover:border-black transition-all flex flex-col justify-between shadow-sm overflow-hidden group"
              >
                {/* Banner Thumbnail */}
                {item.banner_url ? (
                  <div className="h-20 sm:h-24 w-full overflow-hidden bg-neutral-100 border-b border-neutral-200 relative">
                    <img
                      src={item.banner_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/80 text-white font-mono text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {item.period_year}
                    </div>
                  </div>
                ) : (
                  <div className="h-16 sm:h-20 w-full bg-neutral-900 text-white flex items-center justify-between px-3 border-b border-neutral-800">
                    <Trophy className="w-5 h-5 text-white" />
                    <span className="font-mono text-xs sm:text-sm font-bold text-neutral-200">
                      {item.period_year}
                    </span>
                  </div>
                )}

                <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[9px] sm:text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-black">
                        {item.status_code}
                      </span>
                      {isSelectMode ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-neutral-300 text-black focus:ring-black cursor-pointer h-4 w-4"
                        />
                      ) : (
                        <ActionMenu
                          className="sm:hidden"
                          detailHref={`/admin/competitions/${item.id}`}
                          editHref={`/admin/competitions/${item.id}/edit`}
                          onDelete={() => setDeleteTarget({ id: item.id, name: item.name })}
                        />
                      )}
                    </div>
                    <Link
                      href={`/admin/competitions/${item.id}`}
                      className="font-bold text-xs sm:text-sm text-black leading-snug hover:underline line-clamp-2 block mt-1"
                    >
                      {item.name}
                    </Link>
                    {visibleColumns.includes('pendaftaran') && (
                      <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-1.5 font-mono truncate">
                        <Calendar className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(item.registration_open_at).toLocaleDateString('id-ID')} -{' '}
                          {new Date(item.registration_close_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:flex justify-between items-center pt-2.5 border-t border-neutral-100 mt-2.5">
                    <Link href={`/admin/competitions/${item.id}`}>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] font-bold gap-1">
                        <Eye className="w-3 h-3" />
                        Lihat
                      </Button>
                    </Link>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/competitions/${item.id}/edit`}>
                        <Button variant="outline" size="sm" className="p-1 h-6 w-6" aria-label="Ubah">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                        className="p-1 h-6 w-6 text-neutral-600 hover:text-black"
                        aria-label="Hapus"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-white border border-neutral-200 rounded">
            <PaginationBar meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Floating Bulk Toolbar (only active when in selection mode) */}
      {isSelectMode && (
        <BulkToolbar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onDelete={() => setIsBulkDeleteModalOpen(true)}
          isLoading={bulkLoading}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded">
            <AlertTriangle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-700 leading-relaxed">
              Anda akan menghapus event lomba{' '}
              <strong className="text-black font-semibold">"{deleteTarget?.name}"</strong>.
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
              <strong className="text-black font-semibold">{selectedIds.length}</strong> event lomba terpilih.
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
