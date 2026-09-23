'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { UserForm } from '@/components/modules/user-form';
import { UserAccount } from '@/types/database';

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) {
          setError('Pengguna tidak ditemukan.');
          return;
        }
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        setError('Gagal memuat data pengguna.');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-xs text-neutral-500">Memuat data pengguna...</div>;
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
        <Link href="/admin/users" className="p-1 text-neutral-500 hover:text-black rounded">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Ubah Pengguna</h1>
          <p className="text-xs text-neutral-500">Perbarui profil pengguna {data.full_name}</p>
        </div>
      </div>

      <UserForm initialData={data} />
    </div>
  );
}
