'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientUrl } from '@/lib/api'
import { useAuth } from './AuthContext'

interface Item {
  slug: string
  nameZh: string
  nameEn: string
  method: string
  grade?: string
  balanceScore?: number
  similarity: number | null
  makeableRatio: number
}

interface Payload {
  basis: 'favorites' | 'popular'
  favoritesUsed: number
  profileFlavors: string[]
  items: Item[]
}

const FLAVOR_ZH: Record<string, string> = {
  citrus: '柑橘', tropical: '熱帶', berry: '莓果', stone_fruit: '核果',
  herbal: '草本', floral: '花香', spicy: '辛香', earthy: '土質',
  smoky: '煙燻', nutty: '堅果', vanilla: '香草', caramel: '焦糖',
  bitter: '苦韻', umami: '鮮味', oak: '橡木',
}

const METHOD_ZH: Record<string, string> = { shake: '搖盪法', stir: '攪拌法', build: '直調法' }

/**
 * 依使用者收藏產生的個人化推薦。
 *
 * 僅在確實有收藏可供推論時顯示——沒有依據卻標示為個人化推薦，
 * 只是把熱門清單換個名字。
 */
export default function PersonalRecommendations() {
  const { token, ready } = useAuth()
  const [data, setData] = useState<Payload | null>(null)

  useEffect(() => {
    if (!ready || !token) return
    let cancelled = false
    fetch(clientUrl('/api/v1/engine/recommendations?limit=6'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled) setData(d) })
      .catch(() => { /* 推薦失敗不影響首頁其餘內容 */ })
    return () => { cancelled = true }
  }, [ready, token])

  // 沒有收藏可供推論時不顯示，避免與既有的偏好推薦區重複
  if (!data || data.basis !== 'favorites' || data.items.length === 0) return null

  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-gradient-cyan mb-1">✨ 依你的收藏推薦</h2>
        <p className="text-text-muted text-sm">
          依你收藏的 {data.favoritesUsed} 款配方
          {data.profileFlavors.length > 0 && (
            <>
              ，口味偏向{' '}
              <span className="text-neon-cyan">
                {data.profileFlavors.map(f => FLAVOR_ZH[f] ?? f).join('、')}
              </span>
            </>
          )}
        </p>
        <div className="divider-amber mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.items.map(item => (
          <Link
            key={item.slug}
            href={`/recipes/${item.slug}`}
            className="glass-card p-5 group hover:border-neon-cyan/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-display text-lg text-text-warm">{item.nameZh}</p>
                <p className="font-mono text-[11px] text-text-muted">{item.nameEn}</p>
              </div>
              {item.grade && (
                <span className="font-mono text-xs text-neon-amber whitespace-nowrap">
                  {item.grade} {item.balanceScore}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-charcoal-500">
              <span>{METHOD_ZH[item.method] ?? item.method}</span>
              {item.similarity !== null && (
                <span className="text-neon-cyan">
                  風味相似 {Math.round(item.similarity * 100)}%
                </span>
              )}
              {item.makeableRatio >= 1 && (
                <span className="text-green-400">酒櫃材料齊全</span>
              )}
              {item.makeableRatio > 0 && item.makeableRatio < 1 && (
                <span>手邊有 {Math.round(item.makeableRatio * 100)}% 材料</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
