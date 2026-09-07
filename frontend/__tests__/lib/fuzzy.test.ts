/**
 * 前端容錯搜尋
 *
 * 除了規則本身，重點是與後端 backend/engine/fuzzy.py 的一致性：
 * 靜態版在瀏覽器端搜尋、完整版打 API，同一個查詢兩邊必須給出同樣的順序，
 * 否則兩個版本會像兩個不同的產品。共同基準為 tests/fixtures/fuzzy_parity.json。
 */
import parity from '../../../tests/fixtures/fuzzy_parity.json'
import {
  Candidate,
  boundedLevenshtein,
  maxTypos,
  normalise,
  queryTerms,
  tokenise,
} from '@/lib/fuzzy'

describe('boundedLevenshtein', () => {
  it('計算編輯距離', () => {
    expect(boundedLevenshtein('daiquiri', 'daiquiri', 5)).toBe(0)
    expect(boundedLevenshtein('daiquiri', 'daquiri', 5)).toBe(1)
    expect(boundedLevenshtein('kitten', 'sitting', 5)).toBe(3)
  })

  it('超過上限時提前放棄', () => {
    // 只需知道「太遠」，不必算出精確值
    expect(boundedLevenshtein('daiquiri', 'manhattan', 2)).toBe(3)
  })

  it('上限為 0 時仍能判斷是否相同', () => {
    expect(boundedLevenshtein('gin', 'gin', 0)).toBe(0)
    expect(boundedLevenshtein('gin', 'sin', 0)).toBe(1)
  })
})

describe('maxTypos', () => {
  it('短詞不容錯', () => {
    // 否則 gin／sin／tin 會互相命中，搜尋失去意義
    expect(maxTypos('gin')).toBe(0)
    expect(maxTypos('rum')).toBe(0)
  })

  it('長詞容錯較多', () => {
    expect(maxTypos('sour')).toBe(1)
    expect(maxTypos('negroni')).toBe(2)
  })
})

describe('tokenise', () => {
  it('去除標點並統一大小寫', () => {
    expect(tokenise('Gin & Tonic!')).toEqual(['gin', 'tonic'])
  })

  it('中文不需分詞即可比對', () => {
    expect(tokenise('經典黛綺麗')).toEqual(['經典黛綺麗'])
  })

  it('壓縮空白', () => {
    expect(normalise('  Old   Fashioned \n')).toBe('old fashioned')
  })
})

describe('Candidate.score', () => {
  it('名稱命中勝過描述命中', () => {
    const nameHit = new Candidate({ name: ['Daiquiri'], description: ['something else'] })
    const descHit = new Candidate({ name: ['Manhattan'], description: ['like a daiquiri'] })
    const terms = queryTerms('daiquiri')
    expect(nameHit.score(terms)).toBeGreaterThan(descHit.score(terms))
  })

  it('完全命中勝過容錯命中', () => {
    const exact = new Candidate({ name: ['Negroni'] })
    const typo = new Candidate({ name: ['Negrone'] })
    const terms = queryTerms('negroni')
    expect(exact.score(terms)).toBeGreaterThan(typo.score(terms))
    expect(typo.score(terms)).toBeGreaterThan(0)
  })

  it('所有查詢詞都必須命中', () => {
    const c = new Candidate({ name: ['Gin Tonic'] })
    expect(c.score(queryTerms('gin tonic'))).toBeGreaterThan(0)
    expect(c.score(queryTerms('gin whisky'))).toBe(0)
  })

  it('片語原樣命中會加分', () => {
    const phrase = new Candidate({ name: ['Old Fashioned'] })
    const scattered = new Candidate({ name: ['Fashioned Old Timer'] })
    const terms = queryTerms('old fashioned')
    const p = normalise('old fashioned')
    expect(phrase.score(terms, p)).toBeGreaterThan(scattered.score(terms, p))
  })

  it('空查詢不給分', () => {
    expect(new Candidate({ name: ['Daiquiri'] }).score([])).toBe(0)
  })

  it('containsPhrase 區分確實符合與相近結果', () => {
    const c = new Candidate({ name: ['Classic Daiquiri'] })
    expect(c.containsPhrase('daiquiri')).toBe(true)
    expect(c.containsPhrase('daquiri')).toBe(false)
  })
})

describe('與後端實作的一致性', () => {
  // 基準值由 backend/engine/fuzzy.py 產生（scripts/gen_fuzzy_parity.py）；
  // 這裡逐項比對，任一側改了規則而另一側沒跟上就會失敗。
  it('編輯距離一致', () => {
    for (const c of parity.distances) {
      expect(boundedLevenshtein(c.a, c.b, c.limit)).toBe(c.expected)
    }
  })

  it('容錯額度一致', () => {
    for (const c of parity.maxTypos) {
      expect(maxTypos(c.term)).toBe(c.expected)
    }
  })

  it('切詞一致', () => {
    for (const c of parity.tokenise) {
      expect(normalise(c.text)).toBe(c.normalised)
      expect(tokenise(c.text)).toEqual(c.tokens)
    }
  })

  it('分數一致', () => {
    const candidates = parity.candidates.map(f => new Candidate(f as never))
    for (const c of parity.scores) {
      const score = candidates[c.candidate].score(queryTerms(c.query), normalise(c.query))
      expect(Number(score.toFixed(10))).toBeCloseTo(c.score, 9)
    }
  })
})
