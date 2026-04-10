'use client'

import { useState } from 'react'
import Link from 'next/link'
import AcademyTracker from '../../../components/AcademyTracker'

/* ================================================================
   清酒百科 — Sake Encyclopedia
   ================================================================ */

type TabKey = 'basics' | 'classification' | 'brewing' | 'tasting' | 'breweries' | 'cocktails'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'basics',         label: '基礎知識' },
  { key: 'classification', label: '分類系統' },
  { key: 'brewing',        label: '釀造製程' },
  { key: 'tasting',        label: '品飲指南' },
  { key: 'breweries',      label: '著名酒造' },
  { key: 'cocktails',      label: '清酒調酒' },
]

/* ── Tab 1: 基礎知識 ──────────────────────────────────────── */

const coreIngredients = [
  {
    emoji: '🌾',
    name: '酒米 (Sakamai)',
    desc: '特殊品種，粒大心白明顯',
  },
  {
    emoji: '💧',
    name: '水 (Mizu)',
    desc: '軟水＝甘口、硬水＝辛口',
  },
  {
    emoji: '🫘',
    name: '米麴 (Koji)',
    desc: '黴菌分解澱粉為糖',
  },
  {
    emoji: '🧫',
    name: '酵母 (Kobo)',
    desc: '將糖轉化為酒精',
  },
]

const basicsFacts = [
  {
    emoji: '🍶',
    title: '什麼是清酒',
    desc: '以米、水、米麴、酵母釀造的日本國酒',
  },
  {
    emoji: '📜',
    title: '歷史',
    desc: '2000+ 年歷史，起源於神社祭祀',
  },
  {
    emoji: '🔬',
    title: '酒精濃度',
    desc: '通常 14–18%（比葡萄酒略高）',
  },
  {
    emoji: '🏷️',
    title: '日本酒 vs 清酒',
    desc: '所有清酒都是日本酒，但日本酒也包括梅酒、燒酒等',
  },
]

/* ── Tab 2: 分類系統 ──────────────────────────────────────── */

interface Grade {
  name: string
  en: string
  ratio: string
  note: string
  style: string
}

const gradeTable: Grade[] = [
  { name: '純米大吟釀', en: 'Junmai Daiginjo', ratio: '≤50%', note: '最高級，只用米＋水＋麴', style: '華麗果香、極致細膩' },
  { name: '大吟釀',     en: 'Daiginjo',        ratio: '≤50%', note: '可添加釀造酒精',       style: '芳香、輕盈、複雜' },
  { name: '純米吟釀',   en: 'Junmai Ginjo',     ratio: '≤60%', note: '純米，吟釀等級',       style: '果香、花香、均衡' },
  { name: '吟釀',       en: 'Ginjo',            ratio: '≤60%', note: '可添加少量酒精',       style: '清香、細緻' },
  { name: '特別純米',   en: 'Tokubetsu Junmai', ratio: '≤60% 或特殊工藝', note: '純米、特別製法', style: '米香豐富、濃郁' },
  { name: '純米',       en: 'Junmai',           ratio: '無限制', note: '純米＋水＋麴',        style: '醇厚、米味突出' },
  { name: '本釀造',     en: 'Honjozo',          ratio: '≤70%', note: '添加少量酒精',         style: '清爽、入門' },
]

interface FlavorType {
  emoji: string
  name: string
  en: string
  desc: string
  examples: string
  serve: string
  color: string
}

const flavorTypes: FlavorType[] = [
  { emoji: '🌸', name: '薫酒', en: 'Kunshu', desc: '華麗果香型', examples: '大吟釀、吟釀', serve: '白酒杯品飲', color: '#E8A0BF' },
  { emoji: '❄️', name: '爽酒', en: 'Soshu',  desc: '清爽淡麗型', examples: '本釀造、生酒', serve: '冰鎮飲用',   color: '#7EC8E3' },
  { emoji: '🍚', name: '醇酒', en: 'Junshu', desc: '濃醇豐滿型', examples: '純米、山廢',   serve: '常溫或溫酒',  color: '#F5A623' },
  { emoji: '🏺', name: '熟酒', en: 'Jukushu', desc: '熟成複雜型', examples: '古酒、長期熟成', serve: '室溫或溫酒', color: '#C69C6D' },
]

interface SpecialType {
  emoji: string
  name: string
  en: string
  desc: string
}

const specialTypes: SpecialType[] = [
  { emoji: '💎', name: '生酒',     en: 'Namazake',      desc: '未經殺菌，需冷藏，清新活潑' },
  { emoji: '☁️', name: '濁酒',     en: 'Nigorizake',    desc: '未完全過濾，乳白色，米香濃郁' },
  { emoji: '🪵', name: '樽酒',     en: 'Taruzake',      desc: '杉木桶貯存，帶有木香' },
  { emoji: '🏛️', name: '古酒',     en: 'Koshu',         desc: '長期熟成（3–10年+），類似雪莉酒' },
  { emoji: '🫧', name: '發泡清酒', en: 'Sparkling Sake', desc: '含碳酸，如日本的香檳' },
]

/* ── Tab 3: 釀造製程 ──────────────────────────────────────── */

interface BrewStep {
  num: number
  title: string
  en: string
  desc: string
  detail?: string[]
}

const brewingSteps: BrewStep[] = [
  {
    num: 1,
    title: '精米',
    en: 'Seimai',
    desc: '外層蛋白質脂肪會產生雜味，磨掉越多越純淨',
  },
  {
    num: 2,
    title: '洗米・浸漬',
    en: 'Senmai / Shinseki',
    desc: '精確控制吸水率，以秒計算',
  },
  {
    num: 3,
    title: '蒸米',
    en: 'Mushimai',
    desc: '外硬內軟的理想狀態',
  },
  {
    num: 4,
    title: '製麴',
    en: 'Seikiku',
    desc: '在溫度控制的麴室中培養 48 小時，最關鍵步驟',
  },
  {
    num: 5,
    title: '酒母',
    en: 'Shubo / Moto',
    desc: '培養濃縮酵母菌群',
    detail: [
      '速釀系 (Sokujo)：添加乳酸，2 週完成',
      '山廢系 (Yamahai)：天然乳酸菌發酵，4 週，風味更複雜',
      '生酛系 (Kimoto)：最傳統，手工搗碎米飯，風味最深沉',
    ],
  },
  {
    num: 6,
    title: '醪',
    en: 'Moromi',
    desc: '三段仕込（三次投料），平行複式發酵（世界獨有）',
  },
  {
    num: 7,
    title: '上槽',
    en: 'Joso',
    desc: '壓榨分離酒液與酒粕',
    detail: [
      '袋吊 (Fukurozuri)：最高級，自然滴落',
      '薮田式 (Yabuta)：機械壓榨',
    ],
  },
  {
    num: 8,
    title: '殺菌・貯藏',
    en: 'Hi-ire / Chozo',
    desc: '加熱至 65°C 殺菌，儲存熟成',
  },
]

/* ── Tab 4: 品飲指南 ──────────────────────────────────────── */

interface TempRange {
  name: string
  romaji: string
  temp: string
  color: string
}

const temperatureScale: TempRange[] = [
  { name: '雪冷え',  romaji: 'Yukihie',    temp: '5°C',   color: '#A0D8EF' },
  { name: '花冷え',  romaji: 'Hanahie',    temp: '10°C',  color: '#7EC8E3' },
  { name: '涼冷え',  romaji: 'Suzuhie',    temp: '15°C',  color: '#5BB8D4' },
  { name: '常温',    romaji: 'Joon',       temp: '20°C',  color: '#E8D5B7' },
  { name: '日向燗',  romaji: 'Hinatacan',  temp: '30°C',  color: '#F5C88C' },
  { name: '人肌燗',  romaji: 'Hitohadacan', temp: '35°C', color: '#F5A623' },
  { name: 'ぬる燗',  romaji: 'Nurucan',    temp: '40°C',  color: '#E8874A' },
  { name: '上燗',    romaji: 'Jocan',      temp: '45°C',  color: '#D66A3A' },
  { name: '熱燗',    romaji: 'Atsucan',    temp: '50°C',  color: '#C04B2D' },
  { name: '飛切燗',  romaji: 'Tobikiri',   temp: '55°C+', color: '#A03020' },
]

const tastingSteps = [
  { emoji: '👁️', step: '觀色', desc: '清澈度、色澤（透明～琥珀）' },
  { emoji: '👃', step: '聞香', desc: '上立香（杯中直接香氣）、含香（口中香氣）' },
  { emoji: '👅', step: '入口', desc: '甘辛度、酸度、旨味、質感' },
  { emoji: '✨', step: '餘韻', desc: '留存時間、回甘、變化' },
]

const drinkware = [
  { emoji: '🔵', name: '蛇目杯', en: 'Janome', desc: '鑑定用，白底藍圈' },
  { emoji: '🍶', name: '豬口杯', en: 'Ochoko', desc: '最常見的小型酒杯' },
  { emoji: '🫗', name: '片口',   en: 'Katakuchi', desc: '單嘴注酒器' },
  { emoji: '📦', name: '升',     en: 'Masu', desc: '木製方杯，節慶用' },
]

const pairings = [
  { food: '刺身',   match: '淡麗辛口', icon: '🐟' },
  { food: '天婦羅', match: '吟釀',     icon: '🍤' },
  { food: '烤物',   match: '純米',     icon: '🍖' },
  { food: '火鍋',   match: '燗酒',     icon: '🫕' },
]

/* ── Tab 5: 著名酒造 ──────────────────────────────────────── */

interface Brewery {
  rank: number
  name: string
  en: string
  region: string
  company: string
  desc: string
  accent: string
}

const breweries: Brewery[] = [
  { rank: 1,  name: '獺祭',   en: 'Dassai',    region: '山口縣', company: '旭酒造',         desc: '純米大吟釀專門',    accent: '#F5A623' },
  { rank: 2,  name: '十四代', en: 'Juyondai',  region: '山形縣', company: '高木酒造',       desc: '夢幻逸品',          accent: '#E8A0BF' },
  { rank: 3,  name: '久保田', en: 'Kubota',    region: '新潟縣', company: '朝日酒造',       desc: '淡麗辛口代表',      accent: '#7EC8E3' },
  { rank: 4,  name: '八海山', en: 'Hakkaisan', region: '新潟縣', company: '八海釀造',       desc: '雪國名酒',          accent: '#A0D8EF' },
  { rank: 5,  name: '而今',   en: 'Jikon',     region: '三重縣', company: '木屋正酒造',     desc: '新世代王者',        accent: '#9B59B6' },
  { rank: 6,  name: '黑龍',   en: 'Kokuryu',   region: '福井縣', company: '黑龍酒造',       desc: '石田屋傳說',        accent: '#4A4A4A' },
  { rank: 7,  name: '新政',   en: 'Aramasa',   region: '秋田縣', company: '新政酒造',       desc: '革新派領袖',        accent: '#00FFCC' },
  { rank: 8,  name: '田酒',   en: 'Denshu',    region: '青森縣', company: '西田酒造',       desc: '用米說話',          accent: '#C69C6D' },
  { rank: 9,  name: '飛露喜', en: 'Hiroki',    region: '福島縣', company: '廣木酒造',       desc: '復興傳奇',          accent: '#E06C75' },
  { rank: 10, name: '作',     en: 'Zaku',      region: '三重縣', company: '清水清三郎商店', desc: 'G7 乾杯酒',        accent: '#D4AF37' },
]

/* ── Tab 6: 清酒調酒 ──────────────────────────────────────── */

interface Cocktail {
  name: string
  nameEn: string
  emoji: string
  ingredients: string[]
  method: string
  color: string
}

const sakeCocktails: Cocktail[] = [
  {
    name: '清酒馬丁尼',
    nameEn: 'Sake Martini',
    emoji: '🍸',
    ingredients: ['清酒 60ml', 'Dry Vermouth 15ml', '柚子皮'],
    method: '攪拌法，冰鎮馬丁尼杯，柚子皮裝飾',
    color: '#F5A623',
  },
  {
    name: '清酒莫西多',
    nameEn: 'Sake Mojito',
    emoji: '🌿',
    ingredients: ['清酒 60ml', '薄荷', '萊姆', '蘇打水'],
    method: '輕搗薄荷與萊姆，加入清酒與冰，蘇打水補滿',
    color: '#2ECC71',
  },
  {
    name: '柚子清酒氣泡',
    nameEn: 'Yuzu Sake Spritz',
    emoji: '🍊',
    ingredients: ['清酒 90ml', '柚子汁 15ml', '氣泡水'],
    method: '直調法，先倒清酒與柚子汁，再加氣泡水',
    color: '#F39C12',
  },
  {
    name: '清酒血腥瑪麗',
    nameEn: 'Sake Bloody Mary',
    emoji: '🍅',
    ingredients: ['清酒 90ml', '番茄汁', '山葵'],
    method: '滾動法，加入山葵替代辣醬，日式風味',
    color: '#E74C3C',
  },
  {
    name: '清酒老時髦',
    nameEn: 'Sake Old Fashioned',
    emoji: '🥃',
    ingredients: ['清酒 90ml', '梅酒 15ml', '柚子苦精'],
    method: '攪拌法，大冰球，柚子皮捲裝飾',
    color: '#C69C6D',
  },
  {
    name: '清酒嗨棒',
    nameEn: 'Sake Highball',
    emoji: '🥂',
    ingredients: ['清酒 60ml', '通寧水 120ml', '紫蘇葉'],
    method: '直調法，高球杯，紫蘇葉輕拍釋放香氣',
    color: '#9B59B6',
  },
]

/* ================================================================
   Sub-components
   ================================================================ */

function SectionHeader({
  emoji,
  title,
  eng,
}: {
  emoji: string
  title: string
  eng: string
}) {
  return (
    <div className="mb-8">
      <div className="divider-amber mb-8" />
      <h2 className="font-display text-2xl md:text-3xl text-text-warm">
        <span className="mr-3">{emoji}</span>
        {title}
        <span className="font-mono text-sm text-charcoal-500 ml-3">{eng}</span>
      </h2>
    </div>
  )
}

/* ================================================================
   Page Component
   ================================================================ */

export default function SakeEncyclopediaPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('basics')

  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="sake" />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-12 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回學院
        </Link>

        <div className="mt-8 text-center">
          <p className="font-mono text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in"
             style={{ color: '#E8A0BF' }}>
            Sake Encyclopedia
          </p>
          <h1 className="font-display text-4xl md:text-6xl text-gradient-amber leading-tight mb-4 animate-fade-in">
            🍶 清酒百科
          </h1>
          <p className="font-mono text-sm mb-2 animate-fade-in" style={{ color: '#E8A0BF' }}>
            Sake Encyclopedia
          </p>
          <p className="text-text-secondary max-w-2xl mx-auto text-base md:text-lg animate-fade-in">
            日本千年釀造智慧——從米粒到杯中的完美旅程
          </p>
        </div>

        <div className="divider-amber mx-auto mt-10 mb-2" />
      </section>

      {/* ── Tab Navigation ───────────────────────────────── */}
      <nav className="sticky top-16 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-charcoal-800">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-mono text-xs transition-all duration-300 ${
                activeTab === t.key
                  ? 'border text-neon-amber'
                  : 'text-charcoal-500 hover:text-text-primary border border-transparent'
              }`}
              style={
                activeTab === t.key
                  ? { background: 'rgba(245,166,35,0.12)', borderColor: 'rgba(245,166,35,0.4)' }
                  : undefined
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content Area ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-24">

        {/* ════════════════════════════════════════════════════
            Tab 1 — 基礎知識
           ════════════════════════════════════════════════════ */}
        {activeTab === 'basics' && (
          <section className="pt-16 animate-fade-in">
            <SectionHeader emoji="📖" title="基礎知識" eng="Sake Basics" />

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {basicsFacts.map((f, i) => (
                <div
                  key={f.title}
                  className="glass-card p-6 group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                    {f.emoji}
                  </span>
                  <h3 className="font-display text-xl text-text-warm group-hover:text-neon-amber transition-colors mb-2">
                    {f.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Core Ingredients */}
            <h3 className="font-display text-xl text-text-warm mb-6">
              🧬 核心原料
              <span className="font-mono text-xs text-charcoal-500 ml-2">Core Ingredients</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {coreIngredients.map((ing, i) => (
                <div
                  key={ing.name}
                  className="glass-card p-6 text-center group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                    {ing.emoji}
                  </span>
                  <h4 className="font-display text-lg text-text-warm mb-1">{ing.name}</h4>
                  <p className="text-text-secondary text-sm">{ing.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            Tab 2 — 分類系統
           ════════════════════════════════════════════════════ */}
        {activeTab === 'classification' && (
          <section className="pt-16 animate-fade-in">
            <SectionHeader emoji="📊" title="分類系統" eng="Classification System" />

            {/* Grade Table */}
            <h3 className="font-display text-xl text-text-warm mb-6">
              精米步合分類
              <span className="font-mono text-xs text-charcoal-500 ml-2">By Seimaibuai (Rice Polishing Ratio)</span>
            </h3>
            <div className="glass-card overflow-x-auto mb-12">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-700">
                    <th className="text-left p-4 font-mono text-xs text-neon-amber tracking-wider">等級</th>
                    <th className="text-left p-4 font-mono text-xs text-neon-amber tracking-wider">精米步合</th>
                    <th className="text-left p-4 font-mono text-xs text-neon-amber tracking-wider hidden sm:table-cell">說明</th>
                    <th className="text-left p-4 font-mono text-xs tracking-wider hidden md:table-cell" style={{ color: '#E8A0BF' }}>風格</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeTable.map((g, i) => (
                    <tr
                      key={g.en}
                      className="border-b border-charcoal-800 hover:bg-neon-amber/5 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-display text-text-warm">{g.name}</span>
                        <br />
                        <span className="font-mono text-xs text-charcoal-500">{g.en}</span>
                      </td>
                      <td className="p-4 font-mono text-neon-amber">{g.ratio}</td>
                      <td className="p-4 text-text-secondary hidden sm:table-cell">{g.note}</td>
                      <td className="p-4 hidden md:table-cell" style={{ color: '#E8A0BF' }}>{g.style}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Flavor Types */}
            <h3 className="font-display text-xl text-text-warm mb-6">
              風味分類
              <span className="font-mono text-xs text-charcoal-500 ml-2">Flavor Types</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {flavorTypes.map((ft, i) => (
                <div
                  key={ft.en}
                  className="glass-card p-6 group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s`, borderLeftWidth: '3px', borderLeftColor: ft.color }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{ft.emoji}</span>
                    <div>
                      <h4 className="font-display text-lg text-text-warm">{ft.name}</h4>
                      <span className="font-mono text-xs" style={{ color: ft.color }}>{ft.en}</span>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm mb-2">{ft.desc}</p>
                  <p className="font-mono text-xs text-charcoal-500">代表：{ft.examples}</p>
                  <p className="font-mono text-xs mt-1" style={{ color: '#E8A0BF' }}>🍷 {ft.serve}</p>
                </div>
              ))}
            </div>

            {/* Special Types */}
            <h3 className="font-display text-xl text-text-warm mb-6">
              特殊類型
              <span className="font-mono text-xs text-charcoal-500 ml-2">Special Types</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {specialTypes.map((st, i) => (
                <div
                  key={st.en}
                  className="glass-card p-5 group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <span className="text-3xl mb-2 block">{st.emoji}</span>
                  <h4 className="font-display text-lg text-text-warm">{st.name}</h4>
                  <p className="font-mono text-xs text-charcoal-500 mb-2">{st.en}</p>
                  <p className="text-text-secondary text-sm">{st.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            Tab 3 — 釀造製程
           ════════════════════════════════════════════════════ */}
        {activeTab === 'brewing' && (
          <section className="pt-16 animate-fade-in">
            <SectionHeader emoji="🏭" title="釀造製程" eng="Brewing Process" />

            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-6 top-0 bottom-0 w-px hidden md:block"
                style={{ background: 'linear-gradient(to bottom, #F5A623, #E8A0BF)' }}
              />

              <div className="space-y-6">
                {brewingSteps.map((s, i) => (
                  <div
                    key={s.num}
                    className="glass-card p-6 md:ml-14 relative group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {/* Step number dot */}
                    <div
                      className="hidden md:flex absolute -left-[3.75rem] top-6 w-10 h-10 rounded-full items-center justify-center font-mono text-sm font-bold border-2 z-10"
                      style={{
                        borderColor: '#F5A623',
                        color: '#F5A623',
                        backgroundColor: 'var(--color-bg-primary)',
                      }}
                    >
                      {s.num}
                    </div>

                    <div className="flex items-start gap-4">
                      <span
                        className="md:hidden flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border"
                        style={{ borderColor: '#F5A623', color: '#F5A623' }}
                      >
                        {s.num}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-display text-xl text-text-warm group-hover:text-neon-amber transition-colors">
                          {s.title}
                          <span className="font-mono text-xs text-charcoal-500 ml-2">{s.en}</span>
                        </h3>
                        <p className="text-text-secondary text-sm mt-2 leading-relaxed">{s.desc}</p>

                        {s.detail && (
                          <ul className="mt-3 space-y-1">
                            {s.detail.map((d) => (
                              <li key={d} className="text-sm flex items-start gap-2">
                                <span style={{ color: '#E8A0BF' }}>▸</span>
                                <span className="text-text-secondary">{d}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            Tab 4 — 品飲指南
           ════════════════════════════════════════════════════ */}
        {activeTab === 'tasting' && (
          <section className="pt-16 animate-fade-in">
            <SectionHeader emoji="🎌" title="品飲指南" eng="Tasting Guide" />

            {/* Temperature Scale */}
            <h3 className="font-display text-xl text-text-warm mb-6">
              🌡️ 溫度帶
              <span className="font-mono text-xs text-charcoal-500 ml-2">Temperature Spectrum</span>
            </h3>
            <div className="glass-card p-6 mb-12">
              <div className="space-y-2">
                {temperatureScale.map((t, i) => {
                  const pct = (i / (temperatureScale.length - 1)) * 100
                  return (
                    <div
                      key={t.romaji}
                      className="flex items-center gap-4 py-2 group animate-fade-in"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div
                        className="w-14 h-8 rounded flex items-center justify-center font-mono text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: t.color + '25', color: t.color, border: `1px solid ${t.color}50` }}
                      >
                        {t.temp}
                      </div>
                      <div className="flex-1">
                        <div className="h-3 rounded-full bg-charcoal-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: t.color }}
                          />
                        </div>
                      </div>
                      <div className="w-28 text-right">
                        <span className="font-display text-sm text-text-warm">{t.name}</span>
                        <br />
                        <span className="font-mono text-xs text-charcoal-500">{t.romaji}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-4 font-mono text-xs text-charcoal-500">
                <span>❄️ 冷</span>
                <span>🔥 熱</span>
              </div>
            </div>

            {/* Tasting Steps */}
            <h3 className="font-display text-xl text-text-warm mb-6">
              品飲步驟
              <span className="font-mono text-xs text-charcoal-500 ml-2">Tasting Steps</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {tastingSteps.map((ts, i) => (
                <div
                  key={ts.step}
                  className="glass-card p-5 text-center group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-4xl block mb-2">{ts.emoji}</span>
                  <h4 className="font-display text-lg text-text-warm mb-1">{ts.step}</h4>
                  {i < tastingSteps.length - 1 && (
                    <span className="hidden md:inline-block absolute -right-3 top-1/2 text-charcoal-600">→</span>
                  )}
                  <p className="text-text-secondary text-xs leading-relaxed">{ts.desc}</p>
                </div>
              ))}
            </div>

            {/* Drinkware */}
            <h3 className="font-display text-xl text-text-warm mb-6">
              品飲器具
              <span className="font-mono text-xs text-charcoal-500 ml-2">Sake Vessels</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {drinkware.map((dw, i) => (
                <div
                  key={dw.en}
                  className="glass-card p-5 text-center group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-4xl block mb-2">{dw.emoji}</span>
                  <h4 className="font-display text-base text-text-warm">{dw.name}</h4>
                  <p className="font-mono text-xs text-charcoal-500 mb-1">{dw.en}</p>
                  <p className="text-text-secondary text-xs">{dw.desc}</p>
                </div>
              ))}
            </div>

            {/* Food Pairings */}
            <h3 className="font-display text-xl text-text-warm mb-6">
              佐餐搭配
              <span className="font-mono text-xs text-charcoal-500 ml-2">Food Pairings</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pairings.map((p, i) => (
                <div
                  key={p.food}
                  className="glass-card p-5 text-center group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-4xl block mb-2">{p.icon}</span>
                  <h4 className="font-display text-base text-text-warm">{p.food}</h4>
                  <p className="font-mono text-xs mt-1" style={{ color: '#E8A0BF' }}>→ {p.match}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            Tab 5 — 著名酒造
           ════════════════════════════════════════════════════ */}
        {activeTab === 'breweries' && (
          <section className="pt-16 animate-fade-in">
            <SectionHeader emoji="🏯" title="著名酒造" eng="Famous Breweries" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {breweries.map((b, i) => (
                <div
                  key={b.en}
                  className="glass-card p-6 group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s`, borderLeftWidth: '3px', borderLeftColor: b.accent }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className="inline-block font-mono text-xs font-bold px-2 py-0.5 rounded-full mb-2"
                        style={{ backgroundColor: b.accent + '20', color: b.accent, border: `1px solid ${b.accent}40` }}
                      >
                        #{b.rank}
                      </span>
                      <h3 className="font-display text-2xl text-text-warm group-hover:text-neon-amber transition-colors">
                        {b.name}
                      </h3>
                      <p className="font-mono text-xs text-charcoal-500">{b.en}</p>
                    </div>
                    <span className="text-3xl opacity-30 group-hover:opacity-60 transition-opacity">🍶</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-text-secondary">
                      <span style={{ color: '#E8A0BF' }}>📍</span> {b.region} · {b.company}
                    </p>
                    <p className="text-text-secondary">
                      <span className="text-neon-amber">✦</span> {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            Tab 6 — 清酒調酒
           ════════════════════════════════════════════════════ */}
        {activeTab === 'cocktails' && (
          <section className="pt-16 animate-fade-in">
            <SectionHeader emoji="🍹" title="清酒調酒" eng="Sake Cocktails" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sakeCocktails.map((c, i) => (
                <div
                  key={c.nameEn}
                  className="glass-card p-6 group hover:border-neon-amber transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{c.emoji}</span>
                    <div>
                      <h3 className="font-display text-xl text-text-warm group-hover:text-neon-amber transition-colors">
                        {c.name}
                      </h3>
                      <p className="font-mono text-xs text-charcoal-500">{c.nameEn}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="font-mono text-xs tracking-wider mb-2" style={{ color: '#E8A0BF' }}>
                      材料 INGREDIENTS
                    </p>
                    <ul className="space-y-1">
                      {c.ingredients.map((ing) => (
                        <li key={ing} className="text-text-secondary text-sm flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="rounded p-3 text-sm"
                    style={{ backgroundColor: c.color + '10', border: `1px solid ${c.color}30` }}
                  >
                    <p className="font-mono text-xs tracking-wider mb-1" style={{ color: c.color }}>
                      做法 METHOD
                    </p>
                    <p className="text-text-secondary text-xs leading-relaxed">{c.method}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
