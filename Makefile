.PHONY: help up down build rebuild logs shell clean install lint format test typecheck lint-fix format-check test-e2e db-types setup-hooks supabase-start supabase-stop supabase-reset supabase-migrate supabase-check-dev supabase-pull-dev dev-prepare env-use-develop env-restore-local
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
	@echo "  make supabase-reset     - ローカルのマイグレーションファイルのみでローカルDBを再構築"
	@echo "  make supabase-migrate   - 新しいマイグレーションファイルのみをローカルDBに適用（既存データは保持）"
	@echo "  make supabase-check-dev - labio-devに適用されているマイグレーション履歴を確認"
	@echo "  make supabase-pull-dev  - リモート（labio-dev）からスキーマを取得してマイグレーションファイルを更新"
	@echo "  make dev-prepare        - 開発前の準備（git pull + マイグレーション履歴確認）"
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

# E2Eテストを実行
test-e2e:
	docker compose run --rm app npm run test:e2e

# 型チェックを実行
typecheck:
	docker compose run --rm app npm run typecheck

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

# ローカルのマイグレーションファイルのみでローカルDBを再構築
# マイグレーションファイル管理の運用では、git pullで最新のマイグレーションファイルを取得してから実行
supabase-reset: supabase-start
	@echo "🔄 ローカルDBをローカルのマイグレーションファイルで再構築中..."
	npx supabase db reset
	@echo "✅ ローカルDBをリセットしました（ローカルのマイグレーションファイルを適用）"

# 新しいマイグレーションファイルのみをローカルDBに適用（既存データは保持）
# 注意: ローカルSupabaseは起動している必要があります
# 未適用のマイグレーションのみを適用します（既存データは保持されます）
supabase-migrate: supabase-start
	@echo "🔄 新しいマイグレーションをローカルDBに適用中..."
	npx supabase migration up
	@echo "✅ マイグレーションを適用しました（既存データは保持されています）"

# labio-devに適用されているマイグレーション履歴を確認
# 環境変数: SUPABASE_ACCESS_TOKEN が必要（.env.localから自動読み込み）
supabase-check-dev:
	@echo "🔍 labio-devに適用されているマイグレーション履歴を確認中..."
	@bash .cursor/load-env.sh sh -c 'npx supabase link --project-ref ucsurbtmhabygssexisq' 2>&1 | grep -v "Remote migration versions not found" || true
	@echo ""
	@echo "📋 リモート（labio-dev）のマイグレーション履歴:"
	@bash .cursor/load-env.sh sh -c 'npx supabase migration list' || echo "⚠️  履歴取得に失敗しました"
	@echo ""
	@echo "📋 ローカルのマイグレーションファイル:"
	@ls -1 supabase/migrations/ 2>/dev/null | sort || echo "⚠️  マイグレーションファイルが見つかりません"

# リモート（labio-dev）の状態をローカルDBに直接適用（マイグレーションファイルの履歴には残さない）
# 開発環境で雑なマイグレーションファイルを作ったり、DBを直接いじった後、リモートの状態に戻す用
# 環境変数: SUPABASE_ACCESS_TOKEN が必要（.env.localから自動読み込み）
supabase-pull-dev: supabase-start
	@echo "🔄 リモート（labio-dev）にリンク中..."
	@bash .cursor/load-env.sh sh -c 'npx supabase link --project-ref ucsurbtmhabygssexisq' 2>&1 | grep -v "Remote migration versions not found" || true
	@echo ""
	@echo "🔄 リモート（labio-dev）からスキーマを取得中（一時的なマイグレーションファイルを作成）..."
	@TEMP_MIGRATION=$$(mktemp -d) && \
	cp -r supabase/migrations $$TEMP_MIGRATION/ && \
	bash .cursor/load-env.sh sh -c "cd $$TEMP_MIGRATION && npx supabase db pull" && \
	echo "" && \
	echo "🔄 ローカルDBをリセット中..." && \
	npx supabase db reset > /dev/null 2>&1 || true && \
	echo "" && \
	echo "🔄 リモートのスキーマをローカルDBに適用中..." && \
	LATEST_MIGRATION=$$(ls -t $$TEMP_MIGRATION/migrations/*.sql 2>/dev/null | head -1) && \
	if [ -n "$$LATEST_MIGRATION" ]; then \
		PGPASSWORD=postgres psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f $$LATEST_MIGRATION > /dev/null 2>&1; \
	fi && \
	rm -rf $$TEMP_MIGRATION && \
	echo "" && \
	echo "✅ リモートの状態をローカルDBに適用しました" && \
	echo "   注意: マイグレーションファイルの履歴には残りません（開発環境用）" || \
	(rm -rf $$TEMP_MIGRATION && echo "⚠️  スキーマ適用に失敗しました")

# 開発前の準備（git pull + マイグレーション履歴確認）
# マイグレーションファイル管理の運用では、git pullで十分だが、念のため履歴を確認
dev-prepare:
	@echo "🔄 最新のコードを取得中..."
	@git pull || echo "⚠️  git pullに失敗しました"
	@echo ""
	@echo "🔍 マイグレーション履歴を確認中..."
	@$(MAKE) supabase-check-dev || echo "⚠️  マイグレーション履歴の確認に失敗しました（環境変数が設定されていない可能性があります）"
	@echo ""
	@echo "✅ 開発準備が完了しました"
	@echo "   ローカルDBを最新状態にするには: make supabase-reset"

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
