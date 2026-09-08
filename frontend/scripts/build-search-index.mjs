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

/**
 * 配方的細部資料。
 *
 * 派對規劃需要每項材料的 slug、用量與單位（摘要檔沒有這些），
 * 口味統計需要風味數值與標籤，配方比較器另外需要難度與風味關鍵字；
 * 三者都不需要步驟、典故與描述文字，
 * 因此另外產一份精簡版，只在真正需要的頁面才載入。
 */
const detailRecipes = read('classic_recipes.json').map(r => ({
  id: r.id,
  slug: r.slug,
  nameZh: r.nameZh ?? '',
  nameEn: r.nameEn ?? '',
  method: r.method ?? '',
  difficulty: r.difficulty ?? null,
  tags: r.tags ?? [],
  flavorProfile: r.flavorProfile
    ? {
        acid: r.flavorProfile.acid ?? null,
        sweet: r.flavorProfile.sweet ?? null,
        bitter: r.flavorProfile.bitter ?? null,
        punch: r.flavorProfile.punch ?? null,
        primaryFlavors: r.flavorProfile.primaryFlavors ?? [],
      }
    : null,
  ingredients: (r.ingredients ?? []).map(ing => ({
    slug: ing.slug,
    amount: ing.amount,
    unit: ing.unit ?? 'oz',
  })),
}))

const ingredientNames = Object.fromEntries(
  ingredients.map(i => [i.id, i.nameZh || i.name || i.id]),
)

/**
 * 材料目錄。
 *
 * 「我的酒櫃」需要分類、酒精度、顏色與風味標籤才能列出可調配方；
 * 靜態版沒有 /api/v1/ingredients 可呼叫，原本整頁停在「無法載入資料庫」。
 * 原始檔有 25 個欄位共 175 KB，這裡只取用得到的 7 個。
 */
const CATALOGUE_FIELDS = ['id', 'name', 'nameZh', 'category', 'abv', 'colorHex', 'flavorTags']
const ingredientCatalogue = ingredients.map(i =>
  Object.fromEntries(CATALOGUE_FIELDS.filter(f => f in i).map(f => [f, i[f]])),
)

mkdirSync(outDir, { recursive: true })

const detail = JSON.stringify({ recipes: detailRecipes, ingredientNames })
writeFileSync(join(outDir, 'recipe-data.json'), detail)

const index = JSON.stringify({ items: [...cocktails, ...preps] })
writeFileSync(join(outDir, 'search-index.json'), index)

const summary = JSON.stringify({ items: summaries, total: summaries.length })
writeFileSync(join(outDir, 'recipes-summary.json'), summary)

const catalogue = JSON.stringify({ items: ingredientCatalogue })
writeFileSync(join(outDir, 'ingredients.json'), catalogue)

console.log(
  `已產生搜尋索引：${cocktails.length} 個調酒 + ${preps.length} 個備料，` +
  `${(index.length / 1024).toFixed(1)} KB；` +
  `配方摘要 ${summaries.length} 筆，${(summary.length / 1024).toFixed(1)} KB；` +
  `配方細部資料 ${(detail.length / 1024).toFixed(1)} KB`,
)
