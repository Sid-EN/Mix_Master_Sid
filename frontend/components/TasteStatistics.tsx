'use client'

/**
 * 口味統計
 *
 * 「風味偏好」是使用者自己填的理想值；這裡呈現的是實際行為——
 * 收藏、做過、給高分的酒實際偏向什麼。兩者常常不一樣。
 */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { loadRecipeData, type RecipeData } from '@/lib/recipeData'
import {
  FLAVOUR_KEYS,
  FLAVOUR_LABELS,
  computeTasteStats,
  type TasteStats,
} from '@/lib/tasteStats'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export default function TasteStatistics() {
  const [data, setData] = useState<RecipeData | null>(null)
  const [input, setInput] = useState<{ favourites: Record<string, never>; tried: string[] }>(
    { favourites: {}, tried: [] })
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setInput({
      favourites: readJson('mixmaster-favorites', {}),
      tried: readJson<{ recipesTried?: string[] }>('mixmaster-progress', {}).recipesTried ?? [],
    })
    loadRecipeData()
      .then(d => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const stats: TasteStats | null = useMemo(
    () => (data ? computeTasteStats(input, data) : null),
    [data, input],
  )

  if (loading) {
    return <p className="font-mono text-sm text-text-muted">統計計算中…</p>
  }
  if (failed || !stats) {
    return <p className="font-mono text-sm text-text-muted">配方資料載入失敗，暫時無法統計。</p>
  }

  if (stats.sampleSize === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-charcoal-700 rounded">
        <p className="text-text-muted mb-4">
          還沒有足夠的紀錄。收藏幾杯喜歡的酒，或標記做過的配方，這裡就會出現你的口味輪廓。
        </p>
        <Link href="/recipes" className="px-4 py-2 font-mono text-xs border border-neon-amber/60
                   text-neon-amber rounded hover:bg-neon-amber/10 transition-colors">
          去逛配方庫
        </Link>
      </div>
    )
  }

  return (
    <div>
      <p className="text-text-secondary mb-1">{stats.headline}</p>
      <p className="font-mono text-[11px] text-charcoal-500 mb-6">
        依據你收藏或做過的 {stats.sampleSize} 款配方，評分越高權重越大
      </p>

      {/* 與全站平均的差距 */}
      {stats.flavour && stats.difference && (
        <div className="space-y-3 mb-8">
          {FLAVOUR_KEYS.map(key => {
            const value = stats.flavour![key]
            const diff = stats.difference![key]
            return (
              <div key={key}>
                <div className="flex justify-between font-mono text-[11px] mb-1">
                  <span className="text-text-muted">{FLAVOUR_LABELS[key]}</span>
                  <span className={diff > 0.05 ? 'text-neon-amber'
                    : diff < -0.05 ? 'text-neon-cyan' : 'text-charcoal-500'}>
                    {(value * 10).toFixed(1)} / 10
                    {' · '}
                    {diff >= 0 ? '高於' : '低於'}平均 {Math.abs(diff * 10).toFixed(1)}
                  </span>
                </div>
                <div className="relative h-2 bg-charcoal-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-amber to-neon-cyan rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
                  />
                  {/* 全站平均的位置，作為對照 */}
                  <div
                    className="absolute top-0 h-full w-px bg-text-warm/70"
                    style={{ left: `${Math.min(100, Math.max(0, stats.baseline![key] * 100))}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            )
          })}
          <p className="font-mono text-[10px] text-charcoal-600">直線為全站平均值</p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-6">
        <section>
          <h3 className="font-mono text-[10px] text-charcoal-500 tracking-wider mb-2">最常出現的材料</h3>
          <ul className="space-y-1">
            {stats.topIngredients.map(i => (
              <li key={i.key} className="flex justify-between text-sm">
                <span className="text-text-warm truncate">{i.label}</span>
                <span className="font-mono text-xs text-charcoal-500">{i.count}</span>
              </li>
            ))}
            {stats.topIngredients.length === 0 && (
              <li className="text-charcoal-600 text-sm">—</li>
            )}
          </ul>
        </section>

        <section>
          <h3 className="font-mono text-[10px] text-charcoal-500 tracking-wider mb-2">偏好的手法</h3>
          <ul className="space-y-1">
            {stats.methods.map(m => (
              <li key={m.key} className="flex justify-between text-sm">
                <span className="text-text-warm">{m.label}</span>
                <span className="font-mono text-xs text-charcoal-500">{m.count}</span>
              </li>
            ))}
            {stats.methods.length === 0 && <li className="text-charcoal-600 text-sm">—</li>}
          </ul>
        </section>

        <section>
          <h3 className="font-mono text-[10px] text-charcoal-500 tracking-wider mb-2">常見標籤</h3>
          <ul className="flex flex-wrap gap-1.5">
            {stats.topTags.map(t => (
              <li key={t.key} className="px-1.5 py-0.5 text-[10px] font-mono text-charcoal-500
                                         bg-charcoal-800 border border-charcoal-700 rounded-sm">
                {t.label} {t.count}
              </li>
            ))}
            {stats.topTags.length === 0 && <li className="text-charcoal-600 text-sm">—</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}
