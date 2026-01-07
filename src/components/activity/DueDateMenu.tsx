'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarBlank } from 'phosphor-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';

export type DueDateMenuProps = {
  dueDate?: string;
  onChangeDueDate?: (dueDate: Date | null) => void;
  variant?: 'table' | 'badge';
  widthClass?: string;
  placement?: 'left' | 'right' | 'bottom';
  strategy?: 'fixed' | 'absolute';
};

export function DueDateMenu({
  dueDate,
  onChangeDueDate,
  variant = 'table',
  widthClass = '',
  placement = 'bottom',
  strategy = 'fixed',
}: DueDateMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    dueDate ? new Date(dueDate) : undefined
  );

  React.useEffect(() => {
    setSelectedDate(dueDate ? new Date(dueDate) : undefined);
  }, [dueDate]);

  const handleDateSelect = (date: Date | { from?: Date; to?: Date }) => {
    if (date instanceof Date) {
      setSelectedDate(date);
      onChangeDueDate?.(date);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    onChangeDueDate?.(null);
    setOpen(false);
  };

  const displayText = selectedDate ? format(selectedDate, 'yyyy/MM/dd') : 'No due';

  return (
    <Popover placement={placement} open={open} onOpenChange={setOpen} strategy={strategy}>
      <PopoverTrigger>
        {variant === 'badge' ? (
          <Badge
            tone="gray"
            size="xs"
            className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium hover:brightness-95 ${widthClass}`}
          >
            <CalendarBlank className="h-4 w-4 text-current" weight="light" />
            <span className="flex-1 truncate text-center">{displayText}</span>
          </Badge>
        ) : (
          <button
            type="button"
            className="flex h-7 w-32 items-center justify-between rounded-md border border-slate-300 px-4 text-xs text-black"
          >
            <CalendarBlank className="h-4 w-4 text-slate-500" weight="light" />
            <span className="truncate">{displayText}</span>
          </button>
        )}
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
          <Calendar selected={selectedDate} onSelect={handleDateSelect} mode="single" />
          <div className="flex justify-end gap-2 border-t border-slate-200 p-2">
            <button
              type="button"
              onClick={handleClear}
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

export default DueDateMenu;
