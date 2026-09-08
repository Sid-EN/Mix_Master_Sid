/**
 * 全站控制項可達性稽核（多種視窗尺寸）。
 *
 * 「點不到」有好幾種成因，靜態分析一種都看不出來：
 * 被其他元素蓋住、捲不到、尺寸小到按不準（手指比游標粗得多）、
 * 或是在某個斷點下被切掉。桌面正常不代表手機正常，反之亦然，
 * 因此同一頁要在多個尺寸各量一次。
 */
import { chromium } from 'playwright'

const BASE = process.env.AUDIT_BASE || 'http://localhost:3000'
const PAGES = process.argv.slice(2)
if (PAGES.length === 0) {
  console.error('用法：node scripts/audit-reachability.mjs /path1 /path2 …')
  process.exit(2)
}

const VIEWPORTS = [
  { name: '手機 375×667', width: 375, height: 667, touch: true },
  { name: '桌機 1280×720', width: 1280, height: 720, touch: false },
]

/* WCAG 2.5.8（AA）要求觸控目標至少 24×24 CSS px */
const MIN_TARGET = 24

const PROBE = min => {
  const out = []
  const seen = new Set()
  for (const el of document.querySelectorAll('button, a[href], [role="button"], input, select, textarea')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const r0 = el.getBoundingClientRect()
    if (r0.width === 0 || r0.height === 0) continue
    /*
      螢幕閱讀器專用元素（如「跳至主要內容」）在未聚焦時刻意縮成 1×1
      並裁切掉，那是正確做法，不是點不到的目標。聚焦後才會現身。
    */
    const clipped = cs.clip === 'rect(0px, 0px, 0px, 0px)'
      || cs.clipPath === 'inset(50%)'
      || (r0.width <= 1 && r0.height <= 1 && cs.position === 'absolute')
    if (clipped) continue

    const label = (el.textContent || el.getAttribute('aria-label')
      || el.getAttribute('title') || el.getAttribute('placeholder') || '?')
      .replace(/\s+/g, ' ').trim().slice(0, 24) || '(無文字)'
    const key = label + Math.round(r0.width) + Math.round(r0.height)
    if (seen.has(key)) continue
    seen.add(key)

    // 目標尺寸：算上 CSS 的 padding 之外，也接受被間距隔開的小圖示
    if (r0.width < min || r0.height < min) {
      // 文字連結的高度由行高決定，WCAG 2.5.8 對此另有例外；
      // 圖示型控制項沒有這個藉口，手指按不準就是按不準。
      const isTextLink = el.tagName === 'A' && /[\w一-鿿]/.test(label) && r0.width >= min
      out.push({ kind: isTextLink ? '文字連結偏小（次要）' : '目標過小', label,
        detail: `${Math.round(r0.width)}×${Math.round(r0.height)}，低於 ${min}×${min}` })
    }

    // 捲進視野後再做命中測試
    el.scrollIntoView({ block: 'center', behavior: 'instant' })
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    if (cy < 0 || cy > innerHeight || cx < 0 || cx > innerWidth) {
      out.push({ kind: '捲動後仍在可視範圍外', label, detail: `x=${Math.round(cx)} y=${Math.round(cy)}` })
      continue
    }
    const top = document.elementFromPoint(cx, cy)
    if (top && !(el === top || el.contains(top) || top.contains(el))) {
      out.push({ kind: '被其他元素蓋住', label,
        detail: `${top.tagName}.${String(top.className).slice(0, 40)}` })
    }
  }
  return out
}

const browser = await chromium.launch()
let total = 0
for (const path of PAGES) {
  const rows = []
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: vp.touch, isMobile: vp.touch,
    })
    const p = await ctx.newPage()
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

    const found = await p.evaluate(PROBE, MIN_TARGET)
    found.forEach(f => rows.push({ ...f, vp: vp.name }))
    await ctx.close()
  }
  if (rows.length === 0) console.log(`✅ ${path}`)
  else {
    console.log(`❌ ${path}`)
    rows.forEach(r => console.log(`     · [${r.vp}] ${r.kind}：「${r.label}」— ${r.detail}`))
    total += rows.length
  }
}
await browser.close()
console.log(`\n合計 ${total} 個問題`)
process.exit(total > 0 ? 1 : 0)
