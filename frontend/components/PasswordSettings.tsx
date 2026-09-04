'use client'

import { useState } from 'react'
import { clientUrl } from '@/lib/api'
import { useAuth } from './AuthContext'

const inputClass =
  'mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm'

/** 帳號設定：變更顯示名稱與密碼。 */
export default function PasswordSettings() {
  const { token, user, refresh, applyToken } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setMessage(''); setBusy(true)
    try {
      const res = await fetch(clientUrl('/api/v1/auth/me'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: displayName.trim() }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || '更新失敗')
      await refresh()
      setMessage('顯示名稱已更新')
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗')
    } finally {
      setBusy(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setMessage(''); setBusy(true)
    try {
      const res = await fetch(clientUrl('/api/v1/auth/change-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const d = data.detail
        throw new Error(Array.isArray(d) ? d.map((x: any) => x.msg).join('；') : d || '變更失敗')
      }
      // 變更密碼會使舊權杖失效，需改用回傳的新權杖，否則會立刻被登出
      applyToken(data.access_token, data.user)
      setCurrent(''); setNext('')
      setMessage('密碼已變更，其他裝置的登入狀態已失效')
    } catch (err) {
      setError(err instanceof Error ? err.message : '變更失敗')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="glass-card p-6 mb-6">
      <h2 className="font-display text-lg text-neon-amber mb-4">⚙️ 帳號設定</h2>

      <form onSubmit={saveName} className="space-y-3 mb-6">
        <label className="block">
          <span className="font-mono text-xs text-text-muted">顯示名稱</span>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                 maxLength={80} className={inputClass} />
        </label>
        <button type="submit" disabled={busy || !displayName.trim()}
                className="px-4 py-2 font-mono text-xs rounded border border-charcoal-700
                           text-text-muted hover:border-neon-amber hover:text-neon-amber
                           transition-colors disabled:opacity-40">
          更新名稱
        </button>
      </form>

      <div className="divider-amber mb-6" />

      <form onSubmit={changePassword} className="space-y-3">
        <label className="block">
          <span className="font-mono text-xs text-text-muted">目前密碼</span>
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)}
                 autoComplete="current-password" className={inputClass} />
        </label>
        <label className="block">
          <span className="font-mono text-xs text-text-muted">新密碼（至少 8 個字元）</span>
          <input type="password" value={next} onChange={e => setNext(e.target.value)}
                 minLength={8} autoComplete="new-password" className={inputClass} />
        </label>
        <button type="submit" disabled={busy || !current || next.length < 8}
                className="px-4 py-2 font-mono text-xs rounded border border-charcoal-700
                           text-text-muted hover:border-neon-amber hover:text-neon-amber
                           transition-colors disabled:opacity-40">
          {busy ? '處理中…' : '變更密碼'}
        </button>
      </form>

      {message && <p className="mt-4 font-mono text-xs text-neon-cyan">{message}</p>}
      {error && (
        <p role="alert" className="mt-4 font-mono text-xs text-red-400
                                   border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
          {error}
        </p>
      )}
    </section>
  )
}
