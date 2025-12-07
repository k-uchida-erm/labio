.PHONY: help up down build rebuild logs shell clean install dev lint format test typecheck lint-fix format-check test-e2e db-types setup-hooks supabase-start supabase-stop supabase-sync supabase-reset supabase-migrate env-use-develop env-restore-local
# デフォルトターゲット
help:
	@echo "Labio 開発コマンド"
	@echo ""
	@echo "基本操作:"
	@echo "  make up        - コンテナを起動（開発サーバー）"
	@echo "  make down      - コンテナを停止"
	@echo "  make build     - イメージをビルド"
	@echo "  make rebuild   - イメージを再ビルド（キャッシュなし）"
	@echo "  make logs      - ログを表示"
	@echo "  make shell     - コンテナ内でシェルを起動"
	@echo "  make clean     - コンテナ・ボリュームを削除"
	@echo ""
	@echo "開発ツール（Docker内で実行）:"
	@echo "  make install   - 依存関係をインストール"
	@echo "  make lint      - Lintを実行"
	@echo "  make lint-fix  - Lintを実行（自動修正）"
	@echo "  make format    - フォーマットを実行"
	@echo "  make test      - テストを実行"
	@echo "  make test-e2e  - E2Eテストを実行"
	@echo "  make typecheck - 型チェックを実行"
	@echo "  make db-types  - Supabase型定義を生成"
	@echo "  make setup-hooks - Gitフックをセットアップ"
	@echo ""
	@echo "DB同期:"
	@echo "  make supabase-start     - ローカルSupabaseを起動"
	@echo "  make supabase-stop      - ローカルSupabaseを停止"
	@echo "  make supabase-sync      - リモート（labio-dev）から最新マイグレーションを取得してローカルDBを再構築"
	@echo "  make supabase-reset     - ローカルのマイグレーションファイルのみでローカルDBを再構築（リモート同期なし）"
	@echo "  make supabase-migrate   - 新しいマイグレーションファイルのみをローカルDBに適用（既存データは保持）"
	@echo ""
	@echo "環境切替:"
	@echo "  make env-use-develop   - .env.develop を .env.local に適用（既存は .env.local.backup に退避）"
	@echo "  make env-restore-local - .env.local.backup から .env.local を復元"

# =============================================================================
# Docker コマンド
# =============================================================================

# コンテナを起動（バックグラウンド）
up:
	docker compose up -d
	@echo ""
	@echo "✅ 起動しました: http://localhost:3000"

# コンテナを停止
down:
	docker compose down

# イメージをビルド
build:
	docker compose build

# イメージを再ビルド（キャッシュなし）
rebuild:
	docker compose build --no-cache

# ログを表示（フォロー）
logs:
	docker compose logs -f

# コンテナ内でシェルを起動
shell:
	docker compose exec app sh

# コンテナ・ボリューム・イメージを削除
clean:
	docker compose down -v --rmi local
	@echo "✅ クリーンアップ完了"

# =============================================================================
# 開発ツール（Docker内で実行）
# =============================================================================

# 依存関係をインストール
install:
	docker compose run --rm app npm install

# Lintを実行
lint:
	docker compose run --rm app npm run lint

# Lintを実行（自動修正）
lint-fix:
	docker compose run --rm app npm run lint:fix

# フォーマットを実行
format:
	docker compose run --rm app npm run format

# フォーマットチェック
format-check:
	docker compose run --rm app npm run format:check

# テストを実行
test:
	docker compose run --rm app npm run test

# テストを実行（UIモード）
test-ui:
	docker compose run --rm -p 51204:51204 app npm run test:ui

# E2Eテストを実行
test-e2e:
	docker compose run --rm app npm run test:e2e

# 型チェックを実行
typecheck:
	docker compose run --rm app npm run typecheck

# 本番ビルド
build-app:
	docker compose run --rm app npm run build

# =============================================================================
# Supabase コマンド
# =============================================================================

# 型定義を自動生成（Supabase CLIを使用）
# ターミナルから実行する場合: make db-types
# 注意: .env.localからSUPABASE_ACCESS_TOKENを自動読み込み
db-types:
	@echo "Supabaseから型定義を自動生成中..."
	@bash -c 'bash .cursor/load-env.sh sh -c "npx supabase gen types typescript --project-id ucsurbtmhabygssexisq" > src/types/database.types.ts'
	@echo "✅ 型定義を生成しました: src/types/database.types.ts"

# =============================================================================
# Supabase local helpers
# =============================================================================

supabase-start:
	npx supabase start

supabase-stop:
	npx supabase stop || true

# リモート（labio-dev）から最新マイグレーションを取得してローカルDBを再構築
# これが通常の開発フローで使用するコマンド
# リモートのスキーマをpullして、ローカルのマイグレーションファイルを更新
supabase-sync: supabase-start
	@echo "🔄 リモート（labio-dev）にリンク中..."
	@bash .cursor/load-env.sh sh -c 'npx supabase link --project-ref ucsurbtmhabygssexisq' || echo "⚠️  link failed, continuing..."
	@echo "🔄 リモート（labio-dev）から最新スキーマを取得中..."
	@bash .cursor/load-env.sh sh -c 'npx supabase db pull' || echo "⚠️  db pull failed, continuing..."
	@echo "🔄 ローカルDBを最新マイグレーションで再構築中..."
	npx supabase db reset
	@echo "✅ ローカルDBをリモートの最新状態に同期しました"

# ローカルのマイグレーションファイルのみでローカルDBを再構築（リモート同期なし）
# リモートから取得せず、ローカルのsupabase/migrations/にあるマイグレーションのみを適用
supabase-reset: supabase-start
	@echo "🔄 ローカルDBをローカルのマイグレーションファイルで再構築中..."
	npx supabase db reset
	@echo "✅ ローカルDBをリセットしました（ローカルのマイグレーションファイルを適用）"
	@echo "⚠️  注意: リモートに既に適用されているマイグレーションがローカルにない場合、履歴の不一致が発生します"
	@echo "   リモートの最新状態に同期するには、make supabase-sync を使用してください"

# 新しいマイグレーションファイルのみをローカルDBに適用（既存データは保持）
# 注意: ローカルSupabaseは起動している必要があります
# 未適用のマイグレーションのみを適用します（既存データは保持されます）
supabase-migrate: supabase-start
	@echo "🔄 新しいマイグレーションをローカルDBに適用中..."
	npx supabase migration up
	@echo "✅ マイグレーションを適用しました（既存データは保持されています）"

# Gitフックをセットアップ
# Dockerコンテナ内で実行する場合: make setup-hooks
# 注意: Gitがインストールされている必要があります
setup-hooks:
	@echo "Gitフックをセットアップ中..."
	@docker compose run --rm app sh -c "git config core.hooksPath .githooks && chmod +x .githooks/pre-commit && chmod +x .githooks/post-commit"
	@echo "✅ Gitフックをセットアップしました"

# =============================================================================
# Env切替
# =============================================================================

env-use-develop:
	@if [ ! -f .env.develop ]; then echo "❌ .env.develop がありません"; exit 1; fi
	@if [ -f .env.local ]; then \
		if [ -f .env.local.backup ]; then echo "⚠️  .env.local.backup が既に存在します。上書きします..."; fi; \
		cp .env.local .env.local.backup && echo "↩️  既存 .env.local を .env.local.backup に退避"; \
	fi
	@cp .env.develop .env.local
	@echo "✅ .env.local を develop 用に切り替えました (.env.develop を適用)"

env-restore-local:
	@if [ ! -f .env.local.backup ]; then echo "❌ .env.local.backup がありません"; exit 1; fi
	@cp .env.local.backup .env.local
	@echo "✅ .env.local をバックアップから復元しました"
