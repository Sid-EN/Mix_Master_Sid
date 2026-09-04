import { test, expect, assertClean } from './fixtures'

/** 個人化推薦 (G)：僅在有收藏可供推論時顯示。 */
const password = 'a-good-password'
const uniqueEmail = () => `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function registerVia(page: import('@playwright/test').Page) {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.click('button[role=tab]:has-text("註冊")')
  await page.fill('input[type=email]', uniqueEmail())
  await page.fill('input[type=password]', password)
  await page.click('button[type=submit]')
  await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
  return page.evaluate(() => localStorage.getItem('mixmaster-token'))
}

test.describe('依收藏的個人化推薦', () => {
  test('尚無收藏時不顯示個人化區塊', async ({ page, errors }) => {
    await registerVia(page)
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    // 沒有依據卻標示為個人化推薦，只是把熱門清單換個名字
    await expect(page.getByText('依你的收藏推薦')).toHaveCount(0)
    assertClean(errors)
  })

  test('有收藏後顯示推薦並說明依據', async ({ page, request, errors }) => {
    const token = await registerVia(page)
    await request.put('/api/v1/sync/favorites', {
      data: { value: { 'classic-daiquiri': { rating: 5 }, 'whiskey-sour': { rating: 5 } } },
      headers: { Authorization: `Bearer ${token}` },
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByText('依你的收藏推薦')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/依你收藏的 2 款配方/)).toBeVisible()
    await expect(page.getByText(/風味相似 \d+%/).first()).toBeVisible()
    assertClean(errors)
  })
})

test.describe('推薦 API 契約', () => {
  test('未登入回傳熱門作為依據', async ({ request }) => {
    const body = await (await request.get('/api/v1/engine/recommendations')).json()
    expect(body.basis).toBe('popular')
    expect(body.items.length).toBeGreaterThan(0)
  })

  test('有收藏時改以收藏為依據並排除已收藏者', async ({ request }) => {
    const reg = await request.post('/api/v1/auth/register',
      { data: { email: uniqueEmail(), password } })
    const headers = { Authorization: `Bearer ${(await reg.json()).access_token}` }
    await request.put('/api/v1/sync/favorites',
      { data: { value: { 'classic-daiquiri': { rating: 5 } } }, headers })

    const body = await (await request.get('/api/v1/engine/recommendations?limit=20',
      { headers })).json()
    expect(body.basis).toBe('favorites')
    expect(body.items.map((i: any) => i.slug)).not.toContain('classic-daiquiri')
  })

  test('無效權杖退回熱門而非失敗', async ({ request }) => {
    const res = await request.get('/api/v1/engine/recommendations',
      { headers: { Authorization: 'Bearer not-a-token' } })
    expect(res.status()).toBe(200)
    expect((await res.json()).basis).toBe('popular')
  })
})
