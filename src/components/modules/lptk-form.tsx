'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lptk, Village } from '@/types/database';
import { useAuth } from '@/components/providers/auth-context';

export interface LptkFormProps {
  initialData?: Lptk | null;
}

export function LptkForm({ initialData }: LptkFormProps) {
  const router = useRouter();
  const { isDesaOperator } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    village_id: initialData?.village_id || '',
    code: initialData?.code || '',
    name: initialData?.name || '',
    leader_name: initialData?.leader_name || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    active: initialData?.active ?? true,
  });

  useEffect(() => {
    async function loadVillages() {
      try {
        const res = await fetch('/api/admin/meta/options');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.villages) {
            setVillages(json.data.villages);
            if (!formData.village_id && json.data.villages.length > 0) {
              setFormData((prev) => ({ ...prev, village_id: json.data.villages[0].id }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load villages option:', err);
      }
    }
    loadVillages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isEdit = !!initialData?.id;
    const url = isEdit ? `/api/admin/lptks/${initialData.id}` : '/api/admin/lptks';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Gagal menyimpan data LPTK.');
        setLoading(false);
        return;
      }

      router.push('/admin/lptks');
      router.refresh();
    } catch (err) {
      setError('Terjadi kendala jaringan saat menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-neutral-300 rounded p-6 space-y-4">
      {error && (
        <div className="p-3 text-xs bg-neutral-100 border border-neutral-400 text-black rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Desa</label>
          <select
            required
            disabled={isDesaOperator}
            value={formData.village_id}
            onChange={(e) => setFormData({ ...formData, village_id: e.target.value })}
            className={`w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black ${
              isDesaOperator ? 'bg-neutral-100 text-neutral-600 cursor-not-allowed' : 'bg-white'
            }`}
          >
            <option value="">Pilih Desa</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">Kode</label>
          <input
            type="text"
            required
            disabled={isDesaOperator}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Contoh: LPTK-01"
            className={`w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black ${
              isDesaOperator ? 'bg-neutral-100 text-neutral-600 cursor-not-allowed' : 'bg-white'
            }`}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-black mb-1">Nama LPTK</label>
        <input
          type="text"
          required
          disabled={isDesaOperator}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="LPTK Desa ..."
          className={`w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black ${
            isDesaOperator ? 'bg-neutral-100 text-neutral-600 cursor-not-allowed' : 'bg-white'
          }`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Pimpinan / Ketua Kafilah</label>
          <input
            type="text"
            required
            value={formData.leader_name}
            onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
            placeholder="Nama ketua LPTK desa"
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">Nomor Telepon / WA</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0812xxxxxxxx"
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-black mb-1">Alamat Sekretariat</label>
        <textarea
          required
          rows={3}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Alamat kantor LPTK desa..."
          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
        />
      </div>

      {!isDesaOperator && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded border-neutral-300"
          />
          <label htmlFor="active" className="text-xs font-medium text-black">
            Status Aktif
          </label>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/lptks')}
        >
          Batal
        </Button>
        <Button type="submit" size="sm" isLoading={loading}>
          Simpan
        </Button>
      </div>
    </form>
  );
}
