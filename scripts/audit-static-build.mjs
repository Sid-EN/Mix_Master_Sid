/**
 * 檢查靜態版（GitHub Pages）每一頁是否真的能用。
 *
 * 靜態版沒有後端。寫死 API 呼叫的頁面在本機開發時完全正常，
 * 部署上去卻只剩一行「載入失敗」——本機測不出來、CI 也測不到，
 * 因為兩者都跑得起後端。實際發生過：配方比較器與批次換算引擎
 * 在線上完全不能用，卻沒有任何測試會失敗。
 *
 * 需要後端的功能本來就該顯示 StaticModeNotice（明講這是展示版）；
 * 停在錯誤訊息或空白畫面則是缺陷。
 */
import { chromium } from 'playwright'

const BASE = process.env.AUDIT_BASE || 'http://localhost:4321'
const PAGES = process.argv.slice(2)
if (PAGES.length === 0) {
  console.error('用法：node scripts/audit-static-build.mjs /path1 /path2 …')
  process.exit(2)
}

const browser = await chromium.launch()
let total = 0
for (const path of PAGES) {
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const failed = []
  p.on('requestfailed', r => failed.push(r.url()))
  const resp = await p.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => null)
  await p.waitForTimeout(1200)

  const problems = []
  if (!resp || resp.status() >= 400) problems.push(`HTTP ${resp?.status() ?? '無回應'}`)

  const state = await p.evaluate(() => {
    const text = document.body.innerText
    return {
      text,
      hasNotice: /需要完整版/.test(text),
      // 內容量：扣掉導覽列與頁尾之後還剩多少
      length: text.replace(/\s+/g, '').length,
    }
  })

  // 對後端發出的請求在靜態版一定會失敗
  const apiCalls = failed.filter(u => u.includes('/api/'))
  if (apiCalls.length) problems.push(`仍在呼叫後端 API：${apiCalls[0].slice(0, 80)}`)

  /*
    只認明確的載入失敗字樣。⚠ 這個符號在學院頁面是安全警語，
    先前一律當成錯誤會淹沒真正的問題。
  */
  const FAILURE = /載入失敗|無法載入|讀取失敗|取得失敗|請稍後再試/
  if (!state.hasNotice && FAILURE.test(state.text)) {
    const line = state.text.split('\n').find(l => FAILURE.test(l))
    problems.push(`畫面停在錯誤訊息：「${line?.trim().slice(0, 40)}」`)
  }

  if (problems.length === 0) {
    console.log(`✅ ${path}${state.hasNotice ? '（顯示需要完整版的說明）' : ''}`)
  } else {
    console.log(`❌ ${path}`)
    problems.forEach(x => console.log(`     · ${x}`))
    total += problems.length
  }
  await p.close()
}
await browser.close()
console.log(`\n合計 ${total} 個問題`)
process.exit(total > 0 ? 1 : 0)
