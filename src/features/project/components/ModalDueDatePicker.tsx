'use client';

import React from 'react';
import { format } from 'date-fns';
import { CalendarBlank } from 'phosphor-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

type ModalDueDatePickerProps = {
  value?: Date | null;
  active?: boolean;
  onChange: (date: Date | null) => void;
  className?: string;
};

export function ModalDueDatePicker({
  value,
  active = false,
  onChange,
  className,
}: ModalDueDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Date | undefined>(value ?? undefined);

  React.useEffect(() => {
    setSelected(value ?? undefined);
  }, [value]);

  const displayText = selected ? format(selected, 'yyyy/MM/dd') : 'No due';

  return (
    <Popover placement="bottom" open={open} onOpenChange={setOpen} strategy="fixed">
      <PopoverTrigger>
        <Badge
          tone={active ? 'indigo' : 'gray'}
          size="xs"
          className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium hover:brightness-95 ${
            className ?? ''
          }`}
        >
          <CalendarBlank className="h-4 w-4 text-current" weight="light" />
          <span className="flex-1 truncate text-center">{displayText}</span>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="relative p-0 pt-7">
        <button
          type="button"
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setOpen(false)}
          aria-label="Close calendar"
        >
          ×
        </button>
        <div className="flex flex-col pt-2">
          <Calendar
            selected={selected}
            onSelect={(date) => {
              if (date instanceof Date) {
                setSelected(date);
                onChange(date);
                setOpen(false);
              }
            }}
            mode="single"
          />
          <div className="flex justify-end gap-2 border-t border-slate-200 p-2">
            <button
              type="button"
              onClick={() => {
                setSelected(undefined);
                onChange(null);
                setOpen(false);
              }}
              className="rounded-md px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ModalDueDatePicker;
