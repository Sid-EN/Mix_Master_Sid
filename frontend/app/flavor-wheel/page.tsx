'use client'

import Link from 'next/link'
import { clientUrl } from '@/lib/api'
import { useState, useEffect, useMemo } from 'react'

/* ================================================================
   Types
   ================================================================ */

interface FlavorCategory {
  id: string
  emoji: string
  nameZh: string
  nameEn: string
  color: string
  description: string
}

interface FlavorSub {
  id: string
  parentId: string
  nameZh: string
  nameEn: string
  flavorKeys: string[]
  description: string
}

/* ================================================================
   Flavor Data — 6 primary × 3 sub-categories each = 18 total
   ================================================================ */

const CATEGORIES: FlavorCategory[] = [
  { id: 'fruity', emoji: '🍊', nameZh: '果香', nameEn: 'Fruity', color: '#FF6B35', description: '新鮮水果的明亮風味，包含柑橘、熱帶與莓果' },
  { id: 'herbal', emoji: '🌿', nameZh: '草本', nameEn: 'Herbal', color: '#2ECC71', description: '草本植物的清新氣息，包含薄荷、植物與青草' },
  { id: 'sweet', emoji: '🍫', nameZh: '甜香', nameEn: 'Sweet', color: '#E67E22', description: '甜蜜溫暖的風味，包含香草、焦糖與巧克力' },
  { id: 'spicy', emoji: '🔥', nameZh: '辛香', nameEn: 'Spicy', color: '#E74C3C', description: '辛辣溫熱的風味，包含胡椒、肉桂與生薑' },
  { id: 'nutty', emoji: '🌰', nameZh: '堅果/木質', nameEn: 'Nutty/Woody', color: '#8B6914', description: '堅果與木質的深沉風味，包含杏仁、橡木與煙燻' },
  { id: 'floral', emoji: '💐', nameZh: '花香', nameEn: 'Floral', color: '#9B59B6', description: '花朵的芬芳優雅，包含玫瑰、薰衣草與接骨木花' },
]

const SUBS: FlavorSub[] = [
  // Fruity
  { id: 'citrus', parentId: 'fruity', nameZh: '柑橘', nameEn: 'Citrus', flavorKeys: ['citrus', 'lemon', 'lime', 'orange', 'grapefruit', 'yuzu'], description: '檸檬、萊姆、柳橙等柑橘類的明亮酸香' },
  { id: 'tropical', parentId: 'fruity', nameZh: '熱帶', nameEn: 'Tropical', flavorKeys: ['tropical', 'pineapple', 'mango', 'passion', 'coconut', 'banana'], description: '鳳梨、芒果、百香果的異國風情' },
  { id: 'berry', parentId: 'fruity', nameZh: '莓果', nameEn: 'Berry', flavorKeys: ['berry', 'strawberry', 'raspberry', 'blueberry', 'cranberry', 'blackberry'], description: '草莓、覆盆子、藍莓的甜蜜果香' },
  // Herbal
  { id: 'mint', parentId: 'herbal', nameZh: '薄荷', nameEn: 'Mint', flavorKeys: ['mint', 'menthol', 'eucalyptus', 'peppermint', 'spearmint'], description: '清涼薄荷的提神氣息' },
  { id: 'botanical', parentId: 'herbal', nameZh: '植物', nameEn: 'Botanical', flavorKeys: ['herbal', 'botanical', 'juniper', 'herb', 'tea', 'sage', 'thyme'], description: '杜松子、鼠尾草等植物精華' },
  { id: 'grassy', parentId: 'herbal', nameZh: '青草', nameEn: 'Grassy', flavorKeys: ['earthy', 'grassy', 'green', 'vegetal', 'cucumber', 'celery'], description: '青草與泥土的自然氣息' },
  // Sweet
  { id: 'vanilla', parentId: 'sweet', nameZh: '香草', nameEn: 'Vanilla', flavorKeys: ['vanilla', 'cream', 'custard', 'milk', 'creamy'], description: '香草的溫柔甜美' },
  { id: 'caramel', parentId: 'sweet', nameZh: '焦糖', nameEn: 'Caramel', flavorKeys: ['caramel', 'toffee', 'butterscotch', 'honey', 'maple', 'sugar'], description: '焦糖與太妃的溫暖甜香' },
  { id: 'chocolate', parentId: 'sweet', nameZh: '巧克力', nameEn: 'Chocolate', flavorKeys: ['chocolate', 'cocoa', 'cacao', 'mocha', 'coffee'], description: '可可與巧克力的豐富滋味' },
  // Spicy
  { id: 'pepper', parentId: 'spicy', nameZh: '胡椒', nameEn: 'Pepper', flavorKeys: ['pepper', 'peppery', 'peppercorn', 'chili', 'hot', 'capsicum'], description: '胡椒的辛辣刺激' },
  { id: 'cinnamon', parentId: 'spicy', nameZh: '肉桂', nameEn: 'Cinnamon', flavorKeys: ['cinnamon', 'clove', 'allspice', 'nutmeg', 'warm_spice', 'spicy'], description: '肉桂與丁香的溫暖辛香' },
  { id: 'ginger', parentId: 'spicy', nameZh: '生薑', nameEn: 'Ginger', flavorKeys: ['ginger', 'zesty', 'galangal', 'turmeric'], description: '生薑的清新辛辣' },
  // Nutty/Woody
  { id: 'almond', parentId: 'nutty', nameZh: '杏仁', nameEn: 'Almond', flavorKeys: ['nutty', 'almond', 'hazelnut', 'nut', 'walnut', 'pecan', 'pistachio'], description: '杏仁與榛果的濃郁堅果香' },
  { id: 'oak', parentId: 'nutty', nameZh: '橡木', nameEn: 'Oak', flavorKeys: ['oak', 'woody', 'wood', 'barrel', 'cedar', 'sandalwood'], description: '橡木桶的深沉木質調' },
  { id: 'smoke', parentId: 'nutty', nameZh: '煙燻', nameEn: 'Smoke', flavorKeys: ['smoky', 'smoke', 'peat', 'charred', 'tobacco', 'campfire'], description: '煙燻與泥煤的獨特風味' },
  // Floral
  { id: 'rose', parentId: 'floral', nameZh: '玫瑰', nameEn: 'Rose', flavorKeys: ['rose', 'flower', 'hibiscus', 'floral'], description: '玫瑰的浪漫芬芳' },
  { id: 'lavender', parentId: 'floral', nameZh: '薰衣草', nameEn: 'Lavender', flavorKeys: ['lavender', 'violet', 'iris', 'perfume', 'floral'], description: '薰衣草與紫羅蘭的優雅花香' },
  { id: 'elderflower', parentId: 'floral', nameZh: '接骨木花', nameEn: 'Elderflower', flavorKeys: ['elderflower', 'blossom', 'chamomile', 'jasmine', 'lychee', 'floral'], description: '接骨木花的細膩清香' },
]

/* ================================================================
   SVG Geometry Helpers
   ================================================================ */

const CX = 300
const CY = 300
const R1 = { i: 55, o: 120 }   // primary ring
const R2 = { i: 128, o: 195 }  // sub ring
const R3 = { i: 203, o: 265 }  // outer ring
const GAP = 1.5                 // gap degrees between segments
const OFF = -90                 // rotate so 0° = top

function rad(d: number) { return (d * Math.PI) / 180 }
// round to 3dp so SSR and client stringify coordinates identically (avoids hydration mismatch)
function px(n: number) { return Math.round(n * 1000) / 1000 }

function xy(r: number, deg: number): [number, number] {
  const a = rad(deg + OFF)
  return [px(CX + r * Math.cos(a)), px(CY + r * Math.sin(a))]
}

function arcPath(ri: number, ro: number, s: number, e: number): string {
  const s2 = s + GAP / 2
  const e2 = e - GAP / 2
  const lg = e2 - s2 > 180 ? 1 : 0
  const [ox1, oy1] = xy(ro, s2)
  const [ox2, oy2] = xy(ro, e2)
  const [ix1, iy1] = xy(ri, s2)
  const [ix2, iy2] = xy(ri, e2)
  return [
    `M${ox1},${oy1}`,
    `A${ro},${ro} 0 ${lg} 1 ${ox2},${oy2}`,
    `L${ix2},${iy2}`,
    `A${ri},${ri} 0 ${lg} 0 ${ix1},${iy1}`,
    'Z',
  ].join(' ')
}

function midXY(ri: number, ro: number, s: number, e: number): [number, number] {
  return xy((ri + ro) / 2, (s + e) / 2)
}

function labelRotation(s: number, e: number): number {
  const m = (s + e) / 2
  const normalized = ((m + OFF) % 360 + 360) % 360
  if (normalized > 90 && normalized < 270) return m + 180
  return m
}

/* ================================================================
   Flavor Matching
   ================================================================ */

function matchesFlavor(item: Record<string, unknown>, keys: string[]): boolean {
  const fp = item.flavorProfile as Record<string, unknown> | undefined
  const fields: string[] = [
    ...((fp?.primaryFlavors as string[]) || []),
    ...((item.flavorTags as string[]) || []),
    ...((item.aroma as string[]) || []),
    ...((item.taste as string[]) || []),
    String((fp?.description as string) || ''),
    String((item.name as string) || ''),
    String((item.nameEn as string) || ''),
    String((item.nameZh as string) || ''),
    String((item.category as string) || ''),
    String((item.subcategory as string) || ''),
  ].map(s => s.toLowerCase())

  const text = fields.join(' ')
  return keys.some(k => text.includes(k.toLowerCase()))
}

/* ================================================================
   Main Page Component
   ================================================================ */

export default function FlavorWheelPage() {
  /* ---------- state ---------- */
  const [recipes, setRecipes] = useState<Record<string, unknown>[]>([])
  const [ingredients, setIngredients] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [selPrimary, setSelPrimary] = useState<string | null>(null)
  const [selSub, setSelSub] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  /* ---------- data fetching ---------- */
  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(clientUrl('/api/v1/recipes?limit=200'))
        .then(r => r.ok ? r.json() : { items: [] })
        .catch(() => ({ items: [] })),
      fetch(clientUrl('/api/v1/ingredients?limit=500'))
        .then(r => r.ok ? r.json() : { items: [] })
        .catch(() => ({ items: [] })),
    ]).then(([rd, id]) => {
      if (cancelled) return
      setRecipes(Array.isArray(rd) ? rd : (rd.items || []))
      setIngredients(Array.isArray(id) ? id : (id.items || []))
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  /* ---------- match counts for outer ring heat-map ---------- */
  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const s of SUBS) {
      m[s.id] =
        recipes.filter(r => matchesFlavor(r, s.flavorKeys)).length +
        ingredients.filter(i => matchesFlavor(i, s.flavorKeys)).length
    }
    return m
  }, [recipes, ingredients])

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(counts)),
    [counts],
  )

  /* ---------- results for selected flavor ---------- */
  const results = useMemo(() => {
    if (!selPrimary && !selSub) return null
    let keys: string[]
    if (selSub) {
      keys = SUBS.find(s => s.id === selSub)?.flavorKeys || []
    } else {
      keys = [...new Set(
        SUBS.filter(s => s.parentId === selPrimary).flatMap(s => s.flavorKeys),
      )]
    }
    return {
      recipes: recipes.filter(r => matchesFlavor(r, keys)),
      ingredients: ingredients.filter(i => matchesFlavor(i, keys)),
    }
  }, [selPrimary, selSub, recipes, ingredients])

  const selInfo = useMemo(() => {
    if (selSub) {
      const s = SUBS.find(x => x.id === selSub)
      const p = CATEGORIES.find(x => x.id === s?.parentId)
      if (!s || !p) return null
      return { emoji: p.emoji, nameZh: s.nameZh, nameEn: s.nameEn, desc: s.description, color: p.color }
    }
    if (selPrimary) {
      const p = CATEGORIES.find(x => x.id === selPrimary)
      if (!p) return null
      return { emoji: p.emoji, nameZh: p.nameZh, nameEn: p.nameEn, desc: p.description, color: p.color }
    }
    return null
  }, [selPrimary, selSub])

  /* ---------- interaction handlers ---------- */
  const clickPrimary = (id: string) => {
    if (selPrimary === id && !selSub) {
      setSelPrimary(null)
    } else {
      setSelPrimary(id)
      setSelSub(null)
    }
  }

  const clickSub = (id: string, pid: string) => {
    if (selSub === id) {
      setSelSub(null)
      setSelPrimary(null)
    } else {
      setSelSub(id)
      setSelPrimary(pid)
    }
  }

  const reset = () => {
    setSelPrimary(null)
    setSelSub(null)
  }

  /* ---------- visual helpers ---------- */
  const segOpacity = (type: 'p' | 's', id: string, pid?: string) => {
    if (!selPrimary) return 1
    if (type === 'p') return id === selPrimary ? 1 : 0.2
    if (selSub) return id === selSub ? 1 : pid === selPrimary ? 0.45 : 0.15
    return pid === selPrimary ? 1 : 0.15
  }

  const parentColor = (pid: string) =>
    CATEGORIES.find(c => c.id === pid)?.color || '#888'

  const subAngles = (sub: FlavorSub) => {
    const pi = CATEGORIES.findIndex(c => c.id === sub.parentId)
    const si = SUBS.filter(x => x.parentId === sub.parentId).indexOf(sub)
    const start = pi * 60 + si * 20
    return { start, end: start + 20 }
  }

  const explodeXY = (startDeg: number, endDeg: number, dist: number): [number, number] => {
    const mid = (startDeg + endDeg) / 2
    return [px(dist * Math.cos(rad(mid + OFF))), px(dist * Math.sin(rad(mid + OFF)))]
  }

  /* ---------- render ---------- */
  return (
    <main className="min-h-screen px-4 md:px-8 py-12 max-w-5xl mx-auto">
      {/* Back link */}
      <Link href="/"
        className="inline-flex items-center gap-2 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-6"
      >
        ← 返回首頁 Back to Home
      </Link>

      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
          Interactive Flavor Wheel
        </p>
        <h1 className="font-display text-3xl md:text-5xl text-gradient-amber mb-3">
          🎡 互動風味輪
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          探索風味世界，點擊任一風味類別以發現相關配方與材料
        </p>
        <div className="divider-amber mt-6 mx-auto" style={{ maxWidth: 120 }} />
      </div>

      {/* Flavor Wheel SVG */}
      <div className="flex justify-center mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <svg
          viewBox="0 0 600 600"
          className="w-full"
          style={{ maxWidth: 560 }}
          role="img"
          aria-label="Interactive Flavor Wheel"
        >
          <defs>
            {CATEGORIES.map(c => (
              <filter key={`glow-${c.id}`} id={`glow-${c.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor={c.color} floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Guide circles */}
          <circle cx={CX} cy={CY} r={R3.o + 5} fill="none" stroke="rgba(245,166,35,0.06)" strokeWidth="0.5" />
          <circle cx={CX} cy={CY} r={R2.o + 1} fill="none" stroke="rgba(245,166,35,0.06)" strokeWidth="0.5" />
          <circle cx={CX} cy={CY} r={R1.o + 1} fill="none" stroke="rgba(245,166,35,0.06)" strokeWidth="0.5" />

          {/* ── OUTER RING (heat-map of match counts) ── */}
          {SUBS.map(sub => {
            const { start, end } = subAngles(sub)
            const color = parentColor(sub.parentId)
            const intensity = Math.max(0.2, counts[sub.id] / maxCount)
            const o = segOpacity('s', sub.id, sub.parentId) * intensity
            const isHov = hovered === `o-${sub.id}`
            const isSel = selSub === sub.id

            return (
              <path
                key={`o-${sub.id}`}
                d={arcPath(R3.i, R3.o, start, end)}
                fill={color}
                opacity={o}
                stroke={isSel ? '#fff' : isHov ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)'}
                strokeWidth={isSel ? 1.5 : isHov ? 1 : 0.5}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  filter: isHov ? `drop-shadow(0 0 6px ${color})` : 'none',
                }}
                onMouseEnter={() => setHovered(`o-${sub.id}`)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => clickSub(sub.id, sub.parentId)}
              />
            )
          })}

          {/* Outer ring count badges */}
          {SUBS.map(sub => {
            const { start, end } = subAngles(sub)
            const [mx, my] = midXY(R3.i, R3.o, start, end)
            const count = counts[sub.id]
            if (count === 0) return null
            return (
              <text
                key={`oc-${sub.id}`}
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize="8"
                fontFamily="'Fira Code', monospace"
                opacity={0.85}
                style={{ pointerEvents: 'none' }}
              >
                {count}
              </text>
            )
          })}

          {/* ── SUB RING ── */}
          {SUBS.map(sub => {
            const { start, end } = subAngles(sub)
            const color = parentColor(sub.parentId)
            const o = segOpacity('s', sub.id, sub.parentId)
            const isHov = hovered === `s-${sub.id}`
            const isSel = selSub === sub.id
            const [mx, my] = midXY(R2.i, R2.o, start, end)
            const rot = labelRotation(start, end)

            const explodeDist = isSel ? 4 : 0
            const [ex, ey] = explodeDist > 0 ? explodeXY(start, end, explodeDist) : [0, 0]

            return (
              <g key={`s-${sub.id}`} transform={`translate(${ex},${ey})`}>
                <path
                  d={arcPath(R2.i, R2.o, start, end)}
                  fill={color}
                  opacity={o * 0.78}
                  stroke={isSel ? '#fff' : isHov ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)'}
                  strokeWidth={isSel ? 2 : isHov ? 1.5 : 0.5}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    filter: (isHov || isSel)
                      ? `drop-shadow(0 0 8px ${color})`
                      : 'none',
                  }}
                  onMouseEnter={() => setHovered(`s-${sub.id}`)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => clickSub(sub.id, sub.parentId)}
                />
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="9"
                  fontWeight="600"
                  transform={`rotate(${rot},${mx},${my})`}
                  style={{ pointerEvents: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                >
                  {sub.nameZh}
                </text>
              </g>
            )
          })}

          {/* ── PRIMARY RING ── */}
          {CATEGORIES.map((cat, i) => {
            const start = i * 60
            const end = (i + 1) * 60
            const o = segOpacity('p', cat.id)
            const isHov = hovered === `p-${cat.id}`
            const isSel = selPrimary === cat.id
            const [mx, my] = midXY(R1.i, R1.o, start, end)

            const explodeDist = (isSel && !selSub) ? 3 : 0
            const [ex, ey] = explodeDist > 0 ? explodeXY(start, end, explodeDist) : [0, 0]

            return (
              <g key={`p-${cat.id}`} transform={`translate(${ex},${ey})`}>
                <path
                  d={arcPath(R1.i, R1.o, start, end)}
                  fill={cat.color}
                  opacity={o}
                  stroke={isSel ? '#fff' : isHov ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'}
                  strokeWidth={isSel ? 2 : isHov ? 1.5 : 0.5}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    filter: (isHov || isSel)
                      ? `drop-shadow(0 0 10px ${cat.color})`
                      : 'none',
                  }}
                  onMouseEnter={() => setHovered(`p-${cat.id}`)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => clickPrimary(cat.id)}
                />
                <text
                  x={mx}
                  y={my - 7}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="16"
                  style={{ pointerEvents: 'none' }}
                >
                  {cat.emoji}
                </text>
                <text
                  x={mx}
                  y={my + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="10"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                >
                  {cat.nameZh}
                </text>
              </g>
            )
          })}

          {/* ── CENTER CIRCLE ── */}
          <circle
            cx={CX}
            cy={CY}
            r={50}
            fill="rgba(10,10,15,0.92)"
            stroke="rgba(245,166,35,0.3)"
            strokeWidth="1"
          />
          <text
            x={CX}
            y={CY - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#F5A623"
            fontSize="13"
            fontWeight="bold"
            fontFamily="'Playfair Display', serif"
          >
            風味輪
          </text>
          <text
            x={CX}
            y={CY + 9}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(245,166,35,0.55)"
            fontSize="8"
            fontFamily="'Fira Code', monospace"
          >
            FLAVOR
          </text>

          {/* ── SVG TOOLTIP ── */}
          {hovered && (() => {
            let name = ''
            let sub = ''
            let color = '#F5A623'
            let tx = CX
            let ty = 40

            if (hovered.startsWith('p-')) {
              const c = CATEGORIES.find(x => `p-${x.id}` === hovered)
              if (c) {
                const idx = CATEGORIES.indexOf(c)
                const [mx, my] = midXY(R1.i, R1.o, idx * 60, (idx + 1) * 60)
                name = `${c.emoji} ${c.nameZh}`
                sub = c.nameEn
                color = c.color
                tx = mx
                ty = my - 40
              }
            } else {
              const prefix = hovered.startsWith('s-') ? 's-' : 'o-'
              const s = SUBS.find(x => `${prefix}${x.id}` === hovered)
              if (s) {
                const { start, end } = subAngles(s)
                const ring = prefix === 's-' ? R2 : R3
                const [mx, my] = midXY(ring.i, ring.o, start, end)
                name = s.nameZh
                sub = `${s.nameEn} · ${counts[s.id]} 項匹配`
                color = parentColor(s.parentId)
                tx = mx
                ty = my - 30
              }
            }

            if (!name) return null

            // Keep tooltip within SVG bounds
            tx = Math.max(80, Math.min(520, tx))
            ty = Math.max(30, Math.min(570, ty))

            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={tx - 72}
                  y={ty - 18}
                  width={144}
                  height={36}
                  rx={8}
                  fill="rgba(10,10,15,0.93)"
                  stroke={color}
                  strokeWidth={1}
                />
                <text
                  x={tx}
                  y={ty - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {name}
                </text>
                <text
                  x={tx}
                  y={ty + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="7.5"
                  fontFamily="'Fira Code', monospace"
                >
                  {sub}
                </text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Reset button */}
      {selPrimary && (
        <div className="text-center mb-8 animate-fade-in">
          <button
            onClick={reset}
            className="btn-neon-amber px-6 py-2 font-mono text-sm"
          >
            🔄 重置風味輪 Reset
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse-slow text-4xl mb-4">🍸</div>
          <p className="text-text-muted font-mono text-sm">載入風味資料中...</p>
        </div>
      )}

      {/* Results panel */}
      {selInfo && results && !loading && (
        <div className="glass-card p-6 md:p-8 animate-fade-in">
          {/* Selected flavor header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{selInfo.emoji}</span>
            <div>
              <h2 className="font-display text-2xl" style={{ color: selInfo.color }}>
                {selInfo.nameZh}
              </h2>
              <p className="font-mono text-xs text-text-muted">{selInfo.nameEn}</p>
            </div>
          </div>
          <p className="text-text-secondary mb-6">{selInfo.desc}</p>
          <div className="divider-amber mb-6" />

          {/* Matching Recipes */}
          <div className="mb-8">
            <h3 className="font-display text-lg text-neon-amber mb-4">
              🍹 相關配方{' '}
              <span className="font-mono text-xs text-text-muted">
                Recipes ({results.recipes.length})
              </span>
            </h3>
            {results.recipes.length === 0 ? (
              <p className="text-text-muted text-sm font-mono">暫無匹配配方 No matching recipes</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.recipes.slice(0, 12).map((r, i) => {
                  const slug = (r.slug || r.id || '') as string
                  const nameZh = (r.nameZh || r.name || '未知') as string
                  const nameEn = (r.nameEn || '') as string
                  const grade = r.grade as string | undefined
                  const method = r.method as string | undefined
                  const fp = r.flavorProfile as Record<string, unknown> | undefined
                  const flavors = ((fp?.primaryFlavors || []) as string[]).slice(0, 3)

                  return (
                    <a
                      key={`r-${i}`}
                      href={slug ? `/recipes/${slug}` : '#'}
                      className="glass-card p-4 hover:border-neon-amber-glow transition-all duration-300 group block"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display text-sm text-text-warm group-hover:text-neon-amber transition-colors">
                          {nameZh}
                        </h4>
                        {grade && (
                          <span className="grade-badge text-xs ml-2 flex-shrink-0">{grade}</span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-text-muted mb-2">{nameEn}</p>
                      {method && (
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-mono"
                          style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
                        >
                          {method}
                        </span>
                      )}
                      {flavors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {flavors.map((f, j) => (
                            <span
                              key={j}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>
            )}
            {results.recipes.length > 12 && (
              <p className="text-text-muted text-xs font-mono mt-3">
                ... 還有 {results.recipes.length - 12} 項
              </p>
            )}
          </div>

          {/* Matching Ingredients */}
          <div>
            <h3 className="font-display text-lg text-neon-cyan mb-4">
              🧪 相關材料{' '}
              <span className="font-mono text-xs text-text-muted">
                Ingredients ({results.ingredients.length})
              </span>
            </h3>
            {results.ingredients.length === 0 ? (
              <p className="text-text-muted text-sm font-mono">暫無匹配材料 No matching ingredients</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.ingredients.slice(0, 12).map((ing, i) => {
                  const nameZh = (ing.nameZh || ing.name || '未知') as string
                  const nameEn = (ing.nameEn || ing.name || '') as string
                  const colorHex = ing.colorHex as string | undefined
                  const category = ing.category as string | undefined
                  const tags = ((ing.flavorTags || []) as string[]).slice(0, 4)

                  return (
                    <div
                      key={`i-${i}`}
                      className="glass-card p-4 hover:border-neon-amber-glow transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {colorHex && (
                          <span
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                            style={{ background: colorHex }}
                          />
                        )}
                        <div>
                          <h4 className="font-display text-sm text-text-warm">{nameZh}</h4>
                          <p className="font-mono text-xs text-text-muted">{nameEn}</p>
                        </div>
                      </div>
                      {category && (
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-mono mb-2"
                          style={{ background: 'rgba(0,255,255,0.08)', color: '#00FFFF' }}
                        >
                          {category}
                        </span>
                      )}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tags.map((t, j) => (
                            <span
                              key={j}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {results.ingredients.length > 12 && (
              <p className="text-text-muted text-xs font-mono mt-3">
                ... 還有 {results.ingredients.length - 12} 項
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty prompt when nothing selected */}
      {!selPrimary && !loading && (
        <div className="text-center py-8 animate-fade-in">
          <p className="text-text-muted font-mono text-sm">
            👆 點擊風味輪上的任一區域開始探索
          </p>
          <p className="text-text-muted font-mono text-xs mt-1">
            Click any segment on the wheel to explore flavors
          </p>
        </div>
      )}
    </main>
  )
}
