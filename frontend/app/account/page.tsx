'use client'

import StaticModeNotice from '@/components/StaticModeNotice'
import { IS_STATIC } from '@/lib/staticMode'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { clientUrl } from '@/lib/api'
import { SYNCABLE_KEYS } from '@/lib/sync'
import { SYNC_EVENT } from '@/components/SyncAgent'
import PasswordSettings from '@/components/PasswordSettings'
import BackupSettings from '@/components/BackupSettings'
import NotificationSettings from '@/components/NotificationSettings'
import { userMessage } from '@/lib/errorMessage'

type Mode = 'login' | 'register'

const KEY_LABELS: Record<string, string> = {
  favorites: '收藏與評分',
  'my-bar': '我的酒櫃',
  progress: '學習進度',
  'flavor-pref': '風味偏好',
  'quiz-history': '測驗紀錄',
  personality: '調酒人格',
}

function AccountPageInner() {

  const { user, token, ready, login, register, logout } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [syncNote, setSyncNote] = useState('')

  // 登出後回到登入模式；否則先前切到註冊分頁的狀態會殘留，
  // 使用者輸入既有帳號會得到「此電子郵件已註冊」而非登入
  useEffect(() => {
    if (!user) setMode('login')
  }, [user])

  // 同步由 SyncAgent 統一執行，此處僅呈現結果，避免兩條路徑競態
  useEffect(() => {
    if (!token) return
    function onSynced(e: Event) {
      const { pulled = [], pushed = [] } = (e as CustomEvent).detail ?? {}
      const parts = []
      if (pulled.length) parts.push(`已取回 ${pulled.length} 項`)
      if (pushed.length) parts.push(`已上傳 ${pushed.length} 項`)
      setSyncNote(parts.length ? `同步完成：${parts.join('、')}` : '所有資料皆為最新')
    }
    document.addEventListener(SYNC_EVENT, onSynced)
    return () => document.removeEventListener(SYNC_EVENT, onSynced)
  }, [token])

  async function requestReset() {
    // 未填電子郵件時不能直接送出，但也不該把按鈕變成灰色讓人不知所措——
    // 改為指出下一步並把游標移到欄位上。
    if (!email.trim()) {
      setSyncNote('')
      setError('請先輸入註冊時使用的電子郵件，再申請重設密碼')
      emailRef.current?.focus()
      return
    }
    setError(''); setBusy(true)
    try {
      await fetch(clientUrl('/api/v1/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      // 一律顯示相同訊息，不透露該信箱是否已註冊
      setSyncNote('若該電子郵件已註冊，重設連結將寄送至該信箱')
    } catch {
      setError('申請失敗，請稍後再試')
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(email.trim(), password)
      else await register(email.trim(), password, displayName.trim())
    } catch (err) {
      setError(userMessage(err, '操作失敗'))
    } finally {
      setBusy(false)
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen px-6 py-16 max-w-md mx-auto">
        <p className="font-mono text-sm text-text-muted">載入中…</p>
      </main>
    )
  }

  if (user) {
    return (
      <main className="min-h-screen px-6 py-12 max-w-lg mx-auto">
        <Link href="/" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber">
          ← 返回首頁
        </Link>

        <h1 className="font-display text-4xl text-text-warm mt-8 mb-2">我的帳號</h1>
        <p className="text-text-muted text-sm mb-8">資料已在此帳號的所有裝置間同步</p>

        <section className="glass-card p-6 mb-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">顯示名稱</dt>
              <dd className="text-text-warm">{user.displayName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">電子郵件</dt>
              <dd className="font-mono text-text-warm">{user.email}</dd>
            </div>
          </dl>
        </section>

        <PasswordSettings />

        <NotificationSettings />

        <BackupSettings />

        <section className="glass-card p-6 mb-6">
          <h2 className="font-display text-lg text-neon-amber mb-3">☁️ 同步項目</h2>
          <ul className="grid grid-cols-2 gap-2 text-xs font-mono text-text-muted">
            {SYNCABLE_KEYS.map(k => (
              <li key={k}>· {KEY_LABELS[k] ?? k}</li>
            ))}
          </ul>
          {syncNote && <p className="mt-4 font-mono text-xs text-neon-cyan">{syncNote}</p>}
          <p className="mt-3 font-mono text-[10px] text-charcoal-600">
            佈景主題與語言屬單一裝置設定，不會同步。
          </p>
        </section>

        <button
          onClick={logout}
          className="w-full py-3 font-display rounded border border-charcoal-700 text-text-muted hover:border-red-500/60 hover:text-red-400 transition-colors"
        >
          登出
        </button>
        <div className="h-16" />
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
      <Link href="/" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber">
        ← 返回首頁
      </Link>

      <h1 className="font-display text-4xl text-text-warm mt-8 mb-2">
        {mode === 'login' ? '登入' : '建立帳號'}
      </h1>
      <p className="text-text-muted text-sm mb-8">
        登入後，酒櫃、收藏與學習進度會跨裝置同步
      </p>

      <div className="flex gap-2 mb-6" role="tablist">
        {(['login', 'register'] as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => { setMode(m); setError('') }}
            className={`flex-1 py-2 font-mono text-xs rounded border transition-colors ${
              mode === m
                ? 'border-neon-amber text-neon-amber bg-neon-amber/10'
                : 'border-charcoal-700 text-text-muted hover:border-charcoal-600'
            }`}
          >
            {m === 'login' ? '登入' : '註冊'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="glass-card p-6 space-y-4">
        {mode === 'register' && (
          <label className="block">
            <span className="font-mono text-xs text-text-muted">顯示名稱（可留空）</span>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={80}
              className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm"
            />
          </label>
        )}

        <label className="block">
          <span className="font-mono text-xs text-text-muted">電子郵件</span>
          <input
            ref={emailRef}
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm"
          />
        </label>

        <label className="block">
          <span className="font-mono text-xs text-text-muted">
            密碼{mode === 'register' && '（至少 8 個字元）'}
          </span>
          <input
            type="password"
            required
            minLength={mode === 'register' ? 8 : undefined}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm"
          />
        </label>

        {syncNote && (
          <p className="font-mono text-xs text-neon-cyan border border-neon-cyan/30 bg-neon-cyan/5 rounded px-3 py-2">
            {syncNote}
          </p>
        )}

        {error && (
          <p role="alert" className="font-mono text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !email || !password}
          className="w-full py-3 font-display rounded border border-neon-amber text-neon-amber hover:bg-neon-amber/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? '處理中…' : mode === 'login' ? '登入' : '建立帳號'}
        </button>

        {mode === 'login' && (
          <button
            type="button"
            onClick={requestReset}
            disabled={busy}
            className="w-full py-2 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors disabled:opacity-40"
          >
            忘記密碼？
          </button>
        )}
      </form>

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
export default function AccountPage() {
  if (IS_STATIC) return <StaticModeNotice feature="帳號功能" />
  return <AccountPageInner />
}
