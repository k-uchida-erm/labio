-- テスト用カラムを追加
ALTER TABLE public.labs
ADD COLUMN test_column TEXT;

-- コメントを追加（オプション）
COMMENT ON COLUMN public.labs.test_column IS 'テスト用カラム（マイグレーション検証用）';

