'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AssigneeList, { AssigneeOption } from '@/components/activity/AssigneeList';
import { Badge } from '@/components/ui/badge';
import { AvatarInitial } from '@/components/ui/avatar';

type AssigneePickerProps = {
  selectedIds: string[];
  options: AssigneeOption[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  active?: boolean;
  triggerClassName?: string;
};

export function AssigneePicker({
  selectedIds,
  options,
  onChange,
  placeholder = 'Search assignee',
  active = false,
  triggerClassName,
}: AssigneePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.filter((o) => selectedIds.includes(o.id));
  const displayLabel = selected
    .slice(0, 2)
    .map((o) => o.name)
    .join(', ');
  const overflow = selected.length > 2 ? ` +${selected.length - 2}` : '';
  const lead = selected[0] ?? null;
  const leadName = lead?.name;
  const leadAvatar = lead?.avatarUrl ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom" strategy="fixed">
      <PopoverTrigger>
        <Badge
          tone={active ? 'indigo' : 'gray'}
          size="xs"
          className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium hover:brightness-95 ${triggerClassName ?? ''}`}
        >
          <AvatarInitial
            label={leadName}
            avatarUrl={leadAvatar}
            size="sm"
            className="bg-slate-100 text-slate-700"
          />
          <span className="text-xs font-medium">
            {displayLabel || 'Assignee'}
            {overflow}
          </span>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="z-50 p-0">
        <AssigneeList
          options={options}
          selectedIds={selectedIds}
          onChange={(ids) => {
            onChange(ids);
          }}
          placeholder={placeholder}
        />
      </PopoverContent>
    </Popover>
  );
}

export default AssigneePicker;
