/**
 * 材料目錄載入
 *
 * 「我的酒櫃」原本寫死呼叫 /api/v1/ingredients。靜態版（GitHub Pages）
 * 沒有後端可回應，整頁只剩「無法載入資料庫」——酒櫃、可調配方、
 * 缺料清單全部消失，而本機與 CI 都跑得起後端，兩邊都測不出來。
 */
import { loadIngredients, resetIngredients } from '@/lib/ingredientData'

const RAW = [{
  id: 'tanqueray-gin', name: 'Tanqueray Gin', nameZh: '坦奎瑞琴酒',
  category: 'gin', abv: 47.3, colorHex: '#E8F4F8', flavorTags: ['juniper'],
}]

function mockFetch(items: any[]) {
  return jest.fn(() => Promise.resolve({
    ok: true, json: async () => ({ items }),
  } as Response)) as any
}

beforeEach(() => {
  resetIngredients()
  jest.restoreAllMocks()
})

describe('loadIngredients', () => {
  it('回傳正規化後的材料', async () => {
    global.fetch = mockFetch(RAW)
    expect(await loadIngredients()).toEqual([{
      id: 'tanqueray-gin', name: 'Tanqueray Gin', nameZh: '坦奎瑞琴酒',
      category: 'gin', abv: 47.3, colorHex: '#E8F4F8', flavorTags: ['juniper'],
    }])
  })

  it('缺欄位時給得出合理預設，不會讓整頁掛掉', async () => {
    global.fetch = mockFetch([{ slug: 'x' }])
    expect(await loadIngredients()).toEqual([{
      id: 'x', name: '', nameZh: '', category: 'other',
      abv: null, colorHex: null, flavorTags: [],
    }])
  })

  it('重複呼叫只發出一個請求', async () => {
    global.fetch = mockFetch(RAW)
    await Promise.all([loadIngredients(), loadIngredients(), loadIngredients()])
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('失敗後可重試（不留下壞掉的 promise）', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 503 } as Response)) as any
    await expect(loadIngredients()).rejects.toThrow('材料載入失敗：503')

    global.fetch = mockFetch(RAW)
    await expect(loadIngredients()).resolves.toHaveLength(1)
  })

  it('完整版走後端端點', async () => {
    global.fetch = mockFetch(RAW)
    await loadIngredients()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/ingredients'))
  })
})
