'use client';

import * as React from 'react';
import {
  CaretRight,
  Cube,
  Flask,
  Question,
  ClipboardText,
  UsersThree,
  Note,
  DotsThree,
} from 'phosphor-react';
import { ActivityCheckbox } from './ActivityCheckbox';
import { ActivityAddButton } from './ActivityAddButton';
import StatusMenu from './StatusMenu';
import DueDateMenu from './DueDateMenu';
import { AvatarInitial } from '@/components/ui/avatar';
import { ActivityStatus, ActivityType } from '@/features/activity/types';
import { Button } from '@/components/ui/button';

export type ActivityItemProps = {
  id: string;
  title: string;
  type?: ActivityType;
  dueDate?: string;
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
  onClickActivity?: () => void;
  checkboxRef?: React.RefObject<HTMLButtonElement | null>;
  isSubActivity?: boolean;
  isExpanded?: boolean;
  depth?: number; // 階層の深さ（インデント用）
  showId?: boolean;
  totalSubtasks?: number;
  completedSubtasks?: number;
  showCheckbox?: boolean; // チェックボックスを表示するかどうか
  canAddSubActivity?: boolean;
  compactMeta?: boolean;
  onOpenDetails?: () => void;
  isActive?: boolean;
  showChildToggle?: boolean;
};

const typeIcons: Record<ActivityType, React.ReactElement> = {
  task: <Cube weight="light" />,
  experiment: <Flask weight="light" />,
  question: <Question weight="light" />,
  review: <ClipboardText weight="light" />,
  meeting: <UsersThree weight="light" />,
  note: <Note weight="light" />,
};

const badgeTypeStyles: Record<ActivityType, { badge: string; icon: string }> = {
  task: { badge: 'bg-indigo-100 text-indigo-700', icon: 'text-indigo-600' },
  experiment: { badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-600' },
  question: { badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600' },
  review: { badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-600' },
  meeting: { badge: 'bg-sky-100 text-sky-700', icon: 'text-sky-600' },
  note: { badge: 'bg-pink-100 text-pink-700', icon: 'text-pink-600' },
};

export function ActivityItem({
  id,
  title,
  type = 'task',
  dueDate,
  status = 'todo',
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
  onClickActivity,
  checkboxRef,
  isSubActivity = false,
  isExpanded = false,
  depth = 0,
  showId = true,
  totalSubtasks,
  completedSubtasks,
  showCheckbox = true,
  canAddSubActivity = true,
  compactMeta = false,
  onOpenDetails,
  isActive = false,
  showChildToggle,
}: ActivityItemProps) {
  const isSelected = !!checked;
  const rowBgClass = isSelected
    ? 'bg-slate-50'
    : isActive
      ? 'bg-slate-50 hover:bg-slate-50'
      : 'bg-white hover:bg-slate-50';

  const showAddButton = !!onAddSubActivity && canAddSubActivity;
  const shouldShowToggle = showChildToggle ?? hasChildren;

  return (
    <div
      data-depth={depth}
      data-subactivity={isSubActivity ? 'true' : 'false'}
      className={`group/item flex h-10 w-full items-center rounded-md px-1 ${rowBgClass}`}
    >
      {/* Checkbox cell - チェック済みは常に表示、未チェックはホバー時のみ表示 */}
      {showCheckbox && (
        <div
          className={`transition-opacity ${
            checked ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'
          }`}
        >
          <ActivityCheckbox checked={checked} onToggle={onToggleChecked} ref={checkboxRef} />
        </div>
      )}

      {/* Toggle cell（キーとチェックボックスの間） */}
      {shouldShowToggle ? (
        <div className="flex h-10 w-7 items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleChildren}
            className="flex h-6 w-4 items-center justify-center p-0"
            aria-hidden={!shouldShowToggle}
          >
            <CaretRight
              className={`h-3.5 w-3.5 text-black transition-transform duration-150 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              weight="light"
            />
          </Button>
        </div>
      ) : (
        <div className="h-10 w-7" />
      )}

      {/* ID cell */}
      {showId && (
        <div className="flex h-10 min-w-[72px] items-center justify-start px-1">
          <div
            className={`flex h-6 min-w-0 items-center gap-1 rounded-full px-2 text-[12px] font-medium ${
              badgeTypeStyles[type]?.badge ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {React.cloneElement(typeIcons[type] ?? typeIcons.task, {
              className: `h-3.5 w-3.5 ${badgeTypeStyles[type]?.icon ?? 'text-slate-500'}`,
            })}
            <span className="truncate">{id}</span>
          </div>
        </div>
      )}

      {/* Status cell */}
      <div className="flex h-10 w-9 items-center justify-center">
        <StatusMenu
          status={status}
          onChangeStatus={onChangeStatus}
          totalSubtasks={totalSubtasks}
          completedSubtasks={completedSubtasks}
          hasChildren={hasChildren}
        />
      </div>

      {/* Title cell */}
      <Button
        type="button"
        variant="ghost"
        onClick={onClickActivity}
        className="flex h-10 min-w-0 flex-1 items-center justify-start px-2 text-left hover:opacity-80"
        disabled={!onClickActivity}
      >
        <span className="truncate text-xs leading-6 text-black">{title}</span>
      </Button>

      {compactMeta ? (
        <div className="flex h-10 w-36 items-center justify-end gap-1 px-2">
          {showAddButton && (
            <ActivityAddButton onClick={onAddSubActivity} title="Add sub activity" />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenDetails}
            className="h-8 w-8 rounded-full hover:bg-slate-100"
            aria-label="Open details"
          >
            <DotsThree size={16} weight="light" />
          </Button>
        </div>
      ) : (
        <>
          {showAddButton ? (
            <ActivityAddButton onClick={onAddSubActivity} title="Add sub activity" />
          ) : (
            <div className="h-10 w-9" />
          )}
          {renderTypeMeta({
            type,
            dueDate,
            onChangeDueDate,
            assigneeAvatarUrl,
            assigneeName,
            onClickAssignee,
          })}
        </>
      )}
    </div>
  );
}

type TypeMetaProps = {
  type: ActivityType;
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
