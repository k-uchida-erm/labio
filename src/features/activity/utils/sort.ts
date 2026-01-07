import { SortOption } from '@/components/activity/SortMenu';
import { ActivityWithTags } from '../types';

export type ActivityComparator = (a: ActivityWithTags, b: ActivityWithTags) => number;

export function buildActivityComparator(sortOption: SortOption | null): ActivityComparator | null {
  if (!sortOption) return null;

  return (a, b) => {
    const { field, direction } = sortOption;
    let comparison = 0;

    switch (field) {
      case 'position':
        comparison = (a.position ?? 0) - (b.position ?? 0);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'due_date':
        if (!a.due_date && !b.due_date) comparison = 0;
        else if (!a.due_date) comparison = 1;
        else if (!b.due_date) comparison = -1;
        else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  };
}

export function sortActivities(
  list: ActivityWithTags[],
  comparator: ActivityComparator | null
): ActivityWithTags[] {
  if (!comparator) return list;
  return [...list].sort(comparator);
}
