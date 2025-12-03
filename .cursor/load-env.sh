#!/bin/bash
# .env.localから環境変数を読み込む
if [ -f "$(dirname "$0")/../.env.local" ]; then
  export $(grep -E '^(SUPABASE_ACCESS_TOKEN|FIGMA_ACCESS_TOKEN)=' "$(dirname "$0")/../.env.local" | xargs)
fi
# 元のコマンドを実行
exec "$@"
