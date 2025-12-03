-- Migration: Current Schema State
-- Generated: 2024-12-04
-- This migration contains the complete schema state including:
-- - ENUM types
-- - Tables
-- - Indexes
-- - Functions
-- - Triggers
-- - RLS Policies

create type "public"."activity_status" as enum ('todo', 'in_progress', 'in_review', 'done');

create type "public"."activity_type" as enum ('task', 'experiment', 'question', 'review', 'meeting', 'note');

create type "public"."invitation_status" as enum ('pending', 'accepted', 'declined', 'expired');


  create table "public"."activities" (
    "id" uuid not null default gen_random_uuid(),
    "lab_id" uuid not null,
    "project_id" uuid not null,
    "title" text not null,
    "description" text,
    "type" public.activity_type not null default 'task'::public.activity_type,
    "status" public.activity_status not null default 'todo'::public.activity_status,
    "due_date" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "estimated_hours" numeric(5,2),
    "actual_hours" numeric(5,2),
    "position" integer not null default 0,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "sequence_number" integer not null
      );


alter table "public"."activities" enable row level security;


  create table "public"."activity_tags" (
    "id" uuid not null default gen_random_uuid(),
    "activity_id" uuid not null,
    "tag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."activity_tags" enable row level security;


  create table "public"."ai_summaries" (
    "id" uuid not null default gen_random_uuid(),
    "lab_id" uuid not null,
    "project_id" uuid,
    "activity_ids" uuid[] not null,
    "tag_ids" uuid[],
    "date_from" date,
    "date_to" date,
    "title" text not null,
    "content" text not null,
    "marp_content" text,
    "slide_url" text,
    "model" text not null,
    "prompt_tokens" integer,
    "completion_tokens" integer,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."ai_summaries" enable row level security;


  create table "public"."attachments" (
    "id" uuid not null default gen_random_uuid(),
    "activity_id" uuid,
    "comment_id" uuid,
    "file_name" text not null,
    "file_size" integer not null,
    "mime_type" text not null,
    "storage_path" text not null,
    "uploaded_by" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."attachments" enable row level security;


  create table "public"."comments" (
    "id" uuid not null default gen_random_uuid(),
    "activity_id" uuid not null,
    "parent_id" uuid,
    "content" text not null,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
      );


alter table "public"."comments" enable row level security;


  create table "public"."lab_invitations" (
    "id" uuid not null default gen_random_uuid(),
    "lab_id" uuid not null,
    "email" text not null,
    "token" text not null,
    "status" public.invitation_status not null default 'pending'::public.invitation_status,
    "expires_at" timestamp with time zone not null,
    "invited_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "accepted_at" timestamp with time zone,
    "is_owner" boolean not null default false
      );


alter table "public"."lab_invitations" enable row level security;


  create table "public"."lab_members" (
    "id" uuid not null default gen_random_uuid(),
    "lab_id" uuid not null,
    "user_id" uuid not null,
    "joined_at" timestamp with time zone not null default now(),
    "is_owner" boolean not null default false
      );


alter table "public"."lab_members" enable row level security;


  create table "public"."labs" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "slug" text not null,
    "is_personal" boolean not null default false,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
      );


alter table "public"."labs" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "display_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "lab_id" uuid not null,
    "title" text not null,
    "description" text,
    "assignee_id" uuid,
    "is_archived" boolean not null default false,
    "start_date" date,
    "end_date" date,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "key" character varying(5) not null
      );


alter table "public"."projects" enable row level security;


  create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "lab_id" uuid not null,
    "name" character varying(50) not null,
    "color" character varying(7) not null default '#6366f1'::character varying,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."tags" enable row level security;

CREATE UNIQUE INDEX activities_lab_id_project_id_sequence_number_unique ON public.activities USING btree (lab_id, project_id, sequence_number);

CREATE UNIQUE INDEX activities_lab_project_sequence_unique ON public.activities USING btree (lab_id, project_id, sequence_number);

CREATE UNIQUE INDEX activities_pkey ON public.activities USING btree (id);

CREATE UNIQUE INDEX activity_tags_activity_id_tag_id_key ON public.activity_tags USING btree (activity_id, tag_id);

CREATE UNIQUE INDEX activity_tags_pkey ON public.activity_tags USING btree (id);

CREATE UNIQUE INDEX ai_summaries_pkey ON public.ai_summaries USING btree (id);

CREATE UNIQUE INDEX attachments_pkey ON public.attachments USING btree (id);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE INDEX idx_activities_created_by ON public.activities USING btree (created_by);

CREATE INDEX idx_activities_deleted_at ON public.activities USING btree (deleted_at) WHERE (deleted_at IS NULL);

CREATE INDEX idx_activities_due_date ON public.activities USING btree (due_date);

CREATE INDEX idx_activities_lab_id ON public.activities USING btree (lab_id);

CREATE INDEX idx_activities_position ON public.activities USING btree (project_id, status, "position");

CREATE INDEX idx_activities_project_id ON public.activities USING btree (project_id);

CREATE INDEX idx_activities_sequence_number ON public.activities USING btree (project_id, sequence_number);

CREATE INDEX idx_activities_status ON public.activities USING btree (status);

CREATE INDEX idx_activities_type ON public.activities USING btree (type);

CREATE INDEX idx_activity_tags_activity_id ON public.activity_tags USING btree (activity_id);

CREATE INDEX idx_activity_tags_tag_id ON public.activity_tags USING btree (tag_id);

CREATE INDEX idx_ai_summaries_created_at ON public.ai_summaries USING btree (created_at);

CREATE INDEX idx_ai_summaries_created_by ON public.ai_summaries USING btree (created_by);

CREATE INDEX idx_ai_summaries_lab_id ON public.ai_summaries USING btree (lab_id);

CREATE INDEX idx_ai_summaries_project_id ON public.ai_summaries USING btree (project_id);

CREATE INDEX idx_attachments_activity_id ON public.attachments USING btree (activity_id);

CREATE INDEX idx_attachments_comment_id ON public.attachments USING btree (comment_id);

CREATE INDEX idx_attachments_uploaded_by ON public.attachments USING btree (uploaded_by);

CREATE INDEX idx_comments_activity_id ON public.comments USING btree (activity_id);

CREATE INDEX idx_comments_created_by ON public.comments USING btree (created_by);

CREATE INDEX idx_comments_deleted_at ON public.comments USING btree (deleted_at) WHERE (deleted_at IS NULL);

CREATE INDEX idx_comments_parent_id ON public.comments USING btree (parent_id);

CREATE INDEX idx_lab_invitations_email ON public.lab_invitations USING btree (email);

CREATE INDEX idx_lab_invitations_lab_id ON public.lab_invitations USING btree (lab_id);

CREATE INDEX idx_lab_invitations_status ON public.lab_invitations USING btree (status);

CREATE INDEX idx_lab_invitations_token ON public.lab_invitations USING btree (token);

CREATE INDEX idx_lab_members_lab_id ON public.lab_members USING btree (lab_id);

CREATE INDEX idx_lab_members_user_id ON public.lab_members USING btree (user_id);

CREATE INDEX idx_labs_created_by ON public.labs USING btree (created_by);

CREATE INDEX idx_labs_deleted_at ON public.labs USING btree (deleted_at) WHERE (deleted_at IS NULL);

CREATE INDEX idx_labs_slug ON public.labs USING btree (slug);

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);

CREATE INDEX idx_projects_assignee_id ON public.projects USING btree (assignee_id);

CREATE INDEX idx_projects_deleted_at ON public.projects USING btree (deleted_at) WHERE (deleted_at IS NULL);

CREATE INDEX idx_projects_is_archived ON public.projects USING btree (is_archived);

CREATE INDEX idx_projects_key ON public.projects USING btree (lab_id, key);

CREATE INDEX idx_projects_lab_id ON public.projects USING btree (lab_id);

CREATE INDEX idx_tags_lab_id ON public.tags USING btree (lab_id);

CREATE UNIQUE INDEX lab_invitations_pkey ON public.lab_invitations USING btree (id);

CREATE UNIQUE INDEX lab_invitations_token_key ON public.lab_invitations USING btree (token);

CREATE UNIQUE INDEX lab_members_lab_id_user_id_key ON public.lab_members USING btree (lab_id, user_id);

CREATE UNIQUE INDEX lab_members_pkey ON public.lab_members USING btree (id);

CREATE UNIQUE INDEX labs_pkey ON public.labs USING btree (id);

CREATE UNIQUE INDEX labs_slug_key ON public.labs USING btree (slug);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX projects_lab_id_key_unique ON public.projects USING btree (lab_id, key);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX tags_lab_id_name_key ON public.tags USING btree (lab_id, name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."activities" add constraint "activities_pkey" PRIMARY KEY using index "activities_pkey";

alter table "public"."activity_tags" add constraint "activity_tags_pkey" PRIMARY KEY using index "activity_tags_pkey";

alter table "public"."ai_summaries" add constraint "ai_summaries_pkey" PRIMARY KEY using index "ai_summaries_pkey";

alter table "public"."attachments" add constraint "attachments_pkey" PRIMARY KEY using index "attachments_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."lab_invitations" add constraint "lab_invitations_pkey" PRIMARY KEY using index "lab_invitations_pkey";

alter table "public"."lab_members" add constraint "lab_members_pkey" PRIMARY KEY using index "lab_members_pkey";

alter table "public"."labs" add constraint "labs_pkey" PRIMARY KEY using index "labs_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."activities" add constraint "activities_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."activities" validate constraint "activities_created_by_fkey";

alter table "public"."activities" add constraint "activities_lab_id_fkey" FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE not valid;

alter table "public"."activities" validate constraint "activities_lab_id_fkey";

alter table "public"."activities" add constraint "activities_lab_id_project_id_sequence_number_unique" UNIQUE using index "activities_lab_id_project_id_sequence_number_unique";

alter table "public"."activities" add constraint "activities_lab_project_sequence_unique" UNIQUE using index "activities_lab_project_sequence_unique";

alter table "public"."activities" add constraint "activities_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."activities" validate constraint "activities_project_id_fkey";

alter table "public"."activity_tags" add constraint "activity_tags_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE not valid;

alter table "public"."activity_tags" validate constraint "activity_tags_activity_id_fkey";

alter table "public"."activity_tags" add constraint "activity_tags_activity_id_tag_id_key" UNIQUE using index "activity_tags_activity_id_tag_id_key";

alter table "public"."activity_tags" add constraint "activity_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE not valid;

alter table "public"."activity_tags" validate constraint "activity_tags_tag_id_fkey";

alter table "public"."ai_summaries" add constraint "ai_summaries_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."ai_summaries" validate constraint "ai_summaries_created_by_fkey";

alter table "public"."ai_summaries" add constraint "ai_summaries_lab_id_fkey" FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE not valid;

alter table "public"."ai_summaries" validate constraint "ai_summaries_lab_id_fkey";

alter table "public"."ai_summaries" add constraint "ai_summaries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL not valid;

alter table "public"."ai_summaries" validate constraint "ai_summaries_project_id_fkey";

alter table "public"."attachments" add constraint "attachments_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE not valid;

alter table "public"."attachments" validate constraint "attachments_activity_id_fkey";

alter table "public"."attachments" add constraint "attachments_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."attachments" validate constraint "attachments_comment_id_fkey";

alter table "public"."attachments" add constraint "attachments_parent_check" CHECK ((((activity_id IS NOT NULL) AND (comment_id IS NULL)) OR ((activity_id IS NULL) AND (comment_id IS NOT NULL)))) not valid;

alter table "public"."attachments" validate constraint "attachments_parent_check";

alter table "public"."attachments" add constraint "attachments_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) not valid;

alter table "public"."attachments" validate constraint "attachments_uploaded_by_fkey";

alter table "public"."comments" add constraint "comments_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_activity_id_fkey";

alter table "public"."comments" add constraint "comments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."comments" validate constraint "comments_created_by_fkey";

alter table "public"."comments" add constraint "comments_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_parent_id_fkey";

alter table "public"."lab_invitations" add constraint "lab_invitations_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) not valid;

alter table "public"."lab_invitations" validate constraint "lab_invitations_invited_by_fkey";

alter table "public"."lab_invitations" add constraint "lab_invitations_lab_id_fkey" FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE not valid;

alter table "public"."lab_invitations" validate constraint "lab_invitations_lab_id_fkey";

alter table "public"."lab_invitations" add constraint "lab_invitations_token_key" UNIQUE using index "lab_invitations_token_key";

alter table "public"."lab_members" add constraint "lab_members_lab_id_fkey" FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE not valid;

alter table "public"."lab_members" validate constraint "lab_members_lab_id_fkey";

alter table "public"."lab_members" add constraint "lab_members_lab_id_user_id_key" UNIQUE using index "lab_members_lab_id_user_id_key";

alter table "public"."lab_members" add constraint "lab_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."lab_members" validate constraint "lab_members_user_id_fkey";

alter table "public"."labs" add constraint "labs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."labs" validate constraint "labs_created_by_fkey";

alter table "public"."labs" add constraint "labs_slug_key" UNIQUE using index "labs_slug_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."projects" add constraint "projects_assignee_id_fkey" FOREIGN KEY (assignee_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."projects" validate constraint "projects_assignee_id_fkey";

alter table "public"."projects" add constraint "projects_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."projects" validate constraint "projects_created_by_fkey";

alter table "public"."projects" add constraint "projects_lab_id_fkey" FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_lab_id_fkey";

alter table "public"."projects" add constraint "projects_lab_id_key_unique" UNIQUE using index "projects_lab_id_key_unique";

alter table "public"."tags" add constraint "tags_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."tags" validate constraint "tags_created_by_fkey";

alter table "public"."tags" add constraint "tags_lab_id_fkey" FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE not valid;

alter table "public"."tags" validate constraint "tags_lab_id_fkey";

alter table "public"."tags" add constraint "tags_lab_id_name_key" UNIQUE using index "tags_lab_id_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_member_on_invitation_accepted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  invitee_id UUID;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT id INTO invitee_id FROM profiles WHERE email = NEW.email;
    IF invitee_id IS NOT NULL THEN
      INSERT INTO lab_members (lab_id, user_id, is_owner)
      VALUES (NEW.lab_id, invitee_id, NEW.is_owner)
      ON CONFLICT (lab_id, user_id) DO NOTHING;
      NEW.accepted_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_owner_on_lab_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO lab_members (lab_id, user_id, is_owner)
  VALUES (NEW.id, NEW.created_by, TRUE);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_invitation_expiry()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.status = 'pending' AND OLD.expires_at < NOW() THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_invitation_token()
 RETURNS text
 LANGUAGE sql
AS $function$
  SELECT encode(gen_random_bytes(32), 'hex')
$function$
;

CREATE OR REPLACE FUNCTION public.generate_slug(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM labs WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_lab_statistics(target_lab_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'lab_id', target_lab_id,
    'member_count', (SELECT COUNT(*) FROM lab_members WHERE lab_id = target_lab_id),
    'project_count', (SELECT COUNT(*) FROM projects WHERE lab_id = target_lab_id AND deleted_at IS NULL AND is_archived = FALSE),
    'activity_count', (SELECT COUNT(*) FROM activities WHERE lab_id = target_lab_id AND deleted_at IS NULL),
    'completed_activities', (SELECT COUNT(*) FROM activities WHERE lab_id = target_lab_id AND status = 'done' AND deleted_at IS NULL)
  ) INTO result;
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_lab_admin(target_lab_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM lab_members
    WHERE lab_id = target_lab_id
    AND user_id = auth.uid()
    AND is_owner = TRUE
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_lab_member(target_lab_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM lab_members
    WHERE lab_id = target_lab_id
    AND user_id = auth.uid()
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_lab_owner(target_lab_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM lab_members
    WHERE lab_id = target_lab_id
    AND user_id = auth.uid()
    AND is_owner = TRUE
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_project_assignee(target_project_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM projects
    WHERE id = target_project_id
    AND assignee_id = auth.uid()
  )
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_activity_position_on_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  max_position INTEGER;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO max_position
    FROM activities
    WHERE theme_id = NEW.theme_id AND status = NEW.status AND id != NEW.id AND deleted_at IS NULL;
    NEW.position = max_position;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_activity_completed_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_activity_position()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  max_position INTEGER;
BEGIN
  IF NEW.position = 0 OR NEW.position IS NULL THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO max_position
    FROM activities
    WHERE theme_id = NEW.theme_id AND status = NEW.status AND deleted_at IS NULL;
    NEW.position = max_position;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_activity_sequence_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  max_sequence INTEGER;
BEGIN
  -- 同じproject_idのActivityの最大sequence_numberを取得（削除済みを除外）
  SELECT COALESCE(MAX(sequence_number), 0)
  INTO max_sequence
  FROM activities
  WHERE project_id = NEW.project_id
    AND deleted_at IS NULL;
  
  -- 最大値+1を設定（初回は1）
  NEW.sequence_number := max_sequence + 1;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_activity_started_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'in_progress' AND OLD.status = 'todo' AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_lab_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  random_suffix TEXT;
  final_slug TEXT;
BEGIN
  -- Lab名を小文字化、特殊文字をハイフンに置換
  base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- ランダムな4-6桁の文字列を生成（英数字）
  -- 4桁: 36^4 = 1,679,616通り
  -- 5桁: 36^5 = 60,466,176通り
  -- 6桁: 36^6 = 2,176,782,336通り
  random_suffix := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4));
  
  final_slug := base_slug || '-' || random_suffix;
  
  -- 重複チェック（非常に低確率だが念のため）
  WHILE EXISTS (SELECT 1 FROM labs WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    random_suffix := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4));
    final_slug := base_slug || '-' || random_suffix;
  END LOOP;
  
  NEW.slug := final_slug;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.soft_delete_lab_related_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- projects
    UPDATE projects
    SET deleted_at = NOW()
    WHERE lab_id = NEW.id AND deleted_at IS NULL;
    -- activities
    UPDATE activities
    SET deleted_at = NOW()
    WHERE lab_id = NEW.id AND deleted_at IS NULL;
    -- comments
    UPDATE comments
    SET deleted_at = NOW()
    WHERE activity_id IN (
      SELECT id FROM activities WHERE lab_id = NEW.id
    ) AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.soft_delete_project_activities()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE activities
    SET deleted_at = NOW()
    WHERE project_id = NEW.id AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.soft_delete_theme_activities()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE activities SET deleted_at = NOW() WHERE theme_id = NEW.id AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."activities" to "anon";

grant insert on table "public"."activities" to "anon";

grant references on table "public"."activities" to "anon";

grant select on table "public"."activities" to "anon";

grant trigger on table "public"."activities" to "anon";

grant truncate on table "public"."activities" to "anon";

grant update on table "public"."activities" to "anon";

grant delete on table "public"."activities" to "authenticated";

grant insert on table "public"."activities" to "authenticated";

grant references on table "public"."activities" to "authenticated";

grant select on table "public"."activities" to "authenticated";

grant trigger on table "public"."activities" to "authenticated";

grant truncate on table "public"."activities" to "authenticated";

grant update on table "public"."activities" to "authenticated";

grant delete on table "public"."activities" to "service_role";

grant insert on table "public"."activities" to "service_role";

grant references on table "public"."activities" to "service_role";

grant select on table "public"."activities" to "service_role";

grant trigger on table "public"."activities" to "service_role";

grant truncate on table "public"."activities" to "service_role";

grant update on table "public"."activities" to "service_role";

grant delete on table "public"."activity_tags" to "anon";

grant insert on table "public"."activity_tags" to "anon";

grant references on table "public"."activity_tags" to "anon";

grant select on table "public"."activity_tags" to "anon";

grant trigger on table "public"."activity_tags" to "anon";

grant truncate on table "public"."activity_tags" to "anon";

grant update on table "public"."activity_tags" to "anon";

grant delete on table "public"."activity_tags" to "authenticated";

grant insert on table "public"."activity_tags" to "authenticated";

grant references on table "public"."activity_tags" to "authenticated";

grant select on table "public"."activity_tags" to "authenticated";

grant trigger on table "public"."activity_tags" to "authenticated";

grant truncate on table "public"."activity_tags" to "authenticated";

grant update on table "public"."activity_tags" to "authenticated";

grant delete on table "public"."activity_tags" to "service_role";

grant insert on table "public"."activity_tags" to "service_role";

grant references on table "public"."activity_tags" to "service_role";

grant select on table "public"."activity_tags" to "service_role";

grant trigger on table "public"."activity_tags" to "service_role";

grant truncate on table "public"."activity_tags" to "service_role";

grant update on table "public"."activity_tags" to "service_role";

grant delete on table "public"."ai_summaries" to "anon";

grant insert on table "public"."ai_summaries" to "anon";

grant references on table "public"."ai_summaries" to "anon";

grant select on table "public"."ai_summaries" to "anon";

grant trigger on table "public"."ai_summaries" to "anon";

grant truncate on table "public"."ai_summaries" to "anon";

grant update on table "public"."ai_summaries" to "anon";

grant delete on table "public"."ai_summaries" to "authenticated";

grant insert on table "public"."ai_summaries" to "authenticated";

grant references on table "public"."ai_summaries" to "authenticated";

grant select on table "public"."ai_summaries" to "authenticated";

grant trigger on table "public"."ai_summaries" to "authenticated";

grant truncate on table "public"."ai_summaries" to "authenticated";

grant update on table "public"."ai_summaries" to "authenticated";

grant delete on table "public"."ai_summaries" to "service_role";

grant insert on table "public"."ai_summaries" to "service_role";

grant references on table "public"."ai_summaries" to "service_role";

grant select on table "public"."ai_summaries" to "service_role";

grant trigger on table "public"."ai_summaries" to "service_role";

grant truncate on table "public"."ai_summaries" to "service_role";

grant update on table "public"."ai_summaries" to "service_role";

grant delete on table "public"."attachments" to "anon";

grant insert on table "public"."attachments" to "anon";

grant references on table "public"."attachments" to "anon";

grant select on table "public"."attachments" to "anon";

grant trigger on table "public"."attachments" to "anon";

grant truncate on table "public"."attachments" to "anon";

grant update on table "public"."attachments" to "anon";

grant delete on table "public"."attachments" to "authenticated";

grant insert on table "public"."attachments" to "authenticated";

grant references on table "public"."attachments" to "authenticated";

grant select on table "public"."attachments" to "authenticated";

grant trigger on table "public"."attachments" to "authenticated";

grant truncate on table "public"."attachments" to "authenticated";

grant update on table "public"."attachments" to "authenticated";

grant delete on table "public"."attachments" to "service_role";

grant insert on table "public"."attachments" to "service_role";

grant references on table "public"."attachments" to "service_role";

grant select on table "public"."attachments" to "service_role";

grant trigger on table "public"."attachments" to "service_role";

grant truncate on table "public"."attachments" to "service_role";

grant update on table "public"."attachments" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."lab_invitations" to "anon";

grant insert on table "public"."lab_invitations" to "anon";

grant references on table "public"."lab_invitations" to "anon";

grant select on table "public"."lab_invitations" to "anon";

grant trigger on table "public"."lab_invitations" to "anon";

grant truncate on table "public"."lab_invitations" to "anon";

grant update on table "public"."lab_invitations" to "anon";

grant delete on table "public"."lab_invitations" to "authenticated";

grant insert on table "public"."lab_invitations" to "authenticated";

grant references on table "public"."lab_invitations" to "authenticated";

grant select on table "public"."lab_invitations" to "authenticated";

grant trigger on table "public"."lab_invitations" to "authenticated";

grant truncate on table "public"."lab_invitations" to "authenticated";

grant update on table "public"."lab_invitations" to "authenticated";

grant delete on table "public"."lab_invitations" to "service_role";

grant insert on table "public"."lab_invitations" to "service_role";

grant references on table "public"."lab_invitations" to "service_role";

grant select on table "public"."lab_invitations" to "service_role";

grant trigger on table "public"."lab_invitations" to "service_role";

grant truncate on table "public"."lab_invitations" to "service_role";

grant update on table "public"."lab_invitations" to "service_role";

grant delete on table "public"."lab_members" to "anon";

grant insert on table "public"."lab_members" to "anon";

grant references on table "public"."lab_members" to "anon";

grant select on table "public"."lab_members" to "anon";

grant trigger on table "public"."lab_members" to "anon";

grant truncate on table "public"."lab_members" to "anon";

grant update on table "public"."lab_members" to "anon";

grant delete on table "public"."lab_members" to "authenticated";

grant insert on table "public"."lab_members" to "authenticated";

grant references on table "public"."lab_members" to "authenticated";

grant select on table "public"."lab_members" to "authenticated";

grant trigger on table "public"."lab_members" to "authenticated";

grant truncate on table "public"."lab_members" to "authenticated";

grant update on table "public"."lab_members" to "authenticated";

grant delete on table "public"."lab_members" to "service_role";

grant insert on table "public"."lab_members" to "service_role";

grant references on table "public"."lab_members" to "service_role";

grant select on table "public"."lab_members" to "service_role";

grant trigger on table "public"."lab_members" to "service_role";

grant truncate on table "public"."lab_members" to "service_role";

grant update on table "public"."lab_members" to "service_role";

grant delete on table "public"."labs" to "anon";

grant insert on table "public"."labs" to "anon";

grant references on table "public"."labs" to "anon";

grant select on table "public"."labs" to "anon";

grant trigger on table "public"."labs" to "anon";

grant truncate on table "public"."labs" to "anon";

grant update on table "public"."labs" to "anon";

grant delete on table "public"."labs" to "authenticated";

grant insert on table "public"."labs" to "authenticated";

grant references on table "public"."labs" to "authenticated";

grant select on table "public"."labs" to "authenticated";

grant trigger on table "public"."labs" to "authenticated";

grant truncate on table "public"."labs" to "authenticated";

grant update on table "public"."labs" to "authenticated";

grant delete on table "public"."labs" to "service_role";

grant insert on table "public"."labs" to "service_role";

grant references on table "public"."labs" to "service_role";

grant select on table "public"."labs" to "service_role";

grant trigger on table "public"."labs" to "service_role";

grant truncate on table "public"."labs" to "service_role";

grant update on table "public"."labs" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";


  create policy "Admins can delete any activity"
  on "public"."activities"
  as permissive
  for delete
  to public
using (public.is_lab_admin(lab_id));



  create policy "Admins can update any activity"
  on "public"."activities"
  as permissive
  for update
  to public
using (public.is_lab_admin(lab_id))
with check (public.is_lab_admin(lab_id));



  create policy "Creators can delete their activities"
  on "public"."activities"
  as permissive
  for delete
  to public
using ((public.is_lab_member(lab_id) AND (created_by = auth.uid())));



  create policy "Creators can update their activities"
  on "public"."activities"
  as permissive
  for update
  to public
using ((public.is_lab_member(lab_id) AND (created_by = auth.uid())))
with check ((public.is_lab_member(lab_id) AND (created_by = auth.uid())));



  create policy "Members can create activities in their projects"
  on "public"."activities"
  as permissive
  for insert
  to public
with check ((public.is_lab_member(lab_id) AND (created_by = auth.uid()) AND (public.is_lab_admin(lab_id) OR public.is_project_assignee(project_id))));



  create policy "Members can view activities in their lab"
  on "public"."activities"
  as permissive
  for select
  to public
using ((public.is_lab_member(lab_id) AND (deleted_at IS NULL)));



  create policy "Activity editors can add tags"
  on "public"."activity_tags"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = activity_tags.activity_id) AND (public.is_lab_admin(a.lab_id) OR (a.created_by = auth.uid()))))));



  create policy "Activity editors can remove tags"
  on "public"."activity_tags"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = activity_tags.activity_id) AND (public.is_lab_admin(a.lab_id) OR (a.created_by = auth.uid()))))));



  create policy "Members can view activity tags"
  on "public"."activity_tags"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = activity_tags.activity_id) AND public.is_lab_member(a.lab_id)))));



  create policy "Admins can delete summaries"
  on "public"."ai_summaries"
  as permissive
  for delete
  to public
using (public.is_lab_admin(lab_id));



  create policy "Creators can delete their summaries"
  on "public"."ai_summaries"
  as permissive
  for delete
  to public
using ((created_by = auth.uid()));



  create policy "Members can create ai summaries"
  on "public"."ai_summaries"
  as permissive
  for insert
  to public
with check ((public.is_lab_member(lab_id) AND (created_by = auth.uid())));



  create policy "Members can view ai summaries"
  on "public"."ai_summaries"
  as permissive
  for select
  to public
using (public.is_lab_member(lab_id));



  create policy "Admins can delete attachments"
  on "public"."attachments"
  as permissive
  for delete
  to public
using ((((activity_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = attachments.activity_id) AND public.is_lab_admin(a.lab_id))))) OR ((comment_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (public.comments c
     JOIN public.activities a ON ((a.id = c.activity_id)))
  WHERE ((c.id = attachments.comment_id) AND public.is_lab_admin(a.lab_id)))))));



  create policy "Members can upload attachments"
  on "public"."attachments"
  as permissive
  for insert
  to public
with check (((uploaded_by = auth.uid()) AND (((activity_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = attachments.activity_id) AND (public.is_lab_admin(a.lab_id) OR (a.created_by = auth.uid())))))) OR ((comment_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.comments c
  WHERE ((c.id = attachments.comment_id) AND (c.created_by = auth.uid()))))))));



  create policy "Members can view attachments"
  on "public"."attachments"
  as permissive
  for select
  to public
using ((((activity_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = attachments.activity_id) AND public.is_lab_member(a.lab_id))))) OR ((comment_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (public.comments c
     JOIN public.activities a ON ((a.id = c.activity_id)))
  WHERE ((c.id = attachments.comment_id) AND public.is_lab_member(a.lab_id)))))));



  create policy "Uploaders can delete their attachments"
  on "public"."attachments"
  as permissive
  for delete
  to public
using ((uploaded_by = auth.uid()));



  create policy "Admins can delete any comment"
  on "public"."comments"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = comments.activity_id) AND public.is_lab_admin(a.lab_id)))));



  create policy "Creators can delete their comments"
  on "public"."comments"
  as permissive
  for delete
  to public
using ((created_by = auth.uid()));



  create policy "Creators can update their comments"
  on "public"."comments"
  as permissive
  for update
  to public
using ((created_by = auth.uid()))
with check ((created_by = auth.uid()));



  create policy "Members can create comments"
  on "public"."comments"
  as permissive
  for insert
  to public
with check (((EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = comments.activity_id) AND public.is_lab_member(a.lab_id)))) AND (created_by = auth.uid())));



  create policy "Members can view comments"
  on "public"."comments"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.activities a
  WHERE ((a.id = comments.activity_id) AND public.is_lab_member(a.lab_id)))) AND (deleted_at IS NULL)));



  create policy "Admins can create invitations"
  on "public"."lab_invitations"
  as permissive
  for insert
  to public
with check ((public.is_lab_admin(lab_id) AND (invited_by = auth.uid())));



  create policy "Admins can delete invitations"
  on "public"."lab_invitations"
  as permissive
  for delete
  to public
using (public.is_lab_admin(lab_id));



  create policy "Admins can view lab invitations"
  on "public"."lab_invitations"
  as permissive
  for select
  to public
using (public.is_lab_admin(lab_id));



  create policy "Invited users can update invitation status"
  on "public"."lab_invitations"
  as permissive
  for update
  to public
using (((email = ( SELECT profiles.email
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (status = 'pending'::public.invitation_status)))
with check ((status = ANY (ARRAY['accepted'::public.invitation_status, 'declined'::public.invitation_status])));



  create policy "Users can view their invitations"
  on "public"."lab_invitations"
  as permissive
  for select
  to public
using ((email = ( SELECT profiles.email
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));



  create policy "Authorized users can add members"
  on "public"."lab_members"
  as permissive
  for insert
  to public
with check ((((user_id = auth.uid()) AND (is_owner = true)) OR public.is_lab_owner(lab_id)));



  create policy "Authorized users can remove members"
  on "public"."lab_members"
  as permissive
  for delete
  to public
using (((public.is_lab_owner(lab_id) AND (user_id <> auth.uid())) OR ((user_id = auth.uid()) AND (is_owner = false))));



  create policy "Members can view lab members"
  on "public"."lab_members"
  as permissive
  for select
  to public
using (public.is_lab_member(lab_id));



  create policy "Owners can update member is_owner"
  on "public"."lab_members"
  as permissive
  for update
  to public
using ((public.is_lab_owner(lab_id) AND (user_id <> auth.uid())))
with check (public.is_lab_owner(lab_id));



  create policy "Authenticated users can create labs"
  on "public"."labs"
  as permissive
  for insert
  to public
with check (((auth.uid() IS NOT NULL) AND (created_by = auth.uid())));



  create policy "Members can view their labs"
  on "public"."labs"
  as permissive
  for select
  to public
using ((public.is_lab_member(id) AND (deleted_at IS NULL)));



  create policy "Owners can delete their labs"
  on "public"."labs"
  as permissive
  for delete
  to public
using (public.is_lab_owner(id));



  create policy "Owners can update their labs"
  on "public"."labs"
  as permissive
  for update
  to public
using (public.is_lab_owner(id))
with check (public.is_lab_owner(id));



  create policy "Users can delete own profile"
  on "public"."profiles"
  as permissive
  for delete
  to public
using ((id = auth.uid()));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((id = auth.uid()));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((id = auth.uid()))
with check ((id = auth.uid()));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((id = auth.uid()));



  create policy "Users can view profiles of lab members"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.lab_members lm1
     JOIN public.lab_members lm2 ON ((lm1.lab_id = lm2.lab_id)))
  WHERE ((lm1.user_id = auth.uid()) AND (lm2.user_id = profiles.id)))));



  create policy "Admins can create projects"
  on "public"."projects"
  as permissive
  for insert
  to public
with check ((public.is_lab_admin(lab_id) AND (created_by = auth.uid())));



  create policy "Admins can delete projects"
  on "public"."projects"
  as permissive
  for delete
  to public
using (public.is_lab_admin(lab_id));



  create policy "Admins can update any project"
  on "public"."projects"
  as permissive
  for update
  to public
using (public.is_lab_admin(lab_id))
with check (public.is_lab_admin(lab_id));



  create policy "Assignees can update their projects"
  on "public"."projects"
  as permissive
  for update
  to public
using ((public.is_lab_member(lab_id) AND (assignee_id = auth.uid())))
with check ((public.is_lab_member(lab_id) AND (assignee_id = auth.uid())));



  create policy "Members can view projects in their lab"
  on "public"."projects"
  as permissive
  for select
  to public
using ((public.is_lab_member(lab_id) AND (deleted_at IS NULL)));



  create policy "Admins can delete tags"
  on "public"."tags"
  as permissive
  for delete
  to public
using (public.is_lab_admin(lab_id));



  create policy "Admins can update tags"
  on "public"."tags"
  as permissive
  for update
  to public
using (public.is_lab_admin(lab_id))
with check (public.is_lab_admin(lab_id));



  create policy "Members can create tags"
  on "public"."tags"
  as permissive
  for insert
  to public
with check ((public.is_lab_member(lab_id) AND (created_by = auth.uid())));



  create policy "Members can view tags in their lab"
  on "public"."tags"
  as permissive
  for select
  to public
using (public.is_lab_member(lab_id));


CREATE TRIGGER recalculate_activity_position_trigger BEFORE UPDATE ON public.activities FOR EACH ROW WHEN ((new.status IS DISTINCT FROM old.status)) EXECUTE FUNCTION public.recalculate_activity_position_on_status_change();

CREATE TRIGGER set_activity_completed_at_trigger BEFORE UPDATE ON public.activities FOR EACH ROW WHEN ((new.status IS DISTINCT FROM old.status)) EXECUTE FUNCTION public.set_activity_completed_at();

CREATE TRIGGER set_activity_position_trigger BEFORE INSERT ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_activity_position();

CREATE TRIGGER set_activity_sequence_number_trigger BEFORE INSERT ON public.activities FOR EACH ROW WHEN ((new.sequence_number IS NULL)) EXECUTE FUNCTION public.set_activity_sequence_number();

CREATE TRIGGER set_activity_started_at_trigger BEFORE UPDATE ON public.activities FOR EACH ROW WHEN ((new.status IS DISTINCT FROM old.status)) EXECUTE FUNCTION public.set_activity_started_at();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER check_invitation_expiry_on_update BEFORE UPDATE ON public.lab_invitations FOR EACH ROW EXECUTE FUNCTION public.check_invitation_expiry();

CREATE TRIGGER on_invitation_status_changed BEFORE UPDATE ON public.lab_invitations FOR EACH ROW WHEN ((new.status IS DISTINCT FROM old.status)) EXECUTE FUNCTION public.add_member_on_invitation_accepted();

CREATE TRIGGER on_lab_created AFTER INSERT ON public.labs FOR EACH ROW EXECUTE FUNCTION public.add_owner_on_lab_creation();

CREATE TRIGGER set_lab_slug_trigger BEFORE INSERT ON public.labs FOR EACH ROW WHEN (((new.slug IS NULL) OR (new.slug = ''::text))) EXECUTE FUNCTION public.set_lab_slug();

CREATE TRIGGER soft_delete_lab_related_data_trigger AFTER UPDATE ON public.labs FOR EACH ROW WHEN ((new.deleted_at IS DISTINCT FROM old.deleted_at)) EXECUTE FUNCTION public.soft_delete_lab_related_data();

CREATE TRIGGER update_labs_updated_at BEFORE UPDATE ON public.labs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER soft_delete_project_activities_trigger AFTER UPDATE ON public.projects FOR EACH ROW WHEN ((new.deleted_at IS DISTINCT FROM old.deleted_at)) EXECUTE FUNCTION public.soft_delete_project_activities();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


