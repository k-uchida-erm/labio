'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, ActivityStatus, ActivityWithTags, Profile } from '../types';
import { Tables } from '@/types/database.types';
import { createActivityRecord } from '@/features/activity/api/createActivity';

type StatusChangeReason = 'user' | 'cascade' | 'derived' | 'undo' | 'redo';

export function useActivities(projectId: string | undefined, actorId?: string | null) {
  const [activities, setActivities] = useState<ActivityWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const activitiesRef = useRef<ActivityWithTags[]>([]);

  const setActivitiesWithRef = useCallback(
    (updater: ActivityWithTags[] | ((prev: ActivityWithTags[]) => ActivityWithTags[])) => {
      setActivities((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        activitiesRef.current = next;
        return next;
      });
    },
    []
  );

  const fetchActivities = useCallback(async () => {
    if (!projectId) {
      setActivitiesWithRef([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // Activities と tags を JOIN して取得
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
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;

      // tags を平坦化して activities に追加
      type ActivityWithActivityTags = Activity & {
        activity_tags: Array<{
          tag: Pick<Tables<'tags'>, 'id' | 'name' | 'color'>;
        }> | null;
      };

      const assigneeIds = Array.from(
        new Set(
          (data || []).map((activity) => activity.assignee_id).filter((id): id is string => !!id)
        )
      );

      let assigneeMap = new Map<string, Pick<Profile, 'id' | 'display_name' | 'avatar_url'>>();
      if (assigneeIds.length > 0) {
        const { data: profilesData, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', assigneeIds);

        if (profileError) throw profileError;
        assigneeMap = new Map(profilesData?.map((profile) => [profile.id, profile]) || []);
      }

      const activitiesWithTags: ActivityWithTags[] = (data || []).map(
        (activity: ActivityWithActivityTags) => ({
          ...activity,
          tags: activity.activity_tags?.map((at) => at.tag) || [],
          assignee: activity.assignee_id ? (assigneeMap.get(activity.assignee_id) ?? null) : null,
        })
      );

      setActivitiesWithRef(activitiesWithTags);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setLoading(false);
    }
  }, [projectId, setActivitiesWithRef]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const normalizeStatus = useCallback((status: ActivityStatus): ActivityStatus => {
    return status === 'in_review' ? 'in_progress' : status;
  }, []);

  const computeStatusDiffs = useCallback(
    (
      before: Map<string, ActivityStatus>,
      after: ActivityWithTags[],
      reasonOverrides?: Map<string, StatusChangeReason>
    ) => {
      const diffs: Array<{
        activityId: string;
        from: ActivityStatus;
        to: ActivityStatus;
        reason: StatusChangeReason;
      }> = [];

      for (const activity of after) {
        const prev = before.get(activity.id);
        const next = normalizeStatus(activity.status);
        if (prev && prev !== next) {
          const reason = reasonOverrides?.get(activity.id) ?? 'derived';
          diffs.push({ activityId: activity.id, from: prev, to: next, reason });
        }
      }
      return diffs;
    },
    [normalizeStatus]
  );

  const logStatusOperation = useCallback(
    async (
      changes: Array<{
        activityId: string;
        from: ActivityStatus;
        to: ActivityStatus;
        reason: StatusChangeReason;
      }>,
      kind: 'manual' | 'cascade' | 'undo' | 'redo'
    ) => {
      if (changes.length === 0) return;

      const supabase = createClient();
      const { data: op, error: opError } = await supabase
        .from('activity_status_operations')
        .insert({
          actor_id: actorId ?? null,
          project_id: projectId ?? null,
          kind,
        })
        .select('id')
        .single();

      if (opError) throw opError;

      const events = changes.map((c) => ({
        operation_id: op.id,
        activity_id: c.activityId,
        project_id: projectId ?? null,
        actor_id: actorId ?? null,
        from_status: c.from,
        to_status: c.to,
        reason: c.reason,
      }));

      const { error: eventsError } = await supabase.from('activity_status_events').insert(events);
      if (eventsError) throw eventsError;
    },
    [actorId, projectId]
  );

  const getUpdateFieldsForStatus = useCallback((status: ActivityStatus, nowIso: string) => {
    const updateData: {
      status: ActivityStatus;
      completed_at?: string | null;
      started_at?: string | null;
    } = { status };

    if (status === 'done') {
      updateData.completed_at = nowIso;
    } else if (status === 'in_progress' || status === 'in_review') {
      updateData.started_at = nowIso;
      updateData.completed_at = null;
    } else {
      updateData.completed_at = null;
    }

    return updateData;
  }, []);

  const recalculateDerivedStatuses = useCallback(
    (baseActivities: ActivityWithTags[]) => {
      const byId = new Map(baseActivities.map((a) => [a.id, a]));
      const childrenByParent = new Map<string, string[]>();

      for (const activity of baseActivities) {
        const parentId = activity.parent_id ?? 'root';
        const list = childrenByParent.get(parentId) ?? [];
        list.push(activity.id);
        childrenByParent.set(parentId, list);
      }

      const depthCache = new Map<string, number>();
      const visiting = new Set<string>();

      const getDepth = (id: string): number => {
        const cached = depthCache.get(id);
        if (cached !== undefined) return cached;

        if (visiting.has(id)) {
          // Cycle detected; treat as root to avoid infinite recursion
          depthCache.set(id, 0);
          return 0;
        }

        visiting.add(id);
        const activity = byId.get(id);
        const depth =
          activity?.parent_id && byId.has(activity.parent_id)
            ? getDepth(activity.parent_id) + 1
            : 0;
        visiting.delete(id);
        depthCache.set(id, depth);
        return depth;
      };

      const idsByDepthDesc = [...byId.keys()].sort((a, b) => getDepth(b) - getDepth(a));
      const nowIso = new Date().toISOString();
      const updates: Array<{
        id: string;
        updateData: ReturnType<typeof getUpdateFieldsForStatus>;
      }> = [];

      // Bottom-up: parents depend only on direct children, so depth desc is enough
      for (const id of idsByDepthDesc) {
        const activity = byId.get(id);
        if (!activity) continue;

        const childIds = childrenByParent.get(id) ?? [];
        if (childIds.length === 0) continue;

        const children = childIds.map((cid) => byId.get(cid)).filter(Boolean) as ActivityWithTags[];
        if (children.length === 0) continue;

        const normalizedChildStatuses = children.map((c) => normalizeStatus(c.status));
        const doneCount = normalizedChildStatuses.filter((s) => s === 'done').length;
        const anyInProgress = normalizedChildStatuses.some((s) => s === 'in_progress');

        const derivedStatus: ActivityStatus =
          doneCount === children.length
            ? 'done'
            : anyInProgress || doneCount > 0
              ? 'in_progress'
              : 'todo';

        const currentNormalized = normalizeStatus(activity.status);
        if (currentNormalized === derivedStatus) continue;

        const updateData = getUpdateFieldsForStatus(derivedStatus, nowIso);
        byId.set(id, { ...activity, ...updateData });
        updates.push({ id, updateData });
      }

      const nextActivities = baseActivities.map((a) => byId.get(a.id) ?? a);
      return { nextActivities, updates };
    },
    [getUpdateFieldsForStatus, normalizeStatus]
  );

  const persistDerivedStatusUpdates = useCallback(
    async (updates: Array<{ id: string; updateData: { status: ActivityStatus } }>) => {
      if (updates.length === 0) return;

      const nowIso = new Date().toISOString();
      const doneIds: string[] = [];
      const inProgressIds: string[] = [];
      const todoIds: string[] = [];

      for (const { id, updateData } of updates) {
        const status = updateData.status;
        if (status === 'done') doneIds.push(id);
        else if (status === 'in_progress' || status === 'in_review') inProgressIds.push(id);
        else todoIds.push(id);
      }

      const supabase = createClient();

      if (doneIds.length > 0) {
        const { error } = await supabase
          .from('activities')
          .update({ status: 'done', completed_at: nowIso })
          .in('id', doneIds);
        if (error) throw error;
      }

      if (inProgressIds.length > 0) {
        const { error } = await supabase
          .from('activities')
          .update({ status: 'in_progress', started_at: nowIso, completed_at: null })
          .in('id', inProgressIds);
        if (error) throw error;
      }

      if (todoIds.length > 0) {
        const { error } = await supabase
          .from('activities')
          .update({ status: 'todo', completed_at: null })
          .in('id', todoIds);
        if (error) throw error;
      }
    },
    []
  );

  const recalculateAndPersistAllDerivedStatuses = useCallback(async () => {
    const base = activitiesRef.current;
    if (base.length === 0) return;

    const { nextActivities, updates } = recalculateDerivedStatuses(base);
    if (updates.length === 0) return;

    // 楽観的にローカルへ反映（表示は常に即時で揃える）
    setActivitiesWithRef(nextActivities);

    try {
      await persistDerivedStatusUpdates(updates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update derived statuses'));
      // DB書き込みに失敗しても、UIは子から派生計算で正しく表示したいのでロールバックはしない
    }
  }, [persistDerivedStatusUpdates, recalculateDerivedStatuses, setActivitiesWithRef]);

  const updateActivityStatus = useCallback(
    async (activityId: string, status: ActivityStatus) => {
      const snapshot = activitiesRef.current;
      const beforeStatuses = new Map(snapshot.map((a) => [a.id, normalizeStatus(a.status)]));

      try {
        const supabase = createClient();

        const nowIso = new Date().toISOString();
        const updateData = getUpdateFieldsForStatus(status, nowIso);

        // 楽観的にローカル状態を更新
        setActivitiesWithRef((prev) =>
          prev.map((activity) =>
            activity.id === activityId ? { ...activity, ...updateData } : activity
          )
        );

        const { error: updateError } = await supabase
          .from('activities')
          .update(updateData)
          .eq('id', activityId);

        if (updateError) throw updateError;

        // 子→親→さらに親…まで派生statusを再計算してDB/ローカルに反映
        await recalculateAndPersistAllDerivedStatuses();

        // 変更差分をログ化
        const after = activitiesRef.current;
        const reasonOverrides = new Map<string, StatusChangeReason>([[activityId, 'user']]);
        const diffs = computeStatusDiffs(beforeStatuses, after, reasonOverrides);
        if (diffs.length > 0) {
          await logStatusOperation(diffs, 'manual');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update activity'));
        // 失敗したら対象分だけロールバック（他の更新を潰さない）
        setActivitiesWithRef(snapshot);
        throw err;
      }
    },
    [
      computeStatusDiffs,
      getUpdateFieldsForStatus,
      logStatusOperation,
      normalizeStatus,
      recalculateAndPersistAllDerivedStatuses,
      setActivitiesWithRef,
    ]
  );

  const markActivityAndDescendantsDone = useCallback(
    async (activityIds: string[]) => {
      const uniqueIds = Array.from(new Set(activityIds));
      if (uniqueIds.length === 0) return;

      const snapshot = activitiesRef.current;
      const beforeStatuses = new Map(snapshot.map((a) => [a.id, normalizeStatus(a.status)]));

      const completedAt = new Date().toISOString();
      const updateData: {
        status: ActivityStatus;
        completed_at: string;
        started_at?: string | null;
      } = {
        status: 'done',
        completed_at: completedAt,
      };

      // 楽観的更新
      setActivitiesWithRef((prev) =>
        prev.map((activity) =>
          uniqueIds.includes(activity.id) ? { ...activity, ...updateData } : activity
        )
      );

      try {
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from('activities')
          .update(updateData)
          .in('id', uniqueIds);

        if (updateError) throw updateError;

        // 子→親→さらに親…まで派生statusを再計算してDB/ローカルに反映
        await recalculateAndPersistAllDerivedStatuses();

        // 変更差分をログ化（直接の対象は cascade 理由、それ以外は derived）
        const after = activitiesRef.current;
        const reasonOverrides = new Map<string, StatusChangeReason>();
        uniqueIds.forEach((id) => reasonOverrides.set(id, 'cascade'));
        const diffs = computeStatusDiffs(beforeStatuses, after, reasonOverrides);
        if (diffs.length > 0) {
          await logStatusOperation(diffs, 'cascade');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update activities'));
        // 対象分だけロールバック
        setActivitiesWithRef(snapshot);
        throw err;
      }
    },
    [
      computeStatusDiffs,
      logStatusOperation,
      normalizeStatus,
      recalculateAndPersistAllDerivedStatuses,
      setActivitiesWithRef,
    ]
  );

  const updateActivityDueDate = useCallback(
    async (activityId: string, dueDate: Date | null) => {
      const supabase = createClient();

      try {
        const updateData = {
          due_date: dueDate ? dueDate.toISOString() : null,
        };

        const { error: updateError } = await supabase
          .from('activities')
          .update(updateData)
          .eq('id', activityId);

        if (updateError) throw updateError;

        // ローカル状態を更新
        setActivitiesWithRef((prev) =>
          prev.map((activity) =>
            activity.id === activityId ? { ...activity, ...updateData } : activity
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update activity due date'));
        throw err;
      }
    },
    [setActivitiesWithRef, setError]
  );

  const createActivity = useCallback(
    async (data: {
      lab_id: string;
      project_id: string;
      title: string;
      type?: Activity['type'];
      status?: ActivityStatus;
      due_date?: string;
      created_by?: string;
      parent_id?: string;
      description?: string;
      assignee_id?: string | null;
    }) => {
      try {
        setError(null);
        const newActivity = await createActivityRecord(data);
        setActivitiesWithRef((prev) => [...prev, newActivity]);
        return newActivity;
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? (err as Error).message
            : 'Failed to create activity';
        setError(new Error(message));
        throw err;
      }
    },
    [setActivitiesWithRef]
  );

  return {
    activities,
    loading,
    error,
    updateActivityStatus,
    markActivityAndDescendantsDone,
    updateActivityDueDate,
    createActivity,
    refetch: fetchActivities,
    undoLastStatusChange: useCallback(async () => {
      if (!actorId) return;

      const supabase = createClient();
      const snapshot = activitiesRef.current;
      if (snapshot.length === 0) return;

      const { data: op, error: opError } = await supabase
        .from('activity_status_operations')
        .select('id, created_at, kind')
        .eq('actor_id', actorId)
        .is('undone_at', null)
        .neq('kind', 'undo')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (opError) {
        setError(opError instanceof Error ? opError : new Error('Failed to fetch last operation'));
        return;
      }
      if (!op) return;

      const { data: events, error: eventsError } = await supabase
        .from('activity_status_events')
        .select('activity_id, from_status, to_status, reason')
        .eq('operation_id', op.id);

      if (eventsError) {
        setError(eventsError instanceof Error ? eventsError : new Error('Failed to fetch events'));
        return;
      }
      if (!events || events.length === 0) return;

      const beforeStatuses = new Map(snapshot.map((a) => [a.id, normalizeStatus(a.status)]));

      // 楽観的に巻き戻し
      const nowIso = new Date().toISOString();
      const revertByStatus: Record<ActivityStatus, string[]> = {
        todo: [],
        in_progress: [],
        in_review: [],
        done: [],
      };
      events.forEach((e) => revertByStatus[e.from_status]?.push(e.activity_id));

      const targetIds = new Set(events.map((e) => e.activity_id));
      setActivitiesWithRef((prev) =>
        prev.map((activity) => {
          if (!targetIds.has(activity.id)) return activity;
          const ev = events.find((e) => e.activity_id === activity.id);
          if (!ev) return activity;
          const updateData = getUpdateFieldsForStatus(ev.from_status as ActivityStatus, nowIso);
          return { ...activity, ...updateData };
        })
      );

      try {
        // 実DBに反映（ステータスごとにまとめて更新）
        if (revertByStatus.done.length > 0) {
          const { error } = await supabase
            .from('activities')
            .update({ status: 'done', completed_at: nowIso })
            .in('id', revertByStatus.done);
          if (error) throw error;
        }
        const inProgressIds = [...revertByStatus.in_progress, ...revertByStatus.in_review];
        if (inProgressIds.length > 0) {
          const { error } = await supabase
            .from('activities')
            .update({ status: 'in_progress', started_at: nowIso, completed_at: null })
            .in('id', inProgressIds);
          if (error) throw error;
        }
        if (revertByStatus.todo.length > 0) {
          const { error } = await supabase
            .from('activities')
            .update({ status: 'todo', completed_at: null })
            .in('id', revertByStatus.todo);
          if (error) throw error;
        }

        // 派生statusを再計算
        await recalculateAndPersistAllDerivedStatuses();

        // 元のoperationを無効化（多段Undo用）
        const undoneAt = new Date().toISOString();
        const { error: markError } = await supabase
          .from('activity_status_operations')
          .update({ undone_at: undoneAt, undone_by: actorId ?? null })
          .eq('id', op.id);
        if (markError) throw markError;

        // ログとしてUndo操作を記録
        const after = activitiesRef.current;
        const reasonOverrides = new Map<string, StatusChangeReason>();
        events.forEach((e) => reasonOverrides.set(e.activity_id, 'undo'));
        const diffs = computeStatusDiffs(beforeStatuses, after, reasonOverrides);
        if (diffs.length > 0) {
          await logStatusOperation(diffs, 'undo');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to undo status change'));
        // ロールバック
        setActivitiesWithRef(snapshot);
        throw err;
      }
    }, [
      actorId,
      computeStatusDiffs,
      getUpdateFieldsForStatus,
      logStatusOperation,
      normalizeStatus,
      recalculateAndPersistAllDerivedStatuses,
      setActivitiesWithRef,
    ]),
    redoLastStatusChange: useCallback(async () => {
      if (!actorId) return;

      const supabase = createClient();
      const snapshot = activitiesRef.current;
      if (snapshot.length === 0) return;

      const { data: op, error: opError } = await supabase
        .from('activity_status_operations')
        .select('id, created_at, kind')
        .eq('actor_id', actorId)
        .not('undone_at', 'is', null)
        .neq('kind', 'redo')
        .order('undone_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (opError) {
        setError(opError instanceof Error ? opError : new Error('Failed to fetch last undone op'));
        return;
      }
      if (!op) return;

      const { data: events, error: eventsError } = await supabase
        .from('activity_status_events')
        .select('activity_id, from_status, to_status, reason')
        .eq('operation_id', op.id);

      if (eventsError) {
        setError(eventsError instanceof Error ? eventsError : new Error('Failed to fetch events'));
        return;
      }
      if (!events || events.length === 0) return;

      const beforeStatuses = new Map(snapshot.map((a) => [a.id, normalizeStatus(a.status)]));

      const nowIso = new Date().toISOString();
      const applyByStatus: Record<ActivityStatus, string[]> = {
        todo: [],
        in_progress: [],
        in_review: [],
        done: [],
      };
      events.forEach((e) => applyByStatus[e.to_status]?.push(e.activity_id));

      const targetIds = new Set(events.map((e) => e.activity_id));
      setActivitiesWithRef((prev) =>
        prev.map((activity) => {
          if (!targetIds.has(activity.id)) return activity;
          const ev = events.find((e) => e.activity_id === activity.id);
          if (!ev) return activity;
          const updateData = getUpdateFieldsForStatus(ev.to_status as ActivityStatus, nowIso);
          return { ...activity, ...updateData };
        })
      );

      try {
        if (applyByStatus.done.length > 0) {
          const { error } = await supabase
            .from('activities')
            .update({ status: 'done', completed_at: nowIso })
            .in('id', applyByStatus.done);
          if (error) throw error;
        }
        const inProgressIds = [...applyByStatus.in_progress, ...applyByStatus.in_review];
        if (inProgressIds.length > 0) {
          const { error } = await supabase
            .from('activities')
            .update({ status: 'in_progress', started_at: nowIso, completed_at: null })
            .in('id', inProgressIds);
          if (error) throw error;
        }
        if (applyByStatus.todo.length > 0) {
          const { error } = await supabase
            .from('activities')
            .update({ status: 'todo', completed_at: null })
            .in('id', applyByStatus.todo);
          if (error) throw error;
        }

        // 派生statusを再計算
        await recalculateAndPersistAllDerivedStatuses();

        // 元のoperationのundoフラグを解除
        const { error: clearUndoError } = await supabase
          .from('activity_status_operations')
          .update({ undone_at: null, undone_by: null })
          .eq('id', op.id);
        if (clearUndoError) throw clearUndoError;

        // ログとしてRedo操作を記録
        const after = activitiesRef.current;
        const reasonOverrides = new Map<string, StatusChangeReason>();
        events.forEach((e) => reasonOverrides.set(e.activity_id, 'redo'));
        const diffs = computeStatusDiffs(beforeStatuses, after, reasonOverrides);
        if (diffs.length > 0) {
          await logStatusOperation(diffs, 'redo');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to redo status change'));
        setActivitiesWithRef(snapshot);
        throw err;
      }
    }, [
      actorId,
      computeStatusDiffs,
      getUpdateFieldsForStatus,
      logStatusOperation,
      normalizeStatus,
      recalculateAndPersistAllDerivedStatuses,
      setActivitiesWithRef,
    ]),
  };
}
