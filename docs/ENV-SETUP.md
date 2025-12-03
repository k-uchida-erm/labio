# 環境変数設定ガイド

## 1. 環境変数の種類

Labioでは、**開発環境**と**本番環境**で環境変数を別々に設定します。

| 環境 | 設定場所 | 用途 |
|------|---------|------|
| **開発環境** | `.env.local` | ローカル開発用 |
| **本番環境** | Vercel Dashboard | 本番デプロイ用 |
| **Preview環境** | Vercel Dashboard | PRごとのPreview環境用 |

---

## 2. 開発環境（`.env.local`）の設定

### 2.1 ファイルの作成

```bash
# プロジェクトルートで実行
cp env.example .env.local
```

### 2.2 必要な環境変数を設定

`.env.local`を編集して、以下を設定：

```env
# Supabase（必須）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase（サーバーサイドのみ）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id

# MCP（開発用、オプション）
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
FIGMA_ACCESS_TOKEN=your-figma-access-token
```

### 2.3 値の取得方法

#### Supabaseの環境変数

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. **Settings > API** を開く
4. 以下の値をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys > `anon` `public`** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys > `service_role` `secret`** → `SUPABASE_SERVICE_ROLE_KEY`
   - **Reference ID** → `SUPABASE_PROJECT_ID`

#### MCPの環境変数（開発用のみ）

- **Supabase Access Token**: [Supabase Dashboard > Account > Access Tokens](https://supabase.com/dashboard/account/tokens)
- **Figma Access Token**: [Figma Settings > Personal access tokens](https://www.figma.com/settings)

---

## 3. 本番環境（Vercel）の設定

### 3.1 Vercel Dashboardでの設定

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択（または新規作成）
3. **Settings > Environment Variables** を開く
4. 環境変数を追加：

#### 必須の環境変数

| 環境変数名 | 値 | 環境 |
|-----------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`と同じ値 | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local`と同じ値 | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local`と同じ値 | Production, Preview |

**設定手順**:
1. 「Add New」をクリック
2. **Key**: 環境変数名を入力（例: `NEXT_PUBLIC_SUPABASE_URL`）
3. **Value**: `.env.local`の値をコピーして貼り付け
4. **Environment**: チェックボックスで環境を選択
   - `NEXT_PUBLIC_*`: Production, Preview, Development すべてにチェック
   - `SUPABASE_SERVICE_ROLE_KEY`: Production, Preview にチェック（Developmentは不要）
5. 「Save」をクリック
6. 残りの環境変数も同様に追加

### 3.2 環境変数の確認

デプロイ後、環境変数が正しく設定されているか確認：

1. Vercel Dashboard > プロジェクト > Settings > Environment Variables
2. すべての環境変数が表示されているか確認
3. 値が正しいか確認

---

## 4. 環境変数の使い分け

### 4.1 `NEXT_PUBLIC_*` プレフィックス

- **意味**: クライアント側（ブラウザ）でも使用可能
- **注意**: 値が公開されるため、機密情報は設定しない
- **例**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4.2 サーバー側のみの環境変数

- **意味**: サーバー側（Server Actions, API Routes）でのみ使用可能
- **注意**: クライアント側からはアクセスできない
- **例**: `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 開発環境のみの環境変数

- **意味**: ローカル開発でのみ使用
- **例**: `SUPABASE_ACCESS_TOKEN`, `FIGMA_ACCESS_TOKEN`（MCP用）

---

## 5. トラブルシューティング

### 5.1 環境変数が読み込まれない

**症状**: デプロイ後、Supabaseに接続できない

**確認事項**:
1. Vercel Dashboardで環境変数が設定されているか確認
2. 環境変数名が正しいか確認（大文字小文字、アンダースコア）
3. `NEXT_PUBLIC_*`プレフィックスが正しいか確認
4. デプロイを再実行（環境変数変更後は再デプロイが必要）

### 5.2 開発環境と本番環境でSupabaseプロジェクトを分けるべきか？

#### MVP段階（今）

**推奨**: **同じSupabaseプロジェクトを使用**（シンプルで十分）

**理由**:
- 設定が簡単（環境変数をコピーするだけ）
- データが混在しても問題ない（MVP段階）
- コストがかからない（1プロジェクトでOK）

**設定方法**: `.env.local`とVercelで同じ値を設定

#### 本番リリース後

**推奨**: **別のSupabaseプロジェクトを作成 + 自動マイグレーション**

**理由**:
- **データ分離**: 開発データと本番データを分離
- **安全性**: 開発時の操作が本番に影響しない
- **パフォーマンス**: 本番環境のパフォーマンスを正確に測定できる
- **バックアップ**: 本番データのバックアップが独立

**設定方法**:
1. 新しいSupabaseプロジェクトを作成（本番用）
2. **マイグレーションファイルでスキーマを管理**（`supabase/migrations/`）
3. **GitHub Actionsで自動マイグレーション**（mainブランチマージ時に自動適用）
4. Vercelの環境変数を本番プロジェクトの値に更新
5. `.env.local`は開発プロジェクトのまま

**重要**: スキーマ、トリガー、関数、RLSポリシーは**マイグレーションファイルで管理**し、本番環境に自動適用されます。手動で設定する必要はありません！

詳細は [`DEPLOYMENT.md`](./DEPLOYMENT.md) を参照してください。

#### 判断基準

| 状況 | 推奨 | 理由 |
|------|------|------|
| **MVP段階・個人開発** | 同じプロジェクト | シンプル、コスト削減 |
| **チーム開発・テストデータが多い** | 別プロジェクト | データ分離、安全性 |
| **本番リリース後** | 別プロジェクト | データ分離、安全性 |

**Labioの場合**: MVP段階なので、**今は同じプロジェクトでOK**。本番リリース前に別プロジェクトに分けることを推奨します。

### 5.3 環境変数の更新

**Vercelでの更新**:
1. Settings > Environment Variables を開く
2. 環境変数を編集
3. 「Save」をクリック
4. **再デプロイが必要**（自動的に再デプロイされる場合もある）

---

## 6. セキュリティ注意事項

### ✅ やるべきこと

- `.env.local`を`.gitignore`に含める（既に設定済み）
- `SUPABASE_SERVICE_ROLE_KEY`はサーバー側のみで使用
- 環境変数の値をGitHubにコミットしない

### ❌ やってはいけないこと

- `.env.local`をGitにコミットする
- `SUPABASE_SERVICE_ROLE_KEY`を`NEXT_PUBLIC_*`プレフィックスで公開する
- 環境変数の値をGitHubのIssueやPRに記載する

---

## 7. まとめ

### MVP段階での推奨設定

#### 開発環境（`.env.local`）

```bash
# 1. ファイルを作成
cp env.example .env.local

# 2. 値を設定（Supabase Dashboardから取得）
# 3. 開発サーバーを起動
npm run dev
```

#### 本番環境（Vercel）

1. Vercel Dashboard > Settings > Environment Variables
2. **`.env.local`の値をコピーして設定**（同じSupabaseプロジェクトを使用）
3. 環境を選択（Production, Preview）
4. デプロイ

**重要**: MVP段階では、`.env.local`の値をそのままVercelに設定すればOKです！

### 本番リリース後の推奨設定

1. **新しいSupabaseプロジェクトを作成**（本番用）
2. スキーマをマイグレーションで同期
3. Vercelの環境変数を本番プロジェクトの値に更新
4. `.env.local`は開発プロジェクトのまま

詳細は「5.2 開発環境と本番環境でSupabaseプロジェクトを分けるべきか？」を参照してください。

