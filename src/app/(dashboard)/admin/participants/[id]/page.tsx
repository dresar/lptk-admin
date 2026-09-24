'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  Edit2,
  Info,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Participant, DocumentType, ParticipantDocument, Verification } from '@/types/database';

const JUKNIS_DOC_HINTS: Record<string, string> = {
  SURAT_MANDAT: 'Surat tugas/mandat resmi dari Kepala Desa atau Ketua LPTK Desa setempat.',
  SURAT_DOMISILI: 'Surat keterangan domisili minimal membuktikan warga asal Kec. Tambusai Utara.',
  IJAZAH: 'Fotokopi Ijazah / Surat Keterangan Lulus sekolah/madrasah dilegalisir.',
  AKTE_KELAHIRAN: 'Fotokopi Akta Kelahiran resmi untuk verifikasi batas usia per 09 Nov 2026.',
  KARTU_KELUARGA: 'Fotokopi Kartu Keluarga terbaru yang memuat NIK 16 digit.',
  SURAT_PERNYATAAN: 'Surat pernyataan keabsahan dan kebenaran data bermaterai Rp 10.000,-.',
};

export default function ParticipantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [participant, setParticipant] = useState<any>(null);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDocTypeId, setUploadDocTypeId] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchParticipant = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/participants/${id}`);
      if (!res.ok) {
        setError('Peserta tidak ditemukan.');
        return;
      }
      const json = await res.json();
      if (json.success) {
        setParticipant(json.data);
      }
    } catch (err) {
      setError('Gagal memuat data peserta.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchParticipant();
      // Load document types
      fetch('/api/admin/document-types')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setDocTypes(json.data);
        });
    }
  }, [id, fetchParticipant]);

  const handleOpenUploadWith = (docTypeId?: string) => {
    setUploadDocTypeId(docTypeId || '');
    setUploadFile(null);
    setUploadError(null);
    setIsUploadOpen(true);
  };

  const handleSubmitParticipant = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/participants/${id}/submit`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal mengirim berkas.');
        return;
      }
      alert('Pendaftaran berhasil dikirim ke verifikator.');
      fetchParticipant();
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadDocTypeId) {
      setUploadError('Pilih berkas dan jenis dokumen.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('document_type_id', uploadDocTypeId);

    try {
      const res = await fetch(`/api/admin/participants/${id}/documents`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setUploadError(json.error?.message || 'Gagal mengunggah berkas.');
        setUploadLoading(false);
        return;
      }

      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadDocTypeId('');
      fetchParticipant();
    } catch (err) {
      setUploadError('Terjadi kesalahan jaringan saat mengunggah.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Hapus berkas ini?')) return;
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal menghapus berkas.');
        return;
      }
      fetchParticipant();
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-neutral-100 text-neutral-700 border border-neutral-300 px-2.5 py-1 rounded text-xs font-mono font-medium">DRAF</span>;
      case 'SUBMITTED':
        return <span className="bg-neutral-200 text-black border border-neutral-400 px-2.5 py-1 rounded text-xs font-mono font-medium">TERKIRIM</span>;
      case 'IN_REVIEW':
        return <span className="bg-neutral-800 text-white border border-black px-2.5 py-1 rounded text-xs font-mono font-medium">DITINJAU</span>;
      case 'VERIFIED':
        return <span className="bg-black text-white border border-black px-2.5 py-1 rounded text-xs font-mono font-bold">VALID</span>;
      case 'REVISION_REQUIRED':
        return <span className="bg-white text-black border border-black underline px-2.5 py-1 rounded text-xs font-mono font-medium">REVISI</span>;
      case 'REJECTED':
        return <span className="bg-neutral-900 text-white line-through px-2.5 py-1 rounded text-xs font-mono font-medium">DITOLAK</span>;
      default:
        return <span className="text-xs font-mono">{status}</span>;
    }
  };

  // Official Juknis 6 Documents Checklist Computation
  const officialDocChecklist = useMemo(() => {
    return docTypes.map((dt) => {
      const uploaded = participant?.documents?.find(
        (d: any) => d.document_type_id === dt.id || d.document_type_code === dt.code
      );
      return {
        ...dt,
        hint: JUKNIS_DOC_HINTS[dt.code] || 'Dokumen persyaratan resmi MTQ XIX.',
        uploadedDoc: uploaded,
        isComplete: !!uploaded,
      };
    });
  }, [docTypes, participant?.documents]);

  const totalRequiredDocs = officialDocChecklist.length;
  const totalUploadedDocs = officialDocChecklist.filter((d) => d.isComplete).length;
  const isAllDocsComplete = totalRequiredDocs > 0 && totalUploadedDocs === totalRequiredDocs;

  // Extra documents outside the official 6 list
  const extraUploadedDocs = useMemo(() => {
    if (!participant?.documents) return [];
    const officialDocIds = new Set(docTypes.map((dt) => dt.id));
    const officialDocCodes = new Set(docTypes.map((dt) => dt.code));
    return participant.documents.filter(
      (d: any) => !officialDocIds.has(d.document_type_id) && !officialDocCodes.has(d.document_type_code)
    );
  }, [participant?.documents, docTypes]);

  if (loading) {
    return <div className="p-8 text-xs text-neutral-500">Memuat profil peserta...</div>;
  }

  if (error || !participant) {
    return (
      <div className="p-8 text-xs text-black bg-neutral-100 border border-neutral-300 rounded">
        {error || 'Data tidak tersedia.'}
      </div>
    );
  }

  const canEditOrSubmit = participant.status_code === 'DRAFT' || participant.status_code === 'REVISION_REQUIRED';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link href="/admin/participants" className="p-1.5 text-neutral-500 hover:text-black rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-black">{participant.name}</h1>
              {getStatusBadge(participant.status_code)}
            </div>
            <p className="text-xs text-neutral-500 font-mono">NIK: {participant.nik} • {participant.competition_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEditOrSubmit && (
            <>
              <Link href={`/admin/participants/${participant.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" />
                  Ubah
                </Button>
              </Link>
              <Button
                size="sm"
                isLoading={submitting}
                onClick={handleSubmitParticipant}
                className="gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alert Note if Revision or Rejected */}
      {participant.rejection_note && (
        <div className="p-4 bg-neutral-100 border border-black rounded text-xs">
          <div className="font-bold text-black mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-black" />
            Catatan Tim Verifikator:
          </div>
          <div className="text-neutral-700">{participant.rejection_note}</div>
        </div>
      )}

      {/* Grid 2 Columns: Identity & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-neutral-300 rounded p-5 space-y-3">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-2">
              Biodata Peserta
            </h2>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-neutral-500 block text-[11px]">Asal LPTK / Desa</span>
                <span className="font-semibold text-black">{participant.lptk_name} ({participant.village_name})</span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[11px]">Jenis Kelamin</span>
                <span className="font-semibold text-black">{participant.gender_code === 'MALE' ? 'Laki-laki (Putra)' : 'Perempuan (Putri)'}</span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[11px]">Tempat, Tanggal Lahir</span>
                <span className="font-semibold text-black">
                  {participant.birth_place},{' '}
                  {new Date(participant.birth_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[11px]">Nomor Telepon / WhatsApp</span>
                <span className="font-mono text-black">{participant.phone}</span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[11px]">Alamat Domisili</span>
                <span className="text-black">{participant.address}</span>
              </div>

              {participant.school_or_institution && (
                <div>
                  <span className="text-neutral-500 block text-[11px]">Sekolah / Lembaga / Ponpes</span>
                  <span className="text-black">{participant.school_or_institution}</span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Nama Orang Tua</span>
                <span className="text-black">Ayah: {participant.father_name || '-'} | Ibu: {participant.mother_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Categories card */}
          <div className="bg-white border border-neutral-300 rounded p-5 space-y-2">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-2">
              Cabang Musabaqah (Juknis MTQ XIX)
            </h2>
            <div className="space-y-1.5 pt-1">
              {participant.categories?.map((cat: any) => (
                <div key={cat.id} className="p-3 bg-neutral-50 rounded border border-neutral-200 text-xs space-y-1">
                  <div className="font-bold text-black">{cat.name}</div>
                  <div className="text-[11px] text-neutral-600">
                    Batas Usia: Maks. {cat.age_max} thn 11 bln 29 hr per 09 Nov 2026
                  </div>
                  {cat.requirements && (
                    <div className="text-[10px] text-neutral-500 leading-tight pt-1 border-t border-neutral-200">
                      {cat.requirements}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Checklist 6 Dokumen Juknis & Verification History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official Document Checklist Section */}
          <div className="bg-white border border-neutral-300 rounded p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
              <div>
                <h2 className="text-xs font-bold text-black uppercase tracking-wider">
                  Checklist 6 Dokumen Persyaratan Juknis
                </h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Verifikasi kelengkapan berkas administrasi calon peserta MTQ ke-XIX
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded border ${
                    isAllDocsComplete
                      ? 'bg-neutral-900 text-white border-black'
                      : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                  }`}
                >
                  {totalUploadedDocs} / {totalRequiredDocs} Terpenuhi
                </span>
                {canEditOrSubmit && (
                  <Button size="sm" onClick={() => handleOpenUploadWith()} className="gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Unggah
                  </Button>
                )}
              </div>
            </div>

            {/* Map Biru Notice Banner */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div className="text-neutral-700 leading-relaxed">
                <span className="font-bold text-black">Ketentuan Pengumpulan Fisik:</span> Seluruh berkas pendaftaran asli & fotokopi rangkap 1 (satu) dimasukkan ke dalam <strong>Map Warna Biru</strong> dan diserahkan ke Sekretariat LPTQ Kecamatan Tambusai Utara / Administrasi MTQ Desa Mahato.
              </div>
            </div>

            {/* Checklist Table of 6 Official Documents */}
            <div className="space-y-2.5">
              {officialDocChecklist.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-3.5 rounded border transition-colors text-xs ${
                    item.isComplete
                      ? 'border-neutral-300 bg-white hover:border-black'
                      : 'border-dashed border-neutral-300 bg-neutral-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-black text-xs">
                          {idx + 1}. {item.name}
                        </span>
                        {item.isComplete ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white">
                            <CheckCircle2 className="w-3 h-3" />
                            Terunggah
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 text-neutral-800 border border-neutral-300">
                            <AlertCircle className="w-3 h-3" />
                            Belum Ada
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-500 leading-snug">
                        {item.hint}
                      </div>

                      {item.isComplete && item.uploadedDoc && (
                        <div className="text-[11px] text-neutral-600 font-mono flex items-center gap-1.5 pt-0.5">
                          <FileText className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="truncate max-w-xs">{item.uploadedDoc.file_name}</span>
                          <span>•</span>
                          <span>{(item.uploadedDoc.file_size_bytes / 1024).toFixed(1)} KB</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.isComplete && item.uploadedDoc ? (
                        <>
                          <a
                            href={`/api/admin/documents/${item.uploadedDoc.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                              <Download className="w-3.5 h-3.5" />
                              Unduh
                            </Button>
                          </a>
                          {canEditOrSubmit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDoc(item.uploadedDoc.id)}
                              className="p-1.5 text-neutral-500 hover:text-black"
                              aria-label="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </>
                      ) : (
                        canEditOrSubmit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUploadWith(item.id)}
                            className="gap-1 text-xs font-semibold"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Unggah
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Extra Documents if any */}
            {extraUploadedDocs.length > 0 && (
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="font-bold text-xs uppercase text-neutral-700">Berkas Tambahan Lainnya</div>
                {extraUploadedDocs.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded border border-neutral-200 bg-white text-xs"
                  >
                    <div>
                      <div className="font-semibold text-black">{doc.file_name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {(doc.file_size_bytes / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/api/admin/documents/${doc.id}/download`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="p-1.5">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      {canEditOrSubmit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Audit Trail */}
          <div className="bg-white border border-neutral-300 rounded p-5">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-3 mb-4">
              Riwayat Keputusan Verifikasi
            </h2>

            {participant.verifications?.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded">
                Belum ada riwayat telaah verifikator.
              </div>
            ) : (
              <div className="space-y-3">
                {participant.verifications.map((v: Verification) => (
                  <div key={v.id} className="p-3 border border-neutral-200 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-black">{v.decision}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(v.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {v.note && <p className="text-neutral-700 italic">"{v.note}"</p>}
                    <div className="text-[10px] text-neutral-500">Verifikator: {v.verifier_name || 'Petugas Kecamatan'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Unggah Dokumen"
      >
        <form onSubmit={handleUploadDocument} className="space-y-4">
          {uploadError && (
            <div className="p-2 text-xs bg-neutral-100 border border-neutral-300 rounded text-black">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Jenis Dokumen Persyaratan</label>
            <select
              required
              value={uploadDocTypeId}
              onChange={(e) => setUploadDocTypeId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            >
              <option value="">Pilih Jenis Dokumen</option>
              {docTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name} ({dt.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Pilih Berkas (PDF, JPG, PNG)</label>
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-black file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Maksimum ukuran 5 MB. Diperiksa signature byte berkas.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={uploadLoading}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
