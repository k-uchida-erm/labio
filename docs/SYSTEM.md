# システム概要

Labioプロジェクトの現状のシステム構成を説明します。

---

## 🏗️ 環境分離

### 開発環境と本番環境の分離

| 環境         | Supabaseプロジェクト                              | 用途                 | 環境変数                     |
| ------------ | ------------------------------------------------- | -------------------- | ---------------------------- |
| **開発環境** | `labio-dev` (Project ID: `ucsurbtmhabygssexisq`)  | ローカル開発、テスト | `.env.local`                 |
| **本番環境** | `labio-prod` (Project ID: `pnhgavzooyusuzsmuvev`) | 本番デプロイ         | Vercel Environment Variables |

### データベース

- **スキーマ**: マイグレーションファイル（`supabase/migrations/`）で管理
- **データ**: 開発環境と本番環境で分離（データは同期しない）
- **自動適用**: mainブランチにマージされると、GitHub Actionsが本番環境に自動適用

---

## 🔄 CI/CD自動化

### GitHub Actionsワークフロー

#### 1. CI（Continuous Integration）

**ファイル**: `.github/workflows/ci.yml`

**トリガー**:

- PR作成時（`pull_request`）
- mainブランチへのpush時（`push`）

**実行内容**:

- ✅ **マイグレーション検証**（PR時のみ）: ローカルのマイグレーションファイルとリモート（labio-dev）のマイグレーション履歴を照合し、矛盾がないか確認（**実際には適用しない**）
- ✅ **Lintチェック**: ESLintでコード品質をチェック
- ✅ **型チェック**: TypeScriptの型エラーを検出
- ✅ **フォーマットチェック**: Prettierでフォーマットをチェック
- ✅ **テスト実行**: Vitestで単体テストを実行

**失敗時の動作**:

- PRがマージできない（CIチェックが必須）
- エラーメッセージがPRに表示される

#### 2. CodeRabbit自動コードレビュー

**設定場所**: [CodeRabbit](https://coderabbit.ai/)（GitHubアプリとして連携）

**動作**:

- **PR作成時**: 自動的にコードレビューを実行
- **コード変更時**: PRに新しいコメントが追加される
- **レビュー内容**: コード品質、バグ、セキュリティ、パフォーマンス、ベストプラクティス

**設定状況**:

- GitHub MarketplaceまたはCodeRabbit Dashboardから設定可能

**料金プラン**:

- ✅ **無料プラン**: 基本的なコードレビュー機能が利用可能
  - PRの要約機能
  - 基本的なコードレビュー
  - VS Code拡張機能
- 🎁 **オープンソースプロジェクト**: Proプランの機能を無償で提供
  - 公開リポジトリの場合、Proプランの機能が無料で利用可能
- 💰 **有料プラン**:
  - Lite: 月額$15/開発者
  - Pro: 月額$30/開発者
  - Enterprise: 要問い合わせ

**注意**: このプロジェクト（`k-uchida-erm/labio`）が公開リポジトリの場合、無料でProプランの機能が利用可能です。

**トラブルシューティング**:

- **GitHub Marketplaceの利用規約エラー**: 組織のオーナーに依頼するか、CodeRabbit Dashboardから設定

#### 3. 開発環境への自動デプロイ

**ファイル**: `.github/workflows/deploy-develop.yml`

**トリガー**:

- `develop`ブランチへのpush時（`push`）
  - **重要**: `feature/xxx`ブランチへのpushでは実行されない
  - **重要**: PR作成時にも実行されない（マージ後のpushのみ）

**実行内容**:

1. **マイグレーション適用**: `supabase/migrations/`のマイグレーションファイルを`labio-dev`に**実際に適用**（DBが書き換わる）
2. **型定義生成**: `labio-dev`からTypeScript型定義を生成
3. **型定義コミット**: 生成した型定義を自動的にコミット

**注意事項**:

- ⚠️ **実際にDBが書き換わります**（試験的ではありません）
- ✅ `feature/xxx`ブランチにpushしても、DBは書き換わりません
- ✅ PRを作成しても、DBは書き換わりません
- ✅ `develop`ブランチにマージ（push）した瞬間に、`labio-dev`のDBが更新されます

#### 4. 本番環境への自動デプロイ

**ファイル**: `.github/workflows/deploy-production.yml`

**トリガー**:

- mainブランチへのpush時（`push`）

**実行内容**:

1. **マイグレーション適用**: `supabase/migrations/`のマイグレーションファイルを本番環境に**実際に適用**（DBが書き換わる）
2. **型定義生成**: 本番環境からTypeScript型定義を生成
3. **型定義コミット**: 生成した型定義を自動的にコミット

**必要なSecrets**:

- `SUPABASE_ACCESS_TOKEN`: Supabase Access Token
- `SUPABASE_PROJECT_ID_PROD`: 本番環境のProject ID (`pnhgavzooyusuzsmuvev`)

### Vercel自動デプロイ

**設定状況**: Vercel Dashboardで設定済み

**動作**:

- **PR作成時**: Preview環境に自動デプロイ（PRごとにURLが生成される）
- **mainブランチにマージ時**: 本番環境に自動デプロイ

**環境変数**:

- Production, Preview, Development環境でそれぞれ設定済み
- 本番環境用のSupabase認証情報を設定済み

---

## 📦 データベースマイグレーション

### マイグレーションファイルの管理

**場所**: `supabase/migrations/`

**形式**: `{timestamp}_{name}.sql`

**例**:

```
supabase/migrations/
├── 20251203160813_current_schema.sql
├── 20251203140958_add_project_key_and_activity_sequence.sql
└── ...
```

### マイグレーションの作成方法

#### マイグレーションファイルを直接作成

1. **マイグレーションファイルを作成**

   ```bash
   npx supabase migration new migration_name
   ```

   例: `npx supabase migration new add_user_table`

2. **SQLを直接書く**

   ```sql
   -- supabase/migrations/20251205111107_add_user_table.sql
   CREATE TABLE public.users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

3. **ローカルDBに適用して動作確認**

   ```bash
   npx supabase db reset --local
   # または
   make supabase-reset
   ```

4. **マイグレーションファイルをコミット**

   ```bash
   git add supabase/migrations/
   git commit -m "feat: add user table"
   git push
   ```

   > **注意**: pre-commitフックが自動的に型定義を生成・ステージングします

5. **mainブランチにマージ**
   - GitHub Actionsが自動的に本番環境にマイグレーションを適用

### 自動チェック

**Gitフック（pre-commit）**:

- `src/types/database.types.ts`が変更された場合、`supabase/migrations/`に新しいファイルが追加されているかチェック
- 未追加の場合はコミットを拒否

**GitHub Actions CI**:

- PR作成時にも同様のチェックを実行
- 未追加の場合はCIが失敗し、PRがマージできない

---

## 🔐 環境変数管理

### 開発環境（`.env.local` / `.env.develop`）

**場所**: プロジェクトルート（Gitにコミットしない）

**ローカルSupabase（デフォルト）**:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon>
SUPABASE_SERVICE_ROLE_KEY=<local service_role>
# SUPABASE_PROJECT_ID はローカルでは任意（空でも可）

# MCP用（任意）
SUPABASE_ACCESS_TOKEN=<your supabase access token>
FIGMA_ACCESS_TOKEN=<your figma token>
```

**共有開発（例: labio-dev）を使う場合**:

```env
# .env.develop にリモートのURL/キーを入れる（コミットしない）
NEXT_PUBLIC_SUPABASE_URL=https://<develop>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<develop anon>
SUPABASE_SERVICE_ROLE_KEY=<develop service_role>
SUPABASE_PROJECT_ID=<develop project id>
```

切替は `make env-use-develop`（一時的に develop を適用）/`make env-restore-local`（ローカルに戻す）で行う。

### 本番環境（Vercel）

**設定場所**: Vercel Dashboard > Settings > Environment Variables

**必要な環境変数**:

```env
# Supabase（本番環境）
NEXT_PUBLIC_SUPABASE_URL=https://pnhgavzooyusuzsmuvev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
```

**環境**:

- Production: 本番環境（main → labio-prod）
- Preview: PRごとのPreview環境
- Development: ローカル開発（デフォルトはローカルSupabase／必要時のみ develop = labio-dev に切替）

## 🚀 開発フロー概要（運用）

- ブランチ戦略: `develop` から `feature/aa_bb`（タスク名をスネークケース）を切る。`develop` は labio-dev、`main` は labio-prod に接続
- UI: Figmaまたは既存ページを参照し、コード上で0から新デザインを作らない
- DB: マイグレーションファイルを直接作成（`npx supabase migration new`）。MCP（`mcp_supabase_local_pg_query`）は読み取り専用で使用。pre-commit で型生成と危険DDLチェック（DROP/TRUNCATE）およびマイグレ有無チェック
- テスト: 必要に応じ `make test` などを実行
- レビュー: PR → CodeRabbit → 指摘対応 → develop へマージ（**マージした瞬間にlabio-devのDBが実際に書き換わる**）
- 本番: main へマージで labio-prod、本番用環境変数は GitHub Secrets から注入され Vercel に自動デプロイ

**重要**:

- `feature/xxx`ブランチにpushしても、DBは書き換わりません（CIチェックのみ実行）
- PRを作成しても、DBは書き換わりません（CIチェックのみ実行）
- `develop`ブランチにマージ（push）した瞬間に、`labio-dev`のDBが**実際に更新**されます

---

## 🌿 Gitブランチ戦略

### ブランチ構成

- **`main`**: 本番環境にデプロイされるブランチ（保護されている）
- **`develop`**: 開発用ブランチ（**推奨: 保護ルールを設定**）
- **`feature/*`**: 機能開発用ブランチ

### mainブランチ保護ルール

**設定状況**: GitHub Settings > Rules > Rulesets で設定済み

**ルール**:

- ✅ **Restrict updates**: mainブランチへの直接プッシュを禁止
- ✅ **Require a pull request before merging**: PR必須
- ✅ **Block force pushes**: force pushを禁止
- ✅ **Require status checks to pass**: CIチェックが通るまでマージ不可

### developブランチ保護ルール（推奨）

**設定場所**: GitHub Settings > Branches > Branch protection rules

**推奨ルール**:

- ✅ **Require a pull request before merging**: PR必須（直接pushを禁止）
- ✅ **Require status checks to pass**: CIチェック（`lint-and-test`）が通るまでマージ不可
- ✅ **Block force pushes**: force pushを禁止

**効果**:

- `feature/xxx`から`develop`への直接pushが禁止される
- PRを作成し、CIチェックが通るまでマージできない
- 問題のあるコードが`develop`にマージされるのを防げる

**ワークフロー**:

1. `develop`ブランチから`feature/*`ブランチを作成
2. 機能開発・テスト
3. PRを作成（`develop`または`main`へ）
4. CIチェックが通る
5. CodeRabbit自動コードレビュー（設定されている場合）
6. レビュー・承認
7. マージ
8. `main`にマージされた場合、自動的に本番環境にデプロイ

---

## 🛠️ 開発ツール

### Docker

**用途**: 開発環境の統一

**コマンド**:

```bash
make up        # コンテナを起動
make down      # コンテナを停止
make shell     # コンテナ内でシェルを起動
make build     # イメージをビルド
```

### Gitフック

**設定**: `make setup-hooks`でセットアップ

**動作**:

- コミット前にDB変更をチェック
- マイグレーションファイルが未追加の場合はコミットを拒否

### MCP（Model Context Protocol）

**用途**: AI駆動開発

**設定**:

- Supabase MCP: `SUPABASE_ACCESS_TOKEN`を設定
- Figma MCP: `FIGMA_ACCESS_TOKEN`を設定（デザイナーのみ）

**使用方法**:

- Supabase MCP（`mcp_supabase_local_pg_query`）: ローカルSupabaseに対して読み取り専用クエリを実行（テーブル構造の確認など）
- Figma MCP: FigmaデザインからReactコンポーネントを自動生成可能
- **注意**: DB書き込みはマイグレーションファイルを直接作成（MCPでは書き込み不可）

---

## 📊 システムフロー図

### 開発フロー

```
開発者
  ↓
1. マイグレーションファイルを作成（`npx supabase migration new`）
  ↓
2. SQLを直接書く
  ↓
3. ローカルDBに適用して動作確認
  ↓
4. コミット・プッシュ
  ↓
5. PR作成
  ↓
6. CIチェック（Lint, TypeCheck, Test, マイグレーションチェック）
  ↓
7. CodeRabbit自動コードレビュー（設定されている場合）
  ↓
8. レビュー・承認
  ↓
9. mainブランチにマージ
  ↓
9. GitHub Actionsが自動実行
  ├─→ 本番環境にマイグレーション適用
  ├─→ 型定義を生成・コミット
  └─→ Vercelが本番環境にデプロイ
```

### データベース同期フロー

```
開発環境（labio-dev）
  ↓
マイグレーションファイル作成
  ↓
Gitにコミット
  ↓
mainブランチにマージ
  ↓
GitHub Actions
  ↓
本番環境（labio-prod）に自動適用
```

---

## 🔗 関連ドキュメント

- **開発環境構築ガイド**: `docs/CONTRIBUTING.md`（新規開発者は最初に読む）
- **アーキテクチャ**: `docs/architecture.md`
- **DB設計**: `docs/specs/database/schema.md`
