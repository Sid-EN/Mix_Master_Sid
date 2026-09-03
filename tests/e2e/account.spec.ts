import { test, expect, assertClean } from './fixtures'

/**
 * 帳號與跨裝置同步 (D2)
 *
 * 每個測試使用獨立信箱，避免互相干擾；跨裝置情境以第二個瀏覽器 context
 * 模擬——全新 context 沒有任何 localStorage，等同另一台裝置。
 */
const password = 'a-good-password'
const uniqueEmail = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function registerVia(page: import('@playwright/test').Page, email: string) {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.click('button[role=tab]:has-text("註冊")')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.click('button[type=submit]')
  await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
}

test.describe('註冊與登入', () => {
  test('可註冊並顯示帳號資訊', async ({ page, errors }) => {
    const email = uniqueEmail()
    await registerVia(page, email)
    expect(await page.locator('body').innerText()).toContain(email)
    assertClean(errors)
  })

  test('重複註冊顯示錯誤而非崩潰', async ({ page, errors }) => {
    const email = uniqueEmail()
    await registerVia(page, email)
    await page.click('text=登出')
    await page.goto('/account', { waitUntil: 'networkidle' })
    await page.click('button[role=tab]:has-text("註冊")')
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', password)
    await page.click('button[type=submit]')
    await expect(page.locator('p[role=alert]')).toBeVisible({ timeout: 10_000 })
  })

  test('密碼錯誤時顯示提示', async ({ page }) => {
    const email = uniqueEmail()
    await registerVia(page, email)
    await page.click('text=登出')
    await page.goto('/account', { waitUntil: 'networkidle' })
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', 'definitely-wrong')
    await page.click('button[type=submit]')
    await expect(page.locator('p[role=alert]')).toContainText(/錯誤/)
  })

  test('登出後回到登入畫面', async ({ page, errors }) => {
    await registerVia(page, uniqueEmail())
    await page.click('text=登出')
    await expect(page.locator('button[role=tab]:has-text("註冊")')).toBeVisible()
    assertClean(errors)
  })
})

test.describe('跨裝置同步', () => {
  test('在另一台裝置登入後可取回酒櫃與收藏', async ({ page, browser, errors }) => {
    const email = uniqueEmail()

    // 裝置 A：先建立本機資料再註冊，本機資料應被上傳
    await page.goto('/my-bar', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.setItem('mixmaster-my-bar',
        JSON.stringify(['tanqueray-gin', 'campari', 'sweet-vermouth']))
      localStorage.setItem('mixmaster-favorites',
        JSON.stringify({ 'classic-negroni': { rating: 5, note: '裝置 A 的筆記' } }))
    })
    await registerVia(page, email)
    await page.waitForTimeout(1500)

    // 裝置 B：全新 context，等同另一台裝置
    const deviceB = await browser.newContext()
    const b = await deviceB.newPage()
    await b.goto('/account', { waitUntil: 'networkidle' })
    expect(await b.evaluate(() => localStorage.getItem('mixmaster-my-bar')),
      '新裝置本機應為空').toBeNull()

    await b.fill('input[type=email]', email)
    await b.fill('input[type=password]', password)
    await b.click('button[type=submit]')
    await expect(b.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
    await b.waitForTimeout(2000)

    const restored = await b.evaluate(() => ({
      bar: JSON.parse(localStorage.getItem('mixmaster-my-bar') || 'null'),
      fav: JSON.parse(localStorage.getItem('mixmaster-favorites') || 'null'),
    }))
    expect(restored.bar).toEqual(['tanqueray-gin', 'campari', 'sweet-vermouth'])
    expect(restored.fav['classic-negroni'].note).toBe('裝置 A 的筆記')

    await deviceB.close()
    assertClean(errors)
  })

  test('導覽列在登入前後顯示對應入口', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('a[href="/account"]')).toBeVisible()
    await registerVia(page, uniqueEmail())
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('a[href="/account"]')).toBeVisible()
  })
})

test.describe('帳號 API 契約', () => {
  test('同步端點需要認證', async ({ request }) => {
    for (const path of ['/api/v1/sync', '/api/v1/sync/my-bar']) {
      expect((await request.get(path)).status(), `${path} 應要求認證`).toBe(401)
    }
  })

  test('註冊、寫入與讀回', async ({ request }) => {
    const email = uniqueEmail()
    const reg = await request.post('/api/v1/auth/register', { data: { email, password } })
    expect(reg.status()).toBe(201)
    const token = (await reg.json()).access_token
    const headers = { Authorization: `Bearer ${token}` }

    const put = await request.put('/api/v1/sync/my-bar',
      { data: { value: ['bacardi-rum'] }, headers })
    expect(put.status()).toBe(200)

    const got = await request.get('/api/v1/sync/my-bar', { headers })
    expect((await got.json()).value).toEqual(['bacardi-rum'])
  })

  test('不在白名單的同步項目被拒絕', async ({ request }) => {
    const email = uniqueEmail()
    const reg = await request.post('/api/v1/auth/register', { data: { email, password } })
    const token = (await reg.json()).access_token
    const res = await request.put('/api/v1/sync/theme',
      { data: { value: { mode: 'dark' } }, headers: { Authorization: `Bearer ${token}` } })
    expect(res.status()).toBe(422)
  })
})
