'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Tags, Trophy, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PaginationBar } from '@/components/ui/pagination';
import { ViewToggle, ViewMode, useViewMode } from '@/components/ui/view-toggle';
import { BulkToolbar } from '@/components/ui/bulk-toolbar';
import { Category, Competition } from '@/types/database';
import { PaginationMeta } from '@/types/api';
import { JUKNIS_BRANCHES, getCategoryBranchInfo } from '@/data/juknis-official-data';
import { useAuth } from '@/components/providers/auth-context';

export default function CategoriesPage() {
  const { canManageCompetition } = useAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useViewMode('grid');
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
        page_size: '50',
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

  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: items.length };
    JUKNIS_BRANCHES.forEach((b) => {
      counts[b.id] = 0;
    });
    items.forEach((item) => {
      const info = getCategoryBranchInfo(item.name);
      if (counts[info.branchId] !== undefined) {
        counts[info.branchId]++;
      }
    });
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedBranch === 'ALL') return items;
    return items.filter((item) => getCategoryBranchInfo(item.name).branchId === selectedBranch);
  }, [items, selectedBranch]);

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
      setSelectedIds(Array.from(new Set([...selectedIds, ...filteredItems.map((i) => i.id)])));
    } else {
      setSelectedIds(selectedIds.filter((id) => !filteredItems.some((i) => i.id === id)));
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
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">Cabang & Golongan</h1>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          {canManageCompetition && (
            <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 font-bold">
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row: Search & Competition */}
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

      {/* Branch Filter Tabs (Juknis Official MTQ XIX: 6 Cabang Utama) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setSelectedBranch('ALL')}
          className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
            selectedBranch === 'ALL'
              ? 'bg-neutral-900 text-white font-semibold'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'
          }`}
        >
          <span>Semua</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
            selectedBranch === 'ALL' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-700'
          }`}>
            {branchCounts.ALL || 0}
          </span>
        </button>

        {JUKNIS_BRANCHES.map((branch) => {
          const isActive = selectedBranch === branch.id;
          const count = branchCounts[branch.id] || 0;
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => setSelectedBranch(branch.id)}
              className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium'
              }`}
            >
              <span>{branch.shortName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isActive ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table / Grid Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Memuat data kategori...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada data kategori ditemukan untuk filter ini.
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  {canManageCompetition && (
                    <th className="w-10 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={filteredItems.length > 0 && filteredItems.every((i) => selectedIds.includes(i.id))}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="rounded border-neutral-300"
                      />
                    </th>
                  )}
                  <th className="px-4 py-2.5">Nama Kategori</th>
                  <th className="px-4 py-2.5">Format Regu</th>
                  <th className="px-4 py-2.5">Cabang</th>
                  <th className="px-4 py-2.5">Gender</th>
                  <th className="px-4 py-2.5">Batas Usia (09 Nov 2026)</th>
                  {canManageCompetition && (
                    <th className="w-24 px-4 py-2.5 text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredItems.map((item) => {
                  const branchInfo = getCategoryBranchInfo(item.name);
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      {canManageCompetition && (
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectOne(item.id)}
                            className="rounded border-neutral-300"
                          />
                        </td>
                      )}
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-black">{item.name}</div>
                        {item.requirements && (
                          <div className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs">{item.requirements}</div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                          branchInfo.format === 'REGU_11'
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : branchInfo.format === 'REGU_3'
                            ? 'bg-neutral-200 text-neutral-800 border-neutral-300'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                        }`}>
                          {branchInfo.formatLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-700 font-medium whitespace-nowrap">
                        {branchInfo.shortBranchName}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-neutral-700">
                          {item.gender_code === 'MALE' ? 'Putra' : item.gender_code === 'FEMALE' ? 'Putri' : 'Campuran'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-neutral-700 whitespace-nowrap">
                        {item.age_min > 0 ? `${item.age_min} - ` : ''}Maks. {item.age_max} thn
                      </td>
                      {canManageCompetition && (
                        <td className="px-4 py-2.5 text-right space-x-1 whitespace-nowrap">
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
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </div>
      ) : (
        /* Grid Mode */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const branchInfo = getCategoryBranchInfo(item.name);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-neutral-200 p-4 rounded hover:border-black transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                        branchInfo.format === 'REGU_11'
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : branchInfo.format === 'REGU_3'
                          ? 'bg-neutral-200 text-neutral-800 border-neutral-300'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                      }`}>
                        {branchInfo.formatLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-neutral-500">
                          {item.gender_code === 'MALE' ? 'Putra' : item.gender_code === 'FEMALE' ? 'Putri' : 'Campuran'}
                        </span>
                        {canManageCompetition && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectOne(item.id)}
                            className="rounded border-neutral-300"
                          />
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-sm text-black mb-1 flex items-start gap-1.5">
                      <Tags className="w-4 h-4 text-black shrink-0 mt-0.5" />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-xs text-neutral-500 mb-1">{branchInfo.branchName}</div>
                    <div className="text-xs text-neutral-700 font-mono mt-1">
                      Batas Usia: {item.age_min > 0 ? `${item.age_min} - ` : ''}Maks. {item.age_max} thn
                    </div>
                    {item.requirements && (
                      <div className="text-[11px] text-neutral-500 mt-2 p-2 bg-neutral-50 rounded border border-neutral-100 line-clamp-2">
                        {item.requirements}
                      </div>
                    )}
                  </div>
                  {canManageCompetition && (
                    <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-neutral-100">
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 bg-white border border-neutral-200 rounded">
            <PaginationBar meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Bulk Delete Toolbar (Super Admin only) */}
      {canManageCompetition && (
        <BulkToolbar
          selectedCount={selectedIds.length}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds([])}
          isLoading={bulkLoading}
        />
      )}

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
