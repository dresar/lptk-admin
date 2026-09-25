'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Participant, Competition, Lptk, Category } from '@/types/database';
import { AlertCircle, CheckCircle2, FileText, Info, Users, Building2, Upload, User as UserIcon } from 'lucide-react';
import { getCategoryBranchInfo, JUKNIS_REQUIRED_DOCUMENTS } from '@/data/juknis-official-data';
import { useAuth } from '@/components/providers/auth-context';

export interface ParticipantFormProps {
  initialData?: Participant | null;
}

// Cut-off date per Juknis MTQ XIX: 09 November 2026
const MTQ_CUTOFF_DATE = new Date(2026, 10, 9);

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

interface TeamMemberInput {
  name: string;
  nik: string;
  gender_code: 'MALE' | 'FEMALE';
  team_role: string;
  birth_place: string;
  birth_date: string;
  phone: string;
  address: string;
  photo_url: string;
  school_or_institution?: string;
  father_name: string;
  mother_name: string;
}

const DEFAULT_SYARHIL_ROLES = ['PENSYARAH', 'QARI / QARIAH', 'SARI TILAWAH'];
const DEFAULT_FAHMIL_ROLES = ['JURU BICARA', 'PENDAMPING 1', 'PENDAMPING 2'];

export function ParticipantForm({ initialData }: ParticipantFormProps) {
  const router = useRouter();
  const { user, isDesaOperator } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [lptks, setLptks] = useState<Lptk[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [singlePhotoUploading, setSinglePhotoUploading] = useState(false);
  const [delegationUploading, setDelegationUploading] = useState(false);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialCatIds = initialData?.categories?.map((c) => c.id) || [];

  // Top level selection (Lomba, Desa & Cabang)
  const [competitionId, setCompetitionId] = useState(initialData?.competition_id || '');
  const [lptkId, setLptkId] = useState(initialData?.lptk_id || (isDesaOperator && user?.lptk_id ? user.lptk_id : ''));
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCatIds[0] || '');

  // Individual Form State
  const [individualData, setIndividualData] = useState({
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
    photo_url: (initialData as any)?.photo_url || '',
  });

  // Collective Team Form State (3 Anggota)
  const [teamData, setTeamData] = useState({
    team_name: initialData?.team_name || '',
    team_leader_name: initialData?.team_leader_name || '',
    emergency_phone: initialData?.emergency_phone || '',
    school_or_institution: initialData?.school_or_institution || '',
    delegation_letter_url: initialData?.delegation_letter_url || '',
    payment_proof_url: initialData?.payment_proof_url || '',
  });

  const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([
    {
      name: '',
      nik: '',
      gender_code: 'MALE',
      team_role: 'PENSYARAH',
      birth_place: '',
      birth_date: '',
      phone: '',
      address: '',
      photo_url: '',
      father_name: '',
      mother_name: '',
    },
    {
      name: '',
      nik: '',
      gender_code: 'MALE',
      team_role: 'QARI / QARIAH',
      birth_place: '',
      birth_date: '',
      phone: '',
      address: '',
      photo_url: '',
      father_name: '',
      mother_name: '',
    },
    {
      name: '',
      nik: '',
      gender_code: 'MALE',
      team_role: 'SARI TILAWAH',
      birth_place: '',
      birth_date: '',
      phone: '',
      address: '',
      photo_url: '',
      father_name: '',
      mother_name: '',
    },
  ]);

  // Load options once
  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch('/api/admin/meta/options');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setCompetitions(json.data.competitions || []);
            setLptks(json.data.lptks || []);

            if (!competitionId && json.data.competitions?.length > 0) {
              const defaultComp =
                json.data.competitions.find((c: Competition) => c.name.toLowerCase().includes('mtq')) ||
                json.data.competitions[0];
              setCompetitionId(defaultComp.id);
            }

            if (isDesaOperator && user?.lptk_id) {
              setLptkId(user.lptk_id);
            } else if (!lptkId && json.data.lptks?.length > 0) {
              setLptkId(json.data.lptks[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load options:', err);
      }
    }
    loadOptions();
  }, [isDesaOperator, user?.lptk_id]);

  // Sync operator's LPTK
  useEffect(() => {
    if (isDesaOperator && user?.lptk_id && lptkId !== user.lptk_id) {
      setLptkId(user.lptk_id);
    }
  }, [isDesaOperator, user?.lptk_id, lptkId]);

  // Load categories when competition changes
  useEffect(() => {
    async function loadCategories() {
      if (!competitionId) return;
      try {
        const res = await fetch(`/api/admin/competitions/${competitionId}/categories`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setAvailableCategories(json.data || []);
            if (!selectedCatId && json.data?.length > 0) {
              setSelectedCatId(json.data[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, [competitionId]);

  // Detect selected category & format
  const selectedCategory = useMemo(() => {
    return availableCategories.find((c) => c.id === selectedCatId) || null;
  }, [availableCategories, selectedCatId]);

  const selectedBranchInfo = useMemo(() => {
    if (!selectedCategory) return null;
    return getCategoryBranchInfo(selectedCategory.name);
  }, [selectedCategory]);

  const isCollective = useMemo(() => {
    if (!selectedCategory || !selectedBranchInfo) return false;
    if (initialData?.team_id) return false; // In edit mode for single participant, keep individual editor
    const name = selectedCategory.name.toLowerCase();
    return (
      selectedBranchInfo.format === 'REGU_3' ||
      name.includes('syarhil') ||
      name.includes('fahmil') ||
      name.includes('rebana')
    );
  }, [selectedCategory, selectedBranchInfo, initialData]);

  // Adjust default roles when collective category changes
  useEffect(() => {
    if (!selectedCategory) return;
    const catName = selectedCategory.name.toLowerCase();
    const defaultGender = selectedCategory.gender_code === 'FEMALE' ? 'FEMALE' : 'MALE';

    if (catName.includes('syarhil')) {
      setTeamMembers((prev) =>
        prev.map((m, idx) => ({
          ...m,
          team_role: DEFAULT_SYARHIL_ROLES[idx] || `Anggota ${idx + 1}`,
          gender_code: selectedCategory.gender_code === 'ANY' ? m.gender_code : defaultGender,
        }))
      );
    } else if (catName.includes('fahmil')) {
      setTeamMembers((prev) =>
        prev.map((m, idx) => ({
          ...m,
          team_role: DEFAULT_FAHMIL_ROLES[idx] || `Anggota ${idx + 1}`,
          gender_code: selectedCategory.gender_code === 'ANY' ? m.gender_code : defaultGender,
        }))
      );
    }
  }, [selectedCategory]);

  // Age calculations
  const individualAge = useMemo(() => {
    return calculateAgeAtMTQ(individualData.birth_date);
  }, [individualData.birth_date]);

  // Photo upload helper
  const handleUploadPhoto = async (file: File, targetMemberIndex?: number) => {
    try {
      if (targetMemberIndex !== undefined) {
        setUploadingIndex(targetMemberIndex);
      } else {
        setSinglePhotoUploading(true);
      }

      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'peserta');

      const res = await fetch('/api/admin/cdn/upload', {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal mengunggah foto.');
        return;
      }

      const uploadedUrl = json.data.url;

      if (targetMemberIndex !== undefined) {
        setTeamMembers((prev) => {
          const updated = [...prev];
          updated[targetMemberIndex] = { ...updated[targetMemberIndex], photo_url: uploadedUrl };
          return updated;
        });
      } else {
        setIndividualData((prev) => ({ ...prev, photo_url: uploadedUrl }));
      }
    } catch {
      alert('Kendala jaringan saat mengunggah foto.');
    } finally {
      setUploadingIndex(null);
      setSinglePhotoUploading(false);
    }
  };

  // Shared file upload (delegation letter & payment proof)
  const handleUploadSharedDoc = async (file: File, type: 'delegation' | 'payment') => {
    try {
      if (type === 'delegation') setDelegationUploading(true);
      else setPaymentUploading(true);

      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'dokumen');

      const res = await fetch('/api/admin/cdn/upload', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal mengunggah berkas.');
        return;
      }
      if (type === 'delegation') {
        setTeamData((prev) => ({ ...prev, delegation_letter_url: json.data.url }));
      } else {
        setTeamData((prev) => ({ ...prev, payment_proof_url: json.data.url }));
      }
    } catch {
      alert('Kendala jaringan saat mengunggah dokumen.');
    } finally {
      setDelegationUploading(false);
      setPaymentUploading(false);
    }
  };

  const handleUpdateMember = (idx: number, field: keyof TeamMemberInput, value: any) => {
    setTeamMembers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!competitionId) {
      setError('Pilih perlombaan terlebih dahulu.');
      setLoading(false);
      return;
    }
    if (!lptkId) {
      setError('Pilih LPTK / Desa terlebih dahulu.');
      setLoading(false);
      return;
    }
    if (!selectedCatId) {
      setError('Pilih salah satu cabang musabaqah.');
      setLoading(false);
      return;
    }

    const isEdit = !!initialData?.id;

    // -----------------------------------------------------------
    // Case 1: Collective Team Submission (3 Anggota)
    // -----------------------------------------------------------
    if (isCollective && !isEdit) {
      if (!teamData.team_name.trim()) {
        setError('Nama regu / sekolah / instansi wajib diisi.');
        setLoading(false);
        return;
      }
      if (!teamData.team_leader_name.trim()) {
        setError('Nama ketua regu wajib diisi.');
        setLoading(false);
        return;
      }
      if (!teamData.emergency_phone.trim()) {
        setError('Nomor WhatsApp penanggung jawab / darurat wajib diisi.');
        setLoading(false);
        return;
      }

      // Validate all 3 members
      const nikSet = new Set<string>();
      for (let i = 0; i < teamMembers.length; i++) {
        const m = teamMembers[i];
        if (!m.name.trim()) {
          setError(`Anggota ${i + 1} (${m.team_role}): Nama lengkap wajib diisi.`);
          setLoading(false);
          return;
        }
        if (m.nik.length !== 16 || !/^\d+$/.test(m.nik)) {
          setError(`Anggota ${i + 1} (${m.name}): NIK wajib 16 digit angka.`);
          setLoading(false);
          return;
        }
        if (nikSet.has(m.nik)) {
          setError(`NIK ${m.nik} ganda dalam anggota regu.`);
          setLoading(false);
          return;
        }
        nikSet.add(m.nik);
        if (!m.birth_place.trim() || !m.birth_date) {
          setError(`Anggota ${i + 1} (${m.name}): Tempat dan tanggal lahir wajib diisi.`);
          setLoading(false);
          return;
        }
      }

      const payload = {
        is_collective: true,
        competition_id: competitionId,
        lptk_id: lptkId,
        category_id: selectedCatId,
        team_name: teamData.team_name,
        team_leader_name: teamData.team_leader_name,
        emergency_phone: teamData.emergency_phone,
        school_or_institution: teamData.school_or_institution,
        delegation_letter_url: teamData.delegation_letter_url || null,
        payment_proof_url: teamData.payment_proof_url || null,
        members: teamMembers.map((m) => ({
          ...m,
          phone: m.phone || teamData.emergency_phone,
          school_or_institution: m.school_or_institution || teamData.school_or_institution,
        })),
      };

      try {
        const res = await fetch('/api/admin/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error?.message || 'Gagal mendaftarkan regu peserta.');
          setLoading(false);
          return;
        }

        const targetId = json.data.id;
        router.push(`/admin/participants/${targetId}`);
        router.refresh();
      } catch {
        setError('Terjadi kendala jaringan saat menghubungi server.');
        setLoading(false);
      }
      return;
    }

    // -----------------------------------------------------------
    // Case 2: Individual Submission / Single Participant
    // -----------------------------------------------------------
    if (individualData.nik.length !== 16 || !/^\d+$/.test(individualData.nik)) {
      setError('NIK wajib 16 digit angka.');
      setLoading(false);
      return;
    }

    const url = isEdit ? `/api/admin/participants/${initialData.id}` : '/api/admin/participants';
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = {
      ...individualData,
      competition_id: competitionId,
      lptk_id: lptkId,
      category_ids: [selectedCatId],
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    } catch {
      setError('Terjadi kendala jaringan saat menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl bg-white border border-neutral-300 rounded-md p-6 space-y-6">
      {error && (
        <div className="p-3 text-xs bg-neutral-100 border border-neutral-400 text-black rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-black" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Juknis Map Biru */}
      <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-md flex items-start gap-3">
        <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-700 leading-relaxed">
          <p className="font-semibold text-black">Pedoman Juknis MTQ XIX Tambusai Utara 2026 di Desa Mahato:</p>
          <p className="mt-0.5 text-[11px]">
            Pilih cabang musabaqah terlebih dahulu. Musabaqah beregu (Syarhil & Fahmil) wajib didaftarkan kolektif per tim (3 orang). Seluruh berkas fisik dimasukkan ke dalam <strong>Map Berwarna Biru</strong>.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SELEKSI LOMBA & DESA (TOP) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-neutral-200">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Perlombaan</label>
          <select
            required
            disabled={!!initialData}
            value={competitionId}
            onChange={(e) => setCompetitionId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black disabled:bg-neutral-100"
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
          {isDesaOperator ? (
            <div className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-black font-medium">
                <Building2 className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                <span>
                  {lptks.find((l) => l.id === (lptkId || user?.lptk_id))?.name || user?.full_name || 'Desa Anda'}
                </span>
              </div>
              <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded-sm font-mono font-medium">
                Desa Anda
              </span>
            </div>
          ) : (
            <select
              required
              value={lptkId}
              onChange={(e) => setLptkId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            >
              <option value="">Pilih LPTK Desa</option>
              {lptks.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PILIHAN CABANG MUSABAQAH (INVERTED FLOW) */}
      {/* ========================================================= */}
      <div className="space-y-3 pb-5 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Pilihan Cabang Musabaqah
          </h2>
          <span className="text-[11px] text-neutral-500 font-mono">
            {availableCategories.length} Cabang Tersedia
          </span>
        </div>

        {availableCategories.length === 0 ? (
          <div className="p-4 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md">
            Pilih event lomba terlebih dahulu untuk menampilkan cabang kategori.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {availableCategories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              const catBranch = getCategoryBranchInfo(cat.name);
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`p-3 rounded-md border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white text-black'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="font-bold text-xs leading-snug">{cat.name}</div>
                    <input
                      type="radio"
                      name="selected_category"
                      checked={isSelected}
                      onChange={() => setSelectedCatId(cat.id)}
                      className="mt-0.5 accent-black"
                    />
                  </div>

                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-sm text-[9px] font-mono border font-semibold ${
                        isSelected
                          ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                          : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                      }`}
                    >
                      {catBranch.formatLabel}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Maks: {cat.age_max} thn
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3A. MODE KOLEKTIF / REGU (3 ORANG) */}
      {/* ========================================================= */}
      {isCollective ? (
        <div className="space-y-6">
          {/* Header Mode Kolektif */}
          <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-md text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-black font-bold">
              <Users className="w-4 h-4 text-black shrink-0" />
              <span>Pendaftaran Kolektif Musabaqah Beregu ({selectedBranchInfo?.formatLabel})</span>
            </div>
            <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded-sm uppercase">
              1 Nomor Regu
            </span>
          </div>

          {/* Form Data Regu */}
          <div className="space-y-3 pb-4 border-b border-neutral-200">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Data Regu / Tim</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Nama Regu / Kafilah</label>
                <input
                  type="text"
                  required
                  value={teamData.team_name}
                  onChange={(e) => setTeamData({ ...teamData, team_name: e.target.value })}
                  placeholder="Contoh: Regu Mahato 1"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1">Nama Ketua Regu</label>
                <input
                  type="text"
                  required
                  value={teamData.team_leader_name}
                  onChange={(e) => setTeamData({ ...teamData, team_leader_name: e.target.value })}
                  placeholder="Nama lengkap ketua regu"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1">No. WhatsApp Darurat</label>
                <input
                  type="tel"
                  required
                  value={teamData.emergency_phone}
                  onChange={(e) => setTeamData({ ...teamData, emergency_phone: e.target.value })}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">Sekolah / Instansi / Pesantren</label>
              <input
                type="text"
                value={teamData.school_or_institution}
                onChange={(e) => setTeamData({ ...teamData, school_or_institution: e.target.value })}
                placeholder="Nama sekolah / pondok pesantren utusan regu"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>
          </div>

          {/* 3 Kolom Data Anggota */}
          <div className="space-y-3 pb-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                Data Anggota (3 Personel Wajib)
              </h3>
              <span className="text-[10px] text-neutral-500 font-mono">1 Formulir Terpadu</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teamMembers.map((member, idx) => {
                const memberAge = calculateAgeAtMTQ(member.birth_date);
                return (
                  <div
                    key={idx}
                    className="p-3.5 border-2 border-black rounded-md bg-white space-y-3 flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-2.5">
                      {/* Badge Peran Anggota */}
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <span className="text-[11px] font-black font-mono px-2 py-0.5 bg-black text-white rounded-sm uppercase tracking-wide">
                          {member.team_role || `Anggota ${idx + 1}`}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 font-bold">
                          Personel #{idx + 1}
                        </span>
                      </div>

                      {/* Pas Foto Upload */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <div className="w-14 h-16 border border-neutral-300 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="block text-[10px] font-semibold text-neutral-700 mb-1">
                            Foto Formal (3x4)
                          </label>
                          <label className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50 text-black">
                            <Upload className="w-3 h-3" />
                            <span>{uploadingIndex === idx ? 'Mengunggah...' : 'Pilih Foto'}</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              disabled={uploadingIndex === idx}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPhoto(f, idx);
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-black mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={member.name}
                          onChange={(e) => handleUpdateMember(idx, 'name', e.target.value)}
                          placeholder="Nama lengkap sesuai KTP"
                          className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-black mb-1">NIK (16 Digit)</label>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          value={member.nik}
                          onChange={(e) =>
                            handleUpdateMember(idx, 'nik', e.target.value.replace(/\D/g, ''))
                          }
                          placeholder="16 digit angka"
                          className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-black mb-1">Gender</label>
                          <select
                            value={member.gender_code}
                            onChange={(e) => handleUpdateMember(idx, 'gender_code', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                          >
                            <option value="MALE">Putra</option>
                            <option value="FEMALE">Putri</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-black mb-1">Tempat Lahir</label>
                          <input
                            type="text"
                            required
                            value={member.birth_place}
                            onChange={(e) => handleUpdateMember(idx, 'birth_place', e.target.value)}
                            placeholder="Kota/Kab"
                            className="w-full px-2 py-1 text-[11px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-black mb-1">Tanggal Lahir</label>
                        <input
                          type="date"
                          required
                          value={member.birth_date}
                          onChange={(e) => handleUpdateMember(idx, 'birth_date', e.target.value)}
                          className="w-full px-2 py-1 text-[11px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                        />
                      </div>

                      {memberAge && (
                        <div className="p-1.5 bg-neutral-100 border border-neutral-200 rounded text-[10px] font-mono flex items-center justify-between">
                          <span className="text-neutral-600">Usia MTQ:</span>
                          <span className="font-bold text-black">
                            {memberAge.years} Thn {memberAge.months} Bln
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Administrasi Tim (1 Bukti Bayar & Surat Delegasi) */}
          <div className="space-y-3 pb-4 border-b border-neutral-200">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Administrasi Tim (1 Berkas per Regu)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 border border-neutral-300 rounded-md bg-neutral-50 space-y-2 text-xs">
                <span className="font-bold text-black block">Surat Delegasi Instansi / Mandat Desa</span>
                <p className="text-[11px] text-neutral-600">
                  Surat tugas / rekomendasi resmi dari Kepala Desa atau pimpinan instansi.
                </p>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-100 text-black">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{delegationUploading ? 'Mengunggah...' : 'Unggah Surat'}</span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadSharedDoc(f, 'delegation');
                      }}
                    />
                  </label>
                  {teamData.delegation_letter_url && (
                    <span className="text-[11px] text-black font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      Terunggah
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 border border-neutral-300 rounded-md bg-neutral-50 space-y-2 text-xs">
                <span className="font-bold text-black block">Bukti Transfer / Pembayaran</span>
                <p className="text-[11px] text-neutral-600">
                  Cukup 1 bukti pembayaran administrasi per tim regu.
                </p>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-100 text-black">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{paymentUploading ? 'Mengunggah...' : 'Unggah Bukti'}</span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadSharedDoc(f, 'payment');
                      }}
                    />
                  </label>
                  {teamData.payment_proof_url && (
                    <span className="text-[11px] text-black font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      Terunggah
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 3B. MODE INDIVIDU (1 ORANG) */
        /* ========================================================= */
        <div className="space-y-4 pb-4 border-b border-neutral-200">
          <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Identitas Calon Peserta
          </h2>

          <div className="flex items-center gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded-md">
            <div className="w-16 h-20 border border-neutral-300 bg-neutral-100 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0 relative">
              {individualData.photo_url ? (
                <img
                  src={individualData.photo_url}
                  alt={individualData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-neutral-400" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-black block">Pas Foto Peserta (3x4)</span>
              <p className="text-[11px] text-neutral-600 mb-2">
                Format JPG/PNG dengan latar belakang merah atau sesuai ketentuan.
              </p>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-white border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-100 text-black">
                <Upload className="w-3.5 h-3.5" />
                <span>{singlePhotoUploading ? 'Mengunggah...' : 'Pilih Foto'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadPhoto(f);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={individualData.name}
                onChange={(e) => setIndividualData({ ...individualData, name: e.target.value })}
                placeholder="Nama lengkap sesuai KTP/Akta"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">NIK (16 Digit KK)</label>
              <input
                type="text"
                required
                maxLength={16}
                value={individualData.nik}
                onChange={(e) =>
                  setIndividualData({ ...individualData, nik: e.target.value.replace(/\D/g, '') })
                }
                placeholder="16 digit angka"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Jenis Kelamin</label>
              <select
                required
                value={individualData.gender_code}
                onChange={(e) =>
                  setIndividualData({ ...individualData, gender_code: e.target.value as any })
                }
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
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
                value={individualData.birth_place}
                onChange={(e) =>
                  setIndividualData({ ...individualData, birth_place: e.target.value })
                }
                placeholder="Kota / Kabupaten"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">Tanggal Lahir</label>
              <input
                type="date"
                required
                value={individualData.birth_date}
                onChange={(e) =>
                  setIndividualData({ ...individualData, birth_date: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>
          </div>

          {/* Live Age Calculation Display */}
          {individualAge && (
            <div className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-md text-xs flex items-center justify-between">
              <span className="text-neutral-600">Usia saat musabaqah (09 Nov 2026):</span>
              <span className="font-mono font-bold text-black">
                {individualAge.years} Tahun {individualAge.months} Bulan {individualAge.days} Hari
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">No. WhatsApp / HP</label>
              <input
                type="tel"
                required
                value={individualData.phone}
                onChange={(e) => setIndividualData({ ...individualData, phone: e.target.value })}
                placeholder="0812xxxxxxxx"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">Sekolah / Instansi / Ponpes</label>
              <input
                type="text"
                value={individualData.school_or_institution}
                onChange={(e) =>
                  setIndividualData({ ...individualData, school_or_institution: e.target.value })
                }
                placeholder="Nama sekolah / pesantren"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Alamat Tempat Tinggal</label>
            <textarea
              required
              rows={2}
              value={individualData.address}
              onChange={(e) => setIndividualData({ ...individualData, address: e.target.value })}
              placeholder="Alamat lengkap domisili di Tambusai Utara..."
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Nama Ayah</label>
              <input
                type="text"
                value={individualData.father_name}
                onChange={(e) =>
                  setIndividualData({ ...individualData, father_name: e.target.value })
                }
                placeholder="Nama ayah kandung"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">Nama Ibu</label>
              <input
                type="text"
                value={individualData.mother_name}
                onChange={(e) =>
                  setIndividualData({ ...individualData, mother_name: e.target.value })
                }
                placeholder="Nama ibu kandung"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6 Dokumen Persyaratan Juknis MTQ XIX Preview */}
      <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-md space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            6 Dokumen Persyaratan Wajib (Juknis MTQ XIX)
          </span>
          <span className="text-[10px] font-mono font-medium text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded-sm">
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

      {/* Action Buttons */}
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
