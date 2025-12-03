'use client';

import {
  Square,
  SquareCheck,
  ChevronRight,
  Circle,
  CircleDot,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';

export type ActivityStatus = 'todo' | 'in_progress' | 'done';
export type ActivityType = 'Task' | 'Bug' | 'Feature';

export type Activity = {
  id: string;
  displayId: string;
  type: ActivityType;
  title: string;
  status: ActivityStatus;
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  hasChildren?: boolean;
};

export type ActivityRowProps = {
  activity: Activity;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (id: string) => void;
  onStatusChange?: (id: string, status: ActivityStatus) => void;
  onToggleExpand?: (id: string) => void;
};

function StatusIcon({ status }: { status: ActivityStatus }) {
  switch (status) {
    case 'todo':
      return <Circle size={16} className="text-slate-400" />;
    case 'in_progress':
      return <CircleDot size={16} className="text-amber-500" />;
    case 'done':
      return <CheckCircle2 size={16} className="text-green-500" />;
  }
}

export function ActivityRow({
  activity,
  isSelected = false,
  isHovered = false,
  onSelect,
  onClick,
  onStatusChange,
  onToggleExpand,
}: ActivityRowProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(activity.id);
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: ActivityStatus =
      activity.status === 'todo'
        ? 'in_progress'
        : activity.status === 'in_progress'
          ? 'done'
          : 'todo';
    onStatusChange?.(activity.id, nextStatus);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand?.(activity.id);
  };

  const CheckboxIconComponent = isSelected ? SquareCheck : Square;

  return (
    <div
      className={`flex h-10 w-full cursor-pointer items-center overflow-hidden rounded p-2 ${
        isHovered ? 'bg-slate-50 opacity-80' : ''
      }`}
      onClick={() => onClick?.(activity.id)}
    >
      {/* Checkbox Cell */}
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden p-2.5">
        <button onClick={handleCheckboxClick} className="hover:opacity-70">
          <CheckboxIconComponent size={16} className="text-slate-400" />
        </button>
      </div>

      {/* ID Cell */}
      <div className="flex h-10 w-[72px] shrink-0 items-center justify-center overflow-hidden p-2">
        <span className="text-xs text-black">{activity.displayId}</span>
      </div>

      {/* Type Cell */}
      <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden p-2">
        <span className="rounded border border-slate-300 px-2 text-xs text-black">
          {activity.type}
        </span>
      </div>

      {/* Toggle Cell */}
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden p-2.5">
        {activity.hasChildren && (
          <button onClick={handleToggleClick} className="hover:opacity-70">
            <ChevronRight size={16} className="text-slate-700" />
          </button>
        )}
      </div>

      {/* Status Cell */}
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden p-2.5">
        <button onClick={handleStatusClick} className="hover:opacity-70">
          <StatusIcon status={activity.status} />
        </button>
      </div>

      {/* Title Cell */}
      <div className="flex h-10 min-w-0 flex-1 items-center overflow-hidden p-2">
        <span className="truncate text-xs text-black">{activity.title}</span>
      </div>

      {/* Due Date Cell */}
      <div className="flex h-8 w-32 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-lg border border-slate-200 p-2">
        <Calendar size={16} className="text-slate-500" />
        <span className="text-xs text-black">{activity.dueDate || '-'}</span>
      </div>

      {/* Assignee Cell */}
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden p-2.5">
        <button className="hover:opacity-70">
          <User size={20} className="text-slate-600" />
        </button>
      </div>
    </div>
  );
}
