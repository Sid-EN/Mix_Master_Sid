import { getRecommendedPairings, getAllScoredPairings, foodPairings } from '@/lib/foodPairing'

const recipe = {
  id: 'classic-negroni',
  nameEn: 'Negroni',
  nameZh: '尼格羅尼',
  method: 'stir',
  tags: ['classic', 'bitter', 'spirit-forward'],
  ingredients: [{ slug: 'campari' }, { slug: 'sweet-vermouth' }],
}

describe('foodPairing', () => {
  it('回傳數量不超過指定上限', () => {
    expect(getRecommendedPairings(recipe, 3).length).toBeLessThanOrEqual(3)
  })

  it('結果依分數由高至低排序', () => {
    const scores = getAllScoredPairings(recipe).map((p: any) => p.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
  })

  it('配方缺欄位時不丟出例外', () => {
    expect(() => getRecommendedPairings({} as any)).not.toThrow()
    expect(() => getRecommendedPairings({ tags: null } as any)).not.toThrow()
  })

  it('餐搭資料本身非空且具備必要欄位', () => {
    expect(foodPairings.length).toBeGreaterThan(0)
    foodPairings.forEach((p: any) => {
      expect(p.nameZh ?? p.name).toBeTruthy()
    })
  })
})
