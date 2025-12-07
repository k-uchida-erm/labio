#!/usr/bin/env bash
# Notionにマイグレーション情報を記録するスクリプト

# 環境変数の読み込み
# set -a: すべての変数を自動的にエクスポート
# set +a: 自動エクスポートを無効化
if [ -f .env.local ]; then
  set -a
  # コメント行と空行を除外して読み込み（一時ファイルを使用）
  TEMP_ENV=$(mktemp) || exit 1
  grep -v '^#' .env.local | grep -v '^$' > "$TEMP_ENV"
  source "$TEMP_ENV"
  rm -f "$TEMP_ENV"
  set +a
fi

# 必須環境変数のチェック
if [ -z "$NOTION_API_TOKEN" ]; then
  echo "⚠️ 警告: NOTION_API_TOKENが設定されていません。Notionへの記録をスキップします。"
  exit 0
fi

NOTION_DATABASE_ID="2c0b7adc-d6a4-806a-87ae-c450d3ea60b3"

# 直前のコミットで追加されたマイグレーションファイルを取得
STAGED_MIGRATIONS=$(git diff-tree --no-commit-id --name-only --diff-filter=A -r HEAD | grep -E "^supabase/migrations/.*\.sql$" || true)

if [ -z "$STAGED_MIGRATIONS" ]; then
  exit 0
fi

# ブランチ名とコミット情報を取得
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_SHA=$(git rev-parse HEAD)
AUTHOR=$(git log -1 --format='%an' HEAD || git config user.name || echo "unknown")
NOW_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 各マイグレーションファイルを処理
echo "$STAGED_MIGRATIONS" | while IFS= read -r migration_file; do
  [ -z "$migration_file" ] && continue
  
  filename=$(basename "$migration_file" .sql)
  timestamp=$(echo "$filename" | cut -d'_' -f1)
  name=$(echo "$filename" | cut -d'_' -f2-)
  
  # Migration timestampをパース（YYYYMMDDHHMMSS形式）
  if [ ${#timestamp} -eq 14 ]; then
    migration_date="${timestamp:0:4}-${timestamp:4:2}-${timestamp:6:2}T${timestamp:8:2}:${timestamp:10:2}:${timestamp:12:2}Z"
  else
    migration_date="$NOW_ISO"
  fi
  
  # マイグレーションファイルの内容を解析して日本語要約を生成
  summary=""
  if [ -f "$migration_file" ]; then
    # CREATE TABLEを検出
    create_tables=$(grep -iE "^\s*create\s+table" "$migration_file" | sed -E 's/.*"public"\."([^"]+)".*/\1/' | sort -u | tr '\n' ',' | sed 's/,$//')
    if [ -n "$create_tables" ]; then
      summary+=$'📊 **テーブル作成**: '"${create_tables}"$'\n\n'
    fi
    
    # ALTER TABLEを検出（テーブル名と操作を抽出）
    alter_info=""
    while IFS= read -r alter_line; do
      [ -z "$alter_line" ] && continue
      
      # テーブル名を抽出（"public"."table" または public.table の形式に対応）
      table=""
      if echo "$alter_line" | grep -qE '"public"\."([^"]+)"'; then
        table=$(echo "$alter_line" | sed -E 's/.*"public"\."([^"]+)".*/\1/')
      elif echo "$alter_line" | grep -qE 'public\.([a-zA-Z_][a-zA-Z0-9_]*)'; then
        table=$(echo "$alter_line" | sed -E 's/.*public\.([a-zA-Z_][a-zA-Z0-9_]*).*/\1/')
      fi
      
      if [ -z "$table" ]; then
        continue
      fi
      
      # DROP COLUMN
      if echo "$alter_line" | grep -qiE "drop\s+column"; then
        # DROP COLUMN IF EXISTS column_name または DROP COLUMN column_name からカラム名を抽出
        if echo "$alter_line" | grep -qiE "drop\s+column\s+if\s+exists"; then
          # DROP COLUMN IF EXISTS column_name パターン（最後の単語を取得）
          match=$(echo "$alter_line" | grep -oiE "drop\s+column\s+if\s+exists\s+[a-zA-Z_][a-zA-Z0-9_]*")
          column=$(echo "$match" | awk '{print $NF}' | sed 's/[;,]//')
        else
          # DROP COLUMN column_name パターン（最後の単語を取得）
          match=$(echo "$alter_line" | grep -oiE "drop\s+column\s+[a-zA-Z_][a-zA-Z0-9_]*")
          column=$(echo "$match" | awk '{print $NF}' | sed 's/[;,]//')
        fi
        if [ -n "$column" ] && [ "$column" != "if" ] && [ "$column" != "exists" ] && [ "$column" != "column" ] && echo "$column" | grep -qE '^[a-zA-Z_][a-zA-Z0-9_]*$'; then
          alter_info="${alter_info}${table}.${column}削除, "
        fi
      # ADD COLUMN
      elif echo "$alter_line" | grep -qiE "add\s+column"; then
        # ADD COLUMN IF NOT EXISTS column_name または ADD COLUMN column_name からカラム名を抽出
        column=$(echo "$alter_line" | sed -E 's/.*add\s+column\s+(if\s+not\s+exists\s+)?//i' | sed -E 's/[;\s(,].*$//' | sed -E 's/^["\s]*//' | sed -E 's/["\s]*$//' | awk '{print $1}')
        if [ -n "$column" ] && [ "$column" != "if" ] && [ "$column" != "not" ] && [ "$column" != "exists" ] && echo "$column" | grep -qE '^[a-zA-Z_][a-zA-Z0-9_]*$'; then
          alter_info="${alter_info}${table}.${column}追加, "
        fi
      # RENAME COLUMN
      elif echo "$alter_line" | grep -qiE "rename\s+column"; then
        old_col=$(echo "$alter_line" | sed -E 's/.*rename\s+column\s+["\s]*([a-zA-Z_][a-zA-Z0-9_]*)["\s]*.*/\1/i' | tr -d ' ')
        new_col=$(echo "$alter_line" | sed -E 's/.*to\s+["\s]*([a-zA-Z_][a-zA-Z0-9_]*)["\s]*.*/\1/i' | tr -d ' ')
        if [ -n "$old_col" ] && [ -n "$new_col" ]; then
          alter_info="${alter_info}${table}.${old_col}→${new_col}リネーム, "
        fi
      # その他のALTER TABLE
      else
        alter_info="${alter_info}${table}変更, "
      fi
    done <<< "$(grep -iE "^\s*alter\s+table" "$migration_file")"
    
    if [ -n "$alter_info" ]; then
      alter_info=$(echo "$alter_info" | sed 's/, $//')
      summary+=$'🔧 **テーブル変更**: '"${alter_info}"$'\n\n'
    fi
    
    # CREATE INDEXを検出
    index_count=$(grep -iE "^\s*create\s+(unique\s+)?index" "$migration_file" | wc -l | tr -d ' ')
    create_indexes=$(grep -iE "^\s*create\s+(unique\s+)?index" "$migration_file" | sed -E 's/.*create\s+(unique\s+)?index\s+"?([^"\s(]+)"?.*/\2/i' | sort -u | head -10 | tr '\n' ',' | sed 's/,$//')
    if [ -n "$create_indexes" ] && [ "$create_indexes" != "create" ] && [ "$create_indexes" != "index" ] && [ "$create_indexes" != "unique" ]; then
      if [ "$index_count" -gt 10 ]; then
        summary+=$'📇 **インデックス作成**: '"${create_indexes}... (他$((index_count - 10))件)"$'\n\n'
      else
        summary+=$'📇 **インデックス作成**: '"${create_indexes}"$'\n\n'
      fi
    fi
    
    # CREATE FUNCTIONを検出
    create_functions=$(grep -iE "^\s*create\s+(or\s+replace\s+)?function" "$migration_file" | sed -E 's/.*"public"\."([^"]+)".*/\1/' | sort -u | tr '\n' ',' | sed 's/,$//')
    if [ -n "$create_functions" ]; then
      summary+=$'⚙️ **関数作成**: '"${create_functions}"$'\n\n'
    fi
    
    # CREATE TRIGGERを検出
    create_triggers=$(grep -iE "^\s*create\s+trigger" "$migration_file" | sed -E 's/.*create\s+trigger\s+"?([^"\s.]+)"?.*/\1/i' | sort -u | tr '\n' ',' | sed 's/,$//')
    if [ -n "$create_triggers" ] && [ "$create_triggers" != "create" ] && [ "$create_triggers" != "trigger" ]; then
      summary+=$'🎯 **トリガー作成**: '"${create_triggers}"$'\n\n'
    fi
    
    # DROPを検出
    drop_items=$(grep -iE "^\s*drop\s+(table|index|function|trigger)" "$migration_file" | sed -E 's/.*"public"\."([^"]+)".*/\1/' | sort -u | tr '\n' ',' | sed 's/,$//')
    if [ -n "$drop_items" ]; then
      summary+=$'🗑️ **削除**: '"${drop_items}"$'\n\n'
    fi
    
    # 要約が空の場合はデフォルトメッセージ
    if [ -z "$summary" ]; then
      summary="📝 マイグレーションファイルが追加されました。\n"
    fi
    
    # SQLの内容を読み込む（後でコードブロックとして追加）
    sql_content=""
    if [ -f "$migration_file" ]; then
      sql_content=$(cat "$migration_file")
    fi
  else
    summary="📝 マイグレーションファイルが追加されました。\n"
    sql_content=""
    if [ -f "$migration_file" ]; then
      sql_content=$(cat "$migration_file")
    fi
  fi
  
  # childrenブロックを構築（\n\nで分割して各段落を別のparagraphブロックにし、Markdown記法を変換）
  if [ -n "$summary" ]; then
    # 一時ファイルを使って段落を分割
    temp_file=$(mktemp)
    printf "%s" "$summary" | awk 'BEGIN{RS="\n\n"} {if (NF > 0) print}' > "$temp_file"
    
    children_blocks=""
    while IFS= read -r paragraph || [ -n "$paragraph" ]; do
      [ -z "$paragraph" ] && continue
      # 段落内の\nを削除して単一行に
      paragraph_clean=$(echo "$paragraph" | tr -d '\n' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
      [ -z "$paragraph_clean" ] && continue
      
      # Markdown記法（**text**）をNotion APIのrich_text形式に変換
      # シンプルな実装：**text**を太字として処理
      rich_text_array=""
      remaining="$paragraph_clean"
      
      # **text**パターンを検出して処理
      while echo "$remaining" | grep -qE '\*\*[^*]+\*\*'; do
        # **text**の前の部分（最初の **...** より前をすべて取得）
        before=$(echo "$remaining" | sed -E 's/\*\*[^*]+\*\*.*//')
        if [ -n "$before" ]; then
          before_escaped=$(printf "%s" "$before" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
          if [ -z "$rich_text_array" ]; then
            rich_text_array="{\"type\":\"text\",\"text\":{\"content\":\"$before_escaped\"}}"
          else
            rich_text_array="$rich_text_array,{\"type\":\"text\",\"text\":{\"content\":\"$before_escaped\"}}"
          fi
        fi
        
        # **text**の部分（太字）
        bold_text=$(echo "$remaining" | sed -E 's/.*\*\*([^*]+)\*\*.*/\1/')
        if [ -n "$bold_text" ] && [ "$bold_text" != "$remaining" ]; then
          bold_escaped=$(printf "%s" "$bold_text" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
          if [ -z "$rich_text_array" ]; then
            rich_text_array="{\"type\":\"text\",\"text\":{\"content\":\"$bold_escaped\"},\"annotations\":{\"bold\":true}}"
          else
            rich_text_array="$rich_text_array,{\"type\":\"text\",\"text\":{\"content\":\"$bold_escaped\"},\"annotations\":{\"bold\":true}}"
          fi
        fi
        
        # 残りの部分
        remaining=$(echo "$remaining" | sed -E 's/.*\*\*[^*]+\*\*//')
      done
      
      # 残りのテキストを追加
      if [ -n "$remaining" ]; then
        remaining_escaped=$(printf "%s" "$remaining" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
        if [ -z "$rich_text_array" ]; then
          rich_text_array="{\"type\":\"text\",\"text\":{\"content\":\"$remaining_escaped\"}}"
        else
          rich_text_array="$rich_text_array,{\"type\":\"text\",\"text\":{\"content\":\"$remaining_escaped\"}}"
        fi
      fi
      
      # rich_text_arrayが空の場合は、そのまま追加
      if [ -z "$rich_text_array" ]; then
        paragraph_escaped=$(printf "%s" "$paragraph_clean" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
        rich_text_array="{\"type\":\"text\",\"text\":{\"content\":\"$paragraph_escaped\"}}"
      fi
      
      # paragraphブロックを作成
      if [ -z "$children_blocks" ]; then
        children_blocks="{\"object\":\"block\",\"type\":\"paragraph\",\"paragraph\":{\"rich_text\":[$rich_text_array]}}"
      else
        children_blocks="$children_blocks,{\"object\":\"block\",\"type\":\"paragraph\",\"paragraph\":{\"rich_text\":[$rich_text_array]}}"
      fi
    done < "$temp_file"
    
    rm -f "$temp_file"
    
    # SQLの内容をcodeブロックとして追加（要約の後に追加）
    if [ -n "$sql_content" ]; then
      # SQLの内容をエスケープ（JSON用）
      # 改行を\nに変換し、バックスラッシュとダブルクォートをエスケープ
      sql_escaped=$(printf "%s" "$sql_content" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')
      
      # codeブロックを作成（language: sqlを指定）
      if [ -z "$children_blocks" ]; then
        children_blocks="{\"object\":\"block\",\"type\":\"code\",\"code\":{\"rich_text\":[{\"type\":\"text\",\"text\":{\"content\":\"$sql_escaped\"}}],\"language\":\"sql\"}}"
      else
        children_blocks="$children_blocks,{\"object\":\"block\",\"type\":\"code\",\"code\":{\"rich_text\":[{\"type\":\"text\",\"text\":{\"content\":\"$sql_escaped\"}}],\"language\":\"sql\"}}"
      fi
    fi
    
  if [ -n "$children_blocks" ]; then
    children_block=",\"children\":[$children_blocks]"
  else
    children_block=""
  fi
  else
    children_block=""
  fi
  
  # JSON特殊文字をエスケープ
  name_escaped=$(printf "%s" "$name" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  branch_escaped=$(printf "%s" "$BRANCH" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  sha_escaped=$(printf "%s" "$COMMIT_SHA" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  author_escaped=$(printf "%s" "$AUTHOR" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  
  # Notion APIを呼び出し
  response=$(curl -s -w "\n%{http_code}" -X POST https://api.notion.com/v1/pages \
    -H "Authorization: Bearer $NOTION_API_TOKEN" \
    -H "Content-Type: application/json" \
    -H "Notion-Version: 2022-06-28" \
    -d "{
      \"parent\": {
        \"type\": \"database_id\",
        \"database_id\": \"$NOTION_DATABASE_ID\"
      },
      \"properties\": {
        \"Migration File\": {
          \"title\": [
            { \"text\": { \"content\": \"$name_escaped\" } }
          ]
        },
        \"Timestamp\": {
          \"date\": { \"start\": \"$migration_date\" }
        },
        \"Branch\": {
          \"rich_text\": [
            { \"text\": { \"content\": \"$branch_escaped\" } }
          ]
        },
        \"Commit SHA\": {
          \"rich_text\": [
            { \"text\": { \"content\": \"$sha_escaped\" } }
          ]
        },
        \"Author\": {
          \"rich_text\": [
            { \"text\": { \"content\": \"$author_escaped\" } }
          ]
        }
      }${children_block}
    }")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✅ Notionに記録しました: $name"
  else
    echo "⚠️ Notionへの記録に失敗しました: $name (HTTP $http_code)"
    echo "$body" | head -5
  fi
done

