'use client'

import { useState, useMemo } from 'react'
import { getRecommendedPairings, getAllScoredPairings, type ScoredPairing } from '../lib/foodPairing'

interface Props {
  recipe: any
}

function MatchStars({ score }: { score: number }) {
  if (score >= 6) {
    return (
      <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm border border-neon-amber/60 text-neon-amber bg-neon-amber/10">
        ★★★ 絕佳搭配
      </span>
    )
  }
  return (
    <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10">
      ★★ 推薦搭配
    </span>
  )
}

function PairingCard({ pairing }: { pairing: ScoredPairing }) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-bg-tertiary border border-charcoal-700 rounded-sm hover:border-neon-amber/50 transition-colors duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{pairing.icon}</span>
          <div>
            <p className="text-text-warm text-sm font-medium">{pairing.nameZh}</p>
            <p className="font-mono text-[10px] text-charcoal-500">{pairing.nameEn}</p>
          </div>
        </div>
        <MatchStars score={pairing.score} />
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className="font-mono text-[10px] px-1.5 py-0.5 border border-charcoal-700 text-charcoal-400 rounded-sm">
          {pairing.categoryIcon} {pairing.categoryZh}
        </span>
      </div>

      <p className="text-text-muted text-xs leading-relaxed">{pairing.description}</p>
    </div>
  )
}

export default function FoodPairingSection({ recipe }: Props) {
  const [showAll, setShowAll] = useState(false)

  const topPairings = useMemo(() => getRecommendedPairings(recipe), [recipe])
  const allPairings = useMemo(() => {
    if (!showAll) return []
    return getAllScoredPairings(recipe)
  }, [recipe, showAll])

  if (topPairings.length === 0) return null

  const extraPairings = showAll
    ? allPairings.filter(p => !topPairings.some(tp => tp.nameEn === p.nameEn))
    : []

  return (
    <section className="glass-card mb-8 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5">
        <h2 className="font-display text-xl text-neon-amber flex items-center gap-2">
          🍽️ 餐酒搭配建議
          <span className="font-mono text-[10px] text-charcoal-500 tracking-wider ml-2">
            FOOD PAIRING
          </span>
        </h2>
        <p className="font-mono text-[10px] text-charcoal-500 tracking-wider mt-1">
          根據風味特徵推薦的最佳餐食搭配
        </p>
      </div>

      {/* Top Pairings Grid */}
      <div className="px-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topPairings.map(pairing => (
            <PairingCard key={pairing.nameEn} pairing={pairing} />
          ))}
        </div>
      </div>

      {/* Show More Toggle */}
      <div className="border-t border-charcoal-800">
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 text-left hover:bg-bg-tertiary/50 transition-colors duration-200"
        >
          <span className="font-mono text-xs text-neon-cyan">
            {showAll ? '收起更多搭配' : '查看更多搭配'}
          </span>
          <span
            className="text-neon-cyan text-sm transition-transform duration-300"
            style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        </button>
      </div>

      {/* Expanded Section */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: showAll ? `${extraPairings.length * 200 + 100}px` : '0px',
          opacity: showAll ? 1 : 0,
        }}
      >
        <div className="px-8 pb-6">
          <p className="font-mono text-[10px] text-charcoal-500 tracking-wider uppercase border-b border-charcoal-800 pb-3 mb-4">
            所有搭配建議 — All Pairings
          </p>

          {/* Group by category */}
          {(['appetizer', 'seafood', 'meat', 'cheese', 'dessert', 'snack', 'fruit'] as const).map(cat => {
            const items = extraPairings.filter(p => p.category === cat)
            if (items.length === 0) return null
            const catLabel = items[0].categoryZh
            const catIcon = items[0].categoryIcon
            return (
              <div key={cat} className="mb-4">
                <p className="text-text-secondary text-xs font-medium mb-2 flex items-center gap-1">
                  {catIcon} {catLabel}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {items.map(p => (
                    <div
                      key={p.nameEn}
                      className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary border border-charcoal-700 rounded-sm"
                    >
                      <span className="text-lg">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-warm text-xs">{p.nameZh}</p>
                        <p className="font-mono text-[9px] text-charcoal-500 truncate">{p.nameEn}</p>
                      </div>
                      {p.score > 0 && (
                        <span className="font-mono text-[9px] text-neon-cyan shrink-0">
                          +{p.score}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
