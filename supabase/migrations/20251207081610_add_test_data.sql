-- テスト用データを追加（マイグレーションテスト用）
-- 注意: 本番環境では実行されません（seed.sqlとは別に、マイグレーションファイルとして管理）

-- テスト用のLabを追加
-- created_byはauth.usersに存在する必要があるため、既存のユーザーIDを使用
-- 既存のユーザーが存在しない場合は、最初のユーザーIDを使用するか、スキップ
-- slugにUNIQUE制約があるため、ON CONFLICT (slug)を使用
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- auth.usersから最初のユーザーIDを取得（存在する場合）
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- ユーザーが存在する場合のみテストデータを追加
  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.labs (id, name, description, slug, is_personal, created_by, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'テストLab',
      'マイグレーションテスト用のLabデータ',
      'test-lab-migration',
      false,
      test_user_id,
      now(),
      now()
    )
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

