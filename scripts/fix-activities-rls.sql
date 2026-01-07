-- Relax the insert policy on activities so that any lab member can create
-- activities within the lab, as long as they are the creator (created_by = auth.uid()).
-- This matches the documented intent: lab members can create activities in their projects,
-- and lab owners retain full rights via the admin policy.

DROP POLICY IF EXISTS "Members can create activities in their projects" ON public.activities;

CREATE POLICY "Members can create activities in their projects"
ON public.activities
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  public.is_lab_member(lab_id)
  AND created_by = auth.uid()
);
