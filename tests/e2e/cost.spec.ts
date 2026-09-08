import { test, expect } from './fixtures'

/**
 * 成本計算器
 *
 * 選到配方的那一刻，整頁會因為 React error #185（更新次數超過上限）當掉：
 * persistPrices 依賴 savedPrices，內部又以 { ...savedPrices } 產生新物件
 * 交給 setSavedPrices，新物件使 persistPrices 換了身分、effect 再跑一次，
 * 如此無限循環。材料列一列都出不來，功能等於不存在。
 *
 * 另外，沒有預設價格的材料會以 0 計入總計，畫面原本毫無表示，
 * 使用者看到的是一個少算過、卻沒說少算的數字。
 */

async function pickDaiquiri(page: import('@playwright/test').Page) {
  await page.goto('/tools/cost', { waitUntil: 'networkidle' })
  await page.locator('input[placeholder*="搜尋配方"]').click()
  await page.locator('button').filter({ hasText: /Daiquiri/ }).first().click()
  /*
    等畫面穩定下來再斷言。

    渲染迴圈會先把材料列畫出來，跑滿數十次更新之後 React 才放棄並清空畫面。
    立刻讀取的斷言會在崩潰前就先讀到正確的值而通過——那是一個在壞掉的頁面上
    仍會變綠的測試。這裡實測過：不等的話，五項裡有兩項會誤判為通過。
  */
  await page.waitForTimeout(2500)
}

test('選取配方會帶出材料列，且不會讓頁面當掉', async ({ page, errors }) => {
  await pickDaiquiri(page)

  expect(errors.console.filter(e => /React error #185|Maximum update depth/.test(e)))
    .toEqual([])
  // 三項材料 × 用量／瓶價／瓶容量
  await expect(page.locator('input[type=number]')).toHaveCount(9)
})

test('每個數字欄位說得出自己是什麼', async ({ page }) => {
  await pickDaiquiri(page)
  // 原本三個 <label> 都沒有 htmlFor 也沒包住 input，等於九個無名欄位
  await expect(page.locator('input[aria-label$="用量（毫升）"]')).toHaveCount(3)
  await expect(page.locator('input[aria-label$="瓶價"]')).toHaveCount(3)
  await expect(page.locator('input[aria-label$="瓶容量（毫升）"]')).toHaveCount(3)
})

test('未設定價格的材料會明講，補上價格後總計跟著更新', async ({ page }) => {
  await pickDaiquiri(page)

  const notice = page.getByText(/尚有 \d+ 項材料未設定價格/)
  await expect(notice).toBeVisible()

  const readTotal = () => page.evaluate(() => {
    const m = document.body.innerText.match(/COST PER DRINK\s*\n?\s*NT\$\s*([\d,.]+)/)
    return m ? parseFloat(m[1].replace(/,/g, '')) : null
  })
  const before = await readTotal()

  await page.locator('input[aria-label$="瓶價"]').first().fill('700')
  await expect(notice).toBeHidden()

  const after = await readTotal()
  expect(after).toBeGreaterThan(before!)
})

test('填過的價格重新整理後仍記得（且不會觸發重繪迴圈）', async ({ page, errors }) => {
  await pickDaiquiri(page)
  await page.locator('input[aria-label$="瓶價"]').first().fill('700')
  await expect(page.getByText(/尚有 \d+ 項材料未設定價格/)).toBeHidden()

  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('input[placeholder*="搜尋配方"]').click()
  await page.locator('button').filter({ hasText: /Daiquiri/ }).first().click()

  await expect(page.locator('input[aria-label$="瓶價"]').first()).toHaveValue('700')
  expect(errors.console.filter(e => /Minified React error #185|Maximum update depth/.test(e)))
    .toEqual([])
})

test('用量顯示不出現無意義的小數', async ({ page }) => {
  await pickDaiquiri(page)
  // 2 oz 原本顯示成 59.147 毫升
  const amounts = await page.locator('input[aria-label$="用量（毫升）"]')
    .evaluateAll(els => els.map(e => (e as HTMLInputElement).value))
  // 沒有欄位時下面的迴圈會空轉通過，等於什麼都沒檢查
  expect(amounts).toHaveLength(3)
  for (const v of amounts) {
    expect(v, `${v} 應最多一位小數`).toMatch(/^\d+(\.\d)?$/)
  }
})
