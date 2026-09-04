/**
 * 配方清單快取測試
 *
 * 首頁三個元件原本各自抓取完整清單，同一份 121 KB 的 JSON 被下載三次。
 * 此快取確保同一次載入內只發出一個請求。
 */
import { clearRecipeCache, fetchRecipes } from '@/lib/recipeCache'

function mockFetch(items: any[], delay = 0) {
  return jest.fn(() => new Promise(resolve =>
    setTimeout(() => resolve({
      ok: true,
      json: async () => ({ items }),
    } as Response), delay),
  )) as any
}

beforeEach(() => {
  clearRecipeCache()
  jest.restoreAllMocks()
})

describe('fetchRecipes', () => {
  it('回傳配方清單', async () => {
    global.fetch = mockFetch([{ id: 'a' }, { id: 'b' }])
    expect(await fetchRecipes()).toEqual([{ id: 'a' }, { id: 'b' }])
  })

  it('重複呼叫只發出一個請求', async () => {
    global.fetch = mockFetch([{ id: 'a' }])
    await fetchRecipes()
    await fetchRecipes()
    await fetchRecipes()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('同時併發呼叫共用同一個請求', async () => {
    // 首頁三個元件會在同一輪 render 中各自呼叫
    global.fetch = mockFetch([{ id: 'a' }], 20)
    const [a, b, c] = await Promise.all([fetchRecipes(), fetchRecipes(), fetchRecipes()])
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
    expect(b).toBe(c)
  })

  it('只取摘要欄位以縮小傳輸量', async () => {
    global.fetch = mockFetch([])
    await fetchRecipes()
    expect(String((global.fetch as jest.Mock).mock.calls[0][0])).toContain('fields=summary')
  })

  it('失敗後可重試而非永久卡住', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any
    await expect(fetchRecipes()).rejects.toThrow()

    global.fetch = mockFetch([{ id: 'a' }])
    expect(await fetchRecipes()).toEqual([{ id: 'a' }])
  })

  it('伺服器回錯時拋出', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 500 } as Response)) as any
    await expect(fetchRecipes()).rejects.toThrow()
  })

  it('回應缺少 items 時視為空清單', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({}) } as Response)) as any
    expect(await fetchRecipes()).toEqual([])
  })

  it('清除後會重新取得', async () => {
    global.fetch = mockFetch([{ id: 'a' }])
    await fetchRecipes()
    clearRecipeCache()
    await fetchRecipes()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
