'use client';

import * as React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';

type CalendarProps = {
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date }) => void;
  mode?: 'single' | 'range';
  className?: string;
};

export function Calendar({ selected, onSelect, mode = 'single', className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isSelected = (date: Date) => {
    if (!selected) return false;
    if (mode === 'single') {
      return isSameDay(date, selected as Date);
    }
    const range = selected as { from?: Date; to?: Date };
    if (range.from && isSameDay(date, range.from)) return true;
    if (range.to && isSameDay(date, range.to)) return true;
    if (range.from && range.to) {
      return date >= range.from && date <= range.to;
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (mode === 'single') {
      onSelect?.(date);
    } else {
      const range = (selected || {}) as { from?: Date; to?: Date };
      if (!range.from || (range.from && range.to)) {
        onSelect?.({ from: date, to: undefined });
      } else {
        onSelect?.({ from: range.from, to: date });
      }
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`w-64 p-3 ${className ?? ''}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="h-7 w-7 rounded-md hover:bg-slate-100">
          ←
        </button>
        <span className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
        <button type="button" onClick={nextMonth} className="h-7 w-7 rounded-md hover:bg-slate-100">
          →
        </button>
      </div>

      {/* Week days */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-slate-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month start */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {days.map((day) => {
          const selected = isSelected(day);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDateClick(day)}
              className={`h-8 w-8 rounded-md text-xs hover:bg-slate-100 ${
                selected
                  ? 'bg-[#5769f6] text-white hover:bg-[#4558e5]'
                  : isSameMonth(day, currentMonth)
                    ? 'text-slate-900'
                    : 'text-slate-400'
              }`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
