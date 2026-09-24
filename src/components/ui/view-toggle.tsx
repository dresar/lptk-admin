'use client';

import React, { useState, useEffect } from 'react';
import { List, LayoutGrid } from 'lucide-react';

export type ViewMode = 'list' | 'grid';

export function useViewMode(defaultMode: ViewMode = 'grid'): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lptk_view_mode') as ViewMode | null;
      if (stored === 'grid' || stored === 'list') {
        setMode(stored);
      } else {
        setMode('grid');
        localStorage.setItem('lptk_view_mode', 'grid');
      }
    } catch {}
  }, []);

  const updateMode = (newMode: ViewMode) => {
    setMode(newMode);
    try {
      localStorage.setItem('lptk_view_mode', newMode);
    } catch {}
  };

  return [mode, updateMode];
}

export interface ViewToggleProps {
  mode: ViewMode;
  onChange: (newMode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded border border-neutral-300 p-0.5 bg-neutral-100 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded transition-colors ${
          mode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
        }`}
        title="Tampilan Grid Card"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Grid</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded transition-colors ${
          mode === 'list' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
        }`}
        title="Tampilan Tabel List"
      >
        <List className="w-3.5 h-3.5" />
        <span>List</span>
      </button>
    </div>
  );
}
