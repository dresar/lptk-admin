'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ParticipantForm } from '@/components/modules/participant-form';
import { Participant } from '@/types/database';

export default function EditParticipantPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/participants/${id}`);
        if (!res.ok) {
          setError('Peserta tidak ditemukan.');
          return;
        }
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        setError('Gagal memuat data peserta.');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-xs text-neutral-500">Memuat data peserta...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-xs text-black bg-neutral-100 border border-neutral-300 rounded">
        {error || 'Data tidak tersedia.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-200">
        <Link href={`/admin/participants/${id}`} className="p-1 text-neutral-500 hover:text-black rounded">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Ubah Peserta</h1>
          <p className="text-xs text-neutral-500">Perbarui data pendaftaran {data.name}</p>
        </div>
      </div>

      <ParticipantForm initialData={data} />
    </div>
  );
}
