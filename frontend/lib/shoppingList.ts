/**
 * 購物清單
 *
 * 從配方頁或派對規劃可一次把缺少的材料加入；重複加入同一材料時
 * 合併為一筆並累加需求量，而不是產生兩列——在酒專店對著清單採購時，
 * 同一瓶東西出現兩次只會造成困惑。
 */
export interface ShoppingItem {
  /** 材料 id；手動輸入的項目以 custom: 前綴 */
  id: string
  name: string
  /** 需求量（ml）；手動項目或無法換算者為 null */
  neededMl: number | null
  /** 來源配方名稱，方便回想為什麼要買 */
  sources: string[]
  done: boolean
  addedAt: string
}

export const SHOPPING_LIST_KEY = 'mixmaster-shopping-list'

export function loadList(): ShoppingItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SHOPPING_LIST_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(isItem) : []
  } catch {
    return []
  }
}

function isItem(v: unknown): v is ShoppingItem {
  return !!v && typeof v === 'object' && typeof (v as ShoppingItem).id === 'string'
}

export function saveList(items: ShoppingItem[]): void {
  try {
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items))
  } catch {
    /* 私密瀏覽或儲存空間已滿時忽略 */
  }
}

export interface AddRequest {
  id: string
  name: string
  neededMl?: number | null
  source?: string
}

/**
 * 加入項目，同 id 合併。
 *
 * 已勾選的項目再次被加入時取消勾選——代表又有新的需求，
 * 否則使用者會在清單上看到一筆劃掉的東西卻仍然缺貨。
 */
export function addItems(list: ShoppingItem[], requests: AddRequest[]): ShoppingItem[] {
  const byId = new Map(list.map(i => [i.id, { ...i, sources: [...i.sources] }]))

  for (const req of requests) {
    const existing = byId.get(req.id)
    const needed = req.neededMl ?? null
    if (existing) {
      existing.neededMl =
        existing.neededMl === null || needed === null
          ? existing.neededMl ?? needed
          : existing.neededMl + needed
      if (req.source && !existing.sources.includes(req.source)) existing.sources.push(req.source)
      existing.done = false
    } else {
      byId.set(req.id, {
        id: req.id,
        name: req.name,
        neededMl: needed,
        sources: req.source ? [req.source] : [],
        done: false,
        addedAt: new Date().toISOString(),
      })
    }
  }
  return [...byId.values()]
}

export function toggleItem(list: ShoppingItem[], id: string): ShoppingItem[] {
  return list.map(i => (i.id === id ? { ...i, done: !i.done } : i))
}

export function removeItem(list: ShoppingItem[], id: string): ShoppingItem[] {
  return list.filter(i => i.id !== id)
}

export function clearDone(list: ShoppingItem[]): ShoppingItem[] {
  return list.filter(i => !i.done)
}

/** 匯出為純文字，方便貼到訊息或備忘錄帶去店裡 */
export function toPlainText(list: ShoppingItem[]): string {
  if (list.length === 0) return ''
  const line = (i: ShoppingItem) => {
    const amount = i.neededMl !== null ? `（約 ${Math.ceil(i.neededMl)} ml）` : ''
    return `${i.done ? '[x]' : '[ ]'} ${i.name}${amount}`
  }
  return ['MixMaster 購物清單', ...list.map(line)].join('\n')
}
