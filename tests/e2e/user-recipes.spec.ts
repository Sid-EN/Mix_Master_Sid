import { test, expect, assertClean } from './fixtures'

/**
 * 使用者自建配方流程 (D1)
 *
 * 建立的配方會寫入後端儲存檔，測試結束後自行刪除，避免累積測試資料。
 */
test.describe('建立我的配方', () => {
  test('由表單建立配方並導向詳情頁', async ({ page, request, errors }) => {
    const name = `E2E 測試特調 ${Date.now()}`

    await page.goto('/recipes/new', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)

    await page.locator('input').first().fill(name)
    await page.selectOption('select[aria-label="材料 1"]', 'tanqueray-gin')
    await page.fill('input[aria-label="用量 1"]', '2')
    await page.selectOption('select[aria-label="材料 2"]', 'fresh-lime-juice')
    await page.fill('input[aria-label="用量 2"]', '0.75')

    await page.click('button[type=submit]')
    // 排除 /recipes/new 本身，否則正規式會在尚未導向時就通過
    await page.waitForURL(url => /\/recipes\/[a-z0-9-]+$/.test(url.pathname)
                                 && !url.pathname.endsWith('/new'), { timeout: 15_000 })
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText(name, { timeout: 10_000 })

    const body = await page.locator('body').innerText()
    expect(body).toContain(name)
    expect(body, '材料應顯示名稱而非 slug').toContain('添加利倫敦乾琴酒')
    assertClean(errors)

    // 清理
    const slug = page.url().split('/').pop()!
    await request.delete(`/api/v1/recipes/${slug}`)
  })

  test('缺少名稱時無法送出', async ({ page, errors }) => {
    await page.goto('/recipes/new', { waitUntil: 'networkidle' })
    await expect(page.locator('button[type=submit]')).toBeDisabled()
    assertClean(errors)
  })

  test('配方庫提供建立入口', async ({ page, errors }) => {
    await page.goto('/recipes', { waitUntil: 'networkidle' })
    await expect(page.locator('a[href="/recipes/new"]')).toBeVisible()
    assertClean(errors)
  })
})

test.describe('使用者配方 API', () => {
  test('建立、讀取、更新、刪除', async ({ request }) => {
    const payload = {
      nameZh: `API 測試 ${Date.now()}`,
      method: 'build',
      ingredients: [
        { slug: 'tanqueray-gin', amount: 2, unit: 'oz' },
        { slug: 'tonic-water', amount: 4, unit: 'oz' },
      ],
      steps: ['加冰', '倒入'],
    }

    const created = await request.post('/api/v1/recipes', { data: payload })
    expect(created.status()).toBe(201)
    const recipe = await created.json()
    expect(recipe.type).toBe('user')
    expect(recipe.balanceScore).toBeGreaterThanOrEqual(0)

    const read = await request.get(`/api/v1/recipes/${recipe.id}`)
    expect(read.status()).toBe(200)

    const updated = await request.put(`/api/v1/recipes/${recipe.id}`, {
      data: { ...payload, nameZh: '更新後的名稱' },
    })
    expect((await updated.json()).nameZh).toBe('更新後的名稱')

    expect((await request.delete(`/api/v1/recipes/${recipe.id}`)).status()).toBe(204)
    expect((await request.get(`/api/v1/recipes/${recipe.id}`)).status()).toBe(404)
  })

  test('經典配方不可刪除', async ({ request }) => {
    expect((await request.delete('/api/v1/recipes/classic-negroni')).status()).toBe(403)
  })
})
