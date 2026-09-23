'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Tags, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PaginationBar } from '@/components/ui/pagination';
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';
import { BulkToolbar } from '@/components/ui/bulk-toolbar';
import { Category, Competition } from '@/types/database';
import { PaginationMeta } from '@/types/api';

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState('');
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Form Modal / Drawer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    competition_id: '',
    name: '',
    gender_code: 'ANY',
    age_min: 0,
    age_max: 30,
    requirements: '',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/meta/options')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.competitions) {
          setCompetitions(json.data.competitions);
        }
      });
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      if (search) params.set('q', search);
      if (selectedComp) params.set('competition_id', selectedComp);

      const res = await fetch(`/api/admin/categories?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedComp]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      competition_id: selectedComp || competitions[0]?.id || '',
      name: '',
      gender_code: 'ANY',
      age_min: 0,
      age_max: 30,
      requirements: '',
      active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Category) => {
    setEditingItem(item);
    setFormData({
      competition_id: item.competition_id,
      name: item.name,
      gender_code: item.gender_code,
      age_min: item.age_min,
      age_max: item.age_max,
      requirements: item.requirements || '',
      active: item.active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const isEdit = !!editingItem;
    const url = isEdit ? `/api/admin/categories/${editingItem.id}` : '/api/admin/categories';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age_min: Number(formData.age_min),
          age_max: Number(formData.age_max),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error?.message || 'Gagal menyimpan kategori.');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError('Terjadi kendala jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal menghapus kategori.');
        return;
      }
      fetchCategories();
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} kategori terpilih?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/categories/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedIds([]);
        fetchCategories();
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
          <h1 className="text-xl font-bold tracking-tight text-black">Kategori</h1>
          <p className="text-xs text-neutral-500">Cabang dan golongan perlombaan MTQ/LPTK</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama kategori..."
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
      </div>

      {/* Table / Grid Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Memuat data kategori...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada data kategori ditemukan.
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
                  <th className="px-4 py-2.5">Nama Kategori</th>
                  <th className="px-4 py-2.5">Lomba</th>
                  <th className="px-4 py-2.5">Gender</th>
                  <th className="px-4 py-2.5">Rentang Usia</th>
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
                    <td className="px-4 py-2.5 font-medium text-black">{item.name}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{item.competition_name}</td>
                    <td className="px-4 py-2.5 text-neutral-700">{item.gender_code}</td>
                    <td className="px-4 py-2.5 font-mono text-neutral-600">
                      {item.age_min} - {item.age_max} th
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
                    <span className="font-mono text-xs text-neutral-500">{item.gender_code}</span>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                      className="rounded border-neutral-300"
                    />
                  </div>
                  <div className="font-bold text-sm text-black mb-1 flex items-center gap-1.5">
                    <Tags className="w-4 h-4 text-black flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <div className="text-xs text-neutral-500 mb-1">{item.competition_name}</div>
                  <div className="text-xs text-neutral-600 font-mono">
                    Usia: {item.age_min} - {item.age_max} tahun
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

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Ubah Kategori' : 'Tambah Kategori'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2 text-xs bg-neutral-100 border border-neutral-300 rounded text-black">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Lomba</label>
            <select
              required
              disabled={!!editingItem}
              value={formData.competition_id}
              onChange={(e) => setFormData({ ...formData, competition_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            >
              <option value="">Pilih Lomba</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Nama Kategori</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Tilawah Remaja Putra"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Gender</label>
              <select
                value={formData.gender_code}
                onChange={(e) => setFormData({ ...formData, gender_code: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              >
                <option value="MALE">Putra</option>
                <option value="FEMALE">Putri</option>
                <option value="ANY">Semua</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">Usia Min</label>
              <input
                type="number"
                value={formData.age_min}
                onChange={(e) => setFormData({ ...formData, age_min: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">Usia Max</label>
              <input
                type="number"
                value={formData.age_max}
                onChange={(e) => setFormData({ ...formData, age_max: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Ketentuan Khusus</label>
            <textarea
              rows={2}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Syarat maqra, hafalan, dsb..."
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
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
