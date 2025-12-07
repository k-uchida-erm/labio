# セキュリティガイド：機密情報の管理

## 🔐 機密情報とは？

**機密情報**とは、漏洩するとセキュリティリスクになる情報です。Gitにコミットしてはいけません。

---

## ❌ Gitにコミットしてはいけないもの（機密情報）

### 1. 認証情報・APIキー

```env
# ❌ NG: これらをGitにコミットしてはいけない
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxx
FIGMA_ACCESS_TOKEN=figd_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
NOTION_API_TOKEN=secret_xxxxxxxxxxxxx
```

**理由**: これらのキーが漏洩すると、第三者があなたのサービスにアクセスできる

### 2. パスワード

```sql
-- ❌ NG: マイグレーションファイルにパスワードを書いてはいけない
CREATE USER admin WITH PASSWORD 'secret123';
INSERT INTO users VALUES ('admin@example.com', 'password123');
```

**理由**: パスワードが漏洩すると、アカウントが乗っ取られる

### 3. 個人情報（PII: Personally Identifiable Information）

```sql
-- ❌ NG: 実在する個人情報を含むデータをマイグレーションに書いてはいけない
INSERT INTO users VALUES (
  'john.doe@example.com',
  'John Doe',
  '123-456-7890',  -- 電話番号
  '123 Main St, Tokyo'  -- 住所
);
```

**理由**: 個人情報保護法（GDPR、日本の個人情報保護法など）に違反する可能性

### 4. 本番環境の接続情報

```sql
-- ❌ NG: 本番環境のDB接続情報をマイグレーションに書いてはいけない
-- Connection string with password
CREATE DATABASE LINK prod_db CONNECT TO admin IDENTIFIED BY 'prod_password';
```

**理由**: 本番環境への不正アクセスを許す

### 5. 暗号化キー・シークレット

```sql
-- ❌ NG: 暗号化キーをマイグレーションに書いてはいけない
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 暗号化キーをハードコード
SET encryption_key = 'my-secret-key-12345';
```

**理由**: 暗号化が無効化される

---

## ✅ Gitにコミットして良いもの（マイグレーションファイル）

### 1. スキーマ定義（テーブル、カラム、インデックス）

```sql
-- ✅ OK: スキーマ定義は安全
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email);
```

**理由**: データベースの構造のみで、機密情報は含まれない

### 2. 制約・外部キー

```sql
-- ✅ OK: 制約定義は安全
ALTER TABLE public.activities
  ADD CONSTRAINT activities_lab_id_fkey
  FOREIGN KEY (lab_id) REFERENCES public.labs(id);
```

**理由**: データベースの整合性ルールのみで、機密情報は含まれない

### 3. 関数・トリガー（ロジックのみ）

```sql
-- ✅ OK: 関数のロジックは安全
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**理由**: データベースのロジックのみで、機密情報は含まれない

### 4. RLSポリシー（権限定義）

```sql
-- ✅ OK: RLSポリシーは安全
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());
```

**理由**: 権限ルールのみで、機密情報は含まれない

### 5. テスト用のダミーデータ（本番データではない）

```sql
-- ✅ OK: テスト用のダミーデータは安全（ただし、本番環境では実行しない）
-- 注意: 本番環境では seed.sql を使わない
INSERT INTO public.labs (name, slug) VALUES
  ('Test Lab 1', 'test-lab-1'),
  ('Test Lab 2', 'test-lab-2');
```

**理由**: 実在する個人情報や機密情報を含まないダミーデータは安全

---

## 📋 現在のプロジェクトでの管理方法

### 機密情報の管理場所

| 情報の種類               | 管理場所                                                                                    | Git管理 |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------- |
| **APIキー・トークン**    | `.env.local`（ローカル）<br>GitHub Secrets（CI/CD）<br>Vercel Environment Variables（本番） | ❌ 除外 |
| **データベース接続情報** | `.env.local`（ローカル）<br>GitHub Secrets（CI/CD）                                         | ❌ 除外 |
| **スキーマ定義**         | `supabase/migrations/*.sql`                                                                 | ✅ 管理 |
| **テストデータ**         | `supabase/seed.sql`（ローカルのみ）                                                         | ✅ 管理 |

### `.gitignore`で除外されているもの

```gitignore
# env files (can opt-in for committing if needed)
.env*
```

**重要**: `.env*`ファイルは全てGitから除外されています。

### 安全なファイル（Gitで管理）

- ✅ `supabase/migrations/*.sql` - スキーマ定義のみ
- ✅ `env.example` - テンプレート（実際の値は空）
- ✅ `supabase/seed.sql` - テスト用ダミーデータ（本番では使用しない）

---

## 🚨 機密情報を誤ってコミットしてしまった場合

### 1. すぐに取り消す

```bash
# 最新のコミットを取り消す（まだプッシュしていない場合）
git reset --soft HEAD~1

# 機密情報を含むファイルを修正
# .env.local から機密情報を削除

# 再度コミット
git add .
git commit -m "fix: remove sensitive information"
```

### 2. 既にプッシュしてしまった場合

**重要**: 既にプッシュした場合、Git履歴から完全に削除する必要があります。

```bash
# Git履歴から機密情報を削除（git-filter-repo を使用）
git filter-repo --path .env.local --invert-paths

# 強制プッシュ（注意: チームメンバーに通知が必要）
git push origin --force --all
```

**注意**: 既に漏洩した機密情報は、以下の対応が必要です：

1. **APIキー・トークン**: すぐに無効化して新しいキーを発行
2. **パスワード**: すぐに変更
3. **データベース接続情報**: 接続元IPを制限、必要に応じてパスワード変更

---

## ✅ チェックリスト

マイグレーションファイルを作成する前に、以下を確認：

- [ ] パスワードを含んでいないか
- [ ] APIキー・トークンを含んでいないか
- [ ] 実在する個人情報を含んでいないか
- [ ] 本番環境の接続情報を含んでいないか
- [ ] 暗号化キーを含んでいないか

**すべて「いいえ」なら、安全にコミットできます。**

---

## 📚 参考

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - セキュリティのベストプラクティス
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/guides/best-practices-for-using-secrets-in-github-actions)
- [Supabase Security Guide](https://supabase.com/docs/guides/platform/security)
