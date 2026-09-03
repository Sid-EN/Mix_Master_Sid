import { test, expect, assertClean, clickInteractiveControls } from './fixtures'

/** 全站路由；新增頁面時一併加入，確保每頁都在冒煙測試涵蓋範圍內。 */
const ROUTES = [
  '/', '/academy', '/academy/curriculum', '/academy/distillation', '/academy/flair',
  '/academy/garnish', '/academy/glassware', '/academy/hangover', '/academy/ice',
  '/academy/infusions', '/academy/molecular', '/academy/sake', '/academy/sommelier',
  '/academy/spirits', '/academy/storage', '/academy/tasting', '/academy/techniques',
  '/academy/temperature', '/academy/tools', '/academy/wine', '/achievements', '/batch',
  '/compare', '/dashboard', '/engine', '/famous-bars', '/favorites', '/flavor-wheel',
  '/glossary', '/hall-of-fame', '/history', '/mocktails', '/mood', '/my-bar',
  '/personality', '/prep', '/quiz', '/random', '/recipes', '/tools', '/tools/abv',
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
})
