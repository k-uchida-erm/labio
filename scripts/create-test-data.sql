-- テストデータ作成スクリプト
-- 既存のユーザーを使用してテストデータを作成します
-- 
-- 使用方法:
-- 1. Supabase Studio (http://localhost:54323) の SQL Editor で実行
--    または、psqlで実行: psql postgresql://postgres:postgres@localhost:54322/postgres -f scripts/create-test-data.sql

DO $$
DECLARE
  test_user_id UUID;
  lab_id_var UUID;
  project_id_var UUID;
BEGIN
  -- 既存のユーザーを取得（存在する場合）
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- ユーザーが存在しない場合はエラー
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION '認証ユーザーが見つかりません。Supabase Dashboardでユーザーを作成してください。';
  END IF;

  RAISE NOTICE 'テストユーザーID: %', test_user_id;

  -- Profileを作成（存在しない場合）
  INSERT INTO public.profiles (id, email, display_name)
  SELECT 
    test_user_id,
    email,
    COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
  FROM auth.users
  WHERE id = test_user_id
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name);

  -- Labを作成（存在しない場合）
  INSERT INTO public.labs (id, name, description, slug, is_personal, created_by)
  VALUES (
    gen_random_uuid(),
    'AI研究室',
    '人工知能に関する研究を行う研究室です',
    'ai-lab-a3f2',
    false,
    test_user_id
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO lab_id_var;

  -- Lab IDを取得（既に存在する場合）
  IF lab_id_var IS NULL THEN
    SELECT id INTO lab_id_var FROM public.labs WHERE slug = 'ai-lab-a3f2' LIMIT 1;
  END IF;
  
  IF lab_id_var IS NULL THEN
    RAISE EXCEPTION 'Labの作成に失敗しました';
  END IF;

  -- Lab Memberを作成（ownerとして）
  INSERT INTO public.lab_members (lab_id, user_id, is_owner)
  VALUES (lab_id_var, test_user_id, true)
  ON CONFLICT (lab_id, user_id) DO UPDATE SET is_owner = true;

  -- Projectを作成（存在しない場合）
  INSERT INTO public.projects (id, lab_id, key, title, description, assignee_id, created_by)
  VALUES (
    gen_random_uuid(),
    lab_id_var,
    'PINN',
    'PINN Project',
    'Physics-Informed Neural Networksの研究プロジェクト',
    test_user_id,
    test_user_id
  )
  ON CONFLICT (lab_id, key) DO NOTHING
  RETURNING id INTO project_id_var;

  -- Project IDを取得（既に存在する場合）
  IF project_id_var IS NULL THEN
    SELECT id INTO project_id_var FROM public.projects WHERE lab_id = lab_id_var AND key = 'PINN' LIMIT 1;
  END IF;
  
  IF project_id_var IS NOT NULL THEN
    -- Activity 1
    INSERT INTO public.activities (
      lab_id,
      project_id,
      title,
      description,
      type,
      status,
      due_date,
      created_by
    )
    VALUES (
      lab_id_var,
      project_id_var,
      'タスクの例1',
      'これはテスト用のアクティビティです',
      'task',
      'todo',
      (CURRENT_DATE + INTERVAL '7 days')::timestamptz,
      test_user_id
    )
    ON CONFLICT DO NOTHING;

    -- Activity 2
    INSERT INTO public.activities (
      lab_id,
      project_id,
      title,
      description,
      type,
      status,
      due_date,
      created_by
    )
    VALUES (
      lab_id_var,
      project_id_var,
      'タスクの例2',
      '2つ目のテスト用アクティビティです',
      'task',
      'in_progress',
      (CURRENT_DATE + INTERVAL '14 days')::timestamptz,
      test_user_id
    )
    ON CONFLICT DO NOTHING;

    -- Activity 3
    INSERT INTO public.activities (
      lab_id,
      project_id,
      title,
      description,
      type,
      status,
      due_date,
      created_by
    )
    VALUES (
      lab_id_var,
      project_id_var,
      'タスクの例3',
      '3つ目のテスト用アクティビティです',
      'experiment',
      'done',
      (CURRENT_DATE - INTERVAL '1 day')::timestamptz,
      test_user_id
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ テストデータの作成が完了しました！';
    RAISE NOTICE 'Lab slug: ai-lab-a3f2';
    RAISE NOTICE 'Project key: PINN';
    RAISE NOTICE 'URL: http://localhost:3000/ai-lab-a3f2/PINN';
  ELSE
    RAISE EXCEPTION 'Projectの作成に失敗しました';
  END IF;
END $$;

-- 確認用クエリ
SELECT 'Lab作成完了' as status, COUNT(*) as count FROM labs WHERE slug = 'ai-lab-a3f2';
SELECT 'Project作成完了' as status, COUNT(*) as count FROM projects WHERE key = 'PINN';
SELECT 'Activity作成完了' as status, COUNT(*) as count FROM activities;

