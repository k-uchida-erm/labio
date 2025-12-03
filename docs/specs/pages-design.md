# ページ設計書

## 1. 概要

本ドキュメントでは、Labioの全ページ構成とMVPロードマップを定義する。

### 1.1 関連仕様書

- [アーキテクチャ設計](../architecture.md) - 技術スタック、ディレクトリ構造
- [API設計](./api/api-design.md) - 実装方式の選択基準
- [機能仕様書](./features/) - 各機能の詳細仕様

---

## 2. MVPロードマップ

### 2.1 Phase 1: MVP（最小機能）

**目標**: 基本的な研究管理機能を提供し、研究室で実際に使える状態にする

#### 認証・認可
- [x] サインアップ（メール/パスワード）
- [x] ログイン（メール/パスワード）
- [x] ログアウト
- [x] セッション管理
- [ ] パスワードリセット

#### Lab管理
- [ ] Lab作成
- [ ] Lab一覧表示
- [ ] Lab詳細表示
- [ ] Lab設定（名前、説明）
- [ ] Labメンバー管理（招待、削除）
- [ ] Lab削除（ソフトデリート）

#### Project管理
- [ ] Project作成
- [ ] Project一覧表示
- [ ] Project詳細表示
- [ ] Project設定（名前、説明、担当者）
- [ ] Project削除（ソフトデリート）

#### Activity管理（基本）
- [ ] Activity作成
- [ ] Activity一覧表示（Listビュー）
- [ ] Activity詳細表示
- [ ] Activity更新
- [ ] Activity削除（ソフトデリート）
- [ ] ステータス変更（Todo / In Progress / In Review / Done）

#### ビュー
- [ ] Listビュー（基本）

#### プロフィール
- [ ] プロフィール表示（自分のみ）
- [ ] プロフィール編集（表示名、アバター）

### 2.2 Phase 2: 基本機能拡張

**目標**: より使いやすい機能を追加

#### Activity管理（拡張）
- [ ] Kanbanビュー
- [ ] タグ機能（作成、追加、削除、フィルタ）
- [ ] コメント機能（追加、編集、削除、スレッド）
- [ ] 添付ファイル（アップロード、ダウンロード、削除）

#### Project管理（拡張）
- [ ] Projectアーカイブ
- [ ] Project期間設定

#### ナビゲーション
- [ ] マイアクティビティページ（ホーム）
- [ ] インボックスページ（レビュー依頼、質問）
- [ ] Allプロジェクトページ

### 2.3 Phase 3: 高度な機能

**目標**: 研究効率を向上させる機能を追加

#### ビュー拡張
- [ ] Ganttビュー
- [ ] Calendarビュー
- [ ] Storyビュー

#### AI機能
- [ ] AI要約生成
- [ ] Marp資料生成

#### 通知機能
- [ ] 通知一覧
- [ ] リアルタイム通知
- [ ] メール通知（オプション）

### 2.4 Phase 4: 将来構想

- モバイルアプリ（React Native）
- 外部サービス連携（Slack, Notion等）
- 分析ダッシュボード
- OAuth認証（Google, GitHub等）
- マジックリンク認証
- 2要素認証（2FA）

---

## 3. ページ一覧

### 3.1 認証関連ページ

| パス | ページ名 | 認証 | Phase | 説明 |
|------|---------|------|-------|------|
| `/login` | ログイン | 不要 | 1 | ログインフォーム |
| `/signup` | サインアップ | 不要 | 1 | 新規登録フォーム |
| `/forgot-password` | パスワードリセット | 不要 | 1 | リセットメール送信 |
| `/reset-password` | パスワード再設定 | 不要* | 1 | 新パスワード入力 |

\*リセットトークンが必要

### 3.2 ダッシュボード関連ページ

| パス | ページ名 | 認証 | Phase | 説明 |
|------|---------|------|-------|------|
| `/` | ホーム（マイアクティビティ） | 必要 | 2 | 自分のActivity一覧 |
| `/inbox` | インボックス | 必要 | 2 | レビュー依頼、質問一覧 |
| `/projects` | Allプロジェクト | 必要 | 2 | 全Labのプロジェクト一覧 |

### 3.3 Lab関連ページ

| パス | ページ名 | 認証 | Phase | 説明 |
|------|---------|------|-------|------|
| `/labs` | Lab一覧 | 必要 | 1 | 参加しているLab一覧 |
| `/[labSlug]` | Lab詳細 | 必要 | 1 | Lab内のProject一覧 |
| `/[labSlug]/settings` | Lab設定 | 必要 | 1 | Lab設定（名前、説明、メンバー管理） |

### 3.4 Project関連ページ

| パス | ページ名 | 認証 | Phase | 説明 |
|------|---------|------|-------|------|
| `/[labSlug]/[projectKey]` | Project詳細 | 必要 | 1 | Activity一覧（List/Kanban） |
| `/[labSlug]/[projectKey]/settings` | Project設定 | 必要 | 1 | Project設定（名前、説明、key、担当者） |
| `/[labSlug]/[projectKey]/[sequenceNumber]` | Activity詳細 | 必要 | 1 | Activity詳細、コメント、添付ファイル |

### 3.5 プロフィール関連ページ

| パス | ページ名 | 認証 | Phase | 説明 |
|------|---------|------|-------|------|
| `/profile` | 自分のプロフィール | 必要 | 1 | プロフィール表示・編集 |
| `/profile/[userId]` | ユーザープロフィール | 必要 | 2 | 他ユーザーのプロフィール表示 |

### 3.6 設定ページ

| パス | ページ名 | 認証 | Phase | 説明 |
|------|---------|------|-------|------|
| `/settings/profile` | プロフィール設定 | 必要 | 1 | プロフィール編集 |
| `/settings/security` | セキュリティ設定 | 必要 | 1 | パスワード変更 |

---

## 4. ページ詳細設計

### 4.1 認証関連ページ

#### `/login` - ログイン

**機能**:
- メールアドレス・パスワードでログイン
- エラーメッセージ表示
- 「パスワードを忘れた場合」リンク

**実装方式**: Server Actions

**Phase**: 1

#### `/signup` - サインアップ

**機能**:
- メールアドレス・パスワードでサインアップ
- 表示名設定（オプション）
- バリデーション
- 確認メール送信

**実装方式**: Server Actions

**Phase**: 1

#### `/forgot-password` - パスワードリセット

**機能**:
- メールアドレス入力
- リセットメール送信

**実装方式**: Server Actions

**Phase**: 1

#### `/reset-password` - パスワード再設定

**機能**:
- リセットトークン検証
- 新しいパスワード入力
- パスワード変更

**実装方式**: Server Actions

**Phase**: 1

---

### 4.2 ダッシュボード関連ページ

#### `/` - ホーム（マイアクティビティ）

**機能**:
- 自分のActivity一覧表示
- フィルタリング（ステータス、タイプ、タグ）
- 検索
- ソート
- 各Activityへのリンク

**実装方式**: Supabase Client SDK

**Phase**: 2

#### `/inbox` - インボックス

**機能**:
- レビュー依頼（`type: 'review'`, `status: 'in_review'`）一覧
- 質問（`type: 'question'`）一覧
- 未読/既読管理（将来）
- フィルタリング

**実装方式**: Supabase Client SDK

**Phase**: 2

#### `/projects` - Allプロジェクト

**機能**:
- 全Labのプロジェクト一覧
- Lab別にグループ化
- フィルタリング（Lab、担当者、ステータス）
- 検索
- 各Projectへのリンク

**実装方式**: Supabase Client SDK

**Phase**: 2

---

### 4.3 Lab関連ページ

#### `/labs` - Lab一覧

**機能**:
- 参加しているLab一覧
- Lab作成ボタン
- Lab検索
- 各Labへのリンク

**実装方式**: Supabase Client SDK

**Phase**: 1

#### `/[labSlug]` - Lab詳細

**機能**:
- Lab情報表示（名前、説明、メンバー）
- Project一覧表示
- Project作成ボタン
- Lab設定へのリンク

**実装方式**: Supabase Client SDK

**Phase**: 1

#### `/[labSlug]/settings` - Lab設定

**機能**:
- Lab情報編集（名前、説明）
- メンバー一覧表示
- メンバー招待
- メンバー削除
- メンバーのownerフラグ変更
- Lab削除

**実装方式**: Server Actions

**権限**: ownerのみ編集可能

**Phase**: 1

---

### 4.4 Project関連ページ

#### `/[labSlug]/[projectKey]` - Project詳細

**機能**:
- Activity一覧表示（List/Kanbanビュー切替）
- Activity作成
- フィルタリング（ステータス、タイプ、タグ）
- 検索
- ソート
- ビュー切替（List / Kanban）
- Project設定へのリンク

**実装方式**: Supabase Client SDK

**Phase**: 1（Listビューのみ）、2（Kanbanビュー追加）

**URL例**: `/tokyo-univ-ai-lab-a3f2/PINN`

#### `/[labSlug]/[projectKey]/settings` - Project設定

**機能**:
- Project情報編集（名前、説明、key）
- 担当者設定
- 期間設定（開始日、終了日）
- Projectアーカイブ
- Project削除

**実装方式**: Server Actions

**権限**: 管理者は全Project編集可能、担当者は自分のProject編集可能

**Phase**: 1

**URL例**: `/tokyo-univ-ai-lab-a3f2/PINN/settings`

#### `/[labSlug]/[projectKey]/[sequenceNumber]` - Activity詳細

**機能**:
- Activity詳細表示（タイトル、説明、タイプ、ステータス、期限等）
- Activity編集
- タグ管理（追加、削除）
- コメント一覧表示
- コメント追加・編集・削除
- 添付ファイル一覧表示
- 添付ファイルアップロード・削除

**実装方式**: Supabase Client SDK（表示）、Server Actions（編集）

**Phase**: 1（基本）、2（コメント・添付ファイル追加）

**URL例**: `/tokyo-univ-ai-lab-a3f2/PINN/1`（表示ID: `PINN-1`）

---

### 4.5 プロフィール関連ページ

#### `/profile` - 自分のプロフィール

**機能**:
- プロフィール情報表示
- プロフィール編集（表示名、アバター）
- 自分のActivity一覧（オプション）
- 自分のProject一覧（オプション）

**実装方式**: Supabase Client SDK（表示）、Server Actions（編集）

**Phase**: 1

#### `/profile/[userId]` - ユーザープロフィール

**機能**:
- ユーザー情報表示（表示名、アバター）
- 同じLabのメンバーのみ閲覧可能

**実装方式**: Supabase Client SDK

**権限**: 同じLabのメンバーのみ閲覧可能

**Phase**: 2

---

### 4.6 設定ページ

#### `/settings/profile` - プロフィール設定

**機能**:
- 表示名編集
- アバター画像アップロード・削除

**実装方式**: Server Actions

**Phase**: 1

#### `/settings/security` - セキュリティ設定

**機能**:
- パスワード変更
- セッション管理（将来）

**実装方式**: Server Actions

**Phase**: 1

---

## 5. ルーティング設計

### 5.1 ルーティング方式

Labへのアクセスは**slugベース**で実装する。

#### Labのslug

- **フィールド**: `labs.slug`（UNIQUE制約）
- **生成方法**: Lab作成時に`name`から自動生成（`set_lab_slug()`トリガー）
- **形式**: `{lab名のslug}-{ランダムな数桁（4-6桁）}`（例: `tokyo-univ-ai-lab-a3f2`）
- **一意性**: グローバルにユニーク（末尾のランダム文字列で一意性を確保）
- **変更**: Lab名変更時もslugは変更可能（将来対応）

**実装**:
- Lab作成時: `set_lab_slug()`トリガーで自動生成
- Lab取得時: `slug`で検索（`SELECT * FROM labs WHERE slug = ?`）

#### Projectのkey

- **フィールド**: `projects.key`（Lab内で一意、`UNIQUE(lab_id, key)`）
- **設定方法**: ユーザーが手動で設定（2-5桁の英数字）
- **形式**: 2-5桁の英数字（例: `PINN`, `ML`, `AI`, `RESEARCH`）
- **一意性**: Lab内でのみ一意（異なるLabで同じkeyのProjectが存在可能）
- **変更**: Project作成後も変更可能

**実装**:
- Project作成時: ユーザーがkeyを入力、Server Actionでバリデーション（Lab内で一意チェック）
- Project取得時: `lab_id`と`key`で検索（`SELECT * FROM projects WHERE lab_id = ? AND key = ?`）

#### Activityの識別子

- **フィールド**: `activities.sequence_number`（Project内で連番）
- **生成方法**: Activity作成時に自動設定（`set_activity_sequence_number()`トリガー）
- **形式**: Project内で1から始まる連番
- **表示ID**: `{projectKey}-{sequence_number}`（例: `PINN-1`, `PINN-2`, `ML-1`）
- **一意性**: Lab内で`project_id + sequence_number`が一意（`UNIQUE(lab_id, project_id, sequence_number)`）

**実装**:
- Activity作成時: `set_activity_sequence_number()`トリガーで自動設定
- Activity取得時: UUIDで直接取得、または`project_id`と`sequence_number`で検索

### 5.2 ルート構造

```
/                           # ホーム（マイアクティビティ）
/login                      # ログイン
/signup                     # サインアップ
/forgot-password            # パスワードリセット
/reset-password             # パスワード再設定
/inbox                      # インボックス
/projects                   # Allプロジェクト
/labs                       # Lab一覧
/[labSlug]                  # Lab詳細（slugでアクセス）
/[labSlug]/settings         # Lab設定
/[labSlug]/[projectKey]    # Project詳細（keyでアクセス、例: /tokyo-univ-ai-lab-a3f2/PINN）
/[labSlug]/[projectKey]/settings  # Project設定
/[labSlug]/[projectKey]/[sequenceNumber]  # Activity詳細（sequence_numberでアクセス、例: /tokyo-univ-ai-lab-a3f2/PINN/1）
/profile                    # 自分のプロフィール
/profile/[userId]           # ユーザープロフィール（UUIDでアクセス）
/settings/profile           # プロフィール設定
/settings/security          # セキュリティ設定
```

**ルーティングパターン**:
- Lab: `/[labSlug]` - slugでアクセス（例: `/tokyo-univ-ai-lab-a3f2`）
  - Labのslugは**グローバルにユニーク**（`UNIQUE`制約）
  - 形式: `{lab名のslug}-{ランダムな数桁}`（例: `tokyo-univ-ai-lab-a3f2`）
- Project: `/[labSlug]/[projectKey]` - keyでアクセス（例: `/tokyo-univ-ai-lab-a3f2/PINN`）
  - Projectのkeyは**Lab内で一意**（`UNIQUE(lab_id, key)`）
  - 形式: 2-5桁の英数字（例: `PINN`, `ML`, `AI`）
- Activity: `/[labSlug]/[projectKey]/[sequenceNumber]` - sequence_numberでアクセス（例: `/tokyo-univ-ai-lab-a3f2/PINN/1`）
  - Activityの表示ID: `{projectKey}-{sequenceNumber}`（例: `PINN-1`）
  - URLでは`/[labSlug]/[projectKey]/[sequenceNumber]`形式でアクセス

**実装例**:
```typescript
// Lab取得
const { data: lab } = await supabase
  .from('labs')
  .select('*')
  .eq('slug', labSlug)
  .is('deleted_at', null)
  .single();

// Project取得（keyで検索）
const { data: project } = await supabase
  .from('projects')
  .select('*')
  .eq('lab_id', labId)
  .eq('key', projectKey)
  .is('deleted_at', null)
  .single();

// Activity取得（sequence_numberで検索）
const { data: activity } = await supabase
  .from('activities')
  .select('*')
  .eq('lab_id', labId)
  .eq('project_id', projectId)
  .eq('sequence_number', sequenceNumber)
  .is('deleted_at', null)
  .single();

// Activityの表示ID生成
const displayId = `${project.key}-${activity.sequence_number}`; // PINN-1
```

### 5.3 認証保護

**認証が必要なページ**:
- `/`（ホーム）
- `/inbox`
- `/projects`
- `/labs`
- `/[labSlug]/*`
- `/profile/*`
- `/settings/*`

**認証不要なページ**:
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`

**実装**: Next.js Middlewareで保護

---

## 6. ページ遷移フロー

### 6.1 新規ユーザーフロー

```
サインアップ → メール確認 → ログイン → Lab作成（slug自動生成） → Project作成（key設定） → Activity作成（sequence_number自動設定）
```

**詳細**:
- Lab作成時: Lab名を入力 → slugが自動生成（例: `tokyo-univ-ai-lab-a3f2`）
- Project作成時: タイトルとkey（2-5桁）を入力 → Lab内でkeyが一意であることを確認
- Activity作成時: sequence_numberが自動設定（例: `PINN-1`, `PINN-2`）

### 6.2 既存ユーザーフロー

```
ログイン → ホーム（マイアクティビティ） → Lab詳細 → Project詳細（keyでアクセス） → Activity詳細（sequence_numberでアクセス）
```

**URL例**:
- Lab詳細: `/tokyo-univ-ai-lab-a3f2`
- Project詳細: `/tokyo-univ-ai-lab-a3f2/PINN`
- Activity詳細: `/tokyo-univ-ai-lab-a3f2/PINN/1`（表示ID: `PINN-1`）

### 6.3 Lab管理フロー

```
Lab一覧 → Lab詳細 → Lab設定 → メンバー招待 → Project作成（key設定）
```

---

## 7. パフォーマンス目標

| ページ | 目標ロード時間 |
|-------|--------------|
| ログイン | 500ms以下 |
| Lab一覧 | 500ms以下 |
| Project詳細 | 800ms以下 |
| Activity詳細 | 500ms以下 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 変更者 |
|------|-----------|---------|--------|
| 2024-12-03 | 1.0 | 初版作成 | - |

