/**
 * 配方的細部資料（材料用量、風味、標籤）
 *
 * 派對規劃需要用量、口味統計需要風味與標籤，兩者都不需要步驟與典故。
 * 完整版直接向後端取（會一併包含使用者自建的配方）；
 * 靜態版沒有後端，改讀建置期產生的精簡檔，
 * 且僅在真正需要的頁面才載入。
 */
import type { PlanRecipe } from './partyPlan'
import { clientUrl } from './api'
import { IS_STATIC } from './staticMode'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export interface RecipeData {
  recipes: PlanRecipe[]
  ingredientNames: Record<string, string>
}

let pending: Promise<RecipeData> | null = null

interface ApiIngredient {
  slug: string
  amount: number | string
  unit?: string | null
  name?: string
  nameZh?: string
}

interface ApiRecipe extends PlanRecipe {
  ingredients?: ApiIngredient[]
}

/** 由 API 回應同時取出配方與材料名稱，省下一次 /ingredients 請求 */
function fromApi(items: ApiRecipe[]): RecipeData {
  const ingredientNames: Record<string, string> = {}
  for (const recipe of items) {
    for (const ing of recipe.ingredients ?? []) {
      if (!ingredientNames[ing.slug]) {
        ingredientNames[ing.slug] = ing.nameZh || ing.name || ing.slug
      }
    }
  }
  return { recipes: items, ingredientNames }
}

/** 載入一次後於同一次瀏覽期間共用 */
export function loadRecipeData(): Promise<RecipeData> {
  if (!pending) {
    const request = IS_STATIC
      ? fetch(`${BASE_PATH}/recipe-data.json`).then(res => {
          if (!res.ok) throw new Error(`配方資料載入失敗：${res.status}`)
          return res.json() as Promise<RecipeData>
        })
      : fetch(clientUrl('/api/v1/recipes?limit=500')).then(async res => {
          if (!res.ok) throw new Error(`配方載入失敗：${res.status}`)
          const data = await res.json()
          return fromApi(data.items ?? [])
        })

    pending = request.catch(err => {
      pending = null            // 失敗不留下壞掉的 promise，容許重試
      throw err
    })
  }
  return pending
}

/** 測試與熱重載用 */
export function resetRecipeData(): void {
  pending = null
}
