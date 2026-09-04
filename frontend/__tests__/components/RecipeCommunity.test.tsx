/**
 * 社群互動元件測試
 *
 * 重點在於未登入者的可見範圍與互動限制：可瀏覽評分與留言，但不可互動。
 */
import { render, screen, waitFor, act } from '@testing-library/react'
import RecipeCommunity from '@/components/RecipeCommunity'

let mockToken: string | null = null
jest.mock('@/components/AuthContext', () => ({
  useAuth: () => ({ token: mockToken, ready: true }),
}))

const RATINGS = { count: 2, average: 4.5, myScore: null }
const COMMENTS = {
  total: 1,
  items: [{ id: 1, body: '很順口', author: '訪客', isAuthor: false,
            createdAt: '2026-09-04T00:00:00+00:00' }],
}

function mockApi(overrides: Record<string, any> = {}) {
  global.fetch = jest.fn((url: any) => {
    const u = String(url)
    const body = u.includes('/ratings') ? { ...RATINGS, ...overrides.ratings }
      : u.includes('/comments') ? { ...COMMENTS, ...overrides.comments }
      : {}
    return Promise.resolve({ ok: true, status: 200, json: async () => body } as Response)
  }) as any
}

beforeEach(() => {
  mockToken = null
  mockApi()
})

afterEach(() => jest.restoreAllMocks())

describe('未登入', () => {
  it('可看到評分彙總', async () => {
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByText(/平均 4.5/)).toBeInTheDocument())
  })

  it('可看到留言內容', async () => {
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByText('很順口')).toBeInTheDocument())
  })

  it('看到登入提示', async () => {
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByText(/後即可評分與留言/)).toBeInTheDocument())
  })

  it('評分按鈕為停用狀態', async () => {
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByLabelText('給 4 星')).toBeDisabled())
  })

  it('不顯示留言輸入框', async () => {
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByText('很順口')).toBeInTheDocument())
    expect(screen.queryByLabelText('留言內容')).not.toBeInTheDocument()
  })
})

describe('已登入', () => {
  beforeEach(() => { mockToken = 'jwt' })

  it('評分按鈕可點按', async () => {
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByLabelText('給 4 星')).toBeEnabled())
  })

  it('顯示留言輸入框', async () => {
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByLabelText('留言內容')).toBeInTheDocument())
  })

  it('點擊星等會送出評分', async () => {
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByLabelText('給 4 星')).toBeEnabled())
    ;(global.fetch as jest.Mock).mockClear()

    await act(async () => { screen.getByLabelText('給 4 星').click() })

    const put = (global.fetch as jest.Mock).mock.calls
      .find(c => c[1]?.method === 'PUT')
    expect(put).toBeDefined()
    expect(JSON.parse(put[1].body).score).toBe(4)
  })

  it('自己已評分時反映於星等', async () => {
    mockApi({ ratings: { myScore: 3 } })
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByLabelText('給 3 星')).toBeInTheDocument())
  })
})

describe('空狀態與錯誤', () => {
  it('尚無評分時明示', async () => {
    mockApi({ ratings: { count: 0, average: null } })
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByText('尚無評分')).toBeInTheDocument())
  })

  it('尚無留言時明示', async () => {
    mockApi({ comments: { total: 0, items: [] } })
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByText('還沒有留言。')).toBeInTheDocument())
  })

  it('載入失敗不會使元件當機', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any
    // 需等待失敗後的狀態更新完成，否則會留下未包在 act 內的更新警告
    await act(async () => { render(<RecipeCommunity shareToken="tok" />) })
    await waitFor(() => expect(screen.getByText('還沒有留言。')).toBeInTheDocument())
  })

  it('標示配方作者的留言', async () => {
    mockApi({ comments: { total: 1, items: [{ ...COMMENTS.items[0], isAuthor: true }] } })
    render(<RecipeCommunity shareToken="tok" />)
    await waitFor(() => expect(screen.getByText('作者')).toBeInTheDocument())
  })
})
