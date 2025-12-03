import { Tables } from '@/types/database.types';

// DBから自動生成された型を使用
export type Lab = Tables<'labs'>;
export type LabMember = Tables<'lab_members'>;
export type Profile = Tables<'profiles'>;

// 拡張型（JOINなどで使用）
export type LabWithMembers = Lab & {
  members: (LabMember & {
    profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;
  })[];
};

export type MemberWithProfile = LabMember & {
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null;
};
