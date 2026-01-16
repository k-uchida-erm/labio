'use client';

import { Dropdown, DropdownContent, DropdownTrigger } from '@/components/ui/dropdown';
import { Badge } from '@/components/ui/badge';
import { Cube, Flask, Question, ClipboardText, UsersThree, Note } from 'phosphor-react';
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
  task: { badge: 'bg-indigo-100 text-indigo-700', icon: 'text-indigo-600' },
  experiment: { badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-600' },
  question: { badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600' },
  review: { badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-600' },
  meeting: { badge: 'bg-sky-100 text-sky-700', icon: 'text-sky-600' },
  note: { badge: 'bg-pink-100 text-pink-700', icon: 'text-pink-600' },
};

const typeIconComponents: Record<ActivityType, typeof Cube> = {
  task: Cube,
  experiment: Flask,
  question: Question,
  review: ClipboardText,
  meeting: UsersThree,
  note: Note,
};

export function TypePicker({ value, onChange }: TypePickerProps) {
  const [open, setOpen] = React.useState(false);
  const currentColor = typeColors[value] ?? {
    badge: 'bg-slate-100 text-slate-700',
    icon: 'text-slate-600',
  };
  const IconComponent = typeIconComponents[value] ?? Cube;

  return (
    <Dropdown open={open} onOpenChange={setOpen} placement="bottom" strategy="fixed">
      <DropdownTrigger>
        <Badge
          tone="custom"
          size="xs"
          className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium ${currentColor.badge}`}
        >
          <IconComponent size={14} weight="light" className={currentColor.icon} />
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
              {React.createElement(typeIconComponents[opt.value] ?? Cube, {
                size: 13,
                weight: 'light',
                className: typeColors[opt.value].icon,
              })}
              <span className="capitalize">{opt.label}</span>
            </button>
          ))}
        </div>
      </DropdownContent>
    </Dropdown>
  );
}

export default TypePicker;
