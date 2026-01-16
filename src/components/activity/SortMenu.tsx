'use client';

import { useState } from 'react';
import {
  SortAscending,
  SortDescending,
  CalendarBlank,
  CalendarCheck,
  Clock,
  ListNumbers,
  TextT,
} from 'phosphor-react';
import { Dropdown, DropdownTrigger, DropdownContent } from '@/components/ui/dropdown';
import { MenuPanel, MenuItem, MenuSectionLabel } from '@/components/ui/menu';

export type SortOption = {
  field: 'position' | 'created_at' | 'due_date' | 'updated_at' | 'title';
  direction: 'asc' | 'desc';
  label: string;
};

export type SortMenuProps = {
  sortOption: SortOption | null;
  onSortChange: (option: SortOption | null) => void;
  compact?: boolean;
};

const SORT_OPTIONS: Array<{
  field: SortOption['field'];
  label: string;
  icon: React.ReactNode;
}> = [
  { field: 'position', label: 'Position', icon: <ListNumbers size={14} weight="light" /> },
  {
    field: 'created_at',
    label: 'Created Date',
    icon: <CalendarBlank size={14} weight="light" />,
  },
  { field: 'due_date', label: 'Due Date', icon: <CalendarCheck size={14} weight="light" /> },
  { field: 'updated_at', label: 'Updated Date', icon: <Clock size={14} weight="light" /> },
  { field: 'title', label: 'Title', icon: <TextT size={14} weight="light" /> },
];

export function SortMenu({ sortOption, onSortChange, compact = false }: SortMenuProps) {
  const [open, setOpen] = useState(false);

  const handleSelectSort = (field: SortOption['field'], direction: 'asc' | 'desc') => {
    onSortChange({
      field,
      direction,
      label: `${SORT_OPTIONS.find((o) => o.field === field)?.label} (${direction === 'asc' ? 'Ascending' : 'Descending'})`,
    });
    setOpen(false);
  };

  const handleClearSort = () => {
    onSortChange(null);
    setOpen(false);
  };

  return (
    <Dropdown open={open} onOpenChange={setOpen} placement="bottom" strategy="fixed">
      <DropdownTrigger>
        <button
          type="button"
          className={`flex h-6 items-center rounded-md hover:bg-slate-100 ${
            compact ? 'w-8 justify-center' : 'gap-1 px-2'
          }`}
          aria-label="Sort"
        >
          <SortAscending size={16} weight="light" className="ui-text-strong" />
          {!compact && <span className="ui-text-xxs ui-text-muted">Sort</span>}
        </button>
      </DropdownTrigger>
      <DropdownContent className="z-50 w-72 p-0">
        <MenuPanel className="w-full">
          <MenuSectionLabel>Sort by</MenuSectionLabel>
          <div className="flex flex-col">
            {SORT_OPTIONS.map((option) => {
              const isActive = sortOption?.field === option.field;
              return (
                <div
                  key={option.field}
                  className="flex h-9 items-center justify-between gap-2 px-3"
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span className="ui-text-xs ui-text-strong font-normal">{option.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className={`ui-text-xxs flex h-6 items-center gap-1 rounded px-2 ${
                        isActive && sortOption?.direction === 'asc'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'ui-text-muted hover:bg-slate-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSort(option.field, 'asc');
                      }}
                    >
                      <SortAscending size={12} weight="light" />
                      <span>Asc</span>
                    </button>
                    <button
                      type="button"
                      className={`ui-text-xxs flex h-6 items-center gap-1 rounded px-2 ${
                        isActive && sortOption?.direction === 'desc'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'ui-text-muted hover:bg-slate-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSort(option.field, 'desc');
                      }}
                    >
                      <SortDescending size={12} weight="light" />
                      <span>Desc</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {sortOption && <MenuItem onSelect={handleClearSort}>Clear sort</MenuItem>}
        </MenuPanel>
      </DropdownContent>
    </Dropdown>
  );
}

export default SortMenu;
