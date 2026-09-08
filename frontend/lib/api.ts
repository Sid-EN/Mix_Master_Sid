/**
 * API 位址工具
 *
 * - Server Component：以 API_BASE_URL 直連 FastAPI（伺服器對伺服器）
 * - Client Component：預設走相對路徑，由 Next.js rewrites 代理；
 *   若設定 NEXT_PUBLIC_API_URL 則直接指向該來源（前後端不同網域時使用）
 *
 * 兩者皆不應寫死位址，否則部署到非本機環境即失效。
 */

/** 伺服器端使用的後端來源。 */
export const SERVER_API = process.env.API_BASE_URL || 'http://localhost:8000'

/** 瀏覽器端使用的後端來源；留空代表相對路徑（走 rewrites 代理）。 */
export const CLIENT_API = process.env.NEXT_PUBLIC_API_URL || ''

/** API 版本前綴，避免各檔各自定義。 */
export const API_V1 = '/api/v1'

/** 供 Server Component 使用的絕對網址。 */
export function serverUrl(path: string): string {
  return `${SERVER_API}${path}`
}

/** 供 Client Component 使用的網址。 */
export function clientUrl(path: string): string {
  return `${CLIENT_API}${path}`
}

/**
 * 帶逾時的伺服器端取值。
 *
 * 頁面在伺服器端渲染時取後端資料，各處都寫了 try/catch 準備退回預設內容。
 * 但那個 catch 在最需要的時候不會觸發：後端休眠冷啟動時，TCP 連線是成功的，
 * 只是回應要等數十秒——fetch 不會拋錯，只會一直等，整頁跟著卡到平台的
 * 函式逾時為止。免費方案的後端閒置後停機是常態，屆時連首頁都會慢。
 *
 * 逾時後主動中止，既有的 catch 才能發揮作用。正常回應的路徑完全不受影響。
 */
export async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  init?: RequestInit,
): Promise<Response> {
  // 用 AbortController 而非 AbortSignal.timeout()：後者在部分執行環境
  // （含測試用的 jsdom）不存在，會讓程式在那些環境直接壞掉。
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    // 請求結束就清掉，否則待觸發的計時器會讓事件迴圈遲遲無法結束
    clearTimeout(timer)
  }
}

/** 版面裝飾用的數字，等不到就用預設值，不值得讓整頁停住 */
export const DECORATIVE_TIMEOUT_MS = 3_000

/** 頁面主要內容；給得寬鬆一些，冷啟動之外的慢查詢仍應成功 */
export const CONTENT_TIMEOUT_MS = 8_000
