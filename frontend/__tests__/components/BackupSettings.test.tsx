/**
 * 資料備份介面測試
 *
 * 匯入是外部檔案進入系統的入口，介面需正確處理無效檔案而非當機。
 */
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react'
import BackupSettings from '@/components/BackupSettings'

jest.mock('@/components/AuthContext', () => ({
  useAuth: () => ({ token: 'jwt' }),
}))

const BACKUP = { version: 1, data: { 'my-bar': ['gin'] }, recipes: [] }

function mockFetch(body: any, ok = true) {
  global.fetch = jest.fn(() => Promise.resolve({
    ok, status: ok ? 200 : 422, json: async () => body, text: async () => JSON.stringify(body),
  } as Response)) as any
}

function upload(content: string, name = 'backup.json') {
  const input = screen.getByLabelText('選擇備份檔') as HTMLInputElement
  const file = new File([content], name, { type: 'application/json' })
  // 需經 fireEvent 才會觸發 React 的合成事件
  return act(async () => { fireEvent.change(input, { target: { files: [file] } }) })
}

beforeEach(() => {
  mockFetch(BACKUP)
  // jsdom 未實作下載相關 API
  global.URL.createObjectURL = jest.fn(() => 'blob:mock')
  global.URL.revokeObjectURL = jest.fn()
})

afterEach(() => jest.restoreAllMocks())

describe('介面', () => {
  it('提供匯出與匯入', () => {
    render(<BackupSettings />)
    expect(screen.getByText('匯出備份')).toBeInTheDocument()
    expect(screen.getByText('匯入備份')).toBeInTheDocument()
  })

  it('說明匯入為合併式還原', () => {
    render(<BackupSettings />)
    // 使用者需知道匯入不會清空既有資料
    expect(screen.getByText(/不會刪除現有資料/)).toBeInTheDocument()
  })
})

describe('匯出', () => {
  it('取得資料並建立下載', async () => {
    render(<BackupSettings />)
    await act(async () => { screen.getByText('匯出備份').click() })

    expect(String((global.fetch as jest.Mock).mock.calls[0][0])).toContain('/backup/export')
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('回報匯出的內容數量', async () => {
    render(<BackupSettings />)
    await act(async () => { screen.getByText('匯出備份').click() })
    await waitFor(() => expect(screen.getByText(/已匯出 1 項資料/)).toBeInTheDocument())
  })

  it('失敗時顯示錯誤而非靜默', async () => {
    mockFetch({}, false)
    render(<BackupSettings />)
    await act(async () => { screen.getByText('匯出備份').click() })
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})

describe('匯入', () => {
  it('送出檔案內容並回報結果', async () => {
    render(<BackupSettings />)
    mockFetch({ importedKeys: ['my-bar'], skippedKeys: [], importedRecipes: 2, skippedRecipes: [] })
    await upload(JSON.stringify(BACKUP))
    await waitFor(() => expect(screen.getByText(/已還原 1 項資料/)).toBeInTheDocument())
  })

  it('回報被略過的項目', async () => {
    render(<BackupSettings />)
    mockFetch({ importedKeys: [], skippedKeys: ['arbitrary'], importedRecipes: 0,
                skippedRecipes: ['壞掉的配方'] })
    await upload(JSON.stringify(BACKUP))
    await waitFor(() => expect(screen.getByText(/略過 1 項不支援的資料/)).toBeInTheDocument())
  })

  it('非 JSON 檔案給出明確訊息', async () => {
    render(<BackupSettings />)
    await upload('this is not json')
    await waitFor(() =>
      expect(screen.getByText('檔案不是有效的 JSON')).toBeInTheDocument())
  })

  it('伺服器拒絕時顯示其訊息', async () => {
    render(<BackupSettings />)
    mockFetch({ detail: '備份格式版本 999 高於本系統支援的 1' }, false)
    await upload(JSON.stringify({ version: 999 }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/999/))
  })
})
