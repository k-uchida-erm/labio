# デプロイメントガイド

## 1. 概要

本ドキュメントでは、Labioのデプロイメント戦略と、開発環境から本番環境への**自動マイグレーション**手順を説明します。

**重要**: スキーマ、トリガー、関数、RLSポリシーは**マイグレーションファイルで管理**し、本番環境に自動適用されます。手動で設定する必要はありません！

---

## 2. 環境分離戦略

### 2.1 Supabaseプロジェクトの分離

| 環境 | Supabaseプロジェクト | 用途 |
|------|---------------------|------|
| **開発環境** | 開発用プロジェクト | ローカル開発、テスト |
| **本番環境** | 本番用プロジェクト | 本番デプロイ |

### 2.2 自動マイグレーション

**重要**: スキーマ、トリガー、関数、RLSポリシーは**マイグレーションファイルで管理**し、本番環境に自動適用します。

**データは同期しません**（スキーマのみ同期）

---

## 3. マイグレーション管理

### 3.1 マイグレーションファイルの場所

```
supabase/
└── migrations/
    ├── 20241203000000_initial_schema.sql
    ├── 20241204000000_add_sequence_number.sql
    └── ...
```

### 3.2 マイグレーションの作成方法

#### 方法1: Supabase MCP（推奨）

```bash
# Cursorで実行
「開発環境のSupabaseにマイグレーションを適用して」
→ mcp_supabase_apply_migration を実行
→ マイグレーションファイルが自動生成される
```

#### 方法2: Supabase CLI

```bash
# 開発環境の変更をマイグレーションとして生成
npx supabase db diff -f migration_name --project-id <dev-project-id>

# マイグレーションファイルが supabase/migrations/ に作成される
```

### 3.3 マイグレーションの内容

マイグレーションファイルには以下を含めます：

- ✅ **スキーマ定義**: テーブル、カラム、インデックス、制約
- ✅ **ENUM型**: カスタムENUM型
- ✅ **関数**: PostgreSQL関数
- ✅ **トリガー**: データベーストリガー
- ✅ **RLSポリシー**: Row Level Securityポリシー
- ❌ **データ**: データは含めない（seed.sqlで管理）

---

## 4. 本番環境への自動デプロイ

### 4.1 GitHub Actionsワークフロー

`.github/workflows/deploy-production.yml`を作成：

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-migrations:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install Supabase CLI
        run: npm install -g supabase
      
      - name: Apply migrations to production
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID_PROD }}
        run: |
          # 本番環境にマイグレーションを適用
          supabase db push --project-id $SUPABASE_PROJECT_ID_PROD
      
      - name: Generate TypeScript types
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID_PROD }}
        run: |
          supabase gen types typescript --project-id $SUPABASE_PROJECT_ID_PROD > src/types/database.types.ts
      
      - name: Commit type definitions
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/types/database.types.ts
          git commit -m "chore: update database types from production" || exit 0
          git push
```

### 4.2 GitHub Secretsの設定

**本番環境用のSupabaseプロジェクトを作成したら設定**:

GitHubリポジトリ > Settings > Secrets and variables > Actions で以下を設定：

| Secret名 | 説明 | 値 |
|---------|------|-----|
| `SUPABASE_ACCESS_TOKEN` | Supabase Access Token | [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)から取得（開発環境と同じでOK） |
| `SUPABASE_PROJECT_ID_PROD` | 本番環境のProject ID | 本番用SupabaseプロジェクトのProject ID |

**設定方法**:
1. GitHubリポジトリ > Settings > Secrets and variables > Actions
2. 「New repository secret」をクリック
3. NameとValueを入力
4. 「Add secret」をクリック

**注意**: MVP段階では設定不要です。本番環境用プロジェクトを作成するまで、このワークフローはスキップされます。

### 4.3 デプロイフロー

```
1. 開発環境でDB変更
   ↓
2. マイグレーションファイルを作成（supabase/migrations/）
   ↓
3. マイグレーションをコミット・プッシュ
   ↓
4. mainブランチにマージ
   ↓
5. GitHub Actionsが自動実行
   ↓
6. 本番環境にマイグレーションを適用
   ↓
7. 型定義を自動生成・コミット
   ↓
8. Vercelが自動デプロイ（環境変数は本番プロジェクトを参照）
```

---

## 5. 開発環境での作業フロー

### 5.1 DB変更時の手順

#### 方法1: Supabase MCP（推奨）

1. **開発環境で変更**
   ```
   「開発環境のSupabaseにマイグレーションを適用して: [SQL文]」
   → mcp_supabase_apply_migration を実行
   ```

2. **マイグレーションファイルを取得**
   ```bash
   # 開発環境からマイグレーションファイルを取得
   npx supabase db pull --project-id <dev-project-id>
   # または
   # Supabase Dashboard > Database > Migrations からダウンロード
   ```

3. **マイグレーションファイルを確認**
   - `supabase/migrations/`に作成されたファイルを確認
   - 必要に応じて編集

4. **コミット・プッシュ**
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add new column to activities table"
   git push
   ```

5. **mainブランチにマージ**
   - PRを作成
   - レビュー・承認
   - mainにマージ

6. **自動デプロイ**
   - GitHub Actionsが本番環境にマイグレーションを適用
   - Vercelが自動デプロイ

#### 方法2: Supabase CLI

1. **開発環境で変更**
   - Supabase Dashboardで直接変更

2. **マイグレーションファイルを作成**
   ```bash
   # 変更をマイグレーションとして生成
   npx supabase db diff -f add_new_column --project-id <dev-project-id>
   ```

3. **以降は方法1と同じ**

---

## 6. 本番環境のセットアップ

### 6.1 本番用Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard)で新しいプロジェクトを作成
2. プロジェクト名: `labio-production`
3. リージョン: 本番環境に近いリージョンを選択

### 6.2 初期マイグレーションの適用

```bash
# 本番環境に初回マイグレーションを適用
export SUPABASE_ACCESS_TOKEN=your-token
export SUPABASE_PROJECT_ID_PROD=your-production-project-id

# すべてのマイグレーションを適用
supabase db push --project-id $SUPABASE_PROJECT_ID_PROD
```

### 6.3 Vercel環境変数の更新

Vercel Dashboard > Settings > Environment Variables で以下を更新：

| 環境変数名 | 値 | 環境 |
|-----------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 本番プロジェクトのURL | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本番プロジェクトのAnon Key | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | 本番プロジェクトのService Role Key | Production |

---

## 7. マイグレーションのベストプラクティス

### 7.1 マイグレーションファイルの命名規則

```
{YYYYMMDDHHMMSS}_{description}.sql
```

例:
- `20241204000000_add_sequence_number.sql`
- `20241205000000_add_is_owner_flag.sql`

### 7.2 マイグレーションの内容

✅ **含めるべきもの**:
- CREATE TABLE
- ALTER TABLE
- CREATE FUNCTION
- CREATE TRIGGER
- CREATE POLICY（RLS）
- CREATE TYPE（ENUM）

❌ **含めないもの**:
- INSERT（データはseed.sqlで管理）
- UPDATE（データ変更）
- DELETE（データ削除）

### 7.3 ロールバック

マイグレーションは**不可逆**です。ロールバックが必要な場合は、新しいマイグレーションで元に戻します。

例:
```sql
-- 20241204000000_add_column.sql
ALTER TABLE activities ADD COLUMN new_column TEXT;

-- 20241205000000_remove_column.sql（ロールバック）
ALTER TABLE activities DROP COLUMN new_column;
```

---

## 8. トラブルシューティング

### 8.1 マイグレーションが失敗する

**症状**: GitHub Actionsでマイグレーション適用が失敗

**確認事項**:
1. `SUPABASE_ACCESS_TOKEN`が正しく設定されているか
2. `SUPABASE_PROJECT_ID_PROD`が正しいか
3. マイグレーションファイルに構文エラーがないか
4. 本番環境のデータベースにアクセス権限があるか

### 8.2 開発環境と本番環境でスキーマが異なる

**症状**: 開発環境では動作するが、本番環境でエラー

**確認事項**:
1. すべてのマイグレーションが本番環境に適用されているか
2. マイグレーションファイルが正しくコミットされているか
3. GitHub Actionsのログを確認

### 8.3 型定義が古い

**症状**: TypeScriptの型エラーが発生

**解決方法**:
```bash
# 本番環境から型定義を再生成
make db-types
# または
npm run db:generate-types
```

---

## 9. まとめ

### 開発環境での作業

1. 開発環境でDB変更
2. マイグレーションファイルを作成
3. コミット・プッシュ

### 本番環境への自動デプロイ

1. mainブランチにマージ
2. GitHub Actionsが自動実行
3. 本番環境にマイグレーション適用
4. Vercelが自動デプロイ

**重要**: スキーマ、トリガー、関数、RLSポリシーはすべてマイグレーションファイルで管理し、自動的に本番環境に適用されます。手動で設定する必要はありません！

---

## 10. 現在のマイグレーション状態

現在の開発環境には以下のマイグレーションが適用されています：

- `20251202140006_initial_schema`
- `20251202140030_triggers_functions`
- `20251202140100_rls_policies`
- `20251202150111_rename_research_themes_to_projects`
- `20251202174651_rename_remaining_theme_references`
- `20251203140958_add_project_key_and_activity_sequence`
- `20251203141008_add_activity_sequence_number_trigger`
- `20251203141025_update_lab_slug_generation`
- `20251203152516_convert_role_to_is_owner_fixed_order`
- `20251203152537_update_triggers_to_use_is_owner`

**次のステップ**: これらのマイグレーションを`supabase/migrations/`に保存し、Gitで管理する必要があります。

### 10.1 マイグレーションファイルの取得方法

#### 方法1: Supabase Dashboardから取得（推奨）

1. [Supabase Dashboard](https://supabase.com/dashboard) > Database > Migrations
2. 各マイグレーションをクリック
3. SQLをコピー
4. `supabase/migrations/{timestamp}_{name}.sql`として保存

#### 方法2: 現在の状態からマイグレーションを生成

```bash
# 現在のDB状態をマイグレーションとして生成（1つのファイルにまとめる）
export SUPABASE_ACCESS_TOKEN=your-token
export SUPABASE_PROJECT_ID=ucsurbtmhabygssexisq

# 現在の状態をマイグレーションとして生成
npx supabase db diff -f current_schema --project-id $SUPABASE_PROJECT_ID
```

**推奨**: 方法2で現在の状態を1つのマイグレーションファイルとして生成し、今後は差分のみを追加していく方法が簡単です。

