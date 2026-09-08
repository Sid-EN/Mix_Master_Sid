'use client'

import { useState } from 'react'
import { useFavorites } from '../../../components/FavoritesContext'

interface RecipeActionsProps {
  slug: string
}

export default function RecipeActions({ slug }: RecipeActionsProps) {
  const { isFavorite, toggleFavorite, getFavoriteData, setRating, setNote } = useFavorites()
  const favorited = isFavorite(slug)
  const data = getFavoriteData(slug)
  const currentRating = data?.rating ?? 0
  const currentNote = data?.note ?? ''
  const [noteValue, setNoteValue] = useState(currentNote)
  const [hoverStar, setHoverStar] = useState(0)

  return (
    <section className="glass-card p-6 mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        {/* Favorite Toggle */}
        <button
          onClick={() => toggleFavorite(slug)}
          className={`
            inline-flex items-center gap-2 font-mono text-sm px-5 py-2.5 border rounded-sm
            transition-all duration-300
            ${favorited
              ? 'border-neon-amber text-neon-amber bg-neon-amber/10 shadow-neon-amber'
              : 'border-charcoal-700 text-charcoal-500 hover:border-neon-amber hover:text-neon-amber'
            }
          `}
        >
          <span className={`text-lg transition-transform duration-300 ${favorited ? 'scale-110' : ''}`}>
            {favorited ? '⭐' : '☆'}
          </span>
          {favorited ? '已收藏' : '收藏'}
        </button>

        {/* Star Rating */}
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs text-charcoal-500 mr-2">評分：</span>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(slug, currentRating === n ? 0 : n)}
              onMouseEnter={() => setHoverStar(n)}
              onMouseLeave={() => setHoverStar(0)}
              /* 星號本身不到 24px 寬，撐開點擊區才按得準 */
              className="text-xl leading-none min-w-[24px] min-h-[24px] inline-flex items-center justify-center transition-colors duration-150 hover:scale-110 transform"
              aria-label={`給 ${n} 星`}
              aria-pressed={n <= currentRating}
            >
              <span style={{ color: n <= (hoverStar || currentRating) ? '#F5A623' : '#3A3A4A' }}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tasting Notes */}
      <div>
        <label className="font-mono text-xs text-charcoal-500 block mb-2">
          品飲筆記 Tasting Notes
        </label>
        <textarea
          value={noteValue}
          onChange={e => setNoteValue(e.target.value)}
          onBlur={() => setNote(slug, noteValue)}
          placeholder="寫下你的品飲心得..."
          rows={3}
          className="input-neon w-full resize-y text-sm leading-relaxed"
        />
      </div>
    </section>
  )
}
