<div align="center">

```
███╗   ███╗██╗██╗  ██╗███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗
████╗ ████║██║╚██╗██╔╝████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
██╔████╔██║██║ ╚███╔╝ ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝
██║╚██╔╝██║██║ ██╔██╗ ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗
██║ ╚═╝ ██║██║██╔╝ ██╗██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║
╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
```

**智慧調酒平台 | AI-Powered Mixology Platform**

*「從認識一瓶酒，到掌握一杯酒的藝術」*

[![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-amber?style=flat-square)](LICENSE)

</div>

---

## 📋 目錄 (Table of Contents)

- [專案簡介 (Introduction)](#-專案簡介-introduction)
- [功能總覽 (Feature Overview)](#-功能總覽-feature-overview)
- [系統架構 (System Architecture)](#-系統架構-system-architecture)
- [快速開始 (Quick Start)](#-快速開始-quick-start)
- [開發環境建置 (Development Setup)](#-開發環境建置-development-setup)
- [虛擬環境管理 (Virtual Environment)](#-虛擬環境管理-virtual-environment)
- [測試 (Testing)](#-測試-testing)
- [API 文件摘要 (API Reference)](#-api-文件摘要-api-reference)
- [目錄結構 (Directory Structure)](#-目錄結構-directory-structure)
- [資料與指標 (Data & Metrics)](#-資料與指標-data--metrics)
- [設計規範 (Design System)](#-設計規範-design-system)
- [操作指南 (Operation Guide)](#-操作指南-operation-guide)
- [FAQ](#-faq)
- [開發歷程與路線圖 (History & Roadmap)](#-開發歷程與路線圖-history--roadmap)
- [貢獻指南 (Contributing)](#-貢獻指南-contributing)
- [授權 (License)](#-授權-license)

---

## 🍹 專案簡介 (Introduction)

**MixMaster** 是一個結合「教育導向」與「智慧配方生成」的全端調酒 Web 平台，
以 **Python FastAPI** 驅動後端運算引擎、**Next.js 14** 構建互動前端，
提供從材料管理、風味分析、配方推薦到完整調酒知識體系的一站式體驗。

核心理念：**每一瓶家中的酒，都有潛力成為一杯令人難忘的作品。**

### 四大支柱

| 支柱 | 說明 | 亮點數據 |
|---|---|---|
| 🧪 **智慧風味引擎** | Sigmoid 化學平衡模型 × 15 維風味向量 × 餘弦相似度 | 117 種材料、即時生成 |
| 📚 **配方資料庫** | 51 款經典雞尾酒 + 18 款備料配方 + 無限 AI 生成 | 7 維度進階篩選 |
| 🎓 **調酒學院** | 10 大知識模組：葡萄酒、烈酒、技法、器材、品飲… | 8+ 子百科頁面 |
| 🛠️ **實用工具箱** | ABV 計算器、成本分析、單位換算、批次換算 | 即時運算 + 圖表 |

### 階段狀態

| 階段 | 狀態 | 說明 |
|---|---|---|
| Phase 1.0 — 核心 MVP | ✅ 完成 | 風味引擎、配方庫、備料工坊、學院基礎 |
| Phase 1.5 — 功能擴充 | ✅ 完成 | 酒櫃、收藏、比較器、等級系統、測驗、PWA |
| Phase 2.0 — 用戶系統 | 🔜 規劃中 | PostgreSQL + JWT 認證、社群功能 |

---

## ✨ 功能總覽 (Feature Overview)

### 前端頁面一覽（26 頁）

| # | 路由 | 頁面名稱 | 說明 |
|---|---|---|---|
| 1 | `/` | 🏠 首頁 (Homepage) | 動態統計數據、風味偏好推薦、等級顯示 |
| 2 | `/engine` | 🧪 智慧配方引擎 (Smart Flavor Engine) | 117 種材料選擇 → Sigmoid 模型即時生成配方 |
| 3 | `/my-bar` | 🍸 我的酒櫃 (My Bar) | 勾選已有材料 → 自動推薦可調配方 + 差一點就能做 |
| 4 | `/favorites` | ⭐ 我的收藏 (Favorites) | 收藏配方、5 星評分、個人品飲筆記 |
| 5 | `/recipes` | 📚 配方庫 (Recipe Library) | 51 款配方、7 維度進階篩選 + 排序 |
| 6 | `/recipes/[slug]` | 📖 配方詳情 (Recipe Detail) | 風味條 0-10、調製步驟、小技巧、故事 |
| 7 | `/compare` | 📊 配方比較器 (Recipe Comparator) | 雷達圖疊加比較，最多 3 款同時對比 |
| 8 | `/prep` | 🫙 備料工坊 (Prep Workshop) | 18 款備料配方（糖漿、浸泡、苦精…） |
| 9 | `/prep/[slug]` | 🫙 備料詳情 (Prep Detail) | 步驟圖解、保存期限、使用建議 |
| 10 | `/batch` | 🧮 批次換算 (Batch Calculator) | 多人份量即時換算 |
| 11 | `/tools` | 🛠️ 工具箱 (Tools Hub) | 工具入口頁 |
| 12 | `/tools/abv` | 📐 ABV 計算器 | 即時酒精濃度計算 + 稀釋因子 + 等效顯示 |
| 13 | `/tools/cost` | 💰 成本計算器 | 單杯成本分析 + 圓餅圖分解、價格記憶 |
| 14 | `/tools/convert` | 🌡️ 單位換算器 | 容量 / 溫度 / 重量 / 酒精度轉換 |
| 15 | `/quiz` | ❓ 知識測驗 (Quiz) | 40 題、4 大類別、每輪 8 題、計分 + 最佳紀錄 |
| 16 | `/academy` | 🎓 調酒學院 (Mixology Academy) | 學院入口 Hub |
| 17 | `/academy/wine` | 🍷 葡萄酒百科 | 8 分頁：釀造、葡萄品種、產區、橡木桶、品飲、配餐、年份、進階 |
| 18 | `/academy/spirits` | 🥃 烈酒百科 | 8 種烈酒 + 蒸餾法 + 陳年 + 雞尾酒家族 |
| 19 | `/academy/techniques` | 📐 調酒技法圖解 | 10 種技法：搖盪、攪拌、直調、滾動、搗碎、分層 + 4 進階 |
| 20 | `/academy/tools` | 🔧 器材百科 | 調酒器具完整介紹 |
| 21 | `/academy/tasting` | 🥂 品飲指南 | 品飲方法與感官訓練 |
| 22 | `/academy/storage` | 📦 保存指南 | 材料與成品保存建議 |
| 23 | `/academy/curriculum` | 📖 階梯課程 | 學習路徑規劃 |
| 24 | `/academy/distillation` | ⚗️ 蒸餾百科 | 蒸餾原理與方法 |
| 25 | `/academy/sake` | 🍶 清酒百科 | 清酒分類與品飲 |
| 26 | `/academy/sommelier` | 🏅 侍酒師指南 | 侍酒師知識與服務 |

### Phase 1.5 新增功能

| 功能 | 說明 | 儲存方式 |
|---|---|---|
| 🍸 我的酒櫃 (My Bar) | 勾選已有材料 → 自動推薦可調配方；「差一點就能做」顯示近似配方 | `localStorage` |
| ⭐ 收藏與筆記 | 收藏配方、5 星評分、個人品飲筆記 | `localStorage` |
| 🎯 風味偏好推薦 | 設定口味偏好（甜/酸/苦/烈 + 風味標籤）→ 首頁個人化推薦 | `localStorage` |
| 📊 配方比較器 | 2-3 款雞尾酒並列比較，雷達圖疊加顯示 | 即時運算 |
| 🏆 調酒師等級系統 | XP 累積升級：見習生 → 調酒大師（8 個等級），追蹤瀏覽/嘗試/學院進度 | `localStorage` |
| ❓ 知識測驗 | 40 題 × 4 類別，每輪 8 題，計分 + 歷史最佳紀錄 | `localStorage` |
| 📐 調酒技法圖解 | 10 種技法 Step-by-step 教學 | 靜態內容 |
| 📐 ABV 計算器 | 即時酒精濃度計算、稀釋因子、等效顯示 | 即時運算 |
| 💰 成本計算器 | 單杯成本分析 + 圓餅圖分解、價格記憶功能 | `localStorage` |
| 🌡️ 單位換算器 | 容量 / 溫度 / 重量 / 酒精度四向轉換 | 即時運算 |
| 🌓 淺色/深色主題切換 | CSS 變數驅動主題，平滑過渡動畫 | `localStorage` |
| 🔍 進階篩選器 | 7 維度篩選（手法、難度、烈度、甜度、酸度、基酒、風味標籤）+ 排序 | 即時運算 |
| 📱 PWA 支援 | Service Worker + Manifest + 離線頁面，可安裝至桌面 | 瀏覽器 |

### 🧪 智慧風味引擎演算法

```
甜度乘數 = 0.72 + 0.55 × sigmoid((ABV − 40) / 10)
```

- **Sigmoid 化學平衡模型**：高酒精度自動補償酸甜比
- **15 維風味向量**：以餘弦相似度 (Cosine Similarity) 進行材料匹配
- **互補配對偵測**：60% 相似度權重 + 40% 互補風味權重
- **自動命名**：根據主導風味 + 平衡分數智慧命名

---

## 🏗 系統架構 (System Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    使用者 (Browser / PWA)                     │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP :3000
┌────────────────────────────▼────────────────────────────────┐
│              前端 FRONTEND — Next.js 14 App Router           │
│                                                              │
│   React 18.3  │  Tailwind CSS 3.4  │  Recharts 2.12        │
│   localStorage 狀態管理  │  PWA Service Worker              │
│                                                              │
│   /api/v1/* ─── Next.js rewrites ──→ localhost:8000         │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API (proxy)
┌────────────────────────────▼────────────────────────────────┐
│              後端 BACKEND — FastAPI + Python 3.12            │
│                                                              │
│   8 路由模組 (Routers)  │  Pydantic 資料驗證                  │
│   NumPy + SciPy 向量運算  │  uvicorn ASGI Server            │
│                                                              │
│   ┌──────────────────────────────────────────┐              │
│   │  風味引擎核心 (Flavor Engine)              │              │
│   │  ├─ balance_model.py  (Sigmoid 模型)      │              │
│   │  ├─ flavor_engine.py  (主引擎邏輯)        │              │
│   │  ├─ flavor_wheel.py   (風味輪匹配)        │              │
│   │  └─ name_generator.py (自動命名)          │              │
│   └──────────────────────────────────────────┘              │
└────────────────────────────┬────────────────────────────────┘
                             │ File I/O
┌────────────────────────────▼────────────────────────────────┐
│              資料層 DATA LAYER — JSON 檔案資料庫              │
│                                                              │
│   ingredients.json (117)  │  classic_recipes.json (51)      │
│   prep_recipes.json (18)  │  wine_knowledge.json            │
│   spirits_knowledge.json  │  flavor_wheel.json              │
└─────────────────────────────────────────────────────────────┘
```

### 技術棧一覽

| 層級 | 技術 | 版本 | 用途 |
|---|---|---|---|
| **後端** | Python | 3.12 | 主語言 |
| | FastAPI | 0.109.2 | Web 框架 |
| | uvicorn | latest | ASGI 伺服器 |
| | Pydantic | v2 | 資料驗證 |
| | NumPy | latest | 風味向量運算 |
| | SciPy | latest | 科學計算（Sigmoid 等） |
| **前端** | Next.js | 14.2.3 | React 全端框架 (App Router) |
| | React | 18.3.1 | UI 元件庫 |
| | Tailwind CSS | 3.4.3 | 原子化 CSS |
| | Recharts | 2.12.4 | 雷達圖 / 圓餅圖 |
| **資料庫** | JSON 檔案 | — | Phase 1 MVP 儲存 |
| | PostgreSQL | — | Phase 2 規劃中 |
| **部署** | start.sh / stop.sh | — | 單機一鍵啟停 |

---

## 🚀 快速開始 (Quick Start)

### 前置需求

| 工具 | 版本需求 | 驗證指令 |
|---|---|---|
| Python | ≥ 3.12 | `python3 --version` |
| Node.js | ≥ 18.17 | `node --version` |
| npm | ≥ 9.x | `npm --version` |
| Git | ≥ 2.x | `git --version` |

> **注意**：Phase 1 使用 JSON 檔案作為資料庫，無需安裝 PostgreSQL。

### 一鍵啟動

```bash
# 1. 複製專案
git clone https://github.com/your-org/mixmaster.git
cd Mix_Master

# 2. 一鍵啟動前後端
chmod +x start.sh
./start.sh
```

啟動腳本會自動：
1. 啟動 Python 虛擬環境
2. 安裝後端依賴
3. 啟動 FastAPI 後端（port 8000）
4. 安裝前端依賴
5. 啟動 Next.js 前端（port 3000）
6. 顯示 "✅ 前端已就緒" 表示啟動完成

### 訪問服務

| 服務 | URL | 說明 |
|---|---|---|
| 前端介面 | http://localhost:3000 | 主要使用入口（支援 LAN IP 存取） |
| API 文件 | http://localhost:8000/docs | Swagger UI 互動式文件 |
| 健康檢查 | http://localhost:8000/health | 後端狀態確認 |

### 一鍵停止

```bash
./stop.sh
```

---

## 🛠 開發環境建置 (Development Setup)

### Step 1：複製並進入專案

```bash
git clone https://github.com/your-org/mixmaster.git
cd Mix_Master
```

### Step 2：後端環境設定

```bash
# 啟動虛擬環境
source .venv/bin/activate

# 安裝 Python 依賴
pip install -r requirements.txt

# 啟動後端開發伺服器
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3：前端環境設定（另開終端）

```bash
cd frontend

# 安裝前端依賴
npm install

# 啟動前端開發伺服器
npm run dev
```

### Step 4：驗證服務

```bash
# 測試後端健康檢查
curl http://localhost:8000/health

# 測試 API 端點
curl http://localhost:8000/api/v1/ingredients?limit=5

# 前端訪問
open http://localhost:3000
```

> **API 代理說明**：前端透過 Next.js `rewrites` 將 `/api/v1/*` 代理至 `localhost:8000`，
> 開發時無需直接存取 8000 port。

---

## 🐍 虛擬環境管理 (Virtual Environment)

本專案根目錄已內建 `.venv` 虛擬環境（Python 3.12）。

### 啟動現有虛擬環境

```bash
# Linux / macOS
source .venv/bin/activate

# 確認啟動成功（應顯示 .venv 前綴）
which python   # → .../Mix_Master/.venv/bin/python
python --version  # → Python 3.12.x
```

### 從零建立虛擬環境（如需重建）

```bash
# 進入專案根目錄
cd Mix_Master

# 建立虛擬環境
python3.12 -m venv .venv

# 啟動
source .venv/bin/activate

# 升級 pip 並安裝依賴
pip install --upgrade pip
pip install -r requirements.txt
```

### 退出虛擬環境

```bash
deactivate
```

### 管理依賴

```bash
# 安裝新套件
pip install package-name

# 更新依賴清單
pip freeze > requirements.txt

# 查看已安裝套件
pip list
pip show fastapi
```

---

## 🧪 測試 (Testing)

### 後端測試

```bash
source .venv/bin/activate
cd backend

# 執行所有測試
pytest

# 執行特定模組測試
pytest tests/test_balance_model.py -v
pytest tests/test_flavor_engine.py -v

# 測試覆蓋率報告
pytest --cov=. --cov-report=html
open htmlcov/index.html
```

### 前端測試

```bash
cd frontend

# 單元測試
npm run test

# 觀察模式
npm run test:watch

# 覆蓋率報告
npm run test:coverage
```

### API 手動測試

```bash
# 健康檢查
curl http://localhost:8000/health

# 查詢材料（按類別篩選）
curl "http://localhost:8000/api/v1/ingredients?category=base_spirit"

# 查詢配方列表
curl "http://localhost:8000/api/v1/recipes?limit=10"

# 測試配方生成
curl -X POST http://localhost:8000/api/v1/engine/generate \
  -H "Content-Type: application/json" \
  -d '{
    "availableIngredients": ["tanqueray-gin", "fresh-lime-juice", "simple-syrup"],
    "preferences": { "style": "sour" }
  }'

# 批次換算
curl -X POST http://localhost:8000/api/v1/batch/calculate \
  -H "Content-Type: application/json" \
  -d '{"recipeSlug": "margarita", "servings": 8}'

# 互動式 API 文件
open http://localhost:8000/docs     # Swagger UI
open http://localhost:8000/redoc    # ReDoc
```

---

## 📖 API 文件摘要 (API Reference)

啟動後端後可訪問完整互動式文件：

| 文件類型 | URL | 說明 |
|---|---|---|
| Swagger UI | http://localhost:8000/docs | 互動式測試介面 |
| ReDoc | http://localhost:8000/redoc | 閱讀友好版本 |
| OpenAPI JSON | http://localhost:8000/openapi.json | 機器讀取格式 |

### API 端點總覽（8 個路由模組，14 個端點）

| 方法 | 端點 | 說明 | 路由模組 |
|---|---|---|---|
| `POST` | `/api/v1/engine/generate` | 智慧配方生成 | `routes_engine` |
| `GET` | `/api/v1/recipes` | 配方列表（支援 limit、search） | `routes_recipes` |
| `GET` | `/api/v1/recipes/{slug}` | 配方詳情 | `routes_recipes` |
| `GET` | `/api/v1/ingredients` | 材料列表（支援 category、search） | `routes_ingredients` |
| `GET` | `/api/v1/ingredients/categories` | 材料類別列表 | `routes_ingredients` |
| `GET` | `/api/v1/prep` | 備料配方列表 | `routes_prep` |
| `GET` | `/api/v1/prep/{slug}` | 備料配方詳情 | `routes_prep` |
| `GET` | `/api/v1/prep/categories` | 備料類別列表 | `routes_prep` |
| `GET` | `/api/v1/knowledge/wine` | 葡萄酒知識庫 | `routes_knowledge` |
| `GET` | `/api/v1/knowledge/spirits` | 烈酒知識庫 | `routes_knowledge` |
| `GET` | `/api/v1/academy/modules` | 學院模組列表 | `routes_academy` |
| `POST` | `/api/v1/batch/calculate` | 批次份量換算 | `routes_batch` |
| `GET` | `/api/v1/search` | 全站搜尋 | `routes_search` |
| `GET` | `/health` | 健康檢查 | `main` |

---

## 📁 目錄結構 (Directory Structure)

```
Mix_Master/
├── backend/
│   ├── api/                        # FastAPI 路由處理器（8 個路由模組）
│   │   ├── routes_engine.py        # 🧪 智慧配方引擎 API
│   │   ├── routes_recipes.py       # 📚 配方庫 CRUD
│   │   ├── routes_ingredients.py   # 🧂 材料庫查詢
│   │   ├── routes_knowledge.py     # 📖 知識庫（葡萄酒 + 烈酒）
│   │   ├── routes_prep.py          # 🫙 備料配方
│   │   ├── routes_batch.py         # 🧮 批次換算
│   │   ├── routes_academy.py       # 🎓 學院模組
│   │   └── routes_search.py        # 🔍 全站搜尋
│   ├── engine/                     # 風味引擎核心
│   │   ├── balance_model.py        # Sigmoid 化學平衡模型
│   │   ├── flavor_engine.py        # 主引擎邏輯
│   │   ├── flavor_wheel.py         # 風味輪匹配
│   │   └── name_generator.py       # 自動命名
│   ├── data/                       # JSON 資料庫
│   │   ├── ingredients.json        # 117 種材料（11 類別）
│   │   ├── classic_recipes.json    # 51 款經典配方
│   │   ├── prep_recipes.json       # 18 款備料配方
│   │   ├── wine_knowledge.json     # 葡萄酒知識庫
│   │   ├── spirits_knowledge.json  # 烈酒知識庫
│   │   └── flavor_wheel.json       # 風味輪資料
│   ├── models/                     # Pydantic 資料模型
│   ├── config.py                   # 應用設定
│   └── main.py                     # FastAPI 入口點
├── frontend/
│   ├── app/                        # Next.js App Router（26 頁）
│   ├── components/                 # React 元件
│   │   ├── layout/Navbar.tsx       # 導航列
│   │   ├── FavoritesContext.tsx     # 收藏狀態管理
│   │   ├── ProgressContext.tsx      # 等級系統狀態
│   │   ├── ThemeContext.tsx         # 主題切換
│   │   ├── FlavorPreference.tsx     # 風味偏好元件
│   │   └── ...
│   ├── lib/                        # 工具函式
│   │   ├── api.ts                  # API URL helper
│   │   ├── quizData.ts             # 測驗題庫（40 題）
│   │   └── design-tokens.ts        # 設計 token
│   ├── styles/globals.css          # Tailwind + 自訂樣式
│   └── public/                     # PWA manifest、icons、Service Worker
├── .venv/                          # Python 虛擬環境（不進版本控制）
├── requirements.txt                # Python 依賴
├── start.sh                        # 一鍵啟動腳本
├── stop.sh                         # 一鍵停止腳本
├── BLUEPRINT.md                    # 專案開發藍圖
├── LICENSE                         # MIT License
└── README.md                       # 本文件
```

---

## 📊 資料與指標 (Data & Metrics)

### 資料集規模

| 資料集 | 數量 | 格式 | 檔案路徑 |
|---|---|---|---|
| 材料資料庫 | 117 種（11 類別） | JSON | `backend/data/ingredients.json` |
| 經典配方 | 51 款（含風味剖面） | JSON | `backend/data/classic_recipes.json` |
| 備料配方 | 18 款（5 類型） | JSON | `backend/data/prep_recipes.json` |
| 葡萄酒知識 | 9 大主題 | JSON | `backend/data/wine_knowledge.json` |
| 烈酒知識 | 8 種烈酒 + 蒸餾/陳年 | JSON | `backend/data/spirits_knowledge.json` |
| 風味輪 | 互補/相似匹配矩陣 | JSON | `backend/data/flavor_wheel.json` |
| 測驗題庫 | 40 題（4 類別） | TypeScript | `frontend/lib/quizData.ts` |

### 材料類別分布

| 類別 | 英文 (Category Key) | 說明 |
|---|---|---|
| 基酒 | `base_spirit` | 琴酒、伏特加、威士忌、蘭姆… |
| 利口酒 | `liqueur` | 甜味酒、苦味酒 |
| 葡萄酒 | `wine` | 氣泡酒、紅白酒 |
| 加烈酒 | `fortified_wine` | 雪莉、波特、苦艾酒 |
| 糖漿 | `syrup` | 單糖漿、蜂蜜糖漿… |
| 果汁 | `juice` | 新鮮柑橘汁 |
| 調和飲料 | `mixer` | 蘇打水、通寧水… |
| 新鮮材料 | `fresh` | 薄荷、小黃瓜… |
| 苦精 | `bitter` | Angostura、Peychaud's… |
| 乳製品 | `dairy` | 鮮奶油、椰奶 |
| 蛋 | `egg` | 蛋白、蛋黃 |

### 葡萄酒知識庫內容

| 主題 | 數據量 |
|---|---|
| 釀造製程 | 完整流程圖解 |
| 葡萄品種 | 28 種 |
| 產區 | 20 個 |
| 橡木桶 | 7 種類型 |
| 品飲 | 9 種服務溫度 |
| 配餐 | 食物搭配指南 |
| 年份 | 9 產區年份指南 |
| 進階釀造 | 10 種技法 |

### 烈酒知識庫內容

| 項目 | 數據量 |
|---|---|
| 烈酒種類 | 8 種 |
| 蒸餾方法 | 4 種 |
| 蒸餾概念 | 6 項 |
| 桶型 | 8 種 |
| 陳年因素 | 5 項 |
| 桶身處理 (Finishing) | 6 種技法 |
| 雞尾酒家族 | 8 個 |

### 15 維風味向量說明

| 索引 | 維度 | 中文 | 典型材料 |
|---|---|---|---|
| 0 | `citrus` | 柑橘 | 檸檬、萊姆、橙 |
| 1 | `tropical` | 熱帶果香 | 鳳梨、百香果 |
| 2 | `berry` | 莓果 | 草莓、黑莓 |
| 3 | `stone_fruit` | 核果 | 桃子、杏子 |
| 4 | `herbal` | 草本 | 琴酒、薄荷 |
| 5 | `floral` | 花香 | 接骨木花、玫瑰 |
| 6 | `spicy` | 辛香 | 薑、肉桂 |
| 7 | `earthy` | 土壤根莖 | 根莖類蔬菜 |
| 8 | `smoky` | 煙燻 | Mezcal、Lapsang |
| 9 | `nutty` | 堅果 | Amaretto、Frangelico |
| 10 | `vanilla` | 香草 | 波本、香草糖漿 |
| 11 | `caramel` | 焦糖 | 陳年蘭姆、波本 |
| 12 | `bitter` | 苦韻 | 苦精、Campari |
| 13 | `umami` | 鮮味 | 陳年威士忌 |
| 14 | `oak` | 橡木 | 橡木桶陳年烈酒 |

> **資料尺度**：原始 JSON 中風味值為 `0-1` 浮點數，前端自動轉換為 `0-10` 顯示。

---

## 🎨 設計規範 (Design System)

### 主題：Cyberpunk Speakeasy

支援淺色 / 深色雙主題，透過 CSS 變數切換，帶平滑過渡動畫。

#### 深色主題 (Dark Mode)

| Token | 色碼 | 用途 |
|---|---|---|
| `--bg-primary` | `#0A0A0F` | 極深夜黑背景 |
| `--neon-amber` | `#F5A623` | 琥珀金主強調色 |
| `--neon-cyan` | `#00FFFF` | 霓虹青次強調色 |
| `--neon-purple` | `#9B59B6` | 紫色第三強調色 |

#### 淺色主題 (Light Mode)

| Token | 色碼 | 用途 |
|---|---|---|
| `--bg-primary` | `#F5F3EF` | 暖奶油色背景 |
| 強調色 | 調整後版本 | 保持可讀性的降飽和版本 |

#### 字型系統 (Typography)

| 用途 | 字型 | 類型 |
|---|---|---|
| 標題 / 裝飾 | Playfair Display | Serif |
| 界面 / 內文 | Inter | Sans-serif |
| 程式碼 / 數據 | Fira Code | Monospace |

#### 自訂 CSS 類別

| 類別 | 說明 |
|---|---|
| `.glass-card` | 毛玻璃卡片效果 |
| `.btn-neon-amber` | 琥珀金霓虹按鈕 |
| `.btn-neon-cyan` | 霓虹青按鈕 |
| `.input-neon` | 霓虹風格輸入框 |
| `.text-gradient-amber` | 琥珀金漸層文字 |
| `.animate-fade-in` | 淡入動畫 |

---

## 📋 操作指南 (Operation Guide)

### 第一次設定

```
[1]  git clone → cd Mix_Master
[2]  chmod +x start.sh stop.sh
[3]  ./start.sh
[4]  等待 "✅ 前端已就緒" 訊息
[5]  瀏覽器訪問 http://localhost:3000
```

### 日常開發

```
[1]  ./start.sh                           # 啟動前後端
[2]  編輯程式碼（後端 hot-reload、前端 HMR）
[3]  ./stop.sh                            # 結束開發
```

### 手動分別啟動（進階）

```bash
# 終端 1：後端
source .venv/bin/activate
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 終端 2：前端
cd frontend && npm run dev
```

### 新增材料

```
[1]  編輯 backend/data/ingredients.json
[2]  新增材料 JSON 物件（必須包含 15 維風味向量，值為 0-1 浮點數）
[3]  重啟後端使變更生效
```

### 新增配方

```
[1]  編輯 backend/data/classic_recipes.json
[2]  遵循現有配方格式（含 slug、材料列表、風味剖面）
[3]  重啟後端使變更生效
```

### 新增 API 端點

```
[1]  在 backend/api/ 新增或修改路由函數
[2]  在 backend/main.py 中 include_router（如為新模組）
[3]  重啟後端驗證
```

---

## ❓ FAQ

**Q: 啟動後無法存取頁面？**
> 確認 `start.sh` 是否顯示 "✅ 前端已就緒"。前端綁定 `0.0.0.0:3000`，
> 可透過 LAN IP 存取（例如 `http://192.168.x.x:3000`）。

**Q: API 請求失敗？**
> 所有 API 請求透過 Next.js `rewrites` 代理（`/api/v1/*` → `localhost:8000`），
> 無需直接存取 8000 port。請確認後端是否正常運行。

**Q: 如何新增自訂材料？**
> 編輯 `backend/data/ingredients.json`，加入材料 JSON 物件。
> **注意**：`flavorVector` 必須為 15 個 `0-1` 浮點數的陣列。

**Q: 風味分數顯示範圍？**
> 原始資料為 `0-1` 尺度，前端自動轉為 `0-10` 顯示。

**Q: localStorage 資料儲存了哪些？**
> | Key | 內容 |
> |---|---|
> | `mixmaster-my-bar` | 酒櫃（已有材料） |
> | `mixmaster-favorites` | 收藏配方與筆記 |
> | `mixmaster-flavor-pref` | 風味偏好設定 |
> | `mixmaster-progress` | 等級系統進度與 XP |
> | `mixmaster-theme` | 主題設定（淺色/深色） |
> | `mixmaster-quiz-history` | 測驗歷史與最佳紀錄 |
> | `mixmaster-prices` | 成本計算器價格記憶 |

**Q: 如何重置個人資料？**
> 清除瀏覽器 `localStorage` 中以 `mixmaster-` 開頭的所有 key：
> ```javascript
> Object.keys(localStorage)
>   .filter(k => k.startsWith('mixmaster-'))
>   .forEach(k => localStorage.removeItem(k));
> ```

**Q: PWA 如何安裝？**
> 使用 Chrome 瀏覽器訪問網站後，地址欄右側會出現安裝按鈕（⊕ 圖示），
> 點擊即可安裝至桌面。

**Q: 支援哪些瀏覽器？**
> 支援所有現代瀏覽器（Chrome、Firefox、Safari、Edge）。
> 建議使用 Chrome 以獲得最佳 PWA 安裝體驗。

**Q: 虛擬環境損壞如何修復？**
> ```bash
> rm -rf .venv
> python3.12 -m venv .venv
> source .venv/bin/activate
> pip install -r requirements.txt
> ```

---

## 📅 開發歷程與路線圖 (History & Roadmap)

### 開發歷程

| 階段 | 版本 | 內容 |
|---|---|---|
| **Phase 1.0** | v1.0 | 核心 MVP — 智慧風味引擎、配方庫（51 款）、備料工坊（18 款）、批次換算器、調酒學院基礎（葡萄酒/烈酒/器材/品飲/保存百科） |
| **Phase 1.5** | v1.5 | 功能擴充 — 我的酒櫃、收藏與筆記、風味偏好推薦、配方比較器、調酒師等級系統、知識測驗、調酒技法圖解、ABV/成本/單位計算器、淺色/深色主題、7 維進階篩選器、PWA 支援 |

### 路線圖

| 階段 | 計畫內容 |
|---|---|
| **Phase 2.0** | 用戶帳號系統（PostgreSQL + JWT 認證）、社群功能、社群筆記分享、RAG 增強知識庫 |
| **Phase 3.0** | 行動原生體驗（React Native / PWA 深度優化）、即時調酒工作坊模式 |

---

## 🤝 貢獻指南 (Contributing)

### 開發流程

```bash
# 1. Fork 專案並複製
git clone https://github.com/your-fork/mixmaster.git
cd Mix_Master

# 2. 建立功能分支
git checkout -b feat/your-feature-name

# 3. 進行開發...

# 4. 提交變更
git add .
git commit -m "feat: 描述你的更改"

# 5. 推送並建立 Pull Request
git push origin feat/your-feature-name
```

### Commit Message 規範

| 前綴 | 用途 | 範例 |
|---|---|---|
| `feat:` | 新功能 | `feat: 新增材料搜尋功能` |
| `fix:` | Bug 修復 | `fix: 修正風味分數計算錯誤` |
| `docs:` | 文件更新 | `docs: 更新 API 端點說明` |
| `style:` | 格式調整（不影響邏輯） | `style: 統一縮排格式` |
| `refactor:` | 重構 | `refactor: 抽取風味計算邏輯` |
| `test:` | 測試相關 | `test: 新增引擎單元測試` |
| `chore:` | 建置 / 工具更新 | `chore: 更新依賴版本` |

### 開發注意事項

1. **材料格式**：新增材料時，`flavorVector` 必須為 15 個 `0-1` 浮點數
2. **API 路由**：新端點需在 `backend/main.py` 中註冊 router
3. **前端頁面**：使用 Next.js App Router 在 `frontend/app/` 下建立目錄
4. **設計風格**：遵循 Cyberpunk Speakeasy 主題，使用定義好的 CSS 類別

---

## 📜 授權 (License)

本專案採用 [MIT 授權](LICENSE)。

---

<div align="center">

**🍸 Built with passion for the craft of mixology**

*MixMaster v1.5.0*

</div>
