-- sequence_numberが0のActivityを修正
-- 同じproject_idの他のActivityの最大sequence_numberを取得して、それに+1を設定
UPDATE activities 
SET sequence_number = (
  SELECT COALESCE(MAX(sequence_number), 0) + 1
  FROM activities a2
  WHERE a2.project_id = activities.project_id
    AND a2.deleted_at IS NULL
    AND a2.id != activities.id
    AND a2.sequence_number > 0
)
WHERE sequence_number = 0 
  AND deleted_at IS NULL;

