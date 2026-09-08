import { test, expect, assertClean } from './fixtures'

/**
 * 覆蓋層（對話框、選單）
 *
 * 這些控制項在頁面載入時看不見，先前的按鈕稽核完全掃不到，
 * 因此壞了很久也沒被發現：
 *
 *  · 「風味偏好設定」從首頁區塊開啟時，頁尾的重置／取消／儲存偏好
 *    整排落在視窗外——因為祖先 .scroll-reveal 帶著 transform，
 *    fixed 不再以視窗為準。從 Navbar 開啟卻正常，同一個元件、
 *    只因為放在頁面不同深度就壞掉。
 *  · 「全部功能」巨型選單沒有高度上限，底部幾列在筆電高度下點不到。
 */

type Page = import('@playwright/test').Page

/** 這顆按鈕現在真的按得到嗎：在可視範圍內，而且點擊會落在它自己身上 */
async function isReachable(page: Page, name: string) {
  return page.evaluate(label => {
    const el = [...document.querySelectorAll('button')]
      .find(b => b.textContent?.replace(/\s+/g, ' ').trim() === label)
    if (!el) return { found: false }
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const inViewport = cy >= 0 && cy <= window.innerHeight && cx >= 0 && cx <= window.innerWidth
    const top = inViewport ? document.elementFromPoint(cx, cy) : null
    return { found: true, inViewport, hit: !!top && (el === top || el.contains(top)) }
  }, name)
}

const FOOTER = ['重置 Reset', '取消 Cancel', '儲存偏好 Save']

test.describe('風味偏好設定', () => {
  for (const entry of ['navbar', 'home-section'] as const) {
    test(`從 ${entry} 開啟時頁尾按鈕都按得到`, async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })

      if (entry === 'navbar') {
        await page.click('[title="風味偏好設定"]')
      } else {
        // 首頁「為你推薦」區塊裡的入口，位在 .scroll-reveal 之下
        const opener = page.locator(
          'button:has-text("開始設定偏好"), button:has-text("調整偏好")').first()
        await opener.scrollIntoViewIfNeeded()
        await opener.click()
      }

      await expect(page.getByRole('dialog')).toBeVisible()
      for (const label of FOOTER) {
        expect(await isReachable(page, label), `${label} 應可點擊`)
          .toEqual({ found: true, inViewport: true, hit: true })
      }
    })
  }

  test('取消會丟棄未儲存的修改', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.click('[title="風味偏好設定"]')
    const dialog = page.getByRole('dialog')

    await dialog.getByRole('button', { name: /🥃 烈酒控/ }).click()
    await expect(dialog.getByRole('button', { name: /不甜/ })).toHaveAttribute('aria-pressed', 'true')

    await dialog.getByRole('button', { name: /取消/ }).click()
    await expect(dialog).toBeHidden()
    expect(await page.evaluate(() => localStorage.getItem('mixmaster-flavor-pref'))).toBeNull()

    await page.click('[title="風味偏好設定"]')
    // 沒存進去的修改不該還留在畫面上
    await expect(dialog.getByRole('button', { name: /微甜/ })).toHaveAttribute('aria-pressed', 'true')
  })

  test('重置即使偏好本來就是預設值也會回報', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.click('[title="風味偏好設定"]')
    await page.getByRole('dialog').getByRole('button', { name: /重置/ }).click()
    await expect(page.getByRole('dialog').getByRole('status')).toHaveText('已重置為預設偏好')
  })

  test('按 Escape 關閉並把焦點還給觸發按鈕', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.click('[title="風味偏好設定"]')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(await page.evaluate(() => document.activeElement?.getAttribute('title')))
      .toBe('風味偏好設定')
  })
})

test('巨型選單的每一項在筆電高度下都點得到', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.click('button:has-text("全部功能")')

  const unreachable = await page.evaluate(() => {
    const menu = document.querySelector('nav .absolute.top-full')
    if (!menu) return ['找不到選單']
    const bad: string[] = []
    for (const a of menu.querySelectorAll('a[href]')) {
      a.scrollIntoView({ block: 'center' })
      const r = a.getBoundingClientRect()
      if (r.bottom > window.innerHeight || r.top < 0) {
        bad.push((a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 20))
      }
    }
    return bad
  })
  expect(unreachable).toEqual([])
})

test('對話框開啟時背景不會捲動', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.click('[title="風味偏好設定"]')
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
})

test('對話框是有名稱的 modal，且開啟過程不產生錯誤', async ({ page, errors }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.click('[title="風味偏好設定"]')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  await expect(dialog).toHaveAccessibleName('風味偏好設定')
  assertClean(errors)
})
