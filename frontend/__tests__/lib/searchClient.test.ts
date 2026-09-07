/**
 * 搜尋呼叫端
 *
 * 兩條路徑：完整版打 API、靜態版在瀏覽器端比對索引。
 * 重點在於靜態版必須真的能搜尋（GitHub Pages 沒有後端），
 * 且索引只下載一次。
 */
import { searchAll, resetSearchIndex } from '@/lib/searchClient'
import { IS_STATIC } from '@/lib/staticMode'

const INDEX = {
  items: [
    {
      source: 'cocktail', id: 'classic-daiquiri', slug: 'classic-daiquiri',
      nameEn: 'Classic Daiquiri', nameZh: '經典黛綺麗',
      description: 'The perfect rum Sour.', descriptionZh: '完美的蘭姆酸酒。',
      tags: ['classic', 'sour'], ingredients: ['bacardi-rum', 'Fresh Lime Juice'],
    },
    {
      source: 'cocktail', id: 'negroni', slug: 'negroni',
      nameEn: 'Negroni', nameZh: '內格羅尼',
      description: 'Italian aperitivo.', descriptionZh: '義大利開胃酒。',
      tags: ['classic', 'bitter'], ingredients: ['gin', 'campari'],
    },
    {
      source: 'prep', id: 'simple-syrup', slug: 'simple-syrup',
      nameEn: 'Simple Syrup', nameZh: '簡易糖漿',
      description: 'One to one sugar and water.', descriptionZh: '一比一糖水。',
      tags: ['syrup'], ingredients: ['白砂糖', 'White Sugar'],
    },
  ],
}

function mockIndex() {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => INDEX,
  })
  global.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

describe('searchAll（靜態版）', () => {
  beforeEach(() => {
    resetSearchIndex()
    jest.restoreAllMocks()
  })

  // 測試環境未設定 NEXT_PUBLIC_STATIC_MODE，走的是 API 分支；
  // 這裡直接驗證瀏覽器端比對的那條路徑仍需模擬靜態模式。
  it('測試環境預設為完整版', () => {
    expect(IS_STATIC).toBe(false)
  })

  it('空查詢不發出任何請求', async () => {
    const fetchMock = mockIndex()
    const res = await searchAll('   ')
    expect(res.total).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('完整版呼叫後端 API', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ total: 1, items: [], query: 'gin' }),
    })
    global.fetch = fetchMock as unknown as typeof fetch
    await searchAll('gin')
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/search?q=gin'))
  })

  it('查詢字串有正確編碼', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ total: 0, items: [], query: '' }),
    })
    global.fetch = fetchMock as unknown as typeof fetch
    await searchAll('gin & tonic')
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('gin%20%26%20tonic'))
  })

  it('API 失敗時拋出，讓呼叫端能顯示錯誤', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch
    await expect(searchAll('gin')).rejects.toThrow()
  })
})

// 靜態模式由建置期的環境變數決定，測試中改以直接呼叫內部邏輯驗證。
describe('靜態索引比對', () => {
  beforeEach(() => {
    resetSearchIndex()
    jest.resetModules()
  })

  async function staticSearch(q: string, limit = 10) {
    jest.resetModules()
    process.env.NEXT_PUBLIC_STATIC_MODE = '1'
    const mod = await import('@/lib/searchClient')
    mod.resetSearchIndex()
    return mod.searchAll(q, limit)
  }

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_STATIC_MODE
  })

  it('找得到完全符合的配方', async () => {
    mockIndex()
    const res = await staticSearch('daiquiri')
    expect(res.items[0].nameEn).toBe('Classic Daiquiri')
    expect(res.items[0].exact).toBe(true)
  })

  it('打錯字仍找得到，並標示為近似結果', async () => {
    mockIndex()
    const res = await staticSearch('daquiri')
    expect(res.items[0].nameEn).toBe('Classic Daiquiri')
    expect(res.items[0].exact).toBe(false)
  })

  it('中文查詢有效', async () => {
    mockIndex()
    const res = await staticSearch('黛綺麗')
    expect(res.total).toBe(1)
  })

  it('可搜尋材料', async () => {
    mockIndex()
    const res = await staticSearch('campari')
    expect(res.items.map(i => i.nameEn)).toEqual(['Negroni'])
  })

  it('備料也在索引中', async () => {
    mockIndex()
    const res = await staticSearch('syrup')
    expect(res.items[0].source).toBe('prep')
  })

  it('不相關的查詢沒有結果', async () => {
    mockIndex()
    expect((await staticSearch('zzzzqqq')).total).toBe(0)
  })

  it('依相關性排序', async () => {
    mockIndex()
    const res = await staticSearch('classic')
    const scores = res.items.map(i => i.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('limit 限制回傳數量但 total 仍為全部', async () => {
    mockIndex()
    const res = await staticSearch('classic', 1)
    expect(res.items).toHaveLength(1)
    expect(res.total).toBeGreaterThan(1)
  })

  it('索引只下載一次', async () => {
    const fetchMock = mockIndex()
    jest.resetModules()
    process.env.NEXT_PUBLIC_STATIC_MODE = '1'
    const mod = await import('@/lib/searchClient')
    mod.resetSearchIndex()
    await mod.searchAll('gin')
    await mod.searchAll('rum')
    await mod.searchAll('daiquiri')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('索引載入失敗後下一次搜尋會重試', async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValue({ ok: true, status: 200, json: async () => INDEX })
    global.fetch = fetchMock as unknown as typeof fetch
    jest.resetModules()
    process.env.NEXT_PUBLIC_STATIC_MODE = '1'
    const mod = await import('@/lib/searchClient')
    mod.resetSearchIndex()
    await expect(mod.searchAll('gin')).rejects.toThrow()
    const res = await mod.searchAll('negroni')
    expect(res.total).toBe(1)
  })
})
