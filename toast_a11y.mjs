/** 在成就通知真的顯示的狀態下掃描無障礙——CI 是全新環境才會觸發 */
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf-8')
const BASE = 'http://127.0.0.1:6880'
const b = await chromium.launch()
let total = 0

for (const path of ['/', '/recipes', '/recipes/classic-daiquiri', '/my-bar', '/dashboard']) {
  // 全新 context：等同 CI 上第一次造訪
  const ctx = await b.newContext()
  const p = await ctx.newPage()
  await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1500)
  const toastVisible = await p.locator('[aria-label="成就通知"]').count()
  await p.addScriptTag({ content: AXE })
  const r = await p.evaluate(async () =>
    // @ts-expect-error 由 addScriptTag 注入
    await axe.run(document, { resultTypes: ['violations'] }))
  const n = r.violations.reduce((a, v) => a + v.nodes.length, 0)
  total += n
  console.log(`${path.padEnd(26)} 通知容器 ${toastVisible ? '有' : '無'}　違規 ${n}` +
    (n ? '　' + r.violations.map(v => `${v.id}(${v.nodes.length})`).join(' ') : ''))
  await ctx.close()
}
await b.close()
console.log(`\n合計違規 ${total} 處`)
process.exit(total === 0 ? 0 : 1)
