'use client';

import * as React from 'react';
import { ActivityWithTags, ActivityStatus, ActivityType } from '@/features/activity/types';
import { ActivityItem } from '../ActivityItem';
import { SubActivityCreationForm } from './SubActivityCreationForm';
import {
  calculateAggregatedStatus,
  normalizeActivityStatus,
} from '@/features/activity/utils/status';
import { CollapseSection } from '@/components/ui/CollapseSection';

type SubActivityItemProps = {
  activity: ActivityWithTags;
  labSlug: string;
  projectKey: string;
  projectLabel?: string;
  depth: number;
  activitiesByParentAll?: Map<string, ActivityWithTags[]>;
  visibleActivitiesByParent?: Map<string, ActivityWithTags[]>;
  expandedActivityIds?: Set<string>;
  checkedActivityIds?: string[];
  checkboxRef?: React.RefObject<HTMLButtonElement | null>;
  getCheckboxRef?: (id: string) => React.RefObject<HTMLButtonElement | null>;
  onToggleChecked?: (id: string, event?: React.MouseEvent) => void;
  onToggleChildren?: (activityId: string) => void;
  onAddSubActivity?: (id: string) => void;
  onCreateSubActivity?: (data: {
    parentId: string;
    title: string;
    type?: ActivityType;
    dueDate?: Date | null;
    assigneeId?: string | null;
    description?: string;
  }) => Promise<void>;
  onChangeStatus?: (activityId: string, status: ActivityStatus) => void;
  onChangeDueDate?: (activityId: string, date: Date | null) => void;
  onClickSubActivity?: (labSlug: string, projectKey: string, sequenceNumber: number) => void;
  indentEnabled?: boolean;
  isCreatingSubActivity?: boolean;
  creatingParentId?: string | null;
  newSubActivityForm?: {
    title: string;
    type: ActivityType;
    dueDate: Date | null;
    assigneeIds: string[];
    description: string;
  };
  setNewSubActivityForm?: React.Dispatch<
    React.SetStateAction<{
      title: string;
      type: ActivityType;
      dueDate: Date | null;
      assigneeIds: string[];
      description: string;
    }>
  >;
  newSubActivityInputRef?: React.RefObject<HTMLInputElement | null>;
  newSubActivityTextareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  handleCreateSubActivity?: () => Promise<void>;
  handleCancelCreateSubActivity?: () => void;
  handleNewSubActivityKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  assignees?: { id: string; name: string; avatarUrl?: string | null }[];
  maxDepthReachedIds?: Set<string>;
  activeActivityId?: string | null;
};

export function SubActivityItem({
  activity,
  labSlug,
  projectKey,
  projectLabel,
  depth,
  activitiesByParentAll,
  visibleActivitiesByParent,
  expandedActivityIds,
  checkedActivityIds = [],
  checkboxRef,
  getCheckboxRef,
  onToggleChecked,
  onToggleChildren,
  onAddSubActivity,
  onCreateSubActivity,
  onChangeStatus,
  onChangeDueDate,
  onClickSubActivity,
  indentEnabled = true,
  isCreatingSubActivity = false,
  creatingParentId = null,
  newSubActivityForm,
  setNewSubActivityForm,
  newSubActivityInputRef,
  newSubActivityTextareaRef,
  handleCreateSubActivity,
  handleCancelCreateSubActivity,
  handleNewSubActivityKeyDown,
  assignees,
  maxDepthReachedIds,
  activeActivityId,
}: SubActivityItemProps) {
  const displayId = `${projectLabel ?? projectKey}-${activity.sequence_number}`;
  // 子アクティビティを取得（ActivityTreeと同じロジック）
  const allChildren = activitiesByParentAll?.get(activity.id) || [];
  const visibleChildren = React.useMemo(
    () => visibleActivitiesByParent?.get(activity.id) || [],
    [visibleActivitiesByParent, activity.id]
  );
  const totalSubtasks = allChildren.length;
  const completedSubtasks = allChildren.filter(
    (a) => normalizeActivityStatus(a.status) === 'done'
  ).length;

  const calculatedStatus = calculateAggregatedStatus(
    activity.status,
    allChildren.map((child) => child.status)
  ) as ActivityStatus;

  const isExpanded = expandedActivityIds?.has(activity.id) ?? false;
  const hasChildren = totalSubtasks > 0;
  const isSubActivity = depth > 0;
  const showChildren = visibleChildren.length > 0;
  const hasVisibleChildren = visibleChildren.length > 0;
  const isAtMaxDepth = maxDepthReachedIds?.has(activity.id) ?? false;
  const showCreationForm = isCreatingSubActivity && creatingParentId === activity.id;
  const childSectionOpen = isExpanded || showCreationForm;

  // すべての子アクティビティのcheckboxRefを事前に計算
  const childCheckboxRefs = React.useMemo(() => {
    const refs = new Map<string, React.RefObject<HTMLButtonElement | null> | undefined>();
    visibleChildren.forEach((child) => {
      refs.set(child.id, getCheckboxRef ? getCheckboxRef(child.id) : undefined);
    });
    return refs;
  }, [getCheckboxRef, visibleChildren]);

  return (
    <div className="flex flex-col" key={activity.id}>
      <ActivityItem
        id={displayId}
        title={activity.title}
        type={activity.type ?? 'task'}
        dueDate={activity.due_date ?? undefined}
        status={calculatedStatus}
        assigneeName={activity.assignee?.display_name || null}
        assigneeAvatarUrl={activity.assignee?.avatar_url || null}
        hasChildren={hasChildren}
        showChildToggle={hasVisibleChildren}
        checked={checkedActivityIds.includes(activity.id)}
        onToggleChecked={onToggleChecked ? (e) => onToggleChecked(activity.id, e) : undefined}
        onToggleChildren={
          onToggleChildren && hasVisibleChildren ? () => onToggleChildren(activity.id) : undefined
        }
        onAddSubActivity={
          onAddSubActivity && !isAtMaxDepth
            ? () => {
                if (onToggleChildren && !isExpanded) {
                  onToggleChildren(activity.id);
                }
                onAddSubActivity(activity.id);
              }
            : undefined
        }
        onChangeStatus={onChangeStatus ? (next) => onChangeStatus(activity.id, next) : undefined}
        onChangeDueDate={onChangeDueDate ? (date) => onChangeDueDate(activity.id, date) : undefined}
        onClickActivity={
          onClickSubActivity && activity.sequence_number
            ? () => onClickSubActivity(labSlug, projectKey, activity.sequence_number!)
            : undefined
        }
        checkboxRef={checkboxRef}
        isSubActivity={isSubActivity}
        isExpanded={isExpanded}
        depth={depth}
        showId={true}
        totalSubtasks={totalSubtasks}
        completedSubtasks={completedSubtasks}
        canAddSubActivity={!isAtMaxDepth}
        compactMeta={true}
        onOpenDetails={
          onClickSubActivity && activity.sequence_number
            ? () => onClickSubActivity(labSlug, projectKey, activity.sequence_number!)
            : undefined
        }
        isActive={activeActivityId === activity.id}
      />
      {(showChildren || showCreationForm) && (
        <CollapseSection
          open={childSectionOpen}
          expandedMarginTop="0.25rem"
          collapsedMarginTop={0}
          contentClassName={`flex flex-col gap-1 overflow-hidden ${
            indentEnabled ? 'border-l border-slate-200' : ''
          }`}
          contentStyle={indentEnabled ? { marginLeft: 24, borderLeftWidth: 1 } : undefined}
        >
          {/* このアクティビティの子を作成する場合のフォーム */}
          {isCreatingSubActivity &&
            creatingParentId === activity.id &&
            newSubActivityForm &&
            setNewSubActivityForm &&
            newSubActivityInputRef &&
            newSubActivityTextareaRef &&
            handleCreateSubActivity &&
            handleCancelCreateSubActivity &&
            handleNewSubActivityKeyDown && (
              <SubActivityCreationForm
                formData={newSubActivityForm}
                onFormDataChange={setNewSubActivityForm}
                inputRef={newSubActivityInputRef}
                textareaRef={newSubActivityTextareaRef}
                onKeyDown={handleNewSubActivityKeyDown}
                onCreate={handleCreateSubActivity}
                onCancel={handleCancelCreateSubActivity}
                assignees={assignees}
              />
            )}
          {visibleChildren.map((subActivity) => {
            const childCheckboxRef = childCheckboxRefs.get(subActivity.id);
            return indentEnabled ? (
              <SubActivityItem
                key={subActivity.id}
                activity={subActivity}
                labSlug={labSlug}
                projectKey={projectKey}
                projectLabel={projectLabel}
                depth={depth + 1}
                activitiesByParentAll={activitiesByParentAll}
                visibleActivitiesByParent={visibleActivitiesByParent}
                expandedActivityIds={expandedActivityIds}
                checkedActivityIds={checkedActivityIds}
                checkboxRef={childCheckboxRef}
                getCheckboxRef={getCheckboxRef}
                onToggleChecked={onToggleChecked}
                onToggleChildren={onToggleChildren}
                onAddSubActivity={onAddSubActivity}
                onCreateSubActivity={onCreateSubActivity}
                onChangeStatus={onChangeStatus}
                onChangeDueDate={onChangeDueDate}
                onClickSubActivity={onClickSubActivity}
                indentEnabled={indentEnabled}
                isCreatingSubActivity={isCreatingSubActivity}
                creatingParentId={creatingParentId}
                newSubActivityForm={newSubActivityForm}
                setNewSubActivityForm={setNewSubActivityForm}
                newSubActivityInputRef={newSubActivityInputRef}
                newSubActivityTextareaRef={newSubActivityTextareaRef}
                handleCreateSubActivity={handleCreateSubActivity}
                handleCancelCreateSubActivity={handleCancelCreateSubActivity}
                handleNewSubActivityKeyDown={handleNewSubActivityKeyDown}
                assignees={assignees}
                maxDepthReachedIds={maxDepthReachedIds}
                activeActivityId={activeActivityId}
              />
            ) : (
              <SubActivityItem
                key={subActivity.id}
                activity={subActivity}
                labSlug={labSlug}
                projectKey={projectKey}
                projectLabel={projectLabel}
                depth={0}
                activitiesByParentAll={activitiesByParentAll}
                visibleActivitiesByParent={visibleActivitiesByParent}
                expandedActivityIds={expandedActivityIds}
                checkedActivityIds={checkedActivityIds}
                checkboxRef={childCheckboxRef}
                getCheckboxRef={getCheckboxRef}
                onToggleChecked={onToggleChecked}
                onToggleChildren={onToggleChildren}
                onAddSubActivity={onAddSubActivity}
                onCreateSubActivity={onCreateSubActivity}
                onChangeStatus={onChangeStatus}
                onChangeDueDate={onChangeDueDate}
                onClickSubActivity={onClickSubActivity}
                indentEnabled={indentEnabled}
                isCreatingSubActivity={isCreatingSubActivity}
                creatingParentId={creatingParentId}
                newSubActivityForm={newSubActivityForm}
                setNewSubActivityForm={setNewSubActivityForm}
                newSubActivityInputRef={newSubActivityInputRef}
                newSubActivityTextareaRef={newSubActivityTextareaRef}
                handleCreateSubActivity={handleCreateSubActivity}
                handleCancelCreateSubActivity={handleCancelCreateSubActivity}
                handleNewSubActivityKeyDown={handleNewSubActivityKeyDown}
                assignees={assignees}
                maxDepthReachedIds={maxDepthReachedIds}
                activeActivityId={activeActivityId}
              />
            );
          })}
        </CollapseSection>
      )}
    </div>
  );
}
