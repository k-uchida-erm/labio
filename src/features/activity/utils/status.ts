import { ActivityStatus } from '@/features/activity/types';

export type NormalizedStatus = Extract<ActivityStatus, 'todo' | 'in_progress' | 'done'>;

export function normalizeActivityStatus(status: string | null | undefined): NormalizedStatus {
  if (status === 'in_review') return 'in_progress';
  if (status === 'in_progress' || status === 'done') return status;
  return 'todo';
}

export function calculateAggregatedStatus(
  activityStatus: string | null | undefined,
  childStatuses: Array<string | null | undefined>
): NormalizedStatus {
  if (childStatuses.length === 0) {
    return normalizeActivityStatus(activityStatus);
  }

  const normalizedChildren = childStatuses.map((status) => normalizeActivityStatus(status));
  const totalSubtasks = normalizedChildren.length;
  const completedSubtasks = normalizedChildren.filter((status) => status === 'done').length;
  const hasInProgressChild = normalizedChildren.some((status) => status === 'in_progress');

  if (completedSubtasks === totalSubtasks) return 'done';
  if (hasInProgressChild || completedSubtasks > 0) return 'in_progress';
  return 'todo';
}
