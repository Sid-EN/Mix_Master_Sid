/**
 * 將後端的靜態資料複製到前端，供靜態匯出時於建置期直接讀取。
 *
 * 靜態版沒有後端可供呼叫，但經典配方、材料與知識庫本來就是 repo 內的
 * JSON 檔，因此建置時直接取用即可，不需要執行中的 API。
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', '..', 'backend', 'data')
const dest = join(here, '..', 'data')

if (!existsSync(src)) {
  console.error(`找不到後端資料目錄：${src}`)
  process.exit(1)
}

mkdirSync(dest, { recursive: true })
const files = readdirSync(src).filter(f => f.endsWith('.json'))
for (const f of files) {
  cpSync(join(src, f), join(dest, f))
}
console.log(`已複製 ${files.length} 個資料檔至 frontend/data/`)
