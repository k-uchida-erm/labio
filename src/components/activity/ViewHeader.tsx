'use client';

import {
  List,
  LayoutGrid,
  GanttChart,
  Calendar,
} from 'lucide-react';

export type ViewType = 'list' | 'kanban' | 'gantt' | 'calendar';

export type ViewHeaderProps = {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
};

type ViewOption = {
  type: ViewType;
  label: string;
  icon: React.ReactNode;
};

const viewOptions: ViewOption[] = [
  { type: 'list', label: 'List', icon: <List size={20} className="text-slate-800" /> },
  { type: 'kanban', label: 'Kanban', icon: <LayoutGrid size={20} className="text-slate-800" /> },
  { type: 'gantt', label: 'Gantt', icon: <GanttChart size={16} className="text-slate-800" /> },
  { type: 'calendar', label: 'Calendar', icon: <Calendar size={16} className="text-slate-800" /> },
];

export function ViewHeader({ currentView, onViewChange }: ViewHeaderProps) {
  return (
    <div className="flex h-11 w-full items-center gap-2 overflow-hidden border-y border-slate-200 bg-white px-4 py-1">
      <div className="flex h-8 items-center rounded-lg bg-slate-100 px-2 py-1">
        {viewOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => onViewChange(option.type)}
            className={`flex h-7 items-center gap-2 rounded-lg px-3 py-1 text-xs font-medium text-slate-800 ${
              currentView === option.type
                ? 'border border-slate-300 bg-white'
                : 'bg-slate-100'
            }`}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
