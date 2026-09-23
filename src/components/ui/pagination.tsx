'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { PaginationMeta } from '@/types/api';

export interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export function PaginationBar({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.total_pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-neutral-200 text-xs text-neutral-600">
      <div>
        Menampilkan data {(meta.page - 1) * meta.page_size + 1} -{' '}
        {Math.min(meta.page * meta.page_size, meta.total_items)} dari {meta.total_items}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          className="p-1.5"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="px-2 font-medium text-black">
          {meta.page} / {meta.total_pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.total_pages}
          onClick={() => onPageChange(meta.page + 1)}
          className="p-1.5"
          aria-label="Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
