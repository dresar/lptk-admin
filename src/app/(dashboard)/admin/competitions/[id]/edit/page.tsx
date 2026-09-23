'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CompetitionForm } from '@/components/modules/competition-form';
import { Competition } from '@/types/database';

export default function EditCompetitionPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/competitions/${id}`);
        if (!res.ok) {
          setError('Lomba tidak ditemukan.');
          return;
        }
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        setError('Gagal memuat data lomba.');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-xs text-neutral-500">Memuat data lomba...</div>;
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
        <Link href="/admin/competitions" className="p-1 text-neutral-500 hover:text-black rounded">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Ubah Lomba</h1>
          <p className="text-xs text-neutral-500">Perbarui informasi lomba {data.name}</p>
        </div>
      </div>

      <CompetitionForm initialData={data} />
    </div>
  );
}
