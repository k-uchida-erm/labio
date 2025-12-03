# 初期環境分離セットアップ

## 概要

本ドキュメントでは、開発環境と本番環境を分離するための初期設定手順を説明します。

**重要**: この設定は一度だけ行います。設定後は自動マイグレーションで管理されます。

---

## チェックリスト

- [ ] 1. Gitブランチ戦略の設定
- [ ] 2. Supabaseプロジェクトの分離
- [ ] 3. Vercel環境の設定
- [ ] 4. GitHub Secretsの設定
- [ ] 5. 環境変数の設定
- [ ] 6. 動作確認

---

## 1. Gitブランチ戦略の設定

### 1.1 developブランチの作成

```bash
# developブランチを作成
git checkout -b develop

# リモートにプッシュ
git push -u origin develop
```

### 1.2 ブランチ保護ルールの設定（オプション）

GitHubリポジトリ > Settings > Branches で以下を設定：

- **mainブランチ**: 直接プッシュ不可、PR必須
- **developブランチ**: 直接プッシュ可能（開発用）

---

## 2. Supabaseプロジェクトの分離

### 2.1 既存プロジェクトの名前変更（開発環境用）

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. 既存プロジェクト（`ucsurbtmhabygssexisq`）を選択
3. Settings > General > Project Name を変更
4. **推奨名**: `labio-development` または `labio-dev`

### 2.2 本番環境用プロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard)で「New Project」をクリック
2. **プロジェクト名**: `labio-production`
3. **リージョン**: 本番環境に近いリージョン（例: `ap-northeast-1`）
4. **データベースパスワード**: 強力なパスワードを設定
5. 「Create new project」をクリック

### 2.3 本番環境への初期マイグレーション適用

```bash
# 環境変数を設定
export SUPABASE_ACCESS_TOKEN=your-token
export SUPABASE_PROJECT_ID_PROD=your-production-project-id

# 本番環境にマイグレーションを適用
cd /Users/k_uchida/dev/labio
npx supabase link --project-ref <production-project-ref>
npx supabase db push
```

**注意**: プロジェクト作成後、数分待ってからマイグレーションを適用してください。

---

## 3. Vercel環境の設定

### 3.1 プロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New Project」をクリック
3. GitHubリポジトリ（`k-uchida-erm/labio`）を選択
4. **Project Name**: `labio`
5. **Framework Preset**: Next.js（自動検出）
6. **Root Directory**: `./`

### 3.2 環境変数の設定

#### Production環境（本番）

| 環境変数名 | 値 | 取得方法 |
|-----------|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | 本番プロジェクトのURL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本番プロジェクトのAnon Key | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | 本番プロジェクトのService Role Key | 同上 |

**設定手順**:
1. Vercel Dashboard > プロジェクト > Settings > Environment Variables
2. 「Add New」をクリック
3. KeyとValueを入力
4. **Environment**: Production のみにチェック
5. 「Save」をクリック

#### Preview環境（PR用）

| 環境変数名 | 値 | 取得方法 |
|-----------|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | 開発プロジェクトのURL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 開発プロジェクトのAnon Key | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | 開発プロジェクトのService Role Key | 同上 |

**設定手順**:
1. 上記と同じ手順
2. **Environment**: Preview のみにチェック

#### Development環境（ローカル開発用）

| 環境変数名 | 値 | 取得方法 |
|-----------|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | 開発プロジェクトのURL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 開発プロジェクトのAnon Key | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | 開発プロジェクトのService Role Key | 同上 |

**設定手順**:
1. 上記と同じ手順
2. **Environment**: Development のみにチェック

**注意**: Development環境はローカル開発用なので、実際には`.env.local`を使用します。

### 3.3 ブランチ設定

Vercel Dashboard > Settings > Git で以下を設定：

- **Production Branch**: `main`
- **Preview Branches**: `develop` を含める

---

## 4. GitHub Secretsの設定

### 4.1 Secretsの追加

GitHubリポジトリ > Settings > Secrets and variables > Actions で以下を追加：

| Secret名 | 説明 | 値 |
|---------|------|-----|
| `SUPABASE_ACCESS_TOKEN` | Supabase Access Token | [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)から取得 |
| `SUPABASE_PROJECT_ID_PROD` | 本番環境のProject ID | 本番用SupabaseプロジェクトのProject ID |

**設定手順**:
1. 「New repository secret」をクリック
2. NameとValueを入力
3. 「Add secret」をクリック

---

## 5. 環境変数の設定

### 5.1 開発環境（`.env.local`）

`.env.local`を確認・更新：

```env
# Supabase（開発環境）
NEXT_PUBLIC_SUPABASE_URL=https://<dev-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key>
SUPABASE_PROJECT_ID=<dev-project-id>

# MCP（開発用）
SUPABASE_ACCESS_TOKEN=<your-access-token>
FIGMA_ACCESS_TOKEN=<your-figma-token>
```

### 5.2 本番環境（Vercel）

Vercel Dashboardで設定済み（上記3.2参照）

---

## 6. 動作確認

### 6.1 開発環境の確認

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
# Supabaseに接続できるか確認
```

### 6.2 本番環境の確認

1. mainブランチにプッシュ
2. Vercel Dashboardでデプロイが成功するか確認
3. 本番URLにアクセスして動作確認

### 6.3 マイグレーションの確認

```bash
# 本番環境にマイグレーションが適用されているか確認
npx supabase link --project-ref <production-project-ref>
npx supabase db diff --linked
# 差分がなければOK
```

---

## 7. 命名規則まとめ

### Supabaseプロジェクト

| 環境 | プロジェクト名 | Project ID |
|------|---------------|-----------|
| **開発環境** | `labio-development` | `ucsurbtmhabygssexisq`（既存） |
| **本番環境** | `labio-production` | （新規作成） |

### Gitブランチ

| ブランチ | 用途 | Vercel環境 |
|---------|------|-----------|
| `main` | 本番リリース | Production |
| `develop` | 開発 | Preview |

### Vercelプロジェクト

| 環境 | ブランチ | Supabaseプロジェクト |
|------|---------|---------------------|
| **Production** | `main` | `labio-production` |
| **Preview** | `develop`, PR | `labio-development` |

---

## 8. 完了後の確認事項

- [ ] developブランチが作成されている
- [ ] Supabaseプロジェクトが2つある（開発・本番）
- [ ] Vercelで環境変数が正しく設定されている
- [ ] GitHub Secretsが設定されている
- [ ] 開発環境で動作確認が完了している
- [ ] 本番環境で動作確認が完了している
- [ ] マイグレーションが本番環境に適用されている

---

## 9. トラブルシューティング

### 9.1 マイグレーションが適用されない

**症状**: GitHub Actionsでマイグレーション適用が失敗

**確認事項**:
1. `SUPABASE_ACCESS_TOKEN`が正しく設定されているか
2. `SUPABASE_PROJECT_ID_PROD`が正しいか
3. 本番プロジェクトが作成されてから数分経過しているか

### 9.2 Vercelで環境変数が読み込まれない

**症状**: デプロイ後、Supabaseに接続できない

**確認事項**:
1. 環境変数名が正しいか（`NEXT_PUBLIC_*`プレフィックス）
2. 環境（Production/Preview）が正しく選択されているか
3. デプロイを再実行

---

## 10. 参考ドキュメント

- [環境変数設定ガイド](./ENV-SETUP.md)
- [デプロイメントガイド](./DEPLOYMENT.md)
- [CI/CD自動化ガイド](./CI-CD.md)

