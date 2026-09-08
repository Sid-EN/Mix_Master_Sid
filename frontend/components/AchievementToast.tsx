'use client'

import { useEffect, useState } from 'react'
import type { Achievement } from '../lib/achievements'
import { TIER_COLORS } from '../lib/achievements'

interface ToastItem {
  achievement: Achievement
  id: number
}

let toastId = 0
const listeners: Array<(a: Achievement) => void> = []

export function triggerAchievementToast(achievement: Achievement) {
  listeners.forEach(fn => fn(achievement))
}

export default function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (a: Achievement) => {
      const id = ++toastId
      setToasts(prev => [...prev, { achievement: a, id }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 5000)
    }
    listeners.push(handler)
    return () => {
      const idx = listeners.indexOf(handler)
      if (idx >= 0) listeners.splice(idx, 1)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    /*
      成就通知位於任何 landmark 之外，axe 的 region 規則會判為違規；
      更重要的是，讀屏軟體原本完全不會宣讀解鎖成就這件事。
      role="status" + aria-live 讓它成為即時區域：既會被宣讀，
      也符合 region 規則對即時區域的例外。
    */
    <div
      role="status"
      aria-live="polite"
      aria-label="成就通知"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map(({ achievement, id }) => {
        const tierColor = TIER_COLORS[achievement.tier]
        return (
          <div
            key={id}
            className="pointer-events-auto animate-fade-in glass-card px-5 py-4 min-w-[280px] max-w-[360px]"
            style={{
              border: `2px solid ${tierColor}`,
              boxShadow: `0 0 15px ${tierColor}66, 0 0 30px ${tierColor}33`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{achievement.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-wider uppercase text-neon-amber">
                  🏅 成就解鎖！
                </p>
                <p className="text-base font-bold text-text-warm truncate">
                  {achievement.nameZh}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {achievement.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
