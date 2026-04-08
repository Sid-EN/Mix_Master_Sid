/**
 * API 工具函式
 * - Server Components: 使用 API_BASE_URL (localhost:8000)
 * - Client Components: 使用相對路徑 /api/v1 (透過 Next.js rewrites 代理)
 */

// Server-side: full URL for SSR fetches (Next.js server → FastAPI)
export const SERVER_API = process.env.API_BASE_URL || 'http://localhost:8000'

// Client-side: relative URL (browser → Next.js proxy → FastAPI)
export const CLIENT_API = ''

export function serverUrl(path: string): string {
  return `${SERVER_API}${path}`
}

export function clientUrl(path: string): string {
  return path
}
