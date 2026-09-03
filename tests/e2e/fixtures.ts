import { test as base, expect, Page } from '@playwright/test'

/** 這些訊息不代表應用缺陷，逐一列出以免遮蔽真正的錯誤。 */
const IGNORED = [
  /favicon/i,
  /manifest\.json/i,
  /icon-\d+\.png/i,
  /\/sw\.js/i,
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
]

const ignorable = (text: string) => IGNORED.some(r => r.test(text))

export type PageErrors = { console: string[]; network: string[] }

/**
 * 每個測試自動蒐集 console error 與失敗請求。
 * 只斷言「頁面回 200」會漏掉水合錯誤與背景 API 失敗——先前 3 個頁面
 * 的 422 就是這樣潛伏的。
 */
export const test = base.extend<{ errors: PageErrors }>({
  errors: async ({ page }, use) => {
    const errors: PageErrors = { console: [], network: [] }
    page.on('console', m => {
      if (m.type() === 'error' && !ignorable(m.text())) errors.console.push(m.text())
    })
    page.on('pageerror', e => errors.console.push(`PAGEERROR: ${e}`))
    page.on('response', r => {
      if (r.status() >= 400 && !ignorable(r.url())) {
        errors.network.push(`${r.status()} ${r.url()}`)
      }
    })
    await use(errors)
  },
})

export { expect }

export function assertClean(errors: PageErrors) {
  expect(errors.console, 'JavaScript console errors').toEqual([])
  expect(errors.network, 'failed network requests').toEqual([])
}

/** 點擊頁面上可見且啟用的按鈕，驗證互動不會拋錯。 */
export async function clickInteractiveControls(page: Page, max = 12) {
  const buttons = await page.locator('button:visible:not([disabled])').all()
  let clicked = 0
  for (const b of buttons.slice(0, max)) {
    try {
      await b.click({ timeout: 2500, noWaitAfter: true })
      clicked++
      await page.waitForTimeout(120)
    } catch {
      /* 覆蓋層或動畫造成的攔截不視為失敗 */
    }
  }
  return clicked
}
