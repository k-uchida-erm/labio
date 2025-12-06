# トリガー・関数設計書

## 1. 概要

本ドキュメントでは、Labioで使用するPostgreSQLのトリガーと関数を定義する。

**注意**: すべての関数・トリガーは[`api/api-design.md`](../api/api-design.md)のDatabase Functions基準に従って実装される。

### 1.1 設計原則

- **自動化**: 繰り返し行われる処理はトリガーで自動化
- **データ整合性**: トリガーでデータの整合性を保証
- **パフォーマンス**: 必要最小限のトリガーに留める
- **セキュリティ**: SECURITY DEFINERを適切に使用
- **データベース内完結**: すべての処理はデータベース内で完結（外部API呼び出しなし）

### 1.2 Database Functionsの使用基準

[`api/api-design.md`](../api/api-design.md)に基づき、以下の場合にDatabase Functionsを使用：

- ✅ **データベース内でのみ完結する処理**
- ✅ **トリガーから呼び出される**
- ✅ **複雑なSQL処理**（集計、統計計算等）
- ✅ **RLSポリシーで使用するヘルパー関数**

---

## 2. ユーティリティ関数

### 2.1 updated_at 自動更新

**関数名**: `update_updated_at_column()`

**説明**: レコード更新時に`updated_at`カラムを自動更新

**適用テーブル**: `profiles`, `labs`, `projects`, `activities`, `comments`

**トリガー名**: `update_{table}_updated_at`

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

---

## 3. 認証関連トリガー

### 3.1 新規ユーザー作成時のプロフィール自動作成

**関数名**: `handle_new_user()`

**トリガー名**: `on_auth_user_created`

**テーブル**: `auth.users` (AFTER INSERT)

**説明**: Supabase Authで新規ユーザーが作成された際、`profiles`テーブルにプロフィールを自動作成

**処理内容**:

- `auth.users`の`id`, `email`を`profiles`にコピー
- `display_name`は`raw_user_meta_data`から取得、なければメールアドレスの@より前の部分を使用
- `avatar_url`は`raw_user_meta_data`から取得

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

---

## 4. Lab関連トリガー

### 4.1 Lab作成時のownerメンバー追加

**関数名**: `add_owner_on_lab_created()`

**トリガー名**: `on_lab_created`

**テーブル**: `labs` (AFTER INSERT)

**説明**: Lab作成時に作成者を自動的に`lab_members`に`is_owner = TRUE`で追加

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

### 4.2 Lab名からslug自動生成

**関数名**: `set_lab_slug()`

**トリガー名**: `set_lab_slug_trigger`

**テーブル**: `labs` (BEFORE INSERT)

**説明**: Lab作成時に`name`から`slug`を自動生成（URL用の一意な識別子）

**処理内容**:

- Lab名を小文字化、特殊文字をハイフンに置換（例: `東京大学AI研究室` → `tokyo-univ-ai-lab`）
- 既存のslugと重複しないように、末尾にランダムな数桁（4-6桁）を付与（例: `tokyo-univ-ai-lab-a3f2`）
- ユニーク性を確保するため、重複チェックを実施

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

---

## 5. 招待関連トリガー

### 5.1 招待承認時のメンバー追加

**関数名**: `add_member_on_invitation_accepted()`

**トリガー名**: `on_invitation_status_changed`

**テーブル**: `lab_invitations` (BEFORE UPDATE)

**説明**: 招待のステータスが`pending`から`accepted`に変更された際、自動的に`lab_members`に追加

**処理内容**:

- 招待されたユーザーの`profiles.id`を取得
- `lab_members`に`is_owner`フラグを設定して追加（招待時の`is_owner`フラグを使用）

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

### 5.2 招待有効期限チェック

**関数名**: `check_invitation_expiry()`

**トリガー名**: `check_invitation_expiry_on_update`

**テーブル**: `lab_invitations` (BEFORE UPDATE)

**説明**: 有効期限切れの招待を更新しようとした場合、自動的に`expired`ステータスに変更

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

---

## 6. Activity関連トリガー

### 6.1 Activity完了時にcompleted_at自動設定

**関数名**: `set_activity_completed_at()`

**トリガー名**: `set_activity_completed_at_trigger`

**テーブル**: `activities` (BEFORE UPDATE)

**説明**: ステータスが`done`に変更された際、`completed_at`を自動設定。`done`から他に変更された場合は`NULL`に設定

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

### 6.2 Activity開始時にstarted_at自動設定

**関数名**: `set_activity_started_at()`

**トリガー名**: `set_activity_started_at_trigger`

**テーブル**: `activities` (BEFORE UPDATE)

**説明**: ステータスが`todo`から`in_progress`に変更された際、`started_at`を自動設定

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

### 6.3 Activityのsequence_number自動設定

**関数名**: `set_activity_sequence_number()`

**トリガー名**: `set_activity_sequence_number_trigger`

**テーブル**: `activities` (BEFORE INSERT)

**説明**: Activity作成時に`sequence_number`を自動設定（Project内で連番）

**処理内容**:

- 同じ`project_id`のActivityの最大`sequence_number`を取得
- 最大値+1を設定（初回は1）
- 削除済み（`deleted_at IS NOT NULL`）は除外

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

### 6.4 Activityのposition自動設定

**関数名**: `set_activity_position()`

**トリガー名**: `set_activity_position_trigger` (BEFORE INSERT), `recalculate_activity_position_trigger` (BEFORE UPDATE)

**テーブル**: `activities`

**説明**:

- 新規作成時: 同じ`project_id`と`status`の最後尾に配置
- 更新時: `status`が変更された場合、新しい`status`の最後尾に移動

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

---

## 7. Realtime通知関連

### 7.1 Activity変更通知

**関数名**: `notify_activity_change()`

**トリガー名**: `notify_activity_changes`

**テーブル**: `activities` (AFTER INSERT OR UPDATE OR DELETE)

**説明**: Activityの変更をSupabase Realtimeに通知（クライアント側でリアルタイム更新）

**通知内容**: `operation`, `table`, `id`, `lab_id`, `project_id`, `status`等

**処理内容**: `pg_notify()`を使用してデータベース内で通知を発行

**使用基準**: ✅ トリガーから呼び出される、データベース内処理（`pg_notify`はPostgreSQL標準機能）

### 7.2 コメント追加通知

**関数名**: `notify_comment_added()`

**トリガー名**: `notify_comment_added_trigger`

**テーブル**: `comments` (AFTER INSERT)

**説明**: コメント追加をSupabase Realtimeに通知

**使用基準**: ✅ トリガーから呼び出される、データベース内処理（`pg_notify`はPostgreSQL標準機能）

---

## 8. データ整合性関連

### 8.1 Lab削除時の関連データソフトデリート

**関数名**: `soft_delete_lab_related_data()`

**トリガー名**: `soft_delete_lab_related_data_trigger`

**テーブル**: `labs` (AFTER UPDATE)

**説明**: Labがソフトデリート（`deleted_at`が設定）された際、関連する`projects`, `activities`, `comments`も自動的にソフトデリート

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

### 8.2 project削除時のActivity連動

**関数名**: `soft_delete_project_activities()`

**トリガー名**: `soft_delete_project_activities_trigger`

**テーブル**: `projects` (AFTER UPDATE)

**説明**: projectがソフトデリートされた際、関連する`activities`も自動的にソフトデリート

**使用基準**: ✅ トリガーから呼び出される、データベース内処理

---

## 9. ユーティリティ関数

### 9.1 招待トークン生成

**関数名**: `generate_invitation_token()`

**戻り値**: TEXT

**説明**: 招待用のランダムトークン（32バイトのhex文字列）を生成

**呼び出し元**:

- Server Actions / API Routesから直接呼び出し可能
- データベース内でのみ完結する処理

**使用基準**: ✅ データベース内でのみ完結する処理（`gen_random_bytes()`はPostgreSQL標準機能）

### 9.2 スラッグ生成

**関数名**: `generate_slug(name TEXT)`

**戻り値**: TEXT

**説明**: Lab名からURL用のスラッグを生成（小文字化、特殊文字をハイフンに置換、一意性を確保）

**呼び出し元**:

- `set_lab_slug()`トリガーから呼び出される
- Server Actions / API Routesから直接呼び出し可能

**使用基準**: ✅ データベース内でのみ完結する処理、トリガーから呼び出される

### 9.3 Lab統計情報取得

**関数名**: `get_lab_statistics(target_lab_id UUID)`

**戻り値**: JSON

**説明**: Labの統計情報を取得（[`api/api-design.md`](../api/api-design.md)の機能別実装方式マッピングに記載）

**返却内容**:

- `member_count`: メンバー数
- `project_count`: プロジェクト数（削除・アーカイブ済みを除く）
- `activity_count`: Activity数（削除済みを除く）
- `activity_by_status`: ステータス別のActivity数

**呼び出し元**:

- Server Actions / API Routesから直接呼び出し可能
- 複雑なSQL処理（集計、統計計算）

**使用基準**: ✅ 複雑なSQL処理（集計、統計計算等）

---

## 10. トリガー一覧

| トリガー名                               | テーブル          | イベント                   | 説明                     | 使用基準                    |
| ---------------------------------------- | ----------------- | -------------------------- | ------------------------ | --------------------------- |
| `on_auth_user_created`                   | `auth.users`      | AFTER INSERT               | プロフィール自動作成     | ✅ トリガーから呼び出される |
| `on_lab_created`                         | `labs`            | AFTER INSERT               | ownerメンバー追加        | ✅ トリガーから呼び出される |
| `set_lab_slug_trigger`                   | `labs`            | BEFORE INSERT              | slug自動生成             | ✅ トリガーから呼び出される |
| `on_invitation_status_changed`           | `lab_invitations` | BEFORE UPDATE              | 招待承認時メンバー追加   | ✅ トリガーから呼び出される |
| `check_invitation_expiry_on_update`      | `lab_invitations` | BEFORE UPDATE              | 有効期限チェック         | ✅ トリガーから呼び出される |
| `set_activity_completed_at_trigger`      | `activities`      | BEFORE UPDATE              | 完了日時自動設定         | ✅ トリガーから呼び出される |
| `set_activity_started_at_trigger`        | `activities`      | BEFORE UPDATE              | 開始日時自動設定         | ✅ トリガーから呼び出される |
| `set_activity_position_trigger`          | `activities`      | BEFORE INSERT              | 位置自動設定             | ✅ トリガーから呼び出される |
| `recalculate_activity_position_trigger`  | `activities`      | BEFORE UPDATE              | 位置再計算               | ✅ トリガーから呼び出される |
| `notify_activity_changes`                | `activities`      | AFTER INSERT/UPDATE/DELETE | Activity変更通知         | ✅ トリガーから呼び出される |
| `notify_comment_added_trigger`           | `comments`        | AFTER INSERT               | コメント追加通知         | ✅ トリガーから呼び出される |
| `soft_delete_lab_related_data_trigger`   | `labs`            | AFTER UPDATE               | 関連データソフトデリート | ✅ トリガーから呼び出される |
| `soft_delete_project_activities_trigger` | `projects`        | AFTER UPDATE               | Activity連動削除         | ✅ トリガーから呼び出される |
| `update_*_updated_at`                    | 各テーブル        | BEFORE UPDATE              | updated_at自動更新       | ✅ トリガーから呼び出される |

---

## 11. 関数一覧と使用基準

| 関数名                                | 呼び出し元                             | 使用基準                                        | 備考                                              |
| ------------------------------------- | -------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| `update_updated_at_column()`          | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `handle_new_user()`                   | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `add_owner_on_lab_created()`          | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `set_lab_slug()`                      | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `add_member_on_invitation_accepted()` | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `check_invitation_expiry()`           | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `set_activity_completed_at()`         | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `set_activity_started_at()`           | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `set_activity_position()`             | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `notify_activity_change()`            | トリガー                               | ✅ トリガーから呼び出される                     | `pg_notify`使用                                   |
| `notify_comment_added()`              | トリガー                               | ✅ トリガーから呼び出される                     | `pg_notify`使用                                   |
| `soft_delete_lab_related_data()`      | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `soft_delete_project_activities()`    | トリガー                               | ✅ トリガーから呼び出される                     |                                                   |
| `generate_invitation_token()`         | Server Actions / API Routes            | ✅ データベース内完結                           | `gen_random_bytes`使用                            |
| `generate_slug()`                     | トリガー / Server Actions / API Routes | ✅ データベース内完結、トリガーから呼び出される |                                                   |
| `get_lab_statistics()`                | Server Actions / API Routes            | ✅ 複雑なSQL処理                                | [`api/api-design.md`](../api/api-design.md)に記載 |

---

## 12. api-design.mdとの整合性確認

すべてのトリガー・関数は[`api/api-design.md`](../api/api-design.md)のDatabase Functions基準に適合：

- ✅ **データベース内でのみ完結する処理**: すべての関数が該当
- ✅ **トリガーから呼び出される**: ほとんどの関数が該当
- ✅ **複雑なSQL処理**: `get_lab_statistics()`が該当
- ✅ **RLSポリシーで使用するヘルパー関数**: `rls-policies.md`に記載（このドキュメントの対象外）

**注意**: RLSポリシーで使用するヘルパー関数（`is_lab_member`, `is_lab_owner`等）は`rls-policies.md`に記載されている。
