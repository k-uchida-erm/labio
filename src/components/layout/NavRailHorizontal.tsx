'use client';

import { Trash, X } from 'phosphor-react';

export type NavRailHorizontalProps = {
  onMoveToTrash?: () => void;
  onCancel?: () => void;
  selectedCount?: number;
};

export function NavRailHorizontal({
  onMoveToTrash,
  onCancel,
  selectedCount = 0,
}: NavRailHorizontalProps) {
  return (
    <div className="flex h-10 items-center gap-3 rounded-[6px] border border-slate-200 bg-white px-3 shadow-sm">
      <div className="ui-text-xs ui-text-strong flex h-6 items-center gap-1 rounded-md bg-slate-100 px-2">
        <span>
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="ml-1 flex items-center justify-center"
          title="Clear selection"
        >
          <X size={10} weight="light" />
        </button>
      </div>

      <button
        type="button"
        className="ui-text-xs inline-flex h-7 items-center justify-center gap-1 rounded-md border border-indigo-200 px-3 font-medium text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:outline-none"
        onClick={onMoveToTrash}
      >
        <Trash size={14} weight="light" />
        <span>Move to Trash</span>
      </button>
    </div>
  );
}

export default NavRailHorizontal;
