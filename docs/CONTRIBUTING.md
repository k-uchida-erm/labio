# 開発環境構築ガイド

このドキュメントでは、Labioの開発環境をセットアップする方法を説明します。

## 目次

1. [必要条件](#必要条件)
2. [セットアップ](#セットアップ)
3. [開発コマンド](#開発コマンド)
4. [MCP（AI駆動開発）のセットアップ](#mcpai駆動開発のセットアップ)
5. [トラブルシューティング](#トラブルシューティング)

---

## 必要条件

| ツール | バージョン | インストール方法                                                   |
| ------ | ---------- | ------------------------------------------------------------------ |
| Docker | 20以上     | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| Make   | -          | macOS標準搭載                                                      |
| Git    | 最新       | `brew install git`                                                 |

> **Note**: Node.jsのローカルインストールは不要です。すべてDocker内で実行されます。

---

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-org/labio.git
cd labio
```

### 2. 環境変数の設定

```bash
cp env.example .env.local
```

`.env.local` を編集して、Supabaseの認証情報を設定：

```env
# Supabase（必須）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase（サーバーサイドのみ）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
```

Supabaseの認証情報の取得方法：

| 項目         | 環境変数                        | 取得場所                                                |
| ------------ | ------------------------------- | ------------------------------------------------------- |
| Project URL  | `NEXT_PUBLIC_SUPABASE_URL`      | Dashboard > Settings > API > Project URL                |
| anon public  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard > Settings > API > Project API keys           |
| service_role | `SUPABASE_SERVICE_ROLE_KEY`     | Dashboard > Settings > API > Project API keys（⚠️秘密） |
| Reference ID | `SUPABASE_PROJECT_ID`           | Dashboard > Settings > General                          |

### 3. Makeコマンドの設定（Preztoユーザー向け）

Preztoを使用している場合、`make`コマンドがzshの関数として定義されている可能性があります。システムの`make`コマンドを使用するために、`.zshrc`に以下を追加してください：

```bash
# ~/.zshrc または ~/.bashrc を編集
nano ~/.zshrc  # または vim ~/.zshrc

# ファイルの末尾に追加
# Makeコマンドの関数を無効化（システムのmakeを使用）
unfunction make 2>/dev/null || true

# 設定を反映
source ~/.zshrc
```

> **Note**: Preztoを使用していない場合、この手順は不要です。

### 4. 起動

```bash
make up
```

ブラウザで http://localhost:3000 を開く。

---

## 開発コマンド

すべてのコマンドはDockerコンテナ内で実行されます。

### 基本操作

```bash
make up        # コンテナを起動（開発サーバー）
make down      # コンテナを停止
make build     # イメージをビルド
make rebuild   # イメージを再ビルド（キャッシュなし）
make logs      # ログを表示
make shell     # コンテナ内でシェルを起動
make clean     # コンテナ・ボリュームを完全削除
```

### 開発ツール

```bash
make install      # 依存関係をインストール
make lint         # Lint実行
make lint-fix     # Lint実行（自動修正）
make format       # コードフォーマット
make format-check # フォーマットチェック
make test         # テスト実行
make test-e2e     # E2Eテスト実行
make typecheck    # 型チェック
make db-types     # Supabase型定義を生成
```

すべてのコマンドは `make help` で確認できます。

### 依存関係の追加

新しいパッケージを追加する場合：

```bash
# コンテナ内でシェルを起動
make shell

# パッケージをインストール
npm install <package-name>

# コンテナから出る
exit

# イメージを再ビルド
make build
```

---

## MCP（AI駆動開発）のセットアップ

Cursor IDEでAI駆動開発を行うためのMCP設定です。

### 1. 環境変数の設定

MCPサーバーは`.env.local`から環境変数を自動的に読み込みます。`.cursor/load-env.sh`スクリプトが`.env.local`から環境変数を読み込んでMCPサーバーに渡します。

#### Supabase Access Token

1. [Supabase Dashboard > Account > Access Tokens](https://supabase.com/dashboard/account/tokens)
2. 「Generate new token」をクリック
3. **`.env.local`に追加**:
```bash
# .env.local に追加
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
```

#### Figma Access Token

> **⚠️ セキュリティ注意**: Personal Access Tokenは**個人のアカウントに紐づいています**。
> 他の人のトークンを共有すると、その人のアカウントでFigmaにアクセスできてしまいます。
> **必ず各自でトークンを取得してください。**

1. **Figmaアカウントを作成**（無料アカウントでOK）
   - [Figma](https://www.figma.com/)でアカウント作成
   - デザイナーがFigmaファイルを共有している必要があります

2. **Personal Access Tokenを取得**:
   - [Figma Settings](https://www.figma.com/settings)
   - 「Personal access tokens」セクションを開く
   - 「Create new token」をクリック
   - トークン名を入力（例: `Labio Dev`）
   - トークンをコピー（**一度しか表示されません**）

3. **`.env.local`に追加**:
```bash
# .env.local に追加
FIGMA_ACCESS_TOKEN=your-figma-access-token
```

> **💰 課金について**:
> - **デザイナー**: Figmaの有料プラン（Professional/Organization/Enterpriseプランのフルシート）が必要です
> - **開発者**: 以下のいずれかの方法でMCPを使用できます
>   - **方法1: 各自で有料プランを契約**（推奨）
>     - Professional/Organization/EnterpriseプランのフルシートまたはDevシートが必要
>     - 各自でPersonal Access Tokenを取得
>   - **方法2: デザイナーのPersonal Access Tokenを使用**（⚠️ セキュリティリスクあり）
>     - デザイナーがトークンを共有する場合、開発者は無料プランでもMCPを使用可能
>     - **⚠️ 注意**: Personal Access Tokenは個人のアカウントに紐づいており、共有するとその人のアカウントでFigmaにアクセスできてしまいます
>     - チーム内で信頼できる場合のみ使用を検討してください
> 
> **⚠️ 重要**: 
> - Personal Access Tokenは**個人のアカウントに紐づいています**
> - トークンを共有すると、その人のアカウントでFigmaにアクセスできてしまいます
> - **推奨**: 各自でPersonal Access Tokenを取得し、共有しないこと
> - デザイナーがFigmaファイルを共有している必要があります（View権限でOK）
> - ファイルへのアクセス権限がない場合、MCPでデザインを取得できません

### 2. Cursorの設定

1. **`.cursor/mcp.json` を作成**：
   ```bash
   cp .cursor/mcp.json.example .cursor/mcp.json
   ```
   
   `.cursor/mcp.json` は`.cursor/load-env.sh`を使用して`.env.local`から環境変数を読み込みます：
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": ".cursor/load-env.sh",
         "args": [
           "npx",
           "-y",
           "@supabase/mcp-server-supabase@latest"
         ]
       },
       "figma": {
         "command": ".cursor/load-env.sh",
         "args": [
           "npx",
           "-y",
           "@modelcontextprotocol/server-figma@latest"
         ]
       }
     }
   }
   ```

2. **Cursor Settings > Features > MCP** を有効化

3. **Cursorを再起動**

> **⚠️ 重要**: 
> - `.cursor/mcp.json` には**直接トークンを書き込まないでください**
> - `.cursor/load-env.sh`が`.env.local`から自動的に環境変数を読み込みます
> - `.env.local`は`.gitignore`に含まれているため、各自の環境で設定してください

### 3. MCPの動作確認

#### Supabase MCPのテスト

Cursorで以下を入力して、MCPが動作するか確認：

```
「Supabaseのプロジェクト一覧を見せて」
```

成功すると、あなたのSupabaseプロジェクトが一覧表示されます。

#### Figma MCPのテスト

```
「このFigmaファイルのデザインを見せて: [FigmaのURL]」
```

### 4. 使用例

```
# Supabase操作
「labioプロジェクトのテーブル一覧を見せて」
「activitiesテーブルの構造を教えて」
「新しいマイグレーションを適用して」

# Figma操作
「このFigmaのデザインをReactコンポーネントにして」
「Figmaのボタンコンポーネントを再現して」
```

---

## 開発ワークフロー

### 機能追加時の必須手順

**重要**: 機能を追加する際は、必ず以下の3つをセットで追加してください：

1. **実装**（コード）
2. **ドキュメント**（仕様書の更新または作成）
3. **テスト**（単体テストまたはE2Eテスト）

#### チェックリスト

機能追加時は、以下のチェックリストを確認してください：

- [ ] **仕様書を更新または作成**（`docs/specs/features/[domain].md`）
- [ ] コードを実装
- [ ] **テストを作成**（`tests/unit/` または `tests/e2e/`）
- [ ] DB変更時は`docs/specs/database/schema.md`と`current-state.md`を更新
- [ ] API変更時は`docs/specs/api/api-design.md`を更新（必要に応じて）
- [ ] 型定義を更新（`make db-types`）

#### 例: Activity機能を追加する場合

```bash
# 1. 仕様書を確認または作成
docs/specs/features/activity.md

# 2. コードを実装
src/features/activity/hooks/useActivity.ts
src/features/activity/actions/createActivity.ts
src/components/activity/ActivityForm.tsx

# 3. テストを作成
tests/unit/features/activity/useActivity.test.ts
tests/e2e/activity/create-activity.spec.ts
```

### プルリクエスト作成時

プルリクエストを作成する際は、以下を含めてください：

- 実装した機能の説明
- 追加・更新したドキュメントへのリンク
- 追加したテストの説明
- スクリーンショット（UI変更がある場合）

---

## トラブルシューティング

### Dockerでポートが使用中

```bash
# 使用中のプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

### コンテナが起動しない

```bash
# コンテナを完全削除して再ビルド
make clean
make build
make up
```

### 依存関係のエラー

```bash
# node_modulesをクリアして再インストール
make clean
make build
```

### Supabase接続エラー

1. 環境変数が正しく設定されているか確認
2. Supabaseプロジェクトがアクティブか確認
3. ネットワーク接続を確認

### Next.jsのビルドエラー

```bash
# キャッシュをクリアして再ビルド
make clean
make build
make up
```

### MCPが動作しない

1. **Cursor Settings > Features > MCP** が有効か確認
2. 環境変数が `.env.local` に設定されているか確認
3. Cursorを完全に再起動（`killall Cursor` してから起動）
4. `.cursor/mcp.json` の設定を確認

### makeコマンドが動作しない

Preztoを使用している場合、`make`コマンドがzshの関数として定義されている可能性があります。以下のコマンドで確認してください：

```bash
# makeコマンドの種類を確認
type make

# 関数として定義されている場合、無効化
unfunction make

# 動作確認
make --version
```

永続的に設定するには、[セットアップ手順](#3-makeコマンドの設定preztoユーザー向け)を参照してください。

---

## 質問・サポート

問題が解決しない場合は、以下に連絡してください：

- GitHub Issues: [リポジトリURL]/issues
- Slack: #labio-dev チャンネル
