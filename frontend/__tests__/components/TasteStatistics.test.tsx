/**
 * 口味統計區塊
 *
 * 重點：沒有紀錄時給出可行動的引導，而不是一堆 0；
 * 有紀錄時明白說出是「依實際行為推導」而非自填偏好。
 */
import { render, screen, waitFor } from '@testing-library/react'
import TasteStatistics from '@/components/TasteStatistics'
import { resetRecipeData } from '@/lib/recipeData'

/**
 * 後端 /api/v1/recipes 的回應形狀：materials 已解析出名稱，
 * 外層為 { items: [...] }。形狀不符時元件會收到空清單，
 * 測試就會在「沒有紀錄」的分支通過，等於什麼都沒驗到。
 */
const API_RESPONSE = {
  items: [
    {
      id: 'sour', slug: 'sour', nameZh: '酸酒', method: 'shake', tags: ['sour'],
      ingredients: [
        { slug: 'rum', amount: 2, unit: 'oz', name: 'Rum', nameZh: '蘭姆酒' },
        { slug: 'lime', amount: 1, unit: 'oz', name: 'Lime Juice', nameZh: '萊姆汁' },
      ],
      flavorProfile: { acid: 0.9, sweet: 0.5, bitter: 0.05, punch: 0.5 },
    },
    {
      id: 'bitter', slug: 'bitter', nameZh: '苦酒', method: 'stir', tags: ['bitter'],
      ingredients: [{ slug: 'gin', amount: 2, unit: 'oz', name: 'Gin', nameZh: '琴酒' }],
      flavorProfile: { acid: 0.1, sweet: 0.3, bitter: 0.9, punch: 0.7 },
    },
  ],
}

function mockData(ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok, status: ok ? 200 : 500, json: async () => API_RESPONSE,
  }) as unknown as typeof fetch
}

beforeEach(() => {
  localStorage.clear()
  // 配方資料在模組層快取，不重設的話後續測試會沿用前一次的結果
  resetRecipeData()
})

describe('TasteStatistics', () => {
  it('沒有紀錄時給出引導而非一堆 0', async () => {
    mockData()
    render(<TasteStatistics />)
    await waitFor(() =>
      expect(screen.getByText(/還沒有足夠的紀錄/)).toBeInTheDocument())
    expect(screen.getByRole('link', { name: '去逛配方庫' })).toBeInTheDocument()
  })

  it('有收藏時顯示統計與樣本數', async () => {
    localStorage.setItem('mixmaster-favorites', JSON.stringify({ sour: { saved: true } }))
    mockData()
    render(<TasteStatistics />)
    await waitFor(() => expect(screen.getByText(/依據你收藏或做過的 1 款配方/)).toBeInTheDocument())
  })

  it('把做過的配方也計入', async () => {
    localStorage.setItem('mixmaster-progress',
      JSON.stringify({ recipesTried: ['sour', 'bitter'] }))
    mockData()
    render(<TasteStatistics />)
    await waitFor(() => expect(screen.getByText(/2 款配方/)).toBeInTheDocument())
  })

  it('列出最常出現的材料（中文名稱）', async () => {
    localStorage.setItem('mixmaster-favorites', JSON.stringify({ sour: { saved: true } }))
    mockData()
    render(<TasteStatistics />)
    await waitFor(() => expect(screen.getByText('蘭姆酒')).toBeInTheDocument())
    expect(screen.getByText('萊姆汁')).toBeInTheDocument()
  })

  it('以偏離平均最多的面向作為總結', async () => {
    // 這組資料中只收藏酸酒時，苦度的偏離（0.05 對平均 0.475）
    // 比酸度（0.9 對 0.5）更大，因此總結談的是苦度而非酸度。
    localStorage.setItem('mixmaster-favorites', JSON.stringify({ sour: { saved: true } }))
    mockData()
    render(<TasteStatistics />)
    await waitFor(() => expect(screen.getByText('你偏好苦度比平均低的酒')).toBeInTheDocument())
  })

  it('資料載入失敗時說明，而不是顯示空白統計', async () => {
    mockData(false)
    render(<TasteStatistics />)
    await waitFor(() =>
      expect(screen.getByText('配方資料載入失敗，暫時無法統計。')).toBeInTheDocument())
  })

  it('localStorage 內容損毀時不會整頁壞掉', async () => {
    localStorage.setItem('mixmaster-favorites', 'not json')
    mockData()
    render(<TasteStatistics />)
    await waitFor(() => expect(screen.getByText(/還沒有足夠的紀錄/)).toBeInTheDocument())
  })
})
