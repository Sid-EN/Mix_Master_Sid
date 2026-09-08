'use client'

import StaticModeNotice from '@/components/StaticModeNotice'
import { IS_STATIC } from '@/lib/staticMode'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { clientUrl } from '@/lib/api'
import { useAuth } from '@/components/AuthContext'
import { userMessage } from '@/lib/errorMessage'

function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { applyToken } = useAuth()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      const res = await fetch(clientUrl('/api/v1/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const d = data.detail
        throw new Error(Array.isArray(d) ? d.map((x: any) => x.msg).join('；') : d || '重設失敗')
      }
      applyToken(data.access_token, data.user)
      router.push('/account')
    } catch (err) {
      setError(userMessage(err, '重設失敗'))
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <div className="glass-card p-6">
        <p className="text-text-muted text-sm mb-4">此連結缺少重設權杖，請重新申請。</p>
        <Link href="/account" className="font-mono text-xs text-neon-amber hover:underline">
          返回帳號頁
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-4">
      <label className="block">
        <span className="font-mono text-xs text-text-muted">新密碼（至少 8 個字元）</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm"
        />
      </label>

      {error && (
        <p role="alert" className="font-mono text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || password.length < 8}
        className="w-full py-3 font-display rounded border border-neon-amber text-neon-amber
                   hover:bg-neon-amber/10 transition-colors disabled:opacity-40"
      >
        {busy ? '處理中…' : '設定新密碼'}
      </button>
    </form>
  )
}

function ResetPasswordPageInner() {

  return (
    <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
      <Link href="/account" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber">
        ← 返回帳號頁
      </Link>
      <h1 className="font-display text-4xl text-text-warm mt-8 mb-2">重設密碼</h1>
      <p className="text-text-muted text-sm mb-8">設定新密碼後，其他裝置的登入狀態將失效</p>
      {/* useSearchParams 需置於 Suspense 內，否則整頁會轉為動態渲染 */}
      <Suspense fallback={<p className="font-mono text-sm text-text-muted">載入中…</p>}>
        <ResetForm />
      </Suspense>
      <div className="h-16" />
    </main>
  )
}

/**
 * 靜態版沒有後端，此功能無法運作。
 *
 * 判斷置於包裝元件而非原元件內部——在 hooks 之前提前 return 會違反
 * React 的 hooks 規則（每次渲染須以相同順序呼叫）。
 */
export default function ResetPasswordPage() {
  if (IS_STATIC) return <StaticModeNotice feature="密碼重設" />
  return <ResetPasswordPageInner />
}
