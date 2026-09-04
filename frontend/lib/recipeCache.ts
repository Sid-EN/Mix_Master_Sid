/**
 * 配方清單的共用快取
 *
 * 首頁有三個元件各自抓取完整配方清單（HomeRecommendations、
 * CocktailOfTheDay、SeasonalRecommendations），實測造成同一份 121 KB 的
 * JSON 被下載三次、共 363 KB。這些元件都只需要唯讀的完整清單，
 * 因此共用同一份結果即可。
 *
 * 快取存於模組層級：同一次頁面載入內共用，重新整理後自然失效——
 * 配方屬靜態內容，不需要更積極的失效策略。
 */
import { clientUrl } from './api'

let pending: Promise<any[]> | null = null
let cached: any[] | null = null

/** 取得完整配方清單；同一次載入內只會發出一個請求。 */
export function fetchRecipes(): Promise<any[]> {
  if (cached) return Promise.resolve(cached)
  if (pending) return pending      // 已有請求進行中，共用之而非另發一個

  // 首頁的推薦、每日一杯、季節推薦都只用到名稱、手法與標籤，
  // 取摘要即可將 121 KB 降至 12 KB
  pending = fetch(clientUrl('/api/v1/recipes?limit=500&fields=summary'))
    .then(res => (res.ok ? res.json() : Promise.reject(new Error('fetch failed'))))
    .then(data => {
      cached = data.items ?? []
      return cached!
    })
    .catch(err => {
      pending = null               // 失敗不留下壞掉的 promise，容許重試
      throw err
    })

  return pending
}

/** 清除快取；測試使用。 */
export function clearRecipeCache(): void {
  pending = null
  cached = null
}
