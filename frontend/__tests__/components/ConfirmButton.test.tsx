/**
 * 二次確認按鈕
 *
 * 破壞性操作先前一點就執行：誤點一次配方、酒櫃或留言就沒了，且無法復原。
 * 這裡守住「第一次點擊絕不執行」這條線。
 */
import { render, screen, fireEvent, act } from '@testing-library/react'
import ConfirmButton from '@/components/ConfirmButton'

function setup(props = {}) {
  const onConfirm = jest.fn()
  render(
    <ConfirmButton onConfirm={onConfirm} confirmLabel="確認刪除？" {...props}>
      刪除
    </ConfirmButton>,
  )
  return onConfirm
}

describe('ConfirmButton', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers() })

  it('第一次點擊不執行動作', () => {
    const onConfirm = setup()
    fireEvent.click(screen.getByRole('button'))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('第一次點擊後改為顯示確認文字', () => {
    setup()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: '確認刪除？' })).toBeInTheDocument()
  })

  it('第二次點擊才真的執行', () => {
    const onConfirm = setup()
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('執行後回復為原本文字', () => {
    setup()
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: '刪除' })).toBeInTheDocument()
  })

  it('逾時未確認會自動取消', () => {
    const onConfirm = setup({ timeoutMs: 3000 })
    fireEvent.click(screen.getByRole('button'))
    act(() => { jest.advanceTimersByTime(3100) })
    expect(screen.getByRole('button', { name: '刪除' })).toBeInTheDocument()
    // 逾時後再點一次只是重新進入待確認，不會直接執行
    fireEvent.click(screen.getByRole('button'))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('失去焦點即取消待確認狀態', () => {
    setup()
    fireEvent.click(screen.getByRole('button'))
    fireEvent.blur(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: '刪除' })).toBeInTheDocument()
  })

  it('停用時完全不觸發', () => {
    const onConfirm = setup({ disabled: true })
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('確認狀態可套用不同樣式', () => {
    setup({ className: 'normal', confirmClassName: 'danger' })
    expect(screen.getByRole('button')).toHaveClass('normal')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveClass('danger')
  })

  it('預設為 type=button，不會誤送出表單', () => {
    setup()
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
