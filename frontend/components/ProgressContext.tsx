'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

const STORAGE_KEY = 'mixmaster-progress'

/* ── Level Definitions ───────────────────────────────────── */

interface LevelDef {
  level: number
  titleZh: string
  titleEn: string
  minXP: number
}

const LEVELS: LevelDef[] = [
  { level: 1, titleZh: '見習生',     titleEn: 'Apprentice',            minXP: 0 },
  { level: 2, titleZh: '調酒助手',   titleEn: 'Bar Back',              minXP: 100 },
  { level: 3, titleZh: '初級調酒師', titleEn: 'Junior Bartender',      minXP: 300 },
  { level: 4, titleZh: '調酒師',     titleEn: 'Bartender',             minXP: 600 },
  { level: 5, titleZh: '資深調酒師', titleEn: 'Senior Bartender',      minXP: 1000 },
  { level: 6, titleZh: '首席調酒師', titleEn: 'Head Bartender',        minXP: 1500 },
  { level: 7, titleZh: '調酒大師',   titleEn: 'Master Mixologist',     minXP: 2200 },
  { level: 8, titleZh: '傳奇調酒師', titleEn: 'Legendary Mixologist',  minXP: 3000 },
]

function getLevelInfo(xp: number) {
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l
    else break
  }
  const next = LEVELS.find(l => l.minXP > xp)
  const xpForNext = next ? next.minXP : null
  const progress = xpForNext !== null
    ? (xp - current.minXP) / (xpForNext - current.minXP)
    : 1
  return { ...current, xpForNext, progress }
}

/* ── XP Constants ────────────────────────────────────────── */

const XP_RECIPE_VIEW = 5
const XP_RECIPE_TRIED = 15
const XP_ACADEMY_SECTION = 10
const XP_QUIZ_COMPLETE = 25

/* ── State & Context ─────────────────────────────────────── */

interface ProgressState {
  recipesViewed: string[]
  recipesTriedCount: number
  recipesTried: string[]
  academySectionsRead: string[]
  quizzesCompleted: number
  totalXP: number
}

const defaultState: ProgressState = {
  recipesViewed: [],
  recipesTriedCount: 0,
  recipesTried: [],
  academySectionsRead: [],
  quizzesCompleted: 0,
  totalXP: 0,
}

interface ProgressContextValue {
  addRecipeView: (slug: string) => void
  markRecipeTried: (slug: string) => void
  addAcademySection: (id: string) => void
  addQuizComplete: () => void
  totalXP: number
  level: number
  title: string
  titleEn: string
  progress: number
  xpForNext: number | null
  recipesViewedCount: number
  recipesTriedCount: number
  academySectionsCount: number
  quizzesCompleted: number
  isRecipeTried: (slug: string) => boolean
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

function loadState(): ProgressState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

function saveState(state: ProgressState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded */ }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) saveState(state)
  }, [state, hydrated])

  const addRecipeView = useCallback((slug: string) => {
    setState(prev => {
      if (prev.recipesViewed.includes(slug)) return prev
      return {
        ...prev,
        recipesViewed: [...prev.recipesViewed, slug],
        totalXP: prev.totalXP + XP_RECIPE_VIEW,
      }
    })
  }, [])

  const markRecipeTried = useCallback((slug: string) => {
    setState(prev => {
      if (prev.recipesTried.includes(slug)) return prev
      return {
        ...prev,
        recipesTried: [...prev.recipesTried, slug],
        recipesTriedCount: prev.recipesTriedCount + 1,
        totalXP: prev.totalXP + XP_RECIPE_TRIED,
      }
    })
  }, [])

  const addAcademySection = useCallback((id: string) => {
    setState(prev => {
      if (prev.academySectionsRead.includes(id)) return prev
      return {
        ...prev,
        academySectionsRead: [...prev.academySectionsRead, id],
        totalXP: prev.totalXP + XP_ACADEMY_SECTION,
      }
    })
  }, [])

  const addQuizComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1,
      totalXP: prev.totalXP + XP_QUIZ_COMPLETE,
    }))
  }, [])

  const isRecipeTried = useCallback((slug: string) => {
    return state.recipesTried.includes(slug)
  }, [state.recipesTried])

  const levelInfo = useMemo(() => getLevelInfo(state.totalXP), [state.totalXP])

  const value: ProgressContextValue = useMemo(() => ({
    addRecipeView,
    markRecipeTried,
    addAcademySection,
    addQuizComplete,
    totalXP: state.totalXP,
    level: levelInfo.level,
    title: levelInfo.titleZh,
    titleEn: levelInfo.titleEn,
    progress: levelInfo.progress,
    xpForNext: levelInfo.xpForNext,
    recipesViewedCount: state.recipesViewed.length,
    recipesTriedCount: state.recipesTriedCount,
    academySectionsCount: state.academySectionsRead.length,
    quizzesCompleted: state.quizzesCompleted,
    isRecipeTried,
  }), [
    addRecipeView, markRecipeTried, addAcademySection, addQuizComplete,
    state.totalXP, state.recipesViewed.length, state.recipesTriedCount,
    state.academySectionsRead.length, state.quizzesCompleted,
    levelInfo, isRecipeTried,
  ])

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
