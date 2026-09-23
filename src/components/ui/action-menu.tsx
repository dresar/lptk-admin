'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';

export interface ActionMenuProps {
  detailHref?: string;
  onDetail?: () => void;
  editHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ActionMenu({
  detailHref,
  onDetail,
  editHref,
  onEdit,
  onDelete,
  className = '',
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black focus:outline-none focus:ring-1 focus:ring-black"
        aria-label="Menu"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          {(detailHref || onDetail) && (
            detailHref ? (
              <Link
                href={detailHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 font-medium"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-500" />
                <span>Lihat</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDetail?.();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 font-medium"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-500" />
                <span>Lihat</span>
              </button>
            )
          )}

          {(editHref || onEdit) && (
            editHref ? (
              <Link
                href={editHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 font-medium"
              >
                <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                <span>Ubah</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onEdit?.();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 font-medium"
              >
                <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                <span>Ubah</span>
              </button>
            )
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-black hover:bg-neutral-100 font-medium border-t border-neutral-100"
            >
              <Trash2 className="w-3.5 h-3.5 text-black" />
              <span>Hapus</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
