'use client'

import { useEffect } from 'react'
import { useAuth } from './AuthContext'
import { SYNCABLE_KEYS, type SyncKey, flushDirty, syncOnLogin } from '@/lib/sync'

const DEBOUNCE_MS = 1500
export const SYNC_EVENT = 'mixmaster:synced' 
const SYNCABLE_STORAGE_KEYS = new Set(SYNCABLE_KEYS.map(k => `mixmaster-${k}`))

/**
 * 登入期間持續將本機變更同步至伺服器。
 *
 * 六項功能各自直接寫入 localStorage，若只在登入時同步，登入後的變更永遠
 * 不會上傳，下次登入還會被伺服器的舊資料覆寫。
 *
 * 這裡攔截 localStorage 的寫入以偵測變更：同分頁的寫入不會觸發 storage
 * 事件，因此無法改用事件監聽；攔截可讓六項功能維持原樣不必逐一改寫。
 * 元件卸載時會還原原本的方法。
 *
 * 同步一律由本元件單一負責。先前帳號頁也會自行呼叫 syncOnLogin，兩條路徑
 * 同時執行會產生競態：pullAll 取得伺服器舊值後，另一條路徑的推送把資料標記
 * 為已同步，isDirty 隨即變為 false，最後便以那份舊快照覆寫本機。
 */
export default function SyncAgent() {
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    let timer: ReturnType<typeof setTimeout> | null = null
    let disposed = false

    const flush = () => {
      if (disposed) return
      flushDirty(token).catch(() => {
        /* 離線或伺服器暫時無回應；變更仍標記為未同步，下次再試 */
      })
    }

    const schedule = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(flush, DEBOUNCE_MS)
    }

    const original = localStorage.setItem.bind(localStorage)
    const originalRemove = localStorage.removeItem.bind(localStorage)

    localStorage.setItem = (key: string, value: string) => {
      original(key, value)
      if (SYNCABLE_STORAGE_KEYS.has(key)) schedule()
    }
    localStorage.removeItem = (key: string) => {
      originalRemove(key)
      if (SYNCABLE_STORAGE_KEYS.has(key)) schedule()
    }

    // 離開分頁前盡力送出，避免關閉視窗時遺失最後的變更
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHidden)

    // 登入當下先做一次合併（本機有未同步變更則上傳，否則取回伺服器資料），
    // 完成後才開始監聽後續變更，避免與其他同步路徑競態。
    syncOnLogin(token)
      .then(({ pulled, pushed }) => {
        if (disposed) return
        document.dispatchEvent(
          new CustomEvent(SYNC_EVENT, { detail: { pulled, pushed } }),
        )
      })
      .catch(() => {
        /* 離線時略過；後續變更仍會被標記為未同步 */
      })

    return () => {
      disposed = true
      if (timer) clearTimeout(timer)
      localStorage.setItem = original
      localStorage.removeItem = originalRemove
      document.removeEventListener('visibilitychange', onHidden)
    }
  }, [token])

  return null
}

export type { SyncKey }
