/**
 * 產生靜態版的搜尋索引與配方摘要。
 *
 * 靜態版沒有後端可呼叫 /api/v1/search，改在瀏覽器端比對。
 * 但把整份 classic_recipes.json（136KB）與 ingredients.json（172KB）
 * 打進 client bundle，會讓每個訪客都先下載搜尋用不到的欄位，
 * 因此另外產出一份只含可搜尋欄位的精簡索引，並在第一次搜尋時才載入。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '..', '..', 'backend', 'data')
const outDir = join(here, '..', 'public')

const read = name => JSON.parse(readFileSync(join(dataDir, name), 'utf-8'))

const ingredients = read('ingredients.json')
const byId = new Map(ingredients.map(i => [i.id, i]))

/** 描述只留一段預覽；搜尋比對用得到，但不需要整篇。 */
const preview = (text, max = 120) =>
  !text ? '' : text.length <= max ? text : text.slice(0, max) + '…'

const cocktails = read('classic_recipes.json').map(r => ({
  source: 'cocktail',
  id: r.id,
  slug: r.slug,
  nameEn: r.nameEn ?? '',
  nameZh: r.nameZh ?? '',
  description: preview(r.description),
  descriptionZh: preview(r.descriptionZh),
  tags: r.tags ?? [],
  method: r.method ?? '',
  origin: r.origin ?? '',
  ingredients: (r.ingredients ?? []).flatMap(ing => {
    const info = byId.get(ing.slug)
    return [ing.slug, info?.name, info?.nameZh].filter(Boolean)
  }),
}))

const preps = read('prep_recipes.json').map(r => ({
  source: 'prep',
  id: r.id,
  slug: r.slug,
  nameEn: r.nameEn ?? '',
  nameZh: r.nameZh ?? '',
  description: preview(r.description),
  descriptionZh: preview(r.descriptionZh),
  tags: [...(r.tags ?? []), ...(r.hashtags ?? [])],
  method: '',
  origin: '',
  ingredients: (r.ingredients ?? []).flatMap(ing =>
    [ing.name, ing.nameEn].filter(Boolean),
  ),
}))

/**
 * 配方摘要，欄位與後端 /api/v1/recipes?fields=summary 一致。
 *
 * 首頁的推薦、每日一杯與季節推薦共用這份清單（lib/recipeCache.ts）。
 * 靜態版沒有後端可呼叫，缺少這份檔案時首頁會出現 404 且推薦區塊空白。
 * 欄位若與後端不同步，兩個版本的首頁就會不一致——
 * 對照 SUMMARY_FIELDS（backend/api/routes_recipes.py）。
 */
const SUMMARY_FIELDS = [
  'id', 'slug', 'type', 'nameZh', 'nameEn', 'method', 'glassType',
  'balanceScore', 'grade', 'difficulty', 'tags', 'iba', 'isShared',
]

const summaries = read('classic_recipes.json').map(r =>
  Object.fromEntries(SUMMARY_FIELDS.filter(f => f in r).map(f => [f, r[f]])),
)

mkdirSync(outDir, { recursive: true })

const index = JSON.stringify({ items: [...cocktails, ...preps] })
writeFileSync(join(outDir, 'search-index.json'), index)

const summary = JSON.stringify({ items: summaries, total: summaries.length })
writeFileSync(join(outDir, 'recipes-summary.json'), summary)

console.log(
  `已產生搜尋索引：${cocktails.length} 個調酒 + ${preps.length} 個備料，` +
  `${(index.length / 1024).toFixed(1)} KB；` +
  `配方摘要 ${summaries.length} 筆，${(summary.length / 1024).toFixed(1)} KB`,
)
