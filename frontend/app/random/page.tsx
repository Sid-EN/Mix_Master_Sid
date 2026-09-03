'use client'

import { clientUrl } from '@/lib/api'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'

/* ── Types ────────────────────────────────────────────────── */
interface ApiRecipe {
  id: string
  slug: string
  nameEn: string
  nameZh: string
  method: string
  glassType: string
  difficulty: number
  balanceScore: number
  grade: string
  description: string
  descriptionZh: string
  ingredients: { slug: string; amount: number; unit: string }[]
  tags: string[]
  flavorProfile: {
    primaryFlavors: string[]
    acid: number
    sweet: number
    bitter: number
    punch: number
    description: string
  }
  glassImage: string
  garnish?: string
}

/* ── Constants ────────────────────────────────────────────── */
const SEGMENT_COLORS = [
  '#F5A623', '#00CCCC', '#9B59B6', '#2ECC71',
  '#E74C6F', '#4F6EDB', '#E67E22', '#1ABC9C',
  '#D35400', '#8E44AD', '#27AE60', '#F39C12',
]

const METHOD_ZH: Record<string, string> = {
  shake: '🧊 搖盪法', stir: '🥄 攪拌法', build: '🥃 直調法',
  roll: '🌀 滾動法', throw: '✨ 拋接法',
}

const GRADE_COLORS: Record<string, string> = {
  A: '#2ECC71', B: '#F39C12', C: '#E67E22', D: '#E74C3C',
}

const GLASS_ZH: Record<string, string> = {
  coupe: '碟形杯', 'old-fashioned': '古典杯', highball: '高球杯',
  martini: '馬丁尼杯', collins: '柯林杯', flute: '笛型杯',
  'copper-mug': '銅杯', tiki: '提基杯', nick_and_nora: 'Nick & Nora 杯',
  hurricane: '颶風杯', snifter: '白蘭地杯', rocks: '岩石杯',
  wine: '葡萄酒杯', julep: '朱利普杯', goblet: '高腳杯',
}

const DIFFICULTY_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: '1', label: '⭐ 簡單' },
  { key: '2', label: '⭐⭐ 中等' },
  { key: '3', label: '⭐⭐⭐ 進階' },
]

const SPIRIT_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'vodka', label: 'Vodka' },
  { key: 'gin', label: 'Gin' },
  { key: 'rum', label: 'Rum' },
  { key: 'tequila', label: 'Tequila' },
  { key: 'whisky', label: 'Whisky' },
  { key: 'brandy', label: 'Brandy' },
]

const STYLE_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'classic', label: '經典' },
  { key: 'tropical', label: '熱帶' },
  { key: 'refreshing', label: '清爽' },
  { key: 'strong', label: '濃烈' },
]

const FLAVOR_LABELS: Record<string, string> = {
  acid: '酸度', sweet: '甜度', bitter: '苦韻', punch: '酒感',
}

const NUM_SEGMENTS = 10

/* ── Helpers ──────────────────────────────────────────────── */
function detectBaseSpirit(ingredients: { slug: string }[]): string {
  if (!ingredients?.length) return 'other'
  const s = ingredients[0].slug.toLowerCase()
  if (s.includes('vodka')) return 'vodka'
  if (s.includes('gin')) return 'gin'
  if (s.includes('rum') || s.includes('rhum')) return 'rum'
  if (s.includes('tequila') || s.includes('mezcal')) return 'tequila'
  if (s.includes('whisk') || s.includes('bourbon') || s.includes('rye') || s.includes('scotch')) return 'whisky'
  if (s.includes('brandy') || s.includes('cognac')) return 'brandy'
  return 'other'
}

function detectStyle(tags: string[]): string[] {
  const styles: string[] = []
  if (tags.includes('classic') || tags.includes('vintage') || tags.includes('prohibition')) styles.push('classic')
  if (tags.includes('tropical') || tags.includes('tiki') || tags.includes('fruity')) styles.push('tropical')
  if (tags.includes('refreshing') || tags.includes('highball') || tags.includes('sparkling') || tags.includes('mint')) styles.push('refreshing')
  if (tags.includes('spirit-forward') || tags.includes('bitter') || tags.includes('smoky')) styles.push('strong')
  return styles
}

function mapDifficulty(d: number): number {
  if (d <= 2) return 1
  if (d <= 3) return 2
  return 3
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const s = ((startAngle - 90) * Math.PI) / 180
  const e = ((endAngle - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(s)
  const y1 = cy + r * Math.sin(s)
  const x2 = cx + r * Math.cos(e)
  const y2 = cy + r * Math.sin(e)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

/* ── Confetti ─────────────────────────────────────────────── */
function ConfettiEffect() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const angle = Math.random() * 360
      const dist = 80 + Math.random() * 180
      const x = Math.cos((angle * Math.PI) / 180) * dist
      const y = Math.sin((angle * Math.PI) / 180) * dist
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
      const size = 4 + Math.random() * 8
      const delay = Math.random() * 0.3
      const shape = Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm'
      return { x, y, color, size, delay, shape, id: i }
    }), []
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{
            left: '50%', top: '50%',
            width: p.size, height: p.size,
            backgroundColor: p.color,
            animation: `confetti-burst 1.8s ${p.delay}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            ['--tx' as string]: `${p.x}px`,
            ['--ty' as string]: `${p.y}px`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

/* ── Wheel SVG ────────────────────────────────────────────── */
function RouletteWheel({
  recipes,
  rotation,
  spinning,
}: {
  recipes: ApiRecipe[]
  rotation: number
  spinning: boolean
}) {
  const cx = 200, cy = 200, r = 185
  const n = recipes.length || 1
  const anglePerSegment = 360 / n

  return (
    <div className="relative inline-block">
      {/* Pointer */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
        style={{ filter: 'drop-shadow(0 0 8px #F5A623)' }}
      >
        <svg width="32" height="36" viewBox="0 0 32 36">
          <polygon points="16,36 0,0 32,0" fill="#F5A623" />
        </svg>
      </div>

      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: spinning
            ? '0 0 40px rgba(245,166,35,0.6), inset 0 0 40px rgba(245,166,35,0.1)'
            : '0 0 20px rgba(245,166,35,0.3), inset 0 0 20px rgba(245,166,35,0.05)',
          transition: 'box-shadow 0.3s',
        }}
      />

      <svg
        width="400" height="400" viewBox="0 0 400 400"
        className="max-w-full h-auto"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
            : 'none',
        }}
      >
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#F5A623" strokeWidth="2" opacity="0.6" />
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#333" strokeWidth="1" />

        {/* Segments */}
        {recipes.map((recipe, i) => {
          const startAngle = i * anglePerSegment
          const endAngle = startAngle + anglePerSegment
          const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180)
          const textR = r * 0.62
          const textX = cx + textR * Math.cos(midAngle)
          const textY = cy + textR * Math.sin(midAngle)
          const textRotation = startAngle + anglePerSegment / 2

          return (
            <g key={recipe.id || i}>
              <path
                d={describeArc(cx, cy, r, startAngle, endAngle)}
                fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                stroke="#0A0A0F"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <text
                x={textX}
                y={textY}
                fill="#fff"
                fontSize={n > 10 ? '9' : n > 8 ? '10' : '11'}
                fontFamily="'Noto Sans TC', sans-serif"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {recipe.nameZh.length > 6 ? recipe.nameZh.slice(0, 6) + '…' : recipe.nameZh}
              </text>
            </g>
          )
        })}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="30" fill="#1A1A25" stroke="#F5A623" strokeWidth="2" />
        <text x={cx} y={cy} fill="#F5A623" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
          🎰
        </text>
      </svg>
    </div>
  )
}

/* ── FlavorBar ────────────────────────────────────────────── */
function FlavorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-mono text-text-secondary w-10 text-right">{label}</span>
      <div className="flex-1 h-2 bg-charcoal-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-text-muted w-8">{Math.round(value * 100)}%</span>
    </div>
  )
}

/* ── Result Card ──────────────────────────────────────────── */
function ResultCard({ recipe }: { recipe: ApiRecipe }) {
  const spirit = detectBaseSpirit(recipe.ingredients)
  const fp = recipe.flavorProfile

  return (
    <div className="glass-card p-8 relative overflow-hidden animate-fade-in">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-amber via-neon-cyan to-neon-purple" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <span className="text-4xl">{recipe.glassImage || '🍸'}</span>
          <h3 className="font-display text-3xl text-text-warm mt-2">{recipe.nameZh}</h3>
          <p className="font-mono text-xs text-charcoal-500 mt-1">{recipe.nameEn}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] px-2 py-1 border border-charcoal-700 text-charcoal-500 uppercase tracking-wider">
            {METHOD_ZH[recipe.method] || recipe.method}
          </span>
          <span
            className="font-mono text-xs font-bold px-2 py-1 rounded-sm text-white"
            style={{ backgroundColor: GRADE_COLORS[recipe.grade] || '#666' }}
          >
            {recipe.grade} {recipe.balanceScore}
          </span>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="font-mono text-[11px] px-2 py-0.5 bg-charcoal-800 text-neon-amber rounded">
          {spirit !== 'other' ? spirit.toUpperCase() : '特殊基底'}
        </span>
        <span className="font-mono text-[11px] px-2 py-0.5 bg-charcoal-800 text-neon-cyan rounded">
          {'⭐'.repeat(mapDifficulty(recipe.difficulty))} 難度
        </span>
        <span className="font-mono text-[11px] px-2 py-0.5 bg-charcoal-800 text-neon-purple rounded">
          🥂 {GLASS_ZH[recipe.glassType] || recipe.glassType}
        </span>
      </div>

      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed mb-6">
        {recipe.descriptionZh || recipe.description}
      </p>

      {/* Flavor bars */}
      {fp && (
        <div className="space-y-2 mb-6">
          <p className="font-mono text-[11px] text-charcoal-500 uppercase tracking-wider mb-2">風味分析</p>
          <FlavorBar label={FLAVOR_LABELS.acid} value={fp.acid} color="#FFD700" />
          <FlavorBar label={FLAVOR_LABELS.sweet} value={fp.sweet} color="#2ECC71" />
          <FlavorBar label={FLAVOR_LABELS.bitter} value={fp.bitter} color="#9B59B6" />
          <FlavorBar label={FLAVOR_LABELS.punch} value={fp.punch} color="#E74C3C" />
        </div>
      )}

      {/* Ingredients */}
      <div className="mb-6">
        <p className="font-mono text-[11px] text-charcoal-500 uppercase tracking-wider mb-2">
          🧪 材料 ({recipe.ingredients.length} 種)
        </p>
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.map((ing, i) => (
            <span
              key={i}
              className="font-mono text-xs px-2 py-1 bg-charcoal-800 text-text-secondary rounded border border-charcoal-700"
            >
              {ing.slug.replace(/-/g, ' ')} · {ing.amount}{ing.unit}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-charcoal-800 flex-wrap gap-3">
        <Link
          href={`/recipes/${recipe.slug || recipe.id}`}
          className="btn-neon-amber text-sm px-5 py-2 inline-block"
        >
          查看完整配方 →
        </Link>
      </div>
    </div>
  )
}

/* ── History Item ─────────────────────────────────────────── */
function HistoryItem({ recipe, index }: { recipe: ApiRecipe; index: number }) {
  return (
    <Link
      href={`/recipes/${recipe.slug || recipe.id}`}
      className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-800/50 hover:bg-charcoal-700/50 transition-colors group"
    >
      <span className="font-mono text-xs text-charcoal-500 w-5">#{index + 1}</span>
      <span className="text-lg">{recipe.glassImage || '🍸'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-text-warm text-sm truncate group-hover:text-neon-amber transition-colors">
          {recipe.nameZh}
        </p>
        <p className="font-mono text-[10px] text-charcoal-500 truncate">{recipe.nameEn}</p>
      </div>
      <span
        className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm text-white shrink-0"
        style={{ backgroundColor: GRADE_COLORS[recipe.grade] || '#666' }}
      >
        {recipe.grade}
      </span>
    </Link>
  )
}

/* ── Filter Button ────────────────────────────────────────── */
function FilterButton({
  active, label, onClick,
}: {
  active: boolean; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-3 py-1.5 rounded border transition-all duration-200 ${
        active
          ? 'border-neon-amber text-neon-amber bg-neon-amber/10 shadow-[0_0_8px_rgba(245,166,35,0.3)]'
          : 'border-charcoal-700 text-charcoal-500 hover:text-text-warm hover:border-charcoal-500'
      }`}
    >
      {label}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main Page Component
   ══════════════════════════════════════════════════════════ */
export default function RandomRoulettePage() {
  /* State */
  const [allRecipes, setAllRecipes] = useState<ApiRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [spiritFilter, setSpiritFilter] = useState('all')
  const [styleFilter, setStyleFilter] = useState('all')

  const [wheelRecipes, setWheelRecipes] = useState<ApiRecipe[]>([])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<ApiRecipe | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [spinCount, setSpinCount] = useState(0)
  const [history, setHistory] = useState<ApiRecipe[]>([])

  const resultRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  /* Fetch recipes */
  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch(clientUrl('/api/v1/recipes?limit=200'))
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setAllRecipes(data.items || [])
      } catch {
        setAllRecipes([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [])

  /* Filter recipes */
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(r => {
      if (difficultyFilter !== 'all' && mapDifficulty(r.difficulty) !== Number(difficultyFilter)) return false
      if (spiritFilter !== 'all' && detectBaseSpirit(r.ingredients) !== spiritFilter) return false
      if (styleFilter !== 'all') {
        const styles = detectStyle(r.tags || [])
        if (!styles.includes(styleFilter)) return false
      }
      return true
    })
  }, [allRecipes, difficultyFilter, spiritFilter, styleFilter])

  /* Populate wheel whenever filters change */
  useEffect(() => {
    if (filteredRecipes.length === 0) {
      setWheelRecipes([])
      return
    }
    const shuffled = shuffleArray(filteredRecipes)
    setWheelRecipes(shuffled.slice(0, NUM_SEGMENTS))
  }, [filteredRecipes])

  /* Spin handler */
  const handleSpin = useCallback(() => {
    if (spinning || wheelRecipes.length === 0) return

    setSelectedRecipe(null)
    setShowConfetti(false)

    const numSegments = wheelRecipes.length
    const winnerIndex = Math.floor(Math.random() * numSegments)
    const anglePerSegment = 360 / numSegments
    // The pointer is at top (0°/360°). Segment 0 starts at 0°.
    // To land on winnerIndex, we rotate so that segment's center aligns with top.
    const segmentCenter = winnerIndex * anglePerSegment + anglePerSegment / 2
    const fullRotations = (5 + Math.floor(Math.random() * 4)) * 360
    const targetRotation = fullRotations + (360 - segmentCenter)

    setRotation(prev => prev + targetRotation)
    setSpinning(true)
    setSpinCount(c => c + 1)

    setTimeout(() => {
      setSpinning(false)
      setSelectedRecipe(wheelRecipes[winnerIndex])
      setShowConfetti(true)
      setHistory(prev => [wheelRecipes[winnerIndex], ...prev].slice(0, 5))

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)

      setTimeout(() => setShowConfetti(false), 2500)
    }, 3600)
  }, [spinning, wheelRecipes])

  /* Respin */
  const handleRespin = useCallback(() => {
    if (filteredRecipes.length === 0) return
    const shuffled = shuffleArray(filteredRecipes)
    setWheelRecipes(shuffled.slice(0, NUM_SEGMENTS))
    setTimeout(() => handleSpin(), 100)
  }, [filteredRecipes, handleSpin])

  /* ── Render ────────────────────────────────────────────── */
  return (
    <>
      {/* Inline keyframes */}
      <style jsx global>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(0) rotate(0deg);
            opacity: 1;
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.3)) scale(1.2) rotate(120deg);
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0.3) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(245,166,35,0.4); }
          50%      { box-shadow: 0 0 28px rgba(245,166,35,0.8); }
        }
        .btn-spin-ready {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes float-up {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-up {
          animation: float-up 0.3s ease-out forwards;
        }
      `}</style>

      <main className="min-h-screen px-4 sm:px-6 py-12 max-w-6xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors inline-flex items-center gap-1"
        >
          ← 返回首頁
        </Link>

        {/* Header */}
        <div className="mt-8 mb-10">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            RECIPE ROULETTE
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
            🎲 隨機配方轉盤
          </h1>
          <p className="text-text-secondary text-lg">
            不知道喝什麼？讓命運來決定！
          </p>
          <div className="divider-amber mt-6" />
        </div>

        {/* Filters */}
        <section className="mb-10 space-y-5">
          {/* Difficulty */}
          <div>
            <p className="font-mono text-[11px] text-charcoal-500 uppercase tracking-wider mb-2">
              難度篩選
            </p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map(o => (
                <FilterButton
                  key={o.key}
                  label={o.label}
                  active={difficultyFilter === o.key}
                  onClick={() => setDifficultyFilter(o.key)}
                />
              ))}
            </div>
          </div>
          {/* Spirit */}
          <div>
            <p className="font-mono text-[11px] text-charcoal-500 uppercase tracking-wider mb-2">
              基酒篩選
            </p>
            <div className="flex flex-wrap gap-2">
              {SPIRIT_OPTIONS.map(o => (
                <FilterButton
                  key={o.key}
                  label={o.label}
                  active={spiritFilter === o.key}
                  onClick={() => setSpiritFilter(o.key)}
                />
              ))}
            </div>
          </div>
          {/* Style */}
          <div>
            <p className="font-mono text-[11px] text-charcoal-500 uppercase tracking-wider mb-2">
              風格篩選
            </p>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map(o => (
                <FilterButton
                  key={o.key}
                  label={o.label}
                  active={styleFilter === o.key}
                  onClick={() => setStyleFilter(o.key)}
                />
              ))}
            </div>
          </div>

          {/* Recipe count */}
          <p className="font-mono text-xs text-charcoal-500">
            符合條件的配方：<span className="text-neon-cyan">{filteredRecipes.length}</span> 杯
          </p>
        </section>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-2 border-neon-amber border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-xs text-charcoal-500 mt-4">載入配方資料中...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-4">🍸</p>
            <p className="text-text-warm text-lg mb-2">沒有符合條件的配方</p>
            <p className="text-text-secondary text-sm">試試調整篩選條件吧！</p>
          </div>
        )}

        {/* Wheel Section */}
        {!loading && wheelRecipes.length > 0 && (
          <section className="flex flex-col items-center mb-12">
            {/* Wheel */}
            <div ref={wheelRef} className="relative mb-8" style={{ width: 400, maxWidth: '90vw' }}>
              <RouletteWheel
                recipes={wheelRecipes}
                rotation={rotation}
                spinning={spinning}
              />
              {showConfetti && <ConfettiEffect />}
            </div>

            {/* Spin button */}
            <button
              onClick={selectedRecipe ? handleRespin : handleSpin}
              disabled={spinning}
              className={`
                btn-neon-amber text-lg px-8 py-3 font-display tracking-wide
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-300
                ${!spinning && wheelRecipes.length > 0 ? 'btn-spin-ready' : ''}
              `}
            >
              {spinning ? '⏳ 命運轉動中...' : selectedRecipe ? '🔄 再轉一次' : '🎰 轉動命運之輪'}
            </button>

            {/* Sound hint */}
            {spinning && (
              <p className="font-mono text-xs text-charcoal-500 mt-3 animate-pulse">
                🔊 想像轉盤發出的 tick-tick-tick 聲...
              </p>
            )}

            {/* Spin counter */}
            {spinCount > 0 && (
              <p className="font-mono text-xs text-charcoal-500 mt-3">
                你已轉了 <span className="text-neon-amber">{spinCount}</span> 次命運之輪
              </p>
            )}
          </section>
        )}

        {/* Result + History Grid */}
        <div ref={resultRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Result card */}
          <div className="lg:col-span-2">
            {selectedRecipe && !spinning && (
              <ResultCard recipe={selectedRecipe} />
            )}
          </div>

          {/* History sidebar */}
          <div className="lg:col-span-1">
            {history.length > 0 && (
              <div className="glass-card p-5">
                <p className="font-mono text-[11px] text-charcoal-500 uppercase tracking-wider mb-4">
                  🕰️ 歷史紀錄（最近 5 杯）
                </p>
                <div className="space-y-2">
                  {history.map((r, i) => (
                    <HistoryItem key={`${r.id}-${i}`} recipe={r} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 mb-4 text-center">
          <p className="font-mono text-[11px] text-charcoal-500 tracking-wider">
            MIXMASTER RECIPE ROULETTE · PHASE 1
          </p>
        </div>
      </main>
    </>
  )
}
