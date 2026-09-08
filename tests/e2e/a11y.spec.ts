import { test, expect } from './fixtures'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/**
 * 無障礙自動檢查（新功能 11）
 *
 * 以 axe-core 掃描主要頁面。這類問題不會讓功能壞掉，
 * 卻會讓使用讀屏軟體或鍵盤的人完全用不了，
 * 而且平常操作時看不出任何異狀——只有機器掃得出來。
 *
 * 導入時掃出 118 處對比不足、未命名的表單元件與斷層的標題層級；
 * 修正後為 0。此測試確保不會再默默劣化。
 *
 * 時鐘固定在中午：「夜貓子」成就在當地時間 0–5 點解鎖並彈出通知，
 * 該通知是否出現原本取決於 CI 執行的時刻，測試結果因此不穩定
 * （在 UTC 凌晨執行時整組失敗）。通知本身的無障礙另有專門的測試。
 */
const NEUTRAL_TIME = new Date('2026-09-08T12:00:00Z')
// Playwright 的設定檔以 CommonJS 執行，故用 require.resolve 定位 axe 的檔案路徑
const AXE_SOURCE = readFileSync(
  join(dirname(require.resolve('axe-core/package.json')), 'axe.min.js'), 'utf-8')

/** 涵蓋各種版型：列表、詳情、表單、工具、儀表板 */
const PAGES = [
  '/', '/recipes', '/recipes/classic-daiquiri', '/prep', '/prep/simple-syrup',
  '/my-bar', '/shopping-list', '/party', '/discover', '/tools/abv', '/tools/cost',
  '/tools/dilution', '/academy', '/academy/wine', '/dashboard', '/account',
  '/engine', '/quiz', '/batch', '/mocktails',
]

interface AxeViolation {
  id: string
  impact: string | null
  help: string
  nodes: { html: string }[]
}

for (const path of PAGES) {
  test(`${path} 無 axe 可偵測的無障礙問題`, async ({ page }) => {
    await page.clock.setFixedTime(NEUTRAL_TIME)
    await page.goto(path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    await page.addScriptTag({ content: AXE_SOURCE })

    const violations = await page.evaluate(async () => {
      const result = await (window as unknown as {
        axe: { run: (ctx: Document, opts: object) => Promise<{ violations: AxeViolation[] }> }
      }).axe.run(document, { resultTypes: ['violations'] })
      return result.violations
    }) as AxeViolation[]

    const readable = violations.map(v =>
      `[${v.impact}] ${v.id}（${v.nodes.length} 處）：${v.help}\n    例：${v.nodes[0]?.html?.slice(0, 120)}`,
    ).join('\n  ')

    expect(violations, `${path} 的無障礙問題：\n  ${readable}`).toEqual([])
  })
}

test.describe('即時通知', () => {
  // 「夜貓子」看的是當地時間，因此時區與時刻都要固定，
  // 否則這個測試在不同機器上會得到不同結果。
  test.use({ timezoneId: 'UTC' })

  test('成就通知顯示時仍無無障礙問題', async ({ page }) => {
    /*
      成就通知位於任何 landmark 之外，axe 的 region 規則會判為違規。
      這個情況只在真的彈出通知時才看得到——先前的掃描全都沒有通知在畫面上，
      因此漏掉了；CI 在 UTC 凌晨執行時「夜貓子」解鎖，才整組炸開。
      這裡把時鐘固定在凌晨三點，穩定地重現該情境。
    */
    await page.clock.setFixedTime(new Date('2026-09-08T03:00:00Z'))
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    const toast = page.locator('[aria-label="成就通知"]')
    await expect(toast).toHaveCount(1)
    // 讀屏軟體要能宣讀解鎖的成就
    await expect(toast).toHaveAttribute('role', 'status')
    await expect(toast).toHaveAttribute('aria-live', 'polite')

    await page.addScriptTag({ content: AXE_SOURCE })
    const violations = await page.evaluate(async () => {
      const result = await (window as unknown as {
        axe: { run: (ctx: Document, opts: object) => Promise<{ violations: AxeViolation[] }> }
      }).axe.run(document, { resultTypes: ['violations'] })
      return result.violations
    }) as AxeViolation[]

    const readable = violations.map(v =>
      `[${v.impact}] ${v.id}（${v.nodes.length} 處）：${v.help}`).join('\n  ')
    expect(violations, `成就通知顯示時的無障礙問題：\n  ${readable}`).toEqual([])
  })
})
