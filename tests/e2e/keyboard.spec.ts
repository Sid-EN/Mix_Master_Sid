import { test, expect } from './fixtures'

/**
 * 只用鍵盤操作
 *
 * 這些控制項用滑鼠都正常，因此不論是自動化測試或肉眼檢查都看不出問題：
 *
 *  · 「配方比較」與「批次換算」的搜尋下拉，選項是 <li onClick>——
 *    <li> 不可聚焦、沒有鍵盤處理器，輸入框也不處理方向鍵，
 *    因此只靠鍵盤的人在這兩頁根本選不到配方。
 *  · 「花式調酒」的卡片把展開掛在 <article onClick> 上，
 *    鍵盤打不開任何一張，詳細內容等於不存在。
 */

for (const [label, path] of [['配方比較', '/compare'], ['批次換算', '/batch']] as const) {
  test(`${label}：只用鍵盤就能從下拉選到配方`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' })
    const combo = page.locator('[role="combobox"]').first()
    await expect(combo).toHaveAttribute('aria-expanded', 'false')

    await combo.focus()
    await expect(combo).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('listbox').first()).toBeVisible()

    // 游標必須真的跟著方向鍵走，否則 Enter 不知道要選什麼
    const first = await combo.getAttribute('aria-activedescendant')
    expect(first).toBeTruthy()
    await page.keyboard.press('ArrowDown')
    const second = await combo.getAttribute('aria-activedescendant')
    expect(second).not.toBe(first)

    const chosen = (await page.locator(`#${second}`).innerText()).replace(/\s+/g, ' ').trim()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('listbox')).toHaveCount(0)

    // 重新打開（選取後輸入框仍有焦點，方向鍵才是使用者實際的重開方式）：
    // 剛才那一項要標記為已選，才證明 Enter 真的選到東西
    await page.keyboard.press('ArrowDown')
    const selected = page.locator('[role="option"][aria-selected="true"]').first()
    await expect(selected).toHaveCount(1)
    expect((await selected.innerText()).replace(/\s+/g, ' ').trim()).toBe(chosen)
  })

  test(`${label}：Escape 收起下拉`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' })
    const combo = page.locator('[role="combobox"]').first()
    await combo.focus()
    await expect(page.getByRole('listbox').first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox')).toHaveCount(0)
  })
}

test('花式調酒：卡片可用鍵盤展開', async ({ page }) => {
  await page.goto('/academy/flair', { waitUntil: 'networkidle' })
  const card = page.locator('button[aria-expanded]').first()
  await expect(card).toHaveAttribute('aria-expanded', 'false')
  await card.focus()
  await page.keyboard.press('Enter')
  await expect(card).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Enter')
  await expect(card).toHaveAttribute('aria-expanded', 'false')
})

test('難度篩選的星星說得出自己是什麼', async ({ page }) => {
  await page.goto('/recipes', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /篩選 Filter/ }).click()
  // 星號本身對讀屏軟體毫無意義，先前十顆按鈕全都只唸得出「☆」
  const min3 = page.getByRole('button', { name: '最低難度 3 星' })
  const max5 = page.getByRole('button', { name: '最高難度 5 星' })
  await expect(min3).toBeVisible()
  await expect(max5).toBeVisible()

  // 點擊區至少 24×24，手機上才按得準
  for (const b of [min3, max5]) {
    const box = await b.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(24)
    expect(box!.height).toBeGreaterThanOrEqual(24)
  }

  await min3.click()
  await expect(min3).toHaveAttribute('aria-pressed', 'true')
})
