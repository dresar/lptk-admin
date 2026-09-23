'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Participant, Competition, Lptk, Category } from '@/types/database';

export interface ParticipantFormProps {
  initialData?: Participant | null;
}

export function ParticipantForm({ initialData }: ParticipantFormProps) {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [lptks, setLptks] = useState<Lptk[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialCatIds = initialData?.categories?.map((c) => c.id) || [];

  const [formData, setFormData] = useState({
    competition_id: initialData?.competition_id || '',
    lptk_id: initialData?.lptk_id || '',
    name: initialData?.name || '',
    nik: initialData?.nik || '',
    gender_code: initialData?.gender_code || 'MALE',
    birth_place: initialData?.birth_place || '',
    birth_date: initialData?.birth_date ? String(initialData.birth_date).slice(0, 10) : '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    school_or_institution: initialData?.school_or_institution || '',
    father_name: initialData?.father_name || '',
    mother_name: initialData?.mother_name || '',
    category_ids: initialCatIds,
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch('/api/admin/meta/options');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setCompetitions(json.data.competitions || []);
            setLptks(json.data.lptks || []);
            if (!formData.competition_id && json.data.competitions?.length > 0) {
              setFormData((prev) => ({ ...prev, competition_id: json.data.competitions[0].id }));
            }
            if (!formData.lptk_id && json.data.lptks?.length > 0) {
              setFormData((prev) => ({ ...prev, lptk_id: json.data.lptks[0].id }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load form options:', err);
      }
    }
    loadOptions();
  }, [formData.competition_id, formData.lptk_id]);

  // Load categories when competition changes
  useEffect(() => {
    async function loadCategories() {
      if (!formData.competition_id) return;
      try {
        const res = await fetch(`/api/admin/competitions/${formData.competition_id}/categories`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setAvailableCategories(json.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, [formData.competition_id]);

  const handleToggleCategory = (catId: string) => {
    setFormData((prev) => {
      const exists = prev.category_ids.includes(catId);
      return {
        ...prev,
        category_ids: exists
          ? prev.category_ids.filter((id) => id !== catId)
          : [...prev.category_ids, catId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      setError('NIK wajib 16 digit angka.');
      setLoading(false);
      return;
    }

    if (formData.category_ids.length === 0) {
      setError('Pilih minimal satu cabang kategori lomba.');
      setLoading(false);
      return;
    }

    const isEdit = !!initialData?.id;
    const url = isEdit ? `/api/admin/participants/${initialData.id}` : '/api/admin/participants';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Gagal menyimpan data peserta.');
        setLoading(false);
        return;
      }

      const targetId = isEdit ? initialData.id : json.data.id;
      router.push(`/admin/participants/${targetId}`);
      router.refresh();
    } catch (err) {
      setError('Terjadi kendala jaringan saat menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl bg-white border border-neutral-300 rounded p-6 space-y-5">
      {error && (
        <div className="p-3 text-xs bg-neutral-100 border border-neutral-400 text-black rounded">
          {error}
        </div>
      )}

      {/* Kompetisi & LPTK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-neutral-200">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Perlombaan</label>
          <select
            required
            disabled={!!initialData}
            value={formData.competition_id}
            onChange={(e) => setFormData({ ...formData, competition_id: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black disabled:bg-neutral-100"
          >
            <option value="">Pilih Event Lomba</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.period_year})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">LPTK Pengusul</label>
          <select
            required
            value={formData.lptk_id}
            onChange={(e) => setFormData({ ...formData, lptk_id: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          >
            <option value="">Pilih LPTK</option>
            {lptks.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Identitas Peserta */}
      <div className="space-y-4 pb-4 border-b border-neutral-200">
        <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Identitas Calon Peserta</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap sesuai KTP/Akta"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">NIK (16 Digit)</label>
            <input
              type="text"
              required
              maxLength={16}
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
              placeholder="3201xxxxxxxxxxxx"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Jenis Kelamin</label>
            <select
              required
              value={formData.gender_code}
              onChange={(e) => setFormData({ ...formData, gender_code: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            >
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Tempat Lahir</label>
            <input
              type="text"
              required
              value={formData.birth_place}
              onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
              placeholder="Kota / Kabupaten"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Tanggal Lahir</label>
            <input
              type="date"
              required
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Nomor Telepon / HP</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0812xxxxxxxx"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Sekolah / Instansi</label>
            <input
              type="text"
              value={formData.school_or_institution}
              onChange={(e) => setFormData({ ...formData, school_or_institution: e.target.value })}
              placeholder="Asal sekolah / pesantren / umum"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">Alamat Tempat Tinggal</label>
          <textarea
            required
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Alamat lengkap sesuai domisili..."
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Nama Ayah</label>
            <input
              type="text"
              value={formData.father_name}
              onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
              placeholder="Nama ayah kandung"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Nama Ibu</label>
            <input
              type="text"
              value={formData.mother_name}
              onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
              placeholder="Nama ibu kandung"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>
        </div>
      </div>

      {/* Cabang Kategori Lomba */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
          Cabang Kategori Perlombaan
        </h2>
        {availableCategories.length === 0 ? (
          <div className="p-4 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded">
            Pilih event lomba terlebih dahulu untuk menampilkan cabang kategori.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableCategories.map((cat) => {
              const isChecked = formData.category_ids.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`flex items-start gap-2.5 p-3 rounded border text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-black bg-neutral-100 font-medium'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleCategory(cat.id)}
                    className="mt-0.5 rounded border-neutral-300"
                  />
                  <div>
                    <div className="text-black font-semibold">{cat.name}</div>
                    <div className="text-[11px] text-neutral-500">
                      Usia {cat.age_min} - {cat.age_max} th • {cat.gender_code}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/participants')}
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
