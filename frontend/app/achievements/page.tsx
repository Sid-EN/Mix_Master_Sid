'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ACHIEVEMENTS,
  TIER_COLORS,
  TIER_LABELS,
  CATEGORY_META,
  loadAchievementStore,
  gatherUserStats,
  type Achievement,
  type AchievementCategory,
  type UnlockedAchievement,
  type UserStats,
} from '../../lib/achievements'

type FilterTab = 'all' | AchievementCategory
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'exploration', label: '🗺️ 探索' },
  { key: 'creation', label: '🍸 創作' },
  { key: 'knowledge', label: '📚 知識' },
  { key: 'collection', label: '⭐ 收藏' },
  { key: 'special', label: '🌟 特殊' },
]

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [unlockedMap, setUnlockedMap] = useState<Record<string, UnlockedAchievement>>({})
  const [stats, setStats] = useState<UserStats | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const store = loadAchievementStore()
    const s = gatherUserStats(store)
    setStats(s)
    const map: Record<string, UnlockedAchievement> = {}
    for (const u of store.unlockedAchievements) {
      map[u.id] = u
    }
    setUnlockedMap(map)
    setHydrated(true)
  }, [])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return ACHIEVEMENTS
    return ACHIEVEMENTS.filter(a => a.category === activeTab)
  }, [activeTab])

  const totalUnlocked = Object.keys(unlockedMap).length
  const totalAchievements = ACHIEVEMENTS.length

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-bg-primary px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-text-warm text-center mb-8">
            🏅 成就徽章
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-5 h-40 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/dashboard"
            className="inline-block text-sm text-text-muted hover:text-neon-amber transition-colors mb-4"
          >
            ← 返回儀表板
          </Link>
          <h1 className="text-3xl font-display font-bold text-text-warm mb-3">
            🏅 成就徽章
          </h1>
          <p className="text-lg text-text-secondary">
            已解鎖{' '}
            <span className="text-neon-amber font-bold">{totalUnlocked}</span>
            {' / '}
            <span className="text-text-warm font-bold">{totalAchievements}</span>
            {' 個成就'}
          </p>
          {/* Overall progress bar */}
          <div className="mt-3 max-w-xs mx-auto">
            <div className="h-2 rounded-full bg-charcoal-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-neon-amber transition-all duration-500"
                style={{ width: `${totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-neon-amber text-charcoal-900 shadow-neon-amber'
                  : 'glass-card text-text-secondary hover:text-text-warm hover:border-neon-amber-dim'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-4xl mb-4">🏆</p>
            <p>此分類目前沒有成就</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedMap[achievement.id]}
                stats={stats}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

/* ── Achievement Card ──────────────────────────────────── */

function AchievementCard({
  achievement,
  unlocked,
  stats,
}: {
  achievement: Achievement
  unlocked?: UnlockedAchievement
  stats: UserStats | null
}) {
  const tierColor = TIER_COLORS[achievement.tier]
  const tierLabel = TIER_LABELS[achievement.tier]
  const catMeta = CATEGORY_META[achievement.category]
  const isUnlocked = !!unlocked

  const progress = stats && achievement.progress ? achievement.progress(stats) : null
  const progressPct = progress && progress.target > 0
    ? Math.min((progress.current / progress.target) * 100, 100)
    : 0

  return (
    <div
      className={`glass-card p-5 transition-all duration-300 ${
        isUnlocked
          ? 'hover:scale-[1.02]'
          : 'opacity-50 grayscale hover:opacity-70 hover:grayscale-[50%]'
      }`}
      style={
        isUnlocked
          ? {
              borderColor: tierColor,
              boxShadow: `0 0 10px ${tierColor}33, 0 0 20px ${tierColor}1a`,
            }
          : undefined
      }
    >
      {/* Tier badge */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{achievement.icon}</span>
        <span
          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm"
          style={{
            backgroundColor: `${tierColor}22`,
            color: tierColor,
            border: `1px solid ${tierColor}44`,
          }}
        >
          {tierLabel}
        </span>
      </div>

      {/* Name & description */}
      <h3 className="text-base font-bold text-text-warm mb-0.5">
        {achievement.nameZh}
      </h3>
      <p className="text-xs text-text-muted mb-1">
        {achievement.nameEn}
      </p>
      <p className="text-sm text-text-secondary mb-3">
        {achievement.description}
      </p>

      {/* Category tag */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-text-muted">
          {catMeta.icon} {catMeta.label}
        </span>
      </div>

      {/* Progress / Unlock date */}
      {isUnlocked ? (
        <div className="flex items-center gap-1.5 text-xs text-neon-amber">
          <span>✅</span>
          <span>
            {new Date(unlocked.unlockedAt).toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
            {' 解鎖'}
          </span>
        </div>
      ) : progress ? (
        <div>
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>進度</span>
            <span>{progress.current} / {progress.target}</span>
          </div>
          <div className="h-1.5 rounded-full bg-charcoal-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor: tierColor,
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="text-xs text-text-muted">
          🔒 尚未解鎖
        </div>
      )}
    </div>
  )
}
