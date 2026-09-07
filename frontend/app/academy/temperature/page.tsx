'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type CategoryTab = 'cocktails' | 'wine' | 'spirits'

interface ScienceCard {
  emoji: string
  title: string
  description: string
}

const scienceCards: ScienceCard[] = [
  {
    emoji: '❄️',
    title: '低溫抑制香氣',
    description:
      '低溫抑制揮發性香氣分子，讓酒感更柔和。這就是為什麼冰鎮的白酒喝起來「乾淨」，而同一款酒在室溫下可能顯得更複雜但也更雜亂。',
  },
  {
    emoji: '🔥',
    title: '高溫釋放芳香',
    description:
      '高溫釋放更多芳香化合物，但也放大酒精感。溫度每升高 10°C，揮發速率大幅增加——這是一把雙面刃。',
  },
  {
    emoji: '🍬',
    title: '甜苦感知變化',
    description:
      '甜度感知隨溫度升高而增加，苦味感知隨溫度降低而增強。這也是為什麼甜酒需要冰鎮——低溫平衡甜膩感。',
  },
  {
    emoji: '🫧',
    title: '碳酸溶解度',
    description:
      '碳酸在低溫下溶解度更高，氣泡更持久、更細緻。溫暖的氣泡酒會迅速「爆氣」，口感變得粗糙。',
  },
]

/* -- Thermometer zones -------------------------------------------- */
interface TempZone {
  minC: number
  maxC: number
  label: string
  engLabel: string
  color: string
  textColor: string
  items: string[]
}

const tempZones: TempZone[] = [
  {
    minC: -5,
    maxC: -2,
    label: '極冷',
    engLabel: 'Shaken Cocktails',
    color: '#3B82F6',
    textColor: 'text-blue-400',
    items: ['Daiquiri', 'Whiskey Sour', 'Cosmopolitan'],
  },
  {
    minC: -2,
    maxC: 2,
    label: '冰冷',
    engLabel: 'Stirred Cocktails, Champagne',
    color: '#06B6D4',
    textColor: 'text-cyan-400',
    items: ['Martini', 'Manhattan', '香檳'],
  },
  {
    minC: 2,
    maxC: 6,
    label: '很冷',
    engLabel: 'White Wine, Rosé, Light Beer',
    color: '#14B8A6',
    textColor: 'text-teal-400',
    items: ['Sauvignon Blanc', 'Rosé', 'Pilsner'],
  },
  {
    minC: 6,
    maxC: 10,
    label: '涼爽',
    engLabel: 'Full White Wine, Light Red',
    color: '#22C55E',
    textColor: 'text-green-400',
    items: ['Chardonnay', 'Pinot Grigio', 'Beaujolais'],
  },
  {
    minC: 10,
    maxC: 14,
    label: '微涼',
    engLabel: 'Light Red Wine, Sherry',
    color: '#F59E0B',
    textColor: 'text-amber-400',
    items: ['Pinot Noir', 'Sherry', 'Chianti'],
  },
  {
    minC: 14,
    maxC: 18,
    label: '室溫偏涼',
    engLabel: 'Full Red Wine, Port',
    color: '#F97316',
    textColor: 'text-orange-400',
    items: ['Cabernet Sauvignon', 'Barolo', 'Port'],
  },
  {
    minC: 18,
    maxC: 20,
    label: '室溫',
    engLabel: 'Cognac, Neat Spirits',
    color: '#EF4444',
    textColor: 'text-red-400',
    items: ['Cognac', 'Scotch', 'Bourbon'],
  },
]

/* -- Cocktail table ----------------------------------------------- */
interface CocktailRow {
  type: string
  temp: string
  method: string
  examples: string
}

const cocktailData: CocktailRow[] = [
  { type: '搖盪冰飲', temp: '-5°C ~ -2°C', method: '搖盪後立即上桌', examples: 'Daiquiri, Whiskey Sour' },
  { type: '攪拌冰飲', temp: '-2°C ~ 0°C', method: '攪拌後濾冰上桌', examples: 'Martini, Manhattan' },
  { type: '加冰飲品', temp: '0°C ~ 4°C', method: '大冰塊慢融', examples: 'Old Fashioned, Negroni' },
  { type: '長飲/高球', temp: '2°C ~ 5°C', method: '冰塊+碳酸', examples: 'Highball, G&T' },
  { type: '熱調酒', temp: '65°C ~ 75°C', method: '預熱杯+熱水', examples: 'Irish Coffee, Hot Toddy' },
]

/* -- Wine table --------------------------------------------------- */
interface WineRow {
  wine: string
  temp: string
  cooling: string
  note: string
}

const wineData: WineRow[] = [
  { wine: '氣泡酒/香檳', temp: '4°C ~ 7°C', cooling: '冰桶30分鐘', note: '太冷會失去香氣層次' },
  { wine: '輕盈白酒 (Sauvignon Blanc, Pinot Grigio)', temp: '7°C ~ 10°C', cooling: '冰箱2小時', note: '保持清爽柑橘香' },
  { wine: '豐滿白酒 (Chardonnay)', temp: '10°C ~ 13°C', cooling: '冰箱1小時', note: '過冷會抑制橡木與奶油香' },
  { wine: '粉紅酒 Rosé', temp: '7°C ~ 10°C', cooling: '冰桶15分鐘', note: '夏日最佳溫度' },
  { wine: '輕盈紅酒 (Pinot Noir)', temp: '12°C ~ 15°C', cooling: '稍微冰鎮', note: '在法國常稱「cave temperature」' },
  { wine: '中度紅酒 (Merlot, Sangiovese)', temp: '15°C ~ 17°C', cooling: '室溫偏涼', note: '非「室溫」，是酒窖溫度' },
  { wine: '厚重紅酒 (Cabernet, Barolo)', temp: '16°C ~ 18°C', cooling: '酒窖溫度', note: '太暖酒精感過重' },
  { wine: '甜酒 (Sauternes, Tokaji)', temp: '8°C ~ 12°C', cooling: '冰箱1.5小時', note: '低溫平衡甜度' },
]

/* -- Spirits table ------------------------------------------------ */
interface SpiritRow {
  spirit: string
  temp: string
  method: string
  note: string
}

const spiritData: SpiritRow[] = [
  { spirit: 'Vodka', temp: '-18°C ~ 0°C', method: '冷凍或加冰', note: '冷凍讓口感如絲綢' },
  { spirit: 'Gin', temp: '室溫或冰鎮', method: '取決於飲法', note: '冰鎮的G&T vs 室溫品鑑' },
  { spirit: 'Bourbon / Rye', temp: '18°C ~ 22°C', method: '室溫，可加冰', note: '少許水能打開風味' },
  { spirit: 'Scotch Single Malt', temp: '18°C ~ 22°C', method: '室溫+幾滴水', note: '水滴釋放隱藏香氣' },
  { spirit: 'Cognac / Brandy', temp: '18°C ~ 22°C', method: '手掌溫杯', note: '千萬不要用火加熱' },
  { spirit: 'Tequila（品鑑）', temp: '18°C ~ 22°C', method: '室溫', note: '品鑑級 Añejo 不要冰鎮' },
  { spirit: '日本威士忌', temp: '18°C ~ 22°C 或 Highball', method: '室溫或冰鎮高球', note: '日式高球是文化' },
]

/* -- Quick chill tips --------------------------------------------- */
interface ChillTip {
  emoji: string
  title: string
  description: string
}

const chillTips: ChillTip[] = [
  {
    emoji: '🧊',
    title: '冰桶+水+鹽',
    description: '最快冷卻法，5分鐘可降至理想溫度。鹽降低冰點，水確保全面接觸瓶身。',
  },
  {
    emoji: '🧻',
    title: '濕紙巾包瓶冷凍',
    description: '15分鐘急速冷卻。濕紙巾的水分蒸發帶走熱量，效率遠勝直接放冷凍。',
  },
  {
    emoji: '🍇',
    title: '冷凍葡萄',
    description: '當冰塊用，不會稀釋酒液。適合白酒、Rosé 和 Sangria。',
  },
  {
    emoji: '🥂',
    title: '預冰杯子',
    description: '冷凍10分鐘或冰水沖洗。冰杯能讓飲品多保持低溫 5-10 分鐘。',
  },
  {
    emoji: '🪨',
    title: '不鏽鋼冰石',
    description: '可重複使用，零稀釋。適合純飲烈酒時想要微涼但不想加水的場景。',
  },
]

/* -- Common mistakes ---------------------------------------------- */
interface Mistake {
  text: string
  detail: string
}

const mistakes: Mistake[] = [
  {
    text: '把紅酒放在暖氣旁「室溫」服務',
    detail: '歐洲室溫 ≈ 16°C，不是台灣的 28°C。過暖的紅酒酒精感刺鼻、風味鬆散。',
  },
  {
    text: '把白酒冰到冰箱最冷',
    detail: '過冷會殺死香氣——4°C 以下的 Chardonnay 只嚐得到酸度，毫無風味。',
  },
  {
    text: '用手握住 Cognac 杯加熱',
    detail: '體溫太高（37°C），酒精刺鼻。用手掌輕托杯底，讓酒緩慢升溫即可。',
  },
  {
    text: '香檳倒入室溫杯',
    detail: '氣泡瞬間消散，溫度迅速上升。永遠先冰杯，或至少用冰水沖過。',
  },
]

/* ------------------------------------------------------------------ */
/*  Thermometer SVG Component                                          */
/* ------------------------------------------------------------------ */

function Thermometer() {
  const svgW = 320
  const svgH = 560
  const tubeX = 100
  const tubeW = 60
  const tubeTop = 30
  const tubeBot = 480
  const tubeH = tubeBot - tubeTop
  const bulbCY = tubeBot + 30
  const bulbR = 36

  const minTemp = -5
  const maxTemp = 20
  const range = maxTemp - minTemp

  const tempToY = (t: number) => tubeTop + tubeH * (1 - (t - minTemp) / range)

  const ticks = [-5, 0, 5, 10, 15, 20]

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full max-w-[320px] mx-auto"
      role="img"
      aria-label="溫度計視覺指南"
    >
      <defs>
        <linearGradient id="tubeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Tube background */}
      <rect
        x={tubeX}
        y={tubeTop}
        width={tubeW}
        height={tubeH}
        rx={tubeW / 2}
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />

      {/* Temperature zone bands */}
      {tempZones.map((z) => {
        const y1 = tempToY(z.maxC)
        const y2 = tempToY(z.minC)
        return (
          <rect
            key={z.label}
            x={tubeX + 4}
            y={y1}
            width={tubeW - 8}
            height={y2 - y1}
            fill={z.color}
            opacity={0.6}
            rx={4}
          />
        )
      })}

      {/* Tube glass overlay */}
      <rect
        x={tubeX}
        y={tubeTop}
        width={tubeW}
        height={tubeH}
        rx={tubeW / 2}
        fill="url(#tubeGrad)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />

      {/* Bulb */}
      <circle
        cx={tubeX + tubeW / 2}
        cy={bulbCY}
        r={bulbR}
        fill="#EF4444"
        opacity={0.8}
        filter="url(#glow)"
      />
      <circle
        cx={tubeX + tubeW / 2}
        cy={bulbCY}
        r={bulbR - 6}
        fill="#EF4444"
      />

      {/* Tick marks and labels (left side) */}
      {ticks.map((t) => {
        const y = tempToY(t)
        return (
          <g key={t}>
            <line
              x1={tubeX - 8}
              y1={y}
              x2={tubeX}
              y2={y}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1}
            />
            <text
              x={tubeX - 14}
              y={y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.7)"
              fontSize={12}
              fontFamily="monospace"
            >
              {t}°C
            </text>
          </g>
        )
      })}

      {/* Zone labels (right side) */}
      {tempZones.map((z) => {
        const midY = (tempToY(z.maxC) + tempToY(z.minC)) / 2
        return (
          <g key={z.label + '-label'}>
            <line
              x1={tubeX + tubeW}
              y1={midY}
              x2={tubeX + tubeW + 12}
              y2={midY}
              stroke={z.color}
              strokeWidth={1}
              opacity={0.6}
            />
            <text
              x={tubeX + tubeW + 16}
              y={midY - 4}
              fill={z.color}
              fontSize={11}
              fontWeight="bold"
            >
              {z.label}
            </text>
            <text
              x={tubeX + tubeW + 16}
              y={midY + 10}
              fill="rgba(255,255,255,0.5)"
              fontSize={9}
            >
              {z.engLabel}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

const tabConfig: { key: CategoryTab; emoji: string; zh: string; en: string }[] = [
  { key: 'cocktails', emoji: '🍸', zh: '調酒類', en: 'Cocktails' },
  { key: 'wine', emoji: '🍷', zh: '葡萄酒類', en: 'Wine' },
  { key: 'spirits', emoji: '🥃', zh: '烈酒類', en: 'Spirits' },
]

export default function TemperaturePage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>('cocktails')

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-12 max-w-6xl mx-auto animate-fade-in-up">
        <Link
          href="/academy"
          className="inline-flex items-center gap-1 text-charcoal-500 hover:text-neon-amber transition-colors text-sm mb-8"
        >
          ← 返回學院
        </Link>

        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-4">
          Serving Temperature Guide
        </p>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gradient-amber mb-6">
          🌡️ 溫度與服務指南
        </h1>

        <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-3xl">
          溫度決定風味——同一款酒在不同溫度下是完全不同的體驗。
          掌握溫度，就掌握了風味的開關。
        </p>
      </section>

      {/* ── Section 1: 溫度科學 ────────────────────────────── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="divider-amber mb-10" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-2 animate-fade-in-up">
          溫度科學
          <span className="font-mono text-xs text-charcoal-500 ml-3">Temperature Science</span>
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          理解溫度如何影響你杯中的每一口
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {scienceCards.map((card, idx) => (
            <div
              key={card.title}
              className="glass-card p-6 hover:border-neon-amber transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{card.emoji}</span>
                <h3 className="font-display text-lg text-text-warm">{card.title}</h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: 視覺溫度計 ──────────────────────────── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="divider-amber mb-10" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-2 animate-fade-in-up">
          視覺溫度計
          <span className="font-mono text-xs text-charcoal-500 ml-3">Visual Thermometer</span>
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          從 -5°C 到 20°C，一眼掌握所有溫區
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* SVG thermometer */}
          <div className="glass-card p-6 flex justify-center animate-fade-in-up">
            <Thermometer />
          </div>

          {/* Zone detail cards */}
          <div className="space-y-3">
            {tempZones.map((z, idx) => (
              <div
                key={z.label}
                className="glass-card p-4 hover:border-neon-amber transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.07}s`, opacity: 0 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: z.color }}
                  />
                  <span className={`font-display text-sm font-bold ${z.textColor}`}>
                    {z.label}
                  </span>
                  <span className="font-mono text-xs text-charcoal-500">
                    {z.minC}°C ~ {z.maxC}°C
                  </span>
                </div>
                <p className="text-text-secondary text-xs mb-2">{z.engLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {z.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-xs px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: z.color + '40',
                        color: z.color,
                        backgroundColor: z.color + '10',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: 詳細分類 ────────────────────────────── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="divider-amber mb-10" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-2 animate-fade-in-up">
          詳細分類
          <span className="font-mono text-xs text-charcoal-500 ml-3">Detailed Categories</span>
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          每一類酒款的最佳溫度、服務方式與實用建議
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-mono tracking-wider transition-all duration-300 border ${
                activeTab === tab.key
                  ? 'btn-neon-amber bg-neon-amber text-bg-primary'
                  : 'border-charcoal-700 text-charcoal-400 hover:border-neon-amber hover:text-neon-amber'
              }`}
            >
              {tab.emoji} {tab.zh}
              <span className="hidden sm:inline text-xs ml-1">{tab.en}</span>
            </button>
          ))}
        </div>

        {/* Cocktails Table */}
        {activeTab === 'cocktails' && (
          <div className="glass-card overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-charcoal-700">
              <h3 className="font-display text-lg text-text-warm">
                🍸 調酒類 <span className="font-mono text-xs text-charcoal-500">Cocktails</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-700 bg-bg-secondary">
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">調酒類型</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">最佳溫度</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">服務方式</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">範例</th>
                  </tr>
                </thead>
                <tbody>
                  {cocktailData.map((row, idx) => (
                    <tr
                      key={row.type}
                      className={`border-b border-charcoal-700/50 hover:bg-neon-amber/5 transition-colors ${
                        idx % 2 === 0 ? 'bg-bg-primary/30' : ''
                      }`}
                    >
                      <td className="p-3 text-text-warm font-medium">{row.type}</td>
                      <td className="p-3 font-mono text-neon-cyan text-xs">{row.temp}</td>
                      <td className="p-3 text-text-secondary">{row.method}</td>
                      <td className="p-3 text-text-secondary font-mono text-xs">{row.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Wine Table */}
        {activeTab === 'wine' && (
          <div className="glass-card overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-charcoal-700">
              <h3 className="font-display text-lg text-text-warm">
                🍷 葡萄酒類 <span className="font-mono text-xs text-charcoal-500">Wine</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-700 bg-bg-secondary">
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">酒款</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">最佳溫度</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">冷卻方式</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">說明</th>
                  </tr>
                </thead>
                <tbody>
                  {wineData.map((row, idx) => (
                    <tr
                      key={row.wine}
                      className={`border-b border-charcoal-700/50 hover:bg-neon-amber/5 transition-colors ${
                        idx % 2 === 0 ? 'bg-bg-primary/30' : ''
                      }`}
                    >
                      <td className="p-3 text-text-warm font-medium">{row.wine}</td>
                      <td className="p-3 font-mono text-neon-cyan text-xs whitespace-nowrap">{row.temp}</td>
                      <td className="p-3 text-text-secondary">{row.cooling}</td>
                      <td className="p-3 text-text-secondary text-xs">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Spirits Table */}
        {activeTab === 'spirits' && (
          <div className="glass-card overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-charcoal-700">
              <h3 className="font-display text-lg text-text-warm">
                🥃 烈酒類 <span className="font-mono text-xs text-charcoal-500">Spirits</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-700 bg-bg-secondary">
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">酒款</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">最佳溫度</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">服務方式</th>
                    <th className="text-left p-3 font-mono text-xs text-neon-amber tracking-wider">說明</th>
                  </tr>
                </thead>
                <tbody>
                  {spiritData.map((row, idx) => (
                    <tr
                      key={row.spirit}
                      className={`border-b border-charcoal-700/50 hover:bg-neon-amber/5 transition-colors ${
                        idx % 2 === 0 ? 'bg-bg-primary/30' : ''
                      }`}
                    >
                      <td className="p-3 text-text-warm font-medium">{row.spirit}</td>
                      <td className="p-3 font-mono text-neon-cyan text-xs whitespace-nowrap">{row.temp}</td>
                      <td className="p-3 text-text-secondary">{row.method}</td>
                      <td className="p-3 text-text-secondary text-xs">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 4: 快速冷卻技巧 ────────────────────────── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="divider-amber mb-10" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-2 animate-fade-in-up">
          快速冷卻技巧
          <span className="font-mono text-xs text-charcoal-500 ml-3">Quick Chilling Hacks</span>
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          臨時需要冰鎮？這些方法幫你救場
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chillTips.map((tip, idx) => (
            <div
              key={tip.title}
              className="glass-card p-6 hover:border-neon-cyan transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.08}s`, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl group-hover:scale-110 transition-transform">{tip.emoji}</span>
                <h3 className="font-display text-base text-text-warm">{tip.title}</h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: 常見錯誤 ────────────────────────────── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="divider-amber mb-10" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-2 animate-fade-in-up">
          常見錯誤
          <span className="font-mono text-xs text-charcoal-500 ml-3">Common Mistakes</span>
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          這些錯誤你可能天天在犯——現在就改正
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mistakes.map((m, idx) => (
            <div
              key={idx}
              className="glass-card p-6 border-red-500/30 hover:border-red-500/60 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-red-400 text-xl flex-shrink-0 mt-0.5">❌</span>
                <h3 className="font-display text-base text-red-400">{m.text}</h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed pl-8">
                {m.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
