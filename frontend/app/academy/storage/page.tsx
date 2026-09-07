'use client'

import { useState } from 'react'
import Link from 'next/link'
import AcademyTracker from '../../../components/AcademyTracker'

/* ──────────────────────────────────────────────────────────
   Preservation & Storage — 保存與儲藏
   ────────────────────────────────────────────────────────── */

type TabKey = 'environment' | 'opened' | 'spirits' | 'aging'

const tabs: { key: TabKey; zh: string; en: string }[] = [
  { key: 'environment', zh: '儲藏環境', en: 'Storage' },
  { key: 'opened',      zh: '開瓶後保存', en: 'After Opening' },
  { key: 'spirits',     zh: '烈酒保存', en: 'Spirits' },
  { key: 'aging',       zh: '陳年潛力', en: 'Aging Potential' },
]

/* ── 儲藏環境 ───────────────────────────────────────────── */
function EnvironmentContent() {
  const factors = [
    {
      name: '溫度 Temperature',
      icon: '🌡️',
      ideal: '12–15°C',
      impact: '溫度是影響酒類保存最關鍵的因素。高溫加速化學反應，導致酒液過早老化——每升高 10°C，化學反應速率約增加 2 倍（Arrhenius 方程式）。反覆的溫度波動更為致命——導致軟木塞反覆膨脹收縮，破壞密封性，讓空氣進入瓶中加速氧化。理想的存酒環境溫度穩定在 12–15°C，波動不超過 ±2°C/年。偶爾的短期高溫（如搬運過程）影響有限，但長期暴露在 25°C 以上的環境會嚴重損害酒質。',
    },
    {
      name: '濕度 Humidity',
      icon: '💧',
      ideal: '60–70%',
      impact: '濕度主要影響軟木塞的狀態。過低（<50%）會使軟木塞乾縮，失去彈性，空氣滲入導致氧化。過高（>80%）則可能滋生黴菌，損壞酒標（影響收藏價值但不影響酒本身）。60–70% 是理想範圍。如果使用螺旋蓋封裝的酒款，濕度則不是問題。專業酒窖通常使用加濕器或一盆水來維持穩定的濕度。',
    },
    {
      name: '光線 Light',
      icon: '☀️',
      ideal: '完全避光',
      impact: '紫外線是葡萄酒的大敵——它會引發光氧化反應（Lightstrike/Goût de Lumière），分解酒中的核黃素（Riboflavin）與甲硫氨酸（Methionine），產生類似濕羊毛、煮熟甘藍菜的不愉快氣味。白酒與氣泡酒尤其脆弱（這也是為什麼香檳通常使用深色瓶）。直射日光僅需數小時就可能造成不可逆的損害。LED 燈比日光燈更安全，但仍建議存酒區域盡量保持黑暗。',
    },
    {
      name: '震動 Vibration',
      icon: '〰️',
      ideal: '完全靜止',
      impact: '震動會攪動酒中的沉澱物，干擾陳年過程中的緩慢化學反應。長期震動（如冰箱壓縮機的持續振動）可能加速酒液的老化。專業酒窖遠離馬路、避免建在有地鐵通過的地基上。家用酒櫃應選擇使用變頻壓縮機或半導體制冷的款式，震動更小。實際上，對於準備在數年內飲用的酒款，震動的影響有限。',
    },
    {
      name: '擺放方式 Position',
      icon: '📐',
      ideal: '橫放（軟木塞）/ 直立（螺旋蓋）',
      impact: '軟木塞封裝的酒應橫放——讓酒液持續接觸軟木塞保持其濕潤膨脹，維持密封性。如果直立存放過久（數月以上），軟木塞可能乾縮導致漏氣。螺旋蓋封裝則無此限制，直立或橫放皆可。清酒、啤酒、烈酒一律直立存放。有趣的是：近年研究指出，橫放存酒的必要性可能被高估了——因為瓶內頂部空間的水蒸氣已足夠保持軟木塞的濕度。但保守起見，橫放仍是最安全的選擇。',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h2 className="font-display text-lg text-text-warm mb-2">
          五大關鍵因素
          <span className="font-mono text-xs text-charcoal-500 ml-2">5 Critical Factors</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          正確的儲存不會讓平庸的酒變好，但錯誤的儲存一定會讓好酒報廢。
          以下五個因素構成了酒類保存的基礎。
        </p>
      </div>

      {factors.map((f) => (
        <div key={f.name} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{f.icon}</span>
            <div>
              <h3 className="font-display text-lg text-text-warm">{f.name}</h3>
              <span className="font-mono text-xs text-neon-cyan">理想值：{f.ideal}</span>
            </div>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">{f.impact}</p>
        </div>
      ))}

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          專業酒窖 vs 酒櫃
          <span className="font-mono text-xs text-charcoal-500 ml-2">Cellar vs Wine Cooler</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-2">專業地下酒窖 Professional Cellar</h3>
            <p className="leading-relaxed">理想的天然地下酒窖溫度全年穩定在 10–14°C，濕度 70–80%，完全避光與靜止。這是千百年來歐洲酒莊儲酒的方式。建造成本高但一勞永逸。適合收藏 100+ 瓶且有長期陳年計劃的藏家。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-2">恆溫酒櫃 Wine Cooler</h3>
            <p className="leading-relaxed">現代的替代方案。選購要點：變頻壓縮機（減少震動與噪音）、雙溫區設計（上層白酒 8–12°C / 下層紅酒 14–18°C）、UV 濾光玻璃門、獨立濕度控制。EuroCave、Liebherr、Sub-Zero 是公認的頂級品牌。20–50 瓶容量適合家用。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 開瓶後保存 ─────────────────────────────────────────── */
function OpenedContent() {
  const shelfLife = [
    { type: '氣泡酒 Sparkling', days: '1–2 天', tool: '香檳塞', tip: '一旦開瓶，碳酸會持續逸散。專用香檳塞（Champagne Stopper）可以將壽命延長至 2–3 天。沒有塞子？用保鮮膜包住瓶口再用橡皮筋固定——是應急但有效的方法。' },
    { type: '輕盈白酒 / 粉紅酒', days: '3–5 天', tool: '真空塞 + 冰箱', tip: '冷藏保存。重新密封後立入冰箱，低溫減緩氧化速度。使用真空塞（Vacu Vin）抽出瓶內空氣可額外延長 1–2 天。注意：品飲前從冰箱取出靜置 10 分鐘回溫。' },
    { type: '飽滿白酒（橡木桶）', days: '3–5 天', tool: '真空塞 + 冰箱', tip: '經過橡木桶的白酒（如布根地 Chardonnay）比輕盈白酒稍不怕氧化，但仍建議冷藏保存。開瓶後酒液反而會在前 1–2 天展現更多複雜度。' },
    { type: '輕盈紅酒', days: '3–5 天', tool: '真空塞 + 冰暗處', tip: 'Pinot Noir 等輕酒體紅酒對氧化較敏感。重新密封後存放在陰涼處（甚至冰箱），品飲前提前 30 分鐘取出回溫。' },
    { type: '飽滿紅酒', days: '5–7 天', tool: '真空塞 + 室溫', tip: '高單寧的 Cabernet Sauvignon、Syrah 等飽滿紅酒的抗氧化能力最強。開瓶後第 2–3 天風味可能反而更好（等同於慢速醒酒）。一週後風味明顯衰退。' },
    { type: '加烈酒 Fortified', days: '1–4 週', tool: '原塞密封', tip: 'Sherry 的 Fino/Manzanilla 最脆弱（2–3 天）。Port（Tawny） 和 Madeira 可存放數週甚至數月——高糖高酒精是天然的防腐劑。PX Sherry 開瓶後可存放 2–3 個月。' },
    { type: '清酒 Sake', days: '3–7 天', tool: '冰箱密封', tip: '生酒（Namazake）最脆弱，開瓶後 2–3 天內飲畢。火入れ（殺菌）的清酒可存放一週。純米大吟釀的精緻果香會在開瓶後逐日衰退。部分濃厚的純米酒反而在開瓶第 2–3 天更好喝。' },
  ]

  const tools = [
    { name: '真空保存器 Vacu Vin', desc: '最普及的家用保存工具。將特製橡膠塞蓋在瓶口，使用手動幫浦抽出瓶內空氣，減少氧氣與酒液的接觸。缺點：無法達到完全真空，且每次開瓶後需重新抽氣。延長壽命約 2–3 天。價格親民（$10–15）。' },
    { name: '惰性氣體 Inert Gas (ArT Wine Preserver / Private Preserve)', desc: '向瓶中噴入比空氣重的食品級惰性氣體（氬氣或氮氣混合物），在酒液表面形成一層保護層隔絕氧氣。比真空塞更有效，因為它不會抽出已溶解在酒中的 CO₂。ArT Wine Preserver 是最受推崇的品牌。' },
    { name: 'Coravin 系統', desc: '革命性的取酒裝置。使用醫療級中空細針穿過軟木塞取酒，同時注入氬氣替補取出的體積。拔出針後，軟木塞的天然彈性會自動封閉針孔。這意味著你可以「品飲」一瓶酒而不「開」它——酒可以在未開瓶的狀態下保存數月甚至數年。價格較高（$200–400），但對於高價酒款的收藏家來說物超所值。' },
    { name: '小瓶分裝 Decanting to Smaller Bottles', desc: '最簡單但常被忽視的方法。將剩餘酒液倒入更小的瓶子（如 375ml 或 187ml 釘瓶），減少瓶中空氣的體積。瓶中空氣越少 = 氧化越慢。搭配真空塞效果更佳。成本幾乎為零，效果卻極為顯著。' },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h2 className="font-display text-lg text-text-warm mb-2">
          氧化——開瓶後的倒計時
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          開瓶的那一刻，空氣中的氧氣開始與酒液進行不可逆的化學反應。適量的氧化是正面的（這就是「醒酒」的原理），
          但過度氧化會讓果味消失、出現醋酸味與平淡的口感。以下是各類酒開瓶後的保存建議。
        </p>
      </div>

      <div className="space-y-3">
        {shelfLife.map((s) => (
          <div key={s.type} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-text-warm font-medium">{s.type}</h3>
              <span className="font-mono text-xs text-neon-cyan border border-neon-cyan/30 px-2 py-0.5">
                {s.days}
              </span>
              <span className="font-mono text-xs text-charcoal-500">{s.tool}</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{s.tip}</p>
          </div>
        ))}
      </div>

      <div className="divider-amber" />
      <h2 className="font-display text-xl text-text-warm mb-4 mt-8">
        保存工具指南
        <span className="font-mono text-xs text-charcoal-500 ml-2">Preservation Tools</span>
      </h2>
      <div className="space-y-4">
        {tools.map((t) => (
          <div key={t.name} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
            <h3 className="font-display text-lg text-text-warm mb-2">{t.name}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 烈酒保存 ───────────────────────────────────────────── */
function SpiritsContent() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-text-warm mb-2">
          烈酒不會壞——這是真的嗎？
          <span className="font-mono text-xs text-charcoal-500 ml-2">Do Spirits Go Bad?</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          高酒精度（40%+ ABV）的烈酒不會像葡萄酒那樣「變質」或「過期」——酒精本身是天然的防腐劑，
          阻止了微生物的生長。但這不代表烈酒在開瓶後「永遠不變」。開瓶後的烈酒會緩慢氧化，
          導致風味的微妙變化——某些香氣分子揮發消失、酯類分解、顏色可能略微加深。
          這個變化比葡萄酒慢得多（月計 vs 日計），但對於高品質的單一麥芽威士忌或陳年干邑，
          長期的風味衰退是可察覺的。
        </p>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          液面高度與氧化速度
          <span className="font-mono text-xs text-charcoal-500 ml-2">Fill Level & Oxidation Rate</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          瓶中液面越低 = 瓶中空氣越多 = 氧化速度越快。這是一個非線性的加速過程——
          最後四分之一瓶的氧化速度遠快於第一個四分之一。
        </p>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-bg-tertiary border border-green-400/30">
            <div className="font-mono text-sm text-green-400 font-bold">100–75%</div>
            <div className="text-text-secondary text-xs mt-1">安全區</div>
            <div className="font-mono text-[10px] text-charcoal-500 mt-0.5">可存放 1–2 年</div>
          </div>
          <div className="p-3 bg-bg-tertiary border border-neon-amber/30">
            <div className="font-mono text-sm text-neon-amber font-bold">75–50%</div>
            <div className="text-text-secondary text-xs mt-1">注意區</div>
            <div className="font-mono text-[10px] text-charcoal-500 mt-0.5">建議 6–12 個月內飲畢</div>
          </div>
          <div className="p-3 bg-bg-tertiary border border-red-400/30">
            <div className="font-mono text-sm text-red-400 font-bold">50–25%</div>
            <div className="text-text-secondary text-xs mt-1">警告區</div>
            <div className="font-mono text-[10px] text-charcoal-500 mt-0.5">盡快飲畢或分裝</div>
          </div>
          <div className="p-3 bg-bg-tertiary border border-red-600/30">
            <div className="font-mono text-sm text-red-600 font-bold">&lt; 25%</div>
            <div className="text-text-secondary text-xs mt-1">危險區</div>
            <div className="font-mono text-[10px] text-charcoal-500 mt-0.5">風味顯著衰退</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          各類烈酒保存建議
          <span className="font-mono text-xs text-charcoal-500 ml-2">By Category</span>
        </h2>
        <div className="space-y-4 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">威士忌 Whisky</span>
            <p className="leading-relaxed">未開瓶可保存數十年（直立存放，避免酒精腐蝕軟木塞）。開瓶後最佳賞味期約 1–2 年（液面高於 50%）。高泥煤與高酒精度的酒款相對更耐存。將珍稀酒款的剩餘量分裝至小瓶是最佳做法。注意：不要將威士忌存放在車內——高溫環境會嚴重加速氧化。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">琴酒 Gin</span>
            <p className="leading-relaxed">琴酒的植物風味（Botanicals）是最容易氧化衰退的成分。開瓶後建議 6–12 個月內飲畢。杜松子的風味會逐漸減弱，使琴酒變得「平淡」。柑橘調的琴酒（如 Hendrick&apos;s）衰退速度比經典 London Dry 更快。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">伏特加 Vodka</span>
            <p className="leading-relaxed">最耐存的烈酒類型——因為伏特加的風味本就以「中性」為追求，氧化對其影響極小。未開瓶幾乎可以無限期保存。開瓶後也可存放數年。調味伏特加（Flavored Vodka）則建議較早飲畢。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">利口酒 Liqueur</span>
            <p className="leading-relaxed">含糖量高的利口酒（Baileys、Kahlúa）最需注意。Baileys 等含乳製品的利口酒開瓶後冷藏保存，2–3 個月內飲畢。其他利口酒（如 Cointreau、Chartreuse）開瓶後可存放 1 年以上。Vermouth 嚴格來說是加烈酒——開瓶後必須冷藏，2–3 週內飲畢。</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 border-neon-amber-glow">
        <p className="font-mono text-xs text-neon-amber mb-1">專業建議</p>
        <p className="text-text-secondary text-sm leading-relaxed">
          如果你收藏超過 10 瓶已開瓶的烈酒，建議在每瓶酒上貼上開瓶日期的小標籤。
          這個簡單的習慣能幫助你追蹤每瓶酒的「生命階段」，在最佳狀態下享用它們。
          另外，將瓶口擦拭乾淨後重新密封也很重要——殘留在瓶口的酒液會乾燥結晶，
          影響密封性且可能掉入瓶中。
        </p>
      </div>
    </div>
  )
}

/* ── 陳年潛力 ───────────────────────────────────────────── */
function AgingContent() {
  const agingGuide = [
    { type: '日常白酒', examples: 'Pinot Grigio · Sauvignon Blanc (NZ) · Vinho Verde', window: '1–3 年', note: '設計為年輕飲用，果香隨時間衰退。不適合陳年。' },
    { type: '中階白酒', examples: 'Chablis · White Burgundy Village · Riesling Kabinett', window: '3–8 年', note: '好年份的 Chablis 可發展出蜂蜜與堅果風味。' },
    { type: '頂級白酒', examples: 'Meursault Premier Cru · Grand Cru Riesling · Vintage Champagne', window: '5–20+ 年', note: '頂級布根地白酒和德國 Riesling 的陳年潛力令人驚嘆。' },
    { type: '日常紅酒', examples: 'Beaujolais · Côtes du Rhône · 智利 Merlot', window: '1–5 年', note: '果味為主，適合立即享用。陳年反而會失去活力。' },
    { type: '中階紅酒', examples: 'Chianti Classico · Rioja Crianza · Oregon Pinot Noir', window: '5–10 年', note: '單寧在瓶中柔化，發展出二級、三級香氣。' },
    { type: '頂級紅酒', examples: 'Grand Cru Bordeaux · Barolo · Grand Cru Burgundy', window: '10–30+ 年', note: '需要時間整合。年輕時單寧強勁封閉，陳年後綻放出松露、皮革、濕落葉等迷人氣息。' },
    { type: '甜酒', examples: 'Sauternes · Tokaji Aszú · TBA Riesling', window: '10–50+ 年', note: '高糖高酸是天然的防腐劑。Château d\'Yquem 可以陳年超過 100 年。' },
    { type: '加烈酒', examples: 'Vintage Port · Madeira', window: '20–100+ 年', note: 'Vintage Port 需 15–20 年以上才開始適飲。Madeira 可能是世界上最長壽的酒——19 世紀的 Madeira 至今仍可飲用。' },
    { type: '威士忌（未開瓶）', examples: '所有瓶裝威士忌', window: '不限', note: '烈酒在瓶中不會繼續陳年（與葡萄酒不同）。一瓶 12 年的威士忌放 20 年仍然是 12 年——陳年只在木桶中發生。但適當保存下品質不會衰退。' },
    { type: '清酒', examples: '一般清酒', window: '出廠後 6–12 個月', note: '大部分清酒設計為年輕飲用。例外：古酒（Koshu，陳年清酒）可保存 3–10 年以上，發展出蜂蜜、堅果、醬油的深邃風味。' },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h2 className="font-display text-lg text-text-warm mb-2">
          「全球 90% 的酒適合在 5 年內飲用」
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          這是一個被廣泛引用但經常被忽視的事實。酒類產業中，只有極少數的頂級酒款擁有真正的長期陳年潛力。
          大部分酒款的最佳適飲期（Drinking Window）在出廠後 1–5 年內。「陳年越久越好」是最常見的
          葡萄酒迷思——過了適飲期的酒不會更好，反而會逐漸失去果味、結構瓦解、風味變得平淡寡味。
          正確的問題不是「這瓶酒能放多久」，而是「什麼時候喝這瓶酒最好」。
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl text-text-warm mb-4">
          適飲窗口速查表
          <span className="font-mono text-xs text-charcoal-500 ml-2">Drinking Window Guide</span>
        </h2>
        <div className="space-y-3">
          {agingGuide.map((a) => (
            <div key={a.type} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-text-warm font-medium">{a.type}</h3>
                <span className="font-mono text-xs text-neon-cyan border border-neon-cyan/30 px-2 py-0.5">
                  {a.window}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {a.examples.split(' · ').map((e) => (
                  <span key={e} className="font-mono text-[11px] text-charcoal-500 bg-bg-tertiary border border-charcoal-700 px-2 py-0.5">
                    {e}
                  </span>
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{a.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          什麼讓一款酒適合陳年？
          <span className="font-mono text-xs text-charcoal-500 ml-2">Conditions for Aging</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">高結構性</span>
            <p className="leading-relaxed">高單寧（紅酒）、高酸度（白酒/甜酒）、高酒精度（加烈酒）、高糖分（甜酒）——這些「結構元素」是酒液在漫長陳年過程中維持穩定的支架。缺乏結構的酒就像沒有骨骼的身體，陳年後只會塌陷而非成長。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">濃度與深度</span>
            <p className="leading-relaxed">果味萃取度高、風味物質豐富的酒有更多「素材」可以在陳年中轉化為複雜的三級香氣。淡薄的酒即使結構良好，陳年後也只會變得更加蒼白。這也是為什麼頂級產區、好年份、老藤的酒更適合陳年。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">平衡性</span>
            <p className="leading-relaxed">酸甜苦（單寧）在年輕時可能各自突出，但陳年的目的就是讓這些元素逐漸融合為和諧的整體。年輕時已經平衡的酒通常不需要太長時間陳年——它已經準備好了。年輕時不平衡（如單寧過於強勁）的酒反而可能隨時間獲得更好的整合。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">品種特性</span>
            <p className="leading-relaxed">某些葡萄品種天生比其他品種更適合陳年。Cabernet Sauvignon、Nebbiolo、Riesling、Chenin Blanc 是公認的長壽品種。Gamay（Beaujolais）、Pinot Grigio 等則最好年輕享用。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Content Map & Page ─────────────────────────────────── */
const contentMap: Record<TabKey, () => React.JSX.Element> = {
  environment: EnvironmentContent,
  opened: OpenedContent,
  spirits: SpiritsContent,
  aging: AgingContent,
}

export default function StoragePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('environment')
  const Content = contentMap[activeTab]

  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="storage" />
      <section className="px-6 pt-20 pb-8 max-w-6xl mx-auto">
        <Link href="/academy" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors">
          ← 返回學院
        </Link>
        <div className="mt-8">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">Preservation & Storage</p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">保存與儲藏</h1>
          <p className="text-text-secondary max-w-3xl">
            從溫度控制到開瓶後的倒計時——確保每一瓶好酒都能在最佳狀態下被品味。
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
              <span className="font-mono text-xs ml-1.5">{tab.en}</span>
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
