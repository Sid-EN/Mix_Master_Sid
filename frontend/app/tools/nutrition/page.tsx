'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'

/* ─── Ingredient Database ─── */

interface Ingredient {
  name: string
  caloriesPer30ml: number
  sugarPer30ml: number
  carbsPer30ml: number
  abv: number
}

const INGREDIENTS: Ingredient[] = [
  // Spirits
  { name: 'Vodka (40%)', caloriesPer30ml: 64, sugarPer30ml: 0, carbsPer30ml: 0, abv: 40 },
  { name: 'Gin (40%)', caloriesPer30ml: 64, sugarPer30ml: 0, carbsPer30ml: 0, abv: 40 },
  { name: 'Light Rum (40%)', caloriesPer30ml: 64, sugarPer30ml: 0, carbsPer30ml: 0, abv: 40 },
  { name: 'Dark Rum (40%)', caloriesPer30ml: 66, sugarPer30ml: 0.5, carbsPer30ml: 0.5, abv: 40 },
  { name: 'Tequila (40%)', caloriesPer30ml: 64, sugarPer30ml: 0, carbsPer30ml: 0, abv: 40 },
  { name: 'Bourbon (40%)', caloriesPer30ml: 65, sugarPer30ml: 0, carbsPer30ml: 0, abv: 40 },
  { name: 'Scotch (40%)', caloriesPer30ml: 65, sugarPer30ml: 0, carbsPer30ml: 0, abv: 40 },
  { name: 'Cognac (40%)', caloriesPer30ml: 68, sugarPer30ml: 0.3, carbsPer30ml: 0.3, abv: 40 },
  { name: 'Triple Sec (40%)', caloriesPer30ml: 85, sugarPer30ml: 8, carbsPer30ml: 8.5, abv: 40 },
  { name: 'Kahlúa (20%)', caloriesPer30ml: 91, sugarPer30ml: 15, carbsPer30ml: 15.5, abv: 20 },
  { name: 'Baileys (17%)', caloriesPer30ml: 94, sugarPer30ml: 6, carbsPer30ml: 7, abv: 17 },
  { name: 'Amaretto (28%)', caloriesPer30ml: 82, sugarPer30ml: 9, carbsPer30ml: 9.5, abv: 28 },
  { name: 'Campari (25%)', caloriesPer30ml: 60, sugarPer30ml: 6, carbsPer30ml: 6, abv: 25 },
  { name: 'Sweet Vermouth (16%)', caloriesPer30ml: 47, sugarPer30ml: 5, carbsPer30ml: 5.5, abv: 16 },
  { name: 'Dry Vermouth (18%)', caloriesPer30ml: 34, sugarPer30ml: 1, carbsPer30ml: 1.5, abv: 18 },
  { name: 'Champagne (12%)', caloriesPer30ml: 24, sugarPer30ml: 0.5, carbsPer30ml: 0.5, abv: 12 },
  { name: 'Red Wine (13%)', caloriesPer30ml: 25, sugarPer30ml: 0.2, carbsPer30ml: 0.8, abv: 13 },
  { name: 'White Wine (12%)', caloriesPer30ml: 24, sugarPer30ml: 0.3, carbsPer30ml: 0.7, abv: 12 },
  { name: 'Beer (5%)', caloriesPer30ml: 13, sugarPer30ml: 0, carbsPer30ml: 1.1, abv: 5 },
  // Mixers
  { name: 'Simple Syrup (1:1)', caloriesPer30ml: 48, sugarPer30ml: 12, carbsPer30ml: 12, abv: 0 },
  { name: 'Rich Syrup (2:1)', caloriesPer30ml: 72, sugarPer30ml: 18, carbsPer30ml: 18, abv: 0 },
  { name: 'Honey Syrup', caloriesPer30ml: 60, sugarPer30ml: 14, carbsPer30ml: 14, abv: 0 },
  { name: 'Agave Syrup', caloriesPer30ml: 56, sugarPer30ml: 13, carbsPer30ml: 13, abv: 0 },
  { name: 'Grenadine', caloriesPer30ml: 52, sugarPer30ml: 12, carbsPer30ml: 12, abv: 0 },
  { name: 'Fresh Lime Juice', caloriesPer30ml: 8, sugarPer30ml: 0.6, carbsPer30ml: 2.6, abv: 0 },
  { name: 'Fresh Lemon Juice', caloriesPer30ml: 7, sugarPer30ml: 0.7, carbsPer30ml: 2.3, abv: 0 },
  { name: 'Orange Juice', caloriesPer30ml: 14, sugarPer30ml: 2.6, carbsPer30ml: 3.3, abv: 0 },
  { name: 'Pineapple Juice', caloriesPer30ml: 16, sugarPer30ml: 3, carbsPer30ml: 4, abv: 0 },
  { name: 'Cranberry Juice', caloriesPer30ml: 14, sugarPer30ml: 3.6, carbsPer30ml: 3.6, abv: 0 },
  { name: 'Grapefruit Juice', caloriesPer30ml: 12, sugarPer30ml: 2, carbsPer30ml: 2.5, abv: 0 },
  { name: 'Coconut Cream', caloriesPer30ml: 65, sugarPer30ml: 2, carbsPer30ml: 2, abv: 0 },
  { name: 'Heavy Cream', caloriesPer30ml: 100, sugarPer30ml: 0.9, carbsPer30ml: 0.9, abv: 0 },
  { name: 'Egg White', caloriesPer30ml: 16, sugarPer30ml: 0, carbsPer30ml: 0.2, abv: 0 },
  { name: 'Club Soda', caloriesPer30ml: 0, sugarPer30ml: 0, carbsPer30ml: 0, abv: 0 },
  { name: 'Tonic Water', caloriesPer30ml: 11, sugarPer30ml: 2.7, carbsPer30ml: 2.7, abv: 0 },
  { name: 'Ginger Beer', caloriesPer30ml: 12, sugarPer30ml: 3, carbsPer30ml: 3, abv: 0 },
  { name: 'Cola', caloriesPer30ml: 13, sugarPer30ml: 3.3, carbsPer30ml: 3.3, abv: 0 },
  { name: 'Angostura Bitters (1 dash ≈ 0.6ml)', caloriesPer30ml: 70, sugarPer30ml: 2, carbsPer30ml: 5, abv: 44 },
]

/* ─── Preset Recipes ─── */

interface PresetRecipe {
  name: string
  emoji: string
  approxCal: number
  rows: { ingredientName: string; amountMl: number }[]
}

const PRESETS: PresetRecipe[] = [
  {
    name: 'Old Fashioned',
    emoji: '🥃',
    approxCal: 150,
    rows: [
      { ingredientName: 'Bourbon (40%)', amountMl: 60 },
      { ingredientName: 'Simple Syrup (1:1)', amountMl: 7.5 },
      { ingredientName: 'Angostura Bitters (1 dash ≈ 0.6ml)', amountMl: 1.2 },
    ],
  },
  {
    name: 'Martini',
    emoji: '🍸',
    approxCal: 175,
    rows: [
      { ingredientName: 'Gin (40%)', amountMl: 60 },
      { ingredientName: 'Dry Vermouth (18%)', amountMl: 15 },
    ],
  },
  {
    name: 'Margarita',
    emoji: '🍹',
    approxCal: 280,
    rows: [
      { ingredientName: 'Tequila (40%)', amountMl: 60 },
      { ingredientName: 'Triple Sec (40%)', amountMl: 30 },
      { ingredientName: 'Fresh Lime Juice', amountMl: 30 },
      { ingredientName: 'Simple Syrup (1:1)', amountMl: 15 },
    ],
  },
  {
    name: 'Mimosa',
    emoji: '🥂',
    approxCal: 120,
    rows: [
      { ingredientName: 'Champagne (12%)', amountMl: 90 },
      { ingredientName: 'Orange Juice', amountMl: 60 },
    ],
  },
  {
    name: 'Gin & Tonic',
    emoji: '🧊',
    approxCal: 170,
    rows: [
      { ingredientName: 'Gin (40%)', amountMl: 45 },
      { ingredientName: 'Tonic Water', amountMl: 120 },
    ],
  },
  {
    name: 'Piña Colada',
    emoji: '🍍',
    approxCal: 490,
    rows: [
      { ingredientName: 'Light Rum (40%)', amountMl: 60 },
      { ingredientName: 'Coconut Cream', amountMl: 60 },
      { ingredientName: 'Pineapple Juice', amountMl: 90 },
      { ingredientName: 'Simple Syrup (1:1)', amountMl: 15 },
    ],
  },
  {
    name: 'Cosmopolitan',
    emoji: '🫐',
    approxCal: 200,
    rows: [
      { ingredientName: 'Vodka (40%)', amountMl: 45 },
      { ingredientName: 'Triple Sec (40%)', amountMl: 15 },
      { ingredientName: 'Cranberry Juice', amountMl: 30 },
      { ingredientName: 'Fresh Lime Juice', amountMl: 15 },
    ],
  },
  {
    name: 'Espresso Martini',
    emoji: '☕',
    approxCal: 250,
    rows: [
      { ingredientName: 'Vodka (40%)', amountMl: 45 },
      { ingredientName: 'Kahlúa (20%)', amountMl: 30 },
      { ingredientName: 'Simple Syrup (1:1)', amountMl: 15 },
    ],
  },
]

/* ─── Nutrition Tips ─── */

const TIPS = [
  { emoji: '🔬', text: '純烈酒的卡路里幾乎全來自酒精本身（每克酒精 = 7 大卡）' },
  { emoji: '🍔', text: '一杯 Piña Colada 的熱量相當於一個漢堡' },
  { emoji: '💡', text: '選擇蘇打水代替通寧水可以省下 80+ 大卡' },
  { emoji: '🍊', text: '鮮榨果汁比預調果汁含糖量低 50%' },
]

/* ─── Types ─── */

interface IngredientRow {
  id: number
  ingredientIndex: number
  amountMl: number
}

/* ─── Calorie Gauge Component ─── */

function CalorieGauge({ value, max }: { value: number; max: number }) {
  const pct = Math.min(value / max, 1)
  const angle = pct * 180
  const color =
    value < 150 ? 'var(--color-neon-cyan, #22d3ee)' :
    value < 300 ? 'var(--color-neon-amber, #f59e0b)' :
    '#ef4444'

  return (
    <div className="relative w-48 h-24 mx-auto mb-2">
      <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
        {/* background arc */}
        <path
          d="M 10 95 A 90 90 0 0 1 190 95"
          fill="none"
          stroke="var(--color-charcoal-700, #374151)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* value arc */}
        {value > 0 && (
          <path
            d="M 10 95 A 90 90 0 0 1 190 95"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${angle * Math.PI * 90 / 180} 999`}
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 0.4s ease, stroke 0.4s ease' }}
          />
        )}
        {/* needle */}
        <line
          x1="100"
          y1="95"
          x2={100 + 70 * Math.cos(Math.PI - (angle * Math.PI) / 180)}
          y2={95 - 70 * Math.sin(Math.PI - (angle * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: 'all 0.4s ease' }}
        />
        <circle cx="100" cy="95" r="4" fill={color} style={{ transition: 'fill 0.4s ease' }} />
        {/* scale labels */}
        <text x="8" y="100" fill="var(--color-text-muted, #6b7280)" fontSize="9" fontFamily="monospace">0</text>
        <text x="92" y="12" fill="var(--color-text-muted, #6b7280)" fontSize="9" fontFamily="monospace">250</text>
        <text x="176" y="100" fill="var(--color-text-muted, #6b7280)" fontSize="9" fontFamily="monospace">500</text>
      </svg>
    </div>
  )
}

/* ─── Stat Card Component ─── */

function StatCard({ emoji, label, value, unit, level }: {
  emoji: string
  label: string
  value: string
  unit: string
  level: 'low' | 'mid' | 'high'
}) {
  const colorClass =
    level === 'low' ? 'text-cyan-400' :
    level === 'mid' ? 'text-neon-amber' :
    'text-red-400'

  return (
    <div className="text-center">
      <div className="text-lg mb-1">{emoji}</div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-charcoal-500 mb-1">{label}</div>
      <div className={`font-display text-2xl ${colorClass}`} style={{ transition: 'color 0.3s' }}>
        {value}
      </div>
      <div className="font-mono text-[10px] text-charcoal-500">{unit}</div>
    </div>
  )
}

/* ─── Main Page ─── */

let nextRowId = 1

export default function NutritionCalculatorPage() {
  const [rows, setRows] = useState<IngredientRow[]>([
    { id: nextRowId++, ingredientIndex: 0, amountMl: 45 },
  ])

  const addRow = useCallback(() => {
    setRows(prev => [...prev, { id: nextRowId++, ingredientIndex: 0, amountMl: 30 }])
  }, [])

  const removeRow = useCallback((id: number) => {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)
  }, [])

  const updateRow = useCallback((id: number, field: 'ingredientIndex' | 'amountMl', value: number) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  const loadPreset = useCallback((preset: PresetRecipe) => {
    const newRows = preset.rows.map(r => ({
      id: nextRowId++,
      ingredientIndex: INGREDIENTS.findIndex(i => i.name === r.ingredientName),
      amountMl: r.amountMl,
    }))
    setRows(newRows)
  }, [])

  const clearAll = useCallback(() => {
    setRows([{ id: nextRowId++, ingredientIndex: 0, amountMl: 30 }])
  }, [])

  /* ── computed totals ── */
  const totals = useMemo(() => {
    let calories = 0
    let sugar = 0
    let carbs = 0
    let alcoholMl = 0
    let volume = 0

    for (const row of rows) {
      const ing = INGREDIENTS[row.ingredientIndex]
      if (!ing) continue
      const factor = row.amountMl / 30
      calories += ing.caloriesPer30ml * factor
      sugar += ing.sugarPer30ml * factor
      carbs += ing.carbsPer30ml * factor
      alcoholMl += (ing.abv / 100) * row.amountMl
      volume += row.amountMl
    }

    const abv = volume > 0 ? (alcoholMl / volume) * 100 : 0
    const bowlsOfRice = calories / 230 // ~230 cal per bowl
    const cansOfCola = calories / 140 // ~140 cal per can

    return { calories, sugar, carbs, abv, volume, bowlsOfRice, cansOfCola }
  }, [rows])

  const calLevel = totals.calories < 150 ? 'low' : totals.calories < 300 ? 'mid' : 'high'
  const sugarLevel = totals.sugar < 10 ? 'low' : totals.sugar < 25 ? 'mid' : 'high'
  const carbLevel = totals.carbs < 15 ? 'low' : totals.carbs < 30 ? 'mid' : 'high'
  const abvLevel = totals.abv < 15 ? 'low' : totals.abv < 25 ? 'mid' : 'high'

  return (
    <main className="min-h-screen px-4 sm:px-6 py-24 max-w-5xl mx-auto">
      {/* ── Back Link ── */}
      <Link
        href="/tools"
        className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-4"
      >
        ← 工具箱 TOOLS
      </Link>

      {/* ── Header ── */}
      <header className="text-center mb-12 animate-fade-in">
        <h1 className="font-display text-3xl sm:text-4xl text-gradient-amber mb-3">
          📊 營養成分計算器
        </h1>
        <p className="font-mono text-xs sm:text-sm text-charcoal-500 tracking-wider">
          Cocktail Nutrition Calculator
        </p>
        <p className="font-mono text-xs text-charcoal-500 mt-1">
          了解你的調酒含有多少卡路里、糖分與碳水化合物
        </p>
      </header>

      {/* ── Main Grid: Calculator + Results ── */}
      <div className="grid lg:grid-cols-5 gap-6 mb-12">
        {/* LEFT — Interactive Calculator */}
        <div className="lg:col-span-3">
          <div className="glass-card p-5 sm:p-6">
            <h2 className="font-display text-lg text-gradient-amber mb-4">
              🧪 互動計算器 <span className="font-mono text-[10px] text-charcoal-500 tracking-wider">INTERACTIVE CALCULATOR</span>
            </h2>

            {/* header labels */}
            <div className="hidden sm:grid grid-cols-[1fr_100px_80px_36px] gap-2 mb-2 px-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal-500">材料 Ingredient</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal-500">用量 ml</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal-500">卡路里</span>
              <span />
            </div>

            {/* ingredient rows */}
            <div className="space-y-2 mb-4">
              {rows.map(row => {
                const ing = INGREDIENTS[row.ingredientIndex]
                const rowCal = ing ? (ing.caloriesPer30ml * row.amountMl / 30) : 0
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1fr_80px_36px] sm:grid-cols-[1fr_100px_80px_36px] gap-2 items-center"
                  >
                    <select
            aria-label="選項"
                      className="input-neon text-xs !py-2"
                      value={row.ingredientIndex}
                      onChange={e => updateRow(row.id, 'ingredientIndex', Number(e.target.value))}
                    >
                      {INGREDIENTS.map((ing, idx) => (
                        <option key={idx} value={idx}>{ing.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      aria-label="數值輸入"
                      className="input-neon text-xs !py-2 text-center"
                      value={row.amountMl}
                      min={0}
                      step={5}
                      onChange={e => updateRow(row.id, 'amountMl', Math.max(0, Number(e.target.value)))}
                    />
                    <div className="hidden sm:flex items-center justify-center font-mono text-xs text-neon-amber">
                      {rowCal.toFixed(0)}
                      <span className="text-[10px] text-charcoal-500 ml-0.5">cal</span>
                    </div>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="flex items-center justify-center w-8 h-8 rounded border border-charcoal-700 text-charcoal-500 hover:border-red-400 hover:text-red-400 transition-colors text-sm"
                      aria-label="移除此材料"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>

            {/* action buttons */}
            <div className="flex gap-3">
              <button onClick={addRow} className="btn-neon-amber !px-4 !py-2 !text-xs">
                ＋ 新增材料
              </button>
              <button
                onClick={clearAll}
                className="font-mono text-xs text-charcoal-500 hover:text-red-400 transition-colors px-3 py-2"
              >
                清空全部
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Results Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg text-gradient-amber mb-4 text-center">
              📋 營養結果 <span className="font-mono text-[10px] text-charcoal-500 tracking-wider">RESULTS</span>
            </h2>

            {/* Calorie Gauge */}
            <CalorieGauge value={totals.calories} max={500} />
            <div className="text-center mb-5">
              <span
                className={`font-display text-4xl ${
                  calLevel === 'low' ? 'text-cyan-400' : calLevel === 'mid' ? 'text-neon-amber' : 'text-red-400'
                }`}
                style={{ transition: 'color 0.3s' }}
              >
                {totals.calories.toFixed(0)}
              </span>
              <span className="font-mono text-xs text-charcoal-500 ml-1">kcal</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <StatCard
                emoji="🍬"
                label="糖分 Sugar"
                value={totals.sugar.toFixed(1)}
                unit="g"
                level={sugarLevel}
              />
              <StatCard
                emoji="🌾"
                label="碳水 Carbs"
                value={totals.carbs.toFixed(1)}
                unit="g"
                level={carbLevel}
              />
              <StatCard
                emoji="🍺"
                label="預估酒精度 ABV"
                value={totals.abv.toFixed(1)}
                unit="%"
                level={abvLevel}
              />
              <StatCard
                emoji="📏"
                label="總容量 Volume"
                value={totals.volume.toFixed(0)}
                unit="ml"
                level="low"
              />
            </div>

            {/* Equivalence Comparisons */}
            {totals.calories > 0 && (
              <div className="border-t border-charcoal-700 pt-4 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-charcoal-500 mb-2">
                  相當於 Equivalent To
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-text-warm">
                  <span className="text-base">🍚</span>
                  相當於{' '}
                  <span className="text-neon-amber font-display text-sm">{totals.bowlsOfRice.toFixed(1)}</span>
                  {' '}碗白飯
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-text-warm">
                  <span className="text-base">🥤</span>
                  相當於{' '}
                  <span className="text-neon-amber font-display text-sm">{totals.cansOfCola.toFixed(1)}</span>
                  {' '}罐可樂
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: Preset Recipes ── */}
      <section className="mb-12 animate-fade-in">
        <div className="glass-card p-5 sm:p-6">
          <h2 className="font-display text-lg text-gradient-amber mb-4">
            🍹 預設配方 <span className="font-mono text-[10px] text-charcoal-500 tracking-wider">PRESET RECIPES</span>
          </h2>
          <p className="font-mono text-xs text-charcoal-500 mb-4">
            點擊快速載入經典調酒配方
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-charcoal-700 font-mono text-xs text-text-warm hover:border-neon-amber hover:text-neon-amber transition-all hover:shadow-[0_0_10px_var(--shadow-neon-amber-dim)]"
              >
                <span>{preset.emoji}</span>
                <span>{preset.name}</span>
                <span className="text-charcoal-500">~{preset.approxCal}cal</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Nutrition Tips ── */}
      <section className="animate-fade-in">
        <div className="glass-card p-5 sm:p-6">
          <h2 className="font-display text-lg text-gradient-amber mb-4">
            💡 營養小知識 <span className="font-mono text-[10px] text-charcoal-500 tracking-wider">NUTRITION TIPS</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIPS.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded border border-charcoal-700 bg-bg-tertiary/30"
              >
                <span className="text-xl shrink-0">{tip.emoji}</span>
                <p className="font-mono text-xs text-text-warm leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
