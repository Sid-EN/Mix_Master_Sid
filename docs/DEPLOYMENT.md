# 部署

本專案有兩種部署形態，共用同一份程式碼，以建置期的環境變數區分。

| 形態 | 平台 | 功能 | 現況 |
|---|---|---|---|
| **公開展示版** | GitHub Pages | 靜態內容 | ✅ 已設定 |
| **完整版** | Vercel + Render／Zeabur／自架 + Neon | 全部 | ⬜ 待部署 |

---

## 一、公開展示版（GitHub Pages）

### 涵蓋範圍

GitHub Pages 只提供靜態檔案，無法執行 Python、資料庫與伺服器端渲染。
但經典配方、材料與知識庫本就是 repo 內的 JSON，建置時直接讀取即可，
因此展示版仍相當完整：

**可用**：51 道經典配方與 18 種備料的完整詳情、調酒學院 16 個單元、
各項計算器、風味輪、世界地圖、名人堂、測驗、我的酒櫃與收藏
（僅存於該瀏覽器，不跨裝置）。

**停用**（改顯示說明並可導向完整版）：帳號登入、跨裝置同步、
使用者配方、配方分享、社群評分留言、版本歷史、個人化推薦、
資料備份、推播通知、智慧配方引擎。

### 啟用步驟

1. GitHub → Settings → Pages → Source 選擇 **GitHub Actions**
2. 推送至 `main` 即自動部署（`.github/workflows/pages.yml`）
3. 網址為 `https://<帳號>.github.io/<repo>/`

完整版部署後，於 Settings → Secrets and variables → Actions → Variables
新增 `FULL_APP_URL`，展示版即會顯示前往完整版的連結。

### 本機預覽

```bash
cd frontend
NEXT_PUBLIC_BASE_PATH=/Mix_Master_Sid npm run build:static

# 以子路徑模擬 Pages 的目錄結構
mkdir -p /tmp/pages && cp -r out /tmp/pages/Mix_Master_Sid
cd /tmp/pages && python3 -m http.server 6899
# 開啟 http://localhost:6899/Mix_Master_Sid/
```

### 運作方式

- `NEXT_PUBLIC_STATIC_MODE=1` 觸發 `output: 'export'`
- `scripts/prepare-static-data.mjs` 將 `backend/data/*.json` 複製至前端供建置期讀取
- `scripts/toggle-dynamic-routes.mjs` 於匯出時暫時移出 `/shared/[token]` 與
  `/recipes/mine/[slug]`——兩者依賴使用者資料，建置期無從得知有哪些頁面
- 需要伺服器的頁面以包裝元件改顯示 `StaticModeNotice`
  （判斷置於包裝元件而非原元件內，否則在 hooks 之前提前 return 會違反
  React 的 hooks 規則）

---

## 二、完整版（待部署）

### 架構

```
使用者 → Vercel（Next.js 前端）
              ↓ API_BASE_URL
         Render／Zeabur／自架（FastAPI 後端）
              ↓ DATABASE_URL
         Neon／Supabase（PostgreSQL）
```

平台的取捨、免費方案的休眠行為與三種可行組合（接受休眠／後端付費常駐／
自架加 Cloudflare Tunnel），見 [README 的部署章節](../README.md#-部署)。
本文只記錄選定平台後的實際操作步驟。

> 原先寫的是 Railway；它已取消常駐免費方案，故不再列為預設建議。
> 下方步驟對 Render 與 Zeabur 同樣適用（皆為由 GitHub repo 建置）。

### 步驟

**1. 資料庫（Neon）**

建立專案後取得連線字串，格式為
`postgresql://user:pass@host/dbname?sslmode=require`。
需改為 `postgresql+psycopg2://` 開頭以符合 SQLAlchemy。

**2. 後端（Render、Zeabur 或自架）**

- 由 GitHub repo 部署，根目錄設為專案根
- 建置指令：`pip install -r requirements.txt`
- 啟動指令：`python -m alembic upgrade head && python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- 環境變數：

| 變數 | 值 |
|---|---|
| `DATABASE_URL` | Neon 的連線字串 |
| `SECRET_KEY` | `python3 -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ENVIRONMENT` | `production` |
| `ALLOWED_ORIGINS` | `["https://<你的前端網域>"]` |
| `RATE_LIMIT_ENABLED` | `true` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | 見 `backend/.env.example` |

> `ENVIRONMENT=production` 時若 `SECRET_KEY` 仍為預設值，後端會拒絕啟動——
> 以預設密鑰簽發的 JWT 任何人都能偽造。

**3. 前端（Vercel）**

- Root Directory 設為 `frontend`
- 環境變數 `API_BASE_URL` 設為後端網址
- `NEXT_PUBLIC_STATIC_MODE` **不要設定**（否則會建置成靜態版）

**4. 部署後確認**

```bash
curl https://<後端網域>/health
curl https://<後端網域>/api/v1/recipes?limit=1
```

接著於瀏覽器完成一次註冊 → 加入酒櫃 → 另一裝置登入，確認同步正常。
並可一併補驗
[推播通知的實際送達](KNOWN_LIMITATIONS.md#1-推播通知的實際送達)。

### 注意事項

- **CORS**：`ALLOWED_ORIGINS` 須填實際的前端網域。若填 `["*"]`，
  後端會自動關閉 credentials（瀏覽器規範禁止兩者併用）。
- **資料庫遷移**：後端啟動前需執行 `alembic upgrade head`，
  建議寫入啟動指令而非手動執行。
- **免費方案的休眠**：部分平台會在閒置後休眠，首次請求較慢。
