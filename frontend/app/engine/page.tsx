'use client'

import { useState, useRef, useEffect } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from 'recharts'
import { SkeletonIngredientSelector } from '../../components/Skeleton'

/* ── Types ────────────────────────────────────────────────── */
type Ingredient = { id: string; label: string; sub: string; cat: string }
type CategoryInfo = { key: string; label: string; count: number }

const CATEGORY_LABELS: Record<string, string> = {
  base_spirit: '基酒 Base Spirit',
  liqueur: '利口酒 Liqueur',
  wine: '葡萄酒 Wine',
  fortified_wine: '加烈酒 Fortified',
  syrup: '糖漿 Syrup',
  juice: '果汁 Juice',
  mixer: '混合飲 Mixer',
  fresh: '新鮮材料 Fresh',
  bitter: '苦精 Bitters',
  dairy: '乳製品 Dairy',
  egg: '蛋類 Egg',
}

const FLAVOR_LABELS = [
  '柑橘','熱帶','莓果','核果','草本','花香','辛香','大地',
  '煙燻','堅果','香草','焦糖','苦韻','鮮味','橡木',
]

const GRADE_COLORS: Record<string, string> = {
  A: '#2ECC71', B: '#F39C12', C: '#E67E22', D: '#E74C3C',
}

/* ── Page Component ─────────────────────────────────────────── */
export default function EnginePage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categories, setCategories]   = useState<CategoryInfo[]>([])
  const [selected, setSelected]       = useState<string[]>([])
  const [activeCat, setActiveCat]     = useState('base_spirit')
  const [result, setResult]           = useState<any>(null)
  const [loading, setLoading]         = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError]             = useState('')
  const resultRef                     = useRef<HTMLDivElement>(null)

  /* Fetch ingredients from API on mount */
  useEffect(() => {
    async function fetchIngredients() {
      try {
        const res = await fetch('/api/v1/ingredients?limit=500')
        const data = await res.json()
        const items: Ingredient[] = (data.items || []).map((i: any) => ({
          id: i.id || i.slug,
          label: i.nameZh || i.name || i.nameEn || i.id,
          sub: i.abv ? `${i.name || i.nameEn || ''} ${i.abv}%` : (i.name || i.nameEn || ''),
          cat: i.category || 'other',
        }))
        setIngredients(items)

        // Build dynamic categories
        const catCounts: Record<string, number> = {}
        for (const item of items) {
          catCounts[item.cat] = (catCounts[item.cat] || 0) + 1
        }
        const catOrder = ['base_spirit','liqueur','wine','fortified_wine','syrup','juice','mixer','fresh','bitter','dairy','egg']
        const cats: CategoryInfo[] = catOrder
          .filter(k => catCounts[k])
          .map(k => ({
            key: k,
            label: CATEGORY_LABELS[k] || k,
            count: catCounts[k],
          }))
        // Add any categories not in order
        for (const k of Object.keys(catCounts)) {
          if (!catOrder.includes(k)) {
            cats.push({ key: k, label: CATEGORY_LABELS[k] || k, count: catCounts[k] })
          }
        }
        setCategories(cats)
        if (cats.length > 0) setActiveCat(cats[0].key)
      } catch {
        setError('無法載入材料資料庫')
      } finally {
        setLoadingData(false)
      }
    }
    fetchIngredients()
  }, [])

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const clearAll = () => setSelected([])

  const generate = async () => {
    if (!selected.length) { setError('請至少選擇 1 種材料'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/v1/engine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableIngredients: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || '生成失敗')
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredIngredients = ingredients.filter(i => i.cat === activeCat)

  /* ── Radar data ── */
  const radarData = result?.recipe?.flavorProfile?.vector
    ? FLAVOR_LABELS.map((label, i) => ({
        axis: label,
        value: result.recipe.flavorProfile.vector[i] ?? 0,
      }))
    : []

  return (
    <main className="min-h-screen px-4 sm:px-6 py-12 max-w-5xl mx-auto">
      {/* Back link */}
      <a href="/" className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-8">
        ← 返回首頁
      </a>

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="mb-14 text-center">
        <p className="font-mono text-neon-amber text-xs tracking-[0.35em] uppercase mb-4 text-neon-glow-amber">
          Smart Flavor Engine
        </p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-gradient-amber leading-tight">
          智慧配方引擎
        </h1>
        <p className="text-text-secondary mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          選擇你手邊的材料，AI 引擎將運算最佳風味平衡，
          <br className="hidden sm:inline" />
          為你量身打造一杯專屬調酒配方。
        </p>
        <p className="font-mono text-xs text-charcoal-500 mt-3">
          資料庫收錄 <span className="text-neon-amber">{ingredients.length}</span> 種材料 · <span className="text-neon-cyan">{categories.length}</span> 大類別
        </p>
        <div className="mt-6 flex justify-center">
          <span className="inline-block w-16 h-px bg-neon-amber opacity-40" />
        </div>
      </section>

      {/* ─── Ingredient Selector ────────────────────────────── */}
      <section className="glass-card p-6 md:p-8 mb-10">
        <h2 className="font-display text-xl text-text-warm mb-1">選擇手邊材料</h2>
        <p className="text-text-muted text-sm mb-6">點選你擁有的食材，至少選擇一項即可生成配方</p>

        {loadingData ? (
          <SkeletonIngredientSelector />
        ) : (
        <>
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
              <span className="ml-1.5 font-mono text-xs opacity-60">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Ingredient grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-h-[120px]">
          {filteredIngredients.map(ing => {
            const isSelected = selected.includes(ing.id)
            return (
              <button
                key={ing.id}
                onClick={() => toggle(ing.id)}
                className={`group relative text-left px-4 py-3 border rounded-sm transition-all duration-200 ${
                  isSelected
                    ? 'border-neon-amber bg-neon-amber/10 shadow-neon-amber'
                    : 'border-charcoal-700 hover:border-charcoal-500 bg-bg-tertiary/50'
                }`}
              >
                <span className={`block text-sm font-sans font-medium leading-snug ${
                  isSelected ? 'text-neon-amber' : 'text-text-warm group-hover:text-text-warm'
                }`}>
                  {ing.label}
                </span>
                {ing.sub && (
                  <span className={`block text-xs font-mono mt-0.5 ${
                    isSelected ? 'text-neon-amber/60' : 'text-text-muted'
                  }`}>
                    {ing.sub}
                  </span>
                )}
                {isSelected && (
                  <span className="absolute top-1.5 right-2 text-neon-amber text-xs">✓</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Bottom bar */}
        <div className="divider-amber mt-6 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-text-secondary">
              已選 <span className="text-neon-amber font-bold">{selected.length}</span> 項材料
            </span>
            {selected.length > 0 && (
              <button
                onClick={clearAll}
                className="font-mono text-xs text-text-muted hover:text-red-400 transition-colors underline underline-offset-2"
              >
                清除全部
              </button>
            )}
          </div>

          <button
            onClick={generate}
            disabled={loading || selected.length === 0}
            className="btn-neon-amber w-full sm:w-auto px-10 py-3 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? '⚙ 計算風味平衡中…' : '🍹 生成配方'}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-400 font-mono text-sm animate-fade-in">⚠ {error}</p>
        )}
        </>
        )}
      </section>

      {/* ─── Loading State ──────────────────────────────────── */}
      {loading && (
        <section className="glass-card p-12 mb-10 flex flex-col items-center justify-center gap-6 animate-fade-in">
          {/* Pulsing cocktail ring */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-neon-amber/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-neon-amber/50 animate-pulse-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🍸</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-xl text-text-warm mb-1">正在調配你的完美配方</p>
            <p className="font-mono text-xs text-text-muted tracking-widest">ANALYZING FLAVOR BALANCE…</p>
          </div>
        </section>
      )}

      {/* ─── Result Section ─────────────────────────────────── */}
      {result && (
        <div ref={resultRef} className="space-y-8 animate-fade-in">

          {/* A. Recipe Header Card */}
          <section className="glass-card p-8 md:p-10 border-neon-amber-glow">
            <p className="font-mono text-xs text-charcoal-500 tracking-widest uppercase mb-4">
              Your Signature Cocktail
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Grade badge */}
                <div
                  className="flex items-center justify-center w-20 h-20 rounded-sm border-2"
                  style={{
                    borderColor: GRADE_COLORS[result.recipe.grade] || '#6B6358',
                    backgroundColor: `${GRADE_COLORS[result.recipe.grade] || '#6B6358'}15`,
                  }}
                >
                  <span
                    className="font-display text-5xl font-bold"
                    style={{ color: GRADE_COLORS[result.recipe.grade] || '#6B6358' }}
                  >
                    {result.recipe.grade}
                  </span>
                </div>
                <div>
                  <h2 className="font-display text-3xl md:text-4xl text-gradient-amber leading-tight">
                    {result.recipe.nameZh}
                  </h2>
                  <p className="text-text-secondary font-sans text-sm mt-1">{result.recipe.nameEn}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-mono text-3xl text-neon-amber text-neon-glow-amber">
                  {result.recipe.balanceScore.toFixed(1)}
                  <span className="text-text-muted text-lg ml-1">/ 100</span>
                </p>
                <p className="font-mono text-xs text-charcoal-500 mt-1">Balance Score</p>
              </div>
            </div>

            {/* Method / Glass / Garnish tags */}
            <div className="divider-amber mt-6 mb-5" />
            <div className="flex flex-wrap gap-3">
              {[
                { label: '手法', value: result.recipe.method?.toUpperCase(), color: 'neon-cyan' },
                { label: '杯型', value: result.recipe.glassType },
                { label: '裝飾', value: result.recipe.garnish },
              ]
                .filter(t => t.value)
                .map(tag => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-sm font-mono text-xs ${
                      tag.color === 'neon-cyan'
                        ? 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/5'
                        : 'border-charcoal-600 text-text-secondary bg-bg-tertiary/50'
                    }`}
                  >
                    <span className="text-text-muted">{tag.label}</span>
                    {tag.value}
                  </span>
                ))}
            </div>
          </section>

          {/* B. Ingredients List */}
          <section className="glass-card p-6 md:p-8">
            <h3 className="font-display text-sm text-neon-amber uppercase tracking-widest mb-5">材料配比</h3>
            <div className="space-y-0">
              {result.recipe.ingredients.map((ing: any, i: number) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i % 2 === 0 ? 'bg-bg-tertiary/40' : ''
                  }`}
                >
                  <span className="text-text-warm text-sm">
                    {ing.ingredient_name_zh || ing.ingredient_name}
                  </span>
                  <span className="font-mono text-neon-amber text-sm tracking-wide">
                    {ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* C. Steps */}
          <section className="glass-card p-6 md:p-8">
            <h3 className="font-display text-sm text-neon-amber uppercase tracking-widest mb-5">調製步驟</h3>
            <ol className="space-y-4">
              {result.recipe.steps.map((step: string, i: number) => (
                <li key={i} className="flex gap-4 text-sm">
                  <span className="font-mono text-neon-amber shrink-0 text-base font-bold leading-snug">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <span className="text-text-secondary leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* D. Flavor Radar Chart */}
          {radarData.length > 0 && (
            <section className="glass-card p-6 md:p-8">
              <h3 className="font-display text-sm text-neon-amber uppercase tracking-widest mb-6">風味輪廓</h3>
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-lg" style={{ height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#3D3D50" />
                      <PolarAngleAxis
                        dataKey="axis"
                        tick={{ fill: '#F0EDE4', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="flavor"
                        dataKey="value"
                        stroke="#F5A623"
                        strokeWidth={2}
                        fill="rgba(245,166,35,0.3)"
                        fillOpacity={1}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Primary flavor tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(result.recipe.flavorProfile?.primaryFlavors || []).map((f: string) => (
                  <span
                    key={f}
                    className="font-mono text-xs px-3 py-1 border border-neon-amber/40 text-neon-amber bg-neon-amber/5 rounded-sm"
                  >
                    {f}
                  </span>
                ))}
              </div>
              {result.recipe.flavorProfile?.description && (
                <p className="text-text-secondary text-sm leading-relaxed">
                  {result.recipe.flavorProfile.description}
                </p>
              )}
            </section>
          )}

          {/* E. Insights */}
          {result.insights && (result.insights.balanceAnalysis || result.insights.tipsForImprovement) && (
            <section className="glass-card p-6 md:p-8 border border-neon-cyan/30" style={{
              boxShadow: '0 0 12px rgba(0,255,255,0.1), inset 0 0 12px rgba(0,255,255,0.03)',
            }}>
              <h3 className="font-display text-sm text-neon-cyan uppercase tracking-widest mb-5">引擎洞察</h3>
              {result.insights.balanceAnalysis && (
                <div className="mb-4">
                  <p className="font-mono text-xs text-text-muted mb-1">Balance Analysis</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {result.insights.balanceAnalysis}
                  </p>
                </div>
              )}
              {result.insights.tipsForImprovement && (
                <div>
                  <p className="font-mono text-xs text-text-muted mb-1">Tips for Improvement</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {result.insights.tipsForImprovement}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* F. Alternatives */}
          {result.recipe.alternatives && result.recipe.alternatives.length > 0 && (
            <section className="glass-card p-6 md:p-8">
              <h3 className="font-display text-sm text-neon-purple uppercase tracking-widest mb-5">替代建議</h3>
              <div className="space-y-4">
                {result.recipe.alternatives.map((alt: any, i: number) => (
                  <div key={i} className="flex gap-4 p-4 bg-bg-tertiary/50 rounded-sm border border-charcoal-700">
                    <span className="text-neon-purple text-lg shrink-0">💡</span>
                    <div>
                      <p className="text-text-warm text-sm font-medium mb-1">{alt.issue}</p>
                      <p className="text-text-secondary text-sm">{alt.suggestion}</p>
                      {alt.replaceSlugs && alt.replaceSlugs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {alt.replaceSlugs.map((slug: string) => (
                            <span key={slug} className="font-mono text-xs px-2 py-0.5 border border-neon-purple/30 text-neon-purple bg-neon-purple/5 rounded-sm">
                              {slug}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Bottom spacer */}
      <div className="h-16" />
    </main>
  )
}
