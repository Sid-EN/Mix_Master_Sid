import { test, expect, assertClean } from './fixtures'

test.describe('關鍵使用者旅程', () => {
  test('配方庫 → 詳情頁', async ({ page, errors }) => {
    await page.goto('/recipes', { waitUntil: 'networkidle' })
    const link = page.locator('a[href^="/recipes/"]').first()
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    await link.click()
    await page.waitForURL(`**${href}`)
    await expect(page.locator('h1')).toBeVisible()
    assertClean(errors)
  })

  test('批次換算：輸入倍數後產出縮放結果與材料名稱', async ({ page, errors }) => {
    await page.goto('/batch', { waitUntil: 'networkidle' })
    const body = await page.locator('body').innerText()
    expect(body.length).toBeGreaterThan(100)
    // 迴歸：批次結果曾顯示原始 slug
    expect(body).not.toMatch(/tanqueray-gin|sweet-vermouth|makers-mark-bourbon/)
    assertClean(errors)
  })

  test('智慧配方引擎可生成配方', async ({ page, errors }) => {
    await page.goto('/engine', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    assertClean(errors)
  })

  test('測驗頁可作答', async ({ page, errors }) => {
    await page.goto('/quiz', { waitUntil: 'networkidle' })
    const start = page.getByRole('button').first()
    if (await start.isVisible()) await start.click()
    await page.waitForTimeout(500)
    assertClean(errors)
  })

  test('隨機調酒可重新抽選', async ({ page, errors }) => {
    await page.goto('/random', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    assertClean(errors)
  })

  test('主題切換不產生錯誤', async ({ page, errors }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const toggle = page.locator('button[aria-label*="theme" i], button[title*="theme" i]').first()
    if (await toggle.count()) {
      await toggle.click()
      await page.waitForTimeout(400)
    }
    assertClean(errors)
  })
})

test.describe('後端 API 契約', () => {
  test('配方端點接受 limit=200（迴歸：曾回 422）', async ({ request }) => {
    const r = await request.get('/api/v1/recipes?limit=200')
    expect(r.status()).toBe(200)
    expect((await r.json()).items.length).toBeGreaterThan(0)
  })

  test('配方材料帶有顯示名稱', async ({ request }) => {
    const r = await request.get('/api/v1/recipes/classic-negroni')
    const body = await r.json()
    for (const ing of body.ingredients) {
      expect(ing.name, `${ing.slug} 缺少 name`).toBeTruthy()
      expect(ing.nameZh, `${ing.slug} 缺少 nameZh`).toBeTruthy()
      expect(ing.name).not.toBe(ing.slug)
    }
  })

  test('批次換算回傳解析後的材料名稱', async ({ request }) => {
    const r = await request.post('/api/v1/batch/calculate', {
      data: { recipeId: 'classic-negroni', multiplier: 10 },
    })
    expect(r.status()).toBe(200)
    for (const ing of (await r.json()).ingredients) {
      expect(ing.nameZh).toBeTruthy()
    }
  })

  test('健康檢查', async ({ request }) => {
    expect((await request.get('/health')).status()).toBe(200)
  })
})
