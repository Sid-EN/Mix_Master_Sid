'use client'

import StaticModeNotice from '@/components/StaticModeNotice'
import { IS_STATIC } from '@/lib/staticMode'
import ShareDialog from '@/components/ShareDialog'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { clientUrl } from '@/lib/api'
import { useAuth } from '@/components/AuthContext'

interface Recipe {
  id: string
  nameZh: string
  nameEn?: string
  grade?: string
  balanceScore?: number
  isShared: boolean
  shareToken: string | null
}

function MyRecipesPageInner() {

  const { token, ready } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [sharing, setSharing] = useState<{ url: string; title: string } | null>(null)

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    try {
      const res = await fetch(clientUrl('/api/v1/recipes/mine'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setRecipes((await res.json()).items ?? [])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { if (ready) load() }, [ready, load])

  async function toggleShare(r: Recipe) {
    if (!token) return
    setBusyId(r.id)
    try {
      await fetch(clientUrl(`/api/v1/recipes/${r.id}/share`), {
        method: r.isShared ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      await load()
    } finally {
      setBusyId('')
    }
  }

  async function remove(r: Recipe) {
    if (!token) return
    setBusyId(r.id)
    try {
      await fetch(clientUrl(`/api/v1/recipes/${r.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      await load()
    } finally {
      setBusyId('')
    }
  }

  if (!ready || loading) {
    return (
      <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
        <p className="font-mono text-sm text-text-muted">載入中…</p>
      </main>
    )
  }

  if (!token) {
    return (
      <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl text-text-warm mb-4">我的配方</h1>
        <p className="text-text-muted text-sm mb-6">配方屬於帳號，請先登入。</p>
        <Link href="/account" className="font-mono text-xs text-neon-amber hover:underline">
          前往登入 →
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <Link href="/recipes" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber">
        ← 返回配方庫
      </Link>

      <div className="mt-8 mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl text-text-warm mb-1">我的配方</h1>
          <p className="text-text-muted text-sm">共 {recipes.length} 款</p>
        </div>
        <Link
          href="/recipes/new"
          className="px-4 py-2 font-mono text-xs border border-neon-amber/60 text-neon-amber
                     rounded hover:bg-neon-amber/10 transition-colors"
        >
          ＋ 新增
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="text-text-muted text-sm">尚未建立任何配方。</p>
      ) : (
        <ul className="space-y-4">
          {recipes.map(r => (
            <li key={r.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-display text-lg text-text-warm">{r.nameZh}</p>
                  {r.nameEn && <p className="font-mono text-xs text-text-muted">{r.nameEn}</p>}
                </div>
                {typeof r.balanceScore === 'number' && (
                  <span className="font-mono text-xs text-neon-amber whitespace-nowrap">
                    {r.grade} {r.balanceScore}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleShare(r)}
                  disabled={busyId === r.id}
                  className={`px-3 py-1.5 font-mono text-xs rounded border transition-colors disabled:opacity-40 ${
                    r.isShared
                      ? 'border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10'
                      : 'border-charcoal-700 text-text-muted hover:border-neon-amber hover:text-neon-amber'
                  }`}
                >
                  {r.isShared ? '🔗 已公開分享' : '分享'}
                </button>

                {r.isShared && r.shareToken && (
                  <button
                    onClick={() => setSharing({
                      url: `${window.location.origin}/shared/${r.shareToken}`,
                      title: r.nameZh || r.nameEn || '我的配方',
                    })}
                    className="px-3 py-1.5 font-mono text-xs rounded border border-charcoal-700
                               text-text-muted hover:border-neon-cyan hover:text-neon-cyan transition-colors"
                  >
                    連結與 QR
                  </button>
                )}

                <Link
                  href={`/recipes/mine/${r.id}/versions`}
                  className="px-3 py-1.5 font-mono text-xs rounded border border-charcoal-700
                             text-text-muted hover:border-neon-amber hover:text-neon-amber transition-colors"
                >
                  版本歷史
                </Link>

                <button
                  onClick={() => remove(r)}
                  disabled={busyId === r.id}
                  className="ml-auto px-3 py-1.5 font-mono text-xs rounded border border-charcoal-700
                             text-text-muted hover:border-red-500/60 hover:text-red-400
                             transition-colors disabled:opacity-40"
                >
                  刪除
                </button>
              </div>

              {r.isShared && r.shareToken && (
                <p className="mt-3 font-mono text-[10px] text-charcoal-600 break-all">
                  /shared/{r.shareToken}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="h-16" />

      {sharing && (
        <ShareDialog
          url={sharing.url}
          title={sharing.title}
          onClose={() => setSharing(null)}
        />
      )}
    </main>
  )
}

/**
 * 靜態版沒有後端，此功能無法運作。
 *
 * 判斷置於包裝元件而非原元件內部——在 hooks 之前提前 return 會違反
 * React 的 hooks 規則（每次渲染須以相同順序呼叫）。
 */
export default function MyRecipesPage() {
  if (IS_STATIC) return <StaticModeNotice feature="我的配方" />
  return <MyRecipesPageInner />
}
