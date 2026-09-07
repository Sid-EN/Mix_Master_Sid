'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BARTENDERS,
  ERA_META,
  type Era,
  type LegendaryBartender,
} from '../../lib/hallOfFameData'

type FilterTab = 'all' | Era

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pioneer', label: '先驅者 Pioneer' },
  { key: 'tiki', label: 'Tiki 時代' },
  { key: 'modern', label: '現代復興 Modern' },
  { key: 'contemporary', label: '當代 Contemporary' },
]

export default function HallOfFamePage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const filtered = useMemo(() => {
    if (activeTab === 'all') return BARTENDERS
    return BARTENDERS.filter((b) => b.era === activeTab)
  }, [activeTab])

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Header ── */}
      <section className="px-6 pt-20 pb-10 max-w-5xl mx-auto text-center">
        <Link
          href="/"
          className="inline-block font-mono text-sm text-charcoal-500 hover:text-neon-amber transition-colors mb-6"
        >
          ← 返回首頁
        </Link>

        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-4 animate-fade-in-up">
          Hall of Fame
        </p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gradient-amber leading-tight mb-4 animate-fade-in-up-delay-1">
          🏆 調酒師名人堂
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto animate-fade-in-up-delay-2">
          致敬那些改變調酒歷史的傳奇人物
        </p>

        <div className="divider-amber mt-8" />

        {/* Count */}
        <p className="mt-6 font-mono text-sm text-text-muted animate-fade-in-up-delay-3">
          共{' '}
          <span className="text-neon-amber font-bold">{filtered.length}</span>
          {' '}位傳奇調酒師
        </p>
      </section>

      {/* ── Filter Tabs ── */}
      <section className="px-6 max-w-5xl mx-auto mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-neon-amber text-charcoal-900 shadow-neon-amber'
                  : 'glass-card text-text-secondary hover:text-text-warm hover:border-neon-amber-dim'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Cards Grid ── */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-4xl mb-4">🍸</p>
            <p>此分類目前沒有調酒師</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((bartender, idx) => (
              <BartenderCard
                key={bartender.id}
                bartender={bartender}
                index={idx}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

/* ── Bartender Card ───────────────────────────────────────── */

function BartenderCard({
  bartender,
  index,
}: {
  bartender: LegendaryBartender
  index: number
}) {
  const era = ERA_META[bartender.era]
  const delay = Math.min(index * 0.06, 0.6)

  return (
    <div
      className="glass-card p-6 transition-all duration-300 hover:scale-[1.02] hover:border-neon-amber group"
      style={{
        animation: `fadeInUp 0.5s ease-out ${delay}s forwards`,
        opacity: 0,
      }}
    >
      {/* Name & Era */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text-warm leading-snug">
            {bartender.flag} {bartender.name}
          </h2>
          <p className="font-mono text-xs text-charcoal-500 mt-0.5">
            {bartender.years}
          </p>
        </div>

        {/* Era badge */}
        <span
          className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm whitespace-nowrap"
          style={{
            backgroundColor: `${era.color}15`,
            color: era.color,
            border: `1px solid ${era.color}44`,
          }}
        >
          {era.label}
        </span>
      </div>

      {/* Title */}
      <p className="text-neon-amber font-display text-base italic mb-4">
        「{bartender.title}」
      </p>

      {/* Known for */}
      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {bartender.knownFor}
      </p>

      {/* Signature cocktails */}
      <div className="mb-4">
        <p className="font-mono text-xs text-text-muted tracking-wider uppercase mb-2">
          代表作品
        </p>
        <div className="flex flex-wrap gap-1.5">
          {bartender.signatureCocktails.map((cocktail) => (
            <span
              key={cocktail}
              className="inline-block text-xs px-2.5 py-1 rounded-sm bg-charcoal-800 text-text-warm border border-charcoal-700 group-hover:border-neon-amber-dim transition-colors"
            >
              🍸 {cocktail}
            </span>
          ))}
        </div>
      </div>

      {/* Legacy */}
      <div className="mb-3">
        <p className="font-mono text-xs text-text-muted tracking-wider uppercase mb-1.5">
          歷史地位
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          {bartender.legacy}
        </p>
      </div>

      {/* Fun fact */}
      {bartender.funFact && (
        <div
          className="mt-4 p-3 rounded-sm text-xs text-text-secondary leading-relaxed"
          style={{
            backgroundColor: `${era.color}08`,
            borderLeft: `2px solid ${era.color}66`,
          }}
        >
          <span className="font-mono text-text-muted mr-1">冷知識：</span>
          {bartender.funFact}
        </div>
      )}
    </div>
  )
}
