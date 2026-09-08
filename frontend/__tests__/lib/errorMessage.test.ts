/**
 * 錯誤訊息轉譯
 *
 * 先前各處直接顯示 err.message，網路失敗時使用者會在中文介面裡
 * 看到 "Failed to fetch"——既看不懂，也不知道該重試。
 */
import { userMessage } from '@/lib/errorMessage'

describe('userMessage', () => {
  it.each([
    'Failed to fetch',                                  // Chrome
    'Load failed',                                      // Safari
    'NetworkError when attempting to fetch resource.',  // Firefox
    'TypeError: Failed to fetch',
    'fetch failed',
  ])('把瀏覽器的連線錯誤換成可行動的說明：%s', raw => {
    expect(userMessage(new Error(raw), '登入失敗')).toBe('連線失敗，請檢查網路後再試一次')
  })

  it('後端自己的中文訊息原樣顯示', () => {
    expect(userMessage(new Error('這個電子郵件已被註冊'), '註冊失敗'))
      .toBe('這個電子郵件已被註冊')
  })

  it('訊息為空時用 fallback 說明是哪個動作失敗', () => {
    expect(userMessage(new Error(''), '匯出失敗')).toBe('匯出失敗')
    expect(userMessage(new Error('   '), '匯出失敗')).toBe('匯出失敗')
  })

  it('丟出來的不是 Error 也能處理', () => {
    expect(userMessage('伺服器忙碌中', '失敗')).toBe('伺服器忙碌中')
    expect(userMessage(undefined, '失敗')).toBe('失敗')
    expect(userMessage({ weird: true }, '失敗')).toBe('失敗')
    expect(userMessage(null, '失敗')).toBe('失敗')
  })

  it('大小寫不影響判斷', () => {
    expect(userMessage(new Error('FAILED TO FETCH'), 'x'))
      .toBe('連線失敗，請檢查網路後再試一次')
  })
})
