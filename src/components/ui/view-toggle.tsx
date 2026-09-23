'use client';

import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

export type ViewMode = 'list' | 'grid';

export interface ViewToggleProps {
  mode: ViewMode;
  onChange: (newMode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded border border-neutral-300 p-0.5 bg-neutral-100">
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
          mode === 'list' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
        }`}
      >
        <List className="w-3.5 h-3.5" />
        <span>List</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
          mode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Grid</span>
      </button>
    </div>
  );
}
