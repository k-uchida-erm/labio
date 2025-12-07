-- もう一つのテスト用カラムを追加
ALTER TABLE public.labs
ADD COLUMN another_test_column INTEGER DEFAULT 0;

-- コメントを追加
COMMENT ON COLUMN public.labs.another_test_column IS 'もう一つのテスト用カラム（Notion同期テスト用）';

