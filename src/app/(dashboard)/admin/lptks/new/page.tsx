import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LptkForm } from '@/components/modules/lptk-form';

export default function NewLptkPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-200">
        <Link href="/admin/lptks" className="p-1 text-neutral-500 hover:text-black rounded">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Tambah LPTK</h1>
          <p className="text-xs text-neutral-500">Mendaftarkan unit LPTK baru</p>
        </div>
      </div>

      <LptkForm />
    </div>
  );
}
