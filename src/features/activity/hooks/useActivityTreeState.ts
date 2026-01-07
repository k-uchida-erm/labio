import { useMemo, useState } from 'react';
import { ActivityWithTags } from '../types';
import { buildActivityComparator, sortActivities } from '../utils/sort';
import { groupActivitiesByParent } from '../utils/tree';
import { SortOption } from '@/components/activity/SortMenu';

export type TreeState = {
  expandedActivityIds: Set<string>;
  checkedActivityIds: string[];
  indentEnabled: boolean;
  showKey: boolean;
};

export type UseActivityTreeStateArgs = {
  activities: ActivityWithTags[];
  filteredActivities: ActivityWithTags[];
  sortOption: SortOption | null;
};

export function useActivityTreeState({
  activities,
  filteredActivities,
  sortOption,
}: UseActivityTreeStateArgs) {
  const [expandedActivityIds, setExpandedActivityIds] = useState<Set<string>>(new Set());
  const [checkedActivityIds, setCheckedActivityIds] = useState<string[]>([]);
  const [indentEnabled, setIndentEnabled] = useState(true);
  const [showKey, setShowKey] = useState(true);

  const sortComparator = useMemo(() => buildActivityComparator(sortOption), [sortOption]);
  const visibleActivitiesByParent = useMemo(
    () => groupActivitiesByParent(filteredActivities, sortComparator),
    [filteredActivities, sortComparator]
  );
  const activitiesByParentAll = useMemo(
    () => groupActivitiesByParent(activities, sortComparator),
    [activities, sortComparator]
  );
  const parentActivities = useMemo(() => {
    const parents = filteredActivities.filter((activity) => !activity.parent_id);
    return sortActivities(parents, sortComparator);
  }, [filteredActivities, sortComparator]);

  const toggleExpanded = (id: string) => {
    setExpandedActivityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleChecked = (id: string, event?: React.MouseEvent) => {
    setCheckedActivityIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      return next;
    });
    if (event) event.stopPropagation();
  };

  const cancelSelection = () => setCheckedActivityIds([]);

  const expandAll = () => {
    const idsWithChildren = activities
      .filter((a) => (activitiesByParentAll.get(a.id)?.length ?? 0) > 0)
      .map((a) => a.id);
    setExpandedActivityIds(new Set(idsWithChildren));
  };

  const collapseAll = () => setExpandedActivityIds(new Set());

  const hasExpanded = useMemo(() => expandedActivityIds.size > 0, [expandedActivityIds]);

  return {
    expandedActivityIds,
    checkedActivityIds,
    indentEnabled,
    showKey,
    setIndentEnabled,
    setShowKey,
    toggleExpanded,
    toggleChecked,
    cancelSelection,
    expandAll,
    collapseAll,
    hasExpanded,
    visibleActivitiesByParent,
    activitiesByParentAll,
    parentActivities,
  };
}

export default useActivityTreeState;
