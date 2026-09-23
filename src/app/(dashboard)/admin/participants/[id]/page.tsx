'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Participant, DocumentType, ParticipantDocument, Verification } from '@/types/database';

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
        return <span className="bg-neutral-100 text-neutral-700 border border-neutral-300 px-2.5 py-1 rounded text-xs font-mono">DRAF</span>;
      case 'SUBMITTED':
        return <span className="bg-neutral-200 text-black border border-neutral-400 px-2.5 py-1 rounded text-xs font-mono font-medium">TERKIRIM</span>;
      case 'IN_REVIEW':
        return <span className="bg-neutral-800 text-white border border-black px-2.5 py-1 rounded text-xs font-mono">DITINJAU</span>;
      case 'VERIFIED':
        return <span className="bg-black text-white border border-black px-2.5 py-1 rounded text-xs font-mono font-bold">VALID</span>;
      case 'REVISION_REQUIRED':
        return <span className="bg-white text-black border border-black underline px-2.5 py-1 rounded text-xs font-mono">REVISI</span>;
      case 'REJECTED':
        return <span className="bg-neutral-900 text-white line-through px-2.5 py-1 rounded text-xs font-mono">DITOLAK</span>;
      default:
        return <span className="text-xs font-mono">{status}</span>;
    }
  };

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
                <span className="text-neutral-500 block text-[11px]">Asal LPTK</span>
                <span className="font-semibold text-black">{participant.lptk_name} ({participant.village_name})</span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[11px]">Jenis Kelamin</span>
                <span className="font-semibold text-black">{participant.gender_code === 'MALE' ? 'Laki-laki' : 'Perempuan'}</span>
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
                <span className="text-neutral-500 block text-[11px]">Nomor Telepon</span>
                <span className="font-mono text-black">{participant.phone}</span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[11px]">Alamat Domisili</span>
                <span className="text-black">{participant.address}</span>
              </div>

              {participant.school_or_institution && (
                <div>
                  <span className="text-neutral-500 block text-[11px]">Sekolah / Lembaga</span>
                  <span className="text-black">{participant.school_or_institution}</span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Orang Tua</span>
                <span className="text-black">Ayah: {participant.father_name || '-'} | Ibu: {participant.mother_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Categories card */}
          <div className="bg-white border border-neutral-300 rounded p-5 space-y-2">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-2">
              Cabang Perlombaan
            </h2>
            <div className="space-y-1.5 pt-1">
              {participant.categories?.map((cat: any) => (
                <div key={cat.id} className="p-2 bg-neutral-100 rounded border border-neutral-200 text-xs">
                  <div className="font-semibold text-black">{cat.name}</div>
                  <div className="text-[11px] text-neutral-500">Usia: {cat.age_min} - {cat.age_max} th</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Documents & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents Section */}
          <div className="bg-white border border-neutral-300 rounded p-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <div>
                <h2 className="text-xs font-bold text-black uppercase tracking-wider">
                  Dokumen Persyaratan
                </h2>
                <p className="text-[11px] text-neutral-500">Berkas autentik tersimpan privat di database</p>
              </div>
              {canEditOrSubmit && (
                <Button size="sm" onClick={() => setIsUploadOpen(true)} className="gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Unggah
                </Button>
              )}
            </div>

            {participant.documents?.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded">
                Belum ada dokumen yang diunggah. Unggah berkas wajib untuk dapat mengirim pendaftaran.
              </div>
            ) : (
              <div className="space-y-2">
                {participant.documents.map((doc: ParticipantDocument) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded border border-neutral-200 hover:border-black transition-colors bg-white text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-neutral-100 text-black">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-black">{doc.document_type_name || doc.document_type_code}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {doc.file_name} • {(doc.file_size_bytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/admin/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="outline" size="sm" className="p-1.5" aria-label="Unduh">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      {canEditOrSubmit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5"
                          aria-label="Hapus"
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
            <label className="block text-xs font-semibold text-black mb-1">Jenis Dokumen</label>
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
