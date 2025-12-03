# CI/CD自動化ガイド

## 1. CI/CDとは？

**CI（Continuous Integration）**: コードをマージする前に自動的にテスト・チェック  
**CD（Continuous Deployment）**: テストが通ったら自動的にデプロイ

## 2. なぜ必要？

### 2.1 手動作業の問題点

❌ **手動でやると**:
- テストを忘れる
- 型エラーを見逃す
- 壊れたコードが本番にデプロイされる
- 複数人で開発する際にコンフリクトが増える

✅ **自動化すると**:
- プッシュするたびに自動チェック
- 壊れたコードは自動的にブロック
- デプロイが自動化され、手間が減る
- コード品質が保たれる

### 2.2 Labioで必要な理由

1. **型安全性**: TypeScriptの型エラーを自動検出
2. **コード品質**: Lint/Formatチェックを自動実行
3. **テスト**: 機能追加時のテストが実行されるか確認
4. **デプロイ**: Vercelへの自動デプロイ（PRごとにPreview環境）

---

## 3. MVP段階で必要な最小限の自動化

### 3.1 必須（今すぐ設定すべき）

#### ✅ PR作成時の自動チェック

```yaml
# .github/workflows/ci.yml
- Lintチェック（ESLint）
- 型チェック（TypeScript）
- フォーマットチェック（Prettier）
- 単体テスト（Vitest）
```

**効果**: 壊れたコードがmainブランチにマージされるのを防ぐ

#### ✅ Vercel自動デプロイ

VercelとGitHubを連携するだけで自動設定される：
- PR作成 → Preview環境に自動デプロイ
- mainマージ → 本番環境に自動デプロイ

**設定方法**: Vercel DashboardでGitHubリポジトリを連携するだけ

### 3.2 推奨（後から追加）

#### 🟡 E2Eテスト（Playwright）

```yaml
# PR作成時にE2Eテストを実行
- 主要なユーザーフローをテスト
- 時間がかかるので、PR時のみ実行
```

**効果**: ブラウザでの動作確認を自動化

#### 🟢 カバレッジレポート

```yaml
# テストカバレッジをレポート
- カバレッジ80%以上を目標
- PRにコメントで表示
```

**効果**: テストが不足している箇所を可視化

---

## 4. 設定手順

### 4.1 最小限のCI設定（今すぐ設定）

`.github/workflows/ci.yml`を作成：

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Format check
        run: npm run format:check
      
      - name: Test
        run: npm test
```

### 4.2 Vercel自動デプロイ設定

#### ステップ1: プロジェクト作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New Project」をクリック
3. GitHubリポジトリ（`k-uchida-erm/labio`）を選択
4. Framework Preset: `Next.js`（自動検出される）
5. Root Directory: `./`（そのまま）

#### ステップ2: 環境変数の設定（重要！）

**「Environment Variables」セクションを開いて、以下を追加：**

| 環境変数名 | 値の取得方法 | 環境 |
|-----------|------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) > Settings > API > Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 同上 > Project API keys > `anon` `public` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | 同上 > Project API keys > `service_role` `secret` | Production, Preview（⚠️ サーバー側のみ） |

**設定手順**:
1. 「Environment Variables」セクションを開く
2. 「Add New」をクリック
3. 環境変数名を入力（例: `NEXT_PUBLIC_SUPABASE_URL`）
4. 値を入力（`.env.local`と同じ値を使用）
5. 環境を選択（Production, Preview, Development すべてにチェック）
6. 「Save」をクリック
7. 残りの環境変数も同様に追加

**注意**: `.env.local`の値をそのままコピーして使用できます。

#### ステップ3: デプロイ

1. 環境変数をすべて設定したら「Deploy」をクリック
2. デプロイが完了するまで待つ（2-3分）
3. デプロイ完了後、URLが表示される

**これだけで自動デプロイが設定されます！**

---

### 4.3 環境変数の確認方法

デプロイ後、環境変数が正しく設定されているか確認：

1. Vercel Dashboard > プロジェクト > Settings > Environment Variables
2. すべての環境変数が表示されているか確認
3. 値が正しいか確認（`NEXT_PUBLIC_*`は公開されるので注意）

---

## 5. よくある質問

### Q: CI/CDは必須？

**A: MVP段階では必須ではありませんが、推奨します。**

- **個人開発・小規模**: CIは後からでもOK（手動でテスト実行）
- **チーム開発**: CIは必須（コード品質を保つため）
- **デプロイ**: Vercel連携は簡単なので設定推奨

### Q: 何から始めるべき？

**A: 優先順位**

1. **Vercel自動デプロイ**（5分で設定可能、すぐに効果がある）
2. **CI（Lint + TypeCheck）**（コード品質を保つ）
3. **テスト自動実行**（テストを書く習慣がついてから）

### Q: コストは？

**A: 無料プランで十分です**

- **GitHub Actions**: 無料プランで月2,000分（個人開発なら十分）
- **Vercel**: 無料プランで十分（本番環境まで無料）

### Q: 設定が複雑？

**A: 最小限なら5分で設定可能**

- Vercel: GitHub連携するだけ
- CI: `.github/workflows/ci.yml`を1ファイル追加するだけ

---

## 6. まとめ

### MVP段階での推奨設定

| 自動化 | 優先度 | 設定時間 | 効果 |
|--------|--------|---------|------|
| **Vercel自動デプロイ** | 🔴 高 | 5分 | PRごとにPreview環境が自動生成 |
| **CI（Lint + TypeCheck）** | 🟡 中 | 10分 | コード品質を自動チェック |
| **テスト自動実行** | 🟢 低 | 10分 | テストが実行されるか確認 |

### 設定しない場合のリスク

- 型エラーやLintエラーを見逃す
- 壊れたコードが本番にデプロイされる
- 手動デプロイの手間が増える

### 推奨アクション

1. **今すぐ**: Vercel自動デプロイを設定（5分）
2. **後で**: CI設定を追加（10分）
3. **テストが増えてきたら**: テスト自動実行を追加

---

## 7. 参考リンク

- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)
- [Vercel ドキュメント](https://vercel.com/docs)
- [Next.js デプロイガイド](https://nextjs.org/docs/deployment)

