'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { clientUrl } from '@/lib/api'
import { useAuth } from './AuthContext'
import ConfirmButton from './ConfirmButton'
import { userMessage } from '@/lib/errorMessage'

interface Comment {
  id: number
  body: string
  author: string
  isAuthor: boolean
  canDelete: boolean
  createdAt: string | null
}

interface Ratings {
  count: number
  average: number | null
  myScore: number | null
}

/** 已公開配方的評分與留言。未登入者可瀏覽，互動則需登入。 */
export default function RecipeCommunity({ shareToken }: { shareToken: string }) {
  const { token, ready } = useAuth()
  const [ratings, setRatings] = useState<Ratings>({ count: 0, average: null, myScore: null })
  const [comments, setComments] = useState<Comment[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const authHeaders = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  )

  const load = useCallback(async () => {
    try {
      const [rRes, cRes] = await Promise.all([
        fetch(clientUrl(`/api/v1/community/${shareToken}/ratings`), { headers: authHeaders() }),
        // 帶上憑證，伺服器才能判斷哪幾則留言是這位使用者刪得掉的（canDelete）。
        // 少了它，就算是留言者本人也看不到自己的刪除按鈕。
        fetch(clientUrl(`/api/v1/community/${shareToken}/comments`), { headers: authHeaders() }),
      ])
      if (rRes.ok) setRatings(await rRes.json())
      if (cRes.ok) setComments((await cRes.json()).items ?? [])
    } catch {
      setError('載入失敗')
    }
  }, [shareToken, authHeaders])

  useEffect(() => { if (ready) load() }, [ready, load])

  async function rate(score: number) {
    if (!token) return
    setBusy(true); setError('')
    try {
      const res = await fetch(clientUrl(`/api/v1/community/${shareToken}/ratings`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ score }),
      })
      if (res.status === 403) throw new Error('不可為自己的配方評分')
      if (!res.ok) throw new Error('評分失敗')
      await load()
    } catch (e) {
      setError(userMessage(e, '評分失敗'))
    } finally {
      setBusy(false)
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !draft.trim()) return
    setBusy(true); setError('')
    try {
      const res = await fetch(clientUrl(`/api/v1/community/${shareToken}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ body: draft }),
      })
      if (!res.ok) throw new Error('留言失敗')
      setDraft('')
      await load()
    } catch (e) {
      setError(userMessage(e, '留言失敗'))
    } finally {
      setBusy(false)
    }
  }

  async function removeComment(id: number) {
    if (!token) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(clientUrl(`/api/v1/community/${shareToken}/comments/${id}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      // 先前不檢查回應：刪不掉時畫面毫無變化，也沒有任何說明
      if (!res.ok && res.status !== 204) throw new Error(String(res.status))
      await load()
    } catch {
      setError('刪除留言失敗，請稍後再試')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="glass-card p-6 mb-8">
        <h2 className="font-display text-xl text-neon-amber mb-4">⭐ 評分</h2>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-1" role="group" aria-label="評分">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => rate(n)}
                disabled={!token || busy}
                aria-label={`給 ${n} 星`}
                className={`text-2xl transition-colors disabled:cursor-not-allowed ${
                  (ratings.myScore ?? 0) >= n ? 'text-neon-amber' : 'text-charcoal-700'
                } ${token ? 'hover:text-neon-amber' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-text-muted">
            {ratings.count > 0
              ? `平均 ${ratings.average} · ${ratings.count} 則評分`
              : '尚無評分'}
          </p>
        </div>

        {!token && ready && (
          <p className="font-mono text-xs text-charcoal-600">
            <Link href="/account" className="text-neon-amber hover:underline">登入</Link>
            {' '}後即可評分與留言
          </p>
        )}
      </section>

      <section className="glass-card p-6 mb-8">
        <h2 className="font-display text-xl text-neon-amber mb-4">
          💬 留言 <span className="font-mono text-xs text-text-muted">({comments.length})</span>
        </h2>

        {token && (
          <form onSubmit={submitComment} className="mb-6">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="分享你的心得…"
              aria-label="留言內容"
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-sm text-text-warm"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="mt-2 px-4 py-2 font-mono text-xs rounded border border-neon-amber/60
                         text-neon-amber hover:bg-neon-amber/10 transition-colors disabled:opacity-40"
            >
              發表留言
            </button>
          </form>
        )}

        {error && (
          <p role="alert" className="mb-4 font-mono text-xs text-red-400
                                     border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
            {error}
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-text-muted text-sm">還沒有留言。</p>
        ) : (
          <ul className="space-y-4">
            {comments.map(c => (
              <li key={c.id} className="border-b border-charcoal-800 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-text-warm">{c.author}</span>
                  {c.isAuthor && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 border border-neon-amber/50
                                     text-neon-amber rounded-sm">作者</span>
                  )}
                  {c.createdAt && (
                    <span className="font-mono text-[10px] text-charcoal-600">
                      {new Date(c.createdAt).toLocaleString('zh-TW')}
                    </span>
                  )}
                  {/*
                    只在這位瀏覽者真的刪得掉時才顯示。
                    先前對所有登入者都顯示，但後端只允許留言者與配方擁有者刪除，
                    其他人點了只會靜默失敗，看起來就像按鈕壞了。
                  */}
                  {c.canDelete && (
                    <ConfirmButton
                      onConfirm={() => removeComment(c.id)}
                      disabled={busy}
                      confirmLabel="確認刪除？"
                      className="ml-auto font-mono text-[10px] text-charcoal-600
                                 hover:text-red-400 transition-colors disabled:opacity-40"
                      confirmClassName="ml-auto font-mono text-[10px] text-red-400
                                        transition-colors disabled:opacity-40"
                    >
                      刪除
                    </ConfirmButton>
                  )}
                </div>
                <p className="text-text-secondary text-sm whitespace-pre-wrap">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
