'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lab, LabMember } from '../types';

type MemberWithProfile = LabMember & {
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function useLab(labSlug: string) {
  const [lab, setLab] = useState<Lab | null>(null);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLab = async () => {
      const supabase = createClient();

      try {
        // Labを取得
        const { data: labData, error: labError } = await supabase
          .from('labs')
          .select('*')
          .eq('slug', labSlug)
          .is('deleted_at', null)
          .single();

        if (labError) throw labError;
        setLab(labData);

        // メンバーを取得（profilesは別クエリで取得）
        const { data: membersData, error: membersError } = await supabase
          .from('lab_members')
          .select('*')
          .eq('lab_id', labData.id);

        if (membersError) throw membersError;

        // プロフィール情報を取得
        if (membersData && membersData.length > 0) {
          const userIds = membersData.map((m) => m.user_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);

          const profileMap = new Map(profilesData?.map((p) => [p.id, p]) || []);

          const membersWithProfiles = membersData.map((m) => ({
            ...m,
            profile: profileMap.get(m.user_id) || null,
          }));

          setMembers(membersWithProfiles);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch lab'));
      } finally {
        setLoading(false);
      }
    };

    if (labSlug) {
      fetchLab();
    }
  }, [labSlug]);

  return { lab, members, loading, error };
}
