/**
 * 找出「被祖先綁架的 fixed 元素」與「溢出視窗又捲不到的浮層」。
 *
 * CSS 規範：祖先只要有 transform／filter／perspective／backdrop-filter／
 * contain:paint／will-change:transform，就會成為 position:fixed 的包含區塊。
 * fixed 於是不再以視窗為準，覆蓋層會被縮到那個祖先的框裡，
 * 超出視窗的部分完全點不到——而且只在「元件被放在某些位置時」才會發生，
 * 同一個元件從別的入口開啟卻正常，所以極難靠肉眼發現。
 *
 * 浮層（下拉選單、巨型選單）則是另一種：長度超過視窗又沒有 overflow，
 * 捲動頁面只會捲到背後的內容，浮層本身不動，底部選項永遠按不到。
 */
import { chromium } from 'playwright'

const BASE = process.env.AUDIT_BASE || 'http://localhost:3000'
const PAGES = process.argv.slice(2)
if (PAGES.length === 0) {
  console.error('用法：node scripts/audit-fixed-layers.mjs /path1 /path2 …')
  process.exit(2)
}

const PROBE = () => {
  const breaks = el => {
    const cs = getComputedStyle(el)
    return cs.transform !== 'none' || cs.filter !== 'none' || cs.perspective !== 'none'
      || cs.backdropFilter !== 'none' || cs.contain.includes('paint')
      || cs.willChange.includes('transform') || cs.willChange.includes('filter')
  }
  const out = []
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue

    if (cs.position === 'fixed') {
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        if (breaks(a)) {
          out.push({
            kind: 'fixed 被祖先綁架',
            el: el.tagName + '.' + String(el.className).slice(0, 50),
            by: a.tagName + '.' + String(a.className).slice(0, 50),
          })
          break
        }
      }
    }

    // 浮層底部超出視窗，且自己與祖先都沒有捲動能力
    if ((cs.position === 'fixed' || cs.position === 'absolute') && r.height > 120
        && el.querySelectorAll('a[href], button').length >= 3
        && r.bottom > innerHeight + 4) {
      let scrollable = /(auto|scroll)/.test(cs.overflowY)
      for (let a = el.parentElement; a && !scrollable && a !== document.body; a = a.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(a).overflowY)) scrollable = true
      }
      if (!scrollable) {
        out.push({
          kind: '浮層溢出視窗且無法捲動',
          el: el.tagName + '.' + String(el.className).slice(0, 50),
          by: `底部 ${Math.round(r.bottom)}px > 視窗 ${innerHeight}px`,
        })
      }
    }
  }
  return out
}

const browser = await chromium.launch()
let total = 0
for (const path of PAGES) {
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await p.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => {})
  await p.waitForTimeout(900)

  const hydrated = await p.evaluate(() => {
    const el = document.querySelector('button')
    return !!el && Object.keys(el).some(k => k.startsWith('__react'))
  })
  if (!hydrated) {
    console.error(`${path} 的 React 尚未 hydration：結果不可信。請以對應的建置重新啟動前端。`)
    await browser.close(); process.exit(2)
  }

  // 先量靜態畫面，再把每個按鈕點開一次，讓浮層有機會出現
  let found = await p.evaluate(PROBE)
  const triggers = await p.locator('button:visible').all()
  for (const t of triggers.slice(0, 25)) {
    await t.click({ timeout: 1500 }).catch(() => {})
    await p.waitForTimeout(180)
    found = found.concat(await p.evaluate(PROBE))
    await p.keyboard.press('Escape').catch(() => {})
    await p.waitForTimeout(120)
  }

  const seen = new Set()
  const uniq = found.filter(f => {
    const k = f.kind + f.el + f.by
    if (seen.has(k)) return false
    seen.add(k); return true
  })
  if (uniq.length === 0) console.log(`✅ ${path}`)
  else {
    console.log(`❌ ${path}`)
    uniq.forEach(f => console.log(`     · ${f.kind}：${f.el}\n         ← ${f.by}`))
    total += uniq.length
  }
  await p.close()
}
await browser.close()
console.log(`\n合計 ${total} 個問題`)
process.exit(total > 0 ? 1 : 0)
