'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────────────────
   Sommelier & Wine Service — 侍酒與服務
   ────────────────────────────────────────────────────────── */

type TabKey = 'service' | 'pairing' | 'glassware' | 'menu' | 'certification'

const tabs: { key: TabKey; zh: string; en: string }[] = [
  { key: 'service',       zh: '侍酒基礎', en: 'Service' },
  { key: 'pairing',       zh: '餐酒搭配', en: 'Pairing' },
  { key: 'glassware',     zh: '杯型選擇', en: 'Glassware' },
  { key: 'menu',          zh: '酒單設計', en: 'Menu Design' },
  { key: 'certification', zh: '認證體系', en: 'Certifications' },
]

/* ── 侍酒基礎 ───────────────────────────────────────────── */
function ServiceContent() {
  const servingTemps = [
    { type: '超甜酒 / 氣泡酒', en: 'Dessert Wine / Sparkling', temp: '6–8°C', note: '冷凍桶 20 分鐘或冰箱 3 小時' },
    { type: '輕盈白酒 / 粉紅酒', en: 'Light White / Rosé', temp: '8–10°C', note: '冰箱取出後靜置 5 分鐘' },
    { type: '飽滿白酒', en: 'Full-bodied White', temp: '10–13°C', note: '布根地 Chardonnay、Viognier' },
    { type: '輕盈紅酒', en: 'Light Red', temp: '13–15°C', note: 'Beaujolais、輕盈 Pinot Noir' },
    { type: '中等紅酒', en: 'Medium Red', temp: '15–17°C', note: 'Chianti、Tempranillo、Merlot' },
    { type: '飽滿紅酒', en: 'Full-bodied Red', temp: '17–19°C', note: 'Cabernet Sauvignon、Barolo、Syrah' },
    { type: '加烈酒', en: 'Fortified Wine', temp: '12–16°C', note: 'Fino Sherry 冷飲、Vintage Port 室溫' },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-display text-xl text-text-warm mb-2">
          開瓶技巧
          <span className="font-mono text-xs text-charcoal-500 ml-2">Opening Techniques</span>
        </h3>
        <div className="space-y-4 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">靜態葡萄酒 Still Wine</span>
            <p className="leading-relaxed">使用侍酒刀（Waiter&apos;s Corkscrew / Sommelier Knife）是專業標準。步驟：（1）以刀片沿瓶口下緣（Second Lip）劃割鋁箔/蠟封，避免酒液接觸金屬；（2）對準軟木塞中心旋入螺旋錐（Worm），旋至倒數第一圈——完全旋入可能穿透軟木塞導致碎屑落入酒中；（3）將支點卡在瓶口邊緣，以槓桿原理緩慢、垂直地拔出軟木塞；（4）最後 1 公分以手指輔助旋出，避免「啵」的聲響（在正式場合發出聲響被視為不專業）。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">氣泡酒 / 香檳 Sparkling Wine</span>
            <p className="leading-relaxed">瓶內壓力約 5–6 大氣壓（相當於卡車輪胎），錯誤操作可能造成危險。步驟：（1）保持酒瓶冰涼（溫度越低壓力越穩定）；（2）拆除鋁箔後，一手始終按住鐵絲網籠（Muselet）與瓶塞，鬆開鐵絲但不要移開；（3）一手握住瓶塞，另一手緩慢旋轉瓶底（而非瓶塞）；（4）讓瓶塞在壓力下緩緩滑出，理想的聲音是低沉的嘆息聲（sigh），而非「砰」的巨響——後者被稱為「浪費了一杯香檳」。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">老年份酒 Aged Wine</span>
            <p className="leading-relaxed">20 年以上的老酒，軟木塞可能已經脆化。建議使用 Ah-So 雙片式開瓶器（Butler&apos;s Friend）——兩片薄鐵片沿瓶塞兩側插入，旋轉拔出，避免螺旋錐穿破脆弱的軟木塞。Durand 開瓶器結合了 Ah-So 與傳統螺旋錐，是處理老酒的終極工具（但價格不菲）。如果軟木塞已完全碎裂，可使用 Port Tongs（波特鉗）——加熱鉗子夾住瓶頸，再以冰布冷卻，利用熱脹冷縮使瓶頸整齊斷裂。</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-xl text-text-warm mb-2">
          醒酒 Decanting
          <span className="font-mono text-xs text-charcoal-500 ml-2">When & How</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">醒酒的目的</span>
            <p className="leading-relaxed">（1）分離沉澱物（老年份紅酒在瓶中形成的單寧/色素結晶沉澱）；（2）增加氧氣接觸，讓還原性氣味（硫化物、火柴味）散去；（3）讓封閉的香氣打開——年輕的高品質紅酒常需要數小時的氧氣接觸才能展現完整風味。注意：並非所有酒都需要醒酒。白酒和老酒通常不需要（老酒過度氧化可能在數分鐘內瓦解）。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">醒酒時間建議</span>
            <p className="leading-relaxed">年輕飽滿的 Cabernet/Syrah：1–2 小時。頂級波爾多（5–15 年）：30–60 分鐘。老年份紅酒（20+ 年）：不醒酒或僅倒入 Decanter 去除沉澱後立即飲用。Barolo：可醒酒 2–4 小時（甚至更久）。經驗法則：酒越年輕、越濃郁，需要的醒酒時間越長。</p>
          </div>
        </div>
      </div>

      {/* 適飲溫度表 */}
      <div className="glass-card p-6">
        <h3 className="font-display text-xl text-text-warm mb-3">
          適飲溫度速查表
          <span className="font-mono text-xs text-charcoal-500 ml-2">Serving Temperature Guide</span>
        </h3>
        <div className="space-y-2">
          {servingTemps.map((t) => (
            <div key={t.type} className="flex items-center gap-4 p-3 bg-bg-tertiary border border-charcoal-700 hover:border-neon-amber transition-colors duration-300">
              <span className="font-mono text-neon-cyan font-bold text-sm w-16 flex-shrink-0">{t.temp}</span>
              <div className="flex-1">
                <span className="text-text-warm text-sm">{t.type}</span>
                <span className="font-mono text-xs text-charcoal-500 ml-2">{t.en}</span>
              </div>
              <span className="font-mono text-xs text-charcoal-500 hidden md:block">{t.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 餐酒搭配 ───────────────────────────────────────────── */
function PairingContent() {
  const principles = [
    { name: '平衡 Balance', desc: '酒的「重量」應與食物的「重量」匹配。輕盈的料理配輕盈的酒（生魚片 × Chablis），濃郁的料理配飽滿的酒（碳烤肋眼 × Cabernet Sauvignon）。如果酒比食物重，酒會壓過料理；反之食物會掩蓋酒的風味。' },
    { name: '對比 Contrast', desc: '利用對比創造驚喜——酸的酒切割油脂（香檳 × 炸物）、甜的酒平衡辣味（Riesling × 泰式咖哩）、單寧的紅酒搭配高蛋白食物（Barolo × 松露牛排，蛋白質軟化單寧的澀感）。' },
    { name: '橋接 Bridge', desc: '找到酒與食物之間的「共同元素」作為橋梁。帶有蘑菇泥土調的 Pinot Noir 搭配松露料理（共同的泥土風味）；帶有柑橘調的 Sauvignon Blanc 搭配柑橘醬汁的海鮮（柑橘是橋梁）。' },
  ]

  const asianPairings = [
    { cuisine: '日本料理', wine: '清酒（最佳！）· Chablis · Champagne · 輕盈 Pinot Noir', tip: '壽司與生魚片的精緻風味需要高酸、低單寧的搭配。清酒是最自然的選擇——旨味配旨味。香檳的酸度與氣泡能清潔味蕾，準備迎接下一片壽司。' },
    { cuisine: '中式料理（粵菜）', wine: 'Riesling · Gewürztraminer · Rosé · Grüner Veltliner', tip: '粵菜的調味相對清淡但技法精細。德國/亞爾薩斯的白酒提供足夠的果味而不搶風味。港式點心的豐富油脂需要酸度來平衡。' },
    { cuisine: '川菜/湘菜', wine: '半甜 Riesling · Moscato d\'Asti · 冰啤酒', tip: '辣味料理絕對要避免高酒精度與高單寧——酒精會加劇辣感。帶殘糖的微甜酒可有效「冷卻」辣味。如果堅持喝紅酒，選果味奔放、單寧低的 Beaujolais。' },
    { cuisine: '泰式料理', wine: 'Sauvignon Blanc · Off-dry Riesling · Torrontés', tip: '泰菜的「酸甜辣鹹」四味並存需要高酸、果香豐沛的白酒。紐西蘭的 Sauvignon Blanc 百香果風味與泰式酸辣有奇妙的呼應。' },
    { cuisine: '韓式烤肉', wine: 'Malbec · GSM 混釀（Grenache-Syrah-Mourvèdre）· Zinfandel', tip: '炭烤的焦香與醃漬的鹹甜需要同樣有力量的紅酒。阿根廷 Malbec 的煙燻與柔順果味是絕配。有趣的替代方案：韓國燒酒（Soju）混清酒的「炸彈酒」。' },
    { cuisine: '印度咖哩', wine: 'Gewürztraminer · Viognier · Off-dry Chenin Blanc', tip: '咖哩的複合香料需要同樣「濃郁」的白酒。Gewürztraminer 的荔枝與辛香料調性與北印度咖哩完美契合。避免橡木桶白酒——木桶香與香料衝突。' },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-xl text-text-warm mb-3">
          搭配三原則
          <span className="font-mono text-xs text-charcoal-500 ml-2">3 Principles</span>
        </h3>
        <div className="space-y-4">
          {principles.map((p) => (
            <div key={p.name}>
              <h4 className="text-neon-amber font-medium text-sm mb-1">{p.name}</h4>
              <p className="text-text-secondary text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl text-text-warm mb-4">
          亞洲料理搭配指南
          <span className="font-mono text-xs text-charcoal-500 ml-2">Asian Cuisine Pairing</span>
        </h3>
        <div className="space-y-4">
          {asianPairings.map((ap) => (
            <div key={ap.cuisine} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
              <h4 className="font-display text-lg text-text-warm mb-2">{ap.cuisine}</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {ap.wine.split(' · ').map((w) => (
                  <span key={w} className="font-mono text-xs px-2.5 py-1 bg-bg-tertiary border border-charcoal-700 text-neon-amber">
                    {w}
                  </span>
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{ap.tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 border-neon-amber-glow">
        <p className="font-mono text-xs text-neon-amber mb-1">黃金法則 Golden Rule</p>
        <p className="text-text-secondary text-sm leading-relaxed">
          如果你不確定配什麼——選氣泡酒或 Rosé。香檳/Cava/Prosecco 的高酸度與氣泡幾乎可以搭配所有料理。
          Rosé 同時具備紅酒的結構與白酒的清爽，是最萬能的「安全選擇」。
          另一個黃金法則：「地酒配地菜」——當地的酒通常與當地的料理有數百年的共同演化。
        </p>
      </div>
    </div>
  )
}

/* ── 杯型選擇 ───────────────────────────────────────────── */
function GlasswareContent() {
  const glasses = [
    { name: '波爾多杯', en: 'Bordeaux Glass', height: '高挺', bowl: '中等偏大', best: 'Cabernet Sauvignon · Merlot · 飽滿紅酒', reason: '較高的杯身引導酒液流向舌面後方，突顯果味並柔化單寧。適度的杯口寬度讓濃郁的香氣有足夠空間展開而不至於過於集中。' },
    { name: '布根地杯', en: 'Burgundy Glass', height: '寬矮', bowl: '大球型', best: 'Pinot Noir · Nebbiolo · 精緻紅酒', reason: '巨大的球型杯腹提供最大的液面面積，讓 Pinot Noir 細膩的花香與果香充分展開。寬口設計讓飲者的鼻子幾乎進入杯中，提供身歷其境的嗅覺體驗。杯沿引導酒液流向舌尖，先感受到果味與酸度。' },
    { name: '通用紅酒杯', en: 'Universal Glass', height: '中等', bowl: '中等', best: '所有紅酒 · 通用場合', reason: '設計介於波爾多杯與布根地杯之間，是最萬用的選擇。如果只能擁有一款紅酒杯，選它。Gabriel-Glas StandArt 和 Zalto Universal 是兩個備受推崇的通用杯品牌。' },
    { name: '白酒杯', en: 'White Wine Glass', height: '中等', bowl: '較小', best: '所有白酒 · Rosé', reason: '較小的杯身減少酒液與空氣的接觸面積，保持白酒的清新度與低溫。窄口集中精緻的花果香氣。較小的容量也鼓勵「少量多添」的飲用方式，讓每一口都保持在最佳溫度。' },
    { name: '笛型杯', en: 'Champagne Flute', height: '高窄', bowl: '極小', best: '香檳 · 傳統法氣泡酒', reason: '窄長的杯身讓氣泡以一列列的「珍珠鏈」形式優雅上升，維持碳酸的持久度。但也因為液面面積小，香氣的展現有限。頂級香檳愛好者正在轉向使用鬱金香杯型（Tulip）或甚至白酒杯來品飲香檳，以獲得更完整的香氣體驗。' },
    { name: '碟型杯', en: 'Coupe', height: '矮寬', bowl: '淺碟型', best: '雞尾酒 · 復古風格飲品', reason: '傳說是依據瑪麗・安東尼皇后的胸部形狀製作（雖然這很可能是傳說）。寬淺的杯型讓碳酸快速逸散，因此已不被推薦用於品飲香檳。但在調酒文化中復興，成為 Manhattan、Sidecar 等經典雞尾酒的標誌性杯型。' },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-lg text-text-warm mb-2">
          杯型為什麼重要？
          <span className="font-mono text-xs text-charcoal-500 ml-2">Why Glass Shape Matters</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          酒杯的形狀透過三個機制影響品飲體驗：（1）杯腹容積決定酒液與空氣的接觸面積→影響香氣的揮發速度與氧化程度；
          （2）杯口直徑與形狀決定香氣分子的聚集方式→影響你嗅到的風味強度與類型；
          （3）杯沿的弧度引導酒液流向舌面的不同區域→影響甜度、酸度、苦味的感知順序。
          RIEDEL 創始人 Claus Riedel 在 1950 年代首次以科學實驗證明了杯型對品酒體驗的顯著影響。
        </p>
      </div>

      <div className="space-y-4">
        {glasses.map((g) => (
          <div key={g.en} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h4 className="font-display text-lg text-text-warm">{g.name}</h4>
              <span className="font-mono text-sm text-neon-amber">{g.en}</span>
              <span className="font-mono text-xs text-charcoal-500 border border-charcoal-700 px-2 py-0.5">
                杯身 {g.height} · 杯腹 {g.bowl}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {g.best.split(' · ').map((b) => (
                <span key={b} className="font-mono text-xs px-2 py-0.5 bg-bg-tertiary border border-charcoal-700 text-text-secondary">
                  {b}
                </span>
              ))}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{g.reason}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-2">
          杯具保養
          <span className="font-mono text-xs text-charcoal-500 ml-2">Glassware Care</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          高品質水晶酒杯需要適當的保養：（1）手洗為佳——洗碗機的高溫與洗劑可能損壞水晶表面的細微紋理；
          （2）使用溫水與少量中性洗劑，避免含柑橘或研磨成分的清潔劑；（3）自然風乾或以無毛屑的超細纖維布擦拭——
          棉質布料可能留下纖維在杯壁上；（4）存放時杯口朝上，避免杯沿承受壓力而破裂；
          （5）使用前以熱水沖洗去除灰塵與儲存時吸附的異味，再以品飲的酒「潤杯」（Rinse）。
        </p>
      </div>
    </div>
  )
}

/* ── 酒單設計 ───────────────────────────────────────────── */
function MenuContent() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-display text-xl text-text-warm mb-2">
          專業酒單結構
          <span className="font-mono text-xs text-charcoal-500 ml-2">Wine List Architecture</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          一份好的酒單不僅是價目表——它是餐廳哲學的延伸、是侍酒師品味的展現、更是引導客人探索的地圖。
        </p>
        <div className="space-y-4 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">按類型組織 Organization by Style</span>
            <p className="leading-relaxed">最常見的結構：氣泡酒 → 白酒 → 粉紅酒 → 紅酒 → 甜酒 → 加烈酒。每個類型內再按產區或品種細分。價格從低到高排列，或刻意打亂（讓客人不會只加點最便宜的）。每頁的「最佳位置」是右上角和中間——將高毛利酒款放在這些位置。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">按風格組織 Organization by Character</span>
            <p className="leading-relaxed">新潮趨勢：用直觀的風格描述取代傳統的品種/產區分類。例如：「清爽而輕盈 Light & Crisp」→「芳醇而豐腴 Rich & Aromatic」→「濃郁而強勁 Bold & Powerful」。這種方法對不熟悉葡萄酒術語的客人更為友善，降低了點酒的焦慮感。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">杯賣酒計劃 By-the-Glass Program</span>
            <p className="leading-relaxed">提供 8–15 款杯賣酒是現代餐廳的標準。杯賣酒的選擇應覆蓋不同價格帶、不同風格，讓客人在整個用餐過程中可以隨菜換酒。Coravin 系統（使用惰性氣體通過針頭取酒而不拔
塞）讓高價位酒款的杯賣成為可能。杯賣的標準定價公式：一杯的售價 ≈ 整瓶成本價（確保賣出 1 杯就回本，剩餘杯數為純利潤）。</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-3">
          標價策略
          <span className="font-mono text-xs text-charcoal-500 ml-2">Pricing Strategy</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h4 className="text-text-warm font-medium mb-2">固定加成法 Fixed Markup</h4>
            <p className="leading-relaxed">所有酒款統一加成 2.5–3 倍（成本 × 2.5–3 = 售價）。優點是簡單一致；缺點是高價酒的加成金額過高（一支成本 $100 的酒售價 $300，等於加了 $200），可能嚇跑客人。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h4 className="text-text-warm font-medium mb-2">漸進加成法 Progressive Markup</h4>
            <p className="leading-relaxed">更聰明的策略：低價酒用較高倍率（3–4 倍）、高價酒用較低倍率（1.5–2 倍）。這使得高價酒對客人更有吸引力，也鼓勵客人「升級」嘗試更好的酒款。頂級餐廳都使用此策略。</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-3">
          數位酒單趨勢
          <span className="font-mono text-xs text-charcoal-500 ml-2">Digital Wine List Trends</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          COVID-19 加速了 QR Code 數位酒單的普及。優質的數位酒單應提供：即時庫存更新（避免點了才告知售罄的尷尬）、
          互動式過濾器（按品種、價格、風格篩選）、品酒筆記與搭配建議、多語言支持、
          以及與 POS 系統的整合。Vinoflow、ENNO 和 BerryOS 是領先的餐廳數位酒單平台。
          但注意——實體酒單在高端餐廳仍有不可取代的「儀式感」，最佳策略是兩者並行。
        </p>
      </div>
    </div>
  )
}

/* ── 認證體系 ───────────────────────────────────────────── */
function CertificationContent() {
  const certs = [
    {
      name: 'WSET',
      full: 'Wine & Spirit Education Trust',
      origin: '英國倫敦',
      levels: [
        { level: 'Level 1', desc: '入門級。認識主要葡萄品種、酒類類型與基礎品酒技巧。約 6 小時課程 + 筆試。通過率 > 95%。' },
        { level: 'Level 2', desc: '中階。深入學習主要葡萄品種、產區、烈酒基礎。約 28 小時 + 筆試。含品酒實作。通過率約 80%。' },
        { level: 'Level 3', desc: '進階。系統性學習全球產區、釀造技術、品酒評分。約 84 小時 + 筆試 + 盲品考試。通過率約 55–65%。取得此級別可在名片上標示「WSET 3」。' },
        { level: 'Diploma (Level 4)', desc: '專家級。等同於大學學位的深度。6 個單元（含烈酒與起泡酒專題），為期 18–24 個月。通過率 < 30%。取得 Diploma 後可申請進入 Master of Wine 課程。' },
      ],
      note: '全球最廣泛認可的酒類教育體系。台灣、香港、新加坡、日本等亞洲地區均有授課中心。',
    },
    {
      name: 'CMS',
      full: 'Court of Master Sommeliers',
      origin: '英國',
      levels: [
        { level: 'Introductory', desc: '入門課程 + 筆試。2 天密集課程。相當於 WSET Level 1–2 的侍酒服務版本。' },
        { level: 'Certified', desc: '筆試 + 服務考試 + 盲品（25 分鐘內盲品 2 款酒）。側重實務服務能力。' },
        { level: 'Advanced', desc: '筆試 + 服務考試 + 盲品（6 款酒，25 分鐘）。通過率約 25%。取得後即被認為是業界頂尖侍酒師。' },
        { level: 'Master Sommelier', desc: '全球僅約 270 人持有此頭銜（有史以來）。3 天考試：理論 + 服務 + 盲品（6 款酒需精確辨識品種/產區/年份）。通過率約 3–10%。這是侍酒界的「珠穆朗瑪峰」。' },
      ],
      note: '側重「服務」面向——不僅要懂酒，更要在壓力下展現完美的侍酒禮儀與溝通能力。',
    },
    {
      name: 'SSA',
      full: 'Sake Sommelier Association / SSI (Sake Service Institute)',
      origin: '日本',
      levels: [
        { level: '唎酒師 Kikisake-shi', desc: '日本酒（清酒）專業資格。學習清酒的釀造、分類、品飲與服務。日本國內約 40,000 人取得此資格。英文版本在倫敦、紐約、香港等地也有開課。' },
        { level: 'SAKE DIPLOMA', desc: 'WSET 旗下的清酒專業認證。系統性學習日本酒的一切，含嚴格的盲品考試。是國際市場上最受認可的清酒專業資格。' },
        { level: '酒匠 Sakasho', desc: '唎酒師之上的進階資格，等同於清酒界的 Master Sommelier。需具備極深的感官辨識能力與專業知識。' },
      ],
      note: '隨著日本酒在全球市場的影響力增加，清酒認證的國際需求正在快速成長。',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <p className="text-text-secondary text-sm leading-relaxed">
          葡萄酒與烈酒認證是進入專業領域的入場券。不同認證體系側重不同面向——WSET 偏重知識與品鑑能力，
          CMS 偏重服務與實務，SSA/SSI 聚焦日本酒專業。選擇哪個體系取決於你的職業目標：
          如果你想做國際酒商/買手，WSET 最有價值；如果你想成為頂級餐廳侍酒師，CMS 是金字招牌。
        </p>
      </div>

      {certs.map((c) => (
        <div key={c.name} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
          <h3 className="font-display text-xl text-text-warm mb-0.5">{c.name}</h3>
          <p className="font-mono text-sm text-neon-amber tracking-wider mb-1">{c.full}</p>
          <p className="font-mono text-xs text-charcoal-500 mb-4">📍 {c.origin}</p>
          <div className="space-y-3 mb-4">
            {c.levels.map((l) => (
              <div key={l.level} className="flex gap-3 text-sm">
                <span className="font-mono text-neon-amber flex-shrink-0 w-28">{l.level}</span>
                <p className="text-text-secondary leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-xs text-charcoal-500 leading-relaxed">📝 {c.note}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Content Map & Page ─────────────────────────────────── */
const contentMap: Record<TabKey, () => React.JSX.Element> = {
  service: ServiceContent,
  pairing: PairingContent,
  glassware: GlasswareContent,
  menu: MenuContent,
  certification: CertificationContent,
}

export default function SommelierPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('service')
  const Content = contentMap[activeTab]

  return (
    <main className="min-h-screen bg-bg-primary">
      <section className="px-6 pt-20 pb-8 max-w-6xl mx-auto">
        <Link href="/academy" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors">
          ← 返回學院
        </Link>
        <div className="mt-8">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">Sommelier & Wine Service</p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">侍酒與服務</h1>
          <p className="text-text-secondary max-w-3xl">
            從開瓶的優雅到餐酒搭配的智慧——成為一位專業侍酒師的完整知識體系。
          </p>
        </div>
      </section>

      <section className="px-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-1 border-b border-charcoal-700 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 font-sans text-sm transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.key ? 'border-neon-amber text-neon-amber' : 'border-transparent text-charcoal-500 hover:text-text-secondary'
              }`}
            >
              {tab.zh}
              <span className="font-mono text-xs ml-1.5 opacity-60">{tab.en}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-6xl mx-auto animate-fade-in" key={activeTab}>
        <Content />
      </section>
    </main>
  )
}
