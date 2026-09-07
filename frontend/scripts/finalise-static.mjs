/**
 * 靜態匯出後的收尾。
 *
 * GitHub Pages 預設以 Jekyll 處理，會忽略底線開頭的目錄，
 * 整個 _next 資源目錄都會 404。.nojekyll 用來關閉它。
 * 同時確認分享預覽圖確實產生——它只在建置期產生一次，
 * 缺了不會有任何錯誤，只是分享出去沒有圖。
 */
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'out')

if (!existsSync(out)) {
  console.error(`找不到匯出目錄：${out}`)
  process.exit(1)
}

if (!existsSync(join(out, 'opengraph-image.png'))) {
  console.error('找不到 out/opengraph-image.png，分享出去將沒有預覽圖')
  process.exit(1)
}
console.log('分享預覽圖已就緒')

writeFileSync(join(out, '.nojekyll'), '')
console.log('已建立 .nojekyll')
