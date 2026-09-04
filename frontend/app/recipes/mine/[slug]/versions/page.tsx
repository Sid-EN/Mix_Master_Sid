'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { clientUrl } from '@/lib/api'
import { useAuth } from '@/components/AuthContext'

interface VersionSummary {
  version: number
  nameZh: string
  balanceScore?: number
  grade?: string
  ingredientCount: number
  createdAt: string | null
}

export default function VersionHistoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { token, ready } = useAuth()
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [current, setCurrent] = useState<{ nameZh: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(0)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [vRes, mineRes] = await Promise.all([
        fetch(clientUrl(`/api/v1/recipes/${slug}/versions`), { headers }),
        fetch(clientUrl('/api/v1/recipes/mine'), { headers }),
      ])
      if (vRes.ok) setVersions((await vRes.json()).items ?? [])
      if (mineRes.ok) {
        const mine = (await mineRes.json()).items ?? []
        setCurrent(mine.find((r: any) => r.id === slug) ?? null)
      }
    } catch {
      setError('載入失敗')
    } finally {
      setLoading(false)
    }
  }, [token, slug])

  useEffect(() => { if (ready) load() }, [ready, load])

  async function restore(version: number) {
    if (!token) return
    setBusy(version)
    setError('')
    try {
      const res = await fetch(clientUrl(`/api/v1/recipes/${slug}/versions/${version}/restore`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('回溯失敗')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '回溯失敗')
    } finally {
      setBusy(0)
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
        <p className="text-text-muted text-sm mb-4">請先登入。</p>
        <Link href="/account" className="font-mono text-xs text-neon-amber hover:underline">
          前往登入 →
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <Link href="/recipes/mine" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber">
        ← 返回我的配方
      </Link>

      <h1 className="font-display text-4xl text-text-warm mt-8 mb-1">版本歷史</h1>
      <p className="text-text-muted text-sm mb-8">
        {current ? `目前版本：${current.nameZh}` : slug}
      </p>

      {error && (
        <p role="alert" className="mb-6 font-mono text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
          {error}
        </p>
      )}

      {versions.length === 0 ? (
        <p className="text-text-muted text-sm">
          尚無歷史版本。每次修改配方時，系統會自動保存修改前的內容。
        </p>
      ) : (
        <ul className="space-y-3">
          {versions.map(v => (
            <li key={v.version} className="glass-card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-base text-text-warm">
                  <span className="font-mono text-xs text-charcoal-500 mr-2">v{v.version}</span>
                  {v.nameZh}
                </p>
                <p className="font-mono text-[11px] text-text-muted mt-1">
                  {v.ingredientCount} 種材料
                  {typeof v.balanceScore === 'number' && ` · ${v.grade} ${v.balanceScore}`}
                  {v.createdAt && ` · ${new Date(v.createdAt).toLocaleString('zh-TW')}`}
                </p>
              </div>
              <button
                onClick={() => restore(v.version)}
                disabled={busy === v.version}
                className="px-3 py-1.5 font-mono text-xs rounded border border-charcoal-700
                           text-text-muted hover:border-neon-amber hover:text-neon-amber
                           transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {busy === v.version ? '回溯中…' : '回溯至此版'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 font-mono text-[10px] text-charcoal-600">
        僅保留最近 20 個版本；回溯本身也會保存為新版本，因此回溯動作同樣可以還原。
      </p>
      <div className="h-16" />
    </main>
  )
}
