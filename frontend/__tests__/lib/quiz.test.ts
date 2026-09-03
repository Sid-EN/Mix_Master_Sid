import { quizQuestions, QUIZ_CATEGORIES, QUESTIONS_PER_ROUND } from '@/lib/quizData'

describe('quizData', () => {
  it('題庫足以支撐一輪測驗', () => {
    expect(quizQuestions.length).toBeGreaterThanOrEqual(QUESTIONS_PER_ROUND)
  })

  it('每題的正解索引都落在選項範圍內', () => {
    quizQuestions.forEach((q: any) => {
      const answer = q.answer ?? q.correct ?? q.correctIndex
      expect(typeof answer).toBe('number')
      expect(answer).toBeGreaterThanOrEqual(0)
      expect(answer).toBeLessThan(q.options.length)
    })
  })

  it('每題至少有兩個選項且不重複', () => {
    quizQuestions.forEach((q: any) => {
      expect(q.options.length).toBeGreaterThanOrEqual(2)
      expect(new Set(q.options).size).toBe(q.options.length)
    })
  })

  it('題目分類都在已定義清單內', () => {
    const known = QUIZ_CATEGORIES.map((c: any) => c.id ?? c.key ?? c)
    quizQuestions.forEach((q: any) => {
      if (q.category) expect(known).toContain(q.category)
    })
  })

  it('題目 id 不重複', () => {
    const ids = quizQuestions.map((q: any) => q.id).filter(Boolean)
    if (ids.length) expect(new Set(ids).size).toBe(ids.length)
  })
})
