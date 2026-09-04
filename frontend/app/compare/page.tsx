'use client'

import { CLIENT_API } from '@/lib/api'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend,
} from '@/components/charts/LazyCharts'

/* ── Types ────────────────────────────────────────────────── */
interface FlavorProfile {
  primaryFlavors: string[]
  acid: number
  sweet: number
  bitter: number
  punch: number
}

interface Ingredient {
  slug: string
  amount: number
  unit: string
}

interface Recipe {
  id: string
  slug: string
  nameZh: string
  nameEn: string
  method: string
  difficulty: number
  flavorProfile: FlavorProfile
  ingredients: Ingredient[]
}

/* ── Constants ────────────────────────────────────────────── */
const API = `${CLIENT_API}/api/v1`

const SLOT_COLORS = [
  { name: 'neon-amber', hex: '#F5A623', border: 'border-[#F5A623]', text: 'text-[#F5A623]', bg: 'bg-[#F5A623]' },
  { name: 'neon-cyan', hex: '#00FFFF', border: 'border-[#00FFFF]', text: 'text-[#00FFFF]', bg: 'bg-[#00FFFF]' },
  { name: 'neon-purple', hex: '#9B59B6', border: 'border-[#9B59B6]', text: 'text-[#9B59B6]', bg: 'bg-[#9B59B6]' },
]

const METHOD_MAP: Record<string, string> = {
  stir: 'Stir 攪拌法',
  shake: 'Shake 搖盪法',
  build: 'Build 直調法',
  roll: 'Roll 滾動法',
  throw: 'Throw 拋接法',
  blend: 'Blend 攪打法',
}

/* ── Selector Component ───────────────────────────────────── */
function RecipeSelector({
  slotIndex,
  recipes,
  selectedId,
  onSelect,
  onRemove,
  showRemove,
}: {
  slotIndex: number
  recipes: Recipe[]
  selectedId: string
  onSelect: (id: string) => void
  onRemove: () => void
  showRemove: boolean
}) {
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const color = SLOT_COLORS[slotIndex]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return recipes
    return recipes.filter(r =>
      r.nameZh.toLowerCase().includes(q) ||
      r.nameEn.toLowerCase().includes(q) ||
      r.method?.toLowerCase().includes(q)
    )
  }, [recipes, search])

  const selected = recipes.find(r => (r.id ?? r.slug) === selectedId)

  return (
    <div className={`glass-card !overflow-visible p-4 ${color.border} border-2 flex-1 min-w-[220px]`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono text-xs tracking-wider ${color.text}`}>
          配方 {slotIndex + 1} / RECIPE {slotIndex + 1}
        </span>
        {showRemove && (
          <button
            onClick={onRemove}
            className="font-mono text-xs text-charcoal-500 hover:text-red-400 transition-colors"
          >
            ✕ 移除
          </button>
        )}
      </div>

      <div ref={dropdownRef} className="relative">
        <input
          type="text"
          placeholder="搜尋配方 Search recipe…"
          className="input-neon w-full text-sm"
          value={search}
          onFocus={() => setDropdownOpen(true)}
          onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true) }}
        />

        {selected && !search && (
          <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
            <span className={`font-mono text-sm ${color.text}`}>
              {selected.nameZh} <span className="text-charcoal-500 text-xs">{selected.nameEn}</span>
            </span>
          </div>
        )}

        {dropdownOpen && (
          <ul className="absolute z-[100] w-full mt-1 max-h-64 overflow-y-auto
                         border border-charcoal-700 bg-bg-secondary rounded shadow-card">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-charcoal-500 text-xs font-mono">找不到配方</li>
            )}
            {filtered.map(r => {
              const rid = r.id ?? r.slug
              return (
                <li
                  key={rid}
                  onClick={() => { onSelect(rid); setSearch(''); setDropdownOpen(false) }}
                  className={`px-3 py-2 cursor-pointer hover:bg-bg-tertiary transition-colors
                    ${rid === selectedId ? 'bg-bg-tertiary' : ''}`}
                >
                  <span className="font-mono text-sm text-text-warm">{r.nameZh}</span>
                  <span className="ml-2 text-charcoal-500 text-xs">{r.nameEn}</span>
                  {r.method && (
                    <span className="ml-2 text-charcoal-600 text-[10px] uppercase">{r.method}</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ── Star helper ──────────────────────────────────────────── */
function Stars({ count }: { count: number }) {
  return <span>{'⭐'.repeat(Math.max(1, Math.min(5, count)))}</span>
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ComparePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [slotCount, setSlotCount] = useState(2)
  const [slotIds, setSlotIds] = useState<string[]>(['', '', ''])

  useEffect(() => {
    fetch(`${API}/recipes?limit=100`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('載入失敗'); return r.json() })
      .then(data => setRecipes(data.items ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const selectedRecipes = useMemo(() =>
    slotIds.slice(0, slotCount)
      .map(id => recipes.find(r => (r.id ?? r.slug) === id))
      .filter((r): r is Recipe => !!r),
    [slotIds, slotCount, recipes]
  )

  const hasComparison = selectedRecipes.length >= 2

  /* ── Radar data ── */
  const radarData = useMemo(() => {
    const axes = [
      { key: 'acid', label: '酸度 Acid' },
      { key: 'sweet', label: '甜度 Sweet' },
      { key: 'bitter', label: '苦度 Bitter' },
      { key: 'punch', label: '酒精感 Punch' },
    ] as const

    return axes.map(axis => {
      const point: Record<string, string | number> = { axis: axis.label }
      selectedRecipes.forEach((r, i) => {
        point[`recipe${i}`] = Math.round(((r.flavorProfile?.[axis.key] ?? 0) * 10) * 10) / 10
      })
      return point
    })
  }, [selectedRecipes])

  /* ── Ingredient comparison ── */
  const ingredientMap = useMemo(() => {
    const allSlugs = new Set<string>()
    selectedRecipes.forEach(r => r.ingredients?.forEach(ing => allSlugs.add(ing.slug)))

    return Array.from(allSlugs).map(slug => ({
      slug,
      label: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      recipes: selectedRecipes.map(r => {
        const ing = r.ingredients?.find(i => i.slug === slug)
        return ing ? `${ing.amount} ${ing.unit}` : null
      }),
      shared: selectedRecipes.filter(r => r.ingredients?.some(i => i.slug === slug)).length > 1,
    }))
  }, [selectedRecipes])

  /* ── Handlers ── */
  const handleSelect = (slotIndex: number, id: string) => {
    setSlotIds(prev => {
      const next = [...prev]
      next[slotIndex] = id
      return next
    })
  }

  const handleRemove = (slotIndex: number) => {
    setSlotIds(prev => {
      const next = [...prev]
      next[slotIndex] = ''
      return next
    })
    if (slotCount > 2) setSlotCount(slotCount - 1)
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-24 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="font-display text-3xl sm:text-4xl text-gradient-amber mb-2">
          📊 配方比較器
        </h1>
        <p className="font-mono text-sm text-charcoal-500 tracking-wider">
          RECIPE COMPARATOR — 最多比較 3 款配方
        </p>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-12">
          <span className="text-neon-amber animate-pulse text-lg">載入配方中…</span>
        </div>
      )}
      {error && (
        <div className="text-center py-12">
          <span className="text-red-400 font-mono text-sm">⚠ {error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Recipe Selectors ── */}
          <section className="mb-10 animate-fade-in">
            <div className="flex flex-wrap gap-4 mb-4">
              {Array.from({ length: slotCount }).map((_, i) => (
                <RecipeSelector
                  key={i}
                  slotIndex={i}
                  recipes={recipes}
                  selectedId={slotIds[i]}
                  onSelect={(id) => handleSelect(i, id)}
                  onRemove={() => handleRemove(i)}
                  showRemove={i >= 2}
                />
              ))}
            </div>

            {slotCount < 3 && (
              <button
                onClick={() => setSlotCount(3)}
                className="btn-neon-amber font-mono text-xs px-4 py-2"
              >
                ＋ 新增比較 Add Slot
              </button>
            )}
          </section>

          {/* ── Comparison content ── */}
          {!hasComparison && (
            <div className="glass-card p-12 text-center">
              <p className="text-charcoal-500 font-mono text-sm">
                請選擇至少 2 款配方開始比較<br />
                <span className="text-charcoal-600 text-xs">Select at least 2 recipes to compare</span>
              </p>
            </div>
          )}

          {hasComparison && (
            <div className="space-y-8 animate-fade-in">
              {/* ── Radar Chart ── */}
              <section className="glass-card p-6">
                <h2 className="font-display text-xl text-gradient-cyan mb-4">
                  風味雷達 Flavor Radar
                </h2>
                <div className="w-full" style={{ height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#2A2A35" />
                      <PolarAngleAxis
                        dataKey="axis"
                        tick={{ fill: '#B8B0A0', fontSize: 12, fontFamily: 'Fira Code, monospace' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fill: '#6B6358', fontSize: 10 }}
                        tickCount={6}
                      />
                      {selectedRecipes.map((r, i) => (
                        <Radar
                          key={r.id ?? r.slug}
                          name={`${r.nameZh} ${r.nameEn}`}
                          dataKey={`recipe${i}`}
                          stroke={SLOT_COLORS[i].hex}
                          fill={SLOT_COLORS[i].hex}
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend
                        wrapperStyle={{ fontFamily: 'Fira Code, monospace', fontSize: 11 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* ── Stats Table ── */}
              <section className="glass-card p-6 overflow-x-auto">
                <h2 className="font-display text-xl text-gradient-cyan mb-4">
                  詳細比較 Side-by-Side
                </h2>
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-charcoal-700">
                      <th className="text-left py-3 px-2 text-charcoal-500 text-xs tracking-wider">
                        指標 Metric
                      </th>
                      {selectedRecipes.map((r, i) => (
                        <th key={r.id ?? r.slug}
                            className={`text-left py-3 px-2 text-xs tracking-wider ${SLOT_COLORS[i].text}`}>
                          {r.nameZh}<br />
                          <span className="text-charcoal-500 text-[10px]">{r.nameEn}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-text-warm">
                    {/* Difficulty */}
                    <tr className="border-b border-charcoal-800 hover:bg-bg-tertiary transition-colors">
                      <td className="py-3 px-2 text-charcoal-500">難度 Difficulty</td>
                      {selectedRecipes.map((r, i) => (
                        <td key={i} className="py-3 px-2"><Stars count={r.difficulty} /></td>
                      ))}
                    </tr>
                    {/* Method */}
                    <tr className="border-b border-charcoal-800 hover:bg-bg-tertiary transition-colors">
                      <td className="py-3 px-2 text-charcoal-500">手法 Method</td>
                      {selectedRecipes.map((r, i) => (
                        <td key={i} className="py-3 px-2">
                          {METHOD_MAP[r.method] ?? r.method}
                        </td>
                      ))}
                    </tr>
                    {/* Punch */}
                    <tr className="border-b border-charcoal-800 hover:bg-bg-tertiary transition-colors">
                      <td className="py-3 px-2 text-charcoal-500">酒精感 Punch</td>
                      {selectedRecipes.map((r, i) => (
                        <td key={i} className="py-3 px-2">
                          {Math.round((r.flavorProfile?.punch ?? 0) * 100) / 10}/10
                        </td>
                      ))}
                    </tr>
                    {/* Acid */}
                    <tr className="border-b border-charcoal-800 hover:bg-bg-tertiary transition-colors">
                      <td className="py-3 px-2 text-charcoal-500">酸度 Acid</td>
                      {selectedRecipes.map((r, i) => (
                        <td key={i} className="py-3 px-2">
                          {Math.round((r.flavorProfile?.acid ?? 0) * 100) / 10}/10
                        </td>
                      ))}
                    </tr>
                    {/* Sweet */}
                    <tr className="border-b border-charcoal-800 hover:bg-bg-tertiary transition-colors">
                      <td className="py-3 px-2 text-charcoal-500">甜度 Sweet</td>
                      {selectedRecipes.map((r, i) => (
                        <td key={i} className="py-3 px-2">
                          {Math.round((r.flavorProfile?.sweet ?? 0) * 100) / 10}/10
                        </td>
                      ))}
                    </tr>
                    {/* Bitter */}
                    <tr className="border-b border-charcoal-800 hover:bg-bg-tertiary transition-colors">
                      <td className="py-3 px-2 text-charcoal-500">苦度 Bitter</td>
                      {selectedRecipes.map((r, i) => (
                        <td key={i} className="py-3 px-2">
                          {Math.round((r.flavorProfile?.bitter ?? 0) * 100) / 10}/10
                        </td>
                      ))}
                    </tr>
                    {/* Ingredient count */}
                    <tr className="border-b border-charcoal-800 hover:bg-bg-tertiary transition-colors">
                      <td className="py-3 px-2 text-charcoal-500">材料數 Ingredients</td>
                      {selectedRecipes.map((r, i) => (
                        <td key={i} className="py-3 px-2">{r.ingredients?.length ?? 0}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* ── Flavor Tags ── */}
              <section className="glass-card p-6">
                <h2 className="font-display text-xl text-gradient-cyan mb-4">
                  風味標籤 Flavor Tags
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedRecipes.map((r, i) => (
                    <div key={r.id ?? r.slug}
                         className={`p-4 rounded border ${SLOT_COLORS[i].border} bg-bg-tertiary`}>
                      <p className={`font-mono text-xs mb-2 ${SLOT_COLORS[i].text}`}>
                        {r.nameZh} {r.nameEn}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(r.flavorProfile?.primaryFlavors ?? []).map(tag => (
                          <span key={tag}
                                className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider
                                           border border-charcoal-600 text-text-secondary bg-bg-secondary">
                            {tag}
                          </span>
                        ))}
                        {(r.flavorProfile?.primaryFlavors ?? []).length === 0 && (
                          <span className="text-charcoal-600 text-xs">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Ingredient Comparison ── */}
              <section className="glass-card p-6 overflow-x-auto">
                <h2 className="font-display text-xl text-gradient-cyan mb-4">
                  材料比較 Ingredient Comparison
                </h2>
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-charcoal-700">
                      <th className="text-left py-3 px-2 text-charcoal-500 text-xs tracking-wider">
                        材料 Ingredient
                      </th>
                      {selectedRecipes.map((r, i) => (
                        <th key={r.id ?? r.slug}
                            className={`text-left py-3 px-2 text-xs tracking-wider ${SLOT_COLORS[i].text}`}>
                          {r.nameZh}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-text-warm">
                    {ingredientMap.map(ing => (
                      <tr key={ing.slug}
                          className="border-b border-charcoal-800 hover:bg-bg-tertiary transition-colors">
                        <td className="py-2 px-2">
                          <span className="text-text-secondary">{ing.label}</span>
                          {ing.shared && (
                            <span className="ml-2 text-[10px] text-neon-amber">● 共用</span>
                          )}
                        </td>
                        {ing.recipes.map((val, i) => (
                          <td key={i} className="py-2 px-2">
                            {val ? (
                              <span className="text-text-warm">{val}</span>
                            ) : (
                              <span className="text-charcoal-700">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {ingredientMap.length === 0 && (
                      <tr>
                        <td colSpan={selectedRecipes.length + 1}
                            className="py-4 text-center text-charcoal-500 text-xs">
                          無材料資料
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </div>
          )}

          {/* Footer link */}
          <div className="mt-12 text-center">
            <Link href="/recipes"
                  className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors">
              ← 回到配方庫 Back to Recipes
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
