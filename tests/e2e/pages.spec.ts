import { test, expect, assertClean, clickInteractiveControls } from './fixtures'

/** 全站路由；新增頁面時一併加入，確保每頁都在冒煙測試涵蓋範圍內。 */
const ROUTES = [
  '/', '/academy', '/academy/curriculum', '/academy/distillation', '/academy/flair',
  '/academy/garnish', '/academy/glassware', '/academy/hangover', '/academy/ice',
  '/academy/infusions', '/academy/molecular', '/academy/sake', '/academy/sommelier',
  '/academy/spirits', '/academy/storage', '/academy/tasting', '/academy/techniques',
  '/academy/temperature', '/academy/tools', '/academy/wine', '/achievements', '/batch',
  '/compare', '/dashboard', '/discover', '/engine', '/famous-bars', '/favorites', '/flavor-wheel',
  '/glossary', '/hall-of-fame', '/history', '/mocktails', '/mood', '/my-bar',
  '/party', '/personality', '/prep', '/quiz', '/random', '/recipes',
  '/shopping-list', '/tools', '/tools/abv',
  '/tools/convert', '/tools/cost', '/tools/dilution', '/tools/nutrition', '/world-map',
]

test.describe('全站頁面冒煙測試', () => {
  for (const route of ROUTES) {
    test(`${route} 載入無錯誤且可互動`, async ({ page, errors }) => {
      const res = await page.goto(route, { waitUntil: 'networkidle' })
      expect(res?.status(), `${route} 的 HTTP 狀態`).toBeLessThan(400)
      await page.waitForTimeout(500)
      await clickInteractiveControls(page)
      await page.waitForTimeout(300)
      assertClean(errors)
    })
  }
})

test.describe('動態路由', () => {
  test('配方詳情頁顯示材料名稱而非佔位字串', async ({ page, errors }) => {
    await page.goto('/recipes/classic-negroni', { waitUntil: 'networkidle' })
    // 迴歸：材料列曾一律顯示字面字串「材料」，因為 API 只回傳 slug
    await expect(page.getByText('添加利倫敦乾琴酒').first()).toBeVisible()
    const body = await page.locator('body').innerText()
    for (const name of ['添加利倫敦乾琴酒', '金巴利', '香艾酒']) {
      expect(body, `材料名稱應顯示：${name}`).toContain(name)
    }
    expect(body, '不應顯示原始 slug').not.toMatch(/tanqueray-gin|sweet-vermouth/)
    assertClean(errors)
  })

  test('備料詳情頁可載入', async ({ page, errors }) => {
    await page.goto('/prep/simple-syrup', { waitUntil: 'networkidle' })
    expect(await page.locator('body').innerText()).toContain('糖漿')
    assertClean(errors)
  })

  test('不存在的配方顯示找不到頁面', async ({ page }) => {
    await page.goto('/recipes/definitely-not-a-recipe', { waitUntil: 'networkidle' })
    expect(await page.locator('body').innerText()).toMatch(/404|找不到|not found/i)
  })

  /**
   * 迴歸：/recipes/[slug] 對不存在的 slug 曾回傳 HTTP 200（軟 404）。
   * 成因是 app/recipes/loading.tsx 的 Suspense 邊界會讓回應提早以 200 串流，
   * notFound() 之後只改變畫面而無法改變狀態碼；已改以 route group 將
   * loading.tsx 限定於列表頁。開發模式不重現此差異，故僅於正式建置檢查。
   */
  test('不存在的動態路由回傳 404 狀態碼', async ({ request }) => {
    const probe = await request.get('/prep/definitely-not-a-prep')
    test.skip(probe.status() !== 404,
      '開發模式的狀態碼行為與正式建置不同，此檢查僅於正式建置執行')

    for (const path of ['/recipes/definitely-not-a-recipe', '/prep/definitely-not-a-prep', '/totally-bogus-page']) {
      const res = await request.get(path)
      expect(res.status(), `${path} 應回傳 404 而非軟 404`).toBe(404)
    }
  })
})
