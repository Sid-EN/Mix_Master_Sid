'use client'

import { useState, useRef, useEffect } from 'react'
import { useProgress } from './ProgressContext'

const LEVEL_ICONS = ['🥄', '🧹', '🍋', '🍸', '⭐', '👑', '🏆', '💎']

export default function XPBar() {
  const {
    totalXP, level, title, titleEn, progress, xpForNext,
    recipesViewedCount, recipesTriedCount, academySectionsCount, quizzesCompleted,
  } = useProgress()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const icon = LEVEL_ICONS[level - 1] ?? '💎'
  const pct = Math.round(progress * 100)

  return (
    <div ref={ref} className="relative hidden md:flex items-center">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 border border-charcoal-700 rounded-sm
                   hover:border-neon-amber/60 transition-colors duration-200 group"
        aria-label="View progress"
      >
        <span className="text-sm">{icon}</span>
        <span className="font-mono text-[10px] text-charcoal-400 group-hover:text-neon-amber transition-colors tracking-wider">
          Lv.{level}
        </span>
        {/* Mini XP bar */}
        <div className="w-16 h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #F5A623, #FFD700)',
              boxShadow: '0 0 6px rgba(245,166,35,0.5)',
            }}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 glass-card border border-charcoal-700 p-5 z-50 animate-fade-in">
          {/* Level header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-display text-lg text-gradient-amber leading-tight">
                {title}
              </p>
              <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">
                {titleEn} — Lv.{level}
              </p>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-4">
            <div className="flex justify-between font-mono text-[10px] text-charcoal-500 mb-1">
              <span>XP: {totalXP}</span>
              <span>{xpForNext !== null ? `${xpForNext} XP to Lv.${level + 1}` : 'MAX LEVEL'}</span>
            </div>
            <div className="w-full h-2.5 bg-charcoal-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #F5A623, #FFD700)',
                  boxShadow: '0 0 8px rgba(245,166,35,0.4)',
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <StatRow icon="📖" label="配方瀏覽 Recipes Viewed" value={recipesViewedCount} />
            <StatRow icon="✅" label="已嘗試 Recipes Tried" value={recipesTriedCount} />
            <StatRow icon="🎓" label="學院章節 Academy Sections" value={academySectionsCount} />
            <StatRow icon="📝" label="測驗完成 Quizzes" value={quizzesCompleted} />
          </div>
        </div>
      )}
    </div>
  )
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-charcoal-400">
        {icon} {label}
      </span>
      <span className="font-mono text-xs text-neon-amber font-bold">{value}</span>
    </div>
  )
}
