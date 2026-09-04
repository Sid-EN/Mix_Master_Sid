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

/* ── 已同步狀態的追蹤 ────────────────────────────────────────
 *
 * 僅在登入時比對本機與伺服器並不足夠：登入後於本機所做的變更若未上傳，
 * 下次登入時會被伺服器的舊資料覆寫而遺失。
 * 因此記錄每個項目「最後成功上傳的內容」，據以判斷本機是否有未同步的變更。
 */
const SYNCED_KEY = 'mixmaster-sync-state'

type SyncedState = Partial<Record<SyncKey, string>>

function readSyncedState(): SyncedState {
  try {
    return JSON.parse(localStorage.getItem(SYNCED_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeSyncedState(state: SyncedState): void {
  try {
    localStorage.setItem(SYNCED_KEY, JSON.stringify(state))
  } catch {
    /* 忽略儲存失敗 */
  }
}

const serialise = (value: unknown) => JSON.stringify(value ?? null)

function markSynced(key: SyncKey, value: unknown): void {
  writeSyncedState({ ...readSyncedState(), [key]: serialise(value) })
}

/** 本機內容是否與最後一次成功上傳的內容不同。 */
export function isDirty(key: SyncKey): boolean {
  const local = readLocal(key)
  if (local === undefined) return false
  return serialise(local) !== readSyncedState()[key]
}

/** 清除同步狀態；登出時呼叫，避免下一位使用者沿用前一位的紀錄。 */
export function clearSyncState(): void {
  try {
    localStorage.removeItem(SYNCED_KEY)
  } catch {
    /* 忽略 */
  }
}

/** 將本機所有有未同步變更的項目推送至伺服器。 */
export async function flushDirty(token: string): Promise<SyncKey[]> {
  const flushed: SyncKey[] = []
  for (const key of SYNCABLE_KEYS) {
    if (!isDirty(key)) continue
    const value = readLocal(key)
    if (value === undefined) continue
    if (await pushKey(token, key, value)) {
      markSynced(key, value)
      flushed.push(key)
    }
  }
  return flushed
}

/**
 * 登入時的合併策略：
 *   - 本機有未同步的變更 → 以本機為準上傳（避免覆蓋使用者剛做的修改）
 *   - 否則伺服器有資料   → 以伺服器為準寫回本機
 *   - 兩者皆無           → 不動作
 *
 * 刻意不做欄位級合併——各項資料形狀不一（陣列、字典、紀錄清單），
 * 通用的合併規則反而容易產生使用者無法預期的結果。
 */
export async function syncOnLogin(token: string): Promise<{ pulled: SyncKey[]; pushed: SyncKey[] }> {
  const remote = await pullAll(token)
  const pulled: SyncKey[] = []
  const pushed: SyncKey[] = []

  for (const key of SYNCABLE_KEYS) {
    const localValue = readLocal(key)
    const remoteValue = remote[key]

    // 本機有未上傳的變更時一律以本機為準，否則會覆寫使用者剛做的修改
    if (localValue !== undefined && isDirty(key)) {
      if (await pushKey(token, key, localValue)) {
        markSynced(key, localValue)
        pushed.push(key)
      }
      continue
    }

    if (remoteValue !== undefined) {
      writeLocal(key, remoteValue)
      markSynced(key, remoteValue)
      pulled.push(key)
    }
  }

  return { pulled, pushed }
}
