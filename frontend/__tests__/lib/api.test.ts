import { serverUrl, clientUrl, SERVER_API, CLIENT_API } from '@/lib/api'

describe('api helpers', () => {
  it('server URL 為絕對路徑，供 Server Component 直連後端', () => {
    expect(serverUrl('/api/v1/recipes')).toBe(`${SERVER_API}/api/v1/recipes`)
    expect(serverUrl('/api/v1/recipes')).toMatch(/^https?:\/\//)
  })

  it('client URL 維持相對路徑，經由 Next rewrites 代理', () => {
    expect(clientUrl('/api/v1/recipes')).toBe('/api/v1/recipes')
    expect(CLIENT_API).toBe('')
  })

  it('保留查詢字串', () => {
    expect(serverUrl('/api/v1/recipes?limit=200')).toContain('?limit=200')
  })
})
