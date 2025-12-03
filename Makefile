.PHONY: help up down build logs shell clean install dev lint format test typecheck

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
