# Notionデータベース構造

DB変更情報を記録するNotionデータベースの構造です。

## 📋 データベース構造

### プロパティ一覧

| プロパティ名 | 型 | 説明 | 必須 |
|------------|-----|------|------|
| プロパティ名 | 型 | 説明 | 必須 |
|------------|-----|------|------|
| プロパティ名 | 型 | 説明 | 必須 |
|------------|-----|------|------|
| プロパティ名 | 型 | 説明 | 必須 |
|------------|-----|------|------|
| **Migration File** | Title | マイグレーションファイル名（タイムスタンプ除く） | ✅ |
| **Timestamp** | Date | マイグレーションのタイムスタンプ | ✅ |
| **Branch** | Rich Text | ブランチ名（動的、テキストで自由に入力可能） | ✅ |
| **Commit SHA** | Rich Text | コミットハッシュ | ✅ |
| **Author** | Rich Text | コミット作成者（GitHubユーザー名） | ✅ |

## 🛠️ セットアップ手順

### 1. データベースの作成

1. Notionで新しいデータベースを作成
2. データベース名を設定（例: `DB Migrations`）

### 2. プロパティの追加

各プロパティを以下の設定で追加してください：

#### Migration File (Title)
- **型**: Title
- **説明**: マイグレーションファイル名（例: `add_user_table`）
- **注意**: Titleプロパティは自動的に作成されるため、名前を変更するだけ

#### Timestamp (Date)
- **型**: Date
- **説明**: マイグレーションのタイムスタンプ
- **設定**: 時刻を含む日付形式

#### Branch (Rich Text)
- **型**: Rich Text
- **説明**: ブランチ名（動的な値なので、テキスト型で自由に入力可能）
- **注意**: Select型ではなくRich Text型を使用することで、新しいブランチ名が自動的に記録されます

#### Commit SHA (Rich Text)
- **型**: Rich Text
- **説明**: コミットハッシュ（例: `a1b2c3d4e5f6...`）

#### Author (Rich Text)
- **型**: Rich Text
- **説明**: コミット作成者（GitHubユーザー名）

> **注意**: `Environment`と`Status`プロパティは削除しました。必要最小限の情報のみを記録します。

### 3. データベースIDの取得

1. データベースページを開く
2. URLを確認（例: `https://www.notion.so/{workspace}/{database_id}?v=...`）
3. `database_id`の部分をコピー（32文字の英数字、ハイフン含む）
4. `.github/workflows/notion-db-changes.yml`の`NOTION_DATABASE_ID`に設定

### 4. Integrationの接続

1. [Notion Integrations](https://www.notion.so/my-integrations) でIntegrationを作成
2. 作成したデータベースページで「...」メニューを開く
3. 「Connections」→「Add connections」を選択
4. 作成したIntegrationを選択して接続

## 📝 プロパティ名の注意事項

⚠️ **重要**: プロパティ名はワークフローファイル（`.github/workflows/notion-db-changes.yml`）で使用されている名前と**完全に一致**させる必要があります。

現在のプロパティ名：
- `Migration File`（Title）
- `Timestamp`（Date）
- `Branch`（Rich Text）- 動的なブランチ名を自動記録
- `Commit SHA`（Rich Text）
- `Author`（Rich Text）

プロパティ名を変更する場合は、ワークフローファイルも同時に更新してください。

## 🔍 データベースIDの確認方法

データベースIDが正しく設定されているか確認するには：

1. NotionデータベースのURLを開く
2. URLから`database_id`を抽出
3. ワークフローファイルの`NOTION_DATABASE_ID`と一致しているか確認

例：
```
https://www.notion.so/workspace/2c0b7adc-d6a4-8086-aff9-000bdeab9a5e?v=...
                                    ↑ この部分がデータベースID
```

## 🧪 テスト方法

1. テスト用のマイグレーションファイルを作成
2. `develop`ブランチにpush
3. GitHub Actionsが実行されることを確認
4. Notionデータベースにレコードが追加されることを確認

