'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantCard } from '@/components/modules/participant-card';
import { Participant } from '@/types/database';

export default function ParticipantCardPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadParticipant() {
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
        setError('Gagal memuat kartu peserta.');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadParticipant();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
        Memuat kartu peserta...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-xs text-neutral-700 bg-white border border-neutral-200 rounded space-y-3">
        <p>{error || 'Data peserta tidak ditemukan.'}</p>
        <Link href="/admin/participants">
          <Button variant="outline" size="sm">Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Navigation (Hidden in print) */}
      <div className="print:hidden flex items-center justify-between pb-3 border-b border-neutral-200">
        <Link href={`/admin/participants/${data.id}`}>
          <Button variant="outline" size="sm" className="gap-1.5 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
        </Link>
        <span className="text-xs font-mono text-neutral-500">
          ID: {data.id.slice(0, 8)}
        </span>
      </div>

      <ParticipantCard participant={data} standalone={true} />
    </div>
  );
}
