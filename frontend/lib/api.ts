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
