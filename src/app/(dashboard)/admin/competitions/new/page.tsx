'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompetitionForm } from '@/components/modules/competition-form';
import { useAuth } from '@/components/providers/auth-context';

export default function NewCompetitionPage() {
  const { canManageCompetition } = useAuth();

  if (!canManageCompetition) {
    return (
      <div className="p-8 text-center bg-white border border-neutral-200 rounded max-w-lg mx-auto my-8 space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-black">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-black">Akses Dibatasi</h2>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Akun Operator LPTK Desa hanya berwenang melihat agenda musabaqah. Pembuatan agenda lomba baru hanya dapat dilakukan oleh Panitia / Administrator Tingkat Kecamatan dan Super Admin.
        </p>
        <div className="pt-2">
          <Link href="/admin/competitions">
            <Button variant="outline" size="sm">Kembali</Button>
          </Link>
        </div>
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
          <h1 className="text-xl font-bold tracking-tight text-black">Tambah Lomba</h1>
          <p className="text-xs text-neutral-500">Mendaftarkan agenda perhelatan musabaqah baru</p>
        </div>
      </div>

      <CompetitionForm />
    </div>
  );
}
