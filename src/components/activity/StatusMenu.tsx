'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ActivityStatus } from './ActivityItem';

// Todo / In Progress / Done を同じサイズ感に揃える
const STATUS_ICON_BASE_CLASS = 'h-4 w-4 transition-colors duration-150 ease-out';

const STATUS_ICON_VIEWBOX_SIZE = 16;
const STATUS_ICON_OUTER_STROKE_WIDTH = 1.2;
const STATUS_ICON_OUTER_PADDING = 0.25;

function getOuterCircleGeometry() {
  const size = STATUS_ICON_VIEWBOX_SIZE;
  const strokeWidth = STATUS_ICON_OUTER_STROKE_WIDTH;
  const radius = (size - strokeWidth) / 2 - STATUS_ICON_OUTER_PADDING;
  const cx = size / 2;
  const cy = size / 2;

  return { size, strokeWidth, radius, cx, cy };
}

function TodoCircle() {
  const { strokeWidth, radius, cx, cy } = getOuterCircleGeometry();

  return (
    <svg viewBox="0 0 16 16" className={STATUS_ICON_BASE_CLASS}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

function DoneCircle() {
  const { strokeWidth, radius, cx, cy } = getOuterCircleGeometry();

  return (
    <svg viewBox="0 0 16 16" className={STATUS_ICON_BASE_CLASS}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M5.2 8.3 L7.1 10.1 L11.0 6.1"
        fill="none"
        stroke="#fff"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProgressCircle({ percent, color = '#fb923c' }: { percent: number; color?: string }) {
  const clamped = Math.max(0, Math.min(1, percent));
  const [animatedPercent, setAnimatedPercent] = React.useState(clamped);
  const { strokeWidth, radius, cx, cy } = getOuterCircleGeometry();

  React.useEffect(() => {
    if (animatedPercent === clamped) return;
    const duration = 200;
    const start = performance.now();
    const from = animatedPercent;
    const to = clamped;
    let raf: number;

    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / duration);
      const next = from + (to - from) * t;
      setAnimatedPercent(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animatedPercent, clamped]);

  return (
    <svg viewBox="0 0 16 16" className={STATUS_ICON_BASE_CLASS}>
      {/* 下地 */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} />
      {/* 扇形塗り（12時スタート） */}
      <path
        d={(() => {
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + animatedPercent * 2 * Math.PI;
          const x1 = cx + radius * Math.cos(startAngle);
          const y1 = cy + radius * Math.sin(startAngle);
          const x2 = cx + radius * Math.cos(endAngle);
          const y2 = cy + radius * Math.sin(endAngle);
          const largeArcFlag = animatedPercent > 0.5 ? 1 : 0;
          return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
        })()}
        fill={color}
        style={{ transition: 'd 0.001ms linear' }} // keep React happy; actual animation via RAF state
      />
    </svg>
  );
}

function StatusIcon({
  status,
  totalSubtasks,
  completedSubtasks,
}: {
  status?: ActivityStatus;
  totalSubtasks?: number;
  completedSubtasks?: number;
}) {
  if (status === 'done') {
    return (
      <span className="status-pulse text-[#5769f6]" key={status}>
        <DoneCircle />
      </span>
    );
  }

  if (status === 'in_progress') {
    const total = totalSubtasks ?? 0;
    const completed = completedSubtasks ?? 0;

    let percent: number;
    if (total > 0) {
      // サブタスクがある場合
      if (completed === 0) {
        percent = 0; // 枠だけオレンジ
      } else {
        percent = completed / total;
      }
    } else {
      // サブタスクがない場合は50%として扱う
      percent = 0.5;
    }

    return (
      <span className="status-pulse" key={status}>
        <ProgressCircle percent={percent} />
      </span>
    );
  }

  return (
    <span className="status-pulse text-slate-400" key={status}>
      <TodoCircle />
    </span>
  );
}

export type StatusMenuProps = {
  status?: ActivityStatus;
  onChangeStatus?: (status: ActivityStatus) => void;
  totalSubtasks?: number;
  completedSubtasks?: number;
  hasChildren?: boolean;
};

export function StatusMenu({
  status,
  onChangeStatus,
  totalSubtasks,
  completedSubtasks,
  hasChildren = false,
}: StatusMenuProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelectStatus = React.useCallback(
    (next: ActivityStatus) => {
      onChangeStatus?.(next);
      setOpen(false);
    },
    [onChangeStatus]
  );

  return (
    <Popover placement="right" open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100"
        >
          <StatusIcon
            status={status}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 px-2 py-1 text-xs text-slate-800">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className={`flex items-center justify-between rounded-md px-2 py-1 ${
              hasChildren ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-100'
            }`}
            onClick={() => handleSelectStatus('todo')}
            disabled={hasChildren}
          >
            <span className="flex items-center gap-2">
              <span className="text-slate-400">
                <TodoCircle />
              </span>
              <span>Todo</span>
            </span>
          </button>
          <button
            type="button"
            className={`flex items-center justify-between rounded-md px-2 py-1 ${
              hasChildren ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-100'
            }`}
            onClick={() => handleSelectStatus('in_progress')}
            disabled={hasChildren}
          >
            <span className="flex items-center gap-2">
              <ProgressCircle percent={0.5} />
              <span>In Progress</span>
            </span>
          </button>
          <button
            type="button"
            className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-100"
            onClick={() => handleSelectStatus('done')}
          >
            <span className="flex items-center gap-2">
              <span className="text-[#5769f6]">
                <DoneCircle />
              </span>
              <span>Done</span>
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default StatusMenu;
