'use client';

import * as React from 'react';
import { CaretRight, Plus } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { AvatarInitial } from '@/components/ui/avatar';
import { InlineEditable } from '@/components/ui/InlineEditable';
import { ActivityBreadcrumbs } from '../ActivityBreadcrumbs';
import StatusMenu from '../StatusMenu';
import DueDateMenu from '../DueDateMenu';
import { SubActivityItem } from './SubActivityItem';
import { SubActivityCreationForm } from './SubActivityCreationForm';
import { useSubActivityCreation } from '@/features/activity/hooks/useSubActivityCreation';
import type { ActivityDetailProps } from './types';
import { CollapseSection } from '@/components/ui/CollapseSection';
import { Button } from '@/components/ui/button';

type TaskActivityDetailProps = ActivityDetailProps;

export function TaskActivityDetail({
  activity,
  onClose,
  breadcrumbs,
  labSlug,
  projectKey,
  onUpdateTitle,
  onUpdateDescription,
  status,
  totalSubtasks,
  completedSubtasks,
  hasChildren,
  subActivities = [],
  onCreateSubActivity,
  onChangeSubActivityStatus,
  onChangeSubActivityDueDate,
  onClickSubActivity,
  checkedActivityIds = [],
  getCheckboxRef,
  onToggleSubActivityChecked,
  activitiesByParentAll,
  visibleActivitiesByParent,
  expandedActivityIds,
  onToggleChildren,
  indentEnabled,
  projectLabel,
  assignees,
  maxDepthReachedIds,
}: TaskActivityDetailProps) {
  const dueDate = activity.due_date ? new Date(activity.due_date) : undefined;

  const handleTitleChange = React.useCallback(
    async (newTitle: string) => {
      if (onUpdateTitle && newTitle !== activity.title) {
        await onUpdateTitle(activity.id, newTitle);
      }
    },
    [activity.id, activity.title, onUpdateTitle]
  );

  const handleDescriptionChange = React.useCallback(
    async (newDescription: string) => {
      if (onUpdateDescription && newDescription !== (activity.description || '')) {
        await onUpdateDescription(activity.id, newDescription || null);
      }
    },
    [activity.id, activity.description, onUpdateDescription]
  );

  const [subActivitiesExpanded, setSubActivitiesExpanded] = React.useState(true);

  // サブアクティビティ作成フック
  const {
    isCreatingSubActivity,
    creatingParentId,
    newSubActivityForm,
    setNewSubActivityForm,
    newSubActivityInputRef,
    newSubActivityTextareaRef,
    handleAddSubActivity,
    handleCreateSubActivity,
    handleCancelCreateSubActivity,
    handleNewSubActivityKeyDown,
  } = useSubActivityCreation({
    activityId: activity.id,
    onCreateSubActivity,
  });

  const rootAtMaxDepth = maxDepthReachedIds?.has(activity.id) ?? false;
  const handleCheckedAddSubActivity = React.useCallback(
    (parentId?: string) => {
      const targetId = parentId ?? activity.id;
      if (maxDepthReachedIds?.has(targetId)) {
        return;
      }
      handleAddSubActivity(parentId);
    },
    [activity.id, handleAddSubActivity, maxDepthReachedIds]
  );

  // すべてのサブアクティビティのcheckboxRefを事前に計算
  const subActivityCheckboxRefs = React.useMemo(() => {
    const refs = new Map<string, React.RefObject<HTMLButtonElement | null> | undefined>();
    subActivities.forEach((subActivity) => {
      refs.set(subActivity.id, getCheckboxRef ? getCheckboxRef(subActivity.id) : undefined);
    });
    return refs;
  }, [getCheckboxRef, subActivities]);

  return (
    <div className="flex flex-col gap-3">
      {/* パンくずリストと閉じるボタン */}
      <ActivityBreadcrumbs
        breadcrumbs={breadcrumbs}
        labSlug={labSlug}
        projectKey={projectKey}
        onClose={onClose}
      />

      {/* ヘッダー情報 */}
      <div className="mt-3 flex flex-col gap-2.5">
        {/* Statusとタイトル */}
        <div className="flex items-center gap-2.5 pt-0.5 pb-2">
          <div className="min-w-0 flex-1">
            <InlineEditable
              value={activity.title || ''}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="text-2xl leading-snug font-bold break-words whitespace-normal text-slate-900"
              multiline
            />
          </div>
        </div>

        {/* DueとAssignee */}
        <div className="flex items-center gap-4 pt-0.5 pb-2">
          <div className="flex shrink-0 items-center">
            <StatusMenu
              status={status ?? activity.status ?? 'todo'}
              onChangeStatus={() => {
                // TODO: ステータス変更実装
              }}
              totalSubtasks={totalSubtasks}
              completedSubtasks={completedSubtasks}
              hasChildren={hasChildren}
              iconSize="md"
            />
          </div>
          {dueDate && (
            <DueDateMenu
              dueDate={activity.due_date ?? undefined}
              onChangeDueDate={() => {
                // TODO: 期限変更実装
              }}
              variant="badge"
            />
          )}
          {activity.assignee && (
            <div className="flex items-center gap-2">
              <AvatarInitial
                label={activity.assignee.display_name ?? undefined}
                avatarUrl={activity.assignee.avatar_url ?? undefined}
                size="sm"
              />
              <span className="text-sm text-slate-800">
                {activity.assignee.display_name ?? 'Unknown'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 説明 */}
      <div className="min-h-[2rem] pt-0.5 pb-2">
        <InlineEditable
          value={activity.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Add a description..."
          className="text-sm text-slate-800"
          multiline
        />
      </div>

      {/* サブアクティビティ */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSubActivitiesExpanded(!subActivitiesExpanded)}
              className="flex h-6 w-6 items-center justify-center p-0"
              aria-label={subActivitiesExpanded ? 'Collapse' : 'Expand'}
            >
              <CaretRight
                className={`h-4 w-4 text-slate-600 transition-transform duration-150 ${
                  subActivitiesExpanded ? 'rotate-90' : ''
                }`}
                weight="light"
              />
            </Button>
            <h3 className="text-xs font-semibold text-slate-700">Sub Activities</h3>
            {totalSubtasks !== undefined && totalSubtasks > 0 && (
              <span className="text-xs text-slate-500">
                ({completedSubtasks ?? 0}/{totalSubtasks})
              </span>
            )}
          </div>
          {onCreateSubActivity && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleCheckedAddSubActivity()}
              className="flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={rootAtMaxDepth}
              title={rootAtMaxDepth ? 'Maximum depth reached for this activity' : undefined}
            >
              <Plus size={12} weight="bold" />
              <span>Add activity</span>
            </Button>
          )}
        </div>
        <CollapseSection
          open={subActivitiesExpanded}
          expandedMarginTop="0.25rem"
          collapsedMarginTop={0}
        >
          {subActivities.length > 0 || isCreatingSubActivity ? (
            <div className="flex flex-col gap-1">
              {/* メインアクティビティの子を作成する場合のフォーム（すぐ下に表示） */}
              {isCreatingSubActivity && creatingParentId === activity.id && (
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
              {subActivities.map((subActivity) => {
                const subActivityCheckboxRef = subActivityCheckboxRefs.get(subActivity.id);
                return (
                  <React.Fragment key={subActivity.id}>
                    <SubActivityItem
                      activity={subActivity}
                      labSlug={labSlug}
                      projectKey={projectKey}
                      projectLabel={projectLabel}
                      depth={0}
                      activitiesByParentAll={activitiesByParentAll}
                      visibleActivitiesByParent={visibleActivitiesByParent}
                      expandedActivityIds={expandedActivityIds}
                      checkedActivityIds={checkedActivityIds}
                      checkboxRef={subActivityCheckboxRef}
                      getCheckboxRef={getCheckboxRef}
                      onToggleChecked={onToggleSubActivityChecked}
                      onToggleChildren={onToggleChildren}
                      onAddSubActivity={handleCheckedAddSubActivity}
                      onCreateSubActivity={onCreateSubActivity}
                      onChangeStatus={onChangeSubActivityStatus}
                      onChangeDueDate={onChangeSubActivityDueDate}
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
                      activeActivityId={activity.id}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
              No sub activities yet. Click the + button to add one.
            </div>
          )}
        </CollapseSection>
      </div>

      {/* タグ */}
      {activity.tags && activity.tags.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {activity.tags.map((tag) => (
              <Badge
                key={tag.id}
                tone="custom"
                size="sm"
                className="px-2 py-1"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
