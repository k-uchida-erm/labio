# データベーススキーマ設計書

## 1. 概要

本ドキュメントでは、Labioのデータベーススキーマの**設計意図と重要な判断**を記録する。

> **注意**: 実際のスキーマ定義（カラム、型、制約など）は以下の方法で確認できます：
>
> - **Supabase MCP**: `mcp_supabase_local_pg_query` で読み取り専用クエリを実行（テーブル構造の確認など）
> - **型定義**: `src/types/database.types.ts`（`make db-types`で自動生成）
> - **Supabase Dashboard**: データベース構造を直接確認

### 1.1 設計原則

- **RLS必須**: すべてのテーブルでRow Level Securityを有効化
- **UUID使用**: 主キーはすべてUUID（`gen_random_uuid()`）
- **ソフトデリート**: 重要データは`deleted_at`で論理削除
- **監査カラム**: `created_at`, `updated_at`, `created_by`を標準装備
- **外部キー制約**: データ整合性を保証
- **インデックス**: クエリパフォーマンスを考慮

### 1.2 命名規則

| 対象         | 規則                          | 例                      |
| ------------ | ----------------------------- | ----------------------- |
| テーブル名   | snake_case（複数形）          | `projects`              |
| カラム名     | snake_case                    | `created_at`            |
| 主キー       | `id`                          | `id UUID PRIMARY KEY`   |
| 外部キー     | `{テーブル単数形}_id`         | `lab_id`, `user_id`     |
| ENUM型       | snake_case                    | `activity_status`       |
| インデックス | `idx_{テーブル名}_{カラム名}` | `idx_activities_lab_id` |

---

## 2. ENUM型定義

詳細な定義はMCPまたは`database.types.ts`で確認可能。ここでは設計意図のみ記載。

| ENUM型              | 値                                                            | 設計意図                                       |
| ------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `activity_status`   | `todo`, `in_progress`, `in_review`, `done`                    | Activityのワークフロー状態を管理               |
| `activity_type`     | `task`, `experiment`, `question`, `review`, `meeting`, `note` | Activityの種類を分類（フィルタリング・統計用） |
| `invitation_status` | `pending`, `accepted`, `declined`, `expired`                  | Lab招待の状態を管理                            |

---

## 3. テーブル設計の重要な判断

> **注意**: 詳細なカラム定義、型、制約はMCPまたは`database.types.ts`で確認してください。ここでは設計意図と重要な判断のみ記載します。

### 3.1 profiles（ユーザープロフィール）

**設計意図**: Supabase Authの`auth.users`と1:1で連携するプロフィールテーブル

**重要なポイント**:

- `id`は`auth.users.id`と同一（外部キー制約で連携）
- `email`は`auth.users.email`のコピー（クエリ効率化のため）
- `avatar_url`はSupabase StorageのURLを保存

**関連**: `auth.users` (1:1)

### 3.2 labs（Lab）

**設計意図**: 研究室単位のデータ管理

**重要なポイント**:

- `slug`: URL用の一意識別子（グローバルにユニーク、ランダムサフィックス付き）
- `is_personal`: 個人プランかどうか（将来の機能拡張用）
- `deleted_at`: ソフトデリート（Lab削除時もデータを保持）

**関連**: `lab_members` (1:N), `projects` (1:N), `tags` (1:N)

### 3.3 lab_members（Labメンバー）

**設計意図**: Labごとのメンバー管理と権限管理

**重要なポイント**:

- `is_owner`: booleanフラグでowner/memberを区別（Supabase推奨の`app_metadata`ではなく、Labごとのロール管理が必要なため）
- `UNIQUE(lab_id, user_id)`: 1ユーザーは1Labに1回のみ参加可能
- Lab作成時に作成者が自動的に`is_owner = TRUE`で追加される（トリガー）

**関連**: `labs` (N:1), `auth.users` (N:1)

### 3.4 lab_invitations（Lab招待）

**設計意図**: Labへの招待機能

**重要なポイント**:

- `token`: 招待リンク用のユニークトークン
- `is_owner`: 招待時にownerとして追加するかどうか
- `expires_at`: 有効期限（デフォルト7日）
- 承認時に`lab_members`に自動追加される（トリガー）

**関連**: `labs` (N:1)

### 3.5 projects（プロジェクト）

**設計意図**: Lab内のプロジェクト管理

**重要なポイント**:

- `key`: Project識別キー（2-5桁、Lab内でユニーク、ユーザー設定、例: `PINN`, `ML`, `AI`）
- `UNIQUE(lab_id, key)`: Lab内でkeyが一意
- `assignee_id`: 主担当者（生徒）
- `is_archived`: アーカイブ状態（削除ではなくアーカイブ）

**関連**: `labs` (N:1), `activities` (1:N), `auth.users` (N:1, assignee_id)

### 3.6 activities（Activity）

**設計意図**: プロジェクト内のActivity（タスク、実験ノート、質問など）管理

**重要なポイント**:

- `sequence_number`: Project内での連番（1から始まる、自動設定）
- `UNIQUE(lab_id, project_id, sequence_number)`: Lab内で一意
- 表示ID: `{projectKey}-{sequence_number}`（例: `PINN-1`）
- `position`: Kanban/Listビューでの表示順序
- `started_at`, `completed_at`: ステータス変更時に自動設定（トリガー）

**関連**: `labs` (N:1), `projects` (N:1), `activity_tags` (1:N), `comments` (1:N), `attachments` (1:N)

### 3.7 tags（タグ）

**設計意図**: Lab単位のタグ管理

**重要なポイント**:

- `UNIQUE(lab_id, name)`: Lab内でタグ名が一意
- `color`: HEXカラーコード（ユーザーが設定可能）

**関連**: `labs` (N:1), `activity_tags` (1:N)

### 3.8 activity_tags（Activity-タグ中間テーブル）

**設計意図**: Activityとタグの多対多関係

**重要なポイント**:

- `UNIQUE(activity_id, tag_id)`: 1Activityに同じタグを複数回付けない

**関連**: `activities` (N:1), `tags` (N:1)

### 3.9 comments（コメント）

**設計意図**: Activityへのコメント機能（スレッド形式対応）

**重要なポイント**:

- `parent_id`: 親コメントID（スレッド形式）
- `content`: Markdown形式
- `deleted_at`: ソフトデリート（削除後も構造を保持）

**関連**: `activities` (N:1), `auth.users` (N:1, created_by), `comments` (N:1, parent_id)

### 3.10 attachments（添付ファイル）

**設計意図**: ActivityまたはCommentへのファイル添付

**重要なポイント**:

- `storage_path`: Supabase Storageのパス
- `comment_id`: Commentに添付する場合（オプション）
- `file_size`, `mime_type`: ファイル情報

**関連**: `activities` (N:1), `comments` (N:1, オプション), `auth.users` (N:1, uploaded_by)

### 3.11 ai_summaries（AI生成サマリー）

**設計意図**: AIが生成したサマリーの保存

**重要なポイント**:

- `content`: Markdown形式のサマリー
- `source_type`: サマリーの対象（`lab`, `project`, `activity`）
- `source_id`: 対象のID

**関連**: `labs` (N:1, オプション), `projects` (N:1, オプション), `activities` (N:1, オプション)

---

## 4. ER図

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    ER図                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │  auth.users  │
                              │  (Supabase)  │
                              └──────┬───────┘
                                     │ 1:1
                                     ▼
                              ┌──────────────┐
                              │   profiles   │
                              └──────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│     labs     │◄───────────│ lab_members  │            │lab_invitations│
└──────┬───────┘    N:M     └──────────────┘            └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐     1:N    ┌──────────────┐
│   projects   │◄──────────│  activities  │
└──────────────┘            └──────┬───────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
      ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
      │activity_tags │    │   comments   │    │ attachments  │
      └──────┬───────┘    └──────────────┘    └──────────────┘
             │
             ▼
      ┌──────────────┐
      │     tags     │
      └──────────────┘

┌──────────────┐
│ ai_summaries │ (labs, projects, activitiesを参照)
└──────────────┘
```

---

## 5. 重要な設計判断

### 5.1 ルーティング設計

- **Lab**: `slug`（グローバルにユニーク、ランダムサフィックス付き）
- **Project**: `key`（Lab内でユニーク、2-5桁の英数字、ユーザー設定）
- **Activity**: `sequence_number`（Project内で連番、自動設定）

詳細は [`pages-design.md`](../pages-design.md) の「5. ルーティング設計」を参照

### 5.2 権限管理

- **`lab_members.is_owner`**: booleanフラグでowner/memberを区別
- **理由**: Labごとに異なるロールを持つ必要があるため（Supabase推奨の`app_metadata`ではなく、テーブルで管理）

詳細は [`architecture.md`](../../architecture.md) の「11.2 権限管理」を参照

### 5.3 ソフトデリート

- **`deleted_at`**: 重要データ（labs, projects, activities, comments）は物理削除せず論理削除
- **理由**: データの復元可能性、監査ログの保持

---

## 6. マイグレーション順序

依存関係を考慮したマイグレーション順序：

```
1. ENUM型定義（activity_status, activity_type, invitation_status）
2. profiles
3. labs
4. lab_members
5. lab_invitations
6. projects
7. activities
8. tags
9. activity_tags
10. comments
11. attachments
12. ai_summaries
13. トリガー・関数（triggers-functions.md参照）
14. RLSポリシー（rls-policies.md参照）
```

---

## 7. 関連ドキュメント

- **RLSポリシー**: [`rls-policies.md`](./rls-policies.md)
- **トリガー・関数**: [`triggers-functions.md`](./triggers-functions.md)
- **現在の状態**: [`current-state.md`](./current-state.md)
- **ルーティング設計**: [`../pages-design.md`](../pages-design.md)
- **権限管理**: [`../../architecture.md`](../../architecture.md)

---

## 7. DB設計変更のワークフロー

> **重要**: DB設計は頻繁に変更されます。最初に全て決める必要はありません。

### 7.1 変更可能なもの

✅ **変更可能**:

- カラムの追加・削除・変更
- インデックスの追加・削除
- テーブルの追加・削除
- ENUM型の値の追加
- 制約の追加・変更

### 7.2 変更前に確認すべきもの

⚠️ **変更前に慎重に検討**:

- **RLSポリシー**: 既存のポリシーへの影響
- **トリガー・関数**: 既存のトリガー・関数への影響
- **外部キー制約**: データ整合性への影響
- **型定義**: TypeScriptの型定義への影響（自動生成されるが、コード側の修正が必要な場合あり）

### 7.3 変更時の手順

1. **設計変更の検討**
   - 変更理由を明確にする
   - 影響範囲を確認（RLS、トリガー、関数、コード）

2. **マイグレーションの作成**
   - マイグレーションファイルを直接作成（`npx supabase migration new migration_name`）
   - SQLを直接書く（`supabase/migrations/{timestamp}_{name}.sql`）

3. **型定義の更新**

   ```bash
   make db-types
   ```

4. **コードの修正**
   - 型定義の変更に合わせてコードを修正
   - TypeScriptの型エラーを解消

5. **テスト**
   - マイグレーションの動作確認
   - 既存機能への影響確認

6. **仕様書の更新**
   - `schema.md`: 設計意図の変更を記録
   - `current-state.md`: 変更履歴に追加
   - `rls-policies.md`: RLSポリシーの変更を記録（必要に応じて）
   - `triggers-functions.md`: トリガー・関数の変更を記録（必要に応じて）

### 7.4 最初に決めておくべきもの

🔒 **最初に決めておくべき重要な設計判断**:

- **権限管理方式**: `is_owner` booleanフラグ（Labごとのロール管理）
- **ルーティング設計**: `slug`, `key`, `sequence_number`の仕組み
- **ソフトデリート**: `deleted_at`の使用方針
- **RLS原則**: すべてのテーブルでRLSを有効化

これらは後から変更すると影響範囲が大きいため、最初に決めておくことを推奨します。

---

## 8. 変更履歴

| 日付       | 変更内容                                                |
| ---------- | ------------------------------------------------------- |
| 2024-12-04 | 詳細なSQL定義を削除し、設計意図と重要な判断のみに簡略化 |
| 2024-12-04 | DB設計変更のワークフローを追加                          |
