'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Building2, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaginationBar } from '@/components/ui/pagination';
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';
import { BulkToolbar } from '@/components/ui/bulk-toolbar';
import { Lptk } from '@/types/database';
import { PaginationMeta } from '@/types/api';

export default function LptksPage() {
  const [items, setItems] = useState<Lptk[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchLptks = useCallback(async () => {
    setLoading(true);
    try {
      const qParam = search ? `&q=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/lptks?page=${page}&page_size=20${qParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load LPTKs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchLptks();
  }, [fetchLptks]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data LPTK ini?')) return;
    try {
      const res = await fetch(`/api/admin/lptks/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal menghapus LPTK.');
        return;
      }
      fetchLptks();
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} LPTK terpilih?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/lptks/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedIds([]);
        fetchLptks();
        if (json.data.failed.length > 0) {
          alert(`${json.data.deleted} dihapus, ${json.data.failed.length} gagal karena memiliki data peserta.`);
        }
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
          <h1 className="text-xl font-bold tracking-tight text-black">LPTK</h1>
          <p className="text-xs text-neutral-500">Lembaga Pengembangan Tilawatil Qur’an tingkat desa</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Link href="/admin/lptks/new">
            <Button size="sm" className="gap-1.5">
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
            placeholder="Cari LPTK, kode, atau pimpinan..."
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
          Memuat data...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada data LPTK ditemukan.
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
                  <th className="px-4 py-2.5">Nama LPTK</th>
                  <th className="px-4 py-2.5">Desa</th>
                  <th className="px-4 py-2.5">Pimpinan</th>
                  <th className="px-4 py-2.5">Telepon</th>
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
                    <td className="px-4 py-2.5 text-neutral-600">{item.village_name || '-'}</td>
                    <td className="px-4 py-2.5 text-neutral-700">{item.leader_name}</td>
                    <td className="px-4 py-2.5 font-mono text-neutral-600">{item.phone}</td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      <Link href={`/admin/lptks/${item.id}/edit`}>
                        <Button variant="outline" size="sm" className="p-1.5" aria-label="Ubah">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
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
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-black mb-1">
                    <Building2 className="w-4 h-4 text-black flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{item.village_name || '-'}</span>
                  </div>
                  <div className="text-xs text-neutral-600 space-y-0.5">
                    <div>Pimpinan: {item.leader_name}</div>
                    <div className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      {item.phone}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-neutral-100">
                  <Link href={`/admin/lptks/${item.id}/edit`}>
                    <Button variant="outline" size="sm" className="p-1.5">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
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
    </div>
  );
}
