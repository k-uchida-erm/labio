import * as React from 'react';
import { ActivityWithTags, ActivityStatus, ActivityType } from '@/features/activity/types';

export type Breadcrumb = {
  label: string;
  title?: string;
  sequenceNumber?: number;
  type?: ActivityType;
};

export type ActivityDetailProps = {
  activity: ActivityWithTags;
  onClose: () => void;
  breadcrumbs: Breadcrumb[];
  labSlug: string;
  projectKey: string;
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
};
