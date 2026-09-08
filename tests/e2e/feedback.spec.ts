import { test, expect } from './fixtures'

/**
 * 操作之後的回饋
 *
 * 這些問題用眼睛看不出來——畫面上該有的東西都有，
 * 只是「讀屏軟體完全不會提到」，等於什麼都沒發生：
 *
 *  · 生成／換算的結果只做了 scrollIntoView。捲動純屬視覺，
 *    游標仍停在按鈕上，使用者不會知道下方多出了一整份結果。
 *  · 失敗訊息沒有 role="alert"，出現了也不會被宣讀。
 *
 * 另外，連線失敗時畫面原本直接顯示瀏覽器的 "Failed to fetch"，
 * 在全中文的介面裡既看不懂、也不知道該重試。
 */

test.describe('智慧配方引擎', () => {
  test('生成後焦點移入結果區，讀屏軟體才會宣讀', async ({ page }) => {
    await page.goto('/engine', { waitUntil: 'networkidle' })
    const picks = page.locator('button').filter({ hasText: /琴酒|伏特加|蘭姆|威士忌|柑橘|檸檬/ })
    for (let i = 0; i < Math.min(3, await picks.count()); i++) {
      await picks.nth(i).click()
    }
    await page.getByRole('button', { name: /生成/ }).click()

    const result = page.getByRole('region', { name: '生成結果' })
    await expect(result).toBeVisible({ timeout: 20_000 })
    await expect
      .poll(async () => result.evaluate(r => r === document.activeElement || r.contains(document.activeElement)),
            { timeout: 5_000 })
      .toBe(true)
  })

  test('失敗時顯示可讀懂的訊息，而且會被宣讀', async ({ page }) => {
    await page.goto('/engine', { waitUntil: 'networkidle' })
    await page.locator('button').filter({ hasText: /琴酒|伏特加|蘭姆|威士忌/ }).first().click()

    await page.route('**/api/**', r => r.abort('failed'))
    await page.getByRole('button', { name: /生成/ }).click()

    // Next.js 自己也放了一個 role="alert" 的路由播報器，要排掉
    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible({ timeout: 15_000 })
    // 不該把瀏覽器的內部訊息原封不動丟給使用者
    await expect(alert).not.toContainText('Failed to fetch')
    await expect(alert).toContainText('連線失敗')
  })
})

test('批次換算：結果區可被宣讀', async ({ page }) => {
  await page.goto('/batch', { waitUntil: 'networkidle' })
  const combo = page.locator('[role="combobox"]').first()
  await combo.focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: /換算/ }).click()

  const result = page.getByRole('region', { name: '換算結果' })
  await expect(result).toBeVisible({ timeout: 20_000 })
  await expect
    .poll(async () => result.evaluate(r => r === document.activeElement || r.contains(document.activeElement)),
          { timeout: 5_000 })
    .toBe(true)
})

test('登入失敗不顯示瀏覽器的內部錯誤字串', async ({ page }) => {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.fill('input[type=email]', 'nobody@example.com')
  await page.fill('input[type=password]', 'whatever12345')
  await page.route('**/api/**', r => r.abort('failed'))
  await page.click('button[type=submit]')

  const body = page.locator('body')
  await expect(body).toContainText('連線失敗，請檢查網路後再試一次', { timeout: 15_000 })
  await expect(body).not.toContainText('Failed to fetch')
})
