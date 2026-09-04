/**
 * 同步代理測試
 *
 * ⚠ jsdom 的限制：SyncAgent 以覆寫 localStorage.setItem 的方式偵測變更。
 * 此手法在真實瀏覽器可行（實測 Chromium：賦值會建立自有屬性、攔截器確實被
 * 呼叫、寫入照常保存），但 jsdom 將 Storage 的屬性賦值一律視為「儲存同名
 * 項目」，因此覆寫不會生效。
 *
 * 於是攔截機制本身無法在此驗證，改由 E2E 涵蓋
 * （tests/e2e/account.spec.ts：「登入後的變更會自動上傳至伺服器」）。
 * 此處僅驗證 jsdom 下確實可觀察的部分：掛載時的合併同步、事件發出、
 * 未登入時不動作、以及錯誤不會中斷畫面。
 */
import { act, render } from '@testing-library/react'
import SyncAgent from '@/components/SyncAgent'

let mockToken: string | null = 'test-token'
jest.mock('@/components/AuthContext', () => ({
  useAuth: () => ({ token: mockToken }),
}))

function mockFetch() {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true, status: 200, json: async () => ({}),
  } as Response)) as any
}

beforeEach(() => {
  localStorage.clear()
  mockToken = 'test-token'
  jest.useFakeTimers()
  mockFetch()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('掛載時的合併同步', () => {
  it('登入狀態下會向伺服器取得現有資料', async () => {
    render(<SyncAgent />)
    await act(async () => { jest.advanceTimersByTime(100) })

    const urls = (global.fetch as jest.Mock).mock.calls.map(c => String(c[0]))
    expect(urls.some(u => u.endsWith('/sync'))).toBe(true)
  })

  it('本機有未同步資料時會上傳', async () => {
    localStorage.setItem('mixmaster-my-bar', '["gin"]')
    render(<SyncAgent />)
    await act(async () => { jest.advanceTimersByTime(100) })

    const pushes = (global.fetch as jest.Mock).mock.calls
      .filter(c => String(c[0]).includes('/sync/my-bar'))
    expect(pushes).toHaveLength(1)
    expect(JSON.parse(pushes[0][1].body).value).toEqual(['gin'])
  })

  it('同步完成後發出事件供介面呈現結果', async () => {
    const handler = jest.fn()
    document.addEventListener('mixmaster:synced', handler)
    render(<SyncAgent />)
    await act(async () => { jest.advanceTimersByTime(100) })
    document.removeEventListener('mixmaster:synced', handler)

    expect(handler).toHaveBeenCalled()
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail
    expect(detail).toHaveProperty('pulled')
    expect(detail).toHaveProperty('pushed')
  })
})

describe('未登入時', () => {
  it('不發出任何請求', async () => {
    mockToken = null
    render(<SyncAgent />)
    await act(async () => { jest.advanceTimersByTime(2000) })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('不發出同步事件', async () => {
    mockToken = null
    const handler = jest.fn()
    document.addEventListener('mixmaster:synced', handler)
    render(<SyncAgent />)
    await act(async () => { jest.advanceTimersByTime(2000) })
    document.removeEventListener('mixmaster:synced', handler)
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('錯誤處理', () => {
  it('同步失敗不會拋出而中斷畫面', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any
    render(<SyncAgent />)
    await expect(
      act(async () => { jest.advanceTimersByTime(2000) }),
    ).resolves.not.toThrow()
  })

  it('同步失敗時本機資料維持待同步，下次才會重試', async () => {
    localStorage.setItem('mixmaster-my-bar', '["gin"]')
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any
    render(<SyncAgent />)
    await act(async () => { jest.advanceTimersByTime(2000) })

    const { isDirty } = await import('@/lib/sync')
    expect(isDirty('my-bar')).toBe(true)
  })
})

describe('卸載', () => {
  it('卸載後不再發出請求', async () => {
    const { unmount } = render(<SyncAgent />)
    await act(async () => { jest.advanceTimersByTime(100) })
    unmount()
    ;(global.fetch as jest.Mock).mockClear()

    await act(async () => { jest.advanceTimersByTime(5000) })
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
