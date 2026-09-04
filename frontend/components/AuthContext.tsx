'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { clientUrl } from '@/lib/api'
import { clearSyncState } from '@/lib/sync'

const TOKEN_KEY = 'mixmaster-token'

export interface AuthUser {
  id: number
  email: string
  displayName: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

async function post(path: string, body: unknown) {
  const res = await fetch(clientUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // FastAPI 的驗證錯誤 detail 為陣列，需轉成可讀訊息
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? detail.map((d: any) => d.msg).join('；')
      : detail || `請求失敗（${res.status}）`
    throw new Error(message)
  }
  return data
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  // ready 用於區分「尚未確認登入狀態」與「確認為未登入」，
  // 否則畫面會在載入期間閃現未登入樣貌
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readToken()
    if (!stored) {
      setReady(true)
      return
    }
    fetch(clientUrl('/api/v1/auth/me'), {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('token invalid'))))
      .then((u: AuthUser) => {
        setUser(u)
        setToken(stored)
      })
      .catch(() => {
        // 權杖過期或帳號已刪除：清掉以免每次載入都重試
        try { localStorage.removeItem(TOKEN_KEY) } catch { /* 無痕模式可能拋錯 */ }
      })
      .finally(() => setReady(true))
  }, [])

  const persist = useCallback((accessToken: string, u: AuthUser) => {
    try { localStorage.setItem(TOKEN_KEY, accessToken) } catch { /* 忽略儲存失敗 */ }
    setToken(accessToken)
    setUser(u)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await post('/api/v1/auth/login', { email, password })
    persist(data.access_token, data.user)
  }, [persist])

  const register = useCallback(async (email: string, password: string, displayName = '') => {
    const data = await post('/api/v1/auth/register', { email, password, displayName })
    persist(data.access_token, data.user)
  }, [persist])

  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* 忽略 */ }
    // 清除同步狀態，避免下一位登入者沿用前一位的已同步紀錄
    clearSyncState()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, ready, login, register, logout }),
    [user, token, ready, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必須在 AuthProvider 之內使用')
  return ctx
}
