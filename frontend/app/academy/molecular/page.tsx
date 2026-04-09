'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ================================================================
   Data
   ================================================================ */

const sections = [
  { id: 'intro', label: '🧬 什麼是分子調酒' },
  { id: 'techniques', label: '🧪 核心技法' },
  { id: 'equipment', label: '🔧 必備器材' },
  { id: 'safety', label: '⚠️ 安全須知' },
] as const

interface Technique {
  id: string
  emoji: string
  title: string
  en: string
  difficulty: number
  color: string
  principle: string
  types?: string[]
  applications: string[]
  materials?: string
  tools?: string[]
  woodChoices?: { name: string; desc: string }[]
  steps: string[]
  proTip?: string
  warning?: string
  agarNote?: string
  gelatinNote?: string
}

const techniques: Technique[] = [
  {
    id: 'spherification',
    emoji: '🫧',
    title: '球化',
    en: 'Spherification',
    difficulty: 3,
    color: '#9B59B6',
    principle:
      '海藻酸鈉 (Sodium Alginate) + 氯化鈣 (Calcium Chloride) 產生薄膜',
    types: ['基本球化 (Basic Spherification)', '反向球化 (Reverse Spherification)'],
    applications: ['Aperol 球', 'Martini 魚子醬', '爆漿珍珠'],
    materials: '海藻酸鈉 0.5%、氯化鈣 0.5%',
    steps: [
      '混合海藻酸鈉與液體',
      '滴入鈣溶液',
      '靜置30秒',
      '清水沖洗',
    ],
    proTip: '酸性液體需先用檸檬酸鈉中和 pH 值',
  },
  {
    id: 'smoking',
    emoji: '🌫️',
    title: '煙燻',
    en: 'Smoking',
    difficulty: 2,
    color: '#F5A623',
    principle: '木屑燃燒產生煙霧，賦予調酒煙燻風味',
    tools: ['煙燻槍 (Smoking Gun)', '煙燻蓋', '雪松板'],
    woodChoices: [
      { name: 'Cherry 櫻桃木', desc: '甜' },
      { name: 'Hickory 山核桃', desc: '濃' },
      { name: 'Apple 蘋果木', desc: '柔' },
      { name: 'Oak 橡木', desc: '經典' },
    ],
    applications: ['Smoked Old Fashioned', 'Mezcal Negroni'],
    steps: [
      '準備調酒於杯中',
      '蓋上煙燻蓋',
      '點燃木屑注入煙霧',
      '等待30-60秒',
      '開蓋飲用',
    ],
    proTip: '煙燻時間不宜過長，否則會蓋過原味',
  },
  {
    id: 'foam',
    emoji: '🧴',
    title: '泡沫',
    en: 'Foam / Espuma',
    difficulty: 2,
    color: '#00FFFF',
    principle:
      '使用卵磷脂 (Lecithin) 或吉利丁 + N₂O 氣彈 (ISI Whip) 打發',
    types: [
      '輕泡沫 (Lecithin Air)',
      '奶油泡沫 (ISI Espuma)',
      '蛋白泡沫 (Egg White Foam)',
    ],
    applications: ['柑橘泡沫蓋 Margarita', 'Whiskey Sour 泡沫', '抹茶泡沫'],
    materials: '卵磷脂 0.3-0.5%，或吉利丁片 + ISI 氣彈',
    steps: [
      '溶液加入卵磷脂',
      '手持攪拌器45度角打入空氣',
      '靜置30秒讓泡沫穩定',
      '舀取泡沫',
    ],
    proTip: '打發時保持角度，讓空氣持續注入',
  },
  {
    id: 'liquid-nitrogen',
    emoji: '🧊',
    title: '液態氮急凍',
    en: 'Liquid Nitrogen',
    difficulty: 5,
    color: '#00FFFF',
    principle: '-196°C 極速冷卻，瞬間凍結任何液體',
    applications: [
      '即時冰淇淋調酒',
      '冷凍粉碎裝飾',
      '戲劇性煙霧效果',
    ],
    steps: [
      '緩慢倒入液氮至容器',
      '同時攪拌防止結塊',
      '等待煙霧散盡',
      '確認溫度安全後上桌',
    ],
    warning:
      '⚠️ 專業操作，不建議家用。必須等氮氣完全蒸發才能飲用、需防護手套、通風環境。',
  },
  {
    id: 'gelification',
    emoji: '🍮',
    title: '凝膠化',
    en: 'Gelification',
    difficulty: 3,
    color: '#9B59B6',
    principle:
      '洋菜膠 (Agar-Agar)、明膠 (Gelatin)、κ-卡拉膠 (Kappa Carrageenan)',
    applications: ['雞尾酒果凍方塊', '可食用調酒', '層次杯中凝膠'],
    agarNote: '耐高溫 (85°C 才融化)，植物性，質地較脆',
    gelatinNote: '入口即化，動物性，口感滑嫩',
    steps: [
      '液體加入 0.5% agar',
      '加熱至沸騰攪拌2分鐘',
      '倒入模具',
      '室溫凝固',
    ],
  },
  {
    id: 'edible-balloon',
    emoji: '🎈',
    title: '可食用氣球',
    en: 'Edible Balloon',
    difficulty: 4,
    color: '#F5A623',
    principle: '太妃糖加熱 + 氦氣或食用級氣體吹成氣球',
    applications: ['Alinea 餐廳的招牌甜點概念延伸至調酒'],
    steps: [
      '煮糖至155°C',
      '塗在矽膠球上',
      '充氣後脫模',
      '底部沾醬',
    ],
  },
  {
    id: 'saline',
    emoji: '🧂',
    title: 'Saline Solution (鹽水增味)',
    en: 'Saline Solution',
    difficulty: 1,
    color: '#00FFFF',
    principle:
      '20% 鹽水溶液，微量添加可壓制苦味、增強甜感',
    applications: ['2-3 滴加入任何調酒，提升整體風味層次'],
    materials: '20g 鹽 + 80g 水',
    steps: [
      '溶解鹽於熱水',
      '冷卻後裝入滴瓶',
      '每杯加 2-3 滴',
    ],
    proTip: '這是成本最低、效果最顯著的分子技法',
  },
  {
    id: 'fat-washing',
    emoji: '🔥',
    title: '脂洗',
    en: 'Fat-Washing',
    difficulty: 3,
    color: '#F5A623',
    principle:
      '將脂肪（奶油、培根油、芝麻油）浸泡烈酒後冷凍去脂，保留風味',
    applications: ['Bacon Bourbon', 'Butter-Washed Rum', 'Sesame Whisky'],
    steps: [
      '融化脂肪',
      '以 1:4 比例加入烈酒',
      '室溫浸泡4-6小時',
      '冷凍12小時',
      '過濾去除凝固脂肪',
    ],
    proTip: '選擇風味強烈的脂肪效果最好',
  },
]

const equipment = [
  { emoji: '⚖️', name: '精密電子秤', en: 'Precision Scale (0.01g)' },
  { emoji: '💨', name: 'ISI Whip + N₂O 氣彈', en: 'ISI Whip + Chargers' },
  { emoji: '🔫', name: '煙燻槍', en: 'Smoking Gun' },
  { emoji: '🌀', name: '手持攪拌器', en: 'Immersion Blender' },
  { emoji: '💉', name: '滴管 / 注射器', en: 'Pipettes & Syringes' },
  { emoji: '📊', name: 'pH 試紙', en: 'pH Test Strips' },
  { emoji: '🌡️', name: '精密溫度計', en: 'Precision Thermometer' },
]

const safetyRules = [
  {
    emoji: '⚗️',
    title: '劑量精確',
    desc: '化學添加劑用量必須精確，過量可能影響口感甚至安全性。務必使用 0.01g 精密秤。',
  },
  {
    emoji: '🧊',
    title: '液態氮安全',
    desc: '液態氮操作需專業訓練。-196°C 可造成嚴重凍傷，必須等氮氣完全蒸發才能飲用。',
  },
  {
    emoji: '🫘',
    title: '過敏原標示',
    desc: '卵磷脂含大豆成分、明膠含動物蛋白。務必向客人說明所有過敏原。',
  },
  {
    emoji: '✅',
    title: '食品級材料',
    desc: '所有化學材料必須確認為食品級 (Food Grade)。工業級化學品嚴禁使用於調酒。',
  },
]

const pioneers = [
  { name: 'Ferran Adrià', desc: 'elBulli 主廚，分子料理之父' },
  { name: 'Eben Freeman', desc: '紐約 Tailor 酒吧，Fat-Washing 先驅' },
  { name: 'Tony Conigliaro', desc: '倫敦 69 Colebrooke Row，調酒化學家' },
  { name: 'Grant Achatz', desc: 'Alinea 餐廳，可食用氣球創造者' },
]

/* ================================================================
   Sub-components
   ================================================================ */

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="font-mono text-sm tracking-wider">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? 'text-neon-amber' : 'text-charcoal-700'}>
          ⭐
        </span>
      ))}
    </span>
  )
}

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

export default function MolecularMixologyPage() {
  const [activeSection, setActiveSection] = useState<string>('intro')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function scrollTo(id: string) {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-12 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回學院
        </Link>

        <div className="mt-8 text-center">
          <p className="font-mono text-neon-purple text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in">
            Molecular Mixology Lab
          </p>
          <h1 className="font-display text-4xl md:text-6xl text-gradient-amber leading-tight mb-4 animate-fade-in">
            🧪 分子調酒實驗室
          </h1>
          <p className="font-mono text-neon-cyan text-sm mb-2 animate-fade-in">
            Molecular Mixology Lab
          </p>
          <p className="text-text-secondary max-w-2xl mx-auto text-base md:text-lg animate-fade-in">
            當科學遇上調酒——探索前衛技法的極致藝術
          </p>
        </div>

        <div className="divider-amber mx-auto mt-10 mb-2" />
      </section>

      {/* ── Sticky Nav ─────────────────────────────────────── */}
      <nav className="sticky top-16 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-charcoal-800">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-mono text-xs transition-all duration-300 ${
                activeSection === s.id
                  ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/40'
                  : 'text-charcoal-500 hover:text-text-primary border border-transparent'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-24">
        {/* ── Section 1: What is Molecular Mixology ────────── */}
        <section id="intro" className="pt-16 pb-12">
          <SectionHeader
            emoji="🧬"
            title="什麼是分子調酒"
            eng="What is Molecular Mixology"
          />

          {/* History */}
          <div className="glass-card p-6 md:p-8 mb-8 border-l-2 border-neon-purple/60">
            <h3 className="font-display text-lg text-text-warm mb-3">
              起源與歷史
              <span className="font-mono text-xs text-charcoal-500 ml-3">
                Origins & History
              </span>
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              2000年代，受到西班牙名廚{' '}
              <strong className="text-neon-purple">Ferran Adrià</strong>{' '}
              (elBulli) 分子料理革命的啟發，先鋒調酒師們開始將分子料理技術應用於調酒領域，
              開啟了雞尾酒的全新篇章。
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              <strong className="text-neon-cyan">核心理念：</strong>
              改變液體的物理狀態（固態化、氣態化、泡沫化），創造前所未有的感官體驗。
              不只是味覺，更是觸覺、視覺、嗅覺的全方位革命。
            </p>
          </div>

          {/* Pioneers */}
          <h3 className="font-display text-lg text-text-warm mb-4">
            代表人物
            <span className="font-mono text-xs text-charcoal-500 ml-3">
              Pioneers
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pioneers.map((p, i) => (
              <div
                key={p.name}
                className="glass-card p-5 group hover:border-neon-purple transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <p className="font-display text-base text-neon-amber group-hover:text-neon-purple transition-colors mb-1">
                  {p.name}
                </p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Core Techniques ──────────────────── */}
        <section id="techniques" className="pt-16 pb-12">
          <SectionHeader
            emoji="🧪"
            title="核心技法"
            eng="Core Techniques"
          />

          <div className="space-y-5">
            {techniques.map((t, idx) => {
              const isExpanded = expandedId === t.id

              return (
                <div
                  key={t.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* ── Collapsed Card Header ── */}
                  <button
                    onClick={() => toggle(t.id)}
                    className={`w-full text-left glass-card p-5 md:p-7 group transition-all duration-300 ${
                      isExpanded
                        ? 'border-l-2'
                        : 'hover:border-neon-purple'
                    }`}
                    style={isExpanded ? { borderLeftColor: t.color } : undefined}
                  >
                    <div className="flex items-start gap-4 md:gap-6">
                      {/* Number badge */}
                      <div
                        className="shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center border font-mono text-lg md:text-xl font-bold"
                        style={{ borderColor: t.color, color: t.color }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-3xl">{t.emoji}</span>
                          <h3 className="font-display text-xl md:text-2xl text-text-warm group-hover:text-neon-purple transition-colors">
                            {t.title}
                          </h3>
                          <span className="font-mono text-xs text-charcoal-500">
                            {t.en}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-charcoal-500">
                              難度
                            </span>
                            <StarRating rating={t.difficulty} />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {t.applications.slice(0, 2).map((app) => (
                              <span
                                key={app}
                                className="font-mono text-xs bg-bg-tertiary border border-charcoal-700 text-text-secondary px-2 py-0.5 rounded-sm"
                              >
                                {app}
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                          <strong className="text-neon-cyan">原理：</strong>
                          {t.principle}
                        </p>
                      </div>

                      {/* Expand chevron */}
                      <div
                        className={`shrink-0 font-mono text-charcoal-500 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </div>
                    </div>
                  </button>

                  {/* ── Expanded Detail ── */}
                  {isExpanded && (
                    <div className="mt-1 space-y-6 pl-4 md:pl-10 animate-fade-in">
                      {/* Principle */}
                      <div
                        className="glass-card p-5 border-l-2"
                        style={{ borderLeftColor: t.color }}
                      >
                        <p className="text-text-secondary text-sm leading-relaxed">
                          <strong className="text-neon-cyan">原理：</strong>
                          {t.principle}
                        </p>

                        {/* Types */}
                        {t.types && (
                          <div className="mt-3">
                            <span className="font-mono text-xs text-neon-purple font-bold">
                              類型：
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {t.types.map((ty) => (
                                <span
                                  key={ty}
                                  className="font-mono text-xs px-2.5 py-1 border border-neon-purple/30 text-neon-purple bg-neon-purple/5 rounded-sm"
                                >
                                  {ty}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Materials */}
                        {t.materials && (
                          <p className="text-text-secondary text-sm mt-3">
                            <span className="font-mono text-xs text-neon-amber font-bold mr-1">
                              材料：
                            </span>
                            {t.materials}
                          </p>
                        )}

                        {/* Tools */}
                        {t.tools && (
                          <div className="mt-3">
                            <span className="font-mono text-xs text-neon-amber font-bold">
                              工具：
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {t.tools.map((tool) => (
                                <span
                                  key={tool}
                                  className="font-mono text-xs px-2.5 py-1 border border-charcoal-700 text-text-secondary bg-bg-tertiary rounded-sm"
                                >
                                  🔧 {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Wood choices */}
                        {t.woodChoices && (
                          <div className="mt-3">
                            <span className="font-mono text-xs text-neon-amber font-bold">
                              木材選擇：
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {t.woodChoices.map((w) => (
                                <span
                                  key={w.name}
                                  className="font-mono text-xs px-2.5 py-1 border border-neon-amber/30 text-neon-amber bg-neon-amber/5 rounded-sm"
                                >
                                  🪵 {w.name} ({w.desc})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Agar & Gelatin notes */}
                        {t.agarNote && (
                          <div className="mt-3 space-y-1">
                            <p className="text-text-secondary text-sm">
                              <span className="text-neon-cyan font-mono text-xs font-bold mr-1">
                                Agar 特點：
                              </span>
                              {t.agarNote}
                            </p>
                            {t.gelatinNote && (
                              <p className="text-text-secondary text-sm">
                                <span className="text-neon-cyan font-mono text-xs font-bold mr-1">
                                  Gelatin 特點：
                                </span>
                                {t.gelatinNote}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Applications */}
                      <div>
                        <h4 className="font-display text-base text-text-warm mb-3">
                          應用
                          <span className="font-mono text-xs text-charcoal-500 ml-2">
                            Applications
                          </span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {t.applications.map((app) => (
                            <span
                              key={app}
                              className="font-mono text-sm px-3 py-1.5 border border-neon-amber/40 text-neon-amber bg-neon-amber/5 rounded-sm"
                            >
                              🍹 {app}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="font-display text-base text-text-warm mb-3">
                          步驟
                          <span className="font-mono text-xs text-charcoal-500 ml-2">
                            Steps ({t.steps.length})
                          </span>
                        </h4>

                        <div className="relative pl-8">
                          <div
                            className="absolute left-3 top-0 bottom-0 w-px"
                            style={{ backgroundColor: t.color, opacity: 0.3 }}
                          />
                          <div className="space-y-3">
                            {t.steps.map((step, si) => (
                              <div key={si} className="relative">
                                <div
                                  className="absolute -left-8 top-3 w-6 h-6 flex items-center justify-center border-2 bg-bg-primary z-10 text-[10px] font-mono font-bold"
                                  style={{
                                    borderColor: t.color,
                                    color: t.color,
                                  }}
                                >
                                  {si + 1}
                                </div>
                                <div
                                  className="glass-card p-4 border-l-2"
                                  style={{ borderLeftColor: t.color }}
                                >
                                  <p className="text-text-secondary text-sm leading-relaxed">
                                    {step}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pro Tip */}
                      {t.proTip && (
                        <div className="px-4 py-3 border border-neon-cyan/30 bg-neon-cyan/5 rounded-sm">
                          <p className="text-sm leading-relaxed">
                            <span className="text-neon-cyan font-mono text-xs font-bold mr-2">
                              💡 PRO TIP
                            </span>
                            <span className="text-text-secondary">
                              {t.proTip}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Warning */}
                      {t.warning && (
                        <div className="px-4 py-3 border border-red-500/40 bg-red-500/10 rounded-sm">
                          <p className="text-sm leading-relaxed text-red-300">
                            {t.warning}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Section 3: Essential Equipment ──────────────── */}
        <section id="equipment" className="pt-16 pb-12">
          <SectionHeader
            emoji="🔧"
            title="必備器材"
            eng="Essential Equipment"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {equipment.map((eq, i) => (
              <div
                key={eq.en}
                className="glass-card p-5 text-center group hover:border-neon-purple transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                  {eq.emoji}
                </span>
                <p className="font-display text-base text-text-warm group-hover:text-neon-purple transition-colors mb-1">
                  {eq.name}
                </p>
                <p className="font-mono text-[10px] text-charcoal-500 tracking-wider uppercase">
                  {eq.en}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Safety Guidelines ────────────────── */}
        <section id="safety" className="pt-16 pb-12">
          <SectionHeader
            emoji="⚠️"
            title="安全須知"
            eng="Safety Guidelines"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {safetyRules.map((rule, i) => (
              <div
                key={rule.title}
                className="glass-card p-6 border-l-2 border-red-500/50 bg-red-500/[0.03] group hover:border-red-400 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">{rule.emoji}</span>
                  <div>
                    <h3 className="font-display text-lg text-amber-300 group-hover:text-red-300 transition-colors mb-2">
                      {rule.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {rule.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Closing reminder */}
          <div className="mt-8 glass-card p-6 text-center border border-amber-500/30 bg-amber-500/5">
            <p className="text-amber-300 font-mono text-sm">
              ⚠️ 分子調酒涉及化學物質操作，請務必確保所有材料為食品級 (Food Grade)，並遵循安全操作規範。
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
