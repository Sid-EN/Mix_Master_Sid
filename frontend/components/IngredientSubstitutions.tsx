'use client'

import { useState } from 'react'
import { findSubstitutions, type SubstituteItem } from '../lib/substitutions'

interface IngredientInput {
  name: string
  nameZh?: string
  amount?: string | number
  unit?: string
}

interface Props {
  ingredients: IngredientInput[]
}

function similarityColor(s: number): string {
  if (s >= 0.8) return '#2ECC71'
  if (s >= 0.6) return '#F5A623'
  if (s >= 0.4) return '#E67E22'
  return '#E74C3C'
}

function SimilarityBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = similarityColor(value)
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border whitespace-nowrap"
      style={{ borderColor: color, color }}
    >
      {pct}%
    </span>
  )
}

function SubstituteCard({ sub }: { sub: SubstituteItem }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-2 bg-bg-tertiary border border-charcoal-700 rounded-sm hover:border-neon-cyan/50 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <SimilarityBadge value={sub.similarity} />
        <span className="text-text-warm text-sm">{sub.nameZh}</span>
        <span className="font-mono text-[10px] text-charcoal-500">{sub.name}</span>
      </div>
      <p className="text-text-muted text-xs leading-relaxed">{sub.note}</p>
    </div>
  )
}

export default function IngredientSubstitutions({ ingredients }: Props) {
  const [open, setOpen] = useState(false)

  // Build list of ingredients that have substitution suggestions
  const matched = ingredients
    .map((ing) => {
      const name = ing.name || ''
      const subs = findSubstitutions(name)
      if (!subs || subs.length === 0) return null
      return {
        originalName: ing.nameZh || name,
        originalNameEn: name,
        substitutes: subs.slice(0, 3),
      }
    })
    .filter(Boolean) as {
      originalName: string
      originalNameEn: string
      substitutes: SubstituteItem[]
    }[]

  if (matched.length === 0) return null

  return (
    <section className="glass-card mb-8 overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-bg-tertiary/50 transition-colors duration-200"
      >
        <h2 className="font-display text-xl text-neon-amber flex items-center gap-2">
          🔄 材料替代建議
          <span className="font-mono text-[10px] text-charcoal-500 tracking-wider ml-2">
            {matched.length} 項可替代
          </span>
        </h2>
        <span
          className="text-neon-cyan text-lg transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {/* Collapsible Content */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: open ? `${matched.length * 300 + 100}px` : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-8 pb-6 space-y-5">
          <p className="font-mono text-[10px] text-charcoal-500 tracking-wider uppercase border-b border-charcoal-800 pb-3">
            Substitution Suggestions — 相似度越高越接近原材料
          </p>

          {matched.map((item) => (
            <div key={item.originalNameEn}>
              {/* Original Ingredient */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-neon-amber text-sm">●</span>
                <span className="text-text-warm text-sm font-medium">
                  {item.originalName}
                </span>
                {item.originalName !== item.originalNameEn && (
                  <span className="font-mono text-[10px] text-charcoal-500">
                    {item.originalNameEn}
                  </span>
                )}
              </div>

              {/* Substitute Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ml-4">
                {item.substitutes.map((sub) => (
                  <SubstituteCard key={sub.name} sub={sub} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
