/**
 * 逐一點擊全站按鈕，找出點了沒反應、按不到、或行為異常的控制項。
 *
 * 靜態分析只抓得到「完全沒有 onClick」的按鈕，實務上的失效多半更隱蔽：
 * 處理器提早 return、被其他元素蓋住、或永遠停在 disabled。這支腳本
 * 以真實瀏覽器逐一點擊來驗證。
 *
 * 每個按鈕都在重新載入的頁面上單獨點擊，避免前一次點擊的副作用干擾判斷。
 * 「有反應」的定義：網址、DOM、捲動位置、表單欄位值、主題或 localStorage
 * 任一改變，或送出了網路請求。全都沒有 → 點了等於沒點。
 *
 * 判讀時的注意事項：
 * - 已經選中的分頁／篩選再點一次本來就不會有變化，屬正常。
 * - disabled 需逐一判斷是否合理（空表單合理；忘記密碼被鎖住則不合理）。
 *
 * 用法：先啟動前端，再執行
 *   node scripts/audit-buttons.mjs / /recipes /my-bar …
 * 可用 E2E_BASE_URL 指定位址（預設 http://localhost:6880）。
 */
import { chromium } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:6880'
const PAGES = process.argv.slice(2)

const b = await chromium.launch()
const ctx = await b.newContext()
const results = []

async function snapshot(p) {
  return await p.evaluate(() => ({
    url: location.pathname + location.search,
    html: document.body.innerHTML.length,
    text: document.body.innerText.slice(0, 4000),
    storage: JSON.stringify(Object.entries(localStorage).sort()),
    // 捲動與表單欄位的值都不會反映在 innerHTML／innerText 上：
    // 少了這兩項，跳段錨點與數值選擇按鈕會被誤判為「沒反應」。
    scroll: Math.round(window.scrollY),
    fields: JSON.stringify([...document.querySelectorAll('input, select, textarea')]
      .map(el => `${el.value}|${el.checked}`)),
    theme: document.documentElement.getAttribute('data-theme'),
  }))
}

for (const path of PAGES) {
  const p = await ctx.newPage()
  await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle' }).catch(() => {})
  await p.waitForTimeout(600)

  /*
    React 未完成 hydration 時，所有事件處理器都還沒掛上，
    每個按鈕都會被判成「沒反應」——那是環境壞了，不是產品壞了。
    （典型原因：next start 正在服務被 build:static 覆蓋掉的 .next。）
    這種情況必須立刻停下並說清楚，不能產出一份全紅的假報告。
  */
  const hydrated = await p.evaluate(() => {
    const el = document.querySelector('button')
    return !!el && Object.keys(el).some(k => k.startsWith('__react'))
  })
  if (!hydrated) {
    console.error(`${path} 的 React 尚未 hydration：所有按鈕都會被誤判為無反應。`)
    console.error('請確認前端是以對應的建置啟動（build:static 會覆蓋 .next，需重新 npm run build）。')
    await b.close()
    process.exit(2)
  }

  const total = await p.locator('button:visible').count()
  const labels = []
  for (let i = 0; i < total; i++) {
    const el = p.locator('button:visible').nth(i)
    labels.push({
      text: ((await el.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      aria: await el.getAttribute('aria-label').catch(() => null),
      disabled: await el.isDisabled().catch(() => true),
    })
  }
  await p.close()

  for (let i = 0; i < total; i++) {
    const info = labels[i]
    const name = info.text || info.aria || `#${i}`
    if (info.disabled) {
      results.push({ path, index: i, name, verdict: 'disabled' })
      continue
    }
    const page = await ctx.newPage()
    let requests = 0
    page.on('request', () => requests++)
    const errors = []
    page.on('pageerror', e => errors.push(String(e).slice(0, 120)))
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' }).catch(() => {})
    await page.waitForTimeout(500)

    const before = await snapshot(page)
    const reqBefore = requests
    let clicked = true
    try {
      await page.locator('button:visible').nth(i).click({ timeout: 4000 })
    } catch {
      clicked = false
    }
    await page.waitForTimeout(900)
    let after
    try { after = await snapshot(page) } catch { after = before }

    const changed =
      before.url !== after.url ||
      Math.abs(before.html - after.html) > 20 ||
      before.text !== after.text ||
      before.storage !== after.storage ||
      before.scroll !== after.scroll ||
      before.fields !== after.fields ||
      before.theme !== after.theme ||
      requests > reqBefore

    results.push({
      path, index: i, name,
      verdict: !clicked ? 'unclickable' : changed ? 'ok' : 'no-effect',
      errors: errors.length ? errors : undefined,
    })
    await page.close()
  }
}
await b.close()

const problems = results.filter(r => r.verdict !== 'ok')
console.log(`檢查 ${results.length} 個按鈕，其中 ${results.filter(r => r.verdict === 'ok').length} 個有反應\n`)
const byVerdict = {}
for (const r of problems) (byVerdict[r.verdict] ??= []).push(r)
for (const [verdict, list] of Object.entries(byVerdict)) {
  console.log(`── ${verdict}（${list.length}）`)
  for (const r of list) console.log(`   ${r.path}  [${r.index}] ${r.name}${r.errors ? '  ⚠ ' + r.errors[0] : ''}`)
}
