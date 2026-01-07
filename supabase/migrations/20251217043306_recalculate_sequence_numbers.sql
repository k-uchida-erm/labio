-- 全てのsequence_numberを再計算（作成順序に基づいて）
-- 同じproject_id内で、created_at順に1から順番に振り直す

WITH numbered_activities AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) AS new_sequence_number
  FROM activities
  WHERE deleted_at IS NULL
)
UPDATE activities AS a
SET sequence_number = n.new_sequence_number
FROM numbered_activities AS n
WHERE a.id = n.id;
