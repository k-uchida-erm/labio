-- Ensure activity_status enum exists (idempotent for local resets)
do $$
begin
  create type public.activity_status as enum ('todo', 'in_progress', 'in_review', 'done');
exception
  when duplicate_object then null;
end $$;

-- Activity status change logging (operations + events)
create table if not exists public.activity_status_operations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  actor_id uuid,
  kind text not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists public.activity_status_events (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.activity_status_operations(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  project_id uuid,
  actor_id uuid,
  from_status public.activity_status not null,
  to_status public.activity_status not null,
  reason text not null default 'user', -- user / cascade / derived
  created_at timestamptz not null default now()
);

create index if not exists activity_status_events_operation_id_idx on public.activity_status_events (operation_id);
create index if not exists activity_status_events_activity_id_idx on public.activity_status_events (activity_id);
create index if not exists activity_status_events_project_id_created_at_idx on public.activity_status_events (project_id, created_at desc);
