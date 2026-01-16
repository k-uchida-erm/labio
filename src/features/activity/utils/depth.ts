import { ActivityWithTags } from '@/features/activity/types';
import { MAX_ACTIVITY_DEPTH_INDEX, MAX_ACTIVITY_LEVELS } from '../constants';

type ActivityNode = Pick<ActivityWithTags, 'id' | 'parent_id'>;

export function buildActivityDepthMap(activities: ActivityNode[]): Map<string, number> {
  const depthMap = new Map<string, number>();
  const byId = new Map<string, ActivityNode>();
  const visiting = new Set<string>();

  activities.forEach((activity) => {
    byId.set(activity.id, activity);
  });

  const computeDepth = (id: string): number => {
    const cached = depthMap.get(id);
    if (cached !== undefined) return cached;

    if (visiting.has(id)) {
      depthMap.set(id, 0);
      return 0;
    }

    visiting.add(id);
    const node = byId.get(id);
    const parentDepth =
      node?.parent_id && byId.has(node.parent_id) ? computeDepth(node.parent_id) + 1 : 0;
    visiting.delete(id);

    depthMap.set(id, parentDepth);
    return parentDepth;
  };

  byId.forEach((_value, id) => {
    computeDepth(id);
  });

  return depthMap;
}

export function canCreateChildAtDepth(
  depthMap: Map<string, number>,
  parentId: string | null | undefined,
  maxLevels: number = MAX_ACTIVITY_LEVELS
): boolean {
  const parentDepth = parentId ? (depthMap.get(parentId) ?? 0) : -1;
  return parentDepth + 1 < maxLevels;
}

export function collectMaxDepthReachedIds(
  depthMap: Map<string, number>,
  maxDepthIndex: number = MAX_ACTIVITY_DEPTH_INDEX
): Set<string> {
  const ids = new Set<string>();
  depthMap.forEach((depth, id) => {
    if (depth >= maxDepthIndex) {
      ids.add(id);
    }
  });
  return ids;
}
