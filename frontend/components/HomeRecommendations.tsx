'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import FlavorPreference, { loadPref, getRecommendations } from './FlavorPreference'
import type { FlavorPref } from './FlavorPreference'

const METHOD_ICON: Record<string, string> = { shake: '🧊', stir: '🥄', build: '🥃' }
const METHOD_ZH: Record<string, string> = { shake: '搖盪法', stir: '攪拌法', build: '直調法' }

export default function HomeRecommendations() {
  const [pref, setPref] = useState<FlavorPref | null>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [prefOpen, setPrefOpen] = useState(false)

  const refreshPref = useCallback(() => {
    setPref(loadPref())
  }, [])

  // Load preferences from localStorage
  useEffect(() => {
    refreshPref()
    const handler = () => refreshPref()
    window.addEventListener('flavor-pref-changed', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('flavor-pref-changed', handler)
      window.removeEventListener('storage', handler)
    }
  }, [refreshPref])

  // Fetch recipes
  useEffect(() => {
    let cancelled = false
    async function fetchRecipes() {
      try {
        const res = await fetch('/api/v1/recipes?limit=100')
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (!cancelled) setRecipes(data.items || [])
      } catch {
        // silently fail — section just won't show
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchRecipes()
    return () => { cancelled = true }
  }, [])

  if (loading) return null

  // No preferences set — show CTA
  if (!pref) {
    return (
      <>
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-3">Personalized</p>
            <h2 className="font-display text-3xl md:text-4xl text-text-warm">為你推薦</h2>
            <p className="font-mono text-xs text-charcoal-500 mt-2">Recommended For You</p>
          </div>

          <div className="glass-card border-neon-amber-glow max-w-xl mx-auto p-8 text-center">
            <span className="text-5xl block mb-4">🎯</span>
            <h3 className="font-display text-xl text-text-warm mb-2">設定你的風味偏好</h3>
            <p className="text-text-secondary text-sm mb-6">
              告訴我們你喜歡什麼口味，獲得個人化的調酒推薦
            </p>
            <p className="font-mono text-xs text-charcoal-500 mb-6">
              Set your flavor preferences for personalized cocktail recommendations
            </p>
            <button onClick={() => setPrefOpen(true)} className="btn-neon-amber">
              <span className="mr-2">🎯</span>開始設定偏好
            </button>
          </div>
        </section>

        <FlavorPreference isOpen={prefOpen} onClose={() => { setPrefOpen(false); refreshPref() }} />
      </>
    )
  }

  // Has preferences — show recommendations
  if (recipes.length === 0) return null

  const recs = getRecommendations(recipes, pref, 6)

  return (
    <>
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-3">Recommended For You</p>
            <h2 className="font-display text-3xl md:text-4xl text-text-warm">為你推薦</h2>
          </div>
          <button
            onClick={() => setPrefOpen(true)}
            className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors tracking-wider hidden sm:block"
          >
            🎯 調整偏好 →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recs.map(({ recipe: r, score }) => {
            const slug = r.slug || r.id
            const nameZh = r.nameZh || r.name_zh || r.name || ''
            const nameEn = r.nameEn || r.name_en || ''
            const method = r.method || 'build'
            const matchPct = Math.round(score * 100)

            return (
              <Link
                key={slug}
                href={`/recipes/${slug}`}
                className="glass-card p-6 hover:border-neon-amber transition-all duration-300 group block"
              >
                {/* Header: method + match score */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {METHOD_ICON[method] || '🍹'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-1 border border-charcoal-700 text-charcoal-500 uppercase tracking-wider">
                      {METHOD_ICON[method]} {METHOD_ZH[method] || method}
                    </span>
                    <span className={`
                      font-mono text-xs font-bold px-2 py-1 rounded-sm
                      ${matchPct >= 80
                        ? 'bg-green-600/80 text-white'
                        : matchPct >= 60
                          ? 'bg-neon-amber/80 text-bg-primary'
                          : 'bg-charcoal-600 text-charcoal-300'
                      }
                    `}>
                      {matchPct}%
                    </span>
                  </div>
                </div>

                {/* Names */}
                <h3 className="font-display text-xl text-text-warm mb-1 group-hover:text-neon-amber transition-colors">
                  {nameZh}
                </h3>
                <p className="font-mono text-xs text-charcoal-500 mb-3">{nameEn}</p>

                {/* Match bar */}
                <div className="mt-auto pt-3 border-t border-charcoal-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-charcoal-500">匹配度 Match</span>
                    <span className="font-mono text-[10px] text-neon-amber">{matchPct}%</span>
                  </div>
                  <div className="w-full h-1 bg-charcoal-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${matchPct}%`,
                        background: matchPct >= 80
                          ? 'linear-gradient(90deg, #2ECC71, #27AE60)'
                          : matchPct >= 60
                            ? 'linear-gradient(90deg, #F5A623, #C47D0E)'
                            : '#3D3D50',
                      }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <FlavorPreference isOpen={prefOpen} onClose={() => { setPrefOpen(false); refreshPref() }} />
    </>
  )
}
