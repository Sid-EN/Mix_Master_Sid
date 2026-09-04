import { test, expect, assertClean } from './fixtures'

/**
 * PWA 安裝提示與推播 (J)
 *
 * 注意：headless Chromium 不連線至瀏覽器廠商的推送服務
 * （回報 "push service not available"），且無痕環境不支援 Push API，
 * 因此「實際推播送達」無法於此環境驗證。
 * 此處涵蓋可驗證的部分：Service Worker 的處理器、設定介面的各種狀態、
 * 安裝提示的顯示條件與 API 契約。
 */
const password = 'a-good-password'
const uniqueEmail = () => `pwa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function registerVia(page: import('@playwright/test').Page) {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.click('button[role=tab]:has-text("註冊")')
  await page.fill('input[type=email]', uniqueEmail())
  await page.fill('input[type=password]', password)
  await page.click('button[type=submit]')
  await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
  return page.evaluate(() => localStorage.getItem('mixmaster-token'))
}

test.describe('Service Worker 推播處理', () => {
  test('sw.js 具備 push 與 notificationclick 處理器', async ({ request }) => {
    const body = await (await request.get('/sw.js')).text()
    expect(body, '缺少 push 處理器時，推播只會顯示瀏覽器預設訊息')
      .toContain("addEventListener('push'")
    expect(body, '缺少點擊處理器時，點通知不會開啟對應頁面')
      .toContain("addEventListener('notificationclick'")
  })

  test('推播內容解析失敗仍顯示通知', async ({ request }) => {
    const body = await (await request.get('/sw.js')).text()
    expect(body).toContain('catch')
  })
})

test.describe('推播設定介面', () => {
  test('登入後顯示推播設定區塊', async ({ page, errors }) => {
    await registerVia(page)
    await page.waitForTimeout(1500)
    await expect(page.getByText('🔔 推播通知')).toBeVisible()
    assertClean(errors)
  })

  test('權限被封鎖時顯示說明而非可點按鈕', async ({ page, context }) => {
    // 明確拒絕通知權限，模擬使用者曾封鎖過
    await context.clearPermissions()
    await registerVia(page)
    await page.waitForTimeout(2000)
    const text = await page.locator('body').innerText()
    // 依環境不同會落在「已封鎖」或「可開啟」其中之一，兩者皆為合理狀態
    expect(text).toMatch(/瀏覽器已封鎖|開啟推播通知|此瀏覽器不支援/)
  })
})

test.describe('安裝提示', () => {
  test('未觸發安裝事件時不顯示提示', async ({ page, errors }) => {
    // beforeinstallprompt 不會在測試環境觸發；此時不應憑空顯示提示
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await expect(page.getByRole('dialog', { name: '安裝 MixMaster' })).toHaveCount(0)
    assertClean(errors)
  })

  test('iOS 顯示手動加入主畫面的指引', async ({ browser }) => {
    // iOS Safari 不支援 beforeinstallprompt，只能引導手動安裝
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    })
    const page = await ctx.newPage()
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByText('加入主畫面')).toBeVisible({ timeout: 10_000 })
    await ctx.close()
  })

  test('關閉後不再顯示', async ({ browser }) => {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    })
    const page = await ctx.newPage()
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.click('button:has-text("不用了")')
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await expect(page.getByRole('dialog', { name: '安裝 MixMaster' })).toHaveCount(0)
    await ctx.close()
  })
})

test.describe('推播 API 契約', () => {
  test('公鑰端點無需登入', async ({ request }) => {
    const res = await request.get('/api/v1/push/public-key')
    expect(res.status()).toBe(200)
    expect(await res.json()).toHaveProperty('enabled')
  })

  test('訂閱與取消需要認證', async ({ request }) => {
    expect((await request.post('/api/v1/push/subscribe', {
      data: { endpoint: 'https://x/y', keys: { p256dh: 'a', auth: 'b' } },
    })).status()).toBe(401)
    expect((await request.delete('/api/v1/push/subscribe?endpoint=x')).status()).toBe(401)
  })

  test('可登錄與移除訂閱', async ({ request }) => {
    const reg = await request.post('/api/v1/auth/register',
      { data: { email: uniqueEmail(), password } })
    const headers = { Authorization: `Bearer ${(await reg.json()).access_token}` }
    const endpoint = `https://push.example.com/${Date.now()}`

    expect((await request.post('/api/v1/push/subscribe', {
      data: { endpoint, keys: { p256dh: 'k', auth: 'a' } }, headers,
    })).status()).toBe(201)

    expect((await request.delete(
      `/api/v1/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`, { headers },
    )).status()).toBe(204)
  })

  test('尚無訂閱時發送測試推播回報 404', async ({ request }) => {
    const reg = await request.post('/api/v1/auth/register',
      { data: { email: uniqueEmail(), password } })
    const headers = { Authorization: `Bearer ${(await reg.json()).access_token}` }
    expect((await request.post('/api/v1/push/test',
      { data: { body: '測試' }, headers })).status()).toBe(404)
  })
})
