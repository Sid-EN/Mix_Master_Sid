/**
 * 伺服器端取值的逾時保護
 *
 * 各頁面都寫了 try/catch 準備退回預設內容，但那個 catch 在最需要的時候
 * 不會觸發：後端休眠冷啟動時 TCP 連線是成功的，只是回應要等數十秒——
 * fetch 不拋錯、只是一直等，整頁跟著卡到平台的函式逾時為止。
 */
import { fetchWithTimeout, DECORATIVE_TIMEOUT_MS, CONTENT_TIMEOUT_MS } from '@/lib/api'

describe('fetchWithTimeout', () => {
  afterEach(() => { jest.restoreAllMocks() })

  it('正常回應時原樣回傳，不改變既有行為', async () => {
    const res = { ok: true, status: 200 } as Response
    global.fetch = jest.fn(() => Promise.resolve(res)) as any
    await expect(fetchWithTimeout('/x', 1000)).resolves.toBe(res)
  })

  it('把 init 一併傳下去，並附上中止訊號', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true } as Response)) as any
    await fetchWithTimeout('/x', 1000, { cache: 'no-store' })
    const [, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(init.cache).toBe('no-store')
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('對方遲遲不回應時會中止，讓呼叫端的 catch 得以生效', async () => {
    // 真正的重點：沒有逾時的話，這個 promise 永遠不會 settle
    global.fetch = jest.fn((_url, init: any) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () =>
          reject(new DOMException('The operation was aborted.', 'TimeoutError')))
      })) as any

    await expect(fetchWithTimeout('/slow', 30)).rejects.toThrow(/abort/i)
  })

  it('中止訊號在時限內尚未觸發', async () => {
    let captured: AbortSignal | null = null
    global.fetch = jest.fn((_url, init: any) => {
      captured = init.signal
      return Promise.resolve({ ok: true } as Response)
    }) as any
    await fetchWithTimeout('/x', 5000)
    expect(captured!.aborted).toBe(false)
  })

  it('裝飾用的時限短於內容用的時限', () => {
    // 首頁的統計數字等不到就用預設值，不值得讓整頁停住；
    // 頁面主要內容則給得寬鬆，冷啟動之外的慢查詢仍應成功
    expect(DECORATIVE_TIMEOUT_MS).toBeLessThan(CONTENT_TIMEOUT_MS)
    expect(DECORATIVE_TIMEOUT_MS).toBeGreaterThan(0)
  })
})
