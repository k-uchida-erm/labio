import { createClient } from '@/lib/supabase/client';
import type { Activity, ActivityStatus } from '@/features/activity/types';
import type { TablesInsert } from '@/types/database.types';

export type CreateActivityPayload = {
  lab_id: string;
  project_id: string;
  title: string;
  type?: Activity['type'];
  metadata?: Activity['metadata'];
  status?: ActivityStatus;
  due_date?: string;
  description?: string;
  parent_id?: string;
  assignee_id?: string | null;
  created_by?: string;
};

export async function createActivityRecord(payload: CreateActivityPayload) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const actorId = user.id;

  const { data: membership, error: membershipError } = await supabase
    .from('lab_members')
    .select('lab_id, is_owner')
    .eq('lab_id', payload.lab_id)
    .eq('user_id', actorId)
    .maybeSingle();

  if (membershipError || !membership) {
    throw new Error('You must be a member of this lab to create activities.');
  }

  const insertPayload = {
    ...payload,
    type: payload.type ?? 'task',
    metadata: payload.metadata ?? undefined,
    created_by: payload.created_by ?? actorId,
    status: payload.status ?? 'todo',
  } as TablesInsert<'activities'>;

  const { data: newActivity, error: createError } = await supabase
    .from('activities')
    .insert(insertPayload)
    .select()
    .single();

  if (createError) {
    throw createError;
  }

  return newActivity;
}
