import { useState, useCallback } from 'react';
import { ActivityStatus as DbActivityStatus, ActivityWithTags } from '../types';

export type CascadeState = {
  ids: string[];
  titles: string[];
} | null;

export type UseActivityStatusActionsArgs = {
  activities: ActivityWithTags[];
  activitiesByParentAll: Map<string, ActivityWithTags[]>;
  updateActivityStatus: (id: string, status: DbActivityStatus) => Promise<void>;
  markActivityAndDescendantsDone: (ids: string[]) => Promise<void>;
};

export function useActivityStatusActions({
  activities,
  activitiesByParentAll,
  updateActivityStatus,
  markActivityAndDescendantsDone,
}: UseActivityStatusActionsArgs) {
  const [cascadeState, setCascadeState] = useState<CascadeState>(null);
  const [cascadePending, setCascadePending] = useState(false);
  const [cascadeError, setCascadeError] = useState<string | null>(null);

  const normalizeRowStatus = useCallback((status: string | null | undefined): DbActivityStatus => {
    if (status === 'in_review') return 'in_progress';
    if (status === 'todo' || status === 'in_progress' || status === 'done') return status;
    return 'todo';
  }, []);

  const getDescendants = useCallback(
    (rootId: string) => {
      const descendants: ActivityWithTags[] = [];
      const stack = [...(activitiesByParentAll.get(rootId) ?? [])];

      while (stack.length > 0) {
        const node = stack.pop();
        if (!node) continue;
        descendants.push(node);
        const children = activitiesByParentAll.get(node.id) ?? [];
        for (const child of children) stack.push(child);
      }

      return descendants;
    },
    [activitiesByParentAll]
  );

  const changeStatus = useCallback(
    async (activityId: string, next: DbActivityStatus) => {
      const target = activities.find((a) => a.id === activityId);
      if (!target) return;

      const directChildren = activitiesByParentAll.get(activityId) ?? [];
      const hasChildren = directChildren.length > 0;

      // 親のstatusは子で決まるため、親に対しては Done のみ許可（＝配下をDoneにする）
      if (hasChildren && next !== 'done') return;

      if (next === 'done' && hasChildren) {
        const descendants = getDescendants(activityId);
        const descendantsToChange = descendants.filter(
          (a) => normalizeRowStatus(a.status) !== 'done'
        );

        // 子が全部doneじゃない場合のみ確認モーダル（親だけdoneにする場合は不要）
        if (descendantsToChange.length > 0) {
          const willChange = [target, ...descendantsToChange].filter(
            (a) => normalizeRowStatus(a.status) !== 'done'
          );

          setCascadeError(null);
          setCascadeState({
            ids: willChange.map((a) => a.id),
            titles: willChange.map((a) => a.title),
          });
          return;
        }
      }

      await updateActivityStatus(activityId, next);
    },
    [activities, activitiesByParentAll, getDescendants, normalizeRowStatus, updateActivityStatus]
  );

  const confirmCascade = useCallback(async () => {
    if (!cascadeState) return;
    try {
      setCascadePending(true);
      setCascadeError(null);
      await markActivityAndDescendantsDone(cascadeState.ids);
      setCascadeState(null);
    } catch (err) {
      setCascadeError(err instanceof Error ? err.message : 'Failed to update activities');
    } finally {
      setCascadePending(false);
    }
  }, [cascadeState, markActivityAndDescendantsDone]);

  return {
    cascadeState,
    cascadePending,
    cascadeError,
    setCascadeState,
    changeStatus,
    confirmCascade,
  };
}

export default useActivityStatusActions;
