'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './button';

export interface BulkToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function BulkToolbar({ selectedCount, onDelete, onClear, isLoading = false }: BulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 bg-black text-white rounded-lg shadow-2xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-4 duration-150">
      <span className="text-xs font-medium text-neutral-300">
        {selectedCount} item terpilih
      </span>
      <div className="h-4 w-px bg-neutral-700" />
      <Button
        variant="danger"
        size="sm"
        isLoading={isLoading}
        onClick={onDelete}
        className="bg-neutral-900 border-neutral-600 hover:bg-neutral-800 text-xs px-2.5 py-1"
      >
        <Trash2 className="w-3.5 h-3.5 mr-1" />
        Hapus
      </Button>
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-neutral-400 hover:text-white underline decoration-1"
      >
        Batal
      </button>
    </div>
  );
}
