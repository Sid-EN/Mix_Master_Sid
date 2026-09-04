import { test, expect, assertClean } from './fixtures'

/**
 * 使用者自建配方與分享 (D1 / D)
 *
 * 配方屬於帳號：需登入才能建立，且僅擁有者可修改。
 * 分享以不可猜測的權杖公開，可隨時撤銷。
 */
const password = 'a-good-password'
const uniqueEmail = () => `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function registerVia(page: import('@playwright/test').Page, email: string) {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.click('button[role=tab]:has-text("註冊")')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.click('button[type=submit]')
  await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
}

async function apiAccount(request: import('@playwright/test').APIRequestContext) {
  const r = await request.post('/api/v1/auth/register',
    { data: { email: uniqueEmail(), password } })
  expect(r.status()).toBe(201)
  return { Authorization: `Bearer ${(await r.json()).access_token}` }
}

const RECIPE = {
  nameZh: 'E2E 測試特調',
  method: 'build',
  ingredients: [
    { slug: 'tanqueray-gin', amount: 2, unit: 'oz' },
    { slug: 'tonic-water', amount: 4, unit: 'oz' },
  ],
  steps: ['加冰', '倒入'],
}

test.describe('建立我的配方', () => {
  test('登入後可由表單建立並出現在我的配方', async ({ page, errors }) => {
    const name = `表單建立 ${Date.now()}`
    await registerVia(page, uniqueEmail())

    await page.goto('/recipes/new', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.locator('input').first().fill(name)
    await page.selectOption('select[aria-label="材料 1"]', 'tanqueray-gin')
    await page.fill('input[aria-label="用量 1"]', '2')
    await page.selectOption('select[aria-label="材料 2"]', 'fresh-lime-juice')
    await page.fill('input[aria-label="用量 2"]', '0.75')
    await page.click('button[type=submit]')

    await page.waitForURL('**/recipes/mine', { timeout: 15_000 })
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 })
    assertClean(errors)
  })

  test('未登入時提示先登入', async ({ page, errors }) => {
    await page.goto('/recipes/new', { waitUntil: 'networkidle' })
    await expect(page.getByText('配方屬於帳號')).toBeVisible({ timeout: 10_000 })
    assertClean(errors)
  })

  test('配方庫提供建立與我的配方入口', async ({ page, errors }) => {
    await page.goto('/recipes', { waitUntil: 'networkidle' })
    await expect(page.locator('a[href="/recipes/new"]')).toBeVisible()
    await expect(page.locator('a[href="/recipes/mine"]')).toBeVisible()
    assertClean(errors)
  })
})

test.describe('分享配方', () => {
  test('可分享、以公開連結檢視、並撤銷', async ({ page, request, errors }) => {
    const email = uniqueEmail()
    await registerVia(page, email)
    const token = await page.evaluate(() => localStorage.getItem('mixmaster-token'))
    const headers = { Authorization: `Bearer ${token}` }

    const created = await request.post('/api/v1/recipes', { data: RECIPE, headers })
    expect(created.status()).toBe(201)
    const id = (await created.json()).id

    await page.goto('/recipes/mine', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await expect(page.getByText(RECIPE.nameZh).first()).toBeVisible()

    await page.click('button:has-text("分享")')
    await expect(page.getByText('已公開分享')).toBeVisible({ timeout: 10_000 })

    const shareToken = await page.locator('p:has-text("/shared/")').first().innerText()
    const path = shareToken.trim()

    // 以未登入的環境檢視公開連結
    const anon = await page.context().browser()!.newContext()
    const anonPage = await anon.newPage()
    await anonPage.goto(path, { waitUntil: 'networkidle' })
    await expect(anonPage.getByRole('heading', { name: RECIPE.nameZh })).toBeVisible()
    await anon.close()

    // 撤銷後連結失效
    await request.delete(`/api/v1/recipes/${id}/share`, { headers })
    const revoked = await request.get(`/api/v1${path.replace('/shared/', '/recipes/shared/')}`)
    expect(revoked.status()).toBe(404)
    assertClean(errors)
  })

  test('配方預設不公開', async ({ request }) => {
    const headers = await apiAccount(request)
    const r = await request.post('/api/v1/recipes', { data: RECIPE, headers })
    expect((await r.json()).isShared).toBe(false)
  })

  test('無效的分享連結顯示找不到頁面', async ({ page }) => {
    await page.goto('/shared/definitely-not-a-real-token', { waitUntil: 'networkidle' })
    expect(await page.locator('body').innerText()).toMatch(/404|找不到|not found/i)
  })
})

test.describe('使用者配方 API', () => {
  test('建立、讀取、更新、刪除', async ({ request }) => {
    const headers = await apiAccount(request)

    const created = await request.post('/api/v1/recipes', { data: RECIPE, headers })
    expect(created.status()).toBe(201)
    const recipe = await created.json()
    expect(recipe.type).toBe('user')

    const mine = await request.get('/api/v1/recipes/mine', { headers })
    expect((await mine.json()).total).toBe(1)

    const updated = await request.put(`/api/v1/recipes/${recipe.id}`,
      { data: { ...RECIPE, nameZh: '更新後的名稱' }, headers })
    expect((await updated.json()).nameZh).toBe('更新後的名稱')

    expect((await request.delete(`/api/v1/recipes/${recipe.id}`, { headers })).status()).toBe(204)
    expect((await request.get('/api/v1/recipes/mine', { headers })).ok()).toBe(true)
  })

  test('未登入不可建立配方', async ({ request }) => {
    expect((await request.post('/api/v1/recipes', { data: RECIPE })).status()).toBe(401)
  })

  test('他人無法刪除自己的配方', async ({ request }) => {
    const alice = await apiAccount(request)
    const bob = await apiAccount(request)
    const id = (await (await request.post('/api/v1/recipes', { data: RECIPE, headers: alice })).json()).id
    expect((await request.delete(`/api/v1/recipes/${id}`, { headers: bob })).status()).toBe(404)
  })

  test('經典配方不可刪除', async ({ request }) => {
    const headers = await apiAccount(request)
    expect((await request.delete('/api/v1/recipes/classic-negroni', { headers })).status()).toBe(403)
  })
})
