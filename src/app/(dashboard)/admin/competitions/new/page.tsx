import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CompetitionForm } from '@/components/modules/competition-form';

export default function NewCompetitionPage() {
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
