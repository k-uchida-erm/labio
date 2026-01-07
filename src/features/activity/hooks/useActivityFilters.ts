'use client';

import { useMemo } from 'react';
import { ActivityWithTags } from '../types';
import { FilterTag } from '@/components/activity/FilterDropdownMenu';

export function useActivityFilters(
  activities: ActivityWithTags[],
  searchQuery: string,
  filters: FilterTag[],
  projectAssigneeId?: string | null
) {
  const filteredActivities = useMemo(() => {
    const filtered = activities.filter((activity) => {
      // 検索（タイトル or 説明）
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = activity.title.toLowerCase();
        const description = (activity.description ?? '').toLowerCase();
        if (!title.includes(q) && !description.includes(q)) {
          return false;
        }
      }

      // Assignee フィルタ（Project の assignee_id で判定）
      const assigneeFilter = filters.find((f) => f.type === 'assignee');
      if (assigneeFilter && projectAssigneeId) {
        if (projectAssigneeId !== assigneeFilter.value) {
          return false;
        }
      }

      // Status フィルタ
      const statusFilter = filters.find((f) => f.type === 'status');
      if (statusFilter && activity.status !== statusFilter.value) {
        return false;
      }

      // Type フィルタ
      const typeFilter = filters.find((f) => f.type === 'type');
      if (typeFilter && activity.type !== typeFilter.value) {
        return false;
      }

      // Tag フィルタ
      const tagFilter = filters.find((f) => f.type === 'tag');
      if (tagFilter) {
        const activityTags = activity.tags || [];
        const hasTag = activityTags.some((t) => t.id === tagFilter.value);
        if (!hasTag) {
          return false;
        }
      }

      // Due Date フィルタ
      const dueDateFilter = filters.find((f) => f.type === 'due_date');
      if (dueDateFilter && activity.due_date) {
        const dueDate = new Date(activity.due_date);
        const range = dueDateFilter.dateRange;
        if (range?.from && dueDate < range.from) {
          return false;
        }
        if (range?.to && dueDate > range.to) {
          return false;
        }
      }

      // Created Date フィルタ
      const createdDateFilter = filters.find((f) => f.type === 'created_at');
      if (createdDateFilter && activity.created_at) {
        const createdDate = new Date(activity.created_at);
        const range = createdDateFilter.dateRange;
        if (range?.from && createdDate < range.from) {
          return false;
        }
        if (range?.to && createdDate > range.to) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }, [activities, searchQuery, filters, projectAssigneeId]);

  return { filteredActivities };
}
