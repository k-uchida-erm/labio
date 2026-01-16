'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ActivityWithTags } from '../types';

export function useActivityBySequence(
  labId: string | undefined,
  projectId: string | undefined,
  sequenceNumber: number | undefined
) {
  const [activity, setActivity] = useState<ActivityWithTags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!labId || !projectId || sequenceNumber === undefined) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        // Activityをsequence_numberで取得（仕様書に従い、lab_id, project_id, sequence_numberで検索）
        const { data: activityData, error: fetchError } = await supabase
          .from('activities')
          .select(
            `
            *,
            activity_tags (
              tag:tags (
                id,
                name,
                color
              )
            )
          `
          )
          .eq('lab_id', labId)
          .eq('project_id', projectId)
          .eq('sequence_number', sequenceNumber)
          .is('deleted_at', null)
          .single();

        if (fetchError) throw fetchError;

        // assignee情報を取得
        let assignee = null;
        if (activityData?.assignee_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', activityData.assignee_id)
            .single();
          assignee = profileData;
        }

        // tagsを平坦化
        type ActivityWithActivityTags = typeof activityData & {
          activity_tags: Array<{
            tag: { id: string; name: string; color: string };
          }> | null;
        };

        const activityWithTags: ActivityWithTags = {
          ...activityData,
          tags: (activityData as ActivityWithActivityTags).activity_tags?.map((at) => at.tag) || [],
          assignee,
        };

        setActivity(activityWithTags);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch activity'));
        setActivity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [labId, projectId, sequenceNumber]);

  return { activity, loading, error };
}
