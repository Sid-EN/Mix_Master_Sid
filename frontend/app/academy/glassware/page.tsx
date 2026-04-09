'use client'

import { useState } from 'react'
import Link from 'next/link'
import AcademyTracker from '../../../components/AcademyTracker'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Glassware {
  id: number
  emoji: string
  nameZh: string
  nameEn: string
  capacity: string
  category: Category
  traits: string
  usage: string[]
  details: { label: string; text: string }[]
  proTip: string
}

type Category = '短飲杯' | '長飲杯' | '葡萄酒杯' | '特殊杯型'

const CATEGORIES: { label: string; value: Category | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '短飲杯', value: '短飲杯' },
  { label: '長飲杯', value: '長飲杯' },
  { label: '葡萄酒杯', value: '葡萄酒杯' },
  { label: '特殊杯型', value: '特殊杯型' },
]

/* ------------------------------------------------------------------ */
/*  Data — 16 glassware entries                                        */
/* ------------------------------------------------------------------ */

const GLASSWARE: Glassware[] = [
  /* ── 短飲杯 ── */
  {
    id: 1,
    emoji: '🍸',
    nameZh: '馬丁尼杯 / 雞尾酒杯',
    nameEn: 'Martini / Cocktail Glass',
    capacity: '120–180 ml',
    category: '短飲杯',
    traits: 'V型錐形杯身、長杯腳',
    usage: ['Martini', 'Cosmopolitan', 'Daiquiri'],
    details: [
      { label: '設計理由', text: '寬口增加香氣散發、杯腳防止手溫傳導' },
      { label: '拿法', text: '持杯腳或杯底' },
    ],
    proTip: '正式場合的經典選擇，但容易灑出',
  },
  {
    id: 2,
    emoji: '🫧',
    nameZh: '碟形香檳杯',
    nameEn: 'Coupe Glass',
    capacity: '150–240 ml',
    category: '短飲杯',
    traits: '淺碟型、優雅弧度',
    usage: ['Sidecar', 'Gimlet', 'Champagne Cocktails', 'Daiquiri'],
    details: [
      { label: '歷史', text: '傳說依據瑪麗·安東尼的胸型設計（實為都市傳說）' },
      { label: '為何流行', text: '比 Martini 杯更不易灑，復古優雅' },
    ],
    proTip: '現代調酒師最愛的萬用杯型',
  },
  {
    id: 3,
    emoji: '🥃',
    nameZh: '古典杯',
    nameEn: 'Old Fashioned / Rocks Glass',
    capacity: '180–300 ml',
    category: '短飲杯',
    traits: '厚底、短而寬、結實',
    usage: ['Old Fashioned', 'Negroni', 'Whisky on the rocks'],
    details: [
      { label: '變體', text: 'Single (180ml) vs Double (300ml, DOF)' },
      { label: '設計理由', text: '厚底穩重、容納大冰塊' },
    ],
    proTip: 'DOF 是最實用的杯型之一',
  },
  {
    id: 4,
    emoji: '🍷',
    nameZh: 'Nick & Nora 杯',
    nameEn: 'Nick & Nora Glass',
    capacity: '150–180 ml',
    category: '短飲杯',
    traits: '圓潤杯身、優雅杯腳',
    usage: ['Manhattan', '任何精緻短飲'],
    details: [
      { label: '歷史', text: '以 1934 年電影《瘦人》角色命名' },
      { label: '優點', text: '比 Martini 杯優雅且不易灑出' },
    ],
    proTip: '近年快速取代 Martini 杯的趨勢',
  },

  /* ── 長飲杯 ── */
  {
    id: 5,
    emoji: '🥛',
    nameZh: '高球杯',
    nameEn: 'Highball Glass',
    capacity: '240–350 ml',
    category: '長飲杯',
    traits: '高而直、薄壁',
    usage: ['Highball', 'Gin & Tonic', 'Mojito', 'Tom Collins'],
    details: [
      { label: '設計理由', text: '高度保持碳酸、直筒型便於攪拌' },
    ],
    proTip: '日式酒吧對高球杯的講究堪稱藝術',
  },
  {
    id: 6,
    emoji: '🧊',
    nameZh: '柯林斯杯',
    nameEn: 'Collins Glass',
    capacity: '300–420 ml',
    category: '長飲杯',
    traits: '比高球杯更高更窄',
    usage: ['Tom Collins', 'John Collins', 'Fizz 類'],
    details: [
      { label: '與 Highball 差異', text: '更窄更高，氣泡保持更久' },
    ],
    proTip: '適合所有帶氣泡的長飲調酒',
  },
  {
    id: 7,
    emoji: '🍹',
    nameZh: '颶風杯',
    nameEn: 'Hurricane Glass',
    capacity: '420–600 ml',
    category: '長飲杯',
    traits: '曲線花瓶型、大容量',
    usage: ['Hurricane', 'Piña Colada', 'Singapore Sling'],
    details: [
      { label: '歷史', text: "源自紐奧良 Pat O'Brien's 酒吧" },
    ],
    proTip: '專為熱帶調酒設計',
  },
  {
    id: 8,
    emoji: '🫙',
    nameZh: '銅杯',
    nameEn: 'Copper Mug',
    capacity: '350 ml',
    category: '長飲杯',
    traits: '銅製、附把手、極速降溫',
    usage: ['Moscow Mule'],
    details: [
      { label: '科學', text: '銅的導熱性讓杯壁極速變冷，提升冰涼感' },
    ],
    proTip: '真正的銅杯內壁應有錫或鎳塗層（食品安全）',
  },

  /* ── 葡萄酒杯 ── */
  {
    id: 9,
    emoji: '🍷',
    nameZh: '波爾多杯',
    nameEn: 'Bordeaux Glass',
    capacity: '450–750 ml',
    category: '葡萄酒杯',
    traits: '高杯身、寬杯肚、較窄杯口',
    usage: ['Cabernet Sauvignon', 'Merlot', '厚重紅酒'],
    details: [
      { label: '設計理由', text: '引導酒液至舌尖（甜味區），中和單寧' },
    ],
    proTip: '適合單寧強烈的年輕紅酒',
  },
  {
    id: 10,
    emoji: '🍷',
    nameZh: '勃根地杯',
    nameEn: 'Burgundy Glass',
    capacity: '500–800 ml',
    category: '葡萄酒杯',
    traits: '更圓更寬的杯肚',
    usage: ['Pinot Noir', '輕盈芳香紅酒'],
    details: [
      { label: '設計理由', text: '大杯肚增加空氣接觸面，釋放細膩香氣' },
    ],
    proTip: '輕輕搖杯讓香氣綻放',
  },
  {
    id: 11,
    emoji: '🥂',
    nameZh: '笛型香檳杯',
    nameEn: 'Champagne Flute',
    capacity: '150–210 ml',
    category: '葡萄酒杯',
    traits: '狹長杯身、極小杯口',
    usage: ['Champagne', 'Prosecco', 'French 75'],
    details: [
      { label: '設計理由', text: '最小化氣泡逸散面積' },
    ],
    proTip: '倒酒時傾斜杯身可保留更多氣泡',
  },
  {
    id: 12,
    emoji: '🍾',
    nameZh: '白酒杯',
    nameEn: 'White Wine Glass',
    capacity: '300–400 ml',
    category: '葡萄酒杯',
    traits: '比紅酒杯小、杯口較窄',
    usage: ['Chardonnay', 'Sauvignon Blanc', 'Riesling'],
    details: [
      { label: '設計理由', text: '較小容量保持低溫、窄口聚集柑橘花香' },
    ],
    proTip: '白酒杯的杯腳更長，方便持握不傳溫',
  },

  /* ── 特殊杯型 ── */
  {
    id: 13,
    emoji: '🌿',
    nameZh: '朱利普杯',
    nameEn: 'Julep Cup',
    capacity: '300 ml',
    category: '特殊杯型',
    traits: '銀製或不鏽鋼、無把手',
    usage: ['Mint Julep'],
    details: [
      { label: '歷史', text: 'Kentucky Derby 的象徵' },
    ],
    proTip: '金屬杯壁結霜是正確服務的標誌',
  },
  {
    id: 14,
    emoji: '🍵',
    nameZh: 'Tiki Mug',
    nameEn: 'Tiki Mug',
    capacity: '350–500 ml',
    category: '特殊杯型',
    traits: '陶瓷雕塑造型（提基神像、骷髏頭等）',
    usage: ['Zombie', 'Mai Tai', 'Scorpion Bowl'],
    details: [
      { label: '文化', text: 'Polynesian Pop 文化產物，收藏品市場龐大' },
    ],
    proTip: '每間 Tiki Bar 都有獨家杯型，值得收藏',
  },
  {
    id: 15,
    emoji: '🫖',
    nameZh: '愛爾蘭咖啡杯',
    nameEn: 'Irish Coffee Glass',
    capacity: '240 ml',
    category: '特殊杯型',
    traits: '透明耐熱玻璃、附把手',
    usage: ['Irish Coffee', 'Hot Toddy', '熱調酒'],
    details: [
      { label: '設計理由', text: '耐熱且可展示分層效果' },
    ],
    proTip: '預熱杯身可延長飲品溫度',
  },
  {
    id: 16,
    emoji: '🥄',
    nameZh: '甜酒杯',
    nameEn: 'Cordial / Liqueur Glass',
    capacity: '30–60 ml',
    category: '特殊杯型',
    traits: '極小容量、精緻',
    usage: ['純飲利口酒', 'B-52 Shooter', 'Pousse-café'],
    details: [
      { label: '用途', text: '層次調酒的最佳展示杯' },
    ],
    proTip: '製作分層時沿杯壁或湯匙背緩倒',
  },
]

/* ------------------------------------------------------------------ */
/*  Selection‑guide rows                                               */
/* ------------------------------------------------------------------ */

const GUIDE_ROWS: { scenario: string; glass: string }[] = [
  { scenario: '短飲 + 無冰', glass: 'Coupe / Nick & Nora' },
  { scenario: '短飲 + 大冰', glass: 'Rocks / DOF' },
  { scenario: '長飲 + 碳酸', glass: 'Highball / Collins' },
  { scenario: '熱帶風情', glass: 'Hurricane / Tiki' },
  { scenario: '烈酒純飲', glass: 'Glencairn / Snifter' },
  { scenario: '紅酒', glass: 'Bordeaux / Burgundy' },
  { scenario: '氣泡', glass: 'Flute / Coupe' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function categoryColor(cat: Category): string {
  switch (cat) {
    case '短飲杯': return 'border-neon-amber text-neon-amber'
    case '長飲杯': return 'border-neon-cyan text-neon-cyan'
    case '葡萄酒杯': return 'border-purple-400 text-purple-400'
    case '特殊杯型': return 'border-emerald-400 text-emerald-400'
  }
}

function categoryBg(cat: Category): string {
  switch (cat) {
    case '短飲杯': return 'bg-neon-amber/10'
    case '長飲杯': return 'bg-neon-cyan/10'
    case '葡萄酒杯': return 'bg-purple-400/10'
    case '特殊杯型': return 'bg-emerald-400/10'
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GlasswarePage() {
  const [filter, setFilter] = useState<Category | 'all'>('all')

  const filtered =
    filter === 'all'
      ? GLASSWARE
      : GLASSWARE.filter((g) => g.category === filter)

  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="glassware" />

      {/* ── Hero ── */}
      <section className="relative px-6 pt-20 pb-12 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="inline-flex items-center gap-1 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors duration-200 mb-8"
        >
          ← 返回學院
        </Link>

        <div className="animate-fade-in-up">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            The Art of Glassware
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-gradient-amber mb-4">
            🥂 杯型百科
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-3xl leading-relaxed">
            正確的杯型能提升 30% 的品飲體驗——選對杯子，是調酒師的基本功
          </p>
          <div className="divider-amber mt-8" />
        </div>

        {/* ── Filter Tabs ── */}
        <div className="mt-10 flex flex-wrap gap-3 animate-fade-in-up-delay-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`
                px-5 py-2 rounded-sm font-mono text-sm tracking-wider border transition-all duration-300
                ${
                  filter === cat.value
                    ? 'btn-neon-amber bg-neon-amber text-bg-primary'
                    : 'border-charcoal-700 text-charcoal-400 hover:border-neon-amber hover:text-neon-amber'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Cards Grid ── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((g, idx) => (
            <article
              key={g.id}
              className="glass-card p-8 hover:border-neon-amber/60 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.07}s`, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <span className="text-5xl shrink-0 drop-shadow-lg" role="img" aria-label={g.nameEn}>
                  {g.emoji}
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl md:text-2xl text-text-primary leading-tight mb-1">
                    {g.nameZh}
                  </h2>
                  <p className="font-mono text-xs text-neon-cyan tracking-wide">
                    {g.nameEn}
                  </p>
                </div>
              </div>

              {/* Capacity badge + Category badge */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 rounded-sm text-xs font-mono border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/5">
                  {g.capacity}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-sm text-xs font-mono border ${categoryColor(g.category)} ${categoryBg(g.category)}`}
                >
                  {g.category}
                </span>
              </div>

              {/* Traits */}
              <p className="text-text-secondary text-sm mb-4">
                <span className="text-charcoal-400 font-mono text-xs mr-1">特徵</span>{' '}
                {g.traits}
              </p>

              {/* Usage pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {g.usage.map((u) => (
                  <span
                    key={u}
                    className="px-3 py-1 rounded-sm text-xs font-mono bg-charcoal-800/60 border border-charcoal-700 text-charcoal-300"
                  >
                    {u}
                  </span>
                ))}
              </div>

              {/* Detail rows */}
              <div className="space-y-2 mb-5">
                {g.details.map((d) => (
                  <div key={d.label} className="text-sm">
                    <span className="font-mono text-xs text-neon-amber mr-2">{d.label}:</span>
                    <span className="text-text-secondary">{d.text}</span>
                  </div>
                ))}
              </div>

              {/* Pro Tip */}
              <div className="rounded-sm border border-neon-amber/20 bg-neon-amber/5 px-4 py-3">
                <p className="text-sm">
                  <span className="font-mono text-neon-amber text-xs mr-2">💡 Pro Tip:</span>
                  <span className="text-text-secondary">{g.proTip}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Selection Guide ── */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="animate-fade-in-up">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            Selection Guide
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-gradient-amber mb-2">
            🧭 杯型選擇指南
          </h2>
          <p className="text-text-secondary mb-8">
            根據飲品特性快速找到最適杯型
          </p>
          <div className="divider-amber mb-10" />
        </div>

        <div className="glass-card overflow-hidden animate-fade-in-up-delay-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-charcoal-700">
                <th className="px-6 py-4 font-mono text-xs tracking-wider text-neon-amber uppercase">
                  飲品情境 Scenario
                </th>
                <th className="px-6 py-4 font-mono text-xs tracking-wider text-neon-cyan uppercase">
                  推薦杯型 Glass
                </th>
              </tr>
            </thead>
            <tbody>
              {GUIDE_ROWS.map((row, idx) => (
                <tr
                  key={row.scenario}
                  className={`border-b border-charcoal-700/50 transition-colors duration-200 hover:bg-neon-amber/5 ${
                    idx % 2 === 0 ? 'bg-charcoal-800/20' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-text-primary font-medium">
                    {row.scenario}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-neon-cyan">
                    {row.glass}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
