'use client';

import * as React from 'react';
import { CaretRight, Cube } from 'phosphor-react';
import { ActivityCheckbox } from './ActivityCheckbox';
import { ActivityAddButton } from './ActivityAddButton';
import StatusMenu from './StatusMenu';
import DueDateMenu from './DueDateMenu';
import { Badge } from '@/components/ui/badge';
import { AvatarInitial } from '@/components/ui/avatar';
import { ActivityMetadata, ActivityType } from '@/features/activity/types';

export type ActivityStatus = 'todo' | 'in_progress' | 'done';

export type ActivityItemProps = {
  id: string;
  title: string;
  type?: ActivityType;
  dueDate?: string;
  metadata?: ActivityMetadata;
  status?: ActivityStatus;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  hasChildren?: boolean;
  checked?: boolean;
  onToggleChecked?: (event?: React.MouseEvent) => void;
  onToggleChildren?: () => void;
  onAddSubActivity?: () => void;
  onClickAssignee?: () => void;
  onChangeStatus?: (status: ActivityStatus) => void;
  onChangeDueDate?: (dueDate: Date | null) => void;
  checkboxRef?: React.RefObject<HTMLButtonElement | null>;
  isSubActivity?: boolean;
  isExpanded?: boolean;
  depth?: number; // 階層の深さ（インデント用）
  showId?: boolean;
  totalSubtasks?: number;
  completedSubtasks?: number;
};

export function ActivityItem({
  id,
  title,
  type = 'task',
  dueDate,
  status = 'todo',
  metadata,
  assigneeName,
  assigneeAvatarUrl,
  hasChildren,
  checked,
  onToggleChecked,
  onToggleChildren,
  onAddSubActivity,
  onClickAssignee,
  onChangeStatus,
  onChangeDueDate,
  checkboxRef,
  isSubActivity = false,
  isExpanded = false,
  depth = 0,
  showId = true,
  totalSubtasks,
  completedSubtasks,
}: ActivityItemProps) {
  const isSelected = !!checked;
  const rowBgClass = isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50';

  return (
    <div
      data-depth={depth}
      data-subactivity={isSubActivity ? 'true' : 'false'}
      className={`group/item flex h-10 w-full items-center rounded-md px-2 ${rowBgClass}`}
    >
      {/* Checkbox cell - チェック済みは常に表示、未チェックはホバー時のみ表示 */}
      <div
        className={`transition-opacity ${
          checked ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'
        }`}
      >
        <ActivityCheckbox checked={checked} onToggle={onToggleChecked} ref={checkboxRef} />
      </div>

      {/* Toggle cell（キーとチェックボックスの間） */}
      <button
        type="button"
        onClick={hasChildren ? onToggleChildren : undefined}
        className="flex h-10 w-10 items-center justify-center disabled:opacity-0"
        disabled={!hasChildren}
        aria-hidden={!hasChildren}
      >
        <CaretRight
          className={`h-4 w-4 text-black transition-transform duration-150 ${
            isExpanded ? 'rotate-90' : ''
          }`}
          weight="light"
        />
      </button>

      {/* ID cell */}
      {showId && (
        <div className="flex h-10 items-center px-2">
          <Badge tone="gray" size="xs" className="w-[80px] justify-center px-0">
            <span className="text-xs leading-6 text-slate-700">{id}</span>
          </Badge>
        </div>
      )}

      {/* Type cell (Task) */}
      <div className="flex h-10 w-10 items-center justify-center">
        <Cube className="h-4 w-4 text-black" weight="light" />
      </div>

      {/* Status cell */}
      <div className="flex h-10 w-10 items-center justify-center">
        <StatusMenu
          status={status}
          onChangeStatus={onChangeStatus}
          totalSubtasks={totalSubtasks}
          completedSubtasks={completedSubtasks}
          hasChildren={hasChildren}
        />
      </div>

      {/* Title cell */}
      <div className="flex h-10 flex-1 items-center px-2">
        <span className="truncate text-xs leading-6 text-black">{title}</span>
      </div>

      {/* Add sub activity cell */}
      <ActivityAddButton onClick={onAddSubActivity} />

      {renderTypeMeta({
        type,
        dueDate,
        metadata,
        onChangeDueDate,
        assigneeAvatarUrl,
        assigneeName,
        onClickAssignee,
      })}
    </div>
  );
}

type TypeMetaProps = {
  type: ActivityType;
  metadata?: ActivityMetadata;
  dueDate?: string;
  onChangeDueDate?: (date: Date | null) => void;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  onClickAssignee?: () => void;
};

function renderTypeMeta(props: TypeMetaProps) {
  switch (props.type) {
    case 'task':
    default:
      return <TaskActivityMeta {...props} />;
  }
}

function TaskActivityMeta({
  dueDate,
  onChangeDueDate,
  assigneeName,
  assigneeAvatarUrl,
  onClickAssignee,
}: TypeMetaProps) {
  return (
    <>
      <div className="flex h-10 w-36 items-center px-2">
        <DueDateMenu
          dueDate={dueDate}
          onChangeDueDate={onChangeDueDate}
          variant="badge"
          active={!!dueDate}
          widthClass="w-36"
          placement="left"
        />
      </div>
      <button
        type="button"
        onClick={onClickAssignee}
        className="flex h-10 w-14 items-center justify-center"
        aria-label="View assignee"
      >
        <AvatarInitial
          label={assigneeName ?? undefined}
          avatarUrl={assigneeAvatarUrl ?? undefined}
          size="sm"
          className="h-7 w-7 bg-slate-200 text-sm text-slate-700"
        />
      </button>
    </>
  );
}
