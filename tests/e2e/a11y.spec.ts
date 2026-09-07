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
 */
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
