/**
 * 分享對話框
 *
 * QR 圖本身的正確性由 lib/qrcode 的測試負責；這裡確認的是
 * 對話框把正確的網址交給編碼器、以及各種取用管道都可用。
 */
import { render, screen, fireEvent } from '@testing-library/react'
import ShareDialog from '@/components/ShareDialog'
import { encodeQr } from '@/lib/qrcode'

const URL_TEXT = 'https://example.com/shared/abc123'

function setup(url = URL_TEXT) {
  const onClose = jest.fn()
  render(<ShareDialog url={url} title="我的配方" onClose={onClose} />)
  return onClose
}

describe('ShareDialog', () => {
  it('顯示可掃描的 QR 圖', () => {
    setup()
    const img = screen.getByRole('img', { name: '分享連結的 QR Code' })
    expect(img.querySelector('svg')).toBeTruthy()
  })

  it('QR 內容為該分享網址', () => {
    setup()
    // 以模組本身重新編碼，確認畫出來的方塊數與該網址一致
    const expected = encodeQr(URL_TEXT).length
    const svg = screen.getByRole('img', { name: '分享連結的 QR Code' }).querySelector('svg')!
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${expected + 8} ${expected + 8}`)
  })

  it('同時顯示純文字連結，方便手動複製', () => {
    setup()
    expect(screen.getByText(URL_TEXT)).toBeInTheDocument()
  })

  it('可複製連結', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    setup()
    fireEvent.click(screen.getByRole('button', { name: '複製連結' }))
    expect(writeText).toHaveBeenCalledWith(URL_TEXT)
    expect(await screen.findByRole('button', { name: '已複製' })).toBeInTheDocument()
  })

  it('剪貼簿被拒時退回可手動複製的提示', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
    })
    const prompt = jest.fn()
    Object.defineProperty(window, 'prompt', { value: prompt, writable: true })
    setup()
    fireEvent.click(screen.getByRole('button', { name: '複製連結' }))
    await screen.findByRole('button', { name: '複製連結' })
    expect(prompt).toHaveBeenCalledWith('複製此連結：', URL_TEXT)
  })

  it('ESC 可關閉', () => {
    const onClose = setup()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('點擊外側可關閉', () => {
    const onClose = setup()
    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalled()
  })

  it('點擊內容不會誤關', () => {
    const onClose = setup()
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('具備對話框的可存取屬性', () => {
    setup()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', '分享「我的配方」')
  })

  it('網址過長時說明無法產生，而不是給出掃不出來的圖', () => {
    setup(`https://example.com/${'x'.repeat(500)}`)
    expect(screen.getByText('此連結過長，無法產生 QR Code')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // 連結本身仍可複製
    expect(screen.getByRole('button', { name: '複製連結' })).toBeInTheDocument()
  })
})
