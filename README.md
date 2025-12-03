# Labio

大学の研究室DXを実現するSaaSプラットフォーム

## 概要

Labioは、研究室における研究テーマの進捗管理、Activity（タスク・実験ノート・質問・面談など）の一元管理、AIによる自動要約・資料生成を通じて、学生が研究に没頭できる環境を提供します。

## 技術スタック

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Testing**: Vitest, Playwright
- **CI/CD**: GitHub Actions, Vercel

## クイックスタート

```bash
# 環境変数の設定
cp env.example .env.local
# .env.local を編集してSupabaseの認証情報を設定

# 起動
make up
```

ブラウザで http://localhost:3000 を開く。

**詳細な環境構築手順は [開発環境構築ガイド](./docs/CONTRIBUTING.md) を参照してください。**

## 開発コマンド

すべてのコマンドはDockerコンテナ内で実行されます。

```bash
# 基本操作
make up        # コンテナを起動
make down      # コンテナを停止
make logs      # ログを表示
make shell     # コンテナ内でシェルを起動

# 開発ツール
make lint      # Lint実行
make format    # コードフォーマット
make test      # テスト実行
make typecheck # 型チェック
```

すべてのコマンドは `make help` で確認できます。

## プロジェクト構造

```
labio/
├── docs/                    # ドキュメント
│   ├── CONTRIBUTING.md     # 環境構築ガイド
│   ├── architecture.md     # 全体設計書
│   └── specs/              # 仕様書
│       ├── database/       # DB設計
│       └── features/       # 機能仕様
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # UIコンポーネント
│   ├── features/           # 機能（ドメインごと）
│   ├── lib/                # 共通ライブラリ
│   └── types/              # 型定義
├── supabase/               # Supabase設定
└── tests/                  # テスト
```

## ドキュメント

### 開発者向け

- [**開発環境構築ガイド**](./docs/CONTRIBUTING.md) - 環境構築の詳細手順

### 設計・仕様

- [全体設計書](./docs/architecture.md)
- [DBスキーマ設計](./docs/specs/database/schema.md)
- [RLSポリシー設計](./docs/specs/database/rls-policies.md)
- [認証機能仕様](./docs/specs/features/auth.md)
- [Activity機能仕様](./docs/specs/features/activity.md)

## ライセンス

Private
