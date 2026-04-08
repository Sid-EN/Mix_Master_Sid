/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
      {
        source: '/health',
        destination: 'http://localhost:8000/health',
      },
      {
        source: '/docs',
        destination: 'http://localhost:8000/docs',
      },
      {
        source: '/openapi.json',
        destination: 'http://localhost:8000/openapi.json',
      },
    ]
  },
}
module.exports = nextConfig
