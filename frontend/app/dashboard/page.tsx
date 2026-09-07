'use client'

import { useState, useEffect, useMemo } from 'react'
import TasteStatistics from '@/components/TasteStatistics'
import OfflineSettings from '@/components/OfflineSettings'
import Link from 'next/link'
import { useProgress } from '../../components/ProgressContext'
import { useFavorites } from '../../components/FavoritesContext'
import type { FlavorPref } from '../../components/FlavorPreference'

/* ── Constants ────────────────────────────────────────────── */

const LEVEL_ICONS = ['🥄', '🧹', '🍋', '🍸', '⭐', '👑', '🏆', '💎']

const ACADEMY_SECTIONS_TOTAL = 10

const ACADEMY_SECTION_LABELS: Record<string, string> = {
  spirits: '烈酒基礎',
  techniques: '調酒技法',
  tools: '工具介紹',
  tasting: '品飲技巧',
  wine: '葡萄酒',
  sake: '清酒',
  distillation: '蒸餾原理',
  storage: '保存方法',
  sommelier: '侍酒師',
  curriculum: '課程總覽',
}

const ACHIEVEMENTS = [
  { id: 'first-taste', icon: '🥉', title: '初嚐者', desc: '嘗試第一杯調酒', check: (s: DashboardStats) => s.recipesTried >= 1 },
  { id: 'curious', icon: '🔍', title: '好奇寶寶', desc: '瀏覽 10 個配方', check: (s: DashboardStats) => s.recipesViewed >= 10 },
  { id: 'scholar', icon: '📚', title: '求知者', desc: '完成 5 個學院章節', check: (s: DashboardStats) => s.academySections >= 5 },
  { id: 'collector', icon: '⭐', title: '收藏家', desc: '收藏 5 個最愛配方', check: (s: DashboardStats) => s.favoritesCount >= 5 },
]

interface DashboardStats {
  recipesViewed: number
  recipesTried: number
  favoritesCount: number
  academySections: number
  quizzesCompleted: number
}

/* ── Radar Chart (Pure SVG) ───────────────────────────────── */

interface RadarAxis {
  label: string
  value: number
}

function RadarChart({ axes }: { axes: RadarAxis[] }) {
  const size = 260
  const cx = size / 2
  const cy = size / 2
  const radius = 100
  const rings = [0.25, 0.5, 0.75, 1.0]
  const n = axes.length
  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  function polarToXY(angle: number, r: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  const gridRings = rings.map((scale) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const angle = startAngle + i * angleStep
      return polarToXY(angle, radius * scale)
    })
    return pts.map(p => p.join(',')).join(' ')
  })

  const axisLines = Array.from({ length: n }, (_, i) => {
    const angle = startAngle + i * angleStep
    return polarToXY(angle, radius)
  })

  const dataPoints = axes.map((a, i) => {
    const angle = startAngle + i * angleStep
    const val = Math.max(0, Math.min(1, a.value))
    return polarToXY(angle, radius * val)
  })
  const dataPolygon = dataPoints.map(p => p.join(',')).join(' ')

  const labelPositions = axes.map((a, i) => {
    const angle = startAngle + i * angleStep
    const [x, y] = polarToXY(angle, radius + 22)
    return { label: a.label, x, y }
  })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px] mx-auto">
      {/* Grid rings */}
      {gridRings.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map(([x, y], i) => (
        <line
          key={i}
          x1={cx} y1={cy} x2={x} y2={y}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(245,166,35,0.25)"
        stroke="#F5A623"
        strokeWidth="2"
      />

      {/* Data dots */}
      {dataPoints.map(([x, y], i) => (
        <circle
          key={i}
          cx={x} cy={y} r="4"
          fill="#F5A623"
          filter="drop-shadow(0 0 4px rgba(245,166,35,0.6))"
        />
      ))}

      {/* Labels */}
      {labelPositions.map((lp, i) => (
        <text
          key={i}
          x={lp.x}
          y={lp.y}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-charcoal-400 text-[11px]"
          style={{ fontFamily: 'var(--font-mono, monospace)' }}
        >
          {lp.label}
        </text>
      ))}
    </svg>
  )
}

/* ── Stat Card ────────────────────────────────────────────── */

function StatCard({ icon, value, label, delay }: { icon: string; value: number; label: string; delay: number }) {
  return (
    <div
      className="glass-card p-5 text-center animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <span className="text-2xl block mb-2">{icon}</span>
      <p className="font-display text-3xl text-gradient-amber mb-1">{value}</p>
      <p className="font-mono text-xs text-charcoal-500 tracking-wider">{label}</p>
    </div>
  )
}

/* ── Star Rating (read-only) ──────────────────────────────── */

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-neon-amber' : 'text-charcoal-700'}>★</span>
      ))}
    </span>
  )
}

/* ── Main Dashboard Page ──────────────────────────────────── */

export default function DashboardPage() {
  const {
    totalXP, level, title, titleEn, progress, xpForNext,
    recipesViewedCount, recipesTriedCount, academySectionsCount, quizzesCompleted,
  } = useProgress()
  const { getAllFavorites, favoritesCount } = useFavorites()

  const [flavorPref, setFlavorPref] = useState<FlavorPref | null>(null)
  const [ownedIngredients, setOwnedIngredients] = useState<string[]>([])
  const [academySectionIds, setAcademySectionIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Read flavor preferences
    try {
      const raw = localStorage.getItem('mixmaster-flavor-pref')
      if (raw) setFlavorPref(JSON.parse(raw))
    } catch { /* ignore */ }

    // Read my-bar
    try {
      const raw = localStorage.getItem('mixmaster-my-bar')
      if (raw) setOwnedIngredients(JSON.parse(raw))
    } catch { /* ignore */ }

    // Read academy sections from progress
    try {
      const raw = localStorage.getItem('mixmaster-progress')
      if (raw) {
        const parsed = JSON.parse(raw)
        setAcademySectionIds(parsed.academySectionsRead ?? [])
      }
    } catch { /* ignore */ }

    setHydrated(true)
  }, [])

  const icon = LEVEL_ICONS[level - 1] ?? '💎'
  const pct = Math.round(progress * 100)

  const stats: DashboardStats = {
    recipesViewed: recipesViewedCount,
    recipesTried: recipesTriedCount,
    favoritesCount,
    academySections: academySectionsCount,
    quizzesCompleted,
  }

  // Radar chart axes — map actual FlavorPref keys + derive herbal from tags
  const radarAxes: RadarAxis[] = useMemo(() => {
    if (!flavorPref) return []
    const herbalScore = flavorPref.tags?.includes('Herbal') ? 0.8 : 0.15
    return [
      { label: '甜', value: flavorPref.sweet },
      { label: '酸', value: flavorPref.acid },
      { label: '苦', value: flavorPref.bitter },
      { label: '酒感', value: flavorPref.punch },
      { label: '草本', value: herbalScore },
    ]
  }, [flavorPref])

  // Top 5 favorites sorted by savedAt
  const topFavorites = useMemo(() => {
    const all = getAllFavorites()
    return Object.entries(all)
      .filter(([, data]) => data.saved)
      .sort((a, b) => new Date(b[1].savedAt).getTime() - new Date(a[1].savedAt).getTime())
      .slice(0, 5)
  }, [getAllFavorites])

  // Earliest activity date
  const memberSince = useMemo(() => {
    const all = getAllFavorites()
    const dates = Object.values(all)
      .filter(d => d.savedAt)
      .map(d => new Date(d.savedAt).getTime())
    if (dates.length === 0) return null
    return new Date(Math.min(...dates))
  }, [getAllFavorites])

  // Academy progress
  const academyProgress = useMemo(() => {
    const allSections = Object.keys(ACADEMY_SECTION_LABELS)
    return allSections.map(id => ({
      id,
      label: ACADEMY_SECTION_LABELS[id],
      completed: academySectionIds.includes(id),
    }))
  }, [academySectionIds])

  const academyCompletionPct = academySectionsCount > 0
    ? Math.round((academySectionsCount / ACADEMY_SECTIONS_TOTAL) * 100)
    : 0

  if (!hydrated) {
    return (
      <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto flex items-center justify-center">
        <span className="text-4xl animate-pulse">📊</span>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="text-center mb-12 animate-fade-in-up">
        <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-3">
          Personal Dashboard
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
          📊 個人儀表板
        </h1>
        <p className="font-mono text-xs text-charcoal-500 tracking-wider">
          你的調酒旅程一覽
        </p>
      </div>

      {/* ── Section 1: Overview Header ──────────────────── */}
      <section className="glass-card p-6 md:p-8 mb-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Level badge */}
          <div className="flex-shrink-0 text-center">
            <span className="text-5xl block mb-2">{icon}</span>
            <p className="font-display text-xl text-gradient-amber">{title}</p>
            <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">
              {titleEn} — Lv.{level}
            </p>
          </div>

          {/* XP & stats */}
          <div className="flex-1 min-w-0">
            {/* XP bar */}
            <div className="mb-4">
              <div className="flex justify-between font-mono text-xs text-charcoal-500 mb-1.5">
                <span>XP: {totalXP}</span>
                <span>
                  {xpForNext !== null ? `下一等級: ${xpForNext} XP` : '已達最高等級'}
                </span>
              </div>
              <div className="w-full h-3 bg-charcoal-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #F5A623, #FFD700)',
                    boxShadow: '0 0 8px rgba(245,166,35,0.4)',
                  }}
                />
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="font-display text-2xl text-neon-amber">{recipesViewedCount}</p>
                <p className="font-mono text-[10px] text-charcoal-500">已瀏覽配方</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-neon-amber">{recipesTriedCount}</p>
                <p className="font-mono text-[10px] text-charcoal-500">已嘗試配方</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-neon-amber">{favoritesCount}</p>
                <p className="font-mono text-[10px] text-charcoal-500">最愛配方</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-[10px] text-charcoal-500 mb-1">加入時間</p>
                <p className="font-mono text-xs text-text-secondary">
                  {memberSince
                    ? memberSince.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })
                    : '剛加入'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Cocktail Journey Stats ──────────── */}
      <section className="mb-8">
        <h2 className="font-display text-2xl text-gradient-amber mb-1">
          🍹 調酒歷程
        </h2>
        <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
          Cocktail Journey
        </p>
        <div className="divider-amber mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon="📖" value={recipesViewedCount} label="配方瀏覽" delay={0} />
          <StatCard icon="✅" value={recipesTriedCount} label="已嘗試" delay={1} />
          <StatCard icon="❤️" value={favoritesCount} label="最愛收藏" delay={2} />
          <StatCard icon="📝" value={quizzesCompleted} label="測驗完成" delay={3} />
          <StatCard icon="🎓" value={academySectionsCount} label="學院章節" delay={4} />
        </div>
      </section>

      {/* ── Two-column layout: Radar + Favorites ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* ── Section 3: Flavor Profile Radar ──────────── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="font-display text-2xl text-gradient-amber mb-1">
            🎯 風味偏好雷達圖
          </h2>
          <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
            Flavor Profile Radar
          </p>
          <div className="divider-amber mb-6" />
          <div className="glass-card p-6">
            {flavorPref ? (
              <RadarChart axes={radarAxes} />
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">🎨</span>
                <p className="text-text-secondary text-sm mb-3">尚未設定風味偏好</p>
                <p className="font-mono text-xs text-charcoal-500 mb-4">
                  設定您的口味偏好，獲得個人化推薦
                </p>
                <Link href="/" className="btn-neon-amber text-xs px-4 py-2 inline-block">
                  前往設定
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Section 3b: 口味統計 ─────────────────────── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="font-display text-2xl text-gradient-amber mb-1">
            📈 我的口味統計
          </h2>
          <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
            Taste Statistics · 依實際收藏與紀錄推導，非自填偏好
          </p>
          <div className="divider-amber mb-6" />
          <div className="glass-card p-6">
            <TasteStatistics />
          </div>
        </section>

        {/* ── Section 4: Favorite Recipes ──────────────── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display text-2xl text-gradient-amber mb-1">
            ❤️ 最愛配方
          </h2>
          <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
            Favorite Recipes
          </p>
          <div className="divider-amber mb-6" />
          <div className="glass-card p-6">
            {topFavorites.length > 0 ? (
              <ul className="space-y-3">
                {topFavorites.map(([slug, data]) => (
                  <li key={slug}>
                    <Link
                      href={`/recipes/${slug}`}
                      className="flex items-center justify-between py-2 px-3 -mx-3 rounded
                                 hover:bg-charcoal-800/50 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-text-warm text-sm group-hover:text-neon-amber transition-colors truncate">
                          {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        <p className="font-mono text-[10px] text-charcoal-500 mt-0.5">
                          {new Date(data.savedAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                      <Stars rating={data.rating} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">💫</span>
                <p className="text-text-secondary text-sm mb-3">尚無最愛配方</p>
                <p className="font-mono text-xs text-charcoal-500 mb-4">
                  探索配方並加入最愛收藏
                </p>
                <Link href="/recipes" className="btn-neon-amber text-xs px-4 py-2 inline-block">
                  探索配方
                </Link>
              </div>
            )}

            {favoritesCount > 5 && (
              <div className="mt-4 pt-3 border-t border-charcoal-700 text-center">
                <Link
                  href="/favorites"
                  className="font-mono text-xs text-neon-cyan hover:text-neon-amber transition-colors tracking-wider"
                >
                  查看全部 {favoritesCount} 個最愛 →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Two-column layout: My Bar + Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* ── Section 5: My Bar Summary ────────────────── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="font-display text-2xl text-gradient-amber mb-1">
            🍾 我的酒吧概覽
          </h2>
          <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
            My Bar Summary
          </p>
          <div className="divider-amber mb-6" />
          <div className="glass-card p-6">
            {ownedIngredients.length > 0 ? (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-4xl">🧊</span>
                  <div>
                    <p className="font-display text-3xl text-gradient-amber">{ownedIngredients.length}</p>
                    <p className="font-mono text-xs text-charcoal-500">擁有材料總數</p>
                  </div>
                </div>
                {/* Ingredient pills (show up to 8) */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {ownedIngredients.slice(0, 8).map(id => (
                    <span
                      key={id}
                      className="px-3 py-1 border border-charcoal-700 text-charcoal-400
                                 font-mono text-[10px] tracking-wider"
                    >
                      {id.replace(/-/g, ' ')}
                    </span>
                  ))}
                  {ownedIngredients.length > 8 && (
                    <span className="px-3 py-1 text-charcoal-500 font-mono text-[10px]">
                      +{ownedIngredients.length - 8} 更多
                    </span>
                  )}
                </div>
                <Link
                  href="/my-bar"
                  className="btn-neon-cyan text-xs px-4 py-2 inline-block"
                >
                  管理我的酒吧 →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">🍾</span>
                <p className="text-text-secondary text-sm mb-3">尚未加入任何材料</p>
                <p className="font-mono text-xs text-charcoal-500 mb-4">
                  新增你擁有的酒類和材料
                </p>
                <Link href="/my-bar" className="btn-neon-amber text-xs px-4 py-2 inline-block">
                  設定我的酒吧
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Section 6: Learning Progress ─────────────── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-display text-2xl text-gradient-amber mb-1">
            📖 學習進度
          </h2>
          <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
            Learning Progress
          </p>
          <div className="divider-amber mb-6" />
          <div className="glass-card p-6">
            {/* Overall bar */}
            <div className="mb-5">
              <div className="flex justify-between font-mono text-xs text-charcoal-500 mb-1.5">
                <span>整體進度</span>
                <span>{academyCompletionPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-charcoal-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${academyCompletionPct}%`,
                    background: 'linear-gradient(90deg, #22D3EE, #06B6D4)',
                    boxShadow: '0 0 6px rgba(34,211,238,0.4)',
                  }}
                />
              </div>
            </div>

            {/* Per-section progress */}
            <div className="space-y-2.5">
              {academyProgress.map(section => (
                <div key={section.id} className="flex items-center gap-3">
                  <span className={`text-sm ${section.completed ? 'text-neon-cyan' : 'text-charcoal-600'}`}>
                    {section.completed ? '✓' : '○'}
                  </span>
                  <span className={`flex-1 font-mono text-xs truncate ${
                    section.completed ? 'text-text-secondary' : 'text-charcoal-600'
                  }`}>
                    {section.label}
                  </span>
                  <div className="w-20 h-1.5 bg-charcoal-800 rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: section.completed ? '100%' : '0%',
                        background: section.completed
                          ? 'linear-gradient(90deg, #22D3EE, #06B6D4)'
                          : 'transparent',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-charcoal-700 text-center">
              <Link
                href="/academy"
                className="font-mono text-xs text-neon-cyan hover:text-neon-amber transition-colors tracking-wider"
              >
                前往學院 →
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Section 7: Achievement Preview ─────────────── */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        <h2 className="font-display text-2xl text-gradient-amber mb-1">
          🏅 成就預覽
        </h2>
        <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
          Achievements Preview
        </p>
        <div className="divider-amber mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = ach.check(stats)
            return (
              <div
                key={ach.id}
                className={`glass-card p-5 text-center transition-all duration-300 ${
                  unlocked ? 'border-neon-amber/50 shadow-neon-amber' : 'opacity-50 grayscale'
                }`}
              >
                <span className="text-3xl block mb-2">{ach.icon}</span>
                <p className={`font-display text-sm mb-1 ${
                  unlocked ? 'text-gradient-amber' : 'text-charcoal-500'
                }`}>
                  {ach.title}
                </p>
                <p className="font-mono text-[10px] text-charcoal-500">{ach.desc}</p>
                {unlocked && (
                  <p className="font-mono text-[10px] text-neon-cyan mt-2 tracking-wider">
                    ✓ 已解鎖
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

        {/* ── 離線內容 ─────────────────────────────────── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-display text-2xl text-gradient-amber mb-1">
            📥 離線閱讀
          </h2>
          <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
            Offline Access · 沒有網路時也能查配方
          </p>
          <div className="divider-amber mb-6" />
          <div className="glass-card p-6">
            <OfflineSettings />
          </div>
        </section>

      {/* ── Footer CTA ─────────────────────────────────── */}
      <div className="text-center py-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <p className="font-mono text-xs text-charcoal-500 tracking-wider mb-4">
          繼續探索，提升你的調酒等級
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/recipes" className="btn-neon-amber text-xs px-6 py-2.5">
            探索配方
          </Link>
          <Link href="/academy" className="btn-neon-cyan text-xs px-6 py-2.5">
            進入學院
          </Link>
          <Link href="/quiz" className="btn-neon-amber text-xs px-6 py-2.5">
            開始測驗
          </Link>
        </div>
      </div>
    </main>
  )
}
