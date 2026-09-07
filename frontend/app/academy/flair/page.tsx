'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ─────────────────────── types ─────────────────────── */

type Difficulty = 1 | 2 | 3

interface FlairMove {
  id: number
  icon: string
  nameEn: string
  nameTc: string
  difficulty: Difficulty
  description: string
  steps: string[]
  practice?: string
  safety?: string
  variants?: string
  prerequisite?: string
  application?: string
  effect?: string
  equipment?: string[]
}

/* ─────────────────────── data ─────────────────────── */

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: '⭐ Beginner',
  2: '⭐⭐ Intermediate',
  3: '⭐⭐⭐ Advanced',
}

const MOVES: FlairMove[] = [
  {
    id: 1,
    icon: '🔄',
    nameEn: 'Bottle Flip',
    nameTc: '酒瓶翻轉',
    difficulty: 1,
    description: '將酒瓶拋起一圈後接住',
    steps: [
      '握住瓶頸下方',
      '輕輕向後翻轉',
      '讓瓶子轉一圈',
      '接住瓶身',
    ],
    practice: '先用裝水的塑膠瓶練習，逐漸換成玻璃瓶',
    safety: '確保周圍淨空，地面放軟墊',
  },
  {
    id: 2,
    icon: '🫴',
    nameEn: 'Tin Flip',
    nameTc: '搖酒器翻轉',
    difficulty: 1,
    description: '將搖酒器杯拋起旋轉後接住',
    steps: [
      '握住杯底',
      '向上拋出同時手腕翻轉',
      '杯口朝上接住',
    ],
    practice: '從低高度開始，慢慢增加',
  },
  {
    id: 3,
    icon: '🍾',
    nameEn: 'Pour & Catch',
    nameTc: '拋接倒酒',
    difficulty: 2,
    description: '將酒瓶拋起一圈後直接倒入杯中',
    steps: [
      '握瓶頸',
      '拋起',
      '接住時瓶口對準杯子',
      '流暢倒酒',
    ],
    practice: '先練準確度再練花式',
  },
  {
    id: 4,
    icon: '🔃',
    nameEn: 'Behind the Back',
    nameTc: '背後接瓶',
    difficulty: 2,
    description: '從身體前方拋瓶到背後，另一隻手從背後接住',
    steps: [
      '正面拋出',
      '瓶子越過肩膀',
      '另一手從背後接住',
    ],
    practice: '這是最經典的花式動作之一',
  },
  {
    id: 5,
    icon: '🌀',
    nameEn: 'Stall',
    nameTc: '瓶子平衡',
    difficulty: 2,
    description: '讓酒瓶在手背、手肘或其他部位平衡',
    steps: [
      '將瓶子橫放在手背',
      '找到重心',
      '保持穩定',
    ],
    variants: 'Hand Stall、Elbow Stall、Forehead Stall',
  },
  {
    id: 6,
    icon: '🎯',
    nameEn: 'Flat Pour',
    nameTc: '平手倒酒',
    difficulty: 1,
    description: '將手完全水平伸出，穩定地倒酒',
    steps: [
      '手臂完全平伸',
      '慢慢傾斜瓶身',
      '穩定流速',
    ],
    effect: '看似簡單卻非常視覺化',
  },
  {
    id: 7,
    icon: '💫',
    nameEn: 'Shadow Pass',
    nameTc: '影子傳遞',
    difficulty: 3,
    description: '瓶子在雙手之間快速傳遞，看起來像是穿過身體',
    steps: [
      '右手拋出',
      '身體微轉',
      '左手接住',
      '快速切換方向',
    ],
    practice: '先慢動作分解，再加速',
  },
  {
    id: 8,
    icon: '🔥',
    nameEn: 'Fire Flair',
    nameTc: '火焰花式',
    difficulty: 3,
    description: '結合火焰效果的花式動作',
    steps: [
      '使用高 ABV 烈酒',
      '點燃後快速倒入杯中',
      '立即撲滅',
    ],
    safety: '⚠️ 需專業訓練，嚴禁新手嘗試。安全裝備：防火墊、滅火器、安全距離',
  },
  {
    id: 9,
    icon: '🤹',
    nameEn: 'Multi-Bottle Juggle',
    nameTc: '多瓶拋接',
    difficulty: 3,
    description: '同時拋接 2–3 個瓶子',
    steps: [
      '從 2 瓶開始',
      '交替拋接',
      '保持節奏',
    ],
    prerequisite: '先精通單瓶翻轉',
  },
  {
    id: 10,
    icon: '🌊',
    nameEn: 'Long Pour',
    nameTc: '長距離倒酒',
    difficulty: 2,
    description: '從高處將酒倒入杯中，酒液形成長弧線',
    steps: [
      '杯子放低處',
      '手臂逐漸抬高',
      '保持穩定流速',
      '酒液不飛濺',
    ],
    application: '西班牙式倒酒 (Throwing)，常見於 Sangria 和茶',
  },
]

const PRACTICE_TIPS = [
  { icon: '🥤', text: '永遠先用水和塑膠瓶練習' },
  { icon: '📐', text: '從低高度、慢速度開始' },
  { icon: '🔁', text: '每個動作至少練習 100 次才算入門' },
  { icon: '📱', text: '錄影回放分析自己的動作' },
  { icon: '👥', text: '找夥伴一起練，互相激勵' },
]

const SAFETY_RULES = [
  '練習時穿包覆式鞋子',
  '確保地面無濕滑',
  '周圍淨空至少 2 公尺',
  '火焰動作需滅火器在旁',
  '正式表演前至少練習 3 個月',
  '永遠不要在醉酒狀態下練習',
]

const EQUIPMENT = [
  { name: '練習用塑膠 Flair 瓶（加重型）', icon: '🍾' },
  { name: '練習用搖酒器', icon: '🥃' },
  { name: '防碎軟墊', icon: '🛡️' },
  { name: 'Flair 專用酒嘴', icon: '🔧' },
]

/* ─────────────────────── helpers ─────────────────────── */

function DifficultyBadge({ level }: { level: Difficulty }) {
  const colors: Record<Difficulty, string> = {
    1: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
    2: 'bg-neon-amber/10 border-neon-amber/40 text-neon-amber',
    3: 'bg-red-500/10 border-red-500/40 text-red-400',
  }
  return (
    <span className={`font-mono text-[10px] px-2.5 py-1 rounded-sm border ${colors[level]}`}>
      {DIFFICULTY_LABELS[level]}
    </span>
  )
}

/* ─────────────────────── move card ─────────────────────── */

function MoveCard({ move, index }: { move: FlairMove; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      className="glass-card p-5 md:p-6 hover:border-neon-amber transition-all duration-300 animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${(index % 10) * 0.06}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{move.icon}</span>
          <div>
            <h3 className="font-display text-lg text-text-warm font-semibold leading-tight">
              {move.nameEn}
            </h3>
            <p className="font-mono text-xs text-neon-amber/70">{move.nameTc}</p>
          </div>
        </div>
        <DifficultyBadge level={move.difficulty} />
      </div>

      {/* description */}
      <p className="text-sm text-text-secondary mb-4">{move.description}</p>

      {/* steps */}
      <div className="space-y-1.5 mb-4">
        <p className="font-mono text-[10px] tracking-widest uppercase text-neon-cyan/70 mb-1">步驟</p>
        {move.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="font-mono text-neon-amber text-xs mt-0.5 shrink-0">({i + 1})</span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      {/* expandable detail */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {move.practice && (
          <div className="mb-3 rounded bg-neon-cyan/5 border border-neon-cyan/20 p-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-neon-cyan/70 mb-1">練習建議</p>
            <p className="text-sm text-text-secondary">{move.practice}</p>
          </div>
        )}
        {move.variants && (
          <div className="mb-3 rounded bg-neon-purple/5 border border-neon-purple/20 p-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-neon-purple/70 mb-1">種類</p>
            <p className="text-sm text-text-secondary">{move.variants}</p>
          </div>
        )}
        {move.effect && (
          <div className="mb-3 rounded bg-neon-amber/5 border border-neon-amber/20 p-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-neon-amber/70 mb-1">效果</p>
            <p className="text-sm text-text-secondary">{move.effect}</p>
          </div>
        )}
        {move.prerequisite && (
          <div className="mb-3 rounded bg-neon-amber/5 border border-neon-amber/20 p-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-neon-amber/70 mb-1">前提</p>
            <p className="text-sm text-text-secondary">{move.prerequisite}</p>
          </div>
        )}
        {move.application && (
          <div className="mb-3 rounded bg-neon-cyan/5 border border-neon-cyan/20 p-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-neon-cyan/70 mb-1">應用</p>
            <p className="text-sm text-text-secondary">{move.application}</p>
          </div>
        )}
        {move.safety && (
          <div className="mb-3 rounded bg-red-500/10 border border-red-500/30 p-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-red-400/80 mb-1">安全警告</p>
            <p className="text-sm text-red-300">{move.safety}</p>
          </div>
        )}
      </div>

      {/* expand hint */}
      <p className="font-mono text-[10px] text-charcoal-500 text-right mt-1">
        {expanded ? '▲ 收合' : '▼ 點擊展開'}
      </p>
    </article>
  )
}

/* ─────────────────────── filter bar ─────────────────────── */

type DifficultyFilter = 'all' | 1 | 2 | 3

const FILTERS: { label: string; value: DifficultyFilter }[] = [
  { label: '全部', value: 'all' },
  { label: '⭐ 初級', value: 1 },
  { label: '⭐⭐ 中級', value: 2 },
  { label: '⭐⭐⭐ 高級', value: 3 },
]

/* ─────────────────────── page ─────────────────────── */

export default function FlairPage() {
  const [filter, setFilter] = useState<DifficultyFilter>('all')
  const filtered = filter === 'all' ? MOVES : MOVES.filter((m) => m.difficulty === filter)

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* back link */}
        <Link
          href="/academy"
          className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-6"
        >
          ← 返回調酒學院
        </Link>

        {/* ── hero ─────────────────────────────────── */}
        <header className="text-center mb-12 animate-fade-in-up">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-neon-amber/70 mb-3">
            Flair Bartending Academy
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-amber mb-4">
            🎪 花式調酒教學
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            當調酒遇上雜技——讓每一杯酒都成為一場表演
          </p>
          <div className="divider-amber mt-8" />
        </header>

        {/* ── Section 1: 什麼是花式調酒 ────────────── */}
        <section className="mb-14 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-display font-bold text-gradient-amber mb-6">
            什麼是花式調酒？
          </h2>
          <div className="glass-card p-6 md:p-8 space-y-6">
            {/* 歷史 */}
            <div>
              <h3 className="font-mono text-xs tracking-widest uppercase text-neon-cyan/70 mb-2">
                歷史背景
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                花式調酒（Flair Bartending）在 1980 年代由 Tom Cruise 主演的電影
                <span className="text-neon-amber">《乞乞雞尾酒 (Cocktail)》</span>
                帶入主流文化，從此調酒師不再只是調配飲品，更是舞台上的表演者。
              </p>
            </div>

            {/* 分類 */}
            <div>
              <h3 className="font-mono text-xs tracking-widest uppercase text-neon-cyan/70 mb-2">
                分類
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded bg-neon-amber/5 border border-neon-amber/20 p-4">
                  <p className="font-display font-semibold text-neon-amber mb-1">Working Flair</p>
                  <p className="text-sm text-text-secondary">
                    實用性花式——邊做邊表演，在實際調酒過程中融入花式動作，兼顧效率與娛樂性。
                  </p>
                </div>
                <div className="rounded bg-neon-cyan/5 border border-neon-cyan/20 p-4">
                  <p className="font-display font-semibold text-neon-cyan mb-1">Exhibition Flair</p>
                  <p className="text-sm text-text-secondary">
                    純表演競賽型——以視覺效果為主，高難度雜技動作，常見於國際比賽舞台。
                  </p>
                </div>
              </div>
            </div>

            {/* 世界賽事 */}
            <div>
              <h3 className="font-mono text-xs tracking-widest uppercase text-neon-cyan/70 mb-2">
                世界賽事
              </h3>
              <div className="flex flex-wrap gap-3">
                {['WFA (World Flair Association)', 'Roadhouse International'].map((event) => (
                  <span
                    key={event}
                    className="font-mono text-[11px] px-3 py-1.5 rounded-sm bg-neon-amber/10 border border-neon-amber/30 text-neon-amber"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>

            {/* 代表人物 */}
            <div>
              <h3 className="font-mono text-xs tracking-widest uppercase text-neon-cyan/70 mb-2">
                代表人物
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Tom Cruise', note: '電影影響力' },
                  { name: 'Christian Delpech', note: '競賽傳奇' },
                  { name: 'Rodrigo Delpech', note: '花式大師' },
                ].map((person) => (
                  <div
                    key={person.name}
                    className="font-mono text-[11px] px-3 py-1.5 rounded-sm bg-bg-tertiary border border-charcoal-700 text-text-secondary"
                  >
                    <span className="text-text-warm">{person.name}</span>
                    <span className="text-charcoal-500 ml-1">— {person.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: 基礎動作 ──────────────────── */}
        <section className="mb-14 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-2xl font-display font-bold text-gradient-amber mb-2">
            基礎動作
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            10 個必學花式動作，從入門到進階
          </p>

          {/* filter bar */}
          <nav className="flex flex-wrap gap-2 mb-8" aria-label="頁面內導覽">
            {FILTERS.map((f) => (
              <button
                key={String(f.value)}
                onClick={() => setFilter(f.value)}
                className={`font-mono text-xs px-4 py-2 rounded-sm border transition-all duration-200 ${
                  filter === f.value
                    ? 'bg-neon-amber text-bg-primary border-neon-amber shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                    : 'bg-transparent text-text-secondary border-charcoal-700 hover:border-neon-amber/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </nav>

          {/* moves grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((move, idx) => (
              <MoveCard key={move.id} move={move} index={idx} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-text-muted font-mono text-sm py-12">
              沒有符合篩選條件的動作
            </p>
          )}
        </section>

        {/* ── Section 3: 練習建議 ──────────────────── */}
        <section className="mb-14 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-display font-bold text-gradient-amber mb-6">
            練習建議
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRACTICE_TIPS.map((tip, idx) => (
              <div
                key={idx}
                className="glass-card p-5 flex items-start gap-4 hover:border-neon-cyan transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.25 + idx * 0.06}s` }}
              >
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <p className="text-sm text-text-secondary leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: 安全守則 ──────────────────── */}
        <section className="mb-14 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-2xl font-display font-bold text-gradient-amber mb-6">
            ⚠️ 安全守則
          </h2>
          <div className="glass-card p-6 md:p-8 border-red-500/30">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">🛡️</span>
              <p className="font-display font-semibold text-red-400 text-lg">Safety First</p>
            </div>
            <ul className="space-y-3">
              {SAFETY_RULES.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="text-red-400 mt-0.5 shrink-0">⚡</span>
                  <span className="text-text-secondary">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Section 5: 推薦器材 ──────────────────── */}
        <section className="mb-14 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-display font-bold text-gradient-amber mb-6">
            推薦器材
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EQUIPMENT.map((item, idx) => (
              <div
                key={idx}
                className="glass-card p-5 flex items-center gap-4 hover:border-neon-amber transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.35 + idx * 0.06}s` }}
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm text-text-warm font-medium">{item.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── footer nav ───────────────────────────── */}
        <div className="text-center mt-12 mb-8">
          <Link href="/academy" className="btn-neon-amber">
            ← 返回調酒學院
          </Link>
        </div>
      </div>
    </main>
  )
}
