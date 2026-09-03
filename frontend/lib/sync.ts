/**
 * 使用者資料跨裝置同步
 *
 * 未登入時資料仍存於 localStorage（與原本行為相同）；登入後改以伺服器為準，
 * 並在首次登入時把本機既有資料上傳，避免使用者原有的酒櫃與收藏憑空消失。
 */
import { clientUrl } from './api'

/** 需要跨裝置同步的項目。theme 與 locale 屬單一裝置偏好，刻意排除。 */
export const SYNCABLE_KEYS = [
  'favorites',
  'my-bar',
  'progress',
  'flavor-pref',
  'quiz-history',
  'personality',
] as const

export type SyncKey = (typeof SYNCABLE_KEYS)[number]

/** localStorage 的鍵一律以 mixmaster- 為前綴。 */
export const storageKey = (key: SyncKey) => `mixmaster-${key}`

function readLocal(key: SyncKey): unknown | undefined {
  try {
    const raw = localStorage.getItem(storageKey(key))
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function writeLocal(key: SyncKey, value: unknown): void {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch {
    /* 私密瀏覽或儲存空間已滿時忽略 */
  }
}

async function authed(path: string, token: string, init: RequestInit = {}) {
  return fetch(clientUrl(path), {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

/** 將單一項目寫入伺服器；失敗不拋出，避免打斷使用者操作。 */
export async function pushKey(token: string, key: SyncKey, value: unknown): Promise<boolean> {
  try {
    const res = await authed(`/api/v1/sync/${key}`, token, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** 取得伺服器上的全部同步資料。 */
export async function pullAll(token: string): Promise<Partial<Record<SyncKey, unknown>>> {
  try {
    const res = await authed('/api/v1/sync', token)
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}

/**
 * 登入後的合併策略：伺服器已有的項目以伺服器為準寫回本機；
 * 伺服器沒有、但本機有的項目則上傳。
 *
 * 刻意不做欄位級合併——各項資料形狀不一（陣列、字典、紀錄清單），
 * 通用的合併規則反而容易產生使用者無法預期的結果。
 */
export async function syncOnLogin(token: string): Promise<{ pulled: SyncKey[]; pushed: SyncKey[] }> {
  const remote = await pullAll(token)
  const pulled: SyncKey[] = []
  const pushed: SyncKey[] = []

  for (const key of SYNCABLE_KEYS) {
    const remoteValue = remote[key]
    if (remoteValue !== undefined) {
      writeLocal(key, remoteValue)
      pulled.push(key)
      continue
    }
    const localValue = readLocal(key)
    if (localValue !== undefined) {
      if (await pushKey(token, key, localValue)) pushed.push(key)
    }
  }

  return { pulled, pushed }
}
