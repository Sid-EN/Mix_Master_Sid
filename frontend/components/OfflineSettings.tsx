'use client'

/**
 * 離線內容設定
 *
 * Service Worker 原本只快取造訪過的頁面；出門在外想查一杯沒看過的酒
 * 就沒轍。這裡讓使用者主動把全部配方下載下來。
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchRecipes } from '@/lib/recipeCache'
import { IS_STATIC } from '@/lib/staticMode'
import {
  clearOffline,
  downloadOffline,
  isSupported,
  offlineCount,
  offlineUrls,
  type OfflineProgress,
} from '@/lib/offline'
import { userMessage } from '@/lib/errorMessage'

export default function OfflineSettings() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [cached, setCached] = useState<number | null>(null)
  const [progress, setProgress] = useState<OfflineProgress | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [online, setOnline] = useState(true)

  const refresh = useCallback(async () => {
    setCached(await offlineCount())
  }, [])

  useEffect(() => {
    setSupported(isSupported())
    setOnline(navigator.onLine)
    refresh()
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [refresh])

  const start = async () => {
    setBusy(true)
    setError('')
    setProgress(null)
    try {
      const recipes = await fetchRecipes()
      const slugs = recipes.map(r => r.slug ?? r.id).filter(Boolean)
      // 靜態版的網址帶結尾斜線；少了它會存到重新導向而非頁面本身
      await downloadOffline(offlineUrls(slugs, IS_STATIC), setProgress)
      await refresh()
    } catch (err) {
      setError(userMessage(err, '下載失敗，請稍後再試'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await clearOffline()
      await refresh()
      setProgress(null)
    } finally {
      setBusy(false)
    }
  }

  if (supported === null) return null

  if (!supported) {
    return (
      <p className="font-mono text-xs text-charcoal-500">
        此瀏覽器不支援離線儲存。
      </p>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-neon-amber'}`}
          aria-hidden="true"
        />
        <p className="font-mono text-xs text-text-muted">
          {online ? '目前在線上' : '目前離線中——已下載的內容仍可閱讀'}
        </p>
      </div>

      <p className="text-text-secondary text-sm mb-1">
        下載全部配方後，沒有網路也能查閱——包含你還沒看過的頁面。
      </p>
      <p className="font-mono text-[11px] text-charcoal-500 mb-4">
        {cached === null
          ? '尚未取得離線狀態'
          : cached === 0
            ? '尚未下載離線內容'
            : `已下載 ${cached} 個項目`}
      </p>

      {progress && (
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[11px] text-charcoal-500 mb-1">
            <span>{progress.finished ? '下載完成' : '下載中…'}</span>
            <span>{progress.done} / {progress.total}</span>
          </div>
          <div
            className="h-2 bg-charcoal-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress.done}
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-label="離線內容下載進度"
          >
            <div
              className="h-full bg-gradient-to-r from-neon-amber to-neon-cyan transition-all"
              style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }}
            />
          </div>
          {/* 失敗數如實顯示；靜靜略過會讓人以為全部都存好了 */}
          {progress.failed > 0 && (
            <p className="font-mono text-[11px] text-neon-amber mt-1">
              {progress.failed} 個項目下載失敗，可稍後重試
            </p>
          )}
        </div>
      )}

      {error && <p role="alert" className="font-mono text-xs text-red-400 mb-3">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={start}
          disabled={busy || !online}
          className="px-4 py-2 font-mono text-xs border border-neon-amber/60 text-neon-amber
                     rounded hover:bg-neon-amber/10 transition-colors disabled:opacity-40
                     disabled:cursor-not-allowed"
        >
          {busy ? '處理中…' : cached ? '重新下載' : '下載離線內容'}
        </button>
        {!!cached && (
          <button
            onClick={remove}
            disabled={busy}
            className="px-4 py-2 font-mono text-xs border border-charcoal-700 text-text-muted
                       rounded hover:border-red-400 hover:text-red-400 transition-colors
                       disabled:opacity-40"
          >
            清除離線內容
          </button>
        )}
      </div>
      {!online && (
        <p className="font-mono text-[11px] text-charcoal-500 mt-2">
          離線時無法下載新內容。
        </p>
      )}
    </div>
  )
}
