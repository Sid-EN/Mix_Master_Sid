#!/bin/bash
echo "🛑 停止 MixMaster..."

for port in 8000 3000; do
  PIDS=$(ss -tlnp | grep ":$port" | grep -oP 'pid=\K[0-9]+' | sort -u)
  if [ -n "$PIDS" ]; then
    for pid in $PIDS; do
      kill "$pid" 2>/dev/null && echo "  已停止 port $port (PID $pid)"
    done
  fi
done

echo "✅ 所有服務已停止"
