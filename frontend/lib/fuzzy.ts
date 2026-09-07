/**
 * 容錯搜尋的比對與排序（前端版）
 *
 * 與 backend/engine/fuzzy.py 是同一套規則的移植：靜態版沒有後端可呼叫，
 * 但搜尋結果的順序不應該因為版本不同而改變，否則兩個版本會像兩個產品。
 * 修改任一側時請一併修改另一側，tests/backend/test_search.py 與
 * __tests__/fuzzy.test.ts 涵蓋相同的案例。
 */

/** 各欄位的權重：名稱命中遠比描述命中有意義 */
export const FIELD_WEIGHTS: Record<string, number> = {
  name: 1.0,
  tag: 0.6,
  ingredient: 0.5,
  description: 0.3,
}

export const EXACT = 1.0
export const PREFIX = 0.85
export const CONTAINS = 0.7
export const FUZZY_BASE = 0.5
export const PHRASE_BONUS = 0.5

const DEFAULT_WEIGHT = 0.3

/** 統一大小寫並壓縮空白，讓比對不受輸入格式影響。 */
export function normalise(text: string): string {
  return text.toLowerCase().split(/\s+/).filter(Boolean).join(' ')
}

/**
 * 切出可比對的詞；標點與底線一律視為分隔。
 *
 * 不能用 \w：JavaScript 的 \w 只涵蓋 ASCII，中日文字元會被當成分隔符號，
 * 「經典黛綺麗」會切成空陣列，中文搜尋等於失效（Python 的 \w 涵蓋 Unicode）。
 * 改用 Unicode 類別，行為才與後端一致。
 */
export function tokenise(text: string): string[] {
  return normalise(text).match(/[\p{L}\p{N}]+/gu) ?? []
}

/**
 * 允許的編輯距離上限。
 *
 * 短詞放寬容錯會讓幾乎所有東西都命中（gin 與 sin、tin 距離皆為 1），
 * 因此三個字以下不容錯。
 */
export function maxTypos(term: string): number {
  const n = [...term].length
  if (n <= 3) return 0
  if (n <= 6) return 1
  return 2
}

/**
 * 編輯距離，超過 limit 即提前放棄並回傳 limit + 1。
 * 搜尋只關心「是否夠接近」，算出精確的大距離沒有意義。
 */
export function boundedLevenshtein(a: string, b: string, limit: number): number {
  if (limit < 0) return 1
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > limit) return limit + 1
  if (!a) return b.length <= limit ? b.length : limit + 1
  if (!b) return a.length <= limit ? a.length : limit + 1

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    let bestInRow = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
      current.push(value)
      if (value < bestInRow) bestInRow = value
    }
    if (bestInRow > limit) return limit + 1
    previous = current
  }
  const distance = previous[previous.length - 1]
  return distance <= limit ? distance : limit + 1
}

/** 單一查詢詞對單一欄位的命中強度，0 表示沒命中。 */
export function termMatch(term: string, fieldText: string, fieldTokens: string[]): number {
  if (!term || !fieldText) return 0
  if (fieldTokens.includes(term)) return EXACT
  if (fieldTokens.some(tok => tok.startsWith(term))) return PREFIX
  if (fieldText.includes(term)) return CONTAINS

  const limit = maxTypos(term)
  if (limit === 0) return 0
  let best = 0
  for (const tok of fieldTokens) {
    const distance = boundedLevenshtein(term, tok, limit)
    if (distance <= limit) {
      // 錯得越少分數越高，但一律低於「確實包含」
      best = Math.max(best, FUZZY_BASE * (1 - distance / (limit + 1)))
    }
  }
  return best
}

export type FieldChunks = Record<string, (string | undefined)[]>

/** 把一筆資料預先整理成可重複比對的欄位，避免每個查詢詞重算。 */
export class Candidate {
  readonly fields: [string, string, string[]][]

  constructor(fields: FieldChunks) {
    this.fields = Object.entries(fields).map(([name, chunks]) => {
      const text = normalise(chunks.filter(Boolean).join(' '))
      return [name, text, tokenise(text)]
    })
  }

  /**
   * 相關性分數。
   *
   * 所有查詢詞都必須命中某個欄位（AND 語意），否則視為不相關——
   * 多打一個詞卻得到更多結果會讓搜尋難以收斂。
   */
  score(terms: string[], phrase = ''): number {
    if (terms.length === 0) return 0
    let total = 0
    for (const term of terms) {
      let best = 0
      for (const [name, text, tokens] of this.fields) {
        const weight = FIELD_WEIGHTS[name] ?? DEFAULT_WEIGHT
        best = Math.max(best, weight * termMatch(term, text, tokens))
      }
      if (best === 0) return 0
      total += best
    }
    let score = total / terms.length

    if (phrase && terms.length > 1) {
      for (const [name, text] of this.fields) {
        if (text.includes(phrase)) {
          score *= 1 + PHRASE_BONUS * (FIELD_WEIGHTS[name] ?? DEFAULT_WEIGHT)
          break
        }
      }
    }
    return score
  }

  /** 整串查詢是否原樣出現——用來區分「確實符合」與「相近結果」。 */
  containsPhrase(phrase: string): boolean {
    return this.fields.some(([, text]) => text.includes(phrase))
  }
}

/** 把查詢字串切成可比對的詞。 */
export function queryTerms(q: string): string[] {
  return tokenise(q)
}
