-- Add parent_id column to activities table for sub-activities
ALTER TABLE public.activities
ADD COLUMN parent_id UUID REFERENCES public.activities(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_activities_parent_id ON public.activities(parent_id) WHERE parent_id IS NOT NULL;

