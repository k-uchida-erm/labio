-- Add assignee_id to activities for per-activity assignments
ALTER TABLE public.activities
ADD COLUMN assignee_id uuid REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_activities_assignee_id
  ON public.activities (assignee_id);
