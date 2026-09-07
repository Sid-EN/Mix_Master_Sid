/**
 * 搜尋視窗
 *
 * 涵蓋鍵盤操作（不用滑鼠也能選取）、容錯命中的說明文字，
 * 以及打字比請求快時不應被過期回應覆蓋。
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import SearchModal from '@/components/SearchModal'
import type { SearchItem } from '@/lib/searchClient'

jest.mock('@/lib/searchClient', () => ({
  searchAll: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { searchAll } = require('@/lib/searchClient') as {
  searchAll: jest.Mock
}

function item(over: Partial<SearchItem> = {}): SearchItem {
  return {
    source: 'cocktail', id: 'negroni', slug: 'negroni',
    nameEn: 'Negroni', nameZh: '內格羅尼',
    description: 'Italian aperitivo.', tags: ['classic'],
    score: 1, exact: true, ...over,
  }
}

function resolveWith(items: SearchItem[]) {
  searchAll.mockResolvedValue({ total: items.length, items, query: 'q' })
}

async function type(value: string) {
  fireEvent.change(screen.getByRole('combobox'), { target: { value } })
  await act(async () => { jest.advanceTimersByTime(350) })
}

describe('SearchModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    searchAll.mockReset()
  })
  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('關閉時不渲染任何內容', () => {
    const { container } = render(<SearchModal isOpen={false} onClose={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('顯示搜尋結果', async () => {
    resolveWith([item()])
    render(<SearchModal isOpen onClose={jest.fn()} />)
    await type('negroni')
    await waitFor(() => expect(screen.getByText('內格羅尼')).toBeInTheDocument())
  })

  it('空白查詢不觸發搜尋', async () => {
    render(<SearchModal isOpen onClose={jest.fn()} />)
    await type('   ')
    expect(searchAll).not.toHaveBeenCalled()
  })

  it('沒有結果時說明找不到', async () => {
    resolveWith([])
    render(<SearchModal isOpen onClose={jest.fn()} />)
    await type('zzzz')
    await waitFor(() => expect(screen.getByText('找不到相關結果')).toBeInTheDocument())
  })

  it('搜尋失敗時顯示錯誤而非假裝沒有結果', async () => {
    searchAll.mockRejectedValue(new Error('boom'))
    render(<SearchModal isOpen onClose={jest.fn()} />)
    await type('gin')
    await waitFor(() =>
      expect(screen.getByText('搜尋暫時無法使用，請稍後再試')).toBeInTheDocument())
  })

  it('全部是容錯命中時說明原因', async () => {
    resolveWith([item({ exact: false })])
    render(<SearchModal isOpen onClose={jest.fn()} />)
    await type('negrone')
    await waitFor(() =>
      expect(screen.getByText(/沒有完全符合「negrone」的結果/)).toBeInTheDocument())
  })

  it('完全命中時不顯示近似說明', async () => {
    resolveWith([item()])
    render(<SearchModal isOpen onClose={jest.fn()} />)
    await type('negroni')
    await waitFor(() => expect(screen.getByText('內格羅尼')).toBeInTheDocument())
    expect(screen.queryByText(/沒有完全符合/)).not.toBeInTheDocument()
  })

  describe('鍵盤操作', () => {
    const two = [item(), item({ id: 'mojito', slug: 'mojito', nameEn: 'Mojito', nameZh: '莫希托' })]

    async function open() {
      resolveWith(two)
      render(<SearchModal isOpen onClose={jest.fn()} />)
      await type('a')
      await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2))
      return screen.getAllByRole('option')
    }

    it('預設選取第一項', async () => {
      const options = await open()
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('↓ 移到下一項', async () => {
      const options = await open()
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      await waitFor(() => expect(options[1]).toHaveAttribute('aria-selected', 'true'))
    })

    it('↓ 到底時繞回第一項', async () => {
      const options = await open()
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      await waitFor(() => expect(options[0]).toHaveAttribute('aria-selected', 'true'))
    })

    it('↑ 從第一項繞到最後一項', async () => {
      const options = await open()
      fireEvent.keyDown(document, { key: 'ArrowUp' })
      await waitFor(() => expect(options[1]).toHaveAttribute('aria-selected', 'true'))
    })

    it('Enter 開啟選取的項目', async () => {
      const options = await open()
      const clicked = jest.fn(e => e.preventDefault())
      options[1].addEventListener('click', clicked)
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      await waitFor(() => expect(options[1]).toHaveAttribute('aria-selected', 'true'))
      fireEvent.keyDown(document, { key: 'Enter' })
      expect(clicked).toHaveBeenCalled()
    })

    it('ESC 關閉視窗', async () => {
      const onClose = jest.fn()
      resolveWith([])
      render(<SearchModal isOpen onClose={onClose} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    })

    it('沒有結果時方向鍵不會出錯', async () => {
      resolveWith([])
      render(<SearchModal isOpen onClose={jest.fn()} />)
      await type('zzz')
      expect(() => fireEvent.keyDown(document, { key: 'ArrowDown' })).not.toThrow()
    })
  })

  it('較慢的舊查詢不會覆蓋較新的結果', async () => {
    // 使用者打字比請求回來得快；先發出的請求後回來時必須被忽略。
    let resolveSlow: (v: unknown) => void = () => {}
    searchAll
      .mockImplementationOnce(() => new Promise(res => { resolveSlow = res }))
      .mockResolvedValueOnce({
        total: 1, query: 'mojito',
        items: [item({ id: 'mojito', slug: 'mojito', nameEn: 'Mojito', nameZh: '莫希托' })],
      })

    render(<SearchModal isOpen onClose={jest.fn()} />)
    await type('neg')
    await type('mojito')
    await waitFor(() => expect(screen.getByText('莫希托')).toBeInTheDocument())

    await act(async () => {
      resolveSlow({ total: 1, items: [item()], query: 'neg' })
    })
    expect(screen.queryByText('內格羅尼')).not.toBeInTheDocument()
    expect(screen.getByText('莫希托')).toBeInTheDocument()
  })

  it('具備可存取的角色與標籤', async () => {
    resolveWith([item()])
    render(<SearchModal isOpen onClose={jest.fn()} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label')
    await type('negroni')
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
  })
})
