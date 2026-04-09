'use client'

import { useEffect, useRef } from 'react'
import {
  ACHIEVEMENTS,
  getSeason,
  loadAchievementStore,
  saveAchievementStore,
  gatherUserStats,
} from '../lib/achievements'
import AchievementToast, { triggerAchievementToast } from './AchievementToast'

export default function AchievementChecker() {
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    const store = loadAchievementStore()

    // Update season & day tracking
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const season = getSeason(now.getMonth() + 1)
    let storeChanged = false

    if (!store.seasonsUsed.includes(season)) {
      store.seasonsUsed = [...new Set([...store.seasonsUsed, season])]
      storeChanged = true
    }
    if (!store.daysUsed.includes(today)) {
      store.daysUsed = [...store.daysUsed, today]
      storeChanged = true
    }

    const stats = gatherUserStats(store)
    const unlockedIds = new Set(store.unlockedAchievements.map(u => u.id))
    const newlyUnlocked = ACHIEVEMENTS.filter(
      a => !unlockedIds.has(a.id) && a.condition(stats)
    )

    if (newlyUnlocked.length > 0) {
      const nowISO = now.toISOString()
      store.unlockedAchievements = [
        ...store.unlockedAchievements,
        ...newlyUnlocked.map(a => ({ id: a.id, unlockedAt: nowISO })),
      ]
      storeChanged = true

      // Stagger toasts so they appear one-by-one
      newlyUnlocked.forEach((a, i) => {
        setTimeout(() => triggerAchievementToast(a), i * 800)
      })
    }

    if (storeChanged) {
      saveAchievementStore(store)
    }
  }, [])

  return <AchievementToast />
}
