# システム概要

Labioプロジェクトの現状のシステム構成を説明します。

---

## 🏗️ 環境分離

### 開発環境と本番環境の分離

| 環境 | Supabaseプロジェクト | 用途 | 環境変数 |
|------|---------------------|------|---------|
| **開発環境** | `labio-dev` (Project ID: `ucsurbtmhabygssexisq`) | ローカル開発、テスト | `.env.local` |
| **本番環境** | `labio-pro` (Project ID: `pnhgavzooyusuzsmuvev`) | 本番デプロイ | Vercel Environment Variables |

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
- ✅ **マイグレーションチェック**: `src/types/database.types.ts`が変更された場合、`supabase/migrations/`に新しいファイルが追加されているかチェック
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

#### 3. 本番環境への自動デプロイ

**ファイル**: `.github/workflows/deploy-production.yml`

**トリガー**:
- mainブランチへのpush時（`push`）

**実行内容**:
1. **マイグレーション適用**: `supabase/migrations/`のマイグレーションファイルを本番環境に適用
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

#### 方法1: MCPで直接SQL実行 → マイグレーションファイルを後から取得（推奨）

1. **MCPで開発環境にSQLを実行**
   ```
   「開発環境のSupabaseにSQLを実行して: [SQL文]」
   → mcp_supabase_execute_sql を実行
   ```

2. **動作確認**
   - 開発環境で動作確認

3. **マイグレーションファイルを取得**
   - **方法A**: Supabase Dashboard > Database > Migrations から取得
   - **方法B**: `bash .cursor/load-env.sh sh -c 'npx supabase db pull --linked'`

4. **マイグレーションファイルをコミット**
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add new column"
   git push
   ```

5. **mainブランチにマージ**
   - GitHub Actionsが自動的に本番環境にマイグレーションを適用

#### 方法2: マイグレーションファイルを先に作成

1. **マイグレーションファイルを作成**
   ```bash
   bash .cursor/load-env.sh sh -c 'npx supabase db diff --linked -f migration_name'
   ```

2. **開発環境に適用**
   ```bash
   bash .cursor/load-env.sh sh -c 'npx supabase db push'
   ```

3. **以降は方法1と同じ**（コミット・プッシュ・マージ）

### 自動チェック

**Gitフック（pre-commit）**:
- `src/types/database.types.ts`が変更された場合、`supabase/migrations/`に新しいファイルが追加されているかチェック
- 未追加の場合はコミットを拒否

**GitHub Actions CI**:
- PR作成時にも同様のチェックを実行
- 未追加の場合はCIが失敗し、PRがマージできない

---

## 🔐 環境変数管理

### 開発環境（`.env.local`）

**場所**: プロジェクトルートの`.env.local`（Gitにコミットしない）

**必要な環境変数**:
```env
# Supabase（開発環境）
NEXT_PUBLIC_SUPABASE_URL=https://ucsurbtmhabygssexisq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
SUPABASE_PROJECT_ID=ucsurbtmhabygssexisq

# MCP用（オプション）
SUPABASE_ACCESS_TOKEN=your-access-token
FIGMA_ACCESS_TOKEN=your-figma-token
```

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
- Production: 本番環境用
- Preview: PRごとのPreview環境用
- Development: ローカル開発用（通常は開発環境と同じ値）

---

## 🌿 Gitブランチ戦略

### ブランチ構成

- **`main`**: 本番環境にデプロイされるブランチ（保護されている）
- **`develop`**: 開発用ブランチ（直接プッシュ可能）
- **`feature/*`**: 機能開発用ブランチ

### mainブランチ保護ルール

**設定状況**: GitHub Settings > Rules > Rulesets で設定済み

**ルール**:
- ✅ **Restrict updates**: mainブランチへの直接プッシュを禁止
- ✅ **Require a pull request before merging**: PR必須
- ✅ **Block force pushes**: force pushを禁止
- ✅ **Require status checks to pass**: CIチェックが通るまでマージ不可

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
- Cursorから直接SupabaseにSQLを実行可能
- FigmaデザインからReactコンポーネントを自動生成可能

---

## 📊 システムフロー図

### 開発フロー

```
開発者
  ↓
1. MCPで開発環境にSQL実行
  ↓
2. 動作確認
  ↓
3. マイグレーションファイルを取得
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
本番環境（labio-pro）に自動適用
```

---

## 🔗 関連ドキュメント

- **開発環境構築ガイド**: `docs/CONTRIBUTING.md`（新規開発者は最初に読む）
- **アーキテクチャ**: `docs/architecture.md`
- **DB設計**: `docs/specs/database/schema.md`

