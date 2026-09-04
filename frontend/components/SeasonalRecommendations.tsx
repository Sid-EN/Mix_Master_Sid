'use client'

import { fetchRecipes } from '@/lib/recipeCache'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentSeason, type Season } from '../lib/seasonalData'

/* ── Seasonal gradient & accent maps ─────────────────────── */
const GRADIENT: Record<string, string> = {
  emerald: 'from-emerald-900/30 via-emerald-800/10 to-transparent',
  cyan:    'from-cyan-900/30 via-cyan-800/10 to-transparent',
  amber:   'from-amber-900/30 via-amber-800/10 to-transparent',
  indigo:  'from-indigo-900/30 via-indigo-800/10 to-transparent',
}

const ACCENT: Record<string, string> = {
  emerald: 'text-emerald-400',
  cyan:    'text-cyan-400',
  amber:   'text-amber-400',
  indigo:  'text-indigo-400',
}

const BORDER: Record<string, string> = {
  emerald: 'border-emerald-500/30',
  cyan:    'border-cyan-500/30',
  amber:   'border-amber-500/30',
  indigo:  'border-indigo-500/30',
}

const PILL_BG: Record<string, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  cyan:    'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
  amber:   'bg-amber-500/10 border-amber-500/30 text-amber-300',
  indigo:  'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
}

const GRADE_CLR: Record<string, string> = {
  A: '#2ECC71', B: '#F39C12', C: '#E67E22', D: '#E74C3C',
}

const METHOD_ZH: Record<string, string> = {
  shake: '搖盪法', stir: '攪拌法', build: '直調法', roll: '滾動法', throw: '拋接法',
}

const SEASONAL_TIPS: Record<string, string> = {
  spring: '🌿 春季調酒小貼士：使用新鮮香草與花朵裝飾，讓視覺與嗅覺同步迎接春天。接骨木花利口酒是這個季節的秘密武器。',
  summer: '🧊 夏季調酒小貼士：大量使用碎冰與新鮮水果，Tiki 風格杯具能讓派對氣氛瞬間升溫。記得補充水分！',
  autumn: '🍎 秋季調酒小貼士：嘗試以肉桂棒做攪拌棒，蘋果薄片做裝飾。溫熱調酒 (Hot Toddy) 也是這個季節的經典選擇。',
  winter: '🔥 冬季調酒小貼士：溫熱的愛爾蘭咖啡或熱紅酒是寒夜的最佳良伴。奶油與巧克力能增添節日的濃郁幸福感。',
}

/* ── Keyword matching logic ──────────────────────────────── */
function scoreRecipe(recipe: any, season: Season): number {
  const kw = season.keywords.map((k) => k.toLowerCase())
  let score = 0

  const nameEn = (recipe.nameEn || recipe.name_en || '').toLowerCase()
  const nameZh = recipe.nameZh || recipe.name_zh || ''
  const descEn = (recipe.descriptionEn || recipe.description_en || recipe.description || '').toLowerCase()
  const descZh = (recipe.descriptionZh || recipe.description_zh || '').toLowerCase()
  const fullText = `${nameEn} ${descEn} ${descZh}`

  for (const k of kw) {
    if (fullText.includes(k)) score += 2
  }

  const ingredients = recipe.ingredients || []
  for (const ing of ingredients) {
    const ingName = (
      typeof ing === 'string'
        ? ing
        : (ing.ingredientName || ing.ingredient_name || ing.name || '')
    ).toLowerCase()
    for (const k of kw) {
      if (ingName.includes(k)) score += 3
    }
  }

  const fp = recipe.flavorProfile || recipe.flavor_profile
  if (fp) {
    const primary: string[] = fp.primary || fp.primaryFlavors || fp.primary_flavors || []
    for (const f of primary) {
      if (kw.includes(f.toLowerCase())) score += 4
    }
    const fpDesc = (fp.description || '').toLowerCase()
    for (const k of kw) {
      if (fpDesc.includes(k)) score += 1
    }
  }

  const tags: string[] = (recipe.tags || []).map((t: string) => t.toLowerCase())
  for (const k of kw) {
    if (tags.includes(k)) score += 2
  }

  return score
}

/* ── Skeleton loader ─────────────────────────────────────── */
function Skeleton() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="animate-pulse">
        <div className="h-6 w-40 bg-charcoal-700 rounded mx-auto mb-3" />
        <div className="h-10 w-56 bg-charcoal-700 rounded mx-auto mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="h-4 w-24 bg-charcoal-700 rounded mb-4" />
              <div className="h-6 w-32 bg-charcoal-700 rounded mb-2" />
              <div className="h-4 w-full bg-charcoal-700 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-charcoal-700 rounded" />
                <div className="h-6 w-16 bg-charcoal-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Main Component ──────────────────────────────────────── */
export default function SeasonalRecommendations() {
  const [season] = useState<Season>(() => getCurrentSeason())
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const items: any[] = await fetchRecipes()
        if (items.length === 0) throw new Error('no recipes')

        // Score & rank by seasonal relevance
        const scored = items
          .map((r) => ({ recipe: r, score: scoreRecipe(r, season) }))
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map((s) => s.recipe)

        // If fewer than 4 matched, pad with random picks
        if (scored.length < 4) {
          const usedSlugs = new Set(scored.map((r) => r.slug || r.id))
          const remaining = items.filter((r) => !usedSlugs.has(r.slug || r.id))
          const shuffled = remaining.sort(() => Math.random() - 0.5)
          scored.push(...shuffled.slice(0, 4 - scored.length))
        }

        if (!cancelled) setRecipes(scored)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [season])

  if (error) return null
  if (loading) return <Skeleton />
  if (recipes.length === 0) return null

  const gradient = GRADIENT[season.color] || GRADIENT.amber
  const accent = ACCENT[season.color] || ACCENT.amber
  const border = BORDER[season.color] || BORDER.amber
  const pillStyle = PILL_BG[season.color] || PILL_BG.amber
  const tip = SEASONAL_TIPS[season.id] || ''

  return (
    <section className="relative overflow-hidden py-16">
      {/* Seasonal gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* ── Season Banner ──────────────────────────────────── */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-[0.3em] uppercase mb-3 opacity-60">
            Seasonal Selection
          </p>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">{season.icon}</span>
            <h2 className="font-display text-3xl md:text-4xl text-text-warm">
              {season.nameZh}推薦
            </h2>
            <span className="text-4xl">{season.icon}</span>
          </div>
          <p className={`font-mono text-sm ${accent} tracking-wider mb-2`}>
            {season.nameEn} · {season.mood}
          </p>
          <p className="text-text-secondary text-sm max-w-lg mx-auto leading-relaxed">
            {season.description}
          </p>
        </div>

        {/* ── Cocktail Cards ─────────────────────────────────── */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 scrollbar-hide">
          {recipes.map((r, idx) => {
            const slug = r.slug || r.id
            const nameZh = r.nameZh || r.name_zh || r.name || ''
            const nameEn = r.nameEn || r.name_en || ''
            const method = r.method || 'build'
            const grade = r.grade || r.balanceGrade || ''
            const score = r.balanceScore ?? r.balance_score ?? ''
            const ingredients = (r.ingredients || []).slice(0, 3)
            const fp = r.flavorProfile || r.flavor_profile
            const primary: string[] = fp?.primary || fp?.primaryFlavors || []

            return (
              <Link
                key={slug || idx}
                href={`/recipes/${slug}`}
                className={`glass-card ${border} min-w-[260px] snap-start flex-shrink-0 lg:min-w-0 p-6
                            hover:border-opacity-60 transition-all duration-300 group flex flex-col`}
              >
                {/* Top: method + grade */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-charcoal-500 uppercase tracking-wider">
                    {METHOD_ZH[method] || method}
                  </span>
                  {grade && (
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm text-white"
                      style={{ backgroundColor: GRADE_CLR[grade] || '#6B6B80' }}
                    >
                      {grade}{score ? ` ${score}` : ''}
                    </span>
                  )}
                </div>

                {/* Names */}
                <h3 className={`font-display text-lg text-text-warm mb-1 group-hover:${accent.replace('text-', 'text-')} transition-colors duration-300 line-clamp-1`}>
                  {nameZh}
                </h3>
                <p className="font-mono text-[11px] text-charcoal-500 mb-4 line-clamp-1">
                  {nameEn}
                </p>

                {/* Primary flavors */}
                {primary.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {primary.slice(0, 3).map((f: string) => (
                      <span
                        key={f}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-bg-tertiary border border-charcoal-700 text-charcoal-400"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ingredients preview */}
                <div className="mt-auto pt-3 border-t border-charcoal-700/50">
                  <p className="font-mono text-[10px] text-charcoal-600 mb-2">主要材料</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredients.map((ing: any, i: number) => {
                      const name =
                        typeof ing === 'string'
                          ? ing
                          : ing.ingredientNameZh || ing.nameZh || ing.name_zh || ing.ingredientName || ing.name || '材料'
                      return (
                        <span
                          key={i}
                          className="font-mono text-[10px] px-2 py-0.5 bg-bg-tertiary/80 text-text-muted truncate max-w-[120px]"
                        >
                          {name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* ── Suggested Ingredients ───────────────────────────── */}
        <div className="mt-12 text-center">
          <h3 className="font-mono text-xs tracking-[0.2em] uppercase mb-4 text-charcoal-400">
            🧪 本季推薦材料
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {season.suggestedIngredients.map((ing) => (
              <span
                key={ing}
                className={`font-mono text-xs px-4 py-2 rounded-full border ${pillStyle} transition-transform hover:scale-105`}
              >
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* ── Seasonal Tip ───────────────────────────────────── */}
        {tip && (
          <div className={`mt-10 max-w-2xl mx-auto glass-card ${border} p-6 text-center`}>
            <p className="text-text-secondary text-sm leading-relaxed">
              {tip}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
