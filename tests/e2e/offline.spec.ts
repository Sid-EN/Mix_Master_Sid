import { test, expect } from './fixtures'

/**
 * 離線支援 (D5)
 *
 * Service Worker 僅在正式建置下註冊（開發模式停用），因此本機以 dev 執行時
 * 會自動跳過；CI 的 e2e job 以 next start 執行，這些測試會實際運行。
 */
async function serviceWorkerReady(page: import('@playwright/test').Page) {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  return page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false
    const reg = await navigator.serviceWorker.getRegistration()
    return !!reg?.active
  })
}

test.describe('Service Worker 離線快取', () => {
  test('sw.js 可被取得且包含快取策略', async ({ request }) => {
    const res = await request.get('/sw.js')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('addEventListener')
    expect(body, '導覽請求需寫入快取，否則離線時無法瀏覽已看過的頁面')
      .toContain('navigationHandler')
    expect(body, '執行期快取需設上限避免無限成長').toContain('trimCache')
  })

  test('manifest 與離線頁可取得', async ({ request }) => {
    expect((await request.get('/manifest.json')).status()).toBe(200)
    expect((await request.get('/offline.html')).status()).toBe(200)
  })

  test('已造訪的配方頁在離線時仍可由快取提供', async ({ page, context }) => {
    test.skip(!(await serviceWorkerReady(page)),
      'Service Worker 僅於正式建置註冊，開發模式跳過')

    await page.goto('/recipes/classic-negroni', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    await context.setOffline(true)
    const served = await page.evaluate(async () => {
      const r = await caches.match('/recipes/classic-negroni')
      return r ? (await r.text()).includes('尼格羅尼') : false
    })
    await context.setOffline(false)

    expect(served, '離線時應能由 Service Worker 快取取得完整頁面').toBe(true)
  })

  test('未造訪的頁面在離線時回退至離線頁', async ({ page, context }) => {
    test.skip(!(await serviceWorkerReady(page)),
      'Service Worker 僅於正式建置註冊，開發模式跳過')

    await context.setOffline(true)
    const hasOffline = await page.evaluate(async () => !!(await caches.match('/offline.html')))
    await context.setOffline(false)
    expect(hasOffline).toBe(true)
  })
})
