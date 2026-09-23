'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from './button';

export interface ColumnDefinition {
  id: string;
  label: string;
}

export interface ColumnToggleProps {
  columns: ColumnDefinition[];
  visibleColumns: string[];
  onChange: (visibleColumns: string[]) => void;
}

export function ColumnToggle({ columns, visibleColumns, onChange }: ColumnToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleColumn = (id: string) => {
    if (visibleColumns.includes(id)) {
      if (visibleColumns.length > 1) {
        onChange(visibleColumns.filter((col) => col !== id));
      }
    } else {
      onChange([...visibleColumns, id]);
    }
  };

  const toggleAll = () => {
    if (visibleColumns.length === columns.length) {
      onChange([columns[0].id]);
    } else {
      onChange(columns.map((c) => c.id));
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 text-xs text-black border-neutral-300 hover:border-black font-medium"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
        <span>Kolom</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Pilih Kolom
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-[10px] text-black hover:underline font-bold"
            >
              {visibleColumns.length === columns.length ? 'Reset' : 'Semua'}
            </button>
          </div>
          <div className="py-1">
            {columns.map((col) => {
              const isChecked = visibleColumns.includes(col.id);
              return (
                <label
                  key={col.id}
                  className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer text-xs select-none text-neutral-700"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColumn(col.id)}
                    className="rounded border-neutral-300 text-black focus:ring-black h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className={isChecked ? 'font-medium text-black' : 'text-neutral-500'}>
                    {col.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
