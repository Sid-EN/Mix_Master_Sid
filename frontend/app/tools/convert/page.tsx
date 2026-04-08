'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = 'volume' | 'temperature' | 'weight' | 'alcohol'

interface UnitDef {
  key: string
  label: string
  labelEn: string
  factor: number // relative to base unit (ml for volume, g for weight)
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; labelEn: string; icon: string }[] = [
  { key: 'volume', label: '容量', labelEn: 'Volume', icon: '🥃' },
  { key: 'temperature', label: '溫度', labelEn: 'Temperature', icon: '🌡️' },
  { key: 'weight', label: '重量', labelEn: 'Weight', icon: '⚖️' },
  { key: 'alcohol', label: '酒精', labelEn: 'Alcohol', icon: '🍷' },
]

const VOLUME_UNITS: UnitDef[] = [
  { key: 'ml', label: 'ml 毫升', labelEn: 'Milliliter', factor: 1 },
  { key: 'cl', label: 'cl 厘升', labelEn: 'Centiliter', factor: 10 },
  { key: 'oz', label: 'oz 液量盎司', labelEn: 'Fluid Ounce', factor: 29.5735 },
  { key: 'dash', label: 'dash 少許', labelEn: 'Dash', factor: 0.9 },
  { key: 'barspoon', label: 'barspoon 吧匙', labelEn: 'Barspoon', factor: 5 },
  { key: 'tsp', label: 'tsp 茶匙', labelEn: 'Teaspoon', factor: 5 },
  { key: 'tbsp', label: 'tbsp 湯匙', labelEn: 'Tablespoon', factor: 15 },
  { key: 'cup', label: 'cup 杯', labelEn: 'Cup', factor: 240 },
  { key: 'jigger-s', label: 'jigger 小量杯', labelEn: 'Jigger (small)', factor: 30 },
  { key: 'jigger-l', label: 'jigger 大量杯', labelEn: 'Jigger (large)', factor: 45 },
  { key: 'pint', label: 'pint 品脫', labelEn: 'Pint', factor: 473 },
  { key: 'liter', label: 'L 升', labelEn: 'Liter', factor: 1000 },
]

const WEIGHT_UNITS: UnitDef[] = [
  { key: 'g', label: 'g 克', labelEn: 'Gram', factor: 1 },
  { key: 'kg', label: 'kg 公斤', labelEn: 'Kilogram', factor: 1000 },
  { key: 'oz-w', label: 'oz 盎司', labelEn: 'Ounce', factor: 28.35 },
  { key: 'lb', label: 'lb 磅', labelEn: 'Pound', factor: 453.6 },
]

const WINE_TEMPS: { label: string; labelEn: string; tempC: number }[] = [
  { label: '香檳', labelEn: 'Champagne', tempC: 6 },
  { label: '甜白酒', labelEn: 'Sweet White', tempC: 8 },
  { label: '白酒', labelEn: 'White Wine', tempC: 10 },
  { label: '粉紅酒', labelEn: 'Rosé', tempC: 12 },
  { label: '輕紅酒', labelEn: 'Light Red', tempC: 14 },
  { label: '紅酒', labelEn: 'Full Red', tempC: 18 },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n === 0) return '0'
  if (Math.abs(n) >= 1000) return n.toFixed(1)
  if (Math.abs(n) >= 100) return n.toFixed(2)
  if (Math.abs(n) >= 1) return n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}

function cToF(c: number): number {
  return c * 9 / 5 + 32
}

function fToC(f: number): number {
  return (f - 32) * 5 / 9
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function VolumeConverter() {
  const [value, setValue] = useState<string>('30')
  const [sourceUnit, setSourceUnit] = useState<string>('ml')

  const results = useMemo(() => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return null
    const source = VOLUME_UNITS.find(u => u.key === sourceUnit)
    if (!source) return null
    const ml = num * source.factor
    return VOLUME_UNITS.filter(u => u.key !== sourceUnit).map(u => ({
      ...u,
      converted: ml / u.factor,
    }))
  }, [value, sourceUnit])

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="glass-card p-5">
        <label className="block font-mono text-xs text-charcoal-500 tracking-wider mb-3">
          輸入數值 INPUT VALUE
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="input-neon flex-1 text-2xl font-display text-center"
            placeholder="0"
          />
          <select
            value={sourceUnit}
            onChange={e => setSourceUnit(e.target.value)}
            className="input-neon w-44 font-mono text-sm"
          >
            {VOLUME_UNITS.map(u => (
              <option key={u.key} value={u.key}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {results && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {results.map(r => (
            <div key={r.key} className="glass-card p-4 text-center group hover:border-neon-amber/30 transition-colors">
              <p className="text-xl sm:text-2xl font-display text-neon-amber" style={{ textShadow: '0 0 8px rgba(245,166,35,0.3)' }}>
                {formatNumber(r.converted)}
              </p>
              <p className="font-mono text-xs text-charcoal-400 mt-1">{r.label}</p>
              <p className="font-mono text-[10px] text-charcoal-600">{r.labelEn}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Reference */}
      <div className="glass-card p-5">
        <h3 className="font-display text-sm text-text-warm mb-3">📋 常用換算 Quick Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs text-charcoal-400">
          <p>1 oz = 29.5735 ml</p>
          <p>1 dash = 0.9 ml</p>
          <p>1 barspoon = 5 ml = 1 tsp</p>
          <p>1 tbsp = 15 ml = 3 tsp</p>
          <p>1 jigger (小) = 30 ml = 1 oz</p>
          <p>1 jigger (大) = 45 ml = 1.5 oz</p>
          <p>1 cup = 240 ml ≈ 8 oz</p>
          <p>1 pint = 473 ml ≈ 16 oz</p>
        </div>
      </div>
    </div>
  )
}

function TemperatureConverter() {
  const [celsius, setCelsius] = useState<string>('18')
  const [fahrenheit, setFahrenheit] = useState<string>(cToF(18).toFixed(1))

  function handleCelsius(val: string) {
    setCelsius(val)
    const n = parseFloat(val)
    if (!isNaN(n)) setFahrenheit(cToF(n).toFixed(1))
    else setFahrenheit('')
  }

  function handleFahrenheit(val: string) {
    setFahrenheit(val)
    const n = parseFloat(val)
    if (!isNaN(n)) setCelsius(fToC(n).toFixed(1))
    else setCelsius('')
  }

  function applyPreset(tempC: number) {
    setCelsius(tempC.toString())
    setFahrenheit(cToF(tempC).toFixed(1))
  }

  return (
    <div className="space-y-6">
      {/* Input Pair */}
      <div className="glass-card p-5">
        <label className="block font-mono text-xs text-charcoal-500 tracking-wider mb-3">
          即時轉換 LIVE CONVERSION
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <input
              type="number"
              step="any"
              value={celsius}
              onChange={e => handleCelsius(e.target.value)}
              className="input-neon w-full text-2xl font-display text-center"
              placeholder="0"
            />
            <p className="text-center font-mono text-xs text-charcoal-500 mt-1">°C 攝氏</p>
          </div>
          <span className="font-display text-xl text-neon-amber">⇄</span>
          <div className="flex-1 w-full">
            <input
              type="number"
              step="any"
              value={fahrenheit}
              onChange={e => handleFahrenheit(e.target.value)}
              className="input-neon w-full text-2xl font-display text-center"
              placeholder="0"
            />
            <p className="text-center font-mono text-xs text-charcoal-500 mt-1">°F 華氏</p>
          </div>
        </div>
      </div>

      {/* Wine Presets */}
      <div className="glass-card p-5">
        <h3 className="font-display text-sm text-text-warm mb-3">🍷 葡萄酒適飲溫度 Serving Temperatures</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WINE_TEMPS.map(w => (
            <button
              key={w.labelEn}
              onClick={() => applyPreset(w.tempC)}
              className="glass-card p-3 text-center hover:border-neon-cyan/50 transition-colors cursor-pointer group"
            >
              <p className="text-lg font-display text-neon-amber" style={{ textShadow: '0 0 8px rgba(245,166,35,0.3)' }}>
                {w.tempC}°C
              </p>
              <p className="font-mono text-[10px] text-charcoal-500">{cToF(w.tempC).toFixed(0)}°F</p>
              <p className="font-mono text-xs text-charcoal-400 mt-1">{w.label}</p>
              <p className="font-mono text-[10px] text-charcoal-600">{w.labelEn}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="glass-card p-5">
        <h3 className="font-display text-sm text-text-warm mb-3">📋 公式 Formula</h3>
        <div className="font-mono text-xs text-charcoal-400 space-y-1">
          <p>°F = °C × 9/5 + 32</p>
          <p>°C = (°F − 32) × 5/9</p>
        </div>
      </div>
    </div>
  )
}

function WeightConverter() {
  const [value, setValue] = useState<string>('100')
  const [sourceUnit, setSourceUnit] = useState<string>('g')

  const results = useMemo(() => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return null
    const source = WEIGHT_UNITS.find(u => u.key === sourceUnit)
    if (!source) return null
    const grams = num * source.factor
    return WEIGHT_UNITS.filter(u => u.key !== sourceUnit).map(u => ({
      ...u,
      converted: grams / u.factor,
    }))
  }, [value, sourceUnit])

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="glass-card p-5">
        <label className="block font-mono text-xs text-charcoal-500 tracking-wider mb-3">
          輸入數值 INPUT VALUE
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="input-neon flex-1 text-2xl font-display text-center"
            placeholder="0"
          />
          <select
            value={sourceUnit}
            onChange={e => setSourceUnit(e.target.value)}
            className="input-neon w-36 font-mono text-sm"
          >
            {WEIGHT_UNITS.map(u => (
              <option key={u.key} value={u.key}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {results?.map(r => (
          <div key={r.key} className="glass-card p-4 text-center hover:border-neon-amber/30 transition-colors">
            <p className="text-2xl font-display text-neon-amber" style={{ textShadow: '0 0 8px rgba(245,166,35,0.3)' }}>
              {formatNumber(r.converted)}
            </p>
            <p className="font-mono text-xs text-charcoal-400 mt-1">{r.label}</p>
            <p className="font-mono text-[10px] text-charcoal-600">{r.labelEn}</p>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div className="glass-card p-5">
        <h3 className="font-display text-sm text-text-warm mb-3">📋 常用換算 Quick Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs text-charcoal-400">
          <p>1 oz = 28.35 g</p>
          <p>1 lb = 453.6 g ≈ 16 oz</p>
          <p>1 kg = 1000 g ≈ 2.2 lb</p>
          <p>1 tsp 糖 sugar ≈ 4 g</p>
        </div>
      </div>
    </div>
  )
}

function AlcoholConverter() {
  const [abv, setAbv] = useState<string>('40')

  const usProof = useMemo(() => {
    const n = parseFloat(abv)
    return isNaN(n) ? null : n * 2
  }, [abv])

  const ukProof = useMemo(() => {
    const n = parseFloat(abv)
    return isNaN(n) ? null : n * 1.75
  }, [abv])

  // Standard drink calculator
  const [drinkMl, setDrinkMl] = useState<string>('45')
  const [drinkAbv, setDrinkAbv] = useState<string>('40')

  const standardDrinks = useMemo(() => {
    const ml = parseFloat(drinkMl)
    const pct = parseFloat(drinkAbv)
    if (isNaN(ml) || isNaN(pct) || ml <= 0 || pct <= 0) return null
    // 1 standard drink = 10g pure alcohol; alcohol density ≈ 0.789 g/ml
    const pureAlcoholMl = ml * (pct / 100)
    const pureAlcoholG = pureAlcoholMl * 0.789
    return {
      grams: pureAlcoholG,
      drinks: pureAlcoholG / 10,
    }
  }, [drinkMl, drinkAbv])

  return (
    <div className="space-y-6">
      {/* ABV ↔ Proof */}
      <div className="glass-card p-5">
        <label className="block font-mono text-xs text-charcoal-500 tracking-wider mb-3">
          酒精濃度換算 ABV / PROOF CONVERSION
        </label>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1 w-full">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={abv}
              onChange={e => setAbv(e.target.value)}
              className="input-neon w-full text-2xl font-display text-center"
              placeholder="0"
            />
            <p className="text-center font-mono text-xs text-charcoal-500 mt-1">ABV %</p>
          </div>
          <div className="flex sm:flex-col items-center gap-3 self-center">
            <span className="font-display text-xl text-neon-amber">⇄</span>
          </div>
          <div className="flex-1 w-full grid grid-cols-2 gap-3">
            <div className="glass-card p-3 text-center">
              <p className="text-xl font-display text-neon-amber" style={{ textShadow: '0 0 8px rgba(245,166,35,0.3)' }}>
                {usProof !== null ? formatNumber(usProof) : '—'}
              </p>
              <p className="font-mono text-xs text-charcoal-400 mt-1">US Proof</p>
              <p className="font-mono text-[10px] text-charcoal-600">美制酒度</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-xl font-display text-neon-amber" style={{ textShadow: '0 0 8px rgba(245,166,35,0.3)' }}>
                {ukProof !== null ? formatNumber(ukProof) : '—'}
              </p>
              <p className="font-mono text-xs text-charcoal-400 mt-1">UK Proof</p>
              <p className="font-mono text-[10px] text-charcoal-600">英制酒度</p>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Drink Calculator */}
      <div className="glass-card p-5">
        <h3 className="font-display text-sm text-text-warm mb-3">🍺 標準酒精單位計算 Standard Drink Calculator</h3>
        <p className="font-mono text-[10px] text-charcoal-600 mb-4">
          1 標準杯 = 10g 純酒精 | 1 standard drink = 10g pure alcohol
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-mono text-xs text-charcoal-500 mb-1">容量 Volume (ml)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={drinkMl}
              onChange={e => setDrinkMl(e.target.value)}
              className="input-neon w-full text-lg font-display text-center"
              placeholder="45"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-charcoal-500 mb-1">酒精濃度 ABV %</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={drinkAbv}
              onChange={e => setDrinkAbv(e.target.value)}
              className="input-neon w-full text-lg font-display text-center"
              placeholder="40"
            />
          </div>
        </div>
        {standardDrinks && (
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-3 text-center">
              <p className="text-xl font-display text-neon-amber" style={{ textShadow: '0 0 8px rgba(245,166,35,0.3)' }}>
                {standardDrinks.grams.toFixed(1)}g
              </p>
              <p className="font-mono text-xs text-charcoal-400 mt-1">純酒精</p>
              <p className="font-mono text-[10px] text-charcoal-600">Pure Alcohol</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-xl font-display text-neon-amber" style={{ textShadow: '0 0 8px rgba(245,166,35,0.3)' }}>
                {standardDrinks.drinks.toFixed(2)}
              </p>
              <p className="font-mono text-xs text-charcoal-400 mt-1">標準杯</p>
              <p className="font-mono text-[10px] text-charcoal-600">Standard Drinks</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="glass-card p-5">
        <h3 className="font-display text-sm text-text-warm mb-3">📋 常用參考 Quick Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs text-charcoal-400">
          <p>US Proof = ABV% × 2</p>
          <p>UK Proof = ABV% × 1.75</p>
          <p>啤酒 Beer ≈ 5% ABV</p>
          <p>葡萄酒 Wine ≈ 12–15% ABV</p>
          <p>烈酒 Spirits ≈ 40% ABV</p>
          <p>利口酒 Liqueur ≈ 15–30% ABV</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>('volume')

  return (
    <main className="min-h-screen px-4 sm:px-6 py-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <Link
          href="/tools"
          className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-4"
        >
          ← 工具箱 TOOLS
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl text-gradient-amber">
          📐 單位換算器
        </h1>
        <p className="font-mono text-sm text-charcoal-500 tracking-wider mt-2">
          UNIT CONVERTER — 調酒常用單位快速換算
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={
              cat.key === category
                ? 'btn-neon-amber px-4 py-2 font-mono text-xs tracking-wider'
                : 'btn-neon-cyan px-4 py-2 font-mono text-xs tracking-wider opacity-60 hover:opacity-100'
            }
          >
            {cat.icon} {cat.label} {cat.labelEn}
          </button>
        ))}
      </div>

      {/* Active Converter */}
      <div className="animate-fade-in">
        {category === 'volume' && <VolumeConverter />}
        {category === 'temperature' && <TemperatureConverter />}
        {category === 'weight' && <WeightConverter />}
        {category === 'alcohol' && <AlcoholConverter />}
      </div>
    </main>
  )
}
