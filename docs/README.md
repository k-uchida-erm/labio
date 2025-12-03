# ドキュメント一覧

## 開発者向け

| ドキュメント                         | 説明                             |
| ------------------------------------ | -------------------------------- |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | **環境構築ガイド**（最初に読む） |
| [SETUP-INITIAL.md](./SETUP-INITIAL.md) | **初期環境分離セットアップ**（開発・本番環境の分離） |
| [ENV-SETUP.md](./ENV-SETUP.md)       | **環境変数設定ガイド**（開発環境・本番環境） |

> **Note**: プロジェクトルールは `.cursorrules` に定義されています。Cursorが自動的に読み込みます。

## 設計・仕様

| ドキュメント                                                                   | 説明               |
| ------------------------------------------------------------------------------ | ------------------ |
| [architecture.md](./architecture.md)                                           | 全体設計書（技術スタック、アーキテクチャ） |
| [specs/pages-design.md](./specs/pages-design.md)                               | **ページ設計書**（MVPロードマップ、ページ一覧） |
| [specs/api/api-design.md](./specs/api/api-design.md)                         | **API設計書**（実装方式の選択基準） |
| [CI-CD.md](./CI-CD.md)                                                         | **CI/CD自動化ガイド**（GitHub Actions、Vercelデプロイ） |
| [DEPLOYMENT.md](./DEPLOYMENT.md)                                             | **デプロイメントガイド**（自動マイグレーション、環境分離） |
| [ENV-SETUP.md](./ENV-SETUP.md)                                               | **環境変数設定ガイド**（開発環境・本番環境） |
| [specs/database/schema.md](./specs/database/schema.md)                         | DBスキーマ設計     |
| [specs/database/current-state.md](./specs/database/current-state.md)           | DB現在の状態       |
| [specs/database/rls-policies.md](./specs/database/rls-policies.md)             | RLSポリシー設計    |
| [specs/database/triggers-functions.md](./specs/database/triggers-functions.md) | トリガー・関数設計 |
| [specs/features/auth.md](./specs/features/auth.md)                             | 認証機能仕様       |
| [specs/features/activity.md](./specs/features/activity.md)                     | Activity機能仕様   |

## 開発フロー

1. **仕様書作成**: `docs/specs/` に機能仕様書を作成
2. **テスト作成**: 仕様に基づいてテストケースを作成
3. **実装**: テストをパスするように実装
4. **検証**: 仕様との整合性を確認
