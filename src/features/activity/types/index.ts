import { Tables, Enums } from '@/types/database.types';

export type Activity = Tables<'activities'>;
export type ActivityMetadata = Tables<'activities'>['metadata'];
export type ActivityStatus = Enums<'activity_status'>;
export type ActivityType = Enums<'activity_type'>;
export type Profile = Tables<'profiles'>;

// 拡張型（JOINなどで使用）
export type ActivityWithAssignee = Activity & {
  assignee?: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null;
};

type TagPreview = Pick<Tables<'tags'>, 'id' | 'name' | 'color'>;

export type ActivityWithTags = Activity & {
  // activity_tags 経由で JOIN された tags
  tags?: TagPreview[];
  assignee?: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null;
};

// UIコンポーネント用の型（DBの型とは別）
export type ActivityDisplayType =
  | 'Task'
  | 'Bug'
  | 'Feature'
  | 'Experiment'
  | 'Question'
  | 'Review'
  | 'Meeting'
  | 'Note';

// DBのactivity_typeをUI表示用に変換
export const activityTypeToDisplay: Record<ActivityType, ActivityDisplayType> = {
  task: 'Task',
  experiment: 'Experiment',
  question: 'Question',
  review: 'Review',
  meeting: 'Meeting',
  note: 'Note',
};

// UI表示用をDBのactivity_typeに変換
export const displayToActivityType: Record<ActivityDisplayType, ActivityType> = {
  Task: 'task',
  Bug: 'task', // BugはTaskとして扱う
  Feature: 'task', // FeatureはTaskとして扱う
  Experiment: 'experiment',
  Question: 'question',
  Review: 'review',
  Meeting: 'meeting',
  Note: 'note',
};
