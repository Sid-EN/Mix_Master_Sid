'use client'

import { CLIENT_API } from '@/lib/api'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from '@/components/charts/LazyCharts'

/* ─── Types ─── */
interface RecipeOption {
  id: string
  slug: string
  nameEn: string
  nameZh: string
  method?: string
  ingredients: RecipeIngredient[]
}

interface RecipeIngredient {
  ingredientId?: string
  ingredientName?: string
  ingredientNameZh?: string
  slug?: string
  amount: number
  unit: string
  isOptional?: boolean
  notes?: string
}

interface CostEntry {
  id: number
  name: string
  nameZh: string
  amountML: number
  bottlePrice: number
  bottleSizeML: number
}

type Mode = 'recipe' | 'custom'
type Currency = 'NTD' | 'USD'

/* ─── Constants ─── */
const API = `${CLIENT_API}/api/v1`
const USD_TO_NTD = 32
const AVG_BAR_PRICE_NTD = 350
const STORAGE_KEY = 'mixmaster-prices'

const DEFAULT_PRICES: Record<string, { price: number; sizeML: number }> = {
  'tanqueray-gin':       { price: 680, sizeML: 750 },
  'absolut-vodka':       { price: 520, sizeML: 750 },
  'havana-club-3':       { price: 550, sizeML: 750 },
  'jose-cuervo-silver':  { price: 580, sizeML: 750 },
  'campari':             { price: 650, sizeML: 750 },
  'sweet-vermouth':      { price: 450, sizeML: 750 },
  'cointreau':           { price: 880, sizeML: 700 },
  'simple-syrup':        { price: 120, sizeML: 750 },
  'lime-juice':          { price: 80, sizeML: 500 },
  'lemon-juice':         { price: 80, sizeML: 500 },
  'tonic-water':         { price: 35, sizeML: 200 },
  'soda-water':          { price: 25, sizeML: 330 },
}

const PIE_COLORS = [
  '#F5A623', '#00FFFF', '#9B59B6', '#2ECC71', '#E74C3C',
  '#3498DB', '#F39C12', '#1ABC9C', '#E91E63', '#FF6F61',
]

/* ─── Helpers ─── */
let nextId = 1

function unitToML(amount: number, unit: string): number {
  const u = unit.toLowerCase().trim()
  if (u === 'ml') return amount
  if (u === 'oz' || u === 'fl oz') return amount * 29.5735
  if (u === 'cl') return amount * 10
  if (u === 'dash' || u === 'dashes') return amount * 0.9
  if (u === 'drop' || u === 'drops') return amount * 0.05
  if (u === 'tsp') return amount * 5
  if (u === 'tbsp') return amount * 15
  if (u === 'barspoon' || u === 'bsp') return amount * 5
  if (u === 'cup') return amount * 240
  if (u === 'piece' || u === 'pieces' || u === 'slice' || u === 'slices' ||
      u === 'sprig' || u === 'leaf' || u === 'leaves' || u === 'wedge' || u === 'whole') return 0
  return amount
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function loadSavedPrices(): Record<string, { price: number; sizeML: number }> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function savePrices(prices: Record<string, { price: number; sizeML: number }>) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prices)) } catch { /* noop */ }
}

function lookupPrice(key: string, saved: Record<string, { price: number; sizeML: number }>) {
  const slug = slugify(key)
  if (saved[slug]) return saved[slug]
  if (DEFAULT_PRICES[slug]) return DEFAULT_PRICES[slug]
  for (const [k, v] of Object.entries(saved)) {
    if (slug.includes(k) || k.includes(slug)) return v
  }
  for (const [k, v] of Object.entries(DEFAULT_PRICES)) {
    if (slug.includes(k) || k.includes(slug)) return v
  }
  return null
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { displayValue: string } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass-card px-3 py-2 border border-charcoal-600">
      <p className="font-mono text-xs text-text-warm">{d.name}</p>
      <p className="font-mono text-sm text-neon-amber">{d.payload.displayValue}</p>
    </div>
  )
}

/* ─── Main Page ─── */
export default function CostCalculatorPage() {
  const [mode, setMode] = useState<Mode>('recipe')
  const [currency, setCurrency] = useState<Currency>('NTD')
  const [batchMultiplier, setBatchMultiplier] = useState(1)

  // Recipe mode
  const [recipes, setRecipes] = useState<RecipeOption[]>([])
  const [loadingRecipes, setLoadingRecipes] = useState(true)
  const [recipeError, setRecipeError] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [entries, setEntries] = useState<CostEntry[]>([])

  // Custom mode
  const [customEntries, setCustomEntries] = useState<CostEntry[]>([
    { id: nextId++, name: '', nameZh: '', amountML: 30, bottlePrice: 0, bottleSizeML: 750 },
    { id: nextId++, name: '', nameZh: '', amountML: 30, bottlePrice: 0, bottleSizeML: 750 },
  ])

  // Saved prices from localStorage
  const [savedPrices, setSavedPrices] = useState<Record<string, { price: number; sizeML: number }>>({})

  useEffect(() => {
    setSavedPrices(loadSavedPrices())
  }, [])

  /* ── Fetch recipes ── */
  useEffect(() => {
    setLoadingRecipes(true)
    fetch(`${API}/recipes?limit=100`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('載入失敗'); return r.json() })
      .then(data => setRecipes(data.items ?? []))
      .catch(e => setRecipeError(e.message))
      .finally(() => setLoadingRecipes(false))
  }, [])

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── Filtered recipe options ── */
  const filteredRecipes = useMemo(() => {
    const list = recipes.map(r => ({
      id: r.id ?? r.slug,
      label: r.nameZh,
      sub: r.nameEn,
      tag: r.method ?? '',
    }))
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(o =>
      o.label.toLowerCase().includes(q) ||
      o.sub.toLowerCase().includes(q) ||
      o.tag.toLowerCase().includes(q)
    )
  }, [recipes, search])

  /* ── When recipe selected, populate entries ── */
  const selectRecipe = useCallback((id: string) => {
    setSelectedId(id)
    setDropdownOpen(false)
    setSearch('')

    const recipe = recipes.find(r => (r.id ?? r.slug) === id)
    if (!recipe) return

    const merged = { ...DEFAULT_PRICES, ...savedPrices }
    const newEntries: CostEntry[] = recipe.ingredients.map(ing => {
      const name = ing.ingredientName ?? ing.slug ?? ''
      const nameZh = ing.ingredientNameZh ?? ''
      const amountML = unitToML(ing.amount, ing.unit)
      const found = lookupPrice(name, merged)
      return {
        id: nextId++,
        name,
        nameZh,
        amountML,
        bottlePrice: found?.price ?? 0,
        bottleSizeML: found?.sizeML ?? 750,
      }
    })
    setEntries(newEntries)
  }, [recipes, savedPrices])

  /* ── Entry update helpers ── */
  function updateEntry(
    list: CostEntry[],
    setter: React.Dispatch<React.SetStateAction<CostEntry[]>>,
    id: number,
    field: keyof CostEntry,
    value: string | number,
  ) {
    setter(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  function removeCustomEntry(id: number) {
    setCustomEntries(prev => prev.length <= 1 ? prev : prev.filter(e => e.id !== id))
  }

  function addCustomEntry() {
    setCustomEntries(prev => [
      ...prev,
      { id: nextId++, name: '', nameZh: '', amountML: 30, bottlePrice: 0, bottleSizeML: 750 },
    ])
  }

  /* ── Save prices to localStorage on change ── */
  const persistPrices = useCallback((list: CostEntry[]) => {
    const prices = { ...savedPrices }
    for (const e of list) {
      if (e.name && e.bottlePrice > 0) {
        prices[slugify(e.name)] = { price: e.bottlePrice, sizeML: e.bottleSizeML }
      }
    }
    setSavedPrices(prices)
    savePrices(prices)
  }, [savedPrices])

  useEffect(() => {
    if (entries.some(e => e.bottlePrice > 0)) persistPrices(entries)
  }, [entries, persistPrices])

  useEffect(() => {
    if (customEntries.some(e => e.bottlePrice > 0)) persistPrices(customEntries)
  }, [customEntries, persistPrices])

  /* ── Calculation ── */
  const activeEntries = mode === 'recipe' ? entries : customEntries
  const calc = useMemo(() => {
    const items = activeEntries
      .filter(e => e.amountML > 0 && e.bottleSizeML > 0)
      .map(e => {
        const costNTD = (e.amountML / e.bottleSizeML) * e.bottlePrice
        return { ...e, costNTD }
      })

    const totalNTD = items.reduce((sum, i) => sum + i.costNTD, 0)
    return { items, totalNTD }
  }, [activeEntries])

  /* ── Currency display ── */
  const symbol = currency === 'NTD' ? 'NT$' : 'US$'
  const toDisplay = (ntd: number) =>
    currency === 'NTD' ? ntd : ntd / USD_TO_NTD
  const fmt = (ntd: number) => {
    const v = toDisplay(ntd)
    return v < 1 && v > 0 ? v.toFixed(2) : v.toFixed(v < 10 ? 1 : 0)
  }

  /* ── Pie chart data ── */
  const pieData = useMemo(() =>
    calc.items
      .filter(i => i.costNTD > 0)
      .map(i => ({
        name: i.nameZh || i.name,
        value: Math.round(toDisplay(i.costNTD) * 100) / 100,
        displayValue: `${symbol} ${fmt(i.costNTD)}`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calc.items, currency]
  )

  /* ── Bar price comparison ── */
  const barPriceDisplay = toDisplay(AVG_BAR_PRICE_NTD)
  const totalDisplay = toDisplay(calc.totalNTD)
  const pctDiff = barPriceDisplay > 0
    ? Math.round(((barPriceDisplay - totalDisplay) / barPriceDisplay) * 100)
    : 0

  const selectedRecipe = useMemo(() =>
    recipes.find(r => (r.id ?? r.slug) === selectedId),
    [recipes, selectedId]
  )

  /* ─── Render ─── */
  return (
    <main className="min-h-screen px-4 sm:px-6 py-24 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <Link href="/tools" className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-4">
          ← 工具箱 TOOLS
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl text-gradient-amber">
          💰 成本計算器
        </h1>
        <p className="font-mono text-sm text-charcoal-500 tracking-wider mt-2">
          COST CALCULATOR — 計算每杯調酒的材料成本
        </p>
      </div>

      {/* ── Top controls: Mode + Currency ── */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-in">
        {/* Mode toggle */}
        <div className="glass-card inline-flex rounded-md overflow-hidden">
          {([
            { key: 'recipe' as Mode, label: '📋 配方模式', en: 'Recipe' },
            { key: 'custom' as Mode, label: '✏️ 自訂模式', en: 'Custom' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={`px-4 py-2.5 font-mono text-xs tracking-wider transition-colors ${
                mode === tab.key
                  ? 'bg-neon-amber text-bg-primary'
                  : 'text-charcoal-500 hover:text-neon-amber'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Currency toggle */}
        <div className="glass-card inline-flex rounded-md overflow-hidden">
          {(['NTD', 'USD'] as Currency[]).map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-4 py-2.5 font-mono text-xs tracking-wider transition-colors ${
                currency === c
                  ? 'bg-neon-cyan text-bg-primary'
                  : 'text-charcoal-500 hover:text-neon-cyan'
              }`}
            >
              {c === 'NTD' ? '🇹🇼 NTD' : '🇺🇸 USD'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ─── Left: Input Panel (3 cols) ─── */}
        <div className="lg:col-span-3 space-y-4 animate-fade-in">

          {/* Recipe search (recipe mode) */}
          {mode === 'recipe' && (
            <div className="glass-card p-5">
              <h2 className="font-mono text-xs text-charcoal-500 tracking-wider mb-3">
                🔍 選擇配方 SELECT RECIPE
              </h2>

              {loadingRecipes ? (
                <p className="font-mono text-sm text-charcoal-500 animate-pulse">載入配方中...</p>
              ) : recipeError ? (
                <p className="font-mono text-sm text-red-400">❌ {recipeError}</p>
              ) : (
                <div ref={dropdownRef} className="relative">
                  <input
                    type="text"
                    placeholder="搜尋配方名稱 Search recipes..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setDropdownOpen(true) }}
                    onFocus={() => setDropdownOpen(true)}
                    className="input-neon font-mono text-sm px-4 py-3 w-full"
                  />
                  {selectedRecipe && !dropdownOpen && (
                    <div className="mt-2 font-mono text-xs text-neon-amber">
                      ✓ {selectedRecipe.nameZh} — {selectedRecipe.nameEn}
                    </div>
                  )}

                  {dropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 glass-card border border-charcoal-600 max-h-64 overflow-y-auto">
                      {filteredRecipes.length === 0 ? (
                        <p className="font-mono text-xs text-charcoal-500 p-3">找不到配方</p>
                      ) : (
                        filteredRecipes.map(o => (
                          <button
                            key={o.id}
                            onClick={() => selectRecipe(o.id)}
                            className={`w-full text-left px-4 py-2.5 font-mono text-sm transition-colors hover:bg-neon-amber/10 ${
                              o.id === selectedId ? 'text-neon-amber bg-neon-amber/5' : 'text-text-warm'
                            }`}
                          >
                            <span>{o.label}</span>
                            <span className="text-charcoal-500 ml-2 text-xs">{o.sub}</span>
                            {o.tag && (
                              <span className="ml-2 text-[10px] text-charcoal-600 uppercase">{o.tag}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ingredient rows */}
          {(mode === 'recipe' ? entries : customEntries).length > 0 && (
            <div className="space-y-3">
              <h2 className="font-mono text-xs text-charcoal-500 tracking-wider">
                🧾 材料成本 INGREDIENT COSTS
              </h2>

              {(mode === 'recipe' ? entries : customEntries).map((entry, idx) => {
                const isRecipe = mode === 'recipe'
                const list = isRecipe ? entries : customEntries
                const setter = isRecipe ? setEntries : setCustomEntries
                const costNTD = entry.bottleSizeML > 0
                  ? (entry.amountML / entry.bottleSizeML) * entry.bottlePrice
                  : 0

                return (
                  <div
                    key={entry.id}
                    className="glass-card p-3 sm:p-4 border-l-2 border-l-neon-amber/40"
                  >
                    {/* Row header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-charcoal-500">
                        {idx + 1}. {entry.nameZh || entry.name || '未命名'}
                      </span>
                      {costNTD > 0 && (
                        <span className="font-mono text-xs text-neon-amber">
                          {symbol} {fmt(costNTD)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Name (custom mode only) */}
                      {!isRecipe && (
                        <div className="col-span-2 sm:col-span-4">
                          <input
                            type="text"
                            placeholder="材料名稱 Name"
                            value={entry.name}
                            onChange={e => updateEntry(list, setter, entry.id, 'name', e.target.value)}
                            className="input-neon font-mono text-sm px-3 py-2 w-full"
                          />
                        </div>
                      )}

                      {/* Amount (ml) */}
                      <div className="relative">
                        <label className="font-mono text-[10px] text-charcoal-600 block mb-1">
                          用量 Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={entry.amountML || ''}
                            onChange={e => updateEntry(list, setter, entry.id, 'amountML', parseFloat(e.target.value) || 0)}
                            className="input-neon font-mono text-sm px-3 py-2 w-full pr-8"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-charcoal-500">ml</span>
                        </div>
                      </div>

                      {/* Bottle price */}
                      <div className="relative">
                        <label className="font-mono text-[10px] text-charcoal-600 block mb-1">
                          瓶價 Price
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={entry.bottlePrice || ''}
                            onChange={e => updateEntry(list, setter, entry.id, 'bottlePrice', parseFloat(e.target.value) || 0)}
                            className="input-neon font-mono text-sm px-3 py-2 w-full pr-10"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-charcoal-500">{currency === 'NTD' ? 'NT$' : 'US$'}</span>
                        </div>
                      </div>

                      {/* Bottle size */}
                      <div className="relative">
                        <label className="font-mono text-[10px] text-charcoal-600 block mb-1">
                          瓶容量 Size
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={entry.bottleSizeML || ''}
                            onChange={e => updateEntry(list, setter, entry.id, 'bottleSizeML', parseFloat(e.target.value) || 750)}
                            className="input-neon font-mono text-sm px-3 py-2 w-full pr-8"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-charcoal-500">ml</span>
                        </div>
                      </div>

                      {/* Remove (custom mode) */}
                      {!isRecipe && (
                        <div className="flex items-end">
                          <button
                            onClick={() => removeCustomEntry(entry.id)}
                            className="text-charcoal-600 hover:text-red-400 transition-colors px-3 py-2 font-mono text-sm"
                            aria-label="移除材料"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Add custom ingredient */}
              {mode === 'custom' && (
                <button
                  onClick={addCustomEntry}
                  className="btn-neon-amber font-mono text-xs w-full py-3 tracking-wider"
                >
                  + 新增材料 ADD INGREDIENT
                </button>
              )}
            </div>
          )}

          {/* Empty state */}
          {mode === 'recipe' && entries.length === 0 && !loadingRecipes && (
            <div className="glass-card p-8 text-center">
              <p className="font-mono text-sm text-charcoal-500">
                👆 請先選擇一個配方
              </p>
              <p className="font-mono text-xs text-charcoal-600 mt-1">
                Select a recipe to calculate cost
              </p>
            </div>
          )}
        </div>

        {/* ─── Right: Results Panel (2 cols) ─── */}
        <div className="lg:col-span-2 space-y-4 animate-fade-in">
          {/* Total cost */}
          <div className="glass-card p-6 text-center border-t-2 border-t-neon-amber/60">
            <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-1">
              每杯成本 COST PER DRINK
            </p>
            <p className="font-display text-4xl sm:text-5xl text-neon-amber text-neon-glow-amber leading-none">
              {symbol} {fmt(calc.totalNTD)}
            </p>
            <p className="font-mono text-xs text-charcoal-500 mt-2">
              / 杯 per serving
            </p>

            {/* Bar price comparison */}
            {calc.totalNTD > 0 && (
              <div className="mt-4 glass-card p-3 bg-bg-tertiary/50">
                <p className="font-mono text-xs text-charcoal-500 mb-1">
                  酒吧均價 Avg. Bar Price: {symbol} {fmt(AVG_BAR_PRICE_NTD)}
                </p>
                {pctDiff > 0 ? (
                  <p className="font-mono text-sm text-green-400">
                    🎉 便宜 {pctDiff}% cheaper!
                  </p>
                ) : pctDiff < 0 ? (
                  <p className="font-mono text-sm text-red-400">
                    ⚠️ 貴 {Math.abs(pctDiff)}% more expensive
                  </p>
                ) : (
                  <p className="font-mono text-sm text-charcoal-400">
                    與酒吧均價相同
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Batch multiplier */}
          <div className="glass-card p-5">
            <h2 className="font-mono text-xs text-charcoal-500 tracking-wider mb-3">
              🍸 批次計算 BATCH
            </h2>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                aria-label="批次杯數"
                min="1"
                max="50"
                step="1"
                value={batchMultiplier}
                onChange={e => setBatchMultiplier(parseInt(e.target.value))}
                className="flex-1 accent-neon-amber"
              />
              <span className="font-mono text-lg text-neon-amber w-12 text-right">
                ×{batchMultiplier}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 5, 10, 20].map(n => (
                <button
                  key={n}
                  onClick={() => setBatchMultiplier(n)}
                  className={`font-mono text-xs px-3 py-1.5 rounded transition-colors border ${
                    batchMultiplier === n
                      ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                      : 'border-charcoal-700 text-charcoal-500 hover:border-charcoal-500'
                  }`}
                >
                  ×{n}
                </button>
              ))}
            </div>
            {calc.totalNTD > 0 && (
              <div className="mt-3 pt-3 border-t border-charcoal-700">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-charcoal-500">{batchMultiplier} 杯總成本</span>
                  <span className="text-neon-amber text-neon-glow-amber">
                    {symbol} {fmt(calc.totalNTD * batchMultiplier)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-mono text-xs text-charcoal-500 tracking-wider mb-3">
                📊 成本分佈 BREAKDOWN
              </h2>
              <div className="w-full" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                      paddingAngle={2}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      formatter={(value: string) => (
                        <span className="font-mono text-xs text-charcoal-400">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Cost breakdown list */}
          {calc.items.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-mono text-xs text-charcoal-500 tracking-wider mb-3">
                🧾 明細 DETAILS
              </h2>
              <div className="space-y-2">
                {calc.items.map((item, i) => (
                  <div key={item.id} className="flex justify-between items-center font-mono text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-charcoal-400 truncate">
                        {item.nameZh || item.name}
                      </span>
                      <span className="text-charcoal-600 text-xs shrink-0">
                        {item.amountML.toFixed(0)}ml
                      </span>
                    </div>
                    <span className="text-text-warm shrink-0 ml-2">
                      {symbol} {fmt(item.costNTD)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-charcoal-700 flex justify-between font-mono text-sm">
                  <span className="text-charcoal-500">合計 Total</span>
                  <span className="text-neon-amber font-bold">{symbol} {fmt(calc.totalNTD)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="font-mono text-[10px] text-charcoal-600 text-center leading-relaxed">
            💡 瓶價以台灣常見零售價為參考基準。<br />
            Prices based on typical Taiwan retail. Actual costs may vary.
          </p>
        </div>
      </div>
    </main>
  )
}
