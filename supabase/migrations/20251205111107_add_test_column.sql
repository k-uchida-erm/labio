-- テスト用カラム追加
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS test_column TEXT DEFAULT 'test';

