/**
 * 購物清單頁的按鈕行為
 *
 * 針對「點了沒反應」：剪貼簿在非安全來源會被瀏覽器拒絕，
 * 先前只是靜默失敗，使用者完全不知道發生了什麼事。
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ShoppingListPage from '@/app/shopping-list/page'
import { SHOPPING_LIST_KEY } from '@/lib/shoppingList'

const ITEMS = [
  { id: 'gin', name: '琴酒', neededMl: 60, sources: ['Negroni'], done: false, addedAt: '' },
]

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(ITEMS))
})

describe('購物清單', () => {
  it('顯示既有項目', async () => {
    render(<ShoppingListPage />)
    expect(await screen.findByText('琴酒')).toBeInTheDocument()
  })

  it('複製成功時給出回饋', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<ShoppingListPage />)
    fireEvent.click(await screen.findByRole('button', { name: '複製清單' }))
    await waitFor(() => expect(writeText).toHaveBeenCalled())
    expect(await screen.findByRole('button', { name: '已複製' })).toBeInTheDocument()
  })

  it('剪貼簿被拒時改以提示框呈現，而不是毫無反應', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
    })
    const prompt = jest.fn()
    Object.defineProperty(window, 'prompt', { value: prompt, writable: true })
    render(<ShoppingListPage />)
    fireEvent.click(await screen.findByRole('button', { name: '複製清單' }))
    await waitFor(() => expect(prompt).toHaveBeenCalled())
    expect(prompt.mock.calls[0][1]).toContain('琴酒')
  })

  it('未輸入內容時「加入」為停用', async () => {
    render(<ShoppingListPage />)
    expect(await screen.findByRole('button', { name: '加入' })).toBeDisabled()
  })

  it('輸入後「加入」可用且真的加入項目', async () => {
    render(<ShoppingListPage />)
    fireEvent.change(await screen.findByLabelText('新增項目'), { target: { value: '冰塊' } })
    const add = screen.getByRole('button', { name: '加入' })
    expect(add).toBeEnabled()
    fireEvent.click(add)
    expect(await screen.findByText('冰塊')).toBeInTheDocument()
  })
})
