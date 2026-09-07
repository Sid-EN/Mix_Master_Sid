'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

/* ─── Types ─── */
interface Ingredient {
  id: number
  name: string
  volume: string
  abv: string
}

type Method = 'shake' | 'stir' | 'build' | 'none'
type Unit = 'ml' | 'oz'

const DILUTION: Record<Method, number> = {
  shake: 0.25,
  stir: 0.18,
  build: 0.10,
  none: 0,
}

const METHOD_LABELS: Record<Method, { zh: string; en: string }> = {
  shake: { zh: '搖盪', en: 'Shake' },
  stir:  { zh: '攪拌', en: 'Stir' },
  build: { zh: '直調', en: 'Build' },
  none:  { zh: '無稀釋', en: 'None' },
}

interface Preset {
  name: string
  nameEn: string
  icon: string
  method: Method
  ingredients: { name: string; volume: number; abv: number }[]
}

const PRESETS: Preset[] = [
  {
    name: '瑪格麗特', nameEn: 'Margarita', icon: '🍋', method: 'shake',
    ingredients: [
      { name: 'Tequila 龍舌蘭', volume: 50, abv: 40 },
      { name: 'Triple Sec 橙酒', volume: 25, abv: 30 },
      { name: 'Lime Juice 萊姆汁', volume: 25, abv: 0 },
    ],
  },
  {
    name: '乃乃格羅尼', nameEn: 'Negroni', icon: '🍊', method: 'stir',
    ingredients: [
      { name: 'Gin 琴酒', volume: 30, abv: 40 },
      { name: 'Campari 金巴利', volume: 30, abv: 25 },
      { name: 'Sweet Vermouth 甜苦艾酒', volume: 30, abv: 16 },
    ],
  },
  {
    name: '莫吉托', nameEn: 'Mojito', icon: '🌿', method: 'shake',
    ingredients: [
      { name: 'Rum 蘭姆酒', volume: 50, abv: 40 },
      { name: 'Lime 萊姆汁', volume: 25, abv: 0 },
      { name: 'Sugar Syrup 糖漿', volume: 20, abv: 0 },
      { name: 'Soda 蘇打水', volume: 60, abv: 0 },
    ],
  },
  {
    name: '長島冰茶', nameEn: 'Long Island', icon: '🏝️', method: 'shake',
    ingredients: [
      { name: 'Vodka 伏特加', volume: 15, abv: 40 },
      { name: 'Gin 琴酒', volume: 15, abv: 40 },
      { name: 'Rum 蘭姆酒', volume: 15, abv: 40 },
      { name: 'Tequila 龍舌蘭', volume: 15, abv: 40 },
      { name: 'Triple Sec 橙酒', volume: 15, abv: 30 },
      { name: 'Lemon 檸檬汁', volume: 25, abv: 0 },
      { name: 'Cola 可樂', volume: 60, abv: 0 },
    ],
  },
]

/* ─── Helpers ─── */
let nextId = 3

function emptyRow(): Ingredient {
  return { id: nextId++, name: '', volume: '', abv: '' }
}

function mlToOz(ml: number) { return ml / 29.5735 }
function ozToMl(oz: number) { return oz * 29.5735 }

/* ─── Gauge Component ─── */
function ABVGauge({ abv }: { abv: number }) {
  const clampedAbv = Math.min(abv, 50)
  const pct = (clampedAbv / 50) * 100

  function getColor(v: number) {
    if (v < 10) return '#22c55e'
    if (v < 20) return '#00FFFF'
    if (v < 30) return '#F5A623'
    return '#ef4444'
  }

  function getLabel(v: number) {
    if (v < 10) return { zh: '輕盈', en: 'Light' }
    if (v < 20) return { zh: '中等', en: 'Medium' }
    if (v < 30) return { zh: '強勁', en: 'Strong' }
    return { zh: '非常強烈', en: 'Very Strong' }
  }

  const color = getColor(abv)
  const label = getLabel(abv)

  return (
    <div className="w-full mt-4">
      {/* Gauge bar */}
      <div className="relative h-4 rounded-full overflow-hidden bg-bg-tertiary border border-charcoal-700">
        {/* Zone markers */}
        <div className="absolute inset-0 flex">
          <div className="h-full" style={{ width: '20%', background: 'rgba(34,197,94,0.15)' }} />
          <div className="h-full" style={{ width: '20%', background: 'rgba(0,255,255,0.10)' }} />
          <div className="h-full" style={{ width: '20%', background: 'rgba(245,166,35,0.10)' }} />
          <div className="h-full" style={{ width: '40%', background: 'rgba(239,68,68,0.10)' }} />
        </div>
        {/* Fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-1.5 font-mono text-[10px] text-charcoal-500">
        <span>0%</span>
        <span>10%</span>
        <span>20%</span>
        <span>30%</span>
        <span>50%</span>
      </div>
      {/* Strength label */}
      <div className="text-center mt-2">
        <span className="font-mono text-sm tracking-wider" style={{ color }}>
          {label.zh} {label.en}
        </span>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function ABVCalculatorPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: '', volume: '', abv: '' },
    { id: 2, name: '', volume: '', abv: '' },
  ])
  const [method, setMethod] = useState<Method>('shake')
  const [unit, setUnit] = useState<Unit>('ml')

  /* ─ Ingredient CRUD ─ */
  function updateIngredient(id: number, field: keyof Ingredient, value: string) {
    setIngredients(prev =>
      prev.map(ing => (ing.id === id ? { ...ing, [field]: value } : ing))
    )
  }

  function removeIngredient(id: number) {
    setIngredients(prev => (prev.length <= 1 ? prev : prev.filter(ing => ing.id !== id)))
  }

  function addIngredient() {
    setIngredients(prev => [...prev, emptyRow()])
  }

  function loadPreset(preset: Preset) {
    setMethod(preset.method)
    setIngredients(
      preset.ingredients.map(p => ({
        id: nextId++,
        name: p.name,
        volume: unit === 'ml' ? String(p.volume) : mlToOz(p.volume).toFixed(1),
        abv: String(p.abv),
      }))
    )
  }

  /* ─ Calculations ─ */
  const calc = useMemo(() => {
    let totalVol = 0
    let totalAlcohol = 0

    for (const ing of ingredients) {
      let vol = parseFloat(ing.volume) || 0
      const abv = parseFloat(ing.abv) || 0
      if (unit === 'oz') vol = ozToMl(vol)
      totalVol += vol
      totalAlcohol += vol * (abv / 100)
    }

    const rawAbv = totalVol > 0 ? (totalAlcohol / totalVol) * 100 : 0
    const dilutionFactor = DILUTION[method]
    const dilutedAbv = rawAbv * (1 - dilutionFactor)
    const dilutedVol = totalVol * (1 + dilutionFactor)
    const alcoholMl = totalVol > 0 ? totalAlcohol : 0
    const standardDrinks = alcoholMl / 10
    const beerEquiv = alcoholMl / (330 * 0.05)
    const wineEquiv = alcoholMl / (150 * 0.12)

    return {
      totalVol,
      rawAbv,
      dilutedAbv,
      dilutedVol,
      dilutionFactor,
      alcoholMl,
      standardDrinks,
      beerEquiv,
      wineEquiv,
    }
  }, [ingredients, method, unit])

  function displayVol(ml: number) {
    return unit === 'ml' ? `${ml.toFixed(0)} ml` : `${mlToOz(ml).toFixed(1)} oz`
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <Link href="/tools" className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-4">
          ← 工具箱 TOOLS
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl text-gradient-amber">
          ABV 計算器
        </h1>
        <p className="font-mono text-sm text-charcoal-500 tracking-wider mt-2">
          ABV CALCULATOR — 計算你的調酒酒精濃度
        </p>
      </div>

      {/* Quick Load Presets */}
      <div className="mb-8 animate-fade-in">
        <p className="font-mono text-xs text-charcoal-500 mb-3 tracking-wider">
          ⚡ 快速載入 QUICK LOAD
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.nameEn}
              onClick={() => loadPreset(p)}
              className="btn-neon-cyan font-mono text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <span>{p.icon}</span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ─── Left: Ingredients (3 cols) ─── */}
        <div className="lg:col-span-3 space-y-3 animate-fade-in">
          {/* Unit toggle + Method */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {/* Unit toggle */}
            <div className="glass-card inline-flex rounded-md overflow-hidden">
              {(['ml', 'oz'] as Unit[]).map(u => (
                <button
                  key={u}
                  onClick={() => {
                    if (u === unit) return
                    setIngredients(prev =>
                      prev.map(ing => {
                        const vol = parseFloat(ing.volume)
                        if (isNaN(vol)) return ing
                        const converted = u === 'oz' ? mlToOz(vol) : ozToMl(vol)
                        return { ...ing, volume: converted.toFixed(u === 'oz' ? 1 : 0) }
                      })
                    )
                    setUnit(u)
                  }}
                  className={`px-4 py-2 font-mono text-xs tracking-wider transition-colors ${
                    unit === u
                      ? 'bg-neon-amber text-bg-primary'
                      : 'text-charcoal-500 hover:text-neon-amber'
                  }`}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Method selector */}
            <div className="glass-card inline-flex rounded-md overflow-hidden">
              {(Object.keys(DILUTION) as Method[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-3 py-2 font-mono text-xs tracking-wider transition-colors ${
                    method === m
                      ? 'bg-neon-cyan text-bg-primary'
                      : 'text-charcoal-500 hover:text-neon-cyan'
                  }`}
                >
                  {METHOD_LABELS[m].zh}
                </button>
              ))}
            </div>

            <span className="font-mono text-[10px] text-charcoal-600">
              稀釋 {(DILUTION[method] * 100).toFixed(0)}%
            </span>
          </div>

          {/* Ingredient rows */}
          {ingredients.map((ing, idx) => (
            <div
              key={ing.id}
              className="glass-card p-3 sm:p-4 border-l-2 border-l-neon-amber/40"
            >
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                {/* Row number */}
                <span className="font-mono text-xs text-charcoal-600 w-5 shrink-0 hidden sm:block">
                  {idx + 1}.
                </span>

                {/* Name */}
                <input
                  type="text"
                  placeholder="材料名稱 Name"
                  value={ing.name}
                  onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                  className="input-neon font-mono text-sm px-3 py-2 flex-1 min-w-0"
                />

                {/* Volume */}
                <div className="relative">
                  <input
                    type="number"
                    placeholder="容量"
                    min="0"
                    step="any"
                    value={ing.volume}
                    onChange={e => updateIngredient(ing.id, 'volume', e.target.value)}
                    className="input-neon font-mono text-sm px-3 py-2 w-full sm:w-24 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-charcoal-500">
                    {unit}
                  </span>
                </div>

                {/* ABV */}
                <div className="relative">
                  <input
                    type="number"
                    placeholder="ABV"
                    min="0"
                    max="100"
                    step="any"
                    value={ing.abv}
                    onChange={e => updateIngredient(ing.id, 'abv', e.target.value)}
                    className="input-neon font-mono text-sm px-3 py-2 w-full sm:w-24 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-charcoal-500">
                    %
                  </span>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeIngredient(ing.id)}
                  className="text-charcoal-600 hover:text-red-400 transition-colors px-2 py-1 font-mono text-sm shrink-0"
                  aria-label="移除材料"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Add button */}
          <button
            onClick={addIngredient}
            className="btn-neon-amber font-mono text-xs w-full py-3 tracking-wider"
          >
            + 新增材料 ADD INGREDIENT
          </button>
        </div>

        {/* ─── Right: Results (2 cols) ─── */}
        <div className="lg:col-span-2 space-y-4 animate-fade-in">
          {/* ABV Result */}
          <div className="glass-card p-6 text-center border-t-2 border-t-neon-amber/60">
            <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-1">
              最終 ABV / FINAL ABV
            </p>
            <p className="font-display text-5xl sm:text-6xl text-neon-amber text-neon-glow-amber leading-none">
              {calc.dilutedAbv.toFixed(1)}%
            </p>
            <p className="font-mono text-xs text-charcoal-500 mt-2">
              ABV
            </p>

            {calc.dilutionFactor > 0 && (
              <p className="font-mono text-[10px] text-charcoal-600 mt-1">
                稀釋前 Before dilution: {calc.rawAbv.toFixed(1)}%
              </p>
            )}

            <ABVGauge abv={calc.dilutedAbv} />
          </div>

          {/* Volume Info */}
          <div className="glass-card p-5">
            <h2 className="font-mono text-xs text-charcoal-500 tracking-wider mb-3">
              📊 容量資訊 VOLUME
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-500">總容量 Total</span>
                <span className="text-text-warm">{displayVol(calc.totalVol)}</span>
              </div>
              {calc.dilutionFactor > 0 && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">稀釋後 After dilution</span>
                  <span className="text-text-warm">{displayVol(calc.dilutedVol)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-charcoal-500">純酒精 Pure alcohol</span>
                <span className="text-text-warm">{calc.alcoholMl.toFixed(1)} ml</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">調製法 Method</span>
                <span className="text-neon-cyan">
                  {METHOD_LABELS[method].zh} {METHOD_LABELS[method].en}
                  {calc.dilutionFactor > 0 && ` (−${(calc.dilutionFactor * 100).toFixed(0)}%)`}
                </span>
              </div>
            </div>
          </div>

          {/* Equivalence */}
          <div className="glass-card p-5">
            <h2 className="font-mono text-xs text-charcoal-500 tracking-wider mb-3">
              🍺 換算 EQUIVALENCE
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-500">標準酒精單位</span>
                <span className="text-neon-amber">{calc.standardDrinks.toFixed(1)} 份</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-charcoal-500">相當於 啤酒 (5%)</span>
                <span className="text-text-warm">{calc.beerEquiv.toFixed(1)} 杯 (330ml)</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-charcoal-500">相當於 葡萄酒 (12%)</span>
                <span className="text-text-warm">{calc.wineEquiv.toFixed(1)} 杯 (150ml)</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="font-mono text-[10px] text-charcoal-600 text-center leading-relaxed">
            ⚠️ 此計算為理論估算，實際 ABV 會因冰塊融化速度、<br />
            攪拌時間等因素而有所不同。請理性飲酒。
          </p>
        </div>
      </div>
    </main>
  )
}
