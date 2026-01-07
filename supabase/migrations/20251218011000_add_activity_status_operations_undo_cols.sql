alter table public.activity_status_operations
  add column if not exists undone_at timestamptz,
  add column if not exists undone_by uuid;

create index if not exists activity_status_operations_actor_created_idx
  on public.activity_status_operations (actor_id, created_at desc);
