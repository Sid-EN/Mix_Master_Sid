'use client'

import { clientUrl } from '@/lib/api'
import SubstituteHint from '@/components/SubstituteHint'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

/* ── Constants ──────────────────────────────────────────────── */
const STORAGE_KEY = 'mixmaster-my-bar'

const CATEGORY_ORDER = [
  'base_spirit', 'liqueur', 'wine', 'fortified_wine', 'syrup',
  'juice', 'mixer', 'fresh', 'bitter', 'dairy', 'egg',
]

const CATEGORY_LABELS: Record<string, string> = {
  base_spirit: '基酒 Base Spirit',
  liqueur: '利口酒 Liqueur',
  wine: '葡萄酒 Wine',
  fortified_wine: '加烈酒 Fortified',
  syrup: '糖漿 Syrup',
  juice: '果汁 Juice',
  mixer: '調和液 Mixer',
  fresh: '新鮮食材 Fresh',
  bitter: '苦精 Bitters',
  dairy: '乳製品 Dairy',
  egg: '蛋類 Egg',
}

/* ── Types ──────────────────────────────────────────────────── */
type Ingredient = {
  id: string
  name: string
  nameZh: string
  category: string
  abv: number | null
  colorHex: string | null
  flavorTags: string[]
}

type Recipe = {
  id: string
  slug: string
  nameZh: string
  nameEn: string
  method: string
  difficulty: number
  ingredients: { slug: string; amount: string; unit: string }[]
}

type CategoryInfo = {
  key: string
  label: string
  total: number
  owned: number
}

type MatchedRecipe = Recipe & {
  matchCount: number
  totalCount: number
  matchPct: number
  missingIngredients: string[]
}

/* ── Helpers ────────────────────────────────────────────────── */
const METHOD_ICON: Record<string, string> = { shake: '🧊', stir: '🥄', build: '🥃' }
const METHOD_ZH: Record<string, string> = { shake: '搖盪法', stir: '攪拌法', build: '直調法' }

function loadOwned(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveOwned(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

/* ── Page Component ─────────────────────────────────────────── */
export default function MyBarPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [owned, setOwned] = useState<string[]>([])
  const [activeCat, setActiveCat] = useState('base_spirit')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /* Hydrate from localStorage */
  useEffect(() => {
    setOwned(loadOwned())
  }, [])

  /* Persist on change (skip initial empty render) */
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    if (hydrated) saveOwned(owned)
    else setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owned])

  /* Fetch ingredients + recipes */
  useEffect(() => {
    async function fetchData() {
      try {
        const [ingRes, recRes] = await Promise.all([
          fetch(clientUrl('/api/v1/ingredients?limit=500')),
          fetch(clientUrl('/api/v1/recipes?limit=100')),
        ])
        const ingData = await ingRes.json()
        const recData = await recRes.json()

        const items: Ingredient[] = (ingData.items || []).map((i: any) => ({
          id: i.id || i.slug,
          name: i.name || i.nameEn || '',
          nameZh: i.nameZh || i.name || '',
          category: i.category || 'other',
          abv: i.abv ?? null,
          colorHex: i.colorHex ?? null,
          flavorTags: i.flavorTags || [],
        }))
        setIngredients(items)

        const recs: Recipe[] = (recData.items || []).map((r: any) => ({
          id: r.id || r.slug,
          slug: r.slug || r.id,
          nameZh: r.nameZh || r.name_zh || r.name || '',
          nameEn: r.nameEn || r.name_en || '',
          method: r.method || 'build',
          difficulty: r.difficulty ?? 3,
          ingredients: (r.ingredients || []).map((ri: any) => ({
            slug: ri.slug || ri.ingredient || '',
            amount: ri.amount || '',
            unit: ri.unit || '',
          })),
        }))
        setRecipes(recs)

        if (items.length > 0) {
          const firstCat = CATEGORY_ORDER.find(c => items.some(i => i.category === c))
          if (firstCat) setActiveCat(firstCat)
        }
      } catch {
        setError('無法載入資料庫')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  /* Build category info with owned counts */
  const categories: CategoryInfo[] = useMemo(() => {
    const catMap: Record<string, { total: number; owned: number }> = {}
    for (const ing of ingredients) {
      if (!catMap[ing.category]) catMap[ing.category] = { total: 0, owned: 0 }
      catMap[ing.category].total++
      if (owned.includes(ing.id)) catMap[ing.category].owned++
    }
    const ordered: CategoryInfo[] = CATEGORY_ORDER
      .filter(k => catMap[k])
      .map(k => ({ key: k, label: CATEGORY_LABELS[k] || k, ...catMap[k] }))
    for (const k of Object.keys(catMap)) {
      if (!CATEGORY_ORDER.includes(k)) {
        ordered.push({ key: k, label: CATEGORY_LABELS[k] || k, ...catMap[k] })
      }
    }
    return ordered
  }, [ingredients, owned])

  /* Recipe matching */
  const ownedSet = useMemo(() => new Set(owned), [owned])

  const { perfect, almostThere } = useMemo(() => {
    const matched: MatchedRecipe[] = []

    for (const recipe of recipes) {
      if (recipe.ingredients.length === 0) continue
      const slugs = recipe.ingredients.map(i => i.slug)
      const matchCount = slugs.filter(s => ownedSet.has(s)).length
      const totalCount = slugs.length
      const missingIngredients = slugs.filter(s => !ownedSet.has(s))
      const matchPct = Math.round((matchCount / totalCount) * 100)
      matched.push({ ...recipe, matchCount, totalCount, matchPct, missingIngredients })
    }

    matched.sort((a, b) => {
      if (b.matchPct !== a.matchPct) return b.matchPct - a.matchPct
      return a.totalCount - b.totalCount
    })

    const perfect = matched.filter(r => r.matchPct === 100)
    const almostThere = matched.filter(r => r.matchPct < 100 && r.missingIngredients.length <= 2 && r.matchCount > 0)

    return { perfect, almostThere }
  }, [recipes, ownedSet])

  /* Toggle ingredient */
  const toggle = (id: string) => {
    setOwned(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const clearAll = () => setOwned([])

  /* Ingredient name lookup */
  const ingredientNameMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const i of ingredients) {
      m[i.id] = i.nameZh || i.name
    }
    return m
  }, [ingredients])

  const filteredIngredients = ingredients.filter(i => i.category === activeCat)

  return (
    <main className="min-h-screen px-4 sm:px-6 py-12 max-w-5xl mx-auto">
      {/* Back link */}
      <Link href="/" className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-8">
        ← 返回首頁
      </Link>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="mb-14 text-center">
        <p className="font-mono text-neon-amber text-xs tracking-[0.35em] uppercase mb-4 text-neon-glow-amber">
          My Personal Bar
        </p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-gradient-amber leading-tight">
          我的酒櫃
        </h1>
        <p className="text-text-secondary mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          勾選你手邊擁有的材料，系統將即時配對出你能調製的雞尾酒。
        </p>
        <div className="mt-6 flex justify-center">
          <span className="inline-block w-16 h-px bg-neon-amber opacity-40" />
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-2 border-neon-amber/30 border-t-neon-amber rounded-full animate-spin" />
          <p className="font-mono text-sm text-text-muted">載入材料資料庫中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-400 font-mono text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* ─── Stats Bar ──────────────────────────────────── */}
          <section className="glass-card p-5 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="font-mono text-2xl text-neon-amber text-neon-glow-amber">{owned.length}</p>
                  <p className="font-mono text-[10px] text-text-muted tracking-wider">已選材料</p>
                </div>
                <div className="w-px h-8 bg-charcoal-700" />
                <div className="text-center">
                  <p className="font-mono text-2xl text-text-secondary">{ingredients.length}</p>
                  <p className="font-mono text-[10px] text-text-muted tracking-wider">全部材料</p>
                </div>
                <div className="w-px h-8 bg-charcoal-700" />
                <div className="text-center">
                  <p className="font-mono text-2xl text-neon-cyan">{perfect.length}</p>
                  <p className="font-mono text-[10px] text-text-muted tracking-wider">可調配方</p>
                </div>
              </div>
              {owned.length > 0 && (
                <button
                  onClick={clearAll}
                  className="font-mono text-xs text-text-muted hover:text-red-400 transition-colors underline underline-offset-2"
                >
                  清除全部
                </button>
              )}
            </div>
          </section>

          {/* ─── Ingredient Selector ────────────────────────── */}
          <section className="glass-card p-6 md:p-8 mb-10">
            <h2 className="font-display text-xl text-text-warm mb-1">選擇你的材料</h2>
            <p className="text-text-muted text-sm mb-6">勾選你擁有的食材，查看可調配的酒譜</p>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCat(cat.key)}
                  className={`px-4 py-2 text-sm font-sans rounded-sm border transition-all duration-200 ${
                    activeCat === cat.key
                      ? 'border-neon-amber text-neon-amber bg-neon-amber/10'
                      : 'border-charcoal-700 text-text-muted hover:border-charcoal-500 hover:text-text-secondary'
                  }`}
                >
                  {cat.label}
                  <span className="ml-1.5 font-mono text-xs opacity-60">
                    ({cat.owned}/{cat.total})
                  </span>
                </button>
              ))}
            </div>

            {/* Ingredient grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-h-[120px]">
              {filteredIngredients.map(ing => {
                const isOwned = owned.includes(ing.id)
                return (
                  <button
                    key={ing.id}
                    onClick={() => toggle(ing.id)}
                    className={`group relative text-left px-4 py-3 border rounded-sm transition-all duration-200 ${
                      isOwned
                        ? 'border-neon-amber bg-neon-amber/10 shadow-neon-amber'
                        : 'border-charcoal-700 hover:border-charcoal-500 bg-bg-tertiary/50'
                    }`}
                  >
                    <span className={`block text-sm font-sans font-medium leading-snug ${
                      isOwned ? 'text-neon-amber' : 'text-text-warm group-hover:text-text-warm'
                    }`}>
                      {ing.nameZh}
                    </span>
                    <span className={`block text-xs font-mono mt-0.5 ${
                      isOwned ? 'text-neon-amber/60' : 'text-text-muted'
                    }`}>
                      {ing.name}{ing.abv ? ` ${ing.abv}%` : ''}
                    </span>
                    {isOwned && (
                      <span className="absolute top-1.5 right-2 text-neon-amber text-xs">✓</span>
                    )}
                  </button>
                )
              })}
            </div>

            {filteredIngredients.length === 0 && (
              <div className="text-center py-10">
                <p className="text-text-muted font-mono text-sm">此分類無材料</p>
              </div>
            )}
          </section>

          {/* ─── Perfect Matches ────────────────────────────── */}
          {owned.length > 0 && (
            <section className="mb-10 animate-fade-in">
              <div className="mb-6">
                <h2 className="font-display text-2xl text-gradient-amber mb-1">
                  🍹 你能做的調酒
                </h2>
                <p className="text-text-muted text-sm">
                  你擁有所有材料，可以直接調製的配方
                </p>
                <div className="divider-amber mt-4" />
              </div>

              {perfect.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {perfect.map(recipe => (
                    <RecipeMatchCard
                      key={recipe.slug}
                      recipe={recipe}
                      ingredientNameMap={ingredientNameMap}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-10 text-center">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="text-text-muted font-mono text-sm">
                    目前沒有 100% 配對的配方，試著加入更多材料
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ─── Almost There ───────────────────────────────── */}
          {owned.length > 0 && almostThere.length > 0 && (
            <section className="mb-10 animate-fade-in">
              <div className="mb-6">
                <h2 className="font-display text-2xl text-gradient-cyan mb-1">
                  ✨ 差一點就能做
                </h2>
                <p className="text-text-muted text-sm">
                  只差 1–2 種材料即可調製，缺少的材料以紅色標示
                </p>
                <div className="divider-amber mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {almostThere.map(recipe => (
                  <RecipeMatchCard
                    key={recipe.slug}
                    recipe={recipe}
                    ingredientNameMap={ingredientNameMap}
                    ownedSlugs={owned}
                    showMissing
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="h-16" />
    </main>
  )
}

/* ── Recipe Match Card ──────────────────────────────────────── */
function RecipeMatchCard({
  recipe,
  ingredientNameMap,
  ownedSlugs = [],
  showMissing = false,
}: {
  recipe: MatchedRecipe
  ingredientNameMap: Record<string, string>
  ownedSlugs?: string[]
  showMissing?: boolean
}) {
  const method = recipe.method || 'build'
  const pctColor = recipe.matchPct === 100
    ? 'text-green-400'
    : recipe.matchPct >= 80
      ? 'text-neon-amber'
      : 'text-text-muted'

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="glass-card p-6 hover:border-neon-amber transition-all duration-300 group block"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-[11px] px-2 py-1 border border-charcoal-700 text-charcoal-500 uppercase tracking-wider">
          {METHOD_ICON[method] || '🍹'} {METHOD_ZH[method] || method}
        </span>
        <span className={`font-mono text-sm font-bold ${pctColor}`}>
          {recipe.matchPct}%
        </span>
      </div>

      {/* Names */}
      <h3 className="font-display text-xl text-text-warm mb-1 group-hover:text-neon-amber transition-colors">
        {recipe.nameZh}
      </h3>
      <p className="font-mono text-xs text-charcoal-500 mb-3">{recipe.nameEn}</p>

      {/* Ingredient chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {recipe.ingredients.map((ing, i) => {
          const isMissing = recipe.missingIngredients.includes(ing.slug)
          const displayName = ingredientNameMap[ing.slug] || ing.slug
          return (
            <span
              key={i}
              className={`font-mono text-[10px] px-2 py-0.5 border rounded-sm ${
                isMissing
                  ? 'border-red-500/50 text-red-400 bg-red-500/10'
                  : 'border-charcoal-700 text-charcoal-500'
              }`}
            >
              {isMissing && '✗ '}{displayName}
            </span>
          )
        })}
      </div>

      {/* Missing callout */}
      {showMissing && recipe.missingIngredients.length > 0 && (
        <>
          <p className="font-mono text-[10px] text-red-400/80 mb-2">
            缺少: {recipe.missingIngredients.map(s => ingredientNameMap[s] || s).join('、')}
          </p>
          <SubstituteHint
            missingSlugs={recipe.missingIngredients}
            ownedSlugs={ownedSlugs}
            nameMap={ingredientNameMap}
          />
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-charcoal-800">
        <span className="font-mono text-xs text-text-muted">
          {recipe.matchCount}/{recipe.totalCount} 種材料
        </span>
        <span className="font-mono text-[10px] text-charcoal-600 group-hover:text-neon-amber transition-colors">
          查看詳情 →
        </span>
      </div>
    </Link>
  )
}
