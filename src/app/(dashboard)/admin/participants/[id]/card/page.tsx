'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantCard } from '@/components/modules/participant-card';
import { Participant } from '@/types/database';
import { getCategoryBranchInfo } from '@/data/juknis-official-data';

export default function ParticipantCardPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teammates, setTeammates] = useState<Participant[]>([]);

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

  useEffect(() => {
    if (data?.lptk_id && data?.categories?.[0]?.id) {
      const catName = data.categories[0].name;
      const branch = getCategoryBranchInfo(catName);
      if (branch.format !== 'INDIVIDU') {
        fetch(`/api/admin/participants?lptk_id=${data.lptk_id}&category_id=${data.categories[0].id}&page_size=20`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success) {
              const list = Array.isArray(json.data)
                ? json.data
                : Array.isArray(json.data?.participants)
                ? json.data.participants
                : [];
              setTeammates(list);
            }
          })
          .catch(() => {});
      }
    }
  }, [data]);

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

  const catName = data.categories?.[0]?.name || '';
  const branchInfo = getCategoryBranchInfo(catName);
  const isCollective = branchInfo.format !== 'INDIVIDU';

  const photoDoc = (data as any)?.documents?.find(
    (d: any) => d.document_type_code === 'PAS_FOTO' || d.document_type_code === 'FOTO'
  );
  const photoUrl = photoDoc ? `/api/admin/documents/${photoDoc.id}/download` : null;

  return (
    <div className="space-y-4">
      {/* Top Navigation (Hidden in print) */}
      <div className="print:hidden space-y-3 pb-3 border-b border-neutral-200">
        <div className="flex items-center justify-between">
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

        {/* Collective Team Selector Banner */}
        {isCollective && teammates.length > 0 && (
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900">
                Anggota Regu ({branchInfo.formatLabel}) - {data.village_name || data.lptk_name}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                {teammates.length} dari {branchInfo.personelCount} Terdaftar
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {teammates.map((mate, idx) => {
                const isCurrent = mate.id === data.id;
                return (
                  <Link
                    key={mate.id}
                    href={`/admin/participants/${mate.id}/card`}
                    className={`px-2.5 py-1 text-xs rounded-sm border transition-colors ${
                      isCurrent
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100 font-medium'
                    }`}
                  >
                    Anggota {idx + 1}: {mate.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ParticipantCard participant={data} photoUrl={photoUrl} standalone={true} />
    </div>
  );
}
