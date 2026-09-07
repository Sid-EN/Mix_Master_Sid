/**
 * 派對批量規劃
 *
 * 重點是彙總後的數字要能直接拿去採購：缺口算錯會少買，
 * 無法換算的材料被略過會漏買裝飾。
 */
import { bottlesToBuy, planTotals, type PlanRecipe } from '@/lib/partyPlan'
import type { Inventory } from '@/lib/inventory'

const RECIPES: PlanRecipe[] = [
  {
    id: 'negroni', nameZh: '內格羅尼',
    ingredients: [
      { slug: 'gin', amount: 1, unit: 'oz' },
      { slug: 'campari', amount: 1, unit: 'oz' },
      { slug: 'sweet-vermouth', amount: 1, unit: 'oz' },
    ],
  },
  {
    id: 'gin-tonic', nameZh: '琴通寧',
    ingredients: [
      { slug: 'gin', amount: 2, unit: 'oz' },
      { slug: 'tonic', amount: 4, unit: 'oz' },
      { slug: 'lime', amount: 1, unit: 'wedge' },
    ],
  },
]

const NAMES = {
  gin: '琴酒', campari: '金巴利', 'sweet-vermouth': '甜香艾酒',
  tonic: '通寧水', lime: '萊姆',
}

const INV: Inventory = {
  gin: { bottleMl: 700, price: 700 },
  campari: { bottleMl: 700, price: 1050 },
}

const need = (r: ReturnType<typeof planTotals>, slug: string) =>
  r.needs.find(n => n.slug === slug)!

describe('planTotals', () => {
  it('彙總同一材料在多道配方中的用量', () => {
    const r = planTotals(
      [{ recipeId: 'negroni', servings: 10 }, { recipeId: 'gin-tonic', servings: 5 }],
      RECIPES, NAMES)
    // 琴酒：10×1oz + 5×2oz = 20oz
    expect(need(r, 'gin').neededMl).toBeCloseTo(20 * 29.5735, 3)
    expect(need(r, 'gin').usedBy).toEqual(['內格羅尼', '琴通寧'])
  })

  it('總杯數為各配方杯數之和', () => {
    const r = planTotals(
      [{ recipeId: 'negroni', servings: 10 }, { recipeId: 'gin-tonic', servings: 5 }],
      RECIPES, NAMES)
    expect(r.totalServings).toBe(15)
  })

  it('無法換算的材料仍列出，但不給毫升數', () => {
    // 略過的話採購時會漏掉裝飾材料
    const r = planTotals([{ recipeId: 'gin-tonic', servings: 5 }], RECIPES, NAMES)
    const lime = need(r, 'lime')
    expect(lime.neededMl).toBeNull()
    expect(lime.usedBy).toEqual(['琴通寧'])
  })

  it('使用材料的顯示名稱', () => {
    const r = planTotals([{ recipeId: 'negroni', servings: 1 }], RECIPES, NAMES)
    expect(need(r, 'campari').name).toBe('金巴利')
  })

  it('沒有名稱資料時退回使用 slug', () => {
    const r = planTotals([{ recipeId: 'negroni', servings: 1 }], RECIPES, {})
    expect(need(r, 'campari').name).toBe('campari')
  })

  it('對照庫存算出缺口', () => {
    const r = planTotals([{ recipeId: 'negroni', servings: 30 }], RECIPES, NAMES, INV)
    // 琴酒需 30oz ≈ 887ml，庫存 700ml
    expect(need(r, 'gin').shortfallMl).toBeCloseTo(30 * 29.5735 - 700, 3)
  })

  it('庫存足夠時缺口為 0', () => {
    const r = planTotals([{ recipeId: 'negroni', servings: 5 }], RECIPES, NAMES, INV)
    expect(need(r, 'gin').shortfallMl).toBe(0)
  })

  it('沒有庫存資料時缺口為 null 而非全額', () => {
    const r = planTotals([{ recipeId: 'negroni', servings: 5 }], RECIPES, NAMES, INV)
    expect(need(r, 'sweet-vermouth').haveMl).toBeNull()
    expect(need(r, 'sweet-vermouth').shortfallMl).toBeNull()
  })

  it('只計入有價格的材料，其餘另計數量', () => {
    const r = planTotals([{ recipeId: 'negroni', servings: 10 }], RECIPES, NAMES, INV)
    expect(r.unpricedCount).toBe(1)                  // 甜香艾酒沒有價格
    expect(r.totalCost).toBeCloseTo(10 * 29.5735 * (1 + 1050 / 700), 2)
  })

  it('缺口大的排在前面，方便照著採購', () => {
    const r = planTotals([{ recipeId: 'negroni', servings: 30 }], RECIPES, NAMES, INV)
    expect(r.needs[0].slug).toBe('gin')
  })

  it('杯數為 0 的項目不列入', () => {
    const r = planTotals([{ recipeId: 'negroni', servings: 0 }], RECIPES, NAMES)
    expect(r.needs).toEqual([])
    expect(r.totalServings).toBe(0)
  })

  it('忽略不存在的配方', () => {
    const r = planTotals([{ recipeId: 'nope', servings: 5 }], RECIPES, NAMES)
    expect(r.needs).toEqual([])
  })

  it('空規劃回傳空結果', () => {
    const r = planTotals([], RECIPES, NAMES)
    expect(r).toEqual({ needs: [], totalCost: 0, unpricedCount: 0, totalServings: 0 })
  })
})

describe('bottlesToBuy', () => {
  const plan = planTotals([{ recipeId: 'negroni', servings: 30 }], RECIPES, NAMES, INV)

  it('無條件進位到整瓶', () => {
    // 缺口 187ml，700ml 一瓶 → 1 瓶
    expect(bottlesToBuy(need(plan, 'gin'), INV)).toBe(1)
  })

  it('庫存足夠時不需購買', () => {
    const enough = planTotals([{ recipeId: 'negroni', servings: 5 }], RECIPES, NAMES, INV)
    expect(bottlesToBuy(need(enough, 'gin'), INV)).toBe(0)
  })

  it('沒有瓶裝規格時回傳 null，不擅自假設容量', () => {
    expect(bottlesToBuy(need(plan, 'sweet-vermouth'), INV)).toBeNull()
  })

  it('大量缺口需要多瓶', () => {
    const big = planTotals([{ recipeId: 'negroni', servings: 100 }], RECIPES, NAMES, INV)
    // 缺口 100×29.5735 − 700 = 2257ml → 4 瓶
    expect(bottlesToBuy(need(big, 'gin'), INV)).toBe(4)
  })
})
