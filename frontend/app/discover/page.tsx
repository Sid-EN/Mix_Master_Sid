'use client'

/**
 * 公開配方目錄與創作者
 *
 * 三個分頁：公開配方、創作者、追蹤動態。
 * 追蹤動態只在登入後有意義，未登入時改為說明而非空白。
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { clientUrl } from '@/lib/api'
import { IS_STATIC } from '@/lib/staticMode'
import StaticModeNotice from '@/components/StaticModeNotice'

type Tab = 'recipes' | 'creators' | 'feed'
type Sort = 'recent' | 'rating' | 'name'

interface PublicRecipe {
  slug: string
  nameZh: string
  nameEn: string
  method: string
  grade: string | null
  tags: string[]
  author: { id: number | null; displayName: string }
  rating: { average: number | null; count: number }
  shareToken: string | null
}

interface Creator {
  id: number | null
  displayName: string
  recipeCount: number
  followerCount: number
}

const SORT_LABELS: Record<Sort, string> = {
  recent: '最新發布',
  rating: '評分最高',
  name: '名稱排序',
}

function DiscoverPageInner() {
  const { token, ready } = useAuth()
  const [tab, setTab] = useState<Tab>('recipes')
  const [sort, setSort] = useState<Sort>('recent')
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState<PublicRecipe[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [feed, setFeed] = useState<PublicRecipe[]>([])
  const [followingIds, setFollowingIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const authHeaders = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  )

  const loadRecipes = useCallback(async () => {
    const params = new URLSearchParams({ sort, limit: '50' })
    if (query.trim()) params.set('q', query.trim())
    const res = await fetch(clientUrl(`/api/v1/discover/recipes?${params}`))
    if (!res.ok) throw new Error('載入失敗')
    setRecipes((await res.json()).items)
  }, [sort, query])

  const loadCreators = useCallback(async () => {
    const res = await fetch(clientUrl('/api/v1/discover/creators?limit=50'))
    if (!res.ok) throw new Error('載入失敗')
    setCreators((await res.json()).items)
  }, [])

  const loadFollowing = useCallback(async () => {
    if (!token) { setFollowingIds([]); return }
    const res = await fetch(clientUrl('/api/v1/discover/following'),
      { headers: authHeaders() })
    if (!res.ok) return
    setFollowingIds((await res.json()).items.map((i: Creator) => i.id).filter(Boolean))
  }, [token, authHeaders])

  const loadFeed = useCallback(async () => {
    if (!token) { setFeed([]); return }
    const res = await fetch(clientUrl('/api/v1/discover/feed?limit=50'),
      { headers: authHeaders() })
    if (!res.ok) throw new Error('載入失敗')
    setFeed((await res.json()).items)
  }, [token, authHeaders])

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    setLoading(true)
    setError('')
    const work =
      tab === 'recipes' ? loadRecipes()
      : tab === 'creators' ? Promise.all([loadCreators(), loadFollowing()])
      : loadFeed()
    work
      .catch(() => { if (!cancelled) setError('資料載入失敗，請稍後再試') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [ready, tab, loadRecipes, loadCreators, loadFollowing, loadFeed])

  /*
    同一位創作者的追蹤請求在完成前不再受理新的點擊。

    這裡是樂觀更新：畫面先翻、請求後送。快速連點兩下會送出 POST 與 DELETE
    兩個請求，而它們沒有到達順序的保證——後送的先到時，伺服器留下的狀態
    會和畫面相反，重新整理才會發現「追蹤」根本沒生效。
  */
  const [followPending, setFollowPending] = useState<number[]>([])

  const toggleFollow = async (id: number) => {
    if (!token || followPending.includes(id)) return
    const isFollowing = followingIds.includes(id)
    setFollowPending(prev => [...prev, id])
    // 先更新畫面再送出請求；失敗時還原，避免每次點擊都要等一輪往返
    setFollowingIds(prev => (isFollowing ? prev.filter(x => x !== id) : [...prev, id]))
    const res = await fetch(clientUrl(`/api/v1/discover/creators/${id}/follow`), {
      method: isFollowing ? 'DELETE' : 'POST',
      headers: authHeaders(),
    }).catch(() => null)
    if (!res || !res.ok) {
      setFollowingIds(prev => (isFollowing ? [...prev, id] : prev.filter(x => x !== id)))
    }
    setFollowPending(prev => prev.filter(x => x !== id))
  }

  const RecipeCard = ({ r }: { r: PublicRecipe }) => (
    <li className="p-4 bg-bg-tertiary border border-charcoal-700 rounded-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {r.shareToken ? (
            <Link href={`/shared/${r.shareToken}`} className="text-text-warm hover:text-neon-amber transition-colors">
              {r.nameZh || r.nameEn}
            </Link>
          ) : (
            <span className="text-text-warm">{r.nameZh || r.nameEn}</span>
          )}
          <p className="font-mono text-[11px] text-charcoal-500 mt-0.5">
            by {r.author.displayName}
            {r.grade && <> · 平衡 {r.grade}</>}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-neon-amber">
          {r.rating.average !== null
            ? `★ ${r.rating.average.toFixed(1)}（${r.rating.count}）`
            : '尚無評分'}
        </span>
      </div>
      {r.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {r.tags.map(t => (
            <span key={t} className="px-1.5 py-0.5 text-[10px] font-mono text-charcoal-500
                                     bg-charcoal-800 border border-charcoal-700 rounded-sm">
              {t}
            </span>
          ))}
        </div>
      )}
    </li>
  )

  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <Link href="/" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors">
        ← 返回首頁
      </Link>

      <header className="mt-8 mb-8">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">Discover</p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">公開配方目錄</h1>
        <p className="text-text-secondary">
          瀏覽其他人發布的原創配方，追蹤喜歡的創作者。
        </p>
        <div className="divider-amber mt-6" />
      </header>

      <div role="tablist" aria-label="目錄分頁" className="flex gap-2 mb-6">
        {([['recipes', '公開配方'], ['creators', '創作者'], ['feed', '追蹤動態']] as const).map(
          ([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 font-mono text-xs rounded border transition-colors ${
                tab === key
                  ? 'border-neon-amber text-neon-amber bg-neon-amber/10'
                  : 'border-charcoal-700 text-text-muted hover:border-charcoal-500'
              }`}
            >
              {label}
            </button>
          ),
        )}
      </div>

      {tab === 'recipes' && (
        <div className="flex flex-wrap gap-2 mb-4">
          <label htmlFor="discover-q" className="sr-only">搜尋公開配方</label>
          <input
            id="discover-q"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜尋配方名稱…"
            className="input-neon flex-1 min-w-[12rem] px-4 py-2 text-sm"
          />
          <label htmlFor="discover-sort" className="sr-only">排序方式</label>
          <select
            id="discover-sort"
            value={sort}
            onChange={e => setSort(e.target.value as Sort)}
            className="px-3 py-2 bg-bg-tertiary border border-charcoal-700 rounded font-mono text-xs text-text-warm"
          >
            {Object.entries(SORT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="font-mono text-sm text-text-muted">載入中…</p>}
      {error && <p role="alert" className="font-mono text-sm text-red-400">{error}</p>}

      {!loading && !error && tab === 'recipes' && (
        recipes.length > 0 ? (
          <ul className="space-y-2">{recipes.map(r => <RecipeCard key={r.slug} r={r} />)}</ul>
        ) : (
          <p className="text-center text-text-muted py-12">
            目前還沒有公開配方。到「我的配方」把作品發布出來吧。
          </p>
        )
      )}

      {!loading && !error && tab === 'creators' && (
        creators.length > 0 ? (
          <ul className="space-y-2">
            {creators.map(c => (
              <li key={c.id} className="flex items-center justify-between gap-3 p-4
                                        bg-bg-tertiary border border-charcoal-700 rounded-sm">
                <div className="min-w-0">
                  <p className="text-text-warm truncate">{c.displayName}</p>
                  <p className="font-mono text-[11px] text-charcoal-500">
                    {c.recipeCount} 份公開配方 · {c.followerCount} 位追蹤者
                  </p>
                </div>
                {token && c.id !== null && (
                  <button
                    onClick={() => toggleFollow(c.id!)}
                    aria-pressed={followingIds.includes(c.id)}
                    disabled={followPending.includes(c.id!)}
                    className={`shrink-0 px-3 py-1.5 font-mono text-xs rounded border transition-colors disabled:opacity-60 ${
                      followingIds.includes(c.id)
                        ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                        : 'border-charcoal-700 text-text-muted hover:border-neon-cyan hover:text-neon-cyan'
                    }`}
                  >
                    {followingIds.includes(c.id) ? '已追蹤' : '追蹤'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-text-muted py-12">還沒有人發布公開配方。</p>
        )
      )}

      {!loading && !error && tab === 'feed' && (
        !token ? (
          <div className="text-center py-12 border border-dashed border-charcoal-700 rounded">
            <p className="text-text-muted mb-4">登入後即可看到追蹤對象的最新作品</p>
            <Link href="/account" className="px-4 py-2 font-mono text-xs border border-neon-amber/60
                       text-neon-amber rounded hover:bg-neon-amber/10 transition-colors">
              前往登入
            </Link>
          </div>
        ) : feed.length > 0 ? (
          <ul className="space-y-2">{feed.map(r => <RecipeCard key={r.slug} r={r} />)}</ul>
        ) : (
          <p className="text-center text-text-muted py-12">
            還沒有追蹤任何創作者，或他們尚未發布新作品。
          </p>
        )
      )}
    </main>
  )
}

export default function DiscoverPage() {
  // 公開目錄需要後端與資料庫，靜態版無法提供
  if (IS_STATIC) return <StaticModeNotice feature="公開配方目錄" />
  return <DiscoverPageInner />
}
