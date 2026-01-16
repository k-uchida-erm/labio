'use client';

import * as React from 'react';
import { ActivityWithTags, ActivityType, ActivityStatus } from '@/features/activity/types';
import { useActivityBreadcrumbs } from '@/features/activity/hooks/useActivityBreadcrumbs';
import { TaskActivityDetail } from './activity-detail/TaskActivityDetail';
import { ExperimentActivityDetail } from './activity-detail/ExperimentActivityDetail';
import { QuestionActivityDetail } from './activity-detail/QuestionActivityDetail';
import { ReviewActivityDetail } from './activity-detail/ReviewActivityDetail';
import { MeetingActivityDetail } from './activity-detail/MeetingActivityDetail';
import { NoteActivityDetail } from './activity-detail/NoteActivityDetail';

type ActivityDetailSidePanelProps = {
  activity: ActivityWithTags | null;
  onClose: () => void;
  labSlug: string;
  projectKey: string;
  projectTitle?: string;
  labId?: string;
  projectId?: string;
  onUpdateTitle?: (activityId: string, title: string) => Promise<void>;
  onUpdateDescription?: (activityId: string, description: string | null) => Promise<void>;
  status?: ActivityStatus;
  totalSubtasks?: number;
  completedSubtasks?: number;
  hasChildren?: boolean;
  subActivities?: ActivityWithTags[];
  onAddSubActivity?: (parentId: string) => void;
  onCreateSubActivity?: (data: {
    parentId: string;
    title: string;
    type?: ActivityType;
    dueDate?: Date | null;
    assigneeId?: string | null;
    description?: string;
  }) => Promise<void>;
  assignees?: { id: string; name: string; avatarUrl?: string | null }[];
  onChangeSubActivityStatus?: (activityId: string, status: ActivityStatus) => void;
  onChangeSubActivityDueDate?: (activityId: string, date: Date | null) => void;
  onClickSubActivity?: (labSlug: string, projectKey: string, sequenceNumber: number) => void;
  checkedActivityIds?: string[];
  getCheckboxRef?: (id: string) => React.RefObject<HTMLButtonElement | null>;
  onToggleSubActivityChecked?: (id: string, event?: React.MouseEvent) => void;
  activitiesByParentAll?: Map<string, ActivityWithTags[]>;
  visibleActivitiesByParent?: Map<string, ActivityWithTags[]>;
  expandedActivityIds?: Set<string>;
  onToggleChildren?: (activityId: string) => void;
  indentEnabled?: boolean;
  projectLabel?: string;
  maxDepthReachedIds?: Set<string>;
  displayMode?: 'overlay' | 'push';
  className?: string;
  open?: boolean;
};

export function ActivityDetailSidePanel({
  activity,
  onClose,
  labSlug,
  projectKey,
  projectTitle,
  labId,
  projectId,
  onUpdateTitle,
  onUpdateDescription,
  status,
  totalSubtasks,
  completedSubtasks,
  hasChildren,
  subActivities,
  onAddSubActivity,
  onCreateSubActivity,
  assignees,
  onChangeSubActivityStatus,
  onChangeSubActivityDueDate,
  onClickSubActivity,
  checkedActivityIds,
  getCheckboxRef,
  onToggleSubActivityChecked,
  activitiesByParentAll,
  visibleActivitiesByParent,
  expandedActivityIds,
  onToggleChildren,
  indentEnabled,
  projectLabel,
  maxDepthReachedIds,
  displayMode = 'overlay',
  className,
  open = true,
}: ActivityDetailSidePanelProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const breadcrumbs = useActivityBreadcrumbs(labId, projectId, projectKey, projectTitle, activity);

  React.useLayoutEffect(() => {
    setIsVisible(open);
  }, [open]);

  if (!activity) return null;

  const renderActivityDetail = (onClose: () => void) => {
    if (!activity) return null;
    const type: ActivityType = activity.type ?? 'task';
    switch (type) {
      case 'task':
        return (
          <TaskActivityDetail
            activity={activity}
            onClose={onClose}
            breadcrumbs={breadcrumbs}
            labSlug={labSlug}
            projectKey={projectKey}
            onUpdateTitle={onUpdateTitle}
            onUpdateDescription={onUpdateDescription}
            status={status}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
            hasChildren={hasChildren}
            subActivities={subActivities}
            onAddSubActivity={onAddSubActivity}
            onCreateSubActivity={onCreateSubActivity}
            assignees={assignees}
            onChangeSubActivityStatus={onChangeSubActivityStatus}
            onChangeSubActivityDueDate={onChangeSubActivityDueDate}
            onClickSubActivity={onClickSubActivity}
            checkedActivityIds={checkedActivityIds}
            getCheckboxRef={getCheckboxRef}
            onToggleSubActivityChecked={onToggleSubActivityChecked}
            activitiesByParentAll={activitiesByParentAll}
            visibleActivitiesByParent={visibleActivitiesByParent}
            expandedActivityIds={expandedActivityIds}
            onToggleChildren={onToggleChildren}
            indentEnabled={indentEnabled}
            projectLabel={projectLabel}
            maxDepthReachedIds={maxDepthReachedIds}
          />
        );
      case 'experiment':
        return (
          <ExperimentActivityDetail
            activity={activity}
            onClose={onClose}
            breadcrumbs={breadcrumbs}
            labSlug={labSlug}
            projectKey={projectKey}
            onUpdateTitle={onUpdateTitle}
            onUpdateDescription={onUpdateDescription}
            status={status}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
            hasChildren={hasChildren}
            subActivities={subActivities}
            onAddSubActivity={onAddSubActivity}
            onCreateSubActivity={onCreateSubActivity}
            assignees={assignees}
            onChangeSubActivityStatus={onChangeSubActivityStatus}
            onChangeSubActivityDueDate={onChangeSubActivityDueDate}
            onClickSubActivity={onClickSubActivity}
            checkedActivityIds={checkedActivityIds}
            getCheckboxRef={getCheckboxRef}
            onToggleSubActivityChecked={onToggleSubActivityChecked}
            activitiesByParentAll={activitiesByParentAll}
            visibleActivitiesByParent={visibleActivitiesByParent}
            expandedActivityIds={expandedActivityIds}
            onToggleChildren={onToggleChildren}
            indentEnabled={indentEnabled}
            projectLabel={projectLabel}
            maxDepthReachedIds={maxDepthReachedIds}
          />
        );
      case 'question':
        return (
          <QuestionActivityDetail
            activity={activity}
            onClose={onClose}
            breadcrumbs={breadcrumbs}
            labSlug={labSlug}
            projectKey={projectKey}
            onUpdateTitle={onUpdateTitle}
            onUpdateDescription={onUpdateDescription}
            status={status}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
            hasChildren={hasChildren}
            subActivities={subActivities}
            onAddSubActivity={onAddSubActivity}
            onCreateSubActivity={onCreateSubActivity}
            assignees={assignees}
            onChangeSubActivityStatus={onChangeSubActivityStatus}
            onChangeSubActivityDueDate={onChangeSubActivityDueDate}
            onClickSubActivity={onClickSubActivity}
            checkedActivityIds={checkedActivityIds}
            getCheckboxRef={getCheckboxRef}
            onToggleSubActivityChecked={onToggleSubActivityChecked}
            activitiesByParentAll={activitiesByParentAll}
            visibleActivitiesByParent={visibleActivitiesByParent}
            expandedActivityIds={expandedActivityIds}
            onToggleChildren={onToggleChildren}
            indentEnabled={indentEnabled}
            projectLabel={projectLabel}
            maxDepthReachedIds={maxDepthReachedIds}
          />
        );
      case 'review':
        return (
          <ReviewActivityDetail
            activity={activity}
            onClose={onClose}
            breadcrumbs={breadcrumbs}
            labSlug={labSlug}
            projectKey={projectKey}
            onUpdateTitle={onUpdateTitle}
            onUpdateDescription={onUpdateDescription}
            status={status}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
            hasChildren={hasChildren}
            subActivities={subActivities}
            onAddSubActivity={onAddSubActivity}
            onCreateSubActivity={onCreateSubActivity}
            assignees={assignees}
            onChangeSubActivityStatus={onChangeSubActivityStatus}
            onChangeSubActivityDueDate={onChangeSubActivityDueDate}
            onClickSubActivity={onClickSubActivity}
            checkedActivityIds={checkedActivityIds}
            getCheckboxRef={getCheckboxRef}
            onToggleSubActivityChecked={onToggleSubActivityChecked}
            activitiesByParentAll={activitiesByParentAll}
            visibleActivitiesByParent={visibleActivitiesByParent}
            expandedActivityIds={expandedActivityIds}
            onToggleChildren={onToggleChildren}
            indentEnabled={indentEnabled}
            projectLabel={projectLabel}
            maxDepthReachedIds={maxDepthReachedIds}
          />
        );
      case 'meeting':
        return (
          <MeetingActivityDetail
            activity={activity}
            onClose={onClose}
            breadcrumbs={breadcrumbs}
            labSlug={labSlug}
            projectKey={projectKey}
            onUpdateTitle={onUpdateTitle}
            onUpdateDescription={onUpdateDescription}
            status={status}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
            hasChildren={hasChildren}
            subActivities={subActivities}
            onAddSubActivity={onAddSubActivity}
            onCreateSubActivity={onCreateSubActivity}
            assignees={assignees}
            onChangeSubActivityStatus={onChangeSubActivityStatus}
            onChangeSubActivityDueDate={onChangeSubActivityDueDate}
            onClickSubActivity={onClickSubActivity}
            checkedActivityIds={checkedActivityIds}
            getCheckboxRef={getCheckboxRef}
            onToggleSubActivityChecked={onToggleSubActivityChecked}
            activitiesByParentAll={activitiesByParentAll}
            visibleActivitiesByParent={visibleActivitiesByParent}
            expandedActivityIds={expandedActivityIds}
            onToggleChildren={onToggleChildren}
            indentEnabled={indentEnabled}
            projectLabel={projectLabel}
            maxDepthReachedIds={maxDepthReachedIds}
          />
        );
      case 'note':
        return (
          <NoteActivityDetail
            activity={activity}
            onClose={onClose}
            breadcrumbs={breadcrumbs}
            labSlug={labSlug}
            projectKey={projectKey}
            onUpdateTitle={onUpdateTitle}
            onUpdateDescription={onUpdateDescription}
            status={status}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
            hasChildren={hasChildren}
            subActivities={subActivities}
            onAddSubActivity={onAddSubActivity}
            onCreateSubActivity={onCreateSubActivity}
            assignees={assignees}
            onChangeSubActivityStatus={onChangeSubActivityStatus}
            onChangeSubActivityDueDate={onChangeSubActivityDueDate}
            onClickSubActivity={onClickSubActivity}
            checkedActivityIds={checkedActivityIds}
            getCheckboxRef={getCheckboxRef}
            onToggleSubActivityChecked={onToggleSubActivityChecked}
            activitiesByParentAll={activitiesByParentAll}
            visibleActivitiesByParent={visibleActivitiesByParent}
            expandedActivityIds={expandedActivityIds}
            onToggleChildren={onToggleChildren}
            indentEnabled={indentEnabled}
            projectLabel={projectLabel}
            maxDepthReachedIds={maxDepthReachedIds}
          />
        );
      default:
        return (
          <TaskActivityDetail
            activity={activity}
            onClose={onClose}
            breadcrumbs={breadcrumbs}
            labSlug={labSlug}
            projectKey={projectKey}
            onUpdateTitle={onUpdateTitle}
            onUpdateDescription={onUpdateDescription}
            status={status}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
            hasChildren={hasChildren}
            subActivities={subActivities}
            onAddSubActivity={onAddSubActivity}
            onCreateSubActivity={onCreateSubActivity}
            assignees={assignees}
            onChangeSubActivityStatus={onChangeSubActivityStatus}
            onChangeSubActivityDueDate={onChangeSubActivityDueDate}
            onClickSubActivity={onClickSubActivity}
            projectLabel={projectLabel}
            maxDepthReachedIds={maxDepthReachedIds}
          />
        );
    }
  };

  const isPushMode = displayMode === 'push';
  const baseClasses = isPushMode
    ? 'relative z-60 flex h-full w-[min(640px,50vw)] max-w-[min(640px,50vw)] flex-shrink-0 flex-col border-l border-slate-200 bg-white shadow-xl rounded-l-2xl'
    : 'fixed top-0 right-0 z-60 h-full w-full max-w-[50%] rounded-l-xl border-l border-slate-200 bg-white shadow-2xl';
  const visibilityClass = isVisible ? 'translate-x-0' : 'translate-x-full';
  const transitionClass = 'transition-transform duration-300 ease-in-out';

  return (
    <div
      className={`${baseClasses} ${transitionClass} overflow-hidden ${visibilityClass} ${
        className ?? ''
      }`}
    >
      <div className="flex h-full flex-col bg-white">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activity && renderActivityDetail(onClose)}
        </div>
      </div>
    </div>
  );
}
