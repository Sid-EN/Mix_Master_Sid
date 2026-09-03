'use client'

import { useEffect, useState } from 'react'
import { clientUrl } from '@/lib/api'

interface Suggestion {
  ingredientId: string
  ingredientName: string
  combinedScore: number
  matchReason: string
}

/**
 * 針對缺少的材料，從使用者「我的酒櫃」既有品項中推薦替代品。
 *
 * 酒櫃頁原本只標出缺少什麼，但替代品 API 與酒櫃資料一直沒有串起來——
 * 使用者手邊可能就有堪用的替代材料卻不知道。
 */
export default function SubstituteHint({
  missingSlugs,
  ownedSlugs,
  nameMap,
}: {
  missingSlugs: string[]
  ownedSlugs: string[]
  nameMap: Record<string, string>
}) {
  const [results, setResults] = useState<Record<string, Suggestion | null>>({})
  const [loading, setLoading] = useState(false)

  // 以字串鍵比較內容，避免每次 render 產生新陣列而重複發送請求
  const missingKey = missingSlugs.join(',')
  const ownedKey = ownedSlugs.join(',')

  useEffect(() => {
    const missing = missingKey ? missingKey.split(',') : []
    const owned = ownedKey ? ownedKey.split(',') : []

    if (missing.length === 0 || owned.length === 0) return

    let cancelled = false
    setLoading(true)

    Promise.all(
      missing.map(async slug => {
        try {
          const res = await fetch(clientUrl('/api/v1/engine/substitute'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              missingSlug: slug,
              availableSlugs: owned,
              topN: 1,
            }),
          })
          if (!res.ok) return [slug, null] as const
          const data = await res.json()
          return [slug, data.suggestions?.[0] ?? null] as const
        } catch {
          return [slug, null] as const
        }
      }),
    ).then(pairs => {
      if (cancelled) return
      setResults(Object.fromEntries(pairs))
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [missingKey, ownedKey])

  if (loading) {
    return <p className="font-mono text-[10px] text-charcoal-600 mb-2">尋找替代品…</p>
  }

  const usable = Object.entries(results).filter(([, s]) => s !== null) as [string, Suggestion][]
  if (usable.length === 0) return null

  return (
    <div className="mb-2 space-y-1">
      {usable.map(([missing, s]) => (
        <p key={missing} className="font-mono text-[10px] text-cyan-400/90">
          💡 {nameMap[missing] || missing} 可用
          <span className="text-cyan-300"> {s.ingredientName} </span>
          代替
          <span className="text-charcoal-600">
            （相似度 {Math.round(s.combinedScore * 100)}%）
          </span>
        </p>
      ))}
    </div>
  )
}
