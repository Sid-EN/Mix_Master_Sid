/**
 * 材料目錄
 *
 * 「我的酒櫃」需要分類、酒精度、顏色與風味標籤才能列出可調的配方。
 * 完整版向後端取（一併包含使用者自建的材料）；靜態版沒有伺服器，
 * 改讀建置期產生的精簡檔——先前這一頁在靜態版整頁停在
 * 「無法載入資料庫」，功能等於不存在。
 */
import { clientUrl } from './api'
import { IS_STATIC } from './staticMode'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export interface IngredientRecord {
  id: string
  name: string
  nameZh: string
  category: string
  abv: number | null
  colorHex: string | null
  flavorTags: string[]
}

let pending: Promise<IngredientRecord[]> | null = null

/** 載入一次後於同一次瀏覽期間共用 */
export function loadIngredients(): Promise<IngredientRecord[]> {
  if (!pending) {
    const source = IS_STATIC
      ? `${BASE_PATH}/ingredients.json`
      : clientUrl('/api/v1/ingredients?limit=500')

    pending = fetch(source)
      .then(res => {
        if (!res.ok) throw new Error(`材料載入失敗：${res.status}`)
        return res.json()
      })
      .then((data: { items?: any[] }) =>
        (data.items ?? []).map(i => ({
          id: i.id || i.slug,
          name: i.name || i.nameEn || '',
          nameZh: i.nameZh || i.name || '',
          category: i.category || 'other',
          abv: i.abv ?? null,
          colorHex: i.colorHex ?? null,
          flavorTags: i.flavorTags || [],
        })),
      )
      .catch(err => {
        pending = null            // 失敗不留下壞掉的 promise，容許重試
        throw err
      })
  }
  return pending
}

/** 測試與熱重載用 */
export function resetIngredients(): void {
  pending = null
}
