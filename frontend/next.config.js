/** @type {import('next').NextConfig} */

// 後端位址改由環境變數決定；先前寫死 localhost:8000，
// 部署到任何非本機環境都會失效。
const API_ORIGIN = process.env.API_BASE_URL || 'http://localhost:8000'

// 靜態匯出模式（GitHub Pages）。
// Pages 只能提供靜態檔案，無法執行後端、資料庫與伺服器端渲染，
// 因此帳號、同步、分享與智慧配方引擎於此模式停用（改顯示說明並導向完整版）。
const isStatic = process.env.NEXT_PUBLIC_STATIC_MODE === '1'

// GitHub Pages 的專案站台位於 /<repo> 之下，資源路徑需加上前綴
const basePath = isStatic ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : ''

const nextConfig = {
  reactStrictMode: true,

  ...(isStatic
    ? {
        output: 'export',
        basePath,
        assetPrefix: basePath || undefined,
        // 靜態匯出無伺服器可執行影像最佳化
        images: { unoptimized: true },
        // 產生 about/index.html 而非 about.html，Pages 才能正確解析路徑
        trailingSlash: true,
      }
    : {
        async rewrites() {
          return [
            { source: '/api/v1/:path*', destination: `${API_ORIGIN}/api/v1/:path*` },
            { source: '/health', destination: `${API_ORIGIN}/health` },
            { source: '/docs', destination: `${API_ORIGIN}/docs` },
            { source: '/openapi.json', destination: `${API_ORIGIN}/openapi.json` },
          ]
        },
      }),
}

module.exports = nextConfig
