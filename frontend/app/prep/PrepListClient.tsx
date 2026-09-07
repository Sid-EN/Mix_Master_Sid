'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORY_ICON: Record<string, string> = {
  syrup: '🍯',
  infusion: '🫙',
  bitters: '💧',
  mixer: '🥤',
  garnish: '🌿',
}

const CATEGORY_COLOR: Record<string, string> = {
  syrup: '#F5A623',
  infusion: '#9B59B6',
  bitters: '#E74C3C',
  mixer: '#00FFFF',
  garnish: '#2ECC71',
}

const FILTER_TABS = [
  { key: 'all',       label: '全部',            en: 'All' },
  { key: 'syrup',     label: '糖漿 Syrup',      en: 'Syrup' },
  { key: 'infusion',  label: '浸泡酒 Infusion',  en: 'Infusion' },
  { key: 'bitters',   label: '苦精 Bitters',     en: 'Bitters' },
  { key: 'mixer',     label: '混合飲 Mixer',     en: 'Mixer' },
  { key: 'garnish',   label: '裝飾物 Garnish',   en: 'Garnish' },
]

function Stars({ count }: { count: number }) {
  const n = Math.min(Math.max(Math.round(count), 0), 5)
  return (
    <span className="text-neon-amber text-sm tracking-wider">
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

interface PrepListClientProps {
  recipes: any[]
}

export default function PrepListClient({ recipes }: PrepListClientProps) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? recipes
    : recipes.filter((r: any) => r.category === filter)

  return (
    <>
      {/* h1 之後直接出現卡片的 h3 會讓標題層級斷層；此標題僅供輔助技術讀取 */}
      <h2 className="sr-only">備料列表</h2>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`
              font-mono text-xs tracking-wider px-5 py-2.5 border transition-all duration-300
              ${filter === tab.key
                ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-neon-cyan'
                : 'border-charcoal-700 text-charcoal-500 hover:border-charcoal-500 hover:text-text-secondary'
              }
            `}
          >
            {tab.key !== 'all' && <span className="mr-1.5">{CATEGORY_ICON[tab.key]}</span>}
            {tab.label}
          </button>
        ))}

        <span className="ml-auto self-center font-mono text-xs text-charcoal-500">
          {filtered.length} 款備料
        </span>
      </div>

      {/* Prep Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r: any) => {
          const slug = r.slug || r.id
          const nameZh = r.nameZh || r.name_zh || r.name || ''
          const nameEn = r.nameEn || r.name_en || ''
          const category = r.category || ''
          const desc = r.descriptionZh || r.description_zh || r.description || ''
          const difficulty = r.difficulty ?? 1
          const prepTime = r.prepTime || r.prep_time || ''
          const shelfLife = r.shelfLife || r.shelf_life || ''
          const yieldAmt = r.yield || ''
          const tags = r.tags || []
          const hashtags = r.hashtags || []
          const color = CATEGORY_COLOR[category] || '#F5A623'

          return (
            <Link
              key={slug}
              href={`/prep/${slug}`}
              className="glass-card p-6 hover:border-neon-cyan transition-all duration-300 group block relative"
            >
              {/* Category Badge */}
              <span
                className="absolute top-4 right-4 font-mono text-[10px] px-2.5 py-1 rounded-sm tracking-wider uppercase"
                style={{
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: color,
                  color: color,
                  backgroundColor: `${color}15`,
                }}
              >
                {CATEGORY_ICON[category] || '📦'} {category}
              </span>

              {/* Names */}
              <h3 className="font-display text-xl text-text-warm mb-1 group-hover:text-neon-cyan transition-colors pr-24">
                {nameZh}
              </h3>
              <p className="font-mono text-xs text-charcoal-500 mb-3">{nameEn}</p>

              {/* Meta: Prep Time / Shelf Life / Yield */}
              <div className="flex flex-wrap items-center gap-3 mb-3 text-text-muted text-xs">
                {prepTime && (
                  <span className="flex items-center gap-1">
                    <span>⏱</span>
                    <span className="font-mono">{prepTime}</span>
                  </span>
                )}
                {shelfLife && (
                  <span className="flex items-center gap-1">
                    <span>📅</span>
                    <span className="font-mono">{shelfLife}</span>
                  </span>
                )}
                {yieldAmt && (
                  <span className="flex items-center gap-1">
                    <span>📐</span>
                    <span className="font-mono">{yieldAmt}</span>
                  </span>
                )}
              </div>

              {/* Difficulty Stars */}
              <div className="mb-3">
                <Stars count={difficulty} />
              </div>

              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-4">
                {desc}
              </p>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.slice(0, 4).map((t: string) => (
                    <span key={t} className="font-mono text-[10px] px-2 py-0.5 border border-charcoal-700 text-charcoal-500 rounded-sm">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Hashtags */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hashtags.slice(0, 3).map((h: string) => (
                    <span key={h} className="font-mono text-[10px] px-2 py-0.5 border border-neon-cyan/30 text-neon-cyan/70 rounded-sm">
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom link */}
              <div className="flex items-center justify-end pt-3 border-t border-charcoal-800">
                <span className="font-mono text-[10px] text-charcoal-600 group-hover:text-neon-cyan transition-colors">
                  查看做法 →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🧪</p>
          <p className="text-text-muted font-mono text-sm">此分類尚無備料配方</p>
        </div>
      )}
    </>
  )
}
