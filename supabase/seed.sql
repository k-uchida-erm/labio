-- Labio Seed Data
-- Development用のテストデータ
-- 
-- 使用方法:
-- 1. Supabase Dashboard > Authentication > Users でユーザーを作成
--    または、アプリでサインアップ
-- 2. make supabase-reset を実行（このシードが自動実行される）

DO $$
DECLARE
  owner_user_id UUID;
  lab_id_var UUID;
  project_id_var UUID;
  user_rec RECORD;
BEGIN
  -- 既存ユーザーの中で最初のユーザーをオーナーとして利用する
  SELECT id INTO owner_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;
  
  IF owner_user_id IS NULL THEN
    RAISE NOTICE '認証ユーザーが見つかりません。テストデータの作成をスキップします。';
    RAISE NOTICE 'Supabase Dashboardでユーザーを作成するか、アプリでサインアップしてください。';
    RETURN;
  END IF;

  RAISE NOTICE 'オーナーユーザーID: %', owner_user_id;

  -- Labを作成（存在しない場合）
  INSERT INTO public.labs (id, name, description, slug, is_personal, created_by)
  VALUES (
    gen_random_uuid(),
    'AI研究室',
    '人工知能に関する研究を行う研究室です',
    'ai-lab-a3f2',
    false,
    owner_user_id
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Lab IDを取得
  SELECT id INTO lab_id_var FROM public.labs WHERE slug = 'ai-lab-a3f2' LIMIT 1;
  
  IF lab_id_var IS NULL THEN
    RAISE NOTICE 'Labの作成に失敗しました';
    RETURN;
  END IF;

  -- すべてのユーザーに対してプロフィールとLabメンバーを作成
  FOR user_rec IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
  LOOP
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
      user_rec.id,
      user_rec.email,
      COALESCE(user_rec.raw_user_meta_data->>'display_name', split_part(user_rec.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.lab_members (lab_id, user_id, is_owner)
    VALUES (
      lab_id_var,
      user_rec.id,
      user_rec.id = owner_user_id
    )
    ON CONFLICT (lab_id, user_id) DO UPDATE
      SET is_owner = EXCLUDED.is_owner;
  END LOOP;

  -- Projectを作成（存在しない場合）
  INSERT INTO public.projects (id, lab_id, key, title, description, assignee_id, created_by)
  VALUES (
    gen_random_uuid(),
    lab_id_var,
    'PINN',
    'PINN Project',
    'Physics-Informed Neural Networksの研究プロジェクト',
    owner_user_id,
    owner_user_id
  )
  ON CONFLICT (lab_id, key) DO NOTHING;

  -- Project IDを取得
  SELECT id INTO project_id_var FROM public.projects WHERE lab_id = lab_id_var AND key = 'PINN' LIMIT 1;
  
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
      created_by,
      assignee_id
    )
    VALUES (
      lab_id_var,
      project_id_var,
      'タスクの例1',
      'これはテスト用のアクティビティです',
      'task',
      'todo',
      (CURRENT_DATE + INTERVAL '7 days')::timestamptz,
      owner_user_id,
      owner_user_id
    );

    -- Activity 2
    INSERT INTO public.activities (
      lab_id,
      project_id,
      title,
      description,
      type,
      status,
      due_date,
      created_by,
      assignee_id
    )
    VALUES (
      lab_id_var,
      project_id_var,
      'タスクの例2',
      '2つ目のテスト用アクティビティです',
      'task',
      'in_progress',
      (CURRENT_DATE + INTERVAL '14 days')::timestamptz,
      owner_user_id,
      owner_user_id
    );

    -- Activity 3
    INSERT INTO public.activities (
      lab_id,
      project_id,
      title,
      description,
      type,
      status,
      due_date,
      created_by,
      assignee_id
    )
    VALUES (
      lab_id_var,
      project_id_var,
      'タスクの例3',
      '3つ目のテスト用アクティビティです',
      'experiment',
      'done',
      (CURRENT_DATE - INTERVAL '1 day')::timestamptz,
      owner_user_id,
      owner_user_id
    );

    RAISE NOTICE 'テストデータの作成が完了しました！';
    RAISE NOTICE 'Lab slug: ai-lab-a3f2';
    RAISE NOTICE 'Project key: PINN';
    RAISE NOTICE 'URL: http://localhost:3000/ai-lab-a3f2/PINN';
  END IF;
END $$;
