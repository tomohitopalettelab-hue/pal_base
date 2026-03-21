#!/bin/bash
# Pal Base のプランを pal_db に登録するスクリプト
# 使い方: bash scripts/seed-plans.sh [PAL_DB_URL]
# 例:     bash scripts/seed-plans.sh http://localhost:3100

PAL_DB_URL="${1:-http://localhost:3100}"

echo "=== Pal Base プラン登録 ==="
echo "pal_db URL: $PAL_DB_URL"
echo ""

# pal_base_lite プラン
echo "1. pal_base_lite を登録中..."
curl -s -X POST "$PAL_DB_URL/api/plans" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "pal_base_lite",
    "name": "Pal Base Lite",
    "billingCycle": "monthly",
    "defaultPriceYen": 5000,
    "description": "Pal Base ライトプラン - クーポンジェネレーター、バナー自動キャンバス",
    "isActive": true
  }' | python3 -m json.tool 2>/dev/null || echo "(レスポンス表示にpython3が必要)"

echo ""

# pal_base_standard プラン
echo "2. pal_base_standard を登録中..."
curl -s -X POST "$PAL_DB_URL/api/plans" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "pal_base_standard",
    "name": "Pal Base Standard",
    "billingCycle": "monthly",
    "defaultPriceYen": 10000,
    "description": "Pal Base スタンダードプラン - 全機能利用可能（クーポン、バナー、リッチメニュー、GBPプロフィール）",
    "isActive": true
  }' | python3 -m json.tool 2>/dev/null || echo "(レスポンス表示にpython3が必要)"

echo ""
echo "=== 完了 ==="
