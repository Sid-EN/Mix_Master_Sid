#!/bin/bash
# ============================================================
# MixMaster 一鍵啟動腳本
# ============================================================
set -e

PROJECT_DIR="/home/eng/Sid/Mix_Master"
cd "$PROJECT_DIR"

echo ""
echo "🍹 MixMaster 啟動中..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. 啟動後端 (FastAPI) ──────────────────────────────────
echo "[1/2] 啟動後端 API (port 8000)..."
source .venv/bin/activate

# 本機開發關閉限流，避免瀏覽與 E2E 測試被擋
export RATE_LIMIT_ENABLED=false

# 釋放 port 8000（若被佔用）
PIDS=$(ss -tlnp | grep ':8000' | grep -oP 'pid=\K[0-9]+' | sort -u)
if [ -n "$PIDS" ]; then
  for pid in $PIDS; do
    kill "$pid" 2>/dev/null && echo "  已釋放 port 8000 (PID $pid)"
  done
  sleep 1
fi

nohup "$PROJECT_DIR/.venv/bin/python3" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 \
  > /tmp/mixmaster-api.log 2>&1 &
API_PID=$!
echo "  後端 PID: $API_PID"

# ── 2. 等待後端就緒 ────────────────────────────────────────
echo "  等待後端就緒..."
for i in $(seq 1 15); do
  if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    echo "  ✅ 後端已就緒"
    break
  fi
  sleep 1
done

# ── 3. 啟動前端 (Next.js) ─────────────────────────────────
echo "[2/2] 啟動前端 (port 6880)..."

# 釋放 port 6880（若被佔用）
PIDS=$(ss -tlnp | grep ':6880' | grep -oP 'pid=\K[0-9]+' | sort -u)
if [ -n "$PIDS" ]; then
  for pid in $PIDS; do
    kill "$pid" 2>/dev/null && echo "  已釋放 port 6880 (PID $pid)"
  done
  sleep 1
fi

cd "$PROJECT_DIR/frontend"
nohup npx next dev -H 0.0.0.0 -p 6880 > /tmp/mixmaster-frontend.log 2>&1 &
FRONT_PID=$!
echo "  前端 PID: $FRONT_PID"

# ── 4. 等待前端就緒 ────────────────────────────────────────
echo "  等待前端就緒..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:6880 > /dev/null 2>&1; then
    echo "  ✅ 前端已就緒"
    break
  fi
  sleep 1
done

# ── 5. 完成 ───────────────────────────────────────────────
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍹 MixMaster 啟動完成！"
echo ""
echo "  🏠 首頁           http://localhost:6880"
echo "  🧪 智慧配方引擎   http://localhost:6880/engine"
echo "  🎓 調酒學院       http://localhost:6880/academy"
echo "  📚 配方庫         http://localhost:6880/recipes"
echo "  📖 API 文件       http://localhost:6880/docs"
if [ -n "$HOST_IP" ]; then
echo ""
echo "  📡 區域網路存取   http://${HOST_IP}:6880"
fi
echo ""
echo "  停止服務：bash stop.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
