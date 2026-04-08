'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

interface SearchResult {
  source: 'cocktail' | 'prep'
  id: string
  slug: string
  nameEn: string
  nameZh: string
  description?: string
  tags?: string[]
}

interface SearchResponse {
  total: number
  items: SearchResult[]
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSearched(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `/api/v1/search?q=${encodeURIComponent(q)}&type=all&limit=10`
      )
      if (!res.ok) throw new Error('Search failed')
      const data: SearchResponse = await res.json()
      setResults(data.items)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(value), 300)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 glass-card p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-charcoal-500">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="搜尋調酒配方、備料…"
            className="input-neon pl-12 pr-12 py-4 text-base"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500
                       hover:text-neon-amber transition-colors text-lg p-1"
            aria-label="Close search"
          >
            ✕
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3 p-4 bg-bg-tertiary rounded-sm">
                  <div className="w-16 h-6 bg-charcoal-700 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-charcoal-700 rounded w-3/4" />
                    <div className="h-3 bg-charcoal-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <p className="text-center text-text-muted font-mono text-sm py-8">
              找不到相關結果
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((item) => {
                const isCocktail = item.source === 'cocktail'
                const href = isCocktail ? `/recipes/${item.slug}` : `/prep/${item.slug}`

                return (
                  <Link
                    key={`${item.source}-${item.id}`}
                    href={href}
                    onClick={onClose}
                    className="block p-4 bg-bg-tertiary border border-charcoal-700
                               hover:border-neon-amber transition-colors duration-200 rounded-sm group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Source Badge */}
                      <span
                        className={`shrink-0 px-2 py-0.5 text-xs font-mono font-bold tracking-wider border rounded-sm ${
                          isCocktail
                            ? 'text-neon-amber border-neon-amber/40 bg-neon-amber/10'
                            : 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10'
                        }`}
                      >
                        {isCocktail ? '🍹 調酒' : '🧪 備料'}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-text-warm font-sans font-medium group-hover:text-neon-amber transition-colors">
                            {item.nameZh}
                          </span>
                          <span className="text-charcoal-500 font-mono text-xs">
                            {item.nameEn}
                          </span>
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p className="text-text-muted text-sm mt-1 line-clamp-1">
                            {item.description}
                          </p>
                        )}

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-[10px] font-mono text-charcoal-500
                                           bg-charcoal-800 border border-charcoal-700 rounded-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 pt-3 border-t border-charcoal-700 text-center">
          <span className="font-mono text-[10px] text-charcoal-500 tracking-wider">
            ESC 關閉 · 直接輸入開始搜尋
          </span>
        </div>
      </div>
    </div>
  )
}
