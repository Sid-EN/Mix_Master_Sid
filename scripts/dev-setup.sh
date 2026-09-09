#!/usr/bin/env bash
#
# 一次建立本機開發環境。
#
# 換機器時 git clone 之後跑這一支即可。先前有幾個步驟只存在於記憶裡：
# 資料庫容器是手動 docker run 起來的、測試用的 *_test 資料庫沒有任何文件
# 記載怎麼建立（少了它 pytest 會直接跳過資料庫相關測試）。這支腳本把
# 那些步驟固定下來。
#
# 可重複執行：已完成的步驟會跳過，不會破壞既有資料。
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT=$(pwd)
ENV_FILE=backend/.env

info() { printf '\033[36m▸\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[33m!\033[0m %s\n' "$*"; }
die()  { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

need() { command -v "$1" >/dev/null 2>&1 || die "找不到 $1，請先安裝"; }
need docker
need python3

# ── 1. backend/.env ────────────────────────────────────────
if [[ ! -f $ENV_FILE ]]; then
  info "建立 $ENV_FILE"
  cp backend/.env.example "$ENV_FILE"
  # 開發用密碼隨機產生，不要讓所有機器共用同一組
  PW=$(python3 -c "import secrets; print(secrets.token_urlsafe(24))")
  python3 - "$ENV_FILE" "$PW" <<'PY'
import sys, re, pathlib
path, pw = sys.argv[1], sys.argv[2]
p = pathlib.Path(path)
s = p.read_text(encoding='utf-8')
s = re.sub(r'(DATABASE_URL=postgresql\+psycopg2://[^:]+:)[^@]*', r'\g<1>' + pw, s)
p.write_text(s, encoding='utf-8')
PY
  ok "已產生隨機的開發資料庫密碼"
  warn "推播與寄信相關的金鑰仍為空值，需要時再補（見 backend/.env.example）"
else
  ok "$ENV_FILE 已存在，沿用現有設定"
fi

# ── 2. 由 DATABASE_URL 推導連線參數 ─────────────────────────
# 帳密只寫在 backend/.env 一處；compose 從這裡取值，避免兩邊對不上。
eval "$(python3 - "$ENV_FILE" <<'PY'
import pathlib, re, shlex, sys
from urllib.parse import urlsplit, unquote
text = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8')
m = re.search(r'^\s*DATABASE_URL\s*=\s*(.+?)\s*$', text, re.M)
if not m:
    sys.exit('backend/.env 缺少 DATABASE_URL')
url = m.group(1).strip().strip('"').strip("'")
# 去掉 SQLAlchemy 的驅動後綴，urlsplit 才解析得動
parts = urlsplit(re.sub(r'^postgresql\+\w+', 'postgresql', url))
db = (parts.path or '/').lstrip('/')
out = {
    'POSTGRES_USER': unquote(parts.username or 'mixmaster'),
    'POSTGRES_PASSWORD': unquote(parts.password or ''),
    'POSTGRES_DB': db or 'mixmaster',
    'POSTGRES_PORT': str(parts.port or 5432),
}
if not out['POSTGRES_PASSWORD']:
    sys.exit('DATABASE_URL 未包含密碼')
for k, v in out.items():
    print(f'export {k}={shlex.quote(v)}')
PY
)"
ok "資料庫 ${POSTGRES_USER}@127.0.0.1:${POSTGRES_PORT}/${POSTGRES_DB}"

# ── 3. 啟動資料庫 ───────────────────────────────────────────
info "啟動資料庫容器"
docker compose up -d db

info "等待資料庫就緒"
for _ in $(seq 1 60); do
  status=$(docker inspect --format '{{.State.Health.Status}}' mixmaster-db 2>/dev/null || echo unknown)
  [[ $status == healthy ]] && break
  sleep 1
done
[[ ${status:-} == healthy ]] || die "資料庫未在時限內就緒，請看 docker compose logs db"
ok "資料庫已就緒"

# 既有磁碟區是用另一組密碼初始化的話，這裡就會失敗——講清楚而不是留下謎團
if ! docker exec mixmaster-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; then
  die "無法以 backend/.env 的帳密連線。
     磁碟區 mixmaster-pgdata 可能是用另一組密碼初始化的（密碼只在初始化時生效）。
     請改回原本的密碼，或在確認不需要本機資料後執行：
       docker compose down && docker volume rm mixmaster-pgdata && $0"
fi

# ── 4. 測試資料庫 ───────────────────────────────────────────
# tests/conftest.py 會把開發資料庫名稱換成 *_test；沒有這個庫，
# 資料庫相關的測試會被整批跳過而不是失敗，很容易誤以為都通過了。
TEST_DB="${POSTGRES_DB}_test"
if docker exec mixmaster-db psql -U "$POSTGRES_USER" -lqt | cut -d'|' -f1 | grep -qw "$TEST_DB"; then
  ok "測試資料庫 $TEST_DB 已存在"
else
  info "建立測試資料庫 $TEST_DB"
  docker exec mixmaster-db createdb -U "$POSTGRES_USER" "$TEST_DB"
  ok "已建立 $TEST_DB"
fi

# ── 5. Python 環境 ──────────────────────────────────────────
if [[ ! -x .venv/bin/python ]]; then
  info "建立 Python 虛擬環境"
  python3 -m venv .venv
fi
info "安裝 Python 相依"
.venv/bin/python -m pip install -q --upgrade pip
.venv/bin/python -m pip install -q -r requirements.txt -r requirements-dev.txt
ok "Python 相依完成"

info "套用資料庫遷移"
.venv/bin/python -m alembic upgrade head
ok "資料庫結構已是最新"

# ── 6. 前端 ────────────────────────────────────────────────
need node
info "安裝前端相依"
npm --prefix frontend ci
# 產生靜態資料與搜尋索引（frontend/data 與 public/*.json 不納入版控）
info "產生前端資料檔"
npm --prefix frontend run prepare:data
ok "前端相依與資料檔完成"

if [[ -f package.json ]]; then
  info "安裝端對端測試工具"
  npm ci
  npx playwright install chromium >/dev/null
  ok "Playwright 與 chromium 完成"
fi

cat <<EOF

$(ok "開發環境就緒")

啟動：
  .venv/bin/python -m uvicorn backend.main:app --reload --port 8000
  npm --prefix frontend run dev

測試：
  .venv/bin/python -m pytest
  npm --prefix frontend test
  RATE_LIMIT_ENABLED=false 啟動後端後再跑 npx playwright test

EOF
