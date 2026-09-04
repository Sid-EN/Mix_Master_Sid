/**
 * 同步邏輯測試
 *
 * 這是全專案風險最高的一段：先前因為只在登入時同步，
 * 登入後的變更永不上傳且會被伺服器舊資料覆寫，造成實際的資料遺失。
 * 這些測試鎖住修復後的行為。
 */
import {
  SYNCABLE_KEYS,
  clearSyncState,
  flushDirty,
  isDirty,
  pullAll,
  pushKey,
  storageKey,
  syncOnLogin,
} from '@/lib/sync'

const TOKEN = 'test-token'

function setLocal(key: string, value: unknown) {
  localStorage.setItem(storageKey(key as any), JSON.stringify(value))
}

function mockFetch(handler: (url: string, init?: RequestInit) => any) {
  global.fetch = jest.fn((url: any, init?: any) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => handler(String(url), init),
    } as Response),
  ) as any
}

beforeEach(() => {
  localStorage.clear()
  jest.restoreAllMocks()
})

describe('storageKey', () => {
  it('一律加上 mixmaster- 前綴', () => {
    expect(storageKey('my-bar')).toBe('mixmaster-my-bar')
  })

  it('涵蓋所有可同步項目', () => {
    expect(SYNCABLE_KEYS).toEqual(
      expect.arrayContaining(['favorites', 'my-bar', 'progress',
        'flavor-pref', 'quiz-history', 'personality']),
    )
  })

  it('不包含裝置層級的偏好設定', () => {
    // 佈景主題與語言屬單一裝置設定，跨裝置同步只會造成困擾
    expect(SYNCABLE_KEYS).not.toContain('theme' as any)
    expect(SYNCABLE_KEYS).not.toContain('locale' as any)
  })
})

describe('isDirty', () => {
  it('本機無資料時不視為待同步', () => {
    expect(isDirty('my-bar')).toBe(false)
  })

  it('本機有資料但從未同步時視為待同步', () => {
    setLocal('my-bar', ['gin'])
    expect(isDirty('my-bar')).toBe(true)
  })

  it('推送成功後不再視為待同步', async () => {
    setLocal('my-bar', ['gin'])
    mockFetch(() => ({}))
    await flushDirty(TOKEN)
    expect(isDirty('my-bar')).toBe(false)
  })

  it('推送後又修改則再次視為待同步', async () => {
    setLocal('my-bar', ['gin'])
    mockFetch(() => ({}))
    await flushDirty(TOKEN)
    setLocal('my-bar', ['gin', 'campari'])
    expect(isDirty('my-bar')).toBe(true)
  })

  it('內容相同但順序不同仍視為變更', async () => {
    setLocal('my-bar', ['a', 'b'])
    mockFetch(() => ({}))
    await flushDirty(TOKEN)
    setLocal('my-bar', ['b', 'a'])
    expect(isDirty('my-bar')).toBe(true)
  })
})

describe('pushKey', () => {
  it('成功時回傳 true', async () => {
    mockFetch(() => ({}))
    expect(await pushKey(TOKEN, 'my-bar', ['gin'])).toBe(true)
  })

  it('網路錯誤時回傳 false 而非拋出', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any
    expect(await pushKey(TOKEN, 'my-bar', ['gin'])).toBe(false)
  })

  it('伺服器回錯時回傳 false', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 500 } as Response)) as any
    expect(await pushKey(TOKEN, 'my-bar', ['gin'])).toBe(false)
  })
})

describe('flushDirty', () => {
  it('只推送有變更的項目', async () => {
    setLocal('my-bar', ['gin'])
    setLocal('favorites', { negroni: { rating: 5 } })
    mockFetch(() => ({}))
    const flushed = await flushDirty(TOKEN)
    expect(flushed.sort()).toEqual(['favorites', 'my-bar'])
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('沒有變更時不發出任何請求', async () => {
    mockFetch(() => ({}))
    expect(await flushDirty(TOKEN)).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('推送失敗的項目維持待同步狀態', async () => {
    setLocal('my-bar', ['gin'])
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any
    expect(await flushDirty(TOKEN)).toEqual([])
    // 失敗後仍應待同步，下次才會重試
    expect(isDirty('my-bar')).toBe(true)
  })
})

describe('pullAll', () => {
  it('回傳伺服器上的資料', async () => {
    mockFetch(() => ({ 'my-bar': ['campari'] }))
    expect(await pullAll(TOKEN)).toEqual({ 'my-bar': ['campari'] })
  })

  it('失敗時回傳空物件而非拋出', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any
    expect(await pullAll(TOKEN)).toEqual({})
  })
})

describe('syncOnLogin', () => {
  it('本機為空時取回伺服器資料', async () => {
    mockFetch(url => (url.endsWith('/sync') ? { 'my-bar': ['campari'] } : {}))
    const { pulled } = await syncOnLogin(TOKEN)
    expect(pulled).toContain('my-bar')
    expect(JSON.parse(localStorage.getItem('mixmaster-my-bar')!)).toEqual(['campari'])
  })

  it('伺服器為空時上傳本機資料', async () => {
    setLocal('my-bar', ['gin'])
    mockFetch(() => ({}))
    const { pushed } = await syncOnLogin(TOKEN)
    expect(pushed).toContain('my-bar')
  })

  it('本機有未同步變更時以本機為準，不被伺服器舊資料覆寫', async () => {
    // 迴歸：這正是先前造成資料遺失的情境
    setLocal('my-bar', ['gin', 'campari', 'aperol'])
    mockFetch(url => (url.endsWith('/sync') ? { 'my-bar': ['gin'] } : {}))

    const { pushed, pulled } = await syncOnLogin(TOKEN)
    expect(pushed).toContain('my-bar')
    expect(pulled).not.toContain('my-bar')
    expect(JSON.parse(localStorage.getItem('mixmaster-my-bar')!))
      .toEqual(['gin', 'campari', 'aperol'])
  })

  it('本機已同步過則以伺服器為準', async () => {
    setLocal('my-bar', ['gin'])
    mockFetch(() => ({}))
    await flushDirty(TOKEN)                       // 標記為已同步

    mockFetch(url => (url.endsWith('/sync') ? { 'my-bar': ['campari'] } : {}))
    const { pulled } = await syncOnLogin(TOKEN)
    expect(pulled).toContain('my-bar')
    expect(JSON.parse(localStorage.getItem('mixmaster-my-bar')!)).toEqual(['campari'])
  })

  it('兩邊皆無資料時不動作', async () => {
    mockFetch(() => ({}))
    const { pulled, pushed } = await syncOnLogin(TOKEN)
    expect(pulled).toEqual([])
    expect(pushed).toEqual([])
  })
})

describe('clearSyncState', () => {
  it('清除後所有本機資料重新視為待同步', async () => {
    setLocal('my-bar', ['gin'])
    mockFetch(() => ({}))
    await flushDirty(TOKEN)
    expect(isDirty('my-bar')).toBe(false)

    // 登出時清除，避免下一位登入者沿用前一位的已同步紀錄
    clearSyncState()
    expect(isDirty('my-bar')).toBe(true)
  })
})

describe('儲存空間異常', () => {
  it('localStorage 讀取失敗時不拋出', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => isDirty('my-bar')).not.toThrow()
  })

  it('內容毀損時不拋出', () => {
    localStorage.setItem('mixmaster-my-bar', '{ not json')
    expect(() => isDirty('my-bar')).not.toThrow()
  })
})
