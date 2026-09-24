'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Participant, Competition, Lptk, Category } from '@/types/database';
import { AlertCircle, CheckCircle2, FileText, Info, Users } from 'lucide-react';
import { getCategoryBranchInfo, JUKNIS_REQUIRED_DOCUMENTS } from '@/data/juknis-official-data';

export interface ParticipantFormProps {
  initialData?: Participant | null;
}

// Target cut-off date per Juknis MTQ XIX: 09 November 2026
const MTQ_CUTOFF_DATE = new Date(2026, 10, 9); // Month is 0-indexed (10 = November)

function calculateAgeAtMTQ(birthDateStr: string) {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime()) || birth > MTQ_CUTOFF_DATE) return null;

  let years = MTQ_CUTOFF_DATE.getFullYear() - birth.getFullYear();
  let months = MTQ_CUTOFF_DATE.getMonth() - birth.getMonth();
  let days = MTQ_CUTOFF_DATE.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(MTQ_CUTOFF_DATE.getFullYear(), MTQ_CUTOFF_DATE.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
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

  const ageData = useMemo(() => {
    return calculateAgeAtMTQ(formData.birth_date);
  }, [formData.birth_date]);

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

  // JUKNIS RULE: strictly 1 category per participant
  const handleSelectCategory = (catId: string) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: [catId],
    }));
  };

  const selectedCategory = useMemo(() => {
    if (formData.category_ids.length === 0) return null;
    return availableCategories.find((c) => c.id === formData.category_ids[0]) || null;
  }, [availableCategories, formData.category_ids]);

  const selectedBranchInfo = useMemo(() => {
    if (!selectedCategory) return null;
    return getCategoryBranchInfo(selectedCategory.name);
  }, [selectedCategory]);

  // Validate category compatibility
  const categoryValidation = useMemo(() => {
    if (!selectedCategory || !ageData) return null;

    const warnings: string[] = [];

    // Gender check
    if (selectedCategory.gender_code !== 'ANY') {
      if (selectedCategory.gender_code !== formData.gender_code) {
        warnings.push(`Cabang ini khusus peserta ${selectedCategory.gender_code === 'MALE' ? 'Putra' : 'Putri'}.`);
      }
    }

    // Age check: Max age per Juknis is age_max years, 11 months, 29 days
    if (ageData.years > selectedCategory.age_max) {
      warnings.push(`Usia peserta (${ageData.years} thn ${ageData.months} bln) melebihi batas maksimal ${selectedCategory.age_max} thn 11 bln 29 hari per 09 Nov 2026.`);
    }

    // Min age check
    if (ageData.years < selectedCategory.age_min) {
      warnings.push(`Usia peserta di bawah batas minimal ${selectedCategory.age_min} tahun.`);
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  }, [selectedCategory, ageData, formData.gender_code]);

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
      setError('Pilih 1 (satu) cabang kategori lomba sesuai ketentuan Juknis.');
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
    <form onSubmit={handleSubmit} className="max-w-4xl bg-white border border-neutral-300 rounded p-6 space-y-6">
      {error && (
        <div className="p-3 text-xs bg-neutral-100 border border-neutral-400 text-black rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-black" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Juknis Map Biru */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded flex items-start gap-3">
        <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-700 leading-relaxed">
          <p className="font-semibold text-black">Pedoman Juknis MTQ ke-XIX Tambusai Utara (Desa Mahato 2026):</p>
          <p className="mt-1">
            Peserta hanya boleh mengikuti <strong>1 cabang musabaqah</strong>. Seluruh berkas (Surat Mandat, Domisili, Ijazah, Akta, KK ber-NIK, & Surat Pernyataan) wajib dimasukkan ke dalam <strong>Map Berwarna Biru</strong> untuk diverifikasi panitia.
          </p>
        </div>
      </div>

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
          <label className="block text-xs font-semibold text-black mb-1">LPTK / Desa Pengusul</label>
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
            <label className="block text-xs font-semibold text-black mb-1">NIK (16 Digit Sesuai KK)</label>
            <input
              type="text"
              required
              maxLength={16}
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
              placeholder="16 digit angka"
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
              <option value="MALE">Laki-laki (Putra)</option>
              <option value="FEMALE">Perempuan (Putri)</option>
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

        {/* Live Age Calculation Display */}
        {ageData && (
          <div className="p-2.5 bg-neutral-100 border border-neutral-200 rounded text-xs flex items-center justify-between">
            <span className="text-neutral-600">Usia saat musabaqah (09 Nov 2026):</span>
            <span className="font-mono font-bold text-black">
              {ageData.years} Tahun {ageData.months} Bulan {ageData.days} Hari
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Nomor Telepon / WhatsApp</label>
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
            <label className="block text-xs font-semibold text-black mb-1">Sekolah / Instansi / Ponpes</label>
            <input
              type="text"
              value={formData.school_or_institution}
              onChange={(e) => setFormData({ ...formData, school_or_institution: e.target.value })}
              placeholder="Nama sekolah / pesantren / madrasah"
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
            placeholder="Alamat lengkap domisili di Tambusai Utara..."
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

      {/* Cabang Kategori Lomba (1 Cabang Pilihan - Juknis MTQ XIX) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Pilihan Cabang Musabaqah (Maksimal 1 Cabang)
          </h2>
          <span className="text-[11px] text-neutral-500 font-mono">
            {availableCategories.length} Cabang Tersedia
          </span>
        </div>

        {/* Validation Warning Alert if any */}
        {categoryValidation && !categoryValidation.isValid && (
          <div className="p-3 bg-neutral-100 border border-neutral-400 rounded text-xs space-y-1">
            <div className="font-semibold text-black flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Perhatian Ketentuan Juknis:
            </div>
            {categoryValidation.warnings.map((w, idx) => (
              <div key={idx} className="text-neutral-700 pl-5 list-item">
                {w}
              </div>
            ))}
          </div>
        )}

        {/* Team Format Guidance Alert (Fahmil, Syarhil, Rebana Klasik) */}
        {selectedBranchInfo && selectedBranchInfo.format !== 'INDIVIDU' && (
          <div className="p-3 bg-neutral-100 border border-neutral-300 rounded text-xs space-y-1">
            <div className="font-bold text-black flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Ketentuan Pendaftaran Musabaqah Beregu ({selectedBranchInfo.formatLabel}):
            </div>
            <p className="text-neutral-700 leading-relaxed text-[11px]">
              Setiap anggota regu didaftarkan secara perorangan dengan NIK masing-masing. Harap isi kolom <strong>Sekolah / Instansi / Ponpes</strong> dengan nama regu & peran personel (Contoh: <em>Regu Mahato 1 - Pensyarah</em>, <em>Regu Mahato 1 - Tilawah</em>, atau <em>Regu Rebana - Vokalis</em>).
            </p>
          </div>
        )}

        {availableCategories.length === 0 ? (
          <div className="p-4 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded">
            Pilih event lomba terlebih dahulu untuk menampilkan cabang kategori.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {availableCategories.map((cat) => {
              const isSelected = formData.category_ids.includes(cat.id);
              const catBranch = getCategoryBranchInfo(cat.name);
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-black bg-neutral-900 text-white'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white text-black'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs leading-snug">{cat.name}</div>
                    <input
                      type="radio"
                      name="selected_category"
                      checked={isSelected}
                      onChange={() => handleSelectCategory(cat.id)}
                      className="mt-0.5 accent-black"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                      isSelected
                        ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}>
                      {catBranch.formatLabel}
                    </span>
                    <span className={`text-[11px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Maks: {cat.age_max} thn • {cat.gender_code === 'ANY' ? 'Campuran' : cat.gender_code === 'MALE' ? 'Putra' : 'Putri'}
                    </span>
                  </div>

                  {cat.requirements && (
                    <div className={`text-[10px] mt-1.5 leading-tight line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {cat.requirements}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6 Dokumen Persyaratan Juknis MTQ XIX Preview */}
      <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            6 Dokumen Persyaratan Wajib (Juknis MTQ XIX)
          </span>
          <span className="text-[10px] font-mono font-medium text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded">
            Map Warna Biru
          </span>
        </div>
        <p className="text-[11px] text-neutral-600 leading-relaxed">
          Setelah formulir disimpan, berkas persyaratan berikut dapat diunggah pada halaman rincian peserta untuk diverifikasi oleh Panitia LPTQ:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {JUKNIS_REQUIRED_DOCUMENTS.map((doc, idx) => (
            <div key={doc.code} className="flex items-start gap-1.5 text-[11px] text-neutral-700">
              <span className="font-mono font-bold text-neutral-900">{idx + 1}.</span>
              <span className="leading-tight">{doc.name}</span>
            </div>
          ))}
        </div>
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
