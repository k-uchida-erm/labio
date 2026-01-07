.PHONY: help up down build rebuild logs shell clean install dev lint format test typecheck lint-fix format-check test-e2e db-types setup-hooks supabase-start supabase-stop supabase-sync supabase-reset supabase-exec-sql supabase-seed-test-data env-use-develop env-restore-local
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
	@echo "  make storybook - Storybook を Docker で起動 (http://localhost:6006)"
	@echo "  make down-story - Storybook 用に占有している 6006 番ポートのコンテナを停止"
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
	@echo "  make supabase-start    - ローカルSupabaseを起動"
	@echo "  make supabase-stop     - ローカルSupabaseを停止"
	@echo "  make supabase-sync     - リモート（labio-dev）から最新マイグレーションを取得してローカルDBを再構築"
	@echo "  make supabase-reset    - ローカルのマイグレーションファイルのみでローカルDBを再構築（リモート同期なし）"
	@echo "  make supabase-exec-sql FILE=path/to/file.sql - 任意のSQLファイルを実行"
	@echo "  make supabase-seed-test-data - テストデータを作成（scripts/create-test-data.sqlを実行）"
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

# Storybook を起動（Docker内）
# STORYBOOK_PORT でホスト側ポートを変更可能（デフォルト 6006）
STORYBOOK_PORT ?= 6006
storybook:
	docker compose run --rm -p $(STORYBOOK_PORT):6006 app sh -c "npm ci --legacy-peer-deps && npm run storybook -- --host 0.0.0.0 --port 6006"
	@echo ""
	@echo "✅ Storybook を起動しました: http://localhost:$(STORYBOOK_PORT)"

# Storybook 用に 6006 を占有しているコンテナを停止
down-story:
	@echo "Stopping containers using port 6006 (storybook)..."
	@IDS=$$(docker ps --filter "publish=6006" --format "{{.ID}}"); \
	if [ -z "$$IDS" ]; then \
		echo "No containers are using port 6006"; \
	else \
		docker stop $$IDS; \
		echo "Stopped: $$IDS"; \
	fi

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

# 任意のSQLファイルを実行
# 使用方法: make supabase-exec-sql FILE=path/to/file.sql
# 例: make supabase-exec-sql FILE=scripts/create-test-data.sql
supabase-exec-sql: supabase-start
	@if [ -z "$(FILE)" ]; then \
		echo "❌ FILEパラメータが指定されていません"; \
		echo "   使用方法: make supabase-exec-sql FILE=path/to/file.sql"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "❌ SQLファイルが見つかりません: $(FILE)"; \
		exit 1; \
	fi
	@echo "📝 SQLファイルを実行中: $(FILE)"
	@CONTAINER=$$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -1); \
	if [ -z "$$CONTAINER" ]; then \
		echo "⚠️  SupabaseのDockerコンテナが見つかりません。Supabase Studio (http://127.0.0.1:54323) のSQL Editorで $(FILE) を実行してください。"; \
		exit 1; \
	fi; \
	docker exec -i $$CONTAINER psql -U postgres -d postgres < "$(FILE)"
	@echo "✅ SQLファイルの実行が完了しました: $(FILE)"

# テストデータを作成（scripts/create-test-data.sqlを実行）
# supabase-exec-sqlのショートカット
supabase-seed-test-data: supabase-start
	@$(MAKE) supabase-exec-sql FILE=scripts/create-test-data.sql
	@echo "✅ テストデータの作成が完了しました"
	@echo "   Lab slug: ai-lab-a3f2"
	@echo "   Project key: PINN"
	@echo "   URL: http://localhost:3000/ai-lab-a3f2/PINN"

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
