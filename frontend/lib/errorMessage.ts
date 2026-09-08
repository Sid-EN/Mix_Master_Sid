/**
 * 把錯誤轉成使用者看得懂的訊息。
 *
 * 各處原本都寫 `err instanceof Error ? err.message : '失敗'`。
 * 後端自己丟的訊息是中文、講得清楚，直接顯示沒問題；
 * 但網路層失敗時 message 來自瀏覽器本身，是未翻譯的內部字串——
 * Chrome 給 "Failed to fetch"、Safari 給 "Load failed"、
 * Firefox 給 "NetworkError when attempting to fetch resource."。
 * 使用者在全中文的介面裡看到這些，等於什麼也沒被告知，
 * 更不知道「重試」或「檢查網路」才是該做的事。
 *
 * 這裡只攔截這一類無資訊量的訊息，其餘原樣放行。
 */

/** 瀏覽器在連線失敗時產生的訊息，各家措辭不同 */
const NETWORK_ERRORS = [
  'failed to fetch',
  'load failed',
  'networkerror',
  'network request failed',
  'network error',
  'the internet connection appears to be offline',
  'connection refused',
  'err_internet_disconnected',
  'err_network',
  'fetch failed',
]

const NETWORK_MESSAGE = '連線失敗，請檢查網路後再試一次'

/** 這則訊息對使用者有幫助嗎？ */
function isOpaque(message: string): boolean {
  const m = message.trim().toLowerCase()
  if (!m) return true
  return NETWORK_ERRORS.some(n => m.includes(n))
}

/**
 * @param err      catch 到的東西（可能不是 Error）
 * @param fallback 說明「哪一個動作」失敗的訊息，例如「登入失敗」
 */
export function userMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message
    : typeof err === 'string' ? err
    : ''
  if (!raw.trim()) return fallback
  if (isOpaque(raw)) return NETWORK_MESSAGE
  return raw
}
