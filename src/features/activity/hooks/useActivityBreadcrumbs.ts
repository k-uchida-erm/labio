'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, ActivityWithTags } from '../types';
import { Tables } from '@/types/database.types';

export function useActivityBreadcrumbs(
  labId: string | undefined,
  projectId: string | undefined,
  projectKey: string | undefined,
  projectTitle: string | undefined,
  activity: ActivityWithTags | null
) {
  const [parentChain, setParentChain] = useState<ActivityWithTags[]>([]);

  useEffect(() => {
    const fetchParentChain = async () => {
      if (!labId || !projectId || !activity || !activity.parent_id) {
        setParentChain([]);
        return;
      }

      const supabase = createClient();
      const chain: ActivityWithTags[] = [];
      let currentParentId: string | null = activity.parent_id;

      while (currentParentId) {
        try {
          const { data, error: fetchError } = await supabase
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
            .eq('id', currentParentId)
            .is('deleted_at', null)
            .single();

          if (fetchError) throw fetchError;
          if (!data) break;

          // tags を平坦化して activities に追加
          type ActivityWithActivityTags = Activity & {
            activity_tags: Array<{
              tag: Pick<Tables<'tags'>, 'id' | 'name' | 'color'>;
            }> | null;
          };

          const activityData = data as ActivityWithActivityTags;

          // assignee情報を取得
          let assignee = null;
          if (activityData.assignee_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .eq('id', activityData.assignee_id)
              .single();
            assignee = profileData;
          }

          const activityWithTags: ActivityWithTags = {
            ...activityData,
            tags: activityData.activity_tags?.map((at) => at.tag) || [],
            assignee,
          };

          chain.push(activityWithTags);
          currentParentId = activityData.parent_id;
        } catch {
          break;
        }
      }

      // 親から子の順に並べる（Project -> Parent -> ... -> Current）
      setParentChain(chain.reverse());
    };

    fetchParentChain();
  }, [labId, projectId, activity]);

  const breadcrumbs = useMemo(() => {
    const chain: Array<{
      label: string;
      title?: string;
      sequenceNumber?: number;
      type?: ActivityType;
    }> = [{ label: projectKey?.toUpperCase() ?? 'PROJECT', title: projectTitle ?? 'Project' }];

    // 親アクティビティのチェーン
    parentChain.forEach((parent) => {
      chain.push({
        label: `${projectKey?.toUpperCase() ?? 'PROJECT'}-${parent.sequence_number}`,
        title: parent.title,
        sequenceNumber: parent.sequence_number ?? undefined,
        type: parent.type ?? undefined,
      });
    });

    // 現在のアクティビティ
    if (activity) {
      chain.push({
        label: `${projectKey?.toUpperCase() ?? 'PROJECT'}-${activity.sequence_number}`,
        title: activity.title,
        sequenceNumber: activity.sequence_number ?? undefined,
        type: activity.type ?? undefined,
      });
    }

    return chain;
  }, [projectKey, projectTitle, parentChain, activity]);

  return breadcrumbs;
}
