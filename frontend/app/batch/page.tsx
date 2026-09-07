'use client'

import { CLIENT_API } from '@/lib/api'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'

/* ── Types ────────────────────────────────────────────────── */
interface RecipeOption {
  id: string
  slug: string
  nameEn: string
  nameZh: string
  method?: string
  category?: string
  ingredients: { slug: string; amount: number; unit: string }[]
}

interface PrepOption {
  id: string
  slug: string
  nameEn: string
  nameZh: string
  category: string
  ingredients: { name: string; nameEn: string; amount: number; unit: string }[]
}

interface BatchIngredient {
  name: string
  nameZh: string
  originalAmount: number
  scaledAmount: number
  unit: string
  scaledMl: number
}

interface BatchResult {
  recipeId: string
  recipeName: string
  recipeNameZh: string
  multiplier: number
  ingredients: BatchIngredient[]
  totalVolume: { oz: number; ml: number }
  estimatedOutput: { ml: number; servings: number; method: string; dilutionFactor: number }
  notes: string
}

type Mode = 'cocktail' | 'prep'

const API = `${CLIENT_API}/api/v1`

const METHOD_ICONS: Record<string, string> = {
  shake: '🧊', stir: '🥄', build: '🥃', roll: '🌀', throw: '✨',
}

const PRESETS = [2, 5, 10, 25, 50]

/* ── Page ─────────────────────────────────────────────────── */
export default function BatchPage() {
  const [mode, setMode] = useState<Mode>('cocktail')
  const [recipes, setRecipes] = useState<RecipeOption[]>([])
  const [preps, setPreps] = useState<PrepOption[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [listError, setListError] = useState('')

  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [multiplier, setMultiplier] = useState(5)
  const [result, setResult] = useState<BatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resultRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /* ── Fetch lists on mount & mode change ── */
  useEffect(() => {
    setLoadingList(true)
    setListError('')
    setSelectedId('')
    setSearch('')
    setResult(null)

    const endpoint = mode === 'cocktail' ? `${API}/recipes` : `${API}/prep`
    fetch(endpoint, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('載入失敗'); return r.json() })
      .then(data => {
        if (mode === 'cocktail') setRecipes(data.items ?? [])
        else setPreps(data.items ?? [])
      })
      .catch(e => setListError(e.message))
      .finally(() => setLoadingList(false))
  }, [mode])

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

  /* ── Filtered options ── */
  const options = useMemo(() => {
    const list = mode === 'cocktail'
      ? recipes.map(r => ({ id: r.id ?? r.slug, label: r.nameZh, sub: r.nameEn, tag: r.method ?? '' }))
      : preps.map(p => ({ id: p.id ?? p.slug, label: p.nameZh, sub: p.nameEn, tag: p.category ?? '' }))

    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(o =>
      o.label.toLowerCase().includes(q) ||
      o.sub.toLowerCase().includes(q) ||
      o.tag.toLowerCase().includes(q)
    )
  }, [mode, recipes, preps, search])

  const selectedOption = useMemo(() =>
    options.find(o => o.id === selectedId) ??
    (mode === 'cocktail'
      ? recipes.map(r => ({ id: r.id ?? r.slug, label: r.nameZh, sub: r.nameEn, tag: r.method ?? '' }))
      : preps.map(p => ({ id: p.id ?? p.slug, label: p.nameZh, sub: p.nameEn, tag: p.category ?? '' }))
    ).find(o => o.id === selectedId),
    [selectedId, options, mode, recipes, preps]
  )

  /* ── Multiplier helpers ── */
  const clamp = (v: number) => Math.min(100, Math.max(0.5, Math.round(v * 10) / 10))
  const setMult = (v: number) => setMultiplier(clamp(v))

  /* ── Calculate ── */
  const calculate = async () => {
    if (!selectedId) { setError('請先選擇一個配方'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const endpoint = mode === 'cocktail'
        ? `${API}/batch/calculate`
        : `${API}/batch/calculate-prep`
      const body = mode === 'cocktail'
        ? { recipeId: selectedId, multiplier }
        : { prepId: selectedId, multiplier }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || '計算失敗')
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    } catch (e: any) {
      setError(e.message || '計算時發生未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Back link */}
        <Link href="/" className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-8">
          ← 返回首頁
        </Link>

        {/* ── Hero ── */}
        <section className="text-center mb-12">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            Smart Batch Calculator
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-gradient-amber mb-4">
            批次換算引擎
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
            輸入製作倍數，瞬間換算所有材料用量與預估產出
          </p>
          <div className="divider-amber mt-8" />
        </section>

        {/* ── Mode Tabs ── */}
        <div className="flex justify-center gap-3 mb-10">
          {([
            { key: 'cocktail' as Mode, icon: '🍹', zh: '調酒配方', en: 'Cocktail' },
            { key: 'prep' as Mode, icon: '🧪', zh: '備料製作', en: 'Prep' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={`
                px-6 py-3 rounded-lg font-mono text-sm transition-all duration-300 border
                ${mode === tab.key
                  ? 'border-neon-amber text-neon-amber bg-neon-amber/10 shadow-neon-amber'
                  : 'border-charcoal-700 text-charcoal-500 hover:border-charcoal-600 hover:text-charcoal-400'
                }
              `}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.zh}
              <span className="ml-2 text-[10px] text-text-muted">{tab.en}</span>
            </button>
          ))}
        </div>

        {/* ── Selector ── */}
        <section className="glass-card !overflow-visible p-6 mb-6">
          <label className="block font-mono text-xs text-charcoal-500 uppercase tracking-widest mb-3">
            {mode === 'cocktail' ? '選擇調酒配方' : '選擇備料品項'}
          </label>

          {loadingList ? (
            <div className="h-12 rounded-lg bg-charcoal-800 animate-pulse" />
          ) : listError ? (
            <p className="text-red-400 font-mono text-sm">⚠ {listError}</p>
          ) : (
            <div ref={dropdownRef} className="relative">
              <input
                type="text"
                placeholder={selectedOption ? `${selectedOption.label} — ${selectedOption.sub}` : '搜尋配方名稱...'}
                value={search}
                onChange={e => { setSearch(e.target.value); setDropdownOpen(true) }}
                onFocus={() => setDropdownOpen(true)}
                className="input-neon w-full"
              />

              {/* Selected badge */}
              {selectedId && !search && !dropdownOpen && (
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <span className="text-warm text-sm">
                    {selectedOption?.label}
                    <span className="text-text-secondary ml-2 text-xs">{selectedOption?.sub}</span>
                  </span>
                </div>
              )}

              {/* Dropdown — opens upward to avoid being covered by multiplier section */}
              {dropdownOpen && (
                <ul className="absolute z-50 w-full bottom-full mb-1 max-h-64 overflow-y-auto rounded-lg border border-charcoal-700 bg-bg-secondary shadow-2xl">
                  {options.length === 0 ? (
                    <li className="px-4 py-3 text-text-muted text-sm font-mono">找不到符合的項目</li>
                  ) : options.map(o => (
                    <li
                      key={o.id}
                      onClick={() => { setSelectedId(o.id); setSearch(''); setDropdownOpen(false) }}
                      className={`
                        px-4 py-3 cursor-pointer transition-colors flex items-center justify-between
                        ${o.id === selectedId
                          ? 'bg-neon-amber/10 text-neon-amber'
                          : 'hover:bg-charcoal-800 text-text-warm'
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{o.label}</span>
                        <span className="ml-2 text-xs text-text-secondary">{o.sub}</span>
                      </div>
                      {o.tag && (
                        <span className="ml-3 shrink-0 font-mono text-[10px] px-2 py-0.5 rounded border border-charcoal-700 text-charcoal-500 uppercase">
                          {MODE_TAG_ICON(mode, o.tag)} {o.tag}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* ── Multiplier ── */}
        <section className="glass-card p-6 mb-8">
          <label className="block font-mono text-xs text-charcoal-500 uppercase tracking-widest mb-4">
            製作倍數 Multiplier
          </label>

          <div className="flex items-center justify-center gap-4 mb-5">
            <button
              onClick={() => setMult(multiplier - 1)}
              className="w-12 h-12 rounded-lg border border-charcoal-700 text-charcoal-400 hover:border-neon-amber hover:text-neon-amber transition-all text-xl font-mono"
            >
              −
            </button>
            <input
              type="number"
              aria-label="杯數"
              min={0.5}
              max={100}
              step={0.5}
              value={multiplier}
              onChange={e => setMult(parseFloat(e.target.value) || 1)}
              className="w-32 text-center font-mono text-3xl text-neon-amber bg-transparent border-b-2 border-neon-amber/40 focus:border-neon-amber outline-none py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setMult(multiplier + 1)}
              className="w-12 h-12 rounded-lg border border-charcoal-700 text-charcoal-400 hover:border-neon-amber hover:text-neon-amber transition-all text-xl font-mono"
            >
              +
            </button>
          </div>

          {/* Presets */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setMult(p)}
                className={`
                  px-4 py-1.5 rounded-full font-mono text-xs transition-all border
                  ${multiplier === p
                    ? 'border-neon-amber text-neon-amber bg-neon-amber/10'
                    : 'border-charcoal-700 text-charcoal-500 hover:border-charcoal-600 hover:text-charcoal-400'
                  }
                `}
              >
                ×{p}
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={calculate}
            disabled={loading || !selectedId}
            className="btn-neon-amber w-full py-4 text-base font-mono tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-neon-amber border-t-transparent rounded-full animate-spin" />
                換算中...
              </span>
            ) : (
              '🧮 立即換算'
            )}
          </button>

          {error && (
            <p className="mt-4 text-center text-red-400 font-mono text-sm">⚠ {error}</p>
          )}
        </section>

        {/* ── Results ── */}
        {result && (
          <div ref={resultRef} className="space-y-6 animate-fade-in">

            {/* Summary */}
            <section className="glass-card border-neon-amber-glow p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-2xl text-warm">{result.recipeNameZh || result.recipeName}</h2>
                  {result.recipeNameZh && (
                    <p className="text-text-secondary text-sm mt-1">{result.recipeName}</p>
                  )}
                </div>
                <span className="shrink-0 self-start font-mono text-sm px-4 py-1.5 rounded-full border border-neon-amber text-neon-amber bg-neon-amber/10">
                  ×{result.multiplier}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatBox label="總體積" value={`${result.totalVolume.oz} oz`} sub={`${result.totalVolume.ml} ml`} />
                <StatBox label="預估產出" value={`${result.estimatedOutput.ml} ml`} sub={`${result.estimatedOutput.servings} 杯`} />
                <StatBox label="製作方式" value={METHOD_ZH(result.estimatedOutput.method)} sub={result.estimatedOutput.method} />
                <StatBox label="稀釋係數" value={`×${result.estimatedOutput.dilutionFactor}`} sub="dilution" />
              </div>
            </section>

            {/* Ingredients Table */}
            <section className="glass-card p-0 overflow-hidden">
              <div className="px-6 pt-6 pb-3">
                <h3 className="font-mono text-xs text-neon-amber tracking-[0.2em] uppercase">材料明細</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-charcoal-700">
                      <th className="text-left px-6 py-3 font-mono text-xs text-charcoal-500 uppercase tracking-wider">材料</th>
                      <th className="text-right px-6 py-3 font-mono text-xs text-charcoal-500 uppercase tracking-wider">原始量</th>
                      <th className="text-right px-6 py-3 font-mono text-xs text-charcoal-500 uppercase tracking-wider">換算量</th>
                      <th className="text-right px-6 py-3 font-mono text-xs text-charcoal-500 uppercase tracking-wider">毫升換算</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ingredients.map((ing, i) => (
                      <tr
                        key={i}
                        className={`border-b border-charcoal-800 ${i % 2 === 0 ? 'bg-transparent' : 'bg-charcoal-900/40'}`}
                      >
                        <td className="px-6 py-3">
                          <span className="text-warm">{ing.nameZh || ing.name}</span>
                          {ing.nameZh && ing.name && (
                            <span className="ml-2 text-xs text-text-muted">{ing.name}</span>
                          )}
                        </td>
                        <td className="text-right px-6 py-3 font-mono text-text-secondary">
                          {ing.originalAmount} {ing.unit}
                        </td>
                        <td className="text-right px-6 py-3 font-mono text-neon-amber font-bold">
                          {ing.scaledAmount} {ing.unit}
                        </td>
                        <td className="text-right px-6 py-3 font-mono text-text-secondary">
                          {ing.scaledMl} ml
                        </td>
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr className="border-t-2 border-neon-amber/30 bg-neon-amber/5">
                      <td className="px-6 py-3 font-mono text-xs text-neon-amber uppercase tracking-wider font-bold">
                        Total
                      </td>
                      <td className="text-right px-6 py-3 font-mono text-text-secondary font-bold">
                        {result.totalVolume.oz} oz
                      </td>
                      <td className="text-right px-6 py-3 font-mono text-neon-amber font-bold">
                        {result.totalVolume.ml} ml
                      </td>
                      <td className="text-right px-6 py-3 font-mono text-text-secondary font-bold">
                        {result.estimatedOutput.ml} ml
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Production Notes */}
            <section className="glass-card p-6 border border-neon-cyan/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-neon-cyan/[0.02] pointer-events-none" />
              <h3 className="font-mono text-xs text-neon-cyan tracking-[0.2em] uppercase mb-4 relative">
                📋 生產備註 Production Notes
              </h3>
              {result.notes && (
                <p className="text-text-secondary leading-relaxed mb-4 relative">{result.notes}</p>
              )}
              <div className="relative flex items-start gap-3 p-4 rounded-lg bg-charcoal-900/60 border border-charcoal-700">
                <span className="text-neon-amber text-lg shrink-0">💡</span>
                <p className="text-text-muted text-sm leading-relaxed">
                  建議分批搖盪/攪拌，每次不超過 4 杯份量以維持品質。
                </p>
              </div>
            </section>
          </div>
        )}

        {/* ── Loading placeholder ── */}
        {loading && !result && (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-6">
                <div className="h-4 w-1/3 bg-charcoal-800 rounded animate-pulse mb-4" />
                <div className="h-3 w-full bg-charcoal-800 rounded animate-pulse mb-2" />
                <div className="h-3 w-2/3 bg-charcoal-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

/* ── Sub-components ──────────────────────────────────────── */
function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-4 rounded-lg bg-charcoal-900/60 border border-charcoal-800">
      <p className="font-mono text-[10px] text-charcoal-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-mono text-lg text-warm font-semibold">{value}</p>
      <p className="font-mono text-xs text-text-muted mt-0.5">{sub}</p>
    </div>
  )
}

/* ── Helpers ──────────────────────────────────────────────── */
function MODE_TAG_ICON(mode: Mode, tag: string) {
  if (mode === 'cocktail') return METHOD_ICONS[tag] ?? ''
  return ''
}

function METHOD_ZH(method: string) {
  const map: Record<string, string> = {
    shake: '搖盪法', stir: '攪拌法', build: '直調法', roll: '滾動法', throw: '拋接法',
  }
  return map[method] ?? method
}
