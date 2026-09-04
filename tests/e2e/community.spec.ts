import { test, expect, assertClean } from './fixtures'

/**
 * 社群互動 (E)
 *
 * 互動對象限定為已公開分享的配方；未登入者可瀏覽，互動則需登入。
 */
const password = 'a-good-password'
const uniqueEmail = () => `com-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function apiAccount(request: import('@playwright/test').APIRequestContext) {
  const r = await request.post('/api/v1/auth/register',
    { data: { email: uniqueEmail(), password } })
  expect(r.status()).toBe(201)
  return { Authorization: `Bearer ${(await r.json()).access_token}` }
}

async function sharedRecipe(request: import('@playwright/test').APIRequestContext,
                            headers: Record<string, string>) {
  const created = await request.post('/api/v1/recipes', {
    data: {
      nameZh: 'E2E 社群配方', method: 'build',
      ingredients: [{ slug: 'tanqueray-gin', amount: 2, unit: 'oz' }], steps: ['加冰'],
    }, headers,
  })
  const id = (await created.json()).id
  const share = await request.post(`/api/v1/recipes/${id}/share`, { headers })
  return { id, token: (await share.json()).shareToken }
}

async function registerVia(page: import('@playwright/test').Page) {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.click('button[role=tab]:has-text("註冊")')
  await page.fill('input[type=email]', uniqueEmail())
  await page.fill('input[type=password]', password)
  await page.click('button[type=submit]')
  await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
}

test.describe('公開配方的評分與留言', () => {
  test('登入後可評分並看到平均', async ({ page, request, errors }) => {
    const owner = await apiAccount(request)
    const { token } = await sharedRecipe(request, owner)

    await registerVia(page)
    await page.goto(`/shared/${token}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    await page.locator('button[aria-label="給 4 星"]').click()
    await expect(page.getByText(/平均 4/)).toBeVisible({ timeout: 10_000 })
    assertClean(errors)
  })

  test('登入後可留言且立即顯示', async ({ page, request, errors }) => {
    const owner = await apiAccount(request)
    const { token } = await sharedRecipe(request, owner)

    await registerVia(page)
    await page.goto(`/shared/${token}`, { waitUntil: 'networkidle' })
    await page.locator('textarea[aria-label="留言內容"]').fill('這杯很順口')
    await page.click('button:has-text("發表留言")')
    await expect(page.getByText('這杯很順口')).toBeVisible({ timeout: 10_000 })
    assertClean(errors)
  })

  test('未登入者可瀏覽但看到登入提示', async ({ page, request, errors }) => {
    const owner = await apiAccount(request)
    const { token } = await sharedRecipe(request, owner)
    await request.post(`/api/v1/community/${token}/comments`,
      { data: { body: '訪客也看得到' }, headers: owner })

    await page.goto(`/shared/${token}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await expect(page.getByText('訪客也看得到')).toBeVisible()
    await expect(page.getByText('後即可評分與留言')).toBeVisible()
    assertClean(errors)
  })

  test('留言不外洩電子郵件', async ({ page, request }) => {
    const owner = await apiAccount(request)
    const { token } = await sharedRecipe(request, owner)
    await request.post(`/api/v1/community/${token}/comments`,
      { data: { body: '留言內容' }, headers: owner })

    await page.goto(`/shared/${token}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    expect(await page.locator('body').innerText()).not.toContain('@example.com')
  })
})

test.describe('社群 API 契約', () => {
  test('未公開的配方不可互動', async ({ request }) => {
    const owner = await apiAccount(request)
    const created = await request.post('/api/v1/recipes', {
      data: {
        nameZh: '私人配方', method: 'build',
        ingredients: [{ slug: 'tanqueray-gin', amount: 2 }], steps: ['加冰'],
      }, headers: owner,
    })
    const id = (await created.json()).id
    expect((await request.get(`/api/v1/community/${id}/comments`)).status()).toBe(404)
  })

  test('撤銷分享後即無法互動', async ({ request }) => {
    const owner = await apiAccount(request)
    const { id, token } = await sharedRecipe(request, owner)
    await request.delete(`/api/v1/recipes/${id}/share`, { headers: owner })
    expect((await request.get(`/api/v1/community/${token}/comments`)).status()).toBe(404)
  })

  test('不可為自己的配方評分', async ({ request }) => {
    const owner = await apiAccount(request)
    const { token } = await sharedRecipe(request, owner)
    const res = await request.put(`/api/v1/community/${token}/ratings`,
      { data: { score: 5 }, headers: owner })
    expect(res.status()).toBe(403)
  })

  test('評分需登入且每人一票', async ({ request }) => {
    const owner = await apiAccount(request)
    const visitor = await apiAccount(request)
    const { token } = await sharedRecipe(request, owner)

    expect((await request.put(`/api/v1/community/${token}/ratings`,
      { data: { score: 5 } })).status()).toBe(401)

    await request.put(`/api/v1/community/${token}/ratings`, { data: { score: 1 }, headers: visitor })
    await request.put(`/api/v1/community/${token}/ratings`, { data: { score: 5 }, headers: visitor })
    const body = await (await request.get(`/api/v1/community/${token}/ratings`)).json()
    expect(body.count).toBe(1)
    expect(body.average).toBe(5)
  })

  test('配方擁有者可刪除他人留言', async ({ request }) => {
    const owner = await apiAccount(request)
    const visitor = await apiAccount(request)
    const { token } = await sharedRecipe(request, owner)
    const c = await request.post(`/api/v1/community/${token}/comments`,
      { data: { body: '待刪除' }, headers: visitor })
    const cid = (await c.json()).id
    expect((await request.delete(`/api/v1/community/${token}/comments/${cid}`,
      { headers: owner })).status()).toBe(204)
  })

  test('第三方不可刪除他人留言', async ({ request }) => {
    const owner = await apiAccount(request)
    const visitor = await apiAccount(request)
    const other = await apiAccount(request)
    const { token } = await sharedRecipe(request, owner)
    const c = await request.post(`/api/v1/community/${token}/comments`,
      { data: { body: '別人的' }, headers: visitor })
    const cid = (await c.json()).id
    expect((await request.delete(`/api/v1/community/${token}/comments/${cid}`,
      { headers: other })).status()).toBe(403)
  })
})
