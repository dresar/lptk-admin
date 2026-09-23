'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MapPin,
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
import { Village } from '@/types/database';
import { PaginationMeta } from '@/types/api';

const VILLAGE_COLUMNS = [
  { id: 'kode', label: 'Kode' },
  { id: 'kecamatan', label: 'Kecamatan' },
];

export default function VillagesPage() {
  const [items, setItems] = useState<Village[]>([]);
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
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['kode', 'kecamatan']);

  // Modal State (Max 2 fields: code, name)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Village | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Custom Delete States
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const fetchVillages = useCallback(async () => {
    setLoading(true);
    try {
      const qParam = search ? `&q=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/villages?page=${page}&page_size=20${qParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load villages:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ code: '', name: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Village) => {
    setEditingItem(item);
    setFormData({ code: item.code, name: item.name });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const isEdit = !!editingItem;
    const url = isEdit ? `/api/admin/villages/${editingItem.id}` : '/api/admin/villages';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setFormError(json.error?.message || 'Gagal menyimpan data.');
        setFormSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      fetchVillages();
    } catch {
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/villages/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal menghapus desa.');
        return;
      }
      setDeleteTarget(null);
      fetchVillages();
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/villages/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedIds([]);
        setIsSelectMode(false);
        setIsBulkDeleteModalOpen(false);
        fetchVillages();
        if (json.data.failed.length > 0) {
          alert(`${json.data.deleted} berhasil dihapus, ${json.data.failed.length} gagal karena memiliki relasi LPTK.`);
        }
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
          <h1 className="text-xl font-bold tracking-tight text-black uppercase">Desa</h1>
          <p className="text-xs text-neutral-500">Master data desa se-Kecamatan Mahato</p>
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
            columns={VILLAGE_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={setVisibleColumns}
          />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 font-bold">
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari desa..."
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
          Memuat data desa...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada data desa ditemukan.
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
                  {visibleColumns.includes('kode') && (
                    <th className="px-4 py-2.5 whitespace-nowrap">Kode</th>
                  )}
                  <th className="px-4 py-2.5 whitespace-nowrap">Nama Desa</th>
                  {visibleColumns.includes('kecamatan') && (
                    <th className="px-4 py-2.5 whitespace-nowrap">Kecamatan</th>
                  )}
                  <th className="px-4 py-2.5 whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item) => (
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
                    {visibleColumns.includes('kode') && (
                      <td className="px-4 py-2.5 whitespace-nowrap font-mono text-neutral-600">
                        {item.code}
                      </td>
                    )}
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium text-black">
                      <Link
                        href={`/admin/villages/${item.id}`}
                        className="flex items-center gap-2 group hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5 text-black flex-shrink-0" />
                        <span className="font-bold text-black group-hover:text-neutral-700">
                          {item.name}
                        </span>
                      </Link>
                    </td>
                    {visibleColumns.includes('kecamatan') && (
                      <td className="px-4 py-2.5 whitespace-nowrap text-neutral-500">
                        Tambusai Utara, Rokan Hulu
                      </td>
                    )}
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      {/* Mobile 3-Dots Action Menu */}
                      <div className="sm:hidden flex justify-end">
                        <ActionMenu
                          detailHref={`/admin/villages/${item.id}`}
                          onEdit={() => handleOpenEdit(item)}
                          onDelete={() => setDeleteTarget({ id: item.id, name: item.name })}
                        />
                      </div>

                      {/* Desktop Full Actions */}
                      <div className="hidden sm:inline-flex items-center justify-end gap-1">
                        <Link href={`/admin/villages/${item.id}`}>
                          <Button variant="outline" size="sm" className="gap-1 font-bold">
                            <Eye className="w-3.5 h-3.5" />
                            Lihat
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 h-7 w-7"
                          aria-label="Ubah"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
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
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-neutral-300 p-2.5 sm:p-3 rounded-lg hover:border-black transition-all flex flex-col justify-between shadow-sm relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5 mb-2">
                    <span className="font-mono text-[10px] sm:text-xs text-neutral-600 font-bold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                      {item.code}
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
                        detailHref={`/admin/villages/${item.id}`}
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeleteTarget({ id: item.id, name: item.name })}
                      />
                    )}
                  </div>

                  <Link href={`/admin/villages/${item.id}`} className="block group-hover:underline">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-black leading-snug">
                      <MapPin className="w-3.5 h-3.5 text-black flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </Link>

                  <div className="text-[10px] text-neutral-400 mt-1 truncate">
                    Tambusai Utara
                  </div>
                </div>

                <div className="hidden sm:flex justify-between items-center gap-1 pt-2 border-t border-neutral-100 mt-2.5">
                  <Link href={`/admin/villages/${item.id}`}>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] font-bold gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Lihat
                    </Button>
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 h-6 w-6"
                      aria-label="Ubah"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                      className="p-1 h-6 w-6 text-neutral-600 hover:text-black"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
          onDelete={() => setIsBulkDeleteModalOpen(true)}
          onClear={() => setSelectedIds([])}
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
              Anda akan menghapus data desa{' '}
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
              <strong className="text-black font-semibold">{selectedIds.length}</strong> data desa terpilih.
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

      {/* Modal Dialog (Max 2 fields) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Ubah Desa' : 'Tambah Desa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2 text-xs bg-neutral-100 border border-neutral-300 rounded text-black">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-black mb-1">Kode</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Contoh: DS-01"
              className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1">Nama</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama desa atau kelurahan"
              className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={formSubmitting}
              className="font-bold"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
