'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lab, LabMember } from '../types';
import type { PostgrestError } from '@supabase/supabase-js';

type MemberWithProfile = LabMember & {
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

type SupabaseError = PostgrestError | Error;

export type ExtendedError = Error & {
  code?: string;
  details?: string | PostgrestError;
  hint?: string;
};

export function useLab(labSlug: string) {
  const [lab, setLab] = useState<Lab | null>(null);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ExtendedError | null>(null);

  useEffect(() => {
    const fetchLab = async () => {
      const supabase = createClient();

      try {
        // 認証状態を確認
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
          throw new Error('Authentication required. Please log in.');
        }

        // Labを取得（.single()の代わりに配列で取得してから処理）
        const { data: labDataArray, error: labError } = await supabase
          .from('labs')
          .select('*')
          .eq('slug', labSlug)
          .is('deleted_at', null)
          .limit(1);

        if (labError) {
          // エラーの詳細を保持
          const errorMessage = labError.message || 'Failed to fetch lab';
          const errorCode = labError.code || 'UNKNOWN';
          const error: ExtendedError = new Error(
            `${errorMessage} (Code: ${errorCode})`
          ) as ExtendedError;
          error.code = errorCode;
          error.details = labError;
          throw error;
        }

        if (!labDataArray || labDataArray.length === 0) {
          // RLSポリシーでアクセスできない可能性があるため、より詳細なエラーメッセージを提供
          const error: ExtendedError = new Error(
            `Lab with slug "${labSlug}" not found. Please make sure you are a member of this lab.`
          ) as ExtendedError;
          error.code = 'LAB_NOT_FOUND';
          throw error;
        }

        if (labDataArray.length > 1) {
          console.warn(`Multiple labs found with slug "${labSlug}", using first one`);
        }

        setLab(labDataArray[0]);

        // メンバーを取得（profilesは別クエリで取得）
        const { data: membersData, error: membersError } = await supabase
          .from('lab_members')
          .select('*')
          .eq('lab_id', labDataArray[0].id);

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
        // Supabaseエラーの詳細を保持
        let error: ExtendedError;
        if (err && typeof err === 'object' && 'message' in err) {
          const supabaseError = err as SupabaseError;
          error = new Error(
            'message' in supabaseError ? supabaseError.message : 'Failed to fetch lab'
          ) as ExtendedError;
          if ('code' in supabaseError && supabaseError.code) {
            error.code = supabaseError.code;
          }
          if ('details' in supabaseError && supabaseError.details) {
            error.details = supabaseError.details;
          }
          if ('hint' in supabaseError && supabaseError.hint) {
            error.hint = supabaseError.hint;
          }
        } else {
          error = (err instanceof Error ? err : new Error('Failed to fetch lab')) as ExtendedError;
        }
        setError(error);
        console.error('useLab error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: err,
        });
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
