import * as React from 'react';
import { ActivityItem } from './ActivityItem';
import { ActivityStatus as RowStatus, ActivityWithTags } from '@/features/activity/types';

export type ActivityTreeProps = {
  projectKey: string;
  projectLabel?: string;
  parentActivities: ActivityWithTags[];
  visibleActivitiesByParent: Map<string, ActivityWithTags[]>;
  activitiesByParentAll: Map<string, ActivityWithTags[]>;
  expandedActivityIds: Set<string>;
  checkedActivityIds: string[];
  indentEnabled: boolean;
  showKey: boolean;
  onToggleChecked: (id: string, event?: React.MouseEvent) => void;
  onToggleChildren: (id: string) => void;
  onAddSubActivity: (id: string) => void;
  onChangeStatus: (id: string, status: RowStatus) => void;
  onChangeDueDate: (id: string, date: Date | null) => void;
  getCheckboxRef: (id: string) => React.RefObject<HTMLButtonElement | null>;
};

export function ActivityTree({
  projectKey,
  projectLabel,
  parentActivities,
  visibleActivitiesByParent,
  activitiesByParentAll,
  expandedActivityIds,
  checkedActivityIds,
  indentEnabled,
  showKey,
  onToggleChecked,
  onToggleChildren,
  onAddSubActivity,
  onChangeStatus,
  onChangeDueDate,
  getCheckboxRef,
}: ActivityTreeProps) {
  const normalizeStatus = React.useCallback((status: string | null | undefined): RowStatus => {
    if (status === 'in_review') return 'in_progress';
    if (status === 'todo' || status === 'in_progress' || status === 'done') return status;
    return 'todo';
  }, []);

  const renderActivity = React.useMemo(() => {
    const render = (activity: ActivityWithTags, depth: number = 0): React.ReactNode => {
      const displayId = `${projectLabel ?? projectKey}-${activity.sequence_number}`;
      const allChildren = activitiesByParentAll.get(activity.id) || [];
      const visibleChildren = visibleActivitiesByParent.get(activity.id) || [];
      const totalSubtasks = allChildren.length;
      const completedSubtasks = allChildren.filter(
        (a) => normalizeStatus(a.status) === 'done'
      ).length;
      const hasInProgressChild = allChildren.some(
        (a) => normalizeStatus(a.status) === 'in_progress'
      );

      const status: RowStatus =
        totalSubtasks === 0
          ? normalizeStatus(activity.status)
          : completedSubtasks === totalSubtasks
            ? 'done'
            : hasInProgressChild || completedSubtasks > 0
              ? 'in_progress'
              : 'todo';

      const isExpanded = expandedActivityIds.has(activity.id);
      const isSubActivity = depth > 0;
      const showChildren = visibleChildren.length > 0;

      return (
        <div className="flex flex-col" key={activity.id}>
          <ActivityItem
            id={displayId}
            title={activity.title}
            type={activity.type ?? 'task'}
            dueDate={activity.due_date ?? undefined}
            status={status}
            assigneeName={activity.assignee?.display_name || null}
            assigneeAvatarUrl={activity.assignee?.avatar_url || null}
            hasChildren={totalSubtasks > 0}
            checked={checkedActivityIds.includes(activity.id)}
            onToggleChecked={(e) => onToggleChecked(activity.id, e)}
            onToggleChildren={() => onToggleChildren(activity.id)}
            onAddSubActivity={() => onAddSubActivity(activity.id)}
            onChangeStatus={(next) => onChangeStatus(activity.id, next)}
            onChangeDueDate={(dueDate) => onChangeDueDate(activity.id, dueDate)}
            checkboxRef={getCheckboxRef(activity.id)}
            isSubActivity={isSubActivity}
            isExpanded={isExpanded}
            depth={depth}
            showId={showKey}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
          />
          {showChildren && (
            <div
              className={`grid transition-all duration-200 ease-out ${
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              } ${isExpanded ? 'mt-1' : 'mt-0'}`}
            >
              <div
                className={`flex flex-col gap-1 overflow-hidden ${
                  indentEnabled ? 'border-l border-slate-200' : ''
                }`}
                style={indentEnabled ? { marginLeft: 40, borderLeftWidth: 1 } : undefined}
              >
                {visibleChildren.map((subActivity) =>
                  indentEnabled ? render(subActivity, depth + 1) : render(subActivity, 0)
                )}
              </div>
            </div>
          )}
        </div>
      );
    };

    return render;
  }, [
    activitiesByParentAll,
    checkedActivityIds,
    expandedActivityIds,
    getCheckboxRef,
    indentEnabled,
    normalizeStatus,
    onAddSubActivity,
    onChangeDueDate,
    onChangeStatus,
    onToggleChecked,
    onToggleChildren,
    projectKey,
    projectLabel,
    showKey,
    visibleActivitiesByParent,
  ]);

  return (
    <div className="flex flex-col gap-1">{parentActivities.map((a) => renderActivity(a, 0))}</div>
  );
}

export default ActivityTree;
