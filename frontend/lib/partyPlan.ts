/**
 * 派對批量規劃
 *
 * /batch 一次只放大一道配方。辦一場派對通常要同時準備數款酒，
 * 真正需要知道的是「總共要買幾瓶、花多少錢、現有庫存夠不夠」。
 * 此處把多道配方的用量彙總到材料層級，再對照庫存算出缺口。
 */
import { costPerMl, remainingMl, type Inventory } from './inventory'
import { parseAmount, toMl } from './units'

export interface PlanRecipe {
  id: string
  slug?: string
  nameZh?: string
  nameEn?: string
  ingredients?: { slug: string; amount: number | string; unit?: string | null }[]
}

export interface PlanEntry {
  recipeId: string
  servings: number
}

export interface IngredientNeed {
  slug: string
  name: string
  /** 全部配方合計所需（ml）；無法換算時為 null */
  neededMl: number | null
  /** 用到此材料的配方名稱 */
  usedBy: string[]
  /** 目前庫存剩餘（ml）；沒有庫存資料時為 null */
  haveMl: number | null
  /** 還缺多少（ml）；無法判斷時為 null */
  shortfallMl: number | null
  /** 這些用量的成本；沒有價格資料時為 null */
  cost: number | null
}

export interface PlanResult {
  needs: IngredientNeed[]
  /** 已知價格部分的成本合計 */
  totalCost: number
  /** 缺少價格資料的材料數 */
  unpricedCount: number
  /** 總杯數 */
  totalServings: number
}

const displayName = (r: PlanRecipe) => r.nameZh || r.nameEn || r.slug || r.id

/**
 * 彙總用量。
 *
 * 無法換算成容積的材料（薄荷葉、萊姆角）仍會列出並記錄用到它的配方，
 * 只是不給毫升數——省略它們會讓採購時漏掉裝飾材料。
 */
export function planTotals(
  entries: PlanEntry[],
  recipes: PlanRecipe[],
  ingredientNames: Record<string, string>,
  inventory: Inventory = {},
): PlanResult {
  const byId = new Map(recipes.map(r => [r.id, r]))
  const needs = new Map<string, IngredientNeed>()
  let totalServings = 0

  for (const entry of entries) {
    const recipe = byId.get(entry.recipeId)
    const servings = Math.max(0, Math.floor(entry.servings))
    if (!recipe || servings === 0) continue
    totalServings += servings

    for (const ing of recipe.ingredients ?? []) {
      const perServing = toMl(parseAmount(ing.amount), ing.unit)
      const current = needs.get(ing.slug) ?? {
        slug: ing.slug,
        name: ingredientNames[ing.slug] || ing.slug,
        neededMl: perServing === null ? null : 0,
        usedBy: [],
        haveMl: null,
        shortfallMl: null,
        cost: null,
      }
      if (perServing === null) {
        current.neededMl = null            // 一旦有無法換算的用量，總量就不是可信的數字
      } else if (current.neededMl !== null) {
        current.neededMl += perServing * servings
      }
      const label = displayName(recipe)
      if (!current.usedBy.includes(label)) current.usedBy.push(label)
      needs.set(ing.slug, current)
    }
  }

  let totalCost = 0
  let unpricedCount = 0

  for (const need of needs.values()) {
    const info = inventory[need.slug]
    need.haveMl = info ? remainingMl(info) : null

    if (need.neededMl !== null && need.haveMl !== null) {
      need.shortfallMl = Math.max(0, need.neededMl - need.haveMl)
    }

    const perMl = costPerMl(info)
    if (perMl !== null && need.neededMl !== null) {
      need.cost = perMl * need.neededMl
      totalCost += need.cost
    } else if (need.neededMl !== null) {
      unpricedCount++
    }
  }

  const sorted = [...needs.values()].sort((a, b) => {
    // 缺口大的排前面，方便直接照著採購
    const sa = a.shortfallMl ?? -1
    const sb = b.shortfallMl ?? -1
    if (sa !== sb) return sb - sa
    return a.name.localeCompare(b.name)
  })

  return { needs: sorted, totalCost, unpricedCount, totalServings }
}

/**
 * 依缺口換算要買幾瓶。
 *
 * 沒有庫存資料時無從得知瓶裝規格，回傳 null 而不是假設一個容量。
 */
export function bottlesToBuy(need: IngredientNeed, inventory: Inventory): number | null {
  const info = inventory[need.slug]
  if (!info || !Number.isFinite(info.bottleMl) || info.bottleMl <= 0) return null
  if (need.shortfallMl === null) return null
  if (need.shortfallMl <= 0) return 0
  return Math.ceil(need.shortfallMl / info.bottleMl)
}
