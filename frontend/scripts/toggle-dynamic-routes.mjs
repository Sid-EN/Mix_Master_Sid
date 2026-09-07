/**
 * 在靜態匯出前後調整無法靜態產生的部分，匯出完成後還原。
 *
 * 兩件事：
 *
 * 1. 移出依賴使用者資料的路由。/shared/[token] 與
 *    /recipes/mine/[slug]/versions 的網址取決於執行期才存在的
 *    token 與配方，建置期無從得知，無法預先產生頁面。
 *
 * 2. 替換 /recipes/[slug] 與 /prep/[slug] 的 dynamic 設定。
 *    這兩頁在一般部署必須是 force-dynamic（否則 Next 視為靜態頁，
 *    而頁面以 cache: 'no-store' 取資料，執行時會 500）；
 *    但 output: 'export' 不接受 force-dynamic。
 *    路由設定必須是字面字串，無法寫成條件式，因此只能在此替換文字。
 *
 * 還原步驟由 build:static 以 `;` 串接，即使建置失敗也會執行。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const app = join(here, '..', 'app')
const parked = join(here, '..', '.parked-routes')

const ROUTES = [
  'shared',
  join('recipes', 'mine', '[slug]'),
]

/** 這些頁面在兩種模式下需要不同的 dynamic 設定 */
const DYNAMIC_PAGES = [
  join('recipes', '[slug]', 'page.tsx'),
  join('prep', '[slug]', 'page.tsx'),
]

const SERVER_MODE = "export const dynamic = 'force-dynamic'"
const STATIC_MODE = "export const dynamic = 'force-static'"

const mode = process.argv[2]
if (mode !== 'park' && mode !== 'restore') {
  console.error('用法：node scripts/toggle-dynamic-routes.mjs park|restore')
  process.exit(1)
}

mkdirSync(parked, { recursive: true })

for (const route of ROUTES) {
  const from = mode === 'park' ? join(app, route) : join(parked, route.replace(/[\\/]/g, '__'))
  const to = mode === 'park' ? join(parked, route.replace(/[\\/]/g, '__')) : join(app, route)
  if (!existsSync(from)) continue
  mkdirSync(dirname(to), { recursive: true })
  renameSync(from, to)
  console.log(`${mode === 'park' ? '移出' : '還原'} ${route}`)
}

const [find, replace] = mode === 'park' ? [SERVER_MODE, STATIC_MODE] : [STATIC_MODE, SERVER_MODE]
for (const page of DYNAMIC_PAGES) {
  const path = join(app, page)
  if (!existsSync(path)) continue
  const source = readFileSync(path, 'utf-8')
  if (!source.includes(find)) {
    // 已是目標狀態（例如重複執行還原）就跳過，但完全找不到任何一種就是出錯了
    if (!source.includes(replace)) {
      console.error(`${page} 找不到 dynamic 設定，請確認該頁是否仍需要此處理`)
      process.exit(1)
    }
    continue
  }
  writeFileSync(path, source.replace(find, replace))
  console.log(`${page} 的 dynamic 設為 ${mode === 'park' ? 'force-static' : 'force-dynamic'}`)
}
