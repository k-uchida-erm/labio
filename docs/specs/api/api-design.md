# API設計書

## 1. 概要

本ドキュメントでは、LabioのAPI設計方針と、Next.js側（Server Actions / API Routes）とSupabase側（Database Functions / Edge Functions）の使い分け基準を定義する。

---

## 2. API実装方式の選択基準

### 2.1 基本方針

**優先順位**: Supabase Client SDK > Server Actions > API Routes > Supabase Edge Functions > Database Functions

```
┌─────────────────────────────────────────────────────────────┐
│                    API実装方式の選択フロー                   │
└─────────────────────────────────────────────────────────────┘

1. 【Supabase Client SDK】
   ↓ 直接DB操作が可能で、RLSで保護されている場合
   ✅ 使用する（最もシンプル）

2. 【Server Actions】
   ↓ サーバー側での処理が必要な場合
   ✅ 使用する（Next.js App Routerの標準）

3. 【API Routes】
   ↓ 以下のいずれかに該当する場合
   - 外部API呼び出しが必要（AI API等）
   - 長時間実行される処理
   - Webhook受信
   - 外部サービス連携
   ✅ 使用する

4. 【Supabase Edge Functions】
   ↓ 以下のいずれかに該当する場合
   - サーバーレス関数として独立させたい
   - 複数のクライアントから呼び出される
   - バッチ処理や定期実行
   ✅ 使用する

5. 【Database Functions】
   ↓ 以下のいずれかに該当する場合
   - データベース内でのみ完結する処理
   - トリガーから呼び出される
   - 複雑なSQL処理
   ✅ 使用する
```

### 2.2 各方式の詳細基準

#### 2.2.1 Supabase Client SDK（最優先）

**使用する場合**:

- ✅ CRUD操作（RLSで保護されている）
- ✅ リアルタイム更新（Realtime）
- ✅ 認証・認可（Supabase Auth）
- ✅ ファイルアップロード（Storage）
- ✅ シンプルなクエリ

**使用しない場合**:

- ❌ 外部API呼び出しが必要
- ❌ 複雑なビジネスロジック
- ❌ サーバー側でのみ実行すべき処理

**実装例**:

```typescript
// features/activity/hooks/useActivities.ts
import { createClient } from '@/lib/supabase/client';

export function useActivities(projectId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('project_id', projectId)
    .order('position');

  return { data, error };
}
```

#### 2.2.2 Server Actions

**使用する場合**:

- ✅ フォーム送信（`<form action={action}>`）
- ✅ サーバー側でのバリデーション
- ✅ サーバー側でのデータ変換
- ✅ セッション管理が必要な処理
- ✅ ファイルアップロードの処理（Storageへの保存）

**使用しない場合**:

- ❌ 外部API呼び出し（API Routesを使用）
- ❌ 長時間実行される処理（API Routesを使用）
- ❌ Webhook受信（API Routesを使用）

**実装例**:

```typescript
// features/activity/actions/createActivity.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createActivity(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('activities').insert({
    project_id: formData.get('project_id'),
    title: formData.get('title'),
    created_by: user.id,
  });

  if (error) throw error;

  revalidatePath(`/[labSlug]/[projectSlug]`);
}
```

#### 2.2.3 API Routes（`/app/api/`）

**使用する場合**:

- ✅ **外部API呼び出し**（OpenAI API、Marp CLI等）
- ✅ **長時間実行される処理**（AI要約生成、資料生成）
- ✅ **Webhook受信**（外部サービスからの通知）
- ✅ **ファイル処理**（画像リサイズ、PDF生成等）
- ✅ **バッチ処理**（大量データの一括処理）

**使用しない場合**:

- ❌ 単純なCRUD操作（Supabase Client SDKを使用）
- ❌ フォーム送信（Server Actionsを使用）

**実装例**:

```typescript
// app/api/v1/ai/summarize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { activityIds } = await request.json();

  // OpenAI API呼び出し
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: '...' }],
    }),
  });

  const data = await response.json();
  return NextResponse.json({ success: true, data });
}
```

#### 2.2.4 Supabase Edge Functions

**使用する場合**:

- ✅ **複数のクライアントから呼び出される**（Web、モバイル等）
- ✅ **バッチ処理や定期実行**（Cron Jobs）
- ✅ **サーバーレス関数として独立させたい**
- ✅ **Supabaseエコシステム内で完結する処理**

**使用しない場合**:

- ❌ Next.jsアプリからのみ呼び出される（Server Actions / API Routesを使用）
- ❌ セッション管理が必要（Server Actionsを使用）

**実装例**:

```typescript
// supabase/functions/generate-summary/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // OpenAI API呼び出し
  // ...

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

#### 2.2.5 Database Functions（PostgreSQL Functions）

**使用する場合**:

- ✅ **データベース内でのみ完結する処理**
- ✅ **トリガーから呼び出される**
- ✅ **複雑なSQL処理**（集計、統計計算等）
- ✅ **RLSポリシーで使用するヘルパー関数**

**使用しない場合**:

- ❌ 外部API呼び出しが必要（API Routes / Edge Functionsを使用）
- ❌ ビジネスロジック（Server Actionsを使用）

**実装例**:

```sql
-- RLSヘルパー関数
CREATE OR REPLACE FUNCTION is_lab_member(target_lab_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lab_members
    WHERE lab_id = target_lab_id
    AND user_id = auth.uid()
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 統計情報取得関数
CREATE OR REPLACE FUNCTION get_lab_statistics(target_lab_id UUID)
RETURNS JSON AS $$
  -- 複雑なSQL処理
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

---

## 3. 機能別実装方式マッピング

| 機能                     | 実装方式                          | 理由                                |
| ------------------------ | --------------------------------- | ----------------------------------- |
| **認証・認可**           | Supabase Auth（Client SDK）       | Supabaseの標準機能                  |
| **CRUD操作**             | Supabase Client SDK               | RLSで保護されているため直接操作可能 |
| **フォーム送信**         | Server Actions                    | Next.js App Routerの標準            |
| **ファイルアップロード** | Server Actions → Supabase Storage | サーバー側での処理が必要            |
| **AI要約生成**           | API Routes → OpenAI API           | 外部API呼び出しが必要               |
| **Marp資料生成**         | API Routes → Marp CLI             | 外部CLI実行が必要                   |
| **リアルタイム更新**     | Supabase Realtime（Client SDK）   | Supabaseの標準機能                  |
| **統計情報取得**         | Database Functions                | 複雑なSQL処理                       |
| **バッチ処理**           | Supabase Edge Functions           | 定期実行が必要                      |
| **Webhook受信**          | API Routes                        | HTTPエンドポイントが必要            |

---

## 4. エラーハンドリング

### 4.1 統一エラーレスポンス形式

**成功時**:

```typescript
{
  success: true,
  data: { ... }
}
```

**エラー時**:

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message",
    details?: { ... } // オプション
  }
}
```

### 4.2 エラーコード一覧

| エラーコード         | HTTPステータス | 説明                   |
| -------------------- | -------------- | ---------------------- |
| `UNAUTHORIZED`       | 401            | 認証が必要             |
| `FORBIDDEN`          | 403            | 権限不足               |
| `NOT_FOUND`          | 404            | リソースが見つからない |
| `VALIDATION_ERROR`   | 400            | バリデーションエラー   |
| `INTERNAL_ERROR`     | 500            | サーバー内部エラー     |
| `EXTERNAL_API_ERROR` | 502            | 外部APIエラー          |

### 4.3 実装例

```typescript
// app/api/v1/ai/summarize/route.ts
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    // バリデーション
    const body = await request.json();
    if (!body.activityIds || !Array.isArray(body.activityIds)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'activityIdsが必要です' } },
        { status: 400 }
      );
    }

    // 処理実行
    const result = await generateSummary(body.activityIds);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' },
      },
      { status: 500 }
    );
  }
}
```

---

## 5. 認証・認可

### 5.1 認証方式

すべてのAPIはSupabase Authを使用して認証を行う。

**Client SDK**:

```typescript
const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
```

**Server Actions / API Routes**:

```typescript
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) throw new Error('Unauthorized');
```

### 5.2 認可方式

- **RLS（Row Level Security）**: データベースレベルでの認可（最優先）
- **Server Actions / API Routes**: 追加のビジネスロジックチェック

---

## 6. API Routes設計規約

### 6.1 パス構造

```
/app/api/v1/{resource}/{action}/route.ts
```

**例**:

- `/app/api/v1/ai/summarize/route.ts`
- `/app/api/v1/ai/generate-slides/route.ts`
- `/app/api/v1/webhooks/stripe/route.ts`

### 6.2 HTTPメソッド

| メソッド | 用途                         |
| -------- | ---------------------------- |
| `GET`    | リソース取得                 |
| `POST`   | リソース作成、アクション実行 |
| `PUT`    | リソース更新（完全置換）     |
| `PATCH`  | リソース更新（部分更新）     |
| `DELETE` | リソース削除                 |

### 6.3 バージョニング

- パスに `/v1/` を含める
- 将来のバージョンアップ時は `/v2/` を作成

---

## 7. Server Actions設計規約

### 7.1 ファイル配置

```
src/features/{domain}/actions/{actionName}.ts
```

**例**:

- `src/features/activity/actions/createActivity.ts`
- `src/features/activity/actions/updateActivity.ts`
- `src/features/project/actions/createProject.ts`

### 7.2 命名規則

- 関数名: `{action}{Resource}`（例: `createActivity`, `updateActivity`）
- ファイル名: `{actionName}.ts`（例: `createActivity.ts`）

### 7.3 必須事項

- `'use server'` ディレクティブをファイルの先頭に記述
- 認証チェックを実装
- エラーハンドリングを実装
- `revalidatePath` または `revalidateTag` でキャッシュを無効化

---

## 8. Supabase Edge Functions設計規約

### 8.1 ファイル配置

```
supabase/functions/{function-name}/index.ts
```

### 8.2 命名規則

- 関数名: `kebab-case`（例: `generate-summary`, `send-notification`）

### 8.3 必須事項

- 認証チェックを実装
- エラーハンドリングを実装
- 環境変数でシークレットを管理

---

## 9. Database Functions設計規約

### 9.1 命名規則

- 関数名: `snake_case`（例: `is_lab_member`, `get_lab_statistics`）

### 9.2 必須事項

- `SECURITY DEFINER` を適切に使用
- RLSポリシーで使用する関数は `STABLE` を指定
- コメントを記述

---

## 10. 実装チェックリスト

### 10.1 新規API実装時

- [ ] 適切な実装方式を選択（基準に従う）
- [ ] 認証・認可を実装
- [ ] エラーハンドリングを実装
- [ ] 統一エラーレスポンス形式を使用
- [ ] 型定義を実装
- [ ] テストを実装
- [ ] ドキュメントを更新

### 10.2 CRUD操作の場合

- [ ] Supabase Client SDKで実装できないか検討
- [ ] RLSポリシーが適切に設定されているか確認
- [ ] Server Actionsが必要な場合のみ実装

### 10.3 外部API呼び出しの場合

- [ ] API Routesで実装
- [ ] 環境変数でAPIキーを管理
- [ ] エラーハンドリングを実装
- [ ] レート制限を考慮

---

## 11. パフォーマンス考慮事項

### 11.1 キャッシュ戦略

- **Server Actions**: `revalidatePath` / `revalidateTag` でキャッシュを無効化
- **API Routes**: `Cache-Control` ヘッダーでキャッシュ制御
- **Supabase Client SDK**: `cache` オプションでキャッシュ制御

### 11.2 レート制限

- **外部API呼び出し**: レート制限を考慮した実装
- **API Routes**: 必要に応じてレート制限を実装

### 11.3 タイムアウト

- **API Routes**: 長時間実行される処理は適切なタイムアウトを設定
- **Supabase Edge Functions**: デフォルトタイムアウト（60秒）を考慮

---

## 12. セキュリティ考慮事項

### 12.1 認証・認可

- ✅ すべてのAPIで認証チェックを実装
- ✅ RLSポリシーでデータベースレベルでの認可を実装
- ✅ 追加のビジネスロジックチェックを実装

### 12.2 入力検証

- ✅ すべての入力データをバリデーション
- ✅ Zod等のバリデーションライブラリを使用

### 12.3 シークレット管理

- ✅ 環境変数でシークレットを管理
- ✅ `.env.local` をGitにコミットしない
- ✅ Vercel / Supabaseの環境変数設定を使用

---

## 13. まとめ

### 13.1 実装方式の選択フロー（再掲）

1. **Supabase Client SDK**: CRUD操作、認証、リアルタイム更新
2. **Server Actions**: フォーム送信、サーバー側処理
3. **API Routes**: 外部API呼び出し、長時間実行、Webhook
4. **Supabase Edge Functions**: 複数クライアント対応、バッチ処理
5. **Database Functions**: データベース内処理、RLSヘルパー

### 13.2 重要な原則

- **最小限の実装**: できるだけSupabase Client SDKを使用
- **適切な分離**: 各方式の責務を明確に分離
- **セキュリティ**: 認証・認可を必ず実装
- **エラーハンドリング**: 統一された形式で実装
- **型安全性**: TypeScriptで型定義を実装
