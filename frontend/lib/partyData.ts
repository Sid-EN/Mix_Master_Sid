/**
 * 派對規劃所需的配方與材料名稱
 *
 * 完整版直接向後端取（會一併包含使用者自建的配方）；
 * 靜態版沒有後端，改讀建置期產生的精簡檔（18 KB，只含用量所需欄位，
 * 不含步驟與典故），且僅在開啟派對規劃頁時才載入。
 */
import type { PlanRecipe } from './partyPlan'
import { clientUrl } from './api'
import { IS_STATIC } from './staticMode'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export interface PartyData {
  recipes: PlanRecipe[]
  ingredientNames: Record<string, string>
}

let pending: Promise<PartyData> | null = null

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
function fromApi(items: ApiRecipe[]): PartyData {
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
export function loadPartyData(): Promise<PartyData> {
  if (!pending) {
    const request = IS_STATIC
      ? fetch(`${BASE_PATH}/party-data.json`).then(res => {
          if (!res.ok) throw new Error(`派對資料載入失敗：${res.status}`)
          return res.json() as Promise<PartyData>
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
export function resetPartyData(): void {
  pending = null
}
