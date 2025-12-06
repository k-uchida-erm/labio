# Notion連携ガイド

DB変更情報をNotionに自動的に記録する方法です。

## 🎯 概要

コミット時にマイグレーションファイルが追加されたときに、post-commitフックが自動的にNotionデータベースにレコードを作成します。

## 📋 セットアップ手順

### 1. Notion APIトークンの取得

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「+ New integration」をクリック
3. 名前を入力（例: `Labio DB Changes`）
4. 「Submit」をクリック
5. **Internal Integration Token**をコピー（`secret_`で始まる文字列）

### 2. 環境変数の設定

`.env.local`に以下を追加：

```bash
NOTION_API_TOKEN=secret_xxxxxxxxxxxxx
```

### 3. Notionデータベースの作成

詳細なセットアップ手順は [`docs/NOTION-DB-SCHEMA.md`](./NOTION-DB-SCHEMA.md) を参照してください。

**必要なプロパティ**:

- **Migration File** (Title): マイグレーションファイル名
- **Timestamp** (Date): マイグレーションのタイムスタンプ
- **Branch** (Rich Text): ブランチ名（動的な値なのでテキスト型）
- **Commit SHA** (Rich Text): コミットハッシュ
- **Author** (Rich Text): コミット作成者

⚠️ **重要**: プロパティ名はスクリプト（`.cursor/notion-sync.sh`）で使用されている名前と**完全に一致**させる必要があります。

現在のデータベースID: `2c0b7adc-d6a4-806a-87ae-c450d3ea60b3`

### 4. Gitフックのセットアップ

```bash
make setup-hooks
```

これで`post-commit`フックが有効化され、コミット時に自動的にNotionに記録されます。

## 🔄 動作フロー

1. **マイグレーションファイルがコミットされる**
   - `supabase/migrations/`に新しい`.sql`ファイルが追加
   - コミットが完了

2. **post-commitフックが実行**
   - コミット完了後に自動的に実行
   - マイグレーションファイルを検出
   - Notion APIを呼び出してレコードを作成

3. **Notionデータベースに記録**
   - マイグレーション情報が自動的に追加される
   - 日本語の要約も含まれます

## 📝 スクリプト

- **post-commitフック**: `.githooks/post-commit`
- **Notion同期スクリプト**: `.cursor/notion-sync.sh`
- **データベースID**: `2c0b7adc-d6a4-806a-87ae-c450d3ea60b3`（スクリプトに直接埋め込み）

## 📚 関連ドキュメント

- [Notionデータベース構造の詳細](./NOTION-DB-SCHEMA.md) - プロパティの設定方法と注意事項

## 🔗 参考リンク

- [Notion API Documentation](https://developers.notion.com/)
- [Notion API Reference](https://developers.notion.com/reference)
