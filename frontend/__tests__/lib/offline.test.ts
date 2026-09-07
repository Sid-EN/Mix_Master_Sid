/**
 * 完整離線
 *
 * 這裡守的是最容易出錯、又最難察覺的一點：靜態版的網址帶結尾斜線，
 * 少了它 GitHub Pages 會回 301，存進快取的是重新導向而不是頁面本身，
 * 離線時打開就是空白——線上測試完全看不出問題。
 */
import { offlineUrls } from '@/lib/offline'

describe('offlineUrls', () => {
  const slugs = ['classic-daiquiri', 'negroni']

  it('包含首頁、配方庫與資料檔', () => {
    const urls = offlineUrls(slugs, false)
    expect(urls).toContain('/')
    expect(urls).toContain('/recipes')
    expect(urls).toContain('/search-index.json')
    expect(urls).toContain('/recipes-summary.json')
    expect(urls).toContain('/recipe-data.json')
  })

  it('包含每一份配方的詳情頁', () => {
    const urls = offlineUrls(slugs, false)
    expect(urls).toContain('/recipes/classic-daiquiri')
    expect(urls).toContain('/recipes/negroni')
  })

  it('靜態版的頁面網址帶結尾斜線', () => {
    // 少了斜線會存到 301 重新導向，離線時打不開
    const urls = offlineUrls(slugs, true)
    expect(urls).toContain('/recipes/')
    expect(urls).toContain('/recipes/classic-daiquiri/')
  })

  it('資料檔不加結尾斜線', () => {
    const urls = offlineUrls(slugs, true)
    expect(urls).toContain('/search-index.json')
    expect(urls).not.toContain('/search-index.json/')
  })

  it('沒有配方時仍包含基本頁面', () => {
    expect(offlineUrls([], false).length).toBeGreaterThan(0)
  })

  it('數量為基本頁面加上每份配方', () => {
    const base = offlineUrls([], false).length
    expect(offlineUrls(slugs, false)).toHaveLength(base + slugs.length)
  })
})
