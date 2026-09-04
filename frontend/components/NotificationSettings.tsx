'use client'

import { useCallback, useEffect, useState } from 'react'
import { clientUrl } from '@/lib/api'
import { useAuth } from './AuthContext'

/** Base64URL 公鑰需轉為 Uint8Array 才能傳給 PushManager。 */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

type State = 'loading' | 'unsupported' | 'disabled' | 'off' | 'on' | 'denied'

export default function NotificationSettings() {
  const { token } = useAuth()
  const [state, setState] = useState<State>('loading')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const check = useCallback(async () => {
    if (typeof window === 'undefined'
        || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    try {
      const res = await fetch(clientUrl('/api/v1/push/public-key'))
      const { enabled } = await res.json()
      if (!enabled) { setState('disabled'); return }
      if (Notification.permission === 'denied') { setState('denied'); return }

      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      setState(sub ? 'on' : 'off')
    } catch {
      setState('unsupported')
    }
  }, [])

  useEffect(() => { check() }, [check])

  async function enable() {
    if (!token) return
    setBusy(true); setError(''); setMessage('')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off')
        return
      }

      const { publicKey } = await (await fetch(clientUrl('/api/v1/push/public-key'))).json()
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,          // 規範要求：每次推播都須對使用者可見
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const res = await fetch(clientUrl('/api/v1/push/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(sub.toJSON()),
      })
      if (!res.ok) throw new Error('登錄訂閱失敗')
      setState('on')
      setMessage('已開啟推播通知')
    } catch (e) {
      setError(e instanceof Error ? e.message : '開啟失敗')
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    if (!token) return
    setBusy(true); setError(''); setMessage('')
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await fetch(
          clientUrl(`/api/v1/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`),
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
        )
        await sub.unsubscribe()
      }
      setState('off')
      setMessage('已關閉推播通知')
    } catch (e) {
      setError(e instanceof Error ? e.message : '關閉失敗')
    } finally {
      setBusy(false)
    }
  }

  if (state === 'loading') return null

  const notes: Partial<Record<State, string>> = {
    unsupported: '此瀏覽器不支援推播通知。',
    disabled: '伺服器尚未設定推播金鑰，功能暫不可用。',
    denied: '瀏覽器已封鎖此網站的通知權限，請至瀏覽器設定中重新允許。',
  }

  return (
    <section className="glass-card p-6 mb-6">
      <h2 className="font-display text-lg text-neon-amber mb-3">🔔 推播通知</h2>

      {notes[state] ? (
        <p className="font-mono text-[11px] text-text-muted">{notes[state]}</p>
      ) : (
        <>
          <p className="font-mono text-[11px] text-text-muted mb-4">
            開啟後可接收新配方與活動通知。通知僅送至此裝置，可隨時關閉。
          </p>
          <button
            onClick={state === 'on' ? disable : enable}
            disabled={busy}
            className={`px-4 py-2 font-mono text-xs rounded border transition-colors disabled:opacity-40 ${
              state === 'on'
                ? 'border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10'
                : 'border-charcoal-700 text-text-muted hover:border-neon-amber hover:text-neon-amber'
            }`}
          >
            {busy ? '處理中…' : state === 'on' ? '已開啟 · 點擊關閉' : '開啟推播通知'}
          </button>
        </>
      )}

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
