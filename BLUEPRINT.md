# 🍹 MixMaster — 第一階段：專案開發藍圖
# Phase 1: Project Development Blueprint

> **版本 Version：** v1.0.0-alpha  
> **撰寫日期 Date：** 2026-04-01  
> **文件性質 Type：** 核心架構藍圖 (Core Architecture Blueprint)  
> **語言 Language：** 繁體中文 + English Technical Terms

---

## 📋 目錄 Table of Contents

1. [專案願景 Project Vision](#1-專案願景)
2. [系統架構總覽 System Architecture](#2-系統架構總覽)
3. [智慧風味平衡引擎 Smart Flavor Engine](#3-智慧風味平衡引擎)
4. [調酒學院模組 Mixology Academy](#4-調酒學院模組)
5. [UI/UX 設計規範 Design System](#5-uiux-設計規範)
6. [技術架構詳解 Technical Architecture](#6-技術架構詳解)
7. [資料庫設計 Database Schema](#7-資料庫設計)
8. [API 設計規範 API Design](#8-api-設計規範)
9. [三階段部署路徑 Deployment Roadmap](#9-三階段部署路徑)
10. [效能與安全性 Performance & Security](#10-效能與安全性)
11. [建議功能清單 Recommended Features](#11-建議功能清單)
12. [附錄 Appendix](#12-附錄)

---

## 1. 專案願景

### 1.1 使命宣言 Mission Statement

MixMaster 致力於打破調酒世界的高門檻。我們相信：**每一瓶家中的酒，都有潛力成為一杯令人難忘的作品。**

透過結合「調酒科學」與「人工智慧」，本平台將：
- 讓 **新手** 在 30 分鐘內理解調酒基礎邏輯
- 讓 **愛好者** 能夠用手邊食材創作獨一無二的簽名調酒（Signature Cocktail）
- 讓 **專業人士** 獲得一個系統化的知識庫與創作工具

### 1.2 核心產品理念 Core Product Philosophy

```
教育 (Educate) × 創作 (Create) × 社群 (Community)
        ↓
「從認識一瓶酒，到掌握一杯酒的藝術」
```

### 1.3 Phase 1 核心目標 MVP Goals

| 目標 Goal | 指標 KPI | 優先級 Priority |
|---|---|---|
| 風味引擎 MVP | 可處理 50+ 種基礎材料的配方生成 | P0 🔴 |
| 調酒學院基礎 | 覆蓋 3 大知識模組、20+ 篇核心文章 | P0 🔴 |
| Web 平台上線 | Lighthouse 效能評分 > 90 | P1 🟡 |
| 配方資料庫 | 收錄 100+ 經典調酒配方 | P1 🟡 |
| 使用者帳號 | 基礎 Auth（登入/註冊/收藏） | P2 🟢 |

---

## 2. 系統架構總覽

### 2.1 宏觀架構圖 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Next.js 14 (App Router) + Tailwind CSS                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Academy  │ │  Engine  │ │ Recipes  │ │ Profile  │   │
│  │  Module  │ │   UI     │ │  Library │ │  (P2)    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST + Server Actions
┌────────────────────────▼────────────────────────────────┐
│                   API GATEWAY LAYER                      │
│  FastAPI (Python 3.12) + Pydantic v2                     │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐  │
│  │ Flavor Engine│ │ Recipe CRUD  │ │ Academy Content │  │
│  │   /engine    │ │  /recipes    │ │   /academy      │  │
│  └──────────────┘ └──────────────┘ └─────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   DATA LAYER                             │
│  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │  PostgreSQL 16  │  │  Static CMS (MDX/JSON)      │   │
│  │  (via Prisma)   │  │  Academy Content Flat Files │   │
│  └─────────────────┘  └─────────────────────────────┘   │
│  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │  Redis (Cache)  │  │  Supabase Auth (Phase 2)    │   │
│  │  (Phase 2)      │  │                             │   │
│  └─────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 目錄結構 Project Directory Structure

```
MixMaster/
├── .venv/                          # Python 虛擬環境 (已存在)
├── backend/                        # FastAPI 後端
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes_engine.py        # 風味引擎 API
│   │   ├── routes_recipes.py       # 配方 CRUD
│   │   └── routes_academy.py       # 學院內容 API
│   ├── engine/
│   │   ├── __init__.py
│   │   ├── flavor_engine.py        # 主引擎（組合層）
│   │   ├── balance_model.py        # 化學平衡模型（Sigmoid ABV）
│   │   ├── flavor_wheel.py         # 風味輪相似度演算法
│   │   └── name_generator.py       # 配方自動命名器
│   ├── models/
│   │   ├── ingredient.py           # Pydantic Ingredient 模型
│   │   └── recipe.py               # Pydantic Recipe 模型
│   ├── data/
│   │   ├── ingredients.json        # 50+ 種材料資料庫
│   │   ├── classic_recipes.json    # 100+ 經典配方
│   │   └── flavor_wheel.json       # 風味輪節點關聯
│   ├── database/
│   │   └── connection.py
│   ├── main.py                     # FastAPI 入口
│   ├── config.py
│   └── requirements.txt
├── frontend/                       # Next.js 14 前端
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── engine/page.tsx
│   │   ├── academy/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── recipes/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── components/
│   │   ├── ui/                     # NeonButton, GlassCard, NeonInput...
│   │   ├── engine/                 # FlavorRadar, IngredientSelector...
│   │   ├── academy/                # ArticleCard, CourseProgress...
│   │   └── layout/                 # Navbar, Footer, Sidebar
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── design-tokens.ts
│   ├── styles/globals.css
│   ├── content/academy/            # MDX 靜態內容
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── docs/
│   ├── api-spec.md
│   ├── flavor-algorithm.md
│   └── design-system.md
├── BLUEPRINT.md
├── README.md
├── requirements.txt
└── LICENSE
```

---

## 3. 智慧風味平衡引擎

### 3.1 核心哲學

> 「每一杯調酒，本質上是一道化學方程式。酸、甜、苦、酒感的黃金比例，是科學；而如何詮釋這個比例，是藝術。」

引擎採用雙層架構：
1. **規則引擎 (Rule-Based Engine)**：負責化學平衡，輸出可飲用的基礎比例
2. **相似度引擎 (Similarity Engine)**：透過風味向量尋找創意延伸與替代方案

### 3.2 化學平衡模型 Chemical Balance Model

#### 3.2.1 黃金比例基準 Golden Ratio Baseline

| 類型 | 基酒 Spirit | 甜 Sweet | 酸 Sour | 代表酒款 |
|---|---|---|---|---|
| Classic Sour | 2 oz | ¾ oz | ¾ oz | Daiquiri, Whiskey Sour |
| Modern Sour | 2 oz | ½ oz | ¾ oz | 現代低糖版本 |
| Tropical | 1.5 oz | 1 oz | ½ oz | Mai Tai variation |
| Highball | 1.5 oz | — | — | + 3-4 oz mixer |

#### 3.2.2 ABV 動態調整算法（Sigmoid 非線性）

```
科學依據：Weber-Fechner Law
人類味覺對酒精的感知呈對數關係。
ABV 越高 → 甜味感知被抑制 → 需要補充更多甜與酸才能達到平衡。

調整公式：
  deviation    = (ABV - 40) / 10
  sigmoid(x)   = 1 / (1 + e^(-x))
  sweet_ratio  = base_sweet × (0.72 + 0.55 × sigmoid(deviation))
  sour_ratio   = base_sour  × (0.78 + 0.42 × sigmoid(deviation))
  dilution     = 1.0 + 0.008 × max(0, ABV - 40)

驗證表：
  ABV 20% → sweet ×0.82 / sour ×0.85 (低酒精需減少酸甜)
  ABV 40% → sweet ×0.97 / sour ×0.97 (基準值)
  ABV 55% → sweet ×1.13 / sour ×1.08 (高酒精需強化對比)
  ABV 65% → sweet ×1.24 / sour ×1.15 (過桶烈酒極值補償)
```

#### 3.2.3 四維風味權重系統

```
維度         描述               0 值             1 值
──────────────────────────────────────────────────────
ACID   酸   Citrus / Vinegar   純水             純檸檬汁
SWEET  甜   Syrup / Liqueur    純烈酒           糖漿原液
BITTER 苦   Bitters / Amaro    無苦味           苦精原液
PUNCH  酒感 ABV × Volume       無酒精           120 proof 純飲
```

### 3.3 材料屬性標籤規格 Ingredient Metadata

#### TypeScript 型別定義

```typescript
// frontend/lib/types.ts

export type FlavorDimension =
  | 'citrus' | 'tropical' | 'berry' | 'stone_fruit'
  | 'herbal' | 'floral'   | 'spicy' | 'earthy'
  | 'smoky'  | 'nutty'    | 'vanilla' | 'caramel'
  | 'bitter' | 'umami'    | 'oak';

// 15 維風味向量，索引對應 FLAVOR_DIMENSIONS
export type FlavorVector = [
  number, number, number, number, number,
  number, number, number, number, number,
  number, number, number, number, number
];

export type IngredientCategory =
  | 'base_spirit' | 'liqueur' | 'fortified_wine'
  | 'wine' | 'beer' | 'mixer' | 'juice'
  | 'syrup' | 'bitter' | 'fresh' | 'dairy' | 'egg' | 'garnish';

export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'exotic';

export interface Ingredient {
  id: string;
  name: string;
  nameZh: string;
  brand?: string;
  category: IngredientCategory;
  subcategory?: string;
  abv: number;
  sugarContent?: number;
  acidPH?: number;
  bitterUnit?: number;
  caloriesPer30ml?: number;
  flavorVector: FlavorVector;
  flavorTags: FlavorDimension[];
  aroma: string[];
  taste: string[];
  finish?: string;
  origin?: string;
  productionMethod?: string;
  aging?: string;
  rarity: RarityLevel;
  colorHex: string;
  description: string;
  descriptionZh: string;
  substitutes?: string[];
  pairingBonus?: Record<string, number>;
  imageUrl?: string;
  tags?: string[];
}
```

### 3.4 獨家配方演算法 Signature Creation

#### 風味輪相似度 + 互補性計算

```
計算策略：
  combined_score = 0.6 × cosine_similarity(A, B)
                 + 0.4 × complementary_score(A, B)

互補風味對（Complementary Pairs）：
  citrus   ↔ herbal, floral      (柑橘 + 草本/花香 → 清爽層次)
  tropical ↔ smoky, spicy        (熱帶 + 煙燻/辛香 → 驚喜對比)
  berry    ↔ nutty, vanilla      (莓果 + 堅果/香草 → 豐腴感)
  caramel  ↔ citrus, bitter      (焦糖 + 酸苦 → 深度平衡)
  vanilla  ↔ smoky, bitter       (香草 + 煙燻苦韻 → 大師等級)

替代品尋找流程：
  1. 計算缺失材料的 flavorVector
  2. 對所有同類別材料計算 combined_score
  3. 排序後取 top-3 作為替代建議
```

#### 配方自動命名邏輯

```
命名策略：
  前綴（Prefix）← 主導風味決定
    smoky   → Midnight / Shadow / Phantom
    tropical→ Havana / Soleil / Paradise
    citrus  → Sunrise / Golden / Zest
    herbal  → Alpine / Botanist / Verdant
    caramel → Amber / Ember / Bronze

  後綴（Suffix）← 平衡分數決定
    分數 ≥ 85 → Reserve / Signature / Chapter（詩意系）
    分數 < 85 → Sour / Fizz / Smash / Collins（標準系）

  輸出範例：
    "Midnight Reserve"  ← 煙燻系高分
    "Amber Sour"        ← 焦糖系標準
    "Alpine Fizz"       ← 草本系清爽
```

### 3.5 完整生成流程圖

```
User Input: ["tanqueray-gin", "fresh-lime-juice", "simple-syrup"]
                    ↓
[Step 1] 材料識別與分類
  → 基酒: tanqueray-gin (ABV: 47.3%)
  → 酸味: fresh-lime-juice (pH: 2.2)
  → 甜味: simple-syrup (Sugar: 50%)
                    ↓
[Step 2] ABV 動態調整
  → calculate_balance_parameters(47.3)
  → sweet_ratio = 0.79 oz, sour_ratio = 0.80 oz
                    ↓
[Step 3] 風味向量合成
  → 加權平均 3 個 FlavorVector
  → 主導風味: herbal(0.67), citrus(0.52)
                    ↓
[Step 4] 平衡分數計算
  → acid:sweet ratio = 0.80:0.79 ≈ 1.01 (接近理想 1.0)
  → balance_score = 94 → 等級 A
                    ↓
[Step 5] 配方命名
  → primary_flavor: herbal → 前綴 "Alpine"
  → score 94 → 後綴 "Signature"
  → 名稱: "Alpine Signature" / "高山簽名"
                    ↓
[Step 6] 輸出配方卡
  {
    name: "Alpine Signature",
    method: "shake",
    glass: "coupe",
    ingredients: [
      { slug: "tanqueray-gin",     amount: 2.0,  unit: "oz" },
      { slug: "fresh-lime-juice",  amount: 0.80, unit: "oz" },
      { slug: "simple-syrup",      amount: 0.79, unit: "oz" }
    ],
    garnish: "Lime wheel + fresh thyme sprig",
    balanceScore: 94,
    grade: "A"
  }
```

---

## 4. 調酒學院模組

### 4.1 知識體系三層架構

```
Domain 領域 → Module 模組 → Article 文章
```

### 4.2 完整課綱

```
🛠️ 器材與手法 (Tools & Techniques)
├── 核心器材完全指南
│   ├── Boston Shaker vs Cobbler Shaker 選擇指南
│   ├── Jigger 量酒器：精確度就是一切
│   ├── Bar Spoon 吧叉匙：攪拌的藝術
│   ├── Muddler 攪碎棒：材質與施力
│   ├── Strainer 濾冰器：Hawthorne vs Julep
│   ├── Mixing Glass 調酒杯：容量與重量
│   └── 進階器材：Siphon / Smoking Gun / Centrifuge
├── 四大調製手法（+進階）
│   ├── Shake 搖盪：溫度、稀釋、乳化三位一體
│   ├── Stir 攪拌：何時絕不能搖盪
│   ├── Build 直調：Highball 的簡約美學
│   ├── Roll 滾動：Bloody Mary 的靈魂
│   └── Throw 拋接：西班牙式空氣混合
└── 裝飾美學 (Garnish Arts)
    ├── 柑橘皮扭轉（Citrus Twist）技術圖解
    ├── 火焰橙皮（Flamed Orange Peel）
    ├── 可食用花卉搭配原則
    └── 煙燻裝飾：香氣轉移科學

🍷 葡萄酒百科 (Wine Encyclopedia)
├── 風土與產地 (Terroir)
│   ├── 法國：波爾多六大酒莊 / 勃根地分級制度 / 香檳製法
│   ├── 義大利：Barolo DOCG / 超托斯卡尼 / Soave
│   ├── 西班牙：Rioja Reserva / Sherry 類型
│   └── 新世界：納帕谷 Cabernet / 馬爾堡 Sauvignon Blanc
├── 釀造與陳年製程
│   ├── 紅酒：浸皮萃取 → MLF 二次發酵 → 橡木桶陳年
│   ├── 白酒：低溫發酵保留果香 vs 橡木桶發酵增加質地
│   ├── 氣泡酒：傳統法（Méthode Champenoise）詳解
│   └── 甜酒：貴腐菌（Botrytis）/ 冰酒 / Passito 風乾
└── 品評技術
    ├── 視覺：色澤、透明度、掛杯（Legs）
    ├── 嗅覺：一鼻 vs 二鼻法、香氣層次
    ├── 味覺：單寧感知 / 酸度定位 / 甜度殘留
    └── 餘韻：長度判斷（秒數法）

🥃 烈酒百科 (Spirits Encyclopedia)
├── 威士忌 (Whisky/Whiskey)
│   ├── 蘇格蘭：五大產區 × 泥煤等級（Phenol PPM）
│   ├── 愛爾蘭：三次蒸餾 × 單一壺式蒸餾傳統
│   ├── 美國：波本 vs 裸麥 vs 田納西 法規對照
│   └── 日本：Terroir 精神 × 調和哲學
├── 龍舌蘭家族 (Agave Spirits)
│   ├── Tequila：藍色龍舌蘭 / Jimador 採收 / NOM 認證
│   ├── Mezcal：Papalometl / Tobalá 等稀有品種
│   └── Sotol / Raicilla / Bacanora 延伸族群
├── 蘭姆酒 (Rum)
│   ├── 農業型（Rhum Agricole）vs 工業型（Molasses-based）
│   ├── 西印度群島年份系統 vs 巴拿馬/多明尼加
│   └── Funk 等級：Pot Still 酯類濃度解析
├── 琴酒 (Gin)
│   ├── London Dry / Plymouth / New Western 風格圖譜
│   ├── 植物配方（Botanicals）的科學與選擇
│   └── 台灣 & 亞洲新世代精釀琴酒趨勢
├── 白蘭地 (Brandy)
│   ├── 干邑 Cognac：AOC / VS-VSOP-XO 年份規定
│   ├── Armagnac：單次蒸餾 vs 干邑雙次蒸餾
│   └── Pisco：秘魯 vs 智利的世紀之爭
└── 其他重要烈酒
    ├── 伏特加：中性精神 vs 風土表達派
    ├── 苦艾酒 Absinthe：歷史 / 科學 / 復興
    └── 清酒 Sake：釀造等級 / 精米步合 / 搭配調酒

🎓 階梯式課程 (Progressive Curriculum)
├── Lv.1 入門調酒師 (Novice)        - 1-2 週
├── Lv.2 見習學員   (Apprentice)    - 3-4 週
├── Lv.3 熟練調酒師 (Journeyman)    - 5-8 週
├── Lv.4 創意設計師 (Creator)       - 2-3 個月
└── Lv.5 大師工匠   (Master)        - 3-6 個月
```

### 4.3 課程等級詳細規劃

| 等級 | 名稱 | 核心技能 | 代表作業 | 解鎖條件 |
|---|---|---|---|---|
| Lv.1 | 入門調酒師 | 量酒、冰塊類型、清潔器材 | Gin & Tonic / Vodka Soda | 無 |
| Lv.2 | 見習學員 | 三大比例、Sour 家族、Highball | Daiquiri & Whiskey Sour | 完成 Lv.1 × 5 課 |
| Lv.3 | 熟練調酒師 | Stirred Classics、Vermouth | Negroni & Manhattan | 完成 Lv.2 × 8 課 |
| Lv.4 | 創意設計師 | 風味組合、即興替代 | 個人 Signature Cocktail | 完成 Lv.3 × 10 課 |
| Lv.5 | 大師工匠 | 浸漬/泡沫/煙燻/分子 | 完整 6 杯酒單設計 | 完成 Lv.4 + 引擎得分 A |

---

## 5. UI/UX 設計規範

### 5.1 設計哲學：Cyberpunk Speakeasy

> 融合 1920s 地下酒吧的神秘質感，與 2080s 賽博龐克的霓虹美學。  
> 低調、沉穩、現代，卻在細節處流露出奢華的光。

**三大設計原則：**
1. **Less is More**：留白是奢侈品，陰影是深度
2. **霓虹點綴，不喧賓奪主**：霓虹色只用於功能性強調（按鈕、高亮、邊框）
3. **資訊清晰優先**：再美的設計，閱讀舒適度才是王道

### 5.2 色彩系統 Color System

```
主色調（背景層次）
  極深夜黑 #0A0A0F  ← 頁面主底色
  深夜黑   #111118  ← 卡片底色
  暗色層   #1A1A25  ← Hover/Active 態

霓虹強調色（僅用於重點元素）
  琥珀金   #F5A623  ← 主要 CTA、Logo、重點標題
  霓虹青   #00FFFF  ← 次要強調、輸入框焦點
  神秘紫   #9B59B6  ← 特殊功能、Premium 標籤

深夜藍系列（Section 背景）
  深夜藍   #0D1B2A
  中深藍   #1B2A3B
  亮深藍   #2C4A6E  ← 邊框、分隔線

文字系統
  主文字   #F0EDE4  ← 暖白（主要正文）
  副文字   #B8B0A0  ← 暖灰（說明文字）
  弱化文字 #6B6358  ← 標籤、元資料
  強調文字 #F5A623  ← 琥珀金強調

風味雷達圖專屬色
  酸 (Acid)    #E8F5A0  黃綠
  甜 (Sweet)   #FFB347  橙
  苦 (Bitter)  #8B4513  深棕
  酒感(Punch)  #DC143C  深紅
  草本(Herbal) #228B22  森林綠
  煙燻(Smoky)  #696969  灰
  花香(Floral) #DDA0DD  淡紫
  柑橘(Citrus) #FFD700  金黃
```

### 5.3 字型系統 Typography

```
顯示標題 Display
  字體：Playfair Display + Noto Serif TC
  用途：英雄區塊、主標題、配方名稱
  風格：優雅衬線，傳遞工藝質感

界面標題 Heading
  字體：Inter + Noto Sans TC
  用途：模組標題、導航項目、按鈕

正文 Body
  字體：Inter + Noto Serif TC
  用途：文章內容、說明文字

等寬 Monospace
  字體：Fira Code
  用途：配方步驟、數據、技術說明
```

### 5.4 核心 UI 元件清單

| 元件 | 描述 | 霓虹效果 | 優先級 |
|---|---|---|---|
| `NeonButton` | 主要 CTA | Amber 光暈邊框 | P0 |
| `GlassCard` | 內容容器 | Glassmorphism 毛玻璃 | P0 |
| `FlavorRadar` | 風味雷達圖 | 彩色多維動態 | P0 |
| `IngredientBadge` | 材料標籤 | 類型對應色 | P0 |
| `RecipeCard` | 配方展示卡 | 暗底 + 琥珀邊框 | P0 |
| `NeonInput` | 輸入框 | 焦點時 Cyan 發光 | P1 |
| `ProgressBar` | 風味佔比 | 漸層彩色 | P1 |
| `CourseTree` | 學習進度樹 | 連線式進度 | P1 |
| `ToastNotif` | 通知 | 暗底狀態色 | P2 |
| `ABVSlider` | ABV 滑桿 | Amber 滑軌 | P2 |

---

## 6. 技術架構詳解

### 6.1 完整技術棧 Full Tech Stack

| 層次 | 技術 | 版本 | 用途 |
|---|---|---|---|
| 前端框架 | Next.js App Router | 14.x | SSR/SSG + Client Components |
| CSS 框架 | Tailwind CSS | 3.x | Utility-first 樣式系統 |
| UI 元件庫 | shadcn/ui | latest | 可客製化基礎元件 |
| 圖表 | Recharts | 2.x | 風味雷達圖 / 分析圖表 |
| 圖標 | Lucide React | latest | 一致性 SVG 圖標 |
| 狀態管理 | Zustand | 4.x | 輕量全局狀態 |
| 表單 | React Hook Form + Zod | latest | 材料輸入 + 驗證 |
| 資料快取 | TanStack Query | 5.x | API 快取與同步 |
| 後端框架 | FastAPI | 0.109.x | 高效能 Python API |
| 資料驗證 | Pydantic v2 | 2.5.x | 型別安全 Schema |
| ORM | SQLAlchemy | 2.0.x | 資料庫操作層 |
| 遷移 | Alembic | 1.13.x | Schema 版本控制 |
| 主資料庫 | PostgreSQL | 16.x | 主要持久化存儲 |
| 認證 | Supabase Auth | — | Phase 2 導入 |
| 前端部署 | Vercel | — | CDN + Edge |
| 後端部署 | Railway / Render | — | Python 容器服務 |
| 監控 | Sentry | — | 錯誤追蹤 |

### 6.2 環境變數規範

```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/mixmaster
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=MixMaster
```

---

## 7. 資料庫設計

### 7.1 核心 PostgreSQL Schema

```sql
-- 材料表
CREATE TABLE ingredients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    name_zh         VARCHAR(200) NOT NULL,
    brand           VARCHAR(100),
    category        VARCHAR(50)  NOT NULL,
    subcategory     VARCHAR(50),
    abv             DECIMAL(5,2) DEFAULT 0,
    sugar_content   DECIMAL(6,2),
    acid_ph         DECIMAL(4,2),
    bitter_unit     INTEGER DEFAULT 0,
    flavor_vector   JSONB NOT NULL DEFAULT '[]',
    flavor_tags     TEXT[],
    aroma           TEXT[],
    taste_notes     TEXT[],
    finish          TEXT,
    origin          VARCHAR(100),
    production_method TEXT,
    aging_info      TEXT,
    rarity          VARCHAR(20) DEFAULT 'common',
    color_hex       VARCHAR(7),
    description     TEXT,
    description_zh  TEXT,
    substitutes     TEXT[],
    image_url       TEXT,
    tags            TEXT[],
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 配方表
CREATE TABLE recipes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) UNIQUE,
    name_en         VARCHAR(200) NOT NULL,
    name_zh         VARCHAR(200) NOT NULL,
    type            VARCHAR(50)  NOT NULL,  -- 'classic'|'generated'|'user'
    glass_type      VARCHAR(50),
    method          VARCHAR(20)  NOT NULL,  -- 'shake'|'stir'|'build'
    description     TEXT,
    description_zh  TEXT,
    flavor_profile  JSONB,
    balance_score   DECIMAL(4,1),
    difficulty      INTEGER DEFAULT 1,
    is_alcoholic    BOOLEAN DEFAULT TRUE,
    tags            TEXT[],
    image_url       TEXT,
    source          VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 配方材料關聯
CREATE TABLE recipe_ingredients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id   UUID NOT NULL REFERENCES ingredients(id),
    amount          DECIMAL(5,2) NOT NULL,
    unit            VARCHAR(20)  DEFAULT 'oz',
    is_optional     BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    sort_order      INTEGER DEFAULT 0
);

-- 索引
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_tags ON ingredients USING GIN(tags);
CREATE INDEX idx_recipes_type ON recipes(type);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);
```

---

## 8. API 設計規範

### 8.1 Endpoints 總覽

```
Base URL: http://localhost:8000/api/v1

POST  /engine/generate          生成配方（核心）
POST  /engine/balance-check     配方平衡分析
POST  /engine/substitute        尋找替代材料
GET   /engine/flavor-wheel      風味輪資料

GET   /ingredients              材料列表（支援篩選）
GET   /ingredients/:slug        材料詳情
GET   /ingredients/search       搜尋材料

GET   /recipes                  配方列表
GET   /recipes/:id              配方詳情
POST  /recipes                  建立使用者配方
GET   /recipes/classic          僅取經典配方

GET   /academy/articles         文章列表
GET   /academy/articles/:slug   文章內容
GET   /academy/curriculum       課程結構
```

### 8.2 核心 API Schema

```typescript
// POST /engine/generate
interface GenerateRequest {
  availableIngredients: string[];   // ingredient slugs
  preferences?: {
    style?: 'sour'|'sweet'|'bitter'|'refreshing'|'strong';
    glass?: string;
    maxIngredients?: number;
  };
  userLevel?: 1|2|3|4|5;
}

interface GenerateResponse {
  recipe: {
    nameEn: string;
    nameZh: string;
    method: 'shake'|'stir'|'build';
    glassType: string;
    balanceScore: number;
    grade: 'A'|'B'|'C'|'D';
    ingredients: Array<{
      ingredient: Ingredient;
      amount: number;
      unit: string;
    }>;
    steps: string[];
    garnish?: string;
    flavorProfile: {
      primaryFlavors: string[];
      description: string;
    };
    alternatives?: Array<{
      replace: string;
      with: string;
      reason: string;
    }>;
  };
  insights: {
    balanceAnalysis: string;
    tipsForImprovement?: string;
  };
}
```

---

## 9. 三階段部署路徑

### Phase 1：Web MVP（當前）

| 週次 | 里程碑 | 交付物 |
|---|---|---|
| W1-2 | 材料資料庫 + 引擎基礎 | ingredients.json、balance_model.py |
| W3-4 | 配方生成 API | /engine/generate、FastAPI 服務 |
| W5-6 | 前端框架 + 設計系統 | Next.js 骨架、Tailwind 色彩 |
| W7-8 | 調酒學院 Phase 1 | 20 篇文章、3 模組 MDX |
| W9-10 | 整合 + 部署 | Vercel + Railway 上線 |

### Phase 2：社群功能（3-6 個月後）

- Supabase Auth 使用者系統
- 個人酒吧（My Bar）庫存管理
- 收藏與筆記功能
- **RAG 知識庫升級**：pgvector + Embedding 模型
- 社群配方分享 + 評分

### Phase 3：Mobile & PWA（6-12 個月後）

- PWA 完整支援（離線快取）
- React Native App（iOS + Android）
- 相機掃描瓶標（OCR + 材料識別）
- 語音助手查詢

---

## 10. 效能與安全性

### 10.1 效能目標

| 指標 | 目標 |
|---|---|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| API 回應（引擎） | < 500ms P95 |
| API 回應（列表） | < 200ms P95 |
| 首頁 Bundle | < 150KB gzipped |

### 10.2 安全性規範

- Rate Limiting：100 req/min（通用）/ 10 req/min（引擎端點）
- 輸入驗證：ingredient slug 白名單驗證
- CORS：僅允許白名單 Origin
- SQL Injection：全面使用 SQLAlchemy ORM
- 環境變數：敏感資料不進版本控制

---

## 11. 建議功能清單（高潛力）

| 功能 | 描述 | 商業潛力 | 技術難度 |
|---|---|---|---|
| 🧪 AI 風味教練 | 個人化口味學習推薦 | ⭐⭐⭐⭐⭐ | 高 |
| 📸 瓶標掃描 | 拍照識別 → 自動加庫存 | ⭐⭐⭐⭐ | 高 |
| 🍽️ 餐酒搭配引擎 | 菜餚 → 配對調酒推薦 | ⭐⭐⭐⭐ | 中 |
| 🎮 配方挑戰賽 | 限時材料競賽模式 | ⭐⭐⭐⭐ | 中 |
| 📊 酒吧庫存管理 | 消耗追蹤 + 成本計算 | ⭐⭐⭐⭐ | 中 |
| 🌍 季節 & 地域引擎 | 當地當季材料推薦 | ⭐⭐⭐ | 低 |
| 🔬 化學成分資料庫 | GC-MS 真實化學資料整合 | ⭐⭐⭐⭐⭐ | 極高 |
| 🎬 AR 手法教學 | 擴增實境調製指導 | ⭐⭐⭐⭐ | 高 |

---

## 12. 附錄

### 術語對照表

| 中文 | English | 說明 |
|---|---|---|
| 基酒 | Base Spirit | 主要酒精成分 |
| 酸甜比 | Sour-Sweet Ratio | 酸味與甜味的比例 |
| 風味輪 | Flavor Wheel | 香氣/風味組織圓形圖 |
| 苦精 | Bitters | 高濃縮苦味調味劑 |
| 簽名調酒 | Signature Cocktail | 個人創作配方 |
| 稀釋 | Dilution | 冰塊融水的濃度降低 |
| 浸漬酒 | Infused Liquor | 香料/水果浸泡提取風味 |
| 泡沫 | Foam / Espuma | 蛋白/卵磷脂頂部裝飾 |
| 風土 | Terroir | 土壤氣候對風味的影響 |

### 參考文獻

- *The Bar Book* — Jeffrey Morgenthaler
- *Liquid Intelligence* — Dave Arnold
- *The Flavor Bible* — Karen Page & Andrew Dornenburg
- *Wine Folly: The Essential Guide to Wine*
- IBA (International Bartenders Association) Official Cocktail List
- WSET Level 3 Curriculum

---
*Blueprint v1.0.0-alpha — 隨開發進程持續更新*
