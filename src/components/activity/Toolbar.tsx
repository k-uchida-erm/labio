'use client';

import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
} from 'lucide-react';

export type ToolbarProps = {
  onSearch?: () => void;
  onFilter?: () => void;
  onSort?: () => void;
  onAddActivity?: () => void;
};

export function Toolbar({
  onSearch,
  onFilter,
  onSort,
  onAddActivity,
}: ToolbarProps) {
  return (
    <div className="flex w-full items-center justify-between overflow-hidden bg-white px-8 py-2">
      {/* Left Group */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSearch}
          className="flex size-8 items-center justify-center rounded-md p-1 hover:bg-slate-100"
        >
          <Search size={16} className="text-slate-500" />
        </button>
        <button
          onClick={onFilter}
          className="flex size-8 items-center justify-center rounded-md p-1 hover:bg-slate-100"
        >
          <Filter size={20} className="text-slate-500" />
        </button>
        <button
          onClick={onSort}
          className="flex size-8 items-center justify-center rounded-md p-1 hover:bg-slate-100"
        >
          <ArrowUpDown size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Add Activity Button */}
      <button
        onClick={onAddActivity}
        className="flex h-8 items-center justify-center gap-2 rounded-lg bg-[#5769f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#4558e5]"
      >
        <Plus size={20} />
        <span>Add Activity</span>
      </button>
    </div>
  );
}
