'use client'

import { useState } from 'react'
import Link from 'next/link'
import AcademyTracker from '../../../components/AcademyTracker'

/* ──────────────────────────────────────────────────────────
   Art of Tasting & Appreciation — 品鑑藝術
   ────────────────────────────────────────────────────────── */

type TabKey = 'universal' | 'spirit' | 'wine' | 'sake' | 'wheel'

const tabs: { key: TabKey; zh: string; en: string }[] = [
  { key: 'universal', zh: '通用品鑑法', en: 'Universal Method' },
  { key: 'spirit',    zh: '烈酒品鑑', en: 'Spirit Tasting' },
  { key: 'wine',      zh: '葡萄酒品鑑', en: 'Wine Tasting' },
  { key: 'sake',      zh: '清酒品鑑', en: 'Sake Tasting' },
  { key: 'wheel',     zh: '風味輪圖解', en: 'Flavor Wheel' },
]

/* ── 通用品鑑法 ─────────────────────────────────────────── */
function UniversalContent() {
  const phases = [
    {
      phase: '01',
      name: '視覺',
      en: 'Visual / Appearance',
      icon: '👁️',
      items: [
        { label: '透明度 Clarity', desc: '晶瑩剔透 (Brilliant) → 清澈 (Clear) → 微濁 (Slight Haze) → 渾濁 (Cloudy)。大部分商業酒款應為清澈至晶瑩。未過濾酒款（Unfiltered）可能帶有自然的微濁，這不代表品質瑕疵。' },
        { label: '色澤 Color', desc: '顏色的深淺與色調提供重要線索。紅酒的顏色深度暗示品種（深色 Syrah vs 淺色 Pinot Noir）與年齡（年輕紫紅 → 成熟石榴紅 → 陳年磚紅）。烈酒的顏色反映木桶熟成的時間與桶型（無色=未陳年或伏特加、淡金=波本桶、琥珀=雪莉桶或長期陳年）。' },
        { label: '黏度 Viscosity', desc: '搖杯後觀察酒腿（Legs/Tears）的流速——緩慢的酒腿暗示較高的酒精度或殘糖量。酒液的「質地感」可以在視覺上預判口感的厚薄。' },
      ],
    },
    {
      phase: '02',
      name: '嗅覺',
      en: 'Nose / Olfactory',
      icon: '👃',
      items: [
        { label: '靜態嗅聞 First Nose', desc: '不搖杯直接嗅聞。捕捉最輕盈、最揮發性的香氣分子——花香、酯類果香、輕微的醛類。這是第一印象，許多精緻的高音調香氣在搖杯後反而會被更強烈的香氣掩蓋。' },
        { label: '搖杯後 Second Nose', desc: '輕搖杯身增加液面面積與氧氣接觸，釋放更多芳香化合物。此時可以感受到中段與低音調的香氣——辛香料、木質調、烘焙香、陳年香。嘗試從不同角度（杯緣 vs 杯底）嗅聞。' },
        { label: '評估項目', desc: '條件 (乾淨/有缺陷) → 強度 (輕/中/濃) → 香氣特徵 (列舉所有能辨識的香氣) → 複雜度 (簡單/中等/複雜) → 發展狀態 (年輕/正值巔峰/衰退)。' },
      ],
    },
    {
      phase: '03',
      name: '味覺',
      en: 'Palate / Gustatory',
      icon: '👅',
      items: [
        { label: '入口 Attack', desc: '酒液接觸舌面的第一瞬間。注意甜度的第一印象——嘴唇前端最先感知甜味。同時感受酒液的溫度感（酒精的灼熱 vs 冰涼的清新）。' },
        { label: '中段 Mid-Palate', desc: '酒液在口腔中翻攪 5–10 秒的階段。此時五味（甜、酸、苦、鹹、旨）同時呈現。注意質地——絲滑 vs 粗糙，輕盈 vs 厚重。烈酒的辛辣感（Prickle）在此階段最為明顯。' },
        { label: '結構 Structure', desc: '甜度 (Dry → Sweet)、酸度 (Low → High)、單寧/澀度 (Soft → Grippy)、酒體 (Light → Full)、酒精感 (Low → Hot)。這五個維度構成了酒液的「骨架」。' },
      ],
    },
    {
      phase: '04',
      name: '餘韻',
      en: 'Finish / Aftertaste',
      icon: '✨',
      items: [
        { label: '長度 Length', desc: '吞嚥後風味持續的秒數。短 (＜5s) → 中 (5-10s) → 長 (10-20s) → 極長 (＞20s)。頂級酒款的餘韻可持續 30–60 秒以上，且在這段時間內風味會持續演變。' },
        { label: '品質 Quality', desc: '餘韻的愉悅度比長度更重要。好的餘韻像是一段漸層的變奏——從果味到礦物感到香料。壞的餘韻停留在苦味、酒精灼燒或金屬味上。' },
        { label: '最終風味 Final Note', desc: '最後殘留在味蕾上的記憶是什麼？這通常是一款酒最深刻的「簽名」——煙燻、蜂蜜、礦石、花香、苦杏仁……記錄它，因為這往往是你下次回購或推薦時最先想起的特徵。' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h2 className="font-display text-lg text-text-warm mb-2">
          WSET SAT 系統性品評法
          <span className="font-mono text-xs text-charcoal-500 ml-2">Systematic Approach to Tasting</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          WSET（Wine & Spirit Education Trust）的「系統性品評法」（SAT）是全球最通用的品酒框架。
          它將主觀的品飲體驗結構化為可複製、可比較的評估標準。無論你品評的是葡萄酒、威士忌還是清酒，
          SAT 的四階段框架——外觀、嗅覺、味覺、餘韻——都適用。以下是每個階段的深入解析。
        </p>
      </div>

      {phases.map((p) => (
        <div key={p.phase} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 border-2 border-neon-amber flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{p.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neon-amber">{p.phase}</span>
                <h2 className="font-display text-xl text-text-warm">{p.name}</h2>
              </div>
              <p className="font-mono text-xs text-charcoal-500 tracking-wider">{p.en}</p>
            </div>
          </div>
          <div className="space-y-4">
            {p.items.map((item) => (
              <div key={item.label}>
                <span className="font-mono text-xs text-neon-amber block mb-1">{item.label}</span>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          品鑑環境建議
          <span className="font-mono text-xs text-charcoal-500 ml-2">Tasting Environment</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-xs text-neon-amber block mb-1">理想條件</span>
            <p className="leading-relaxed">自然光線、室溫 18–22°C、無強烈氣味（香水、食物、清潔劑）、白色桌面或品酒墊（方便觀察色澤）、安靜專注的環境。上午 10 點至中午是味蕾最敏銳的時段。</p>
          </div>
          <div>
            <span className="font-mono text-xs text-neon-amber block mb-1">記錄方法</span>
            <p className="leading-relaxed">建議使用 3×5 卡片或手機筆記 App，每款酒記錄：名稱、年份/批次、日期、溫度、外觀/嗅覺/味覺/餘韻各一句話、整體評分（5 分制或 100 分制）、是否會再購買。持續記錄 3 個月後你會發現自己的偏好模式。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 烈酒品鑑 ───────────────────────────────────────────── */
function SpiritContent() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-text-warm mb-2">
          烈酒品鑑特殊注意事項
          <span className="font-mono text-xs text-charcoal-500 ml-2">Spirit-Specific Notes</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          品鑑高酒精度烈酒（40–65% ABV）與品鑑葡萄酒最大的差異在於酒精對嗅覺的「麻痺效應」。
          高濃度乙醇蒸汽會暫時麻痺嗅覺受器，使品飲者在前幾秒只聞到「酒精」而非風味。
          因此，烈酒品鑑有一套專屬的嗅聞技巧。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h3 className="text-text-warm font-medium mb-2">漸進式嗅聞法</h3>
          <p className="font-mono text-xs text-charcoal-500 mb-2">Progressive Nosing</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            第一次嗅聞：將酒杯遠離鼻子 10–15 公分，張嘴輕輕呼吸（開口嗅聞可減少酒精的刺激感），
            感受最外圍的香氣層。第二次：移近至 5 公分。第三次：正常嗅聞。
            此時嗅覺已適應酒精濃度，可以開始辨識具體的風味特徵。
            切勿一開始就將鼻子伸入杯中——強烈的酒精蒸汽可能暫時性灼傷鼻黏膜長達 30 分鐘。
          </p>
        </div>
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h3 className="text-text-warm font-medium mb-2">加水品飲法</h3>
          <p className="font-mono text-xs text-charcoal-500 mb-2">Adding Water</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            專業品酒師通常會在第二輪品鑑時加入數滴室溫水（使用滴管或茶匙），
            將酒精度降至約 35% ABV 附近。加水後酒液的分子結構重新排列，
            原本被酒精「鎖住」的風味分子被釋放出來。觀察加水前後香氣的變化是品鑑烈酒最有趣的環節。
            加水量因人而異——「正確的水量」就是讓你最舒適品飲的水量。
          </p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          威士忌品鑑筆記範例
          <span className="font-mono text-xs text-charcoal-500 ml-2">Whisky Tasting Note Example</span>
        </h2>
        <div className="p-4 bg-bg-tertiary border border-charcoal-700 font-mono text-sm text-text-secondary leading-relaxed">
          <p className="text-neon-amber mb-2">Lagavulin 16 Year Old · Islay Single Malt · 43% ABV</p>
          <p><span className="text-charcoal-500">外觀：</span>深琥珀金，黏度中高，酒腿緩慢繁密。</p>
          <p className="mt-1"><span className="text-charcoal-500">嗅覺：</span>強烈的泥煤煙燻——營火、碘酒、海帶鹽味。搖杯後浮現乾果（葡萄乾、無花果）、深色蜂蜜、燉蘋果、皮革與一絲甘草。加水後出現驚喜的甜美果香。</p>
          <p className="mt-1"><span className="text-charcoal-500">味覺：</span>入口甜潤飽滿，隨後煙燻味如浪潮般湧來。中段出現太妃糖甜感與海鹽，與泥煤形成美妙的甜鹹對比。酒體飽滿、質地如絲綢。</p>
          <p className="mt-1"><span className="text-charcoal-500">餘韻：</span>極長（＞30 秒）。煙燻與海洋氣息緩緩消退，最後以乾燥的泥煤灰與一抹甜蜜的焦糖收場。</p>
          <p className="mt-2 text-neon-amber">評分：93/100 · 結論：泥煤與甜潤的完美平衡，Islay 經典中的經典。</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          品鑑杯型選擇
          <span className="font-mono text-xs text-charcoal-500 ml-2">Tasting Glassware</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">Glencairn Glass</h3>
            <p className="leading-relaxed">蘇格蘭威士忌的標準品鑑杯。鬱金香型杯口集中香氣，寬底穩固便於觀察色澤，無杯腳設計讓手的溫度微微加溫酒液。全球最廣泛使用的烈酒品鑑杯。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">Copita / ISO Glass</h3>
            <p className="leading-relaxed">有杯腳的國際標準品酒杯。杯腳避免了手溫的干擾，適合需要嚴格控制溫度的專業品評場合。ISO 杯(ISO 3591)是國際葡萄酒與烈酒競賽的指定用杯。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">Rocks Glass / Tumbler</h3>
            <p className="leading-relaxed">厚底矮杯，非品鑑用途但是享受烈酒的經典方式。寬口設計不利於集中香氣但方便加冰或製作 Old Fashioned 等經典調酒。日常飲用的最佳選擇。</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          評分系統
          <span className="font-mono text-xs text-charcoal-500 ml-2">Scoring Systems</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-xs text-neon-amber block mb-1">100 分制</span>
            <p className="leading-relaxed">
              最常用的評分系統。90+ 分為傑出（Outstanding），85–89 分為非常好（Very Good），
              80–84 分為好（Good），75–79 分為尚可（Fair）。Whisky Advocate 和 Wine Spectator
              等雜誌使用此系統。Jim Murray&apos;s Whisky Bible 也以 100 分制評分。
              注意「底分效應」——大多數評分落在 75–95 之間，實際有效的鑑別範圍僅 20 分。
            </p>
          </div>
          <div>
            <span className="font-mono text-xs text-neon-amber block mb-1">5 星制 / 個人記錄</span>
            <p className="leading-relaxed">
              對於個人品鑑記錄，簡單的 5 星制往往更實用：
              ★ 不會再喝、★★ 普通、★★★ 好喝，會推薦、★★★★ 傑出，值得再買、★★★★★ 夢幻逸品。
              搭配一句話描述風味特徵，長期累積後就是一本專屬於你的品鑑辭典。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 葡萄酒品鑑 ─────────────────────────────────────────── */
function WineContent() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-text-warm mb-2">
          盲品技巧
          <span className="font-mono text-xs text-charcoal-500 ml-2">Blind Tasting Methodology</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          盲品（Blind Tasting）是指在不知道酒款身份的情況下品評——這排除了品牌、價格、
          產區名聲等認知偏差（Cognitive Bias）的干擾，讓品飲者完全根據感官判斷酒的品質與特徵。
          WSET Diploma 和 Master of Wine 考試都包含嚴格的盲品環節。
        </p>
        <p className="text-text-secondary text-sm leading-relaxed mt-2">
          盲品的思考邏輯是「演繹法」——從感官觀察推導出結論。流程如下：
          外觀（色澤深淺暗示品種）→ 嗅覺（特徵香氣暗示品種/產區）→ 味覺（結構暗示氣候/釀造）
          → 綜合推理（年份/品質/產區）。每個步驟都是縮小範圍的過程。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h3 className="text-text-warm font-medium mb-2">垂直品飲 Vertical Tasting</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            品飲同一酒莊/品牌的不同年份（如 Château Margaux 2015、2016、2017、2018）。
            目的是理解年份對風味的影響——天氣、降雨、日照時數如何塑造同一塊風土的不同表情。
            垂直品飲是學習「年份差異」最直觀的方式，也能觀察一款酒隨時間的演變軌跡。
          </p>
        </div>
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h3 className="text-text-warm font-medium mb-2">水平品飲 Horizontal Tasting</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            品飲同一年份的不同酒莊（如 2018 年的五款 Pauillac 紅酒）。
            目的是比較不同釀酒師/風土在同一氣候條件下的表現差異。
            水平品飲是學習「風土差異」與「釀酒哲學差異」的最佳方法。
            對於準備 WSET 考試的學生尤其推薦。
          </p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          WSET 品評表速覽
          <span className="font-mono text-xs text-charcoal-500 ml-2">WSET SAT Grid Summary</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-text-secondary">
            <thead>
              <tr className="border-b border-charcoal-700 text-left">
                <th className="py-2 pr-4 font-mono text-xs text-neon-amber">維度</th>
                <th className="py-2 pr-4 font-mono text-xs text-neon-amber">評估項目</th>
                <th className="py-2 font-mono text-xs text-neon-amber">評分等級</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b border-charcoal-800"><td className="py-2 pr-4 text-text-warm">外觀</td><td className="py-2 pr-4">透明度 · 色澤深度 · 色調</td><td className="py-2">Clear → Hazy</td></tr>
              <tr className="border-b border-charcoal-800"><td className="py-2 pr-4 text-text-warm">嗅覺</td><td className="py-2 pr-4">狀態 · 強度 · 香氣特徵 · 複雜度</td><td className="py-2">Light → Pronounced</td></tr>
              <tr className="border-b border-charcoal-800"><td className="py-2 pr-4 text-text-warm">味覺</td><td className="py-2 pr-4">甜度 · 酸度 · 單寧 · 酒精度 · 酒體 · 風味強度</td><td className="py-2">Low → High</td></tr>
              <tr className="border-b border-charcoal-800"><td className="py-2 pr-4 text-text-warm">餘韻</td><td className="py-2 pr-4">長度 · 品質</td><td className="py-2">Short → Long</td></tr>
              <tr><td className="py-2 pr-4 text-text-warm">結論</td><td className="py-2 pr-4">品質等級 · 適飲期 · 價格定位</td><td className="py-2">Faulty → Outstanding</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          常見缺陷辨識
          <span className="font-mono text-xs text-charcoal-500 ml-2">Fault Detection</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div className="p-3 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">軟木塞污染 Cork Taint (TCA)</h3>
            <p className="leading-relaxed">由三氯苯甲醚（TCA）引起，呈現濕紙板、發霉地下室、濕狗的氣味。即使極微量也會壓抑酒的果香，使其變得「平淡」。影響約 2–5% 的軟木塞封裝酒款。</p>
          </div>
          <div className="p-3 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">過度氧化 Oxidation</h3>
            <p className="leading-relaxed">酒液過度接觸氧氣導致。白酒變為深金/琥珀色，氣味類似雪莉酒或蘋果醬。紅酒呈現磚紅棕色，果味消失被核桃、蜜餞味取代。與「陳年」的區別在於氧化缺乏複雜度。</p>
          </div>
          <div className="p-3 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">揮發性酸度 Volatile Acidity</h3>
            <p className="leading-relaxed">（VA）過高會產生醋酸/指甲油般的刺鼻感。微量的 VA 可增添複雜度（許多高評價的自然酒有刻意的 VA），但過量即為缺陷。</p>
          </div>
          <div className="p-3 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">酒香酵母 Brettanomyces</h3>
            <p className="leading-relaxed">（Brett）帶來馬廄、創可貼、煙燻皮革的味道。在南隆河與老世界某些產區被視為「風土表現」的一部分（如傳統 Châteauneuf-du-Pape），但在新世界通常被視為缺陷。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 清酒品鑑 ───────────────────────────────────────────── */
function SakeContent() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-text-warm mb-2">
          清酒品鑑的獨特之處
          <span className="font-mono text-xs text-charcoal-500 ml-2">Unique Aspects of Sake Tasting</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          清酒品鑑與葡萄酒/烈酒品鑑有幾個關鍵差異：（1）清酒幾乎無單寧，口感的焦點在於旨味（Umami）、
          酸度與甜度的三角平衡；（2）清酒的品飲溫度範圍極廣（5–55°C），同一款酒在不同溫度下會展現截然不同的面貌；
          （3）清酒的香氣強度通常比葡萄酒低（除了大吟釀類），需要更細緻的嗅覺注意力。
        </p>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          日本酒度・酸度・胺基酸度 三維分析
          <span className="font-mono text-xs text-charcoal-500 ml-2">SMV × Acidity × Amino Acids</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-2">日本酒度 SMV</h3>
            <p className="leading-relaxed">衡量含糖量的指標。正值（+）= 糖少 = 傾向辛口；負值（-）= 糖多 = 傾向甘口。一般範圍 -5 到 +10。但 SMV 單獨參考容易誤判——高酸度的酒即使 SMV 為負也可能喝起來很乾爽。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-2">酸度 Acidity</h3>
            <p className="leading-relaxed">計量清酒中有機酸（乳酸、蘋果酸、琥珀酸）的總量。一般範圍 0.8–2.0。高酸度帶來清爽感與結構，可以「中和」甘口酒的甜膩。生酛/山廢系清酒的酸度通常高於速釀酛，這是其風格濃厚的原因之一。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-2">胺基酸度 Amino Acids</h3>
            <p className="leading-relaxed">衡量旨味（Umami）強度的指標。一般範圍 0.8–2.5。高胺基酸度 = 味道濃厚飽滿（適合配餐）；低胺基酸度 = 輕快淡麗（適合餐前）。過高可能帶來「雜味」感。大吟釀刻意追求低胺基酸度以維持純淨感。</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          清酒四大類型風格圖
          <span className="font-mono text-xs text-charcoal-500 ml-2">4-Type Classification</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          日本酒類綜合研究所提出的四象限分類法，以「香氣高低」與「味道濃淡」兩個軸線將清酒分為四大類型：
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-bg-tertiary border border-neon-amber/30">
            <h3 className="text-neon-amber font-medium mb-1">薰酒 Kunshu</h3>
            <p className="font-mono text-xs text-charcoal-500 mb-1">高香氣 × 淡口感</p>
            <p className="text-text-secondary text-sm leading-relaxed">華麗的果香花香，口感輕盈。大吟釀、吟釀類。適合冷飲，搭配清淡料理。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">爽酒 Soshu</h3>
            <p className="font-mono text-xs text-charcoal-500 mb-1">低香氣 × 淡口感</p>
            <p className="text-text-secondary text-sm leading-relaxed">清爽乾淨，不搶食物風味。本釀造、生酒類。極度百搭的配餐酒。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">醇酒 Junshu</h3>
            <p className="font-mono text-xs text-charcoal-500 mb-1">低香氣 × 濃口感</p>
            <p className="text-text-secondary text-sm leading-relaxed">旨味濃厚、米味飽滿。純米酒、生酛/山廢系。適合溫燗，搭配燉煮料理。</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h3 className="text-text-warm font-medium mb-1">熟酒 Jukushu</h3>
            <p className="font-mono text-xs text-charcoal-500 mb-1">高香氣 × 濃口感</p>
            <p className="text-text-secondary text-sm leading-relaxed">陳年清酒，色澤琥珀至深棕。蜂蜜、焦糖、堅果風味。適合搭配起司、煙燻料理或當甜點酒。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 風味輪圖解 ─────────────────────────────────────────── */
function WheelContent() {
  const categories = [
    { name: '果香', en: 'Fruity', color: 'text-flavor-tropical', subs: ['柑橘 Citrus（檸檬、萊姆、橙、葡萄柚）', '核果 Stone Fruit（桃、杏、李）', '熱帶 Tropical（芒果、百香果、荔枝、鳳梨）', '莓果 Berry（草莓、覆盆子、藍莓、黑加侖）', '蘋果/梨 Pome（青蘋果、熟蘋果、亞洲梨）', '乾果 Dried（葡萄乾、無花果乾、棗子）'] },
    { name: '花香', en: 'Floral', color: 'text-flavor-floral', subs: ['玫瑰 Rose', '紫羅蘭 Violet', '茉莉 Jasmine', '接骨木花 Elderflower', '橙花 Orange Blossom', '薰衣草 Lavender'] },
    { name: '草本/植物', en: 'Herbal & Vegetal', color: 'text-flavor-herbal', subs: ['薄荷 Mint', '百里香 Thyme', '迷迭香 Rosemary', '青草 Cut Grass', '茶葉 Tea', '菸草 Tobacco'] },
    { name: '辛香料', en: 'Spice', color: 'text-neon-amber', subs: ['黑胡椒 Black Pepper', '肉桂 Cinnamon', '丁香 Clove', '八角 Star Anise', '肉荳蔻 Nutmeg', '薑 Ginger'] },
    { name: '木質/烘焙', en: 'Wood & Toasty', color: 'text-flavor-caramel', subs: ['香草 Vanilla', '橡木 Oak', '雪松 Cedar', '烤吐司 Toast', '咖啡 Coffee', '可可 Cocoa'] },
    { name: '煙燻/泥土', en: 'Smoky & Earthy', color: 'text-flavor-smoky', subs: ['泥煤 Peat', '營火 Bonfire', '碘酒 Iodine', '蘑菇 Mushroom', '松露 Truffle', '濕土 Wet Earth'] },
    { name: '礦物', en: 'Mineral', color: 'text-neon-cyan', subs: ['燧石 Flint', '板岩 Slate', '白堊 Chalk', '鹽 Salt', '鋼鐵 Steel'] },
    { name: '甜/焦糖', en: 'Sweet & Caramel', color: 'text-flavor-vanilla', subs: ['蜂蜜 Honey', '太妃糖 Toffee', '楓糖 Maple', '焦糖布丁 Crème Brûlée', '奶油糖 Butterscotch'] },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h2 className="font-display text-lg text-text-warm mb-2">
          何謂風味輪？
          <span className="font-mono text-xs text-charcoal-500 ml-2">What is a Flavor Wheel?</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          風味輪（Flavor Wheel）是一種將所有可能的香氣/味覺描述詞組織為同心圓的視覺化工具。
          從圓心向外，風味描述從抽象（「果香」）逐漸具體化（「柑橘」→「Meyer 檸檬」）。
          UC Davis 的葡萄酒風味輪（Ann C. Noble, 1984）是最經典的版本；
          此後威士忌、咖啡、精釀啤酒、巧克力等領域都發展出了專屬的風味輪。
          風味輪的價值在於——它給了你「語言」來描述感官體驗，
          讓品鑑從「好喝/不好喝」進階到精確的風味溝通。
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl text-text-warm mb-4">
          八大風味家族
          <span className="font-mono text-xs text-charcoal-500 ml-2">8 Flavor Families</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.en} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
              <h3 className={`font-display text-lg ${cat.color} mb-1`}>{cat.name}</h3>
              <p className="font-mono text-xs text-charcoal-500 mb-3">{cat.en}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.subs.map((s) => (
                  <span key={s} className="font-mono text-[11px] text-text-secondary bg-bg-tertiary border border-charcoal-700 px-2 py-0.5">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display text-lg text-text-warm mb-3">
          如何建立個人風味詞彙庫
          <span className="font-mono text-xs text-charcoal-500 ml-2">Building Your Vocabulary</span>
        </h2>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="flex gap-3 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0">Step 1</span>
            <p className="leading-relaxed"><strong className="text-text-warm">日常訓練嗅覺</strong>——有意識地嗅聞日常物品並命名。咖啡豆、柑橘皮、新鮮香草、黑胡椒、皮革、木材……每天花 30 秒「嗅聞並記憶」一種氣味。三個月後你的嗅覺詞彙庫會顯著擴增。</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0">Step 2</span>
            <p className="leading-relaxed"><strong className="text-text-warm">使用風味輪提示</strong>——品飲時將風味輪放在旁邊。先從大類開始（「我聞到果香」），再往細節走（「是柑橘類的……像是葡萄柚」）。不要怕「錯」——風味描述是主觀的，沒有標準答案。</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0">Step 3</span>
            <p className="leading-relaxed"><strong className="text-text-warm">比較式品飲</strong>——同時品評 2–3 款不同的酒，比較它們的差異。差異越明顯的組合越適合初學者（例如 Islay 泥煤威士忌 vs Speyside 花果威士忌）。在對比中，你會更容易捕捉到每款酒的獨特特徵。</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0">Step 4</span>
            <p className="leading-relaxed"><strong className="text-text-warm">記錄、記錄、再記錄</strong>——每次品飲後寫下至少三個香氣描述詞和一句口感描述。半年後回頭翻閱，你會驚訝於自己的進步。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Content Map & Page ─────────────────────────────────── */
const contentMap: Record<TabKey, () => React.JSX.Element> = {
  universal: UniversalContent,
  spirit: SpiritContent,
  wine: WineContent,
  sake: SakeContent,
  wheel: WheelContent,
}

export default function TastingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('universal')
  const Content = contentMap[activeTab]

  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="tasting" />
      <section className="px-6 pt-20 pb-8 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回學院
        </Link>
        <div className="mt-8">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            Art of Tasting & Appreciation
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
            品鑑藝術
          </h1>
          <p className="text-text-secondary max-w-3xl">
            系統化的品鑑方法論——從通用框架到各品類的專業技巧，建立屬於你的感官語言。
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
                activeTab === tab.key
                  ? 'border-neon-amber text-neon-amber'
                  : 'border-transparent text-charcoal-500 hover:text-text-secondary'
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
