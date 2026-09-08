/**
 * 完整離線
 *
 * Service Worker 原本只快取「造訪過」的頁面：出門在外想查一杯沒看過的酒
 * 就沒轍。此模組讓使用者主動把全部配方下載下來。
 *
 * 下載的內容存在獨立的快取，不會被執行期快取的淘汰機制清掉——
 * 特意下載的東西不該因為多逛了幾頁就消失。
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export interface OfflineProgress {
  done: number
  total: number
  failed: number
  finished: boolean
}

export function isSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

async function activeWorker(): Promise<ServiceWorker | null> {
  if (!isSupported()) return null
  const registration = await navigator.serviceWorker.ready
  return registration.active
}

/** 送出訊息並等待 Service Worker 以 MessageChannel 回覆 */
function ask<T>(worker: ServiceWorker, message: object, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()
    const timer = setTimeout(() => reject(new Error('Service Worker 沒有回應')), timeoutMs)
    channel.port1.onmessage = event => {
      clearTimeout(timer)
      resolve(event.data as T)
    }
    worker.postMessage(message, [channel.port2])
  })
}

/** 已下載的離線項目數 */
export async function offlineCount(): Promise<number | null> {
  const worker = await activeWorker()
  if (!worker) return null
  try {
    const res = await ask<{ count: number }>(worker, { type: 'OFFLINE_STATUS' })
    return res.count
  } catch {
    return null
  }
}

/**
 * 要下載的網址清單。
 *
 * 配方詳情頁與其資料檔；靜態版的路徑帶結尾斜線（trailingSlash: true），
 * 少了它 GitHub Pages 會回 301 而存進快取的是重新導向，離線時打不開。
 */
export function offlineUrls(slugs: string[], trailingSlash: boolean): string[] {
  const suffix = trailingSlash ? '/' : ''
  return [
    `${BASE_PATH}/`,
    `${BASE_PATH}/recipes${suffix}`,
    `${BASE_PATH}/search-index.json`,
    `${BASE_PATH}/recipes-summary.json`,
    `${BASE_PATH}/recipe-data.json`,
    `${BASE_PATH}/ingredients.json`,
    ...slugs.map(slug => `${BASE_PATH}/recipes/${slug}${suffix}`),
  ]
}

/**
 * 開始下載，並在過程中回報進度。
 *
 * 逐一抓取而非一次全部併發：一口氣送出上百個請求會拖垮行動網路，
 * 也會讓進度顯示變成毫無資訊的「等待中」。
 */
export async function downloadOffline(
  urls: string[],
  onProgress: (p: OfflineProgress) => void,
): Promise<OfflineProgress> {
  const worker = await activeWorker()
  if (!worker) throw new Error('此瀏覽器不支援離線下載')

  return new Promise<OfflineProgress>(resolve => {
    const channel = new MessageChannel()
    channel.port1.onmessage = event => {
      const data = event.data as {
        type: string; done: number; total: number; failed: number
      }
      const progress: OfflineProgress = {
        done: data.done,
        total: data.total,
        failed: data.failed,
        finished: data.type === 'OFFLINE_DONE',
      }
      onProgress(progress)
      if (progress.finished) resolve(progress)
    }
    worker.postMessage({ type: 'DOWNLOAD_OFFLINE', urls }, [channel.port2])
  })
}

/** 清除已下載的離線內容 */
export async function clearOffline(): Promise<number | null> {
  const worker = await activeWorker()
  if (!worker) return null
  try {
    const res = await ask<{ count: number }>(worker, { type: 'CLEAR_OFFLINE' })
    return res.count
  } catch {
    return null
  }
}
