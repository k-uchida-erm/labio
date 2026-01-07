-- Add metadata column for type-specific activity data
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_activities_metadata_type
  ON public.activities USING gin (metadata);
