import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ActivityItem } from './ActivityItem';
import { ActivityStatus as RowStatus, ActivityWithTags } from '@/features/activity/types';
import {
  calculateAggregatedStatus,
  normalizeActivityStatus,
} from '@/features/activity/utils/status';
import { CollapseSection } from '@/components/ui/CollapseSection';

export type ActivityTreeProps = {
  projectKey: string;
  projectLabel?: string;
  labSlug: string;
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
  maxDepthReachedIds?: Set<string>;
  compactMeta?: boolean;
  activeActivityId?: string | null;
};

export function ActivityTree({
  projectKey,
  projectLabel,
  labSlug,
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
  maxDepthReachedIds,
  compactMeta = false,
  activeActivityId,
}: ActivityTreeProps) {
  const router = useRouter();
  const renderActivity = React.useMemo(() => {
    const render = (activity: ActivityWithTags, depth: number = 0): React.ReactNode => {
      const displayId = `${projectLabel ?? projectKey}-${activity.sequence_number}`;
      const allChildren = activitiesByParentAll.get(activity.id) || [];
      const visibleChildren = visibleActivitiesByParent.get(activity.id) || [];
      const totalSubtasks = allChildren.length;
      const completedSubtasks = allChildren.filter(
        (a) => normalizeActivityStatus(a.status) === 'done'
      ).length;

      const status = calculateAggregatedStatus(
        activity.status,
        allChildren.map((child) => child.status)
      ) as RowStatus;

      const isExpanded = expandedActivityIds.has(activity.id);
      const isSubActivity = depth > 0;
      const showChildren = visibleChildren.length > 0;
      const hasVisibleChildren = visibleChildren.length > 0;
      const canAddChild = !(maxDepthReachedIds?.has(activity.id) ?? false);

      const handleOpenDetail = () => {
        if (activity.sequence_number) {
          router.push(`/${labSlug}/${projectKey}?activity=${activity.sequence_number}`);
        }
      };

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
            showChildToggle={hasVisibleChildren}
            checked={checkedActivityIds.includes(activity.id)}
            onToggleChecked={(e) => onToggleChecked(activity.id, e)}
            onToggleChildren={hasVisibleChildren ? () => onToggleChildren(activity.id) : undefined}
            onAddSubActivity={() => onAddSubActivity(activity.id)}
            onChangeStatus={(next) => onChangeStatus(activity.id, next)}
            onChangeDueDate={(dueDate) => onChangeDueDate(activity.id, dueDate)}
            canAddSubActivity={canAddChild}
            onClickActivity={handleOpenDetail}
            onOpenDetails={compactMeta ? handleOpenDetail : undefined}
            checkboxRef={getCheckboxRef(activity.id)}
            isSubActivity={isSubActivity}
            isExpanded={isExpanded}
            depth={depth}
            showId={showKey}
            totalSubtasks={totalSubtasks}
            completedSubtasks={completedSubtasks}
            compactMeta={compactMeta}
            isActive={activeActivityId === activity.id}
          />
          {showChildren && (
            <CollapseSection
              open={isExpanded}
              expandedMarginTop="0.25rem"
              collapsedMarginTop={0}
              contentClassName={`flex flex-col gap-1 overflow-hidden ${
                indentEnabled ? 'border-l border-slate-200' : ''
              }`}
              contentStyle={indentEnabled ? { marginLeft: 24, borderLeftWidth: 1 } : undefined}
            >
              {visibleChildren.map((subActivity) =>
                indentEnabled ? render(subActivity, depth + 1) : render(subActivity, 0)
              )}
            </CollapseSection>
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
    labSlug,
    maxDepthReachedIds,
    onAddSubActivity,
    onChangeDueDate,
    onChangeStatus,
    onToggleChecked,
    onToggleChildren,
    projectKey,
    projectLabel,
    router,
    showKey,
    visibleActivitiesByParent,
    compactMeta,
    activeActivityId,
  ]);

  return (
    <div className="flex flex-col gap-1">{parentActivities.map((a) => renderActivity(a, 0))}</div>
  );
}

export default ActivityTree;
