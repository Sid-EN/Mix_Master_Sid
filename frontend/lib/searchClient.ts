/**
 * 統一搜尋的呼叫端
 *
 * 完整版打後端 /api/v1/search；靜態版（GitHub Pages）沒有後端，
 * 改在瀏覽器端以同一套規則（lib/fuzzy.ts）比對預先產生的索引。
 * 兩條路徑回傳同樣的形狀，呼叫端不需要知道自己在哪個版本。
 */
import { Candidate, normalise, queryTerms } from './fuzzy'
import { IS_STATIC } from './staticMode'

export interface SearchItem {
  source: 'cocktail' | 'prep'
  id: string
  slug: string
  nameEn: string
  nameZh: string
  description?: string
  descriptionZh?: string
  tags?: string[]
  method?: string
  score: number
  /** 整串查詢是否原樣出現；false 代表這是容錯後才命中的相近結果 */
  exact: boolean
}

export interface SearchResponse {
  total: number
  items: SearchItem[]
  query: string
}

interface IndexEntry extends Omit<SearchItem, 'score' | 'exact'> {
  origin?: string
  ingredients?: string[]
}

/** 靜態資源在 GitHub Pages 上位於 /<repo> 之下 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

let indexPromise: Promise<{ entry: IndexEntry; candidate: Candidate }[]> | null = null

/** 索引只載入一次；同時開啟多次搜尋不應重複下載。 */
function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${BASE_PATH}/search-index.json`)
      .then(res => {
        if (!res.ok) throw new Error(`索引載入失敗：${res.status}`)
        return res.json()
      })
      .then((data: { items: IndexEntry[] }) =>
        data.items.map(entry => ({
          entry,
          candidate: new Candidate({
            name: [entry.nameEn, entry.nameZh],
            tag: entry.tags ?? [],
            ingredient: entry.ingredients ?? [],
            description: [entry.description, entry.descriptionZh, entry.origin],
          }),
        })),
      )
      .catch(err => {
        // 失敗就讓下一次搜尋重試，而不是永遠記住失敗的 promise
        indexPromise = null
        throw err
      })
  }
  return indexPromise
}

/** 測試與熱重載用：忘記已載入的索引。 */
export function resetSearchIndex() {
  indexPromise = null
}

/** 分數相同時，較短的名稱代表關鍵字占比更高（Negroni 勝過 Mezcal Negroni）。 */
function rank(a: SearchItem, b: SearchItem): number {
  if (b.score !== a.score) return b.score - a.score
  const an = a.nameEn || a.nameZh
  const bn = b.nameEn || b.nameZh
  if (an.length !== bn.length) return an.length - bn.length
  return an < bn ? -1 : an > bn ? 1 : 0
}

async function searchStatic(q: string, limit: number): Promise<SearchResponse> {
  const terms = queryTerms(q)
  const phrase = normalise(q)
  if (terms.length === 0) return { total: 0, items: [], query: q }

  const items: SearchItem[] = []
  for (const { entry, candidate } of await loadIndex()) {
    const score = candidate.score(terms, phrase)
    if (score > 0) {
      items.push({
        ...entry,
        score: Number(score.toFixed(4)),
        exact: candidate.containsPhrase(phrase),
      })
    }
  }
  items.sort(rank)
  return { total: items.length, items: items.slice(0, limit), query: q }
}

async function searchApi(q: string, limit: number): Promise<SearchResponse> {
  const res = await fetch(
    `/api/v1/search?q=${encodeURIComponent(q)}&type=all&limit=${limit}`,
  )
  if (!res.ok) throw new Error(`搜尋失敗：${res.status}`)
  return res.json()
}

export function searchAll(q: string, limit = 10): Promise<SearchResponse> {
  if (!q.trim()) return Promise.resolve({ total: 0, items: [], query: q })
  return IS_STATIC ? searchStatic(q, limit) : searchApi(q, limit)
}
