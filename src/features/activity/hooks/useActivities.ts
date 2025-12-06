'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, ActivityStatus } from '../types';

export function useActivities(projectId: string | undefined) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!projectId) return;

    const supabase = createClient();

    try {
      const { data, error: fetchError } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;
      setActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const updateActivityStatus = useCallback(async (activityId: string, status: ActivityStatus) => {
    const supabase = createClient();

    try {
      const updateData: {
        status: ActivityStatus;
        completed_at?: string | null;
        started_at?: string | null;
      } = { status };

      if (status === 'done') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'in_progress' || status === 'in_review') {
        updateData.started_at = new Date().toISOString();
        updateData.completed_at = null;
      } else {
        updateData.completed_at = null;
      }

      const { error: updateError } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', activityId);

      if (updateError) throw updateError;

      // ローカル状態を更新
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId ? { ...activity, ...updateData } : activity
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update activity'));
      throw err;
    }
  }, []);

  const createActivity = useCallback(
    async (data: {
      lab_id: string;
      project_id: string;
      title: string;
      type?: Activity['type'];
      status?: ActivityStatus;
      due_date?: string;
      created_by: string;
    }) => {
      const supabase = createClient();

      try {
        // 最大positionを取得
        const maxPosition =
          activities.length > 0 ? Math.max(...activities.map((a) => a.position)) : 0;

        const { data: newActivity, error: createError } = await supabase
          .from('activities')
          .insert({
            ...data,
            position: maxPosition + 1,
            sequence_number: 0, // トリガーで自動設定されるため、一時的な値
          })
          .select()
          .single();

        if (createError) throw createError;

        setActivities((prev) => [...prev, newActivity]);
        return newActivity;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create activity'));
        throw err;
      }
    },
    [activities]
  );

  return {
    activities,
    loading,
    error,
    updateActivityStatus,
    createActivity,
    refetch: fetchActivities,
  };
}
