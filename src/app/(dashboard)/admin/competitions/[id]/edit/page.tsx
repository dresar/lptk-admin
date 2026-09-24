'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompetitionForm } from '@/components/modules/competition-form';
import { Competition } from '@/types/database';
import { useAuth } from '@/components/providers/auth-context';

export default function EditCompetitionPage() {
  const { canManageCompetition } = useAuth();
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

  if (!canManageCompetition) {
    return (
      <div className="p-8 text-center bg-white border border-neutral-200 rounded max-w-lg mx-auto my-8 space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-black">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-black">Akses Dibatasi</h2>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Akun Operator LPTK Desa hanya berwenang melihat agenda musabaqah. Pengubahan atau pembuatan agenda lomba hanya dapat dilakukan oleh Panitia / Administrator Tingkat Kecamatan dan Super Admin.
        </p>
        <div className="pt-2">
          <Link href="/admin/competitions">
            <Button variant="outline" size="sm">Kembali</Button>
          </Link>
        </div>
      </div>
    );
  }

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
