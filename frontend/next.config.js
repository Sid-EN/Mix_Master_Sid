/** @type {import('next').NextConfig} */

// 後端位址改由環境變數決定；先前寫死 localhost:8000，
// 部署到任何非本機環境都會失效。
const API_ORIGIN = process.env.API_BASE_URL || 'http://localhost:8000'

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: `${API_ORIGIN}/api/v1/:path*` },
      { source: '/health',        destination: `${API_ORIGIN}/health` },
      { source: '/docs',          destination: `${API_ORIGIN}/docs` },
      { source: '/openapi.json',  destination: `${API_ORIGIN}/openapi.json` },
    ]
  },
}
module.exports = nextConfig
