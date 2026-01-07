# 開発環境でのテストデータ作成ガイド

## 概要

このガイドでは、開発環境でページを確認するために必要なテストデータの作成方法を説明します。

## 前提条件

- ローカルSupabaseが起動している（`make supabase-start`）
- 認証ユーザーが作成されている

## 手順

### 1. 認証ユーザーの作成

まず、Supabase Dashboardで認証ユーザーを作成するか、アプリでサインアップします。

#### 方法A: Supabase Dashboardで作成

1. ブラウザで http://localhost:54323 を開く（Supabase Studio）
2. `Authentication` > `Users` に移動
3. `Add user` をクリック
4. メールアドレスとパスワードを入力してユーザーを作成

#### 方法B: アプリでサインアップ

1. ブラウザで http://localhost:3000 を開く
2. `/signup` ページに移動
3. メールアドレスとパスワードでサインアップ

### 2. テストデータの作成

`seed.sql`が自動的にテストデータを作成します。以下のコマンドでDBをリセットしてシードを実行します：

```bash
make supabase-reset
```

これにより、以下のテストデータが作成されます：

- **Lab**: `ai-lab-a3f2` (slug)
- **Project**: `PINN` (key)
- **Activities**: 3つのテストアクティビティ
- **Profiles / Lab Members**: 既存のすべての `auth.users` が `profiles` と `lab_members` に同期され、assignee等の外部キーで失敗しない

### 3. ページの確認

テストデータが作成されたら、以下のURLでページを確認できます：

```
http://localhost:3000/ai-lab-a3f2/PINN
```

## テストデータの内容

### Lab

- **名前**: AI研究室
- **Slug**: `ai-lab-a3f2`
- **説明**: 人工知能に関する研究を行う研究室です

### Project

- **Key**: `PINN`
- **タイトル**: PINN Project
- **説明**: Physics-Informed Neural Networksの研究プロジェクト

### Profiles / Lab Members

- Supabaseの `auth.users` で作成済みの全ユーザーが `profiles` にコピーされ、同じLabメンバーとして紐づく
- これにより Activity の `assignee_id` などが外部キー制約で失敗しない

### Activities

1. **タスクの例1** (status: todo)
2. **タスクの例2** (status: in_progress)
3. **タスクの例3** (status: done, type: experiment)

## トラブルシューティング

### 認証ユーザーが見つからない場合

`make supabase-reset` を実行した際に、以下のメッセージが表示される場合：

```
認証ユーザーが見つかりません。テストデータの作成をスキップします。
```

この場合、先に認証ユーザーを作成してください（上記の手順1を参照）。

### データが作成されない場合

1. Supabase Studioで確認：
   - http://localhost:54323 を開く
   - `Table Editor` で `labs`, `projects`, `activities` テーブルを確認

2. ログを確認：

   ```bash
   make supabase-reset
   ```

   実行時に `RAISE NOTICE` のメッセージが表示されます

3. 手動で確認：
   ```sql
   -- Supabase StudioのSQL Editorで実行
   SELECT id, email FROM auth.users;
   SELECT * FROM labs WHERE slug = 'ai-lab-a3f2';
   SELECT * FROM projects WHERE key = 'PINN';
   SELECT * FROM activities;
   ```

## 追加のテストデータを作成する場合

`supabase/seed.sql` を編集して、追加のテストデータを定義できます。

注意: `seed.sql` は開発環境でのみ使用し、本番環境では実行しないでください。
