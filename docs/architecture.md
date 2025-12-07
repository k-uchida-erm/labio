# Labio 全体設計書

## 1. プロジェクト概要

### 1.1 プロダクトビジョン

**Labio** - 大学の研究室DXを実現するSaaSプラットフォーム

研究室におけるprojectの進捗管理、Activity（タスク・実験ノート・質問・面談など）の一元管理、AI による自動要約・資料生成を通じて、学生が研究に没頭できる環境を提供する。

### 1.2 コアバリュー

- **研究ログの蓄積**: すべてのActivityがprojectのデータベースとして機能
- **無駄な作業の自動化**: AI による要約・資料生成で脳のリソースを解放
- **進捗の可視化**: 先生・生徒双方が研究の進捗を把握可能

### 1.3 主要機能

| 機能             | 説明                                                     |
| ---------------- | -------------------------------------------------------- |
| lab管理          | 研究室単位のlab管理（先生が作成、生徒が参加）            |
| project管理      | 先生が生徒のproject進捗を一元管理                        |
| Activity管理     | タスク、実験ノート、質問・レビュー、面談・ゼミなどの管理 |
| マルチビュー     | List / Kanban / Gantt / Calendar / Story ビュー          |
| AI要約・資料生成 | 選択したActivityをAIがmd形式でまとめ、Marpで資料生成     |

### 1.4 プラン構成

| プラン       | 対象          | 機能                                               |
| ------------ | ------------- | -------------------------------------------------- |
| 研究室プラン | 研究室（Lab） | lab作成、先生/生徒の権限管理、質問・レビューフロー |
| 個人プラン   | 個人          | 個人用lab（研究室フローは使用不可）                |

### 1.5 開発原則

- **Figma駆動 + Spec駆動のハイブリッド**: FigmaでUI設計 → AI完全再現 → 爆速開発サイクル
- **テスト必須**: すべての機能にテストを書く（忘れない）
- **RLS必須**: Supabaseのセキュリティは堅牢に設計
- **API設計先行**: 勝手に広がらない、ベストプラクティスなAPI設計

---

## 2. アーキテクチャ設計

### 2.1 アーキテクチャパターン

**Feature-Sliced Design（変形）** + **クリーンアーキテクチャの原則**

UIと機能（ロジック）を完全分離し、ドメインごとにファイル・フォルダを構成する。

#### 設計原則

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer                                │
│   (React Components - 見た目のみ、ロジックは書かない)            │
│   → features/のhooksを呼び出すだけ                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ 呼び出し
┌─────────────────────────────────────────────────────────────────┐
│                      Features Layer                             │
│   (ドメインごとのhooks/actions/types)                           │
│   → ビジネスロジック、状態管理、API呼び出し                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓ 呼び出し
┌─────────────────────────────────────────────────────────────────┐
│                      Shared Layer                               │
│   (共通ユーティリティ、型定義、API クライアント)                 │
└─────────────────────────────────────────────────────────────────┘
```

#### UIと機能の分離に関する補足

**Q: 機能とUIが一緒になったコンポーネント（例: フォーム、モーダル）は分離すべきか？**

**A: 分離を推奨。以下のパターンで対応する。**

```
❌ 悪い例: UIコンポーネント内にロジックが混在
components/ActivityForm.tsx
  └─ useState, useEffect, API呼び出し, バリデーション...すべて混在

✅ 良い例: UIとロジックを分離
features/activity/
  ├─ hooks/
  │   └─ useActivityForm.ts    # フォームロジック（状態、バリデーション、送信）
  └─ types/
      └─ activity.ts           # 型定義

components/activity/
  └─ ActivityForm.tsx          # UIのみ（useActivityFormを呼び出す）
```

**分離の基準:**
| ケース | 対応 |
|--------|------|
| 状態管理・API呼び出し・バリデーション | → `features/` のhooksに切り出す |
| 純粋なUI表示（props受け取り→表示） | → `components/` に置いてOK |
| 共通UIパーツ（Button, Input等） | → `components/ui/` に置く |

### 2.2 システム構成図

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Client                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                     Next.js (App Router)                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │ │
│  │  │   UI     │  │ Features │  │  Shared  │  │ Supabase Client SDK  │ │ │
│  │  │Components│→ │  Hooks   │→ │   Utils  │→ │ (Auth, DB, Storage)  │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            Supabase                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Database │  │ Storage  │  │  Edge    │  │ Realtime │   │
│  │          │  │(Postgres)│  │          │  │Functions │  │          │   │
│  │          │  │  + RLS   │  │          │  │  (AI等)  │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         External Services                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │   AI API         │  │   Marp CLI       │  │   (その他)       │       │
│  │ (GPT-5 / TBD)    │  │ (資料生成)       │  │                  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.3 主要コンポーネント

| コンポーネント | 責務                                 | 依存関係         |
| -------------- | ------------------------------------ | ---------------- |
| Auth           | 認証・認可（Supabase Auth）          | Supabase         |
| lab            | 研究室lab管理                        | Auth, Database   |
| project        | project管理                          | lab, Activity    |
| Activity       | タスク/実験ノート/質問等の管理       | project          |
| View Engine    | List/Kanban/Gantt/Calendar/Story表示 | Activity         |
| AI Summarizer  | Activity要約・Marp資料生成           | Activity, AI API |

---

## 3. 技術スタック

### 3.1 フロントエンド

| 技術         | バージョン        | 用途           |
| ------------ | ----------------- | -------------- |
| Next.js      | 16.x (App Router) | フレームワーク |
| React        | 19.x              | UIライブラリ   |
| TypeScript   | 5.x               | 型安全性       |
| Tailwind CSS | 4.x               | スタイリング   |
| Zod          | 4.x               | バリデーション |

### 3.2 バックエンド / データベース

| 技術                     | 用途                                                      |
| ------------------------ | --------------------------------------------------------- |
| Supabase                 | BaaS（Auth, Database, Storage, Edge Functions, Realtime） |
| PostgreSQL               | データベース（Supabase内蔵）                              |
| Row Level Security (RLS) | データアクセス制御                                        |

### 3.3 AI / 資料生成

| 技術                        | 用途                        | 実行環境                |
| --------------------------- | --------------------------- | ----------------------- |
| OpenAI API (GPT-4o / GPT-5) | Activity要約、資料生成      | Supabase Edge Functions |
| Marp CLI                    | Markdown → スライド資料変換 | Supabase Edge Functions |

#### AI機能の実装方針

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI機能アーキテクチャ                              │
└─────────────────────────────────────────────────────────────────────────┘

[クライアント]
     │
     │ 1. AI要約/資料生成リクエスト
     ▼
[Supabase Edge Functions]  ← APIキーを安全に管理
     │
     ├─ 2a. OpenAI API呼び出し（要約生成）
     │       └─ Markdown形式で返却
     │
     └─ 2b. Marp CLI実行（資料生成）
             └─ PDF/PPTX/HTML形式で返却
     │
     ▼
[Supabase Storage]  ← 生成物を保存
     │
     ▼
[クライアント]  ← ダウンロードURL取得
```

**Supabase Edge Functionsを選択した理由:**

- APIキーをクライアントに露出させない
- サーバーサイドでの処理が必要（Marp CLI）
- Supabaseエコシステム内で完結
- コールドスタートが高速（Deno runtime）

### 3.4 開発環境 / ツール

| 技術           | 用途                                                |
| -------------- | --------------------------------------------------- |
| Docker         | 開発環境構築                                        |
| pnpm           | パッケージマネージャ                                |
| ESLint         | リンター                                            |
| Prettier       | フォーマッター                                      |
| Biome          | リンター/フォーマッター（ESLint+Prettier代替、TBD） |
| Vitest         | 単体テスト                                          |
| Playwright     | E2Eテスト                                           |
| GitHub Actions | CI/CD                                               |

### 3.5 MCP連携

| MCP          | 用途                  |
| ------------ | --------------------- |
| Supabase MCP | AI駆動開発でのDB操作  |
| Figma MCP    | FigmaデザインのAI再現 |

---

## 4. ディレクトリ構造

```
labio/
├── docs/                           # ドキュメント
│   ├── architecture.md            # 全体設計書（このファイル）
│   ├── specs/                     # 仕様書
│   │   ├── features/              # 機能仕様書
│   │   ├── api/                   # API仕様書
│   │   └── database/              # DB設計書
│   └── adr/                       # Architecture Decision Records
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # 認証関連ページ
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/          # ダッシュボード
│   │   │   ├── labs/             # lab一覧・詳細
│   │   │   ├── [labSlug]/        # lab・project一覧・詳細
│   │   │   └── settings/         # 設定
│   │   ├── api/                  # API Routes（必要最小限）
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/                # UIコンポーネント（見た目のみ）
│   │   ├── ui/                   # 共通UIパーツ（Button, Input等）
│   │   ├── layout/               # レイアウト系
│   │   ├── activity/             # Activity関連UI
│   │   ├── lab/                  # lab関連UI
│   │   ├── project/              # project関連UI
│   │   └── view/                 # ビュー関連（List, Kanban等）
│   │
│   ├── features/                  # 機能（ドメインごと）
│   │   ├── auth/                 # 認証
│   │   │   ├── hooks/            # useAuth, useSession等
│   │   │   ├── actions/          # Server Actions
│   │   │   └── types/            # 型定義
│   │   ├── lab/                  # lab
│   │   │   ├── hooks/
│   │   │   ├── actions/
│   │   │   └── types/
│   │   ├── project/              # project
│   │   │   ├── hooks/
│   │   │   ├── actions/
│   │   │   └── types/
│   │   ├── activity/             # Activity
│   │   │   ├── hooks/
│   │   │   ├── actions/
│   │   │   └── types/
│   │   └── ai/                   # AI機能
│   │       ├── hooks/
│   │       ├── actions/
│   │       └── types/
│   │
│   ├── lib/                       # 共通ライブラリ
│   │   ├── supabase/             # Supabaseクライアント
│   │   │   ├── client.ts         # ブラウザ用
│   │   │   ├── server.ts         # サーバー用
│   │   │   └── middleware.ts     # ミドルウェア用
│   │   ├── utils/                # ユーティリティ
│   │   └── constants/            # 定数
│   │
│   └── types/                     # グローバル型定義
│       ├── database.types.ts     # Supabase生成型
│       └── index.ts
│
├── supabase/                      # Supabase設定
│   ├── migrations/               # DBマイグレーション
│   ├── functions/                # Edge Functions
│   ├── seed.sql                  # シードデータ
│   └── config.toml               # Supabase設定
│
├── tests/                         # テスト
│   ├── unit/                     # 単体テスト
│   ├── integration/              # 統合テスト
│   └── e2e/                      # E2Eテスト（Playwright）
│
├── .github/
│   └── workflows/                # GitHub Actions
│       ├── ci.yml               # CI（Lint, Test）
│       └── deploy.yml           # デプロイ
│
├── docker-compose.yml             # Docker設定
├── Dockerfile
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## 5. 開発フロー

### 5.1 ハイブリッド開発サイクル（Figma駆動 + Spec駆動）

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        爆速開発サイクル                                  │
└─────────────────────────────────────────────────────────────────────────┘

1. 【Figma】UIデザイン作成
   ↓
2. 【MCP】Figma → AI がUIを完全再現（コンポーネント生成）
   ↓
3. 【Spec】機能仕様書作成（docs/specs/）
   ↓  ← 必要に応じてSupabase MCPでDB設計も
4. 【Test】テストケース作成
   ↓
5. 【Impl】features/ にロジック実装
   ↓
6. 【Verify】テスト実行 → 仕様との整合性確認
   ↓
7. 【Deploy】CI/CD で自動デプロイ
```

### 5.2 新規ページ作成フロー

```
1. Figmaで既存UIを参考に新規ページデザイン
   ↓
2. AIがFigmaデザインを再現
   ↓
3. 必要なfeatures/のhooksを特定・作成
   ↓
4. UIコンポーネントからhooksを呼び出し
   ↓
5. テスト作成・実行
```

### 5.3 仕様書の構造

各仕様書は `docs/specs/` に配置：

```
docs/specs/
├── features/
│   ├── auth.md                # 認証機能仕様
│   └── activity.md            # Activity機能仕様
├── api/
│   └── api-design.md          # API設計書（実装方式の選択基準）
├── database/
│   ├── schema.md              # DBスキーマ設計
│   ├── rls-policies.md        # RLSポリシー設計
│   ├── triggers-functions.md  # トリガー・関数設計
│   └── current-state.md       # DB現在の状態（型定義生成方法含む）
├── pages-design.md            # ページ設計書（MVPロードマップ、ルーティング）
```

詳細は [`docs/README.md`](./README.md) を参照

---

## 6. データベース設計方針

### 6.1 設計原則

- **RLS必須**: すべてのテーブルにRow Level Securityを設定
- **正規化**: 適切な正規化を行い、データの整合性を保つ
- **ソフトデリート**: 重要データは物理削除せず `deleted_at` で管理
- **監査ログ**: 重要な操作は `created_at`, `updated_at`, `created_by` を記録

### 6.2 主要テーブル（概要）

詳細は [`docs/specs/database/schema.md`](./specs/database/schema.md) に記載

| テーブル        | 説明                                         |
| --------------- | -------------------------------------------- |
| profiles        | ユーザープロフィール（Supabase Auth連携）    |
| labs            | 研究室（Lab）                                |
| lab_members     | 研究室メンバー（`is_owner` booleanフラグ）   |
| lab_invitations | Lab招待                                      |
| projects        | プロジェクト（`key`フィールドでLab内一意）   |
| activities      | Activity（`sequence_number`でProject内連番） |
| tags            | タグマスタ（Lab単位で管理）                  |
| activity_tags   | Activityとタグの中間テーブル                 |
| comments        | Activityへのコメント                         |
| attachments     | 添付ファイル                                 |
| ai_summaries    | AI生成サマリー                               |

### 6.3 ルーティング設計

Lab、Project、Activityの識別子設計：

- **Lab**: `slug`（グローバルにユニーク、ランダムサフィックス付き）
- **Project**: `key`（Lab内でユニーク、2-5桁の英数字、ユーザー設定）
- **Activity**: `sequence_number`（Project内で連番、自動設定）

詳細は [`docs/specs/pages-design.md`](./specs/pages-design.md) の「5. ルーティング設計」を参照

### 6.4 RLSポリシー・トリガー・関数

詳細は各仕様書を参照：

- **RLSポリシー**: [`docs/specs/database/rls-policies.md`](./specs/database/rls-policies.md)
- **トリガー・関数**: [`docs/specs/database/triggers-functions.md`](./specs/database/triggers-functions.md)
- **現在の状態**: [`docs/specs/database/current-state.md`](./specs/database/current-state.md)

---

## 7. API設計方針

詳細は [`docs/specs/api/api-design.md`](./specs/api/api-design.md) に記載

### 7.1 基本方針

**優先順位**: Supabase Client SDK > Server Actions > API Routes > Supabase Edge Functions > Database Functions

### 7.2 実装方式の選択基準（概要）

| 実装方式                    | 使用する場合                               |
| --------------------------- | ------------------------------------------ |
| **Supabase Client SDK**     | CRUD操作、認証、リアルタイム更新（最優先） |
| **Server Actions**          | フォーム送信、サーバー側での処理           |
| **API Routes**              | 外部API呼び出し、長時間実行、Webhook       |
| **Supabase Edge Functions** | 複数クライアント対応、バッチ処理           |
| **Database Functions**      | データベース内処理、RLSヘルパー            |

詳細な選択基準と実装例は [`docs/specs/api/api-design.md`](./specs/api/api-design.md) を参照

---

## 8. テスト戦略

### 8.1 テストピラミッド

```
        /\
       /E2E\        ← Playwright（主要シナリオ）
      /------\
     /Integration\  ← Supabase統合テスト
    /------------\
   /    Unit      \ ← Vitest（hooks, utils）
  /----------------\
```

### 8.2 テスト対象と方針

| レイヤー         | テスト種別       | ツール            | 方針                         |
| ---------------- | ---------------- | ----------------- | ---------------------------- |
| features/hooks   | 単体テスト       | Vitest            | ロジックの正確性を検証       |
| features/actions | 統合テスト       | Vitest + Supabase | DB操作を含めて検証           |
| components       | スナップショット | Vitest            | UI変更の検知（必要に応じて） |
| ページ全体       | E2E              | Playwright        | 主要ユーザーフローを検証     |

### 8.3 テストカバレッジ目標

- 単体テスト: 80%以上
- 統合テスト: 主要機能をカバー
- E2Eテスト: クリティカルパス

### 8.4 テスト実行タイミング

| タイミング    | 実行内容                      |
| ------------- | ----------------------------- |
| pre-commit    | Lint + 単体テスト（高速）     |
| PR作成時      | 全テスト + カバレッジレポート |
| main マージ時 | E2Eテスト + デプロイ          |

---

## 9. コーディング規約

### 9.1 命名規則

| 対象                         | 規則             | 例                           |
| ---------------------------- | ---------------- | ---------------------------- |
| ファイル名（コンポーネント） | PascalCase       | `ActivityCard.tsx`           |
| ファイル名（hooks）          | camelCase        | `useActivity.ts`             |
| ファイル名（utils）          | camelCase        | `formatDate.ts`              |
| 変数名                       | camelCase        | `activityList`               |
| 定数                         | UPPER_SNAKE_CASE | `MAX_ACTIVITIES`             |
| 型/インターフェース          | PascalCase       | `Activity`, `IActivityProps` |
| React コンポーネント         | PascalCase       | `ActivityCard`               |
| カスタムフック               | use + PascalCase | `useActivity`                |

### 9.2 コードスタイル

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 9.3 インポート順序

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 外部ライブラリ
import { format } from 'date-fns';

// 3. 内部モジュール（features）
import { useActivity } from '@/features/activity/hooks/useActivity';

// 4. 内部モジュール（components）
import { Button } from '@/components/ui/Button';

// 5. 型
import type { Activity } from '@/features/activity/types';
```

---

## 10. CI/CD

### 10.1 GitHub Actions ワークフロー

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    # ESLint, Prettier, TypeScript チェック

  test:
    # Vitest 単体/統合テスト

  e2e:
    # Playwright E2Eテスト（PRのみ）
```

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    # Vercel / その他へデプロイ
```

### 10.2 デプロイ環境

**デプロイ先: Vercel**

| 環境       | ブランチ | URL                     | Supabase           |
| ---------- | -------- | ----------------------- | ------------------ |
| Preview    | PR       | 自動生成（PRごと）      | 開発用プロジェクト |
| Production | main     | labio.vercel.app（TBD） | 本番用プロジェクト |

#### Vercel + Supabase 連携

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        デプロイフロー                                    │
└─────────────────────────────────────────────────────────────────────────┘

[GitHub]
   │
   ├─ PR作成 ──────────────────┐
   │                           ▼
   │                    [Vercel Preview]
   │                           │
   │                    CI: Lint + Test
   │                           │
   │                    Preview URL発行
   │
   └─ main マージ ─────────────┐
                               ▼
                        [Vercel Production]
                               │
                        E2Eテスト実行
                               │
                        本番デプロイ
```

#### 環境変数管理

| 変数                            | 説明                             | 設定場所                |
| ------------------------------- | -------------------------------- | ----------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase URL                     | Vercel                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key                | Vercel                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service Role Key（サーバーのみ） | Vercel                  |
| `OPENAI_API_KEY`                | OpenAI API Key                   | Supabase Edge Functions |

---

## 11. 認証・認可設計

### 11.1 認証方式

**Supabase Auth** を使用

| 認証方法          | 対応                        |
| ----------------- | --------------------------- |
| メール/パスワード | ✅ 対応                     |
| OAuth（Google等） | 🔜 将来対応（必要に応じて） |
| マジックリンク    | 🔜 将来対応（必要に応じて） |

### 11.2 権限管理

詳細は [`docs/specs/features/auth.md`](./specs/features/auth.md) と [`docs/specs/database/rls-policies.md`](./specs/database/rls-policies.md) に記載

#### 方式: **PostgreSQL RLS + `lab_members.is_owner` booleanフラグ**

**Supabaseの推奨パターンとの違い**:

Supabaseの推奨パターンでは`auth.users.app_metadata`にロールを格納しますが、Labioでは**Labごとに異なるロールを持つ必要がある**ため、`lab_members`テーブルに`is_owner` booleanフラグを持つ方式を採用しています。

**選択理由**:

- ✅ **Labごとのロール管理**: ユーザーは複数のLabに所属でき、Labごとに異なるロール（owner/member）を持つ必要がある
- ✅ **シンプルな設計**: booleanフラグで管理が簡単
- ✅ **データベーステーブルで管理**: データの整合性が保証され、クエリが効率的
- ✅ **RLSポリシーでの使用**: `is_lab_owner()`関数でLabごとの権限をチェック可能

**実装方式**:

- **`lab_members.is_owner`**: Labの所有者かどうか（`TRUE`: owner, `FALSE`: member）
- **RLSでの権限チェック**: `is_lab_owner()`関数でownerかどうかを確認
- **アプリ側での補助チェック**: UIの表示制御やServer Actionsでの追加検証

#### ロール階層

```
┌─────────────────────────────────────────────────────────────┐
│                     Lab内のロール                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  owner (Lab作成者/教授)                                     │
│    ├─ Lab設定の変更                                         │
│    ├─ メンバーの招待・削除                                   │
│    ├─ メンバーのis_ownerフラグ変更                           │
│    ├─ 全Projectの閲覧・編集                                 │
│    └─ すべてのActivityの閲覧・編集・削除                     │
│                                                             │
│  member (メンバー/生徒)                                      │
│    ├─ 自分のProjectの閲覧・編集                             │
│    └─ 自分のActivityの作成・編集・削除                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 実装詳細

詳細は [`docs/specs/database/rls-policies.md`](./specs/database/rls-policies.md) を参照

```sql
-- ヘルパー関数
CREATE OR REPLACE FUNCTION is_lab_owner(target_lab_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lab_members
    WHERE lab_id = target_lab_id
    AND user_id = auth.uid()
    AND is_owner = TRUE
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

#### 個人プランでの権限

個人プラン（`labs.is_personal = TRUE`）では、作成者が自動的にownerとなり、すべての操作が可能。

### 11.3 セキュリティ

#### データ保護

- **RLS**: すべてのテーブルで有効化（必須）
- **HTTPS**: 通信は常にHTTPS（Vercel/Supabaseで自動）
- **環境変数**: シークレットは環境変数で管理
- **入力検証**: Zodによるバリデーション

#### セキュリティチェックリスト

- [ ] RLSポリシーのテスト（全テーブル）
- [ ] ロール昇格攻撃の防止（`is_owner`フラグはServer Actionsでのみ更新可能、RLSポリシーで保護）
- [ ] SQLインジェクション対策（Supabase SDKで自動対応）
- [ ] XSS対策（React自動エスケープ）
- [ ] CSRF対策（Supabase Authで自動対応）
- [ ] 依存パッケージの脆弱性チェック（Dependabot）

---

## 12. 開発ロードマップ

詳細は [`docs/specs/pages-design.md`](./specs/pages-design.md) の「2. MVPロードマップ」を参照

### 12.1 Phase 1: MVP（最小機能）

基本的な研究管理機能を提供。詳細は [`docs/specs/pages-design.md`](./specs/pages-design.md) を参照

### 12.2 Phase 2以降

Phase 2以降の計画は [`docs/specs/pages-design.md`](./specs/pages-design.md) を参照

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                             | 変更者 |
| ---------- | ---------- | ------------------------------------------------------------------------------------ | ------ |
| 2024-12-02 | 1.0        | 初版作成                                                                             | -      |
| 2024-12-02 | 1.1        | 認証・認可設計、Activityステータス、AI機能、デプロイ設計を追加                       | -      |
| 2024-12-04 | 1.2        | 仕様書の重複を整理、認証・認可設計を`is_owner`ベースに更新、技術スタック情報を最新化 | -      |
