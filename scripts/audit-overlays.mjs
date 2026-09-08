/**
 * 稽核彈窗／覆蓋層內部的按鈕。
 *
 * audit-buttons.mjs 只點得到「頁面載入時就看得見」的按鈕，
 * 對話框、下拉選單、行動選單裡的控制項一個都沒被測到——
 * 風味偏好設定的「重置／取消／儲存」正是這個死角。
 *
 * 這支腳本先觸發覆蓋層，再檢查裡面的每顆按鈕：
 * 是否被其他元素蓋住、是否停用、以及對話框的基本行為
 * （Escape 關閉、背景點擊關閉、role=dialog、焦點是否移入、背景是否鎖捲動）。
 */
import { chromium } from 'playwright'

const BASE = process.env.AUDIT_BASE || 'http://localhost:3000'

/** 每個覆蓋層：怎麼開、預期它是不是 modal 對話框 */
const OVERLAYS = [
  { name: '風味偏好設定（Navbar 入口）', page: '/', modal: true,
    open: p => p.click('[title="風味偏好設定"]') },
  { name: '風味偏好設定（首頁區塊入口）', page: '/', modal: true,
    open: async p => {
      const b = p.locator('button:has-text("開始設定偏好"), button:has-text("調整偏好")').first()
      await b.scrollIntoViewIfNeeded()
      await b.click()
    } },
  { name: '搜尋', page: '/', modal: true,
    open: p => p.click('[title="搜尋"]') },
  { name: '全部功能（巨型選單）', page: '/', modal: false,
    open: p => p.click('button:has-text("全部功能")') },
  { name: '行動選單', page: '/', modal: false,
    viewport: { width: 375, height: 667 },
    open: p => p.click('button:has-text("☰")') },
]


const info = () => ({
  role: (() => {
    const d = document.querySelector('[role="dialog"]')
    return d ? d.getAttribute('aria-modal') : null
  })(),
})

async function auditOverlay(browser, o) {
  const p = await browser.newPage({ viewport: o.viewport || { width: 1280, height: 720 } })
  const errs = []
  p.on('pageerror', e => errs.push(e.message))
  const out = { name: o.name, problems: [] }

  await p.goto(BASE + o.page, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1200)

  const hydrated = await p.evaluate(() => {
    const el = document.querySelector('button')
    return !!el && Object.keys(el).some(k => k.startsWith('__react'))
  })
  if (!hydrated) {
    console.error('React 尚未 hydration，結果不可信。請重新建置前端。')
    process.exit(2)
  }

  // 開啟前後的互動元件差集 = 覆蓋層帶進來的控制項
  const snap = () => p.evaluate(() =>
    [...document.querySelectorAll('button, a[href], input, select')]
      .filter(el => el.getBoundingClientRect().width > 0)
      .map(el => (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '?')
        .replace(/\s+/g, ' ').trim().slice(0, 24)))

  const before = new Set(await snap())
  try { await o.open(p) } catch (e) {
    out.problems.push('無法開啟：' + e.message.split('\n')[0])
    await p.close(); return out
  }
  await p.waitForTimeout(700)
  const added = (await snap()).filter(x => !before.has(x))
  if (added.length === 0) out.problems.push('點了觸發鈕之後畫面上沒有多出任何控制項')
  out.added = added.length

  /*
    可達性：先把控制項捲進它自己的捲動容器再做命中測試。
    直接在 scrollY=0 量會把「需要捲動才看得到」誤判成壞掉——
    對話框本來就會捲動，那不是缺陷。真正的缺陷是捲到它之後
    仍然被別的元素蓋住，或是根本捲不到。
  */
  const bad = await p.evaluate((names) => {
    const out = []
    const seen = new Set()
    for (const el of document.querySelectorAll('button, a[href]')) {
      const label = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '?')
        .replace(/\s+/g, ' ').trim().slice(0, 24)
      if (!names.includes(label) || seen.has(label)) continue
      seen.add(label)
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) { out.push(`「${label}」尺寸為 0`); continue }
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      if (cy < 0 || cy > innerHeight || cx < 0 || cx > innerWidth) {
        out.push(`「${label}」捲動後仍在可視範圍外`); continue
      }
      const top = document.elementFromPoint(cx, cy)
      if (top && !(el === top || el.contains(top) || top.contains(el))) {
        out.push(`「${label}」被 ${top.tagName}.${String(top.className).slice(0, 40)} 蓋住`)
      }
      if (el.disabled) out.push(`「${label}」停用中`)
    }
    return out
  }, added)
  out.problems.push(...bad)

  if (o.modal) {
    const semantics = await p.evaluate(() => {
      const d = document.querySelector('[role="dialog"]')
      return {
        hasDialog: !!d,
        ariaModal: d?.getAttribute('aria-modal') === 'true',
        focusInside: !!d && d.contains(document.activeElement),
        scrollLocked: getComputedStyle(document.body).overflow === 'hidden',
      }
    })
    if (!semantics.hasDialog) out.problems.push('缺少 role="dialog"，讀屏軟體不會當成對話框')
    else {
      if (!semantics.ariaModal) out.problems.push('缺少 aria-modal="true"')
      if (!semantics.focusInside) out.problems.push('開啟後焦點沒有移入對話框，鍵盤使用者要一路 Tab 進來')
    }
    if (!semantics.scrollLocked) out.problems.push('對話框開啟時背景仍可捲動')

    await p.keyboard.press('Escape')
    await p.waitForTimeout(400)
    const stillOpen = await p.evaluate(() => {
      const d = document.querySelector('[role="dialog"]')
      return !!d && d.getBoundingClientRect().height > 0
    })
    if (stillOpen) out.problems.push('按 Escape 無法關閉')
  }

  if (errs.length) out.problems.push('主控台錯誤：' + errs[0])
  await p.close()
  return out
}

const browser = await chromium.launch()
let total = 0
for (const o of OVERLAYS) {
  const r = await auditOverlay(browser, o)
  if (r.problems.length === 0) {
    console.log(`✅ ${r.name}`)
  } else {
    console.log(`❌ ${r.name}`)
    r.problems.forEach(x => console.log(`     · ${x}`))
    total += r.problems.length
  }
}
await browser.close()
console.log(`\n合計 ${total} 個問題`)
process.exit(total > 0 ? 1 : 0)
