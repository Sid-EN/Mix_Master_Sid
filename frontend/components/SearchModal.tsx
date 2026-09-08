'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { searchAll, type SearchItem } from '@/lib/searchClient'
import Portal from './Portal'
import { useScrollLock } from '../lib/useScrollLock'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 使用者打字比請求回來得快；只採用最後一次查詢的結果，
  // 否則較慢的舊請求會覆蓋掉較新的結果。
  const latestQuery = useRef('')

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSearched(false)
      setFailed(false)
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const fetchResults = useCallback(async (q: string) => {
    latestQuery.current = q
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      setLoading(false)
      setFailed(false)
      return
    }
    setLoading(true)
    try {
      const data = await searchAll(q, 10)
      if (latestQuery.current !== q) return
      setResults(data.items)
      setFailed(false)
    } catch {
      if (latestQuery.current !== q) return
      setResults([])
      setFailed(true)
    } finally {
      if (latestQuery.current === q) {
        setLoading(false)
        setSearched(true)
        setActive(0)
      }
    }
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(value), 300)
  }

  const hrefFor = (item: SearchItem) =>
    item.source === 'cocktail' ? `/recipes/${item.slug}` : `/prep/${item.slug}`

  // 對話框開啟時鎖住背景捲動，避免滑鼠滾輪捲到背後的頁面
  useScrollLock(isOpen)

  // 鍵盤操作：不使用滑鼠也能選取結果
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (results.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive(i => (i + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive(i => (i - 1 + results.length) % results.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const target = listRef.current?.querySelector<HTMLAnchorElement>(
          `[data-index="${active}"]`,
        )
        target?.click()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose, results, active])

  // 以鍵盤移動時把選取項目捲進可視範圍
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!isOpen) return null

  const approximateOnly = results.length > 0 && results.every(r => !r.exact)

  return (
    /* Portal：祖先的 transform 會讓 fixed 錨定錯位，詳見 Portal.tsx */
    <Portal>
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl mx-4 glass-card p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="搜尋"
      >
        {/* Search Input */}
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-charcoal-500"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="搜尋調酒配方、備料…"
            className="input-neon pl-12 pr-12 py-4 text-base"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? `search-result-${active}` : undefined}
            aria-label="搜尋調酒配方與備料"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500
                       hover:text-neon-amber transition-colors text-lg p-1"
            aria-label="關閉搜尋"
          >
            ✕
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 max-h-[50vh] overflow-y-auto" ref={listRef}>
          {loading && (
            <div className="space-y-3" aria-hidden="true">
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

          {!loading && failed && (
            <p className="text-center text-text-muted font-mono text-sm py-8">
              搜尋暫時無法使用，請稍後再試
            </p>
          )}

          {!loading && !failed && searched && results.length === 0 && (
            <p className="text-center text-text-muted font-mono text-sm py-8">
              找不到相關結果
            </p>
          )}

          {/* 容錯命中時說明原因，否則使用者會以為搜尋壞了 */}
          {!loading && approximateOnly && (
            <p className="mb-2 px-1 text-xs font-mono text-charcoal-500">
              沒有完全符合「{query.trim()}」的結果，以下為相近項目
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2" id="search-results" role="listbox" aria-label="搜尋結果">
              {results.map((item, index) => {
                const isCocktail = item.source === 'cocktail'
                const isActive = index === active

                return (
                  <Link
                    key={`${item.source}-${item.id}`}
                    href={hrefFor(item)}
                    onClick={onClose}
                    onMouseEnter={() => setActive(index)}
                    data-index={index}
                    id={`search-result-${index}`}
                    role="option"
                    aria-selected={isActive}
                    className={`block p-4 bg-bg-tertiary border transition-colors duration-200 rounded-sm group ${
                      isActive ? 'border-neon-amber' : 'border-charcoal-700 hover:border-neon-amber'
                    }`}
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
                          <span className={`font-sans font-medium transition-colors ${
                            isActive ? 'text-neon-amber' : 'text-text-warm group-hover:text-neon-amber'
                          }`}>
                            {item.nameZh}
                          </span>
                          <span className="text-charcoal-500 font-mono text-xs">
                            {item.nameEn}
                          </span>
                          {!item.exact && !approximateOnly && (
                            <span className="text-charcoal-500 font-mono text-[10px]">近似</span>
                          )}
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
            ↑↓ 選擇 · Enter 開啟 · ESC 關閉
          </span>
        </div>
      </div>
    </div>
    </Portal>
  )
}
