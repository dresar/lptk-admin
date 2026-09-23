'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PaginationBar } from '@/components/ui/pagination';
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';
import { BulkToolbar } from '@/components/ui/bulk-toolbar';
import { DocumentType } from '@/types/database';
import { PaginationMeta } from '@/types/api';

export default function DocumentTypesPage() {
  const [items, setItems] = useState<DocumentType[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', is_required: true, active: true });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDocTypes = useCallback(async () => {
    setLoading(true);
    try {
      const qParam = search ? `&q=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/document-types?page=${page}&page_size=20${qParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load document types:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchDocTypes();
  }, [fetchDocTypes]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ code: '', name: '', is_required: true, active: true });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DocumentType) => {
    setEditingItem(item);
    setFormData({ code: item.code, name: item.name, is_required: item.is_required, active: item.active });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const isEdit = !!editingItem;
    const url = isEdit ? `/api/admin/document-types/${editingItem.id}` : '/api/admin/document-types';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setFormError(json.error?.message || 'Gagal menyimpan jenis dokumen.');
        setFormSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      fetchDocTypes();
    } catch (err) {
      setFormError('Terjadi kendala jaringan.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jenis dokumen ini?')) return;
    try {
      const res = await fetch(`/api/admin/document-types/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal menghapus jenis dokumen.');
        return;
      }
      fetchDocTypes();
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} jenis dokumen terpilih?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/document-types/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedIds([]);
        fetchDocTypes();
      }
    } catch (err) {
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

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Dokumen</h1>
          <p className="text-xs text-neutral-500">Master jenis dokumen persyaratan pendaftaran peserta</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
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
            placeholder="Cari jenis dokumen..."
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
          Memuat data jenis dokumen...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada data jenis dokumen ditemukan.
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
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
                  <th className="px-4 py-2.5">Kode</th>
                  <th className="px-4 py-2.5">Nama Dokumen</th>
                  <th className="px-4 py-2.5">Wajib</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="w-24 px-4 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded border-neutral-300"
                      />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-neutral-600">{item.code}</td>
                    <td className="px-4 py-2.5 font-medium text-black">{item.name}</td>
                    <td className="px-4 py-2.5">
                      {item.is_required ? (
                        <span className="font-semibold text-black">Wajib</span>
                      ) : (
                        <span className="text-neutral-500">Opsional</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-mono">{item.active ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5"
                        aria-label="Ubah"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5"
                        aria-label="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </div>
      ) : (
        /* Grid Mode */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-neutral-200 p-4 rounded hover:border-black transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-neutral-500">{item.code}</span>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                      className="rounded border-neutral-300"
                    />
                  </div>
                  <div className="font-semibold text-sm text-black mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-black flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {item.is_required ? 'Dokumen Wajib' : 'Dokumen Opsional'}
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-neutral-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-white border border-neutral-200 rounded">
            <PaginationBar meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Bulk Delete Toolbar */}
      <BulkToolbar
        selectedCount={selectedIds.length}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds([])}
        isLoading={bulkLoading}
      />

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Ubah Dokumen' : 'Tambah Dokumen'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2 text-xs bg-neutral-100 border border-neutral-300 rounded text-black">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Kode</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Contoh: KTP, KK, PAS_FOTO"
              className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Nama Dokumen</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Kartu Tanda Penduduk Asli"
              className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-black cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="rounded border-neutral-300"
              />
              Wajib Dilampirkan
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-black cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-neutral-300"
              />
              Aktif
            </label>
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
            <Button type="submit" size="sm" isLoading={formSubmitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
