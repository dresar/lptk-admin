'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Competition } from '@/types/database';

export interface CompetitionFormProps {
  initialData?: Competition | null;
}

export function CompetitionForm({ initialData }: CompetitionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultOpen = initialData?.registration_open_at
    ? new Date(initialData.registration_open_at).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  const defaultClose = initialData?.registration_close_at
    ? new Date(initialData.registration_close_at).toISOString().slice(0, 16)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    period_year: initialData?.period_year || new Date().getFullYear(),
    status_code: initialData?.status_code || 'DRAFT',
    registration_open_at: defaultOpen,
    registration_close_at: defaultClose,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isEdit = !!initialData?.id;
    const url = isEdit ? `/api/admin/competitions/${initialData.id}` : '/api/admin/competitions';
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
      period_year: Number(formData.period_year),
      registration_open_at: new Date(formData.registration_open_at).toISOString(),
      registration_close_at: new Date(formData.registration_close_at).toISOString(),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Gagal menyimpan data lomba.');
        setLoading(false);
        return;
      }

      router.push('/admin/competitions');
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

      <div>
        <label className="block text-xs font-semibold text-black mb-1">Nama Lomba / Event</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Musabaqah Tilawatil Qur’an Tingkat Kecamatan..."
          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Tahun Periode</label>
          <input
            type="number"
            required
            value={formData.period_year}
            onChange={(e) => setFormData({ ...formData, period_year: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">Status Lomba</label>
          <select
            value={formData.status_code}
            onChange={(e) => setFormData({ ...formData, status_code: e.target.value as any })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          >
            <option value="DRAFT">Draf (Persiapan)</option>
            <option value="OPEN">Dibuka (Menerima Peserta)</option>
            <option value="CLOSED">Ditutup (Pendaftaran Selesai)</option>
            <option value="COMPLETED">Selesai (Kegiatan Berakhir)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Waktu Buka Pendaftaran</label>
          <input
            type="datetime-local"
            required
            value={formData.registration_open_at}
            onChange={(e) => setFormData({ ...formData, registration_open_at: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">Waktu Tutup Pendaftaran</label>
          <input
            type="datetime-local"
            required
            value={formData.registration_close_at}
            onChange={(e) => setFormData({ ...formData, registration_close_at: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-black mb-1">Keterangan / Catatan Singkat</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Pedoman umum pelaksanaan lomba..."
          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/competitions')}
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
