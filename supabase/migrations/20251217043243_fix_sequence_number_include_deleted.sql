-- sequence_numberのトリガーを修正：削除されたものも含めて最大値を取得
CREATE OR REPLACE FUNCTION public.set_activity_sequence_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  max_sequence INTEGER;
BEGIN
  -- 同じproject_idのActivityの最大sequence_numberを取得（削除済みも含める）
  SELECT COALESCE(MAX(sequence_number), 0)
  INTO max_sequence
  FROM activities
  WHERE project_id = NEW.project_id;
  
  -- 最大値+1を設定（初回は1）
  NEW.sequence_number := max_sequence + 1;
  
  RETURN NEW;
END;
$function$;

-- 既存のsequence_number: 8のActivityを4に修正（作成順序に基づいて）
-- ただし、既に4が存在する場合はスキップ
UPDATE activities 
SET sequence_number = 4
WHERE id = '1d2e1e61-9df3-47f7-856b-c40ad0028c14'
  AND sequence_number = 8
  AND NOT EXISTS (
    SELECT 1 FROM activities a2 
    WHERE a2.project_id = activities.project_id 
      AND a2.sequence_number = 4 
      AND a2.id != activities.id
  );

