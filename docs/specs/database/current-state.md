# データベース現在の状態

## 概要

このドキュメントは、Labioデータベースの現在の状態を記録します。

**最終更新日**: 2024-12-03  
**Supabase Project ID**: `ucsurbtmhabygssexisq`

---

## 型定義の自動生成

TypeScriptの型定義はSupabaseから自動生成されます。

### 生成方法

**方法1: Cursor MCP（推奨）**
```
Cursorで mcp_supabase_generate_typescript_types を実行
Project ID: ucsurbtmhabygssexisq
```

**方法2: Supabase CLI**
```bash
# 環境変数を設定
export SUPABASE_ACCESS_TOKEN=your-token
export SUPABASE_PROJECT_ID=ucsurbtmhabygssexisq

# 型定義を生成
make db-types
```

### 生成されるファイル
- `src/types/database.types.ts` - DBスキーマの型定義（自動生成）

### 使用方法
```typescript
import { Tables, Enums } from '@/types/database.types';

// テーブルの行型
type Activity = Tables<'activities'>;
type Project = Tables<'projects'>;

// ENUM型
type ActivityStatus = Enums<'activity_status'>;
// lab_role ENUM型は削除され、lab_members.is_owner (boolean) に変更されました
```

---

## テーブル一覧

**最終確認日**: 2024-12-04

| テーブル名 | 説明 | RLS | 行数 |
|-----------|------|-----|------|
| profiles | ユーザープロフィール | ✅ | 0 |
| labs | Lab（研究室） | ✅ | 0 |
| lab_members | Labメンバー | ✅ | 0 |
| lab_invitations | Lab招待 | ✅ | 0 |
| projects | プロジェクト | ✅ | 0 |
| activities | アクティビティ | ✅ | 0 |
| tags | タグ | ✅ | 0 |
| activity_tags | アクティビティ-タグ中間 | ✅ | 0 |
| comments | コメント | ✅ | 0 |
| attachments | 添付ファイル | ✅ | 0 |
| ai_summaries | AI生成サマリー | ✅ | 0 |

**RLS状態**: ✅ すべてのテーブルでRLSが有効化されています（2024-12-04確認）

---

## 主要関数一覧

| 関数名 | 説明 |
|--------|------|
| `is_lab_member(target_lab_id)` | 指定Labのメンバーかどうか |
| `is_lab_owner(target_lab_id)` | 指定Labのownerかどうか |
| `is_project_assignee(target_project_id)` | 指定プロジェクトの担当者かどうか |
| `get_lab_statistics(target_lab_id)` | Lab統計情報を取得 |
| `generate_invitation_token()` | 招待トークンを生成 |
| `generate_slug(name)` | 名前からslugを生成 |

---

## 変更履歴

> **注意**: 詳細な変更履歴はSupabase Dashboardのマイグレーション履歴で確認できます。ここでは重要な設計変更のみ記録します。

| 日付 | 変更内容 | 影響範囲 |
|------|----------|---------|
| 2024-12-02 | 初期スキーマ作成 | - |
| 2024-12-02 | `research_themes` → `projects` にリネーム | テーブル名、外部キー |
| 2024-12-02 | `theme_id` → `project_id` にリネーム | カラム名、外部キー |
| 2024-12-03 | 現在の状態を文書化 | - |
| 2024-12-03 | `lab_role` ENUM型を削除、`is_owner` booleanフラグに変更 | RLSポリシー、ヘルパー関数 |
| 2024-12-04 | `schema.md`を簡略化（設計意図のみに） | ドキュメント |

---

## DB設計変更時のチェックリスト

DB設計を変更する際は、以下を確認してください：

- [ ] マイグレーションSQLを作成・実行
- [ ] `make db-types`で型定義を更新
- [ ] TypeScriptの型エラーを解消
- [ ] RLSポリシーへの影響を確認・更新
- [ ] トリガー・関数への影響を確認・更新
- [ ] 既存のコードへの影響を確認・修正
- [ ] テストを実行
- [ ] `current-state.md`の変更履歴を更新
- [ ] `schema.md`の設計意図を更新（必要に応じて）
