# Notion連携ガイド

DB変更情報をNotionに自動的に記録する方法です。

## 🎯 概要

コミット時にマイグレーションファイルが追加されたときに、Notionデータベースに自動的にレコードを作成します。

## 📋 セットアップ手順

### 1. Notion APIトークンの取得

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「+ New integration」をクリック
3. 名前を入力（例: `Labio DB Changes`）
4. 「Submit」をクリック
5. **Internal Integration Token**をコピー（`secret_`で始まる文字列）

### 2. Notionデータベースの作成

詳細なセットアップ手順は [`docs/NOTION-DB-SCHEMA.md`](./NOTION-DB-SCHEMA.md) を参照してください。

**必要なプロパティ**:
- **Migration File** (Title): マイグレーションファイル名
- **Timestamp** (Date): マイグレーションのタイムスタンプ
- **Branch** (Rich Text): ブランチ名（動的な値なのでテキスト型）
- **Commit SHA** (Rich Text): コミットハッシュ
- **Author** (Rich Text): コミット作成者

⚠️ **重要**: プロパティ名はワークフローファイルで使用されている名前と**完全に一致**させる必要があります。

現在のデータベースID: `2c0b7adc-d6a4-8086-aff9-000bdeab9a5e`

### 3. GitHub Secretsの設定

GitHubリポジトリのSettings > Secrets and variables > Actionsで以下を追加：

- `NOTION_API_TOKEN`: Notion APIトークン（`secret_`で始まる文字列）

> **注意**: データベースIDはワークフローファイル（`.github/workflows/notion-db-changes.yml`）に直接埋め込まれています。

## 🔄 動作フロー

1. **マイグレーションファイルがコミットされる**
   - `supabase/migrations/`に新しい`.sql`ファイルが追加
   - `main`または`develop`ブランチにpush

2. **GitHub Actionsが実行**
   - pushイベント時にマイグレーションファイルを検出
   - Notion APIを呼び出してレコードを作成

3. **Notionデータベースに記録**
   - マイグレーション情報が自動的に追加される

## 📝 ワークフロー

ワークフローファイル: `.github/workflows/notion-db-changes.yml`

- **トリガー**: `main`または`develop`ブランチへのpush時、`supabase/migrations/**/*.sql`が追加された場合
- **動作**: 新しいマイグレーションファイルを検出し、Notionデータベースにレコードを作成
- **データベースID**: `2c0b7adc-d6a4-8086-aff9-000bdeab9a5e`（ワークフローファイルに直接埋め込み）

## 📚 関連ドキュメント

- [Notionデータベース構造の詳細](./NOTION-DB-SCHEMA.md) - プロパティの設定方法と注意事項

## 🔗 参考リンク

- [Notion API Documentation](https://developers.notion.com/)
- [Notion API Reference](https://developers.notion.com/reference)

