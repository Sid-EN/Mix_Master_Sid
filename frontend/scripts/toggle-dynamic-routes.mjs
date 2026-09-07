/**
 * 靜態匯出時暫時移出無法靜態產生的路由。
 *
 * /shared/[token] 與 /recipes/mine/[slug]/versions 依賴使用者資料，
 * 建置期無從得知有哪些 token 或配方，因此無法預先產生頁面。
 * 匯出後再還原，避免影響一般開發。
 */
import { existsSync, mkdirSync, renameSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const app = join(here, '..', 'app')
const parked = join(here, '..', '.parked-routes')

const ROUTES = [
  'shared',
  join('recipes', 'mine', '[slug]'),
]

const mode = process.argv[2]
mkdirSync(parked, { recursive: true })

for (const route of ROUTES) {
  const from = mode === 'park' ? join(app, route) : join(parked, route.replace(/[\\/]/g, '__'))
  const to = mode === 'park' ? join(parked, route.replace(/[\\/]/g, '__')) : join(app, route)
  if (!existsSync(from)) continue
  mkdirSync(dirname(to), { recursive: true })
  renameSync(from, to)
  console.log(`${mode === 'park' ? '移出' : '還原'} ${route}`)
}
