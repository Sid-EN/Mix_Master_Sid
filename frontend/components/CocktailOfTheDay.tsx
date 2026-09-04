'use client'

import { fetchRecipes } from '@/lib/recipeCache'
import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ── Lookup maps (consistent with project conventions) ───── */
const METHOD_ICON: Record<string, string> = { shake: '🧊', stir: '🥄', build: '🥃', roll: '🌀', throw: '✨' }
const METHOD_ZH: Record<string, string>   = { shake: '搖盪法', stir: '攪拌法', build: '直調法', roll: '滾動法', throw: '拋接法' }
const GRADE_CLR: Record<string, string>   = { A: '#2ECC71', B: '#F39C12', C: '#E67E22', D: '#E74C3C' }

const FLAVOR_COLORS: Record<string, string> = {
  citrus: '#FFD700', tropical: '#FF8C00', berry: '#DC143C', herbal: '#228B22',
  smoky: '#696969', floral: '#DDA0DD', caramel: '#C27820', vanilla: '#F5DEB3',
  spicy: '#B22222', earthy: '#8B4513', nutty: '#D2691E', bitter: '#4B0082',
  oak: '#8B6914', umami: '#556B2F', stone_fruit: '#FF6347',
}

/**
 * Deterministic date-based hash — same recipe for every visitor on the same day.
 * Uses day-of-year × year as seed, then maps to an index in the recipe list.
 */
function getDayIndex(total: number): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const seed = dayOfYear * 31 + now.getFullYear() * 7
  return ((seed % total) + total) % total
}

function Stars({ count }: { count: number }) {
  const n = Math.min(Math.max(Math.round(count), 0), 5)
  return (
    <span className="text-neon-amber text-base tracking-wider" aria-label={`難度 ${n}/5`}>
      {'★'.repeat(n)}
      <span className="opacity-30">{'☆'.repeat(5 - n)}</span>
    </span>
  )
}

/* ── Skeleton loader ─────────────────────────────────────── */
function Skeleton() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="glass-card border-neon-amber-glow max-w-2xl mx-auto p-8 md:p-10 animate-pulse">
        <div className="h-5 w-24 bg-charcoal-700 rounded mb-6" />
        <div className="h-8 w-48 bg-charcoal-700 rounded mb-2" />
        <div className="h-4 w-32 bg-charcoal-700 rounded mb-6" />
        <div className="h-px w-full bg-charcoal-700 mb-5" />
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-charcoal-700 rounded" />
          <div className="h-4 w-3/4 bg-charcoal-700 rounded" />
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-7 w-20 bg-charcoal-700 rounded" />
          ))}
        </div>
        <div className="h-4 w-32 bg-charcoal-700 rounded ml-auto" />
      </div>
    </section>
  )
}

/* ── Main Component ──────────────────────────────────────── */
export default function CocktailOfTheDay() {
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchAndPick() {
      try {
        const items = await fetchRecipes()
        if (items.length === 0) throw new Error('no recipes')
        if (!cancelled) {
          setRecipe(items[getDayIndex(items.length)])
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAndPick()
    return () => { cancelled = true }
  }, [])

  if (error) return null
  if (loading) return <Skeleton />
  if (!recipe) return null

  /* ── Normalize recipe fields (same fallback pattern as rest of codebase) ── */
  const r = recipe
  const slug = r.slug || r.id
  const nameZh = r.nameZh || r.name_zh || r.name || ''
  const nameEn = r.nameEn || r.name_en || ''
  const method = r.method || 'build'
  const glass = r.glass || r.glassType || r.glass_type || ''
  const difficulty = r.difficulty ?? 3
  const grade = r.grade || r.balanceGrade || ''
  const score = r.balanceScore ?? r.balance_score ?? ''
  const descZh = r.descriptionZh || r.description_zh || ''
  const glassImg = r.glassImage || r.glass_image || METHOD_ICON[method] || '🍹'
  const ingredients = r.ingredients || []
  const flavorProfile = r.flavorProfile || r.flavor_profile || null
  const primaryFlavors = flavorProfile?.primary || flavorProfile?.primaryFlavors || []

  const acid  = flavorProfile?.acid  ?? flavorProfile?.sour ?? null
  const sweet = flavorProfile?.sweet ?? null
  const bitter = flavorProfile?.bitter ?? null
  const punch = flavorProfile?.punch ?? flavorProfile?.boozy ?? null
  const flavorBars = [
    { key: 'acid',   label: '酸', value: acid },
    { key: 'sweet',  label: '甜', value: sweet },
    { key: 'bitter', label: '苦', value: bitter },
    { key: 'punch',  label: '烈', value: punch },
  ].filter(d => d.value !== null && d.value !== undefined)

  const displayIngredients = ingredients.slice(0, 5)

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      {/* Section header */}
      <div className="text-center mb-10">
        <p className="font-mono text-xs text-neon-amber tracking-[0.3em] uppercase mb-3">
          Cocktail of the Day
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-text-warm">每日推薦</h2>
      </div>

      {/* Hero card */}
      <div className="glass-card border-neon-amber-glow max-w-2xl mx-auto p-8 md:p-10 relative overflow-hidden group">
        {/* Ambient glow behind the card */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-amber/5 rounded-full blur-3xl pointer-events-none" />

        {/* 今日推薦 badge with shimmer */}
        <div className="mb-6">
          <span className="cotd-badge inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 bg-neon-amber/10 border border-neon-amber/50 text-neon-amber tracking-widest uppercase rounded-sm">
            🍸 今日推薦
          </span>
        </div>

        {/* Top row: glass emoji + meta pills */}
        <div className="flex items-start justify-between mb-5">
          <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
            {glassImg}
          </span>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            {/* Method pill */}
            <span className="font-mono text-xs px-3 py-1 border border-charcoal-600 text-charcoal-500 uppercase tracking-wider">
              {METHOD_ICON[method]} {METHOD_ZH[method] || method}
            </span>
            {/* Grade badge */}
            {grade && (
              <span
                className="font-mono text-sm font-bold px-2.5 py-1 rounded-sm text-white"
                style={{ backgroundColor: GRADE_CLR[grade] || '#6B6B80' }}
              >
                {grade}{score ? ` ${score}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Names */}
        <h3 className="font-display text-3xl md:text-4xl text-text-warm mb-1 group-hover:text-neon-amber transition-colors duration-300">
          {nameZh}
        </h3>
        <p className="font-mono text-sm text-charcoal-500 mb-2">{nameEn}</p>

        {/* Difficulty + glass type */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Stars count={difficulty} />
          {glass && (
            <span className="font-mono text-xs text-charcoal-500">
              🥂 {glass}
            </span>
          )}
        </div>

        <div className="divider-amber mb-5" />

        {/* Description */}
        {descZh && (
          <p className="text-text-secondary leading-relaxed mb-6 line-clamp-3">
            {descZh}
          </p>
        )}

        {/* Flavor profile dots/bars */}
        {(primaryFlavors.length > 0 || flavorBars.length > 0) && (
          <div className="mb-6">
            <p className="font-mono text-[10px] text-charcoal-500 uppercase tracking-widest mb-3">
              Flavor Profile
            </p>

            {/* Primary flavor tags */}
            {primaryFlavors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {primaryFlavors.map((f: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-sm border"
                    style={{
                      borderColor: FLAVOR_COLORS[f.toLowerCase()] || '#6B6B80',
                      color: FLAVOR_COLORS[f.toLowerCase()] || '#B8B0A0',
                      backgroundColor: `${FLAVOR_COLORS[f.toLowerCase()] || '#6B6B80'}12`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: FLAVOR_COLORS[f.toLowerCase()] || '#6B6B80' }}
                    />
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Compact flavor bars */}
            {flavorBars.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {flavorBars.map((d) => {
                  const pct = Math.min(((d.value <= 1 ? d.value * 10 : d.value) / 10) * 100, 100)
                  return (
                    <div key={d.key}>
                      <span className="font-mono text-[10px] text-charcoal-500 block mb-1">{d.label}</span>
                      <div className="w-full h-1.5 bg-charcoal-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: 'var(--color-neon-amber)' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Ingredient list */}
        {displayIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {displayIngredients.map((ing: any, i: number) => {
              const name = typeof ing === 'string'
                ? ing
                : (ing.nameZh || ing.name_zh || ing.ingredientNameZh || ing.name || '材料')
              return (
                <span
                  key={i}
                  className="font-mono text-xs px-3 py-1 bg-bg-tertiary border border-charcoal-700 text-text-secondary"
                >
                  {name}
                </span>
              )
            })}
            {ingredients.length > 5 && (
              <span className="font-mono text-xs px-3 py-1 text-charcoal-500">
                +{ingredients.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Bottom row: link */}
        <div className="flex items-center justify-end">
          <Link
            href={`/recipes/${slug}`}
            className="font-mono text-xs text-neon-amber hover:text-neon-cyan transition-colors tracking-wider inline-flex items-center gap-1"
          >
            查看完整配方 →
          </Link>
        </div>
      </div>

      {/* Scoped shimmer animation for the badge */}
      <style jsx>{`
        .cotd-badge {
          position: relative;
          overflow: hidden;
        }
        .cotd-badge::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(245, 166, 35, 0.15) 50%,
            transparent 100%
          );
          animation: cotd-shimmer 3s ease-in-out infinite;
        }
        @keyframes cotd-shimmer {
          0%   { left: -100%; }
          50%  { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </section>
  )
}
