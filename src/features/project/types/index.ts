import { Tables } from '@/types/database.types';

// DBから自動生成された型を使用
export type Project = Tables<'projects'>;
export type Profile = Tables<'profiles'>;

// 拡張型（JOINなどで使用）
export type ProjectWithAssignee = Project & {
  assignee?: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null;
};
