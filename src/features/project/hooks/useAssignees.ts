import { useMemo, useCallback } from 'react';
import type { Tables } from '@/types/database.types';

type MemberProfile = Pick<Tables<'profiles'>, 'id' | 'display_name' | 'avatar_url'>;
type Member = Tables<'lab_members'> & { profile: MemberProfile | null };

export function useAssignees(members?: Member[], currentUserId?: string | null) {
  const options = useMemo(
    () =>
      members?.map((m) => ({
        id: m.user_id,
        name: m.profile?.display_name ?? 'Member',
        avatarUrl: m.profile?.avatar_url ?? null,
      })) ?? [],
    [members]
  );

  const currentUserName = useMemo(() => {
    const self = members?.find((m) => m.user_id === currentUserId);
    return self?.profile?.display_name ?? 'Me';
  }, [currentUserId, members]);

  const getDefaultAssigneeId = useCallback(() => {
    const self = options.find((o) => o.id === currentUserId)?.id;
    return self ?? options[0]?.id ?? currentUserId ?? null;
  }, [currentUserId, options]);

  return {
    options,
    currentUserName,
    getDefaultAssigneeId,
  };
}

export default useAssignees;
