'use client';

import { Dropdown, DropdownContent, DropdownTrigger } from '@/components/ui/dropdown';
import { Badge } from '@/components/ui/badge';
import { Cube } from 'phosphor-react';
import React from 'react';
import type { ActivityType } from '@/features/activity/types';

type TypePickerProps = {
  value: ActivityType;
  onChange: (val: ActivityType) => void;
};

const options: Array<{ value: ActivityType; label: string }> = [
  { value: 'task', label: 'Task' },
  { value: 'experiment', label: 'Experiment' },
  { value: 'question', label: 'Question' },
  { value: 'review', label: 'Review' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
];

const typeColors: Record<ActivityType, { badge: string; icon: string }> = {
  task: { badge: 'bg-indigo-50 text-indigo-600', icon: 'text-indigo-500' },
  experiment: { badge: 'bg-emerald-50 text-emerald-600', icon: 'text-emerald-500' },
  question: { badge: 'bg-amber-50 text-amber-600', icon: 'text-amber-500' },
  review: { badge: 'bg-blue-50 text-blue-600', icon: 'text-blue-500' },
  meeting: { badge: 'bg-sky-50 text-sky-600', icon: 'text-sky-500' },
  note: { badge: 'bg-pink-50 text-pink-600', icon: 'text-pink-500' },
};

export function TypePicker({ value, onChange }: TypePickerProps) {
  const [open, setOpen] = React.useState(false);
  const currentColor = typeColors[value] ?? {
    badge: 'bg-slate-100 text-slate-700',
    icon: 'text-slate-600',
  };

  return (
    <Dropdown open={open} onOpenChange={setOpen} placement="bottom" strategy="fixed">
      <DropdownTrigger>
        <Badge
          tone="custom"
          size="xs"
          className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium ${currentColor.badge}`}
        >
          <Cube size={14} weight="light" className={currentColor.icon} />
          <span className="capitalize">
            {options.find((opt) => opt.value === value)?.label ?? value}
          </span>
        </Badge>
      </DropdownTrigger>
      <DropdownContent className="z-50 w-32 p-0">
        <div className="flex flex-col">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-[12px] ${
                value === opt.value
                  ? `${typeColors[opt.value].badge} font-medium`
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <Cube size={13} weight="light" className={typeColors[opt.value].icon} />
              <span className="capitalize">{opt.label}</span>
            </button>
          ))}
        </div>
      </DropdownContent>
    </Dropdown>
  );
}

export default TypePicker;
