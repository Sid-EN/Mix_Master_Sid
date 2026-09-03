'use client'

import { clientUrl } from '@/lib/api'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useFavorites, type FavoriteData } from '../../components/FavoritesContext'

type SortKey = 'date' | 'rating' | 'name'

const METHOD_ICON: Record<string, string> = { shake: '🧊', stir: '🥄', build: '🥃' }
const METHOD_ZH: Record<string, string>   = { shake: '搖盪法', stir: '攪拌法', build: '直調法' }
const GRADE_CLR: Record<string, string>    = { A: '#2ECC71', B: '#F1C40F', C: '#E67E22', D: '#E74C3C' }

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-sm tracking-wider">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= rating ? '#F5A623' : '#3A3A4A' }}>★</span>
      ))}
    </span>
  )
}

export default function FavoritesPage() {
  const { getAllFavorites, toggleFavorite } = useFavorites()
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortKey>('date')

  useEffect(() => {
    fetch(clientUrl('/api/v1/recipes?limit=100'))
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const list = Array.isArray(data) ? data : data.items || data.recipes || []
        setRecipes(list)
      })
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false))
  }, [])

  const favorites = getAllFavorites()
  const favSlugs = new Set(
    Object.entries(favorites).filter(([, v]) => v.saved).map(([k]) => k)
  )

  const favRecipes = recipes
    .filter(r => favSlugs.has(r.slug || r.id))
    .map(r => ({
      recipe: r,
      favData: favorites[r.slug || r.id] as FavoriteData,
    }))

  const sorted = [...favRecipes].sort((a, b) => {
    if (sort === 'date') {
      return new Date(b.favData.savedAt).getTime() - new Date(a.favData.savedAt).getTime()
    }
    if (sort === 'rating') {
      return (b.favData.rating || 0) - (a.favData.rating || 0)
    }
    const nameA = a.recipe.nameZh || a.recipe.name_zh || a.recipe.name || ''
    const nameB = b.recipe.nameZh || b.recipe.name_zh || b.recipe.name || ''
    return nameA.localeCompare(nameB, 'zh-Hant')
  })

  const SORT_TABS: { key: SortKey; label: string }[] = [
    { key: 'date', label: '收藏時間' },
    { key: 'rating', label: '評分高低' },
    { key: 'name', label: '名稱排序' },
  ]

  return (
    <main className="min-h-screen px-6 py-12 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
          ⭐ 我的收藏
        </h1>
        <p className="font-mono text-sm text-charcoal-500 tracking-wider">
          MY FAVORITES — {favSlugs.size} 款配方
        </p>
      </div>

      {/* Sort Bar */}
      {favSlugs.size > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {SORT_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSort(tab.key)}
              className={`
                font-mono text-xs tracking-wider px-4 py-2 border transition-all duration-300
                ${sort === tab.key
                  ? 'border-neon-amber text-neon-amber bg-neon-amber/10 shadow-neon-amber'
                  : 'border-charcoal-700 text-charcoal-500 hover:border-charcoal-500 hover:text-text-secondary'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4 animate-pulse">⭐</p>
          <p className="text-text-muted font-mono text-sm">載入中...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && favSlugs.size === 0 && (
        <div className="text-center py-20 glass-card">
          <p className="text-5xl mb-6">🍸</p>
          <p className="text-text-secondary text-lg mb-2">還沒有收藏任何配方</p>
          <p className="text-text-muted font-mono text-sm mb-8">去配方庫探索吧！</p>
          <Link href="/recipes" className="btn-neon-amber text-sm">
            📚 瀏覽配方庫 →
          </Link>
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map(({ recipe: r, favData }) => {
            const slug = r.slug || r.id
            const nameZh = r.nameZh || r.name_zh || r.name || ''
            const nameEn = r.nameEn || r.name_en || ''
            const desc = r.descriptionZh || r.description_zh || r.description || ''
            const method = r.method || 'build'
            const grade = r.grade || r.balanceGrade || ''
            const score = r.balanceScore ?? r.balance_score ?? ''
            const glassImg = r.glassImage || r.glass_image || METHOD_ICON[method] || '🍹'
            const ingredients = r.ingredients || []

            return (
              <div key={slug} className="glass-card p-6 hover:border-neon-amber transition-all duration-300 group relative">
                {/* Unfavorite button */}
                <button
                  onClick={() => toggleFavorite(slug)}
                  className="absolute top-3 right-3 text-lg text-neon-amber hover:scale-125 transition-transform z-10"
                  aria-label="取消收藏"
                >
                  ⭐
                </button>

                <Link href={`/recipes/${slug}`} className="block">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 pr-8">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {glassImg}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] px-2 py-1 border border-charcoal-700 text-charcoal-500 uppercase tracking-wider">
                        {METHOD_ICON[method]} {METHOD_ZH[method] || method}
                      </span>
                      {grade && (
                        <span
                          className="font-mono text-xs font-bold px-2 py-1 rounded-sm"
                          style={{ backgroundColor: GRADE_CLR[grade] || '#888', color: '#fff' }}
                        >
                          {grade}{score ? ` ${score}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Names */}
                  <h3 className="font-display text-2xl text-text-warm mb-1 group-hover:text-neon-amber transition-colors">
                    {nameZh}
                  </h3>
                  <p className="font-mono text-xs text-charcoal-500 mb-3">{nameEn}</p>

                  {/* Rating */}
                  {favData.rating > 0 && (
                    <div className="mb-3">
                      <RatingStars rating={favData.rating} />
                    </div>
                  )}

                  {/* Note preview */}
                  {favData.note && (
                    <p className="text-text-muted text-xs italic line-clamp-2 mb-3 border-l-2 border-neon-amber/30 pl-3">
                      {favData.note}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-4">
                    {desc}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-charcoal-800">
                    <span className="font-mono text-xs text-text-muted">
                      🧪 {ingredients.length} 種材料
                    </span>
                    <span className="font-mono text-[10px] text-charcoal-600 group-hover:text-neon-amber transition-colors">
                      查看詳情 →
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* No matching recipes found from API */}
      {!loading && favSlugs.size > 0 && sorted.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔄</p>
          <p className="text-text-muted font-mono text-sm">正在載入收藏的配方資料...</p>
        </div>
      )}
    </main>
  )
}
