import { ActivityWithTags } from '../types';
import { ActivityComparator, sortActivities } from './sort';

export function groupActivitiesByParent(
  activities: ActivityWithTags[],
  comparator: ActivityComparator | null
) {
  const map = new Map<string, ActivityWithTags[]>();

  activities.forEach((activity) => {
    const parentId = activity.parent_id || 'root';
    if (!map.has(parentId)) {
      map.set(parentId, []);
    }
    map.get(parentId)!.push(activity);
  });

  if (comparator) {
    for (const [key, list] of map.entries()) {
      map.set(key, sortActivities(list, comparator));
    }
  }

  return map;
}
