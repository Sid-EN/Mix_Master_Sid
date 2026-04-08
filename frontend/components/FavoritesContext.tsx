'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const STORAGE_KEY = 'mixmaster-favorites'

export interface FavoriteData {
  saved: boolean
  rating: number
  note: string
  savedAt: string
}

type FavoritesMap = Record<string, FavoriteData>

interface FavoritesContextValue {
  toggleFavorite: (slug: string) => void
  setRating: (slug: string, n: number) => void
  setNote: (slug: string, text: string) => void
  isFavorite: (slug: string) => boolean
  getFavoriteData: (slug: string) => FavoriteData | null
  getAllFavorites: () => FavoritesMap
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function loadFavorites(): FavoritesMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveFavorites(data: FavoritesMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage full or unavailable
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritesMap>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setFavorites(loadFavorites())
    setHydrated(true)
  }, [])

  const persist = useCallback((next: FavoritesMap) => {
    setFavorites(next)
    saveFavorites(next)
  }, [])

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites(prev => {
      const existing = prev[slug]
      let next: FavoritesMap
      if (existing?.saved) {
        const { [slug]: _, ...rest } = prev
        next = rest
      } else {
        next = {
          ...prev,
          [slug]: {
            saved: true,
            rating: existing?.rating ?? 0,
            note: existing?.note ?? '',
            savedAt: new Date().toISOString(),
          },
        }
      }
      saveFavorites(next)
      return next
    })
  }, [])

  const setRating = useCallback((slug: string, n: number) => {
    setFavorites(prev => {
      const existing = prev[slug]
      const next: FavoritesMap = {
        ...prev,
        [slug]: {
          saved: existing?.saved ?? true,
          rating: n,
          note: existing?.note ?? '',
          savedAt: existing?.savedAt ?? new Date().toISOString(),
        },
      }
      saveFavorites(next)
      return next
    })
  }, [])

  const setNote = useCallback((slug: string, text: string) => {
    setFavorites(prev => {
      const existing = prev[slug]
      const next: FavoritesMap = {
        ...prev,
        [slug]: {
          saved: existing?.saved ?? true,
          rating: existing?.rating ?? 0,
          note: text,
          savedAt: existing?.savedAt ?? new Date().toISOString(),
        },
      }
      saveFavorites(next)
      return next
    })
  }, [])

  const isFavorite = useCallback((slug: string) => {
    return !!favorites[slug]?.saved
  }, [favorites])

  const getFavoriteData = useCallback((slug: string): FavoriteData | null => {
    return favorites[slug] ?? null
  }, [favorites])

  const getAllFavorites = useCallback(() => {
    return favorites
  }, [favorites])

  const favoritesCount = Object.values(favorites).filter(f => f.saved).length

  if (!hydrated) {
    return <FavoritesContext.Provider value={{
      toggleFavorite: () => {},
      setRating: () => {},
      setNote: () => {},
      isFavorite: () => false,
      getFavoriteData: () => null,
      getAllFavorites: () => ({}),
      favoritesCount: 0,
    }}>{children}</FavoritesContext.Provider>
  }

  return (
    <FavoritesContext.Provider value={{
      toggleFavorite, setRating, setNote, isFavorite, getFavoriteData, getAllFavorites, favoritesCount,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
