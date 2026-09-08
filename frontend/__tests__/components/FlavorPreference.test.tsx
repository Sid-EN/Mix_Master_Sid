/**
 * 風味偏好設定對話框
 *
 * 這個對話框先前是全站唯一沒有對話框語意的覆蓋層：沒有 role="dialog"、
 * 按 Escape 關不掉、背景照樣捲動，而且「取消」只是把面板藏起來——
 * 未儲存的修改留在 state 裡，下次打開看到的是根本沒存進去的設定。
 */
import { render, screen, fireEvent, within } from '@testing-library/react'
import FlavorPreference from '@/components/FlavorPreference'

const STORAGE_KEY = 'mixmaster-flavor-pref'

function open(onClose = jest.fn()) {
  const view = render(<FlavorPreference isOpen onClose={onClose} />)
  return { onClose, view }
}
const dialog = () => screen.getByRole('dialog')
const btn = (name: RegExp | string) => within(dialog()).getByRole('button', { name })

beforeEach(() => localStorage.clear())

describe('FlavorPreference', () => {
  it('關閉時不渲染任何東西', () => {
    const { container } = render(<FlavorPreference isOpen={false} onClose={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('是具備 aria-modal 的對話框', () => {
    open()
    expect(dialog()).toHaveAttribute('aria-modal', 'true')
    expect(dialog()).toHaveAccessibleName('風味偏好設定')
  })

  it('渲染到 body 之下，不受祖先影響', () => {
    // 祖先只要有 transform 就會成為 fixed 的包含區塊，
    // 覆蓋層會被縮進祖先的框裡、按鈕掉到視窗外點不到。
    const { container } = render(
      <div style={{ transform: 'translateY(0)' }}>
        <FlavorPreference isOpen onClose={jest.fn()} />
      </div>,
    )
    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.contains(screen.getByRole('dialog'))).toBe(true)
  })

  it('開啟後焦點就在對話框內', () => {
    open()
    expect(dialog().contains(document.activeElement)).toBe(true)
  })

  it('按 Escape 會關閉', () => {
    const { onClose } = open()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('開啟時鎖住背景捲動，關閉後解除', () => {
    const { view } = open()
    expect(document.body.style.overflow).toBe('hidden')
    view.rerender(<FlavorPreference isOpen={false} onClose={jest.fn()} />)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('點背景遮罩會關閉', () => {
    const { onClose } = open()
    fireEvent.click(document.querySelector('.absolute.inset-0')!)
    expect(onClose).toHaveBeenCalled()
  })

  it('儲存偏好會寫入 localStorage 並關閉', () => {
    const { onClose } = open()
    fireEvent.click(btn(/清爽派/))
    fireEvent.click(btn(/儲存偏好/))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).acid).toBe(0.6)
    expect(onClose).toHaveBeenCalled()
  })

  it('取消不會寫入，且丟棄未儲存的修改', () => {
    const { view, onClose } = open()
    fireEvent.click(btn(/🥃 烈酒控/))  // 預設組那顆；酒感選項同名，用 emoji 區分
    expect(btn(/不甜/)).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(btn(/取消/))
    expect(onClose).toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    // 重新開啟：先前的修改不該還留著
    view.rerender(<FlavorPreference isOpen={false} onClose={onClose} />)
    view.rerender(<FlavorPreference isOpen onClose={onClose} />)
    expect(btn(/不甜/)).toHaveAttribute('aria-pressed', 'false')
    expect(btn(/微甜/)).toHaveAttribute('aria-pressed', 'true')
  })

  it('重新開啟會反映已儲存的偏好', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(
      { sweet: 0.85, acid: 0.1, bitter: 0.1, punch: 0.2, tags: ['Fruity'] }))
    open()
    expect(btn(/偏甜/)).toHaveAttribute('aria-pressed', 'true')
    expect(btn(/果香 Fruity/)).toHaveAttribute('aria-pressed', 'true')
  })

  it('重置會清掉儲存並回報，即使偏好本來就是預設值', () => {
    // 沒有回饋時，偏好已是預設的情況下畫面毫無變化，看起來就像按鈕壞了
    open()
    fireEvent.click(btn(/重置/))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(within(dialog()).getByRole('status')).toHaveTextContent('已重置為預設偏好')
  })

  it('儲存後會通知頁面上其他區塊重新讀取', () => {
    const spy = jest.fn()
    window.addEventListener('flavor-pref-changed', spy)
    open()
    fireEvent.click(btn(/儲存偏好/))
    expect(spy).toHaveBeenCalled()
    window.removeEventListener('flavor-pref-changed', spy)
  })
})
