-- テスト用: NotionのMarkdown表示をテスト
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS notion_test_column TEXT DEFAULT 'test';

