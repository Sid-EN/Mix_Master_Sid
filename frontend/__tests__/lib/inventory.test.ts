/**
 * 庫存與成本
 *
 * 重點在於「資料不足時不要假裝算得出來」——把缺價格的材料當成 0
 * 會讓總成本嚴重低估，而使用者不會察覺。
 */
import {
  INVENTORY_KEY,
  costPerMl,
  loadInventory,
  recipeCost,
  remainingMl,
  saveInventory,
  servingsAvailable,
  type Inventory,
} from '@/lib/inventory'

const DAIQUIRI = [
  { slug: 'bacardi-rum', amount: 2, unit: 'oz' },
  { slug: 'fresh-lime-juice', amount: 0.75, unit: 'oz' },
  { slug: 'simple-syrup', amount: 0.75, unit: 'oz' },
]

const FULL: Inventory = {
  'bacardi-rum': { bottleMl: 700, price: 700 },            // 1 元/ml
  'fresh-lime-juice': { bottleMl: 1000, price: 200 },      // 0.2 元/ml
  'simple-syrup': { bottleMl: 500, price: 50 },            // 0.1 元/ml
}

beforeEach(() => localStorage.clear())

describe('儲存', () => {
  it('存取後內容相同', () => {
    saveInventory(FULL)
    expect(loadInventory()).toEqual(FULL)
  })

  it('沒有資料時回傳空物件', () => {
    expect(loadInventory()).toEqual({})
  })

  it('內容損毀時回傳空物件而非拋錯', () => {
    localStorage.setItem(INVENTORY_KEY, '{ not json')
    expect(loadInventory()).toEqual({})
  })

  it('型別不符時回傳空物件', () => {
    localStorage.setItem(INVENTORY_KEY, '["array"]')
    expect(loadInventory()).toEqual({})
  })
})

describe('costPerMl', () => {
  it('計算每毫升成本', () => {
    expect(costPerMl({ bottleMl: 700, price: 1400 })).toBeCloseTo(2)
  })

  it('資料不足時回傳 null 而非 0', () => {
    expect(costPerMl(undefined)).toBeNull()
    expect(costPerMl({ bottleMl: 0, price: 100 })).toBeNull()
    expect(costPerMl({ bottleMl: 700, price: NaN })).toBeNull()
  })

  it('價格為 0 是有效資料（自製糖漿）', () => {
    expect(costPerMl({ bottleMl: 500, price: 0 })).toBe(0)
  })
})

describe('remainingMl', () => {
  it('未填剩餘量時視為滿瓶', () => {
    expect(remainingMl({ bottleMl: 700, price: 700 })).toBe(700)
  })

  it('剩餘量不會超過瓶容量', () => {
    expect(remainingMl({ bottleMl: 700, price: 700, remainingMl: 900 })).toBe(700)
  })

  it('負數視為 0', () => {
    expect(remainingMl({ bottleMl: 700, price: 700, remainingMl: -5 })).toBe(0)
  })
})

describe('recipeCost', () => {
  it('資料齊全時算出單杯成本', () => {
    const { total, unknown, unmeasurable } = recipeCost(DAIQUIRI, FULL)
    // 2oz×1 + 0.75oz×0.2 + 0.75oz×0.1 = 59.15 + 4.44 + 2.22
    expect(total).toBeCloseTo(65.81, 1)
    expect(unknown).toEqual([])
    expect(unmeasurable).toEqual([])
  })

  it('缺價格的材料另外列出，不當成 0', () => {
    const { total, unknown } = recipeCost(DAIQUIRI, { 'bacardi-rum': FULL['bacardi-rum'] })
    expect(unknown).toEqual(['fresh-lime-juice', 'simple-syrup'])
    expect(total).toBeCloseTo(59.15, 1)   // 只含已知的部分
  })

  it('無法換算容積的材料另外列出', () => {
    const { unmeasurable } = recipeCost(
      [...DAIQUIRI, { slug: 'mint', amount: 8, unit: 'leaves' }], FULL)
    expect(unmeasurable).toEqual(['mint'])
  })

  it('空配方成本為 0', () => {
    expect(recipeCost([], FULL).total).toBe(0)
  })
})

describe('servingsAvailable', () => {
  it('取最少的可調杯數', () => {
    // 蘭姆 700ml ÷ 59.15 = 11；萊姆 1000 ÷ 22.18 = 45；糖漿 500 ÷ 22.18 = 22
    expect(servingsAvailable(DAIQUIRI, FULL)).toBe(11)
  })

  it('依剩餘量而非瓶容量計算', () => {
    const low = { ...FULL, 'bacardi-rum': { bottleMl: 700, price: 700, remainingMl: 100 } }
    expect(servingsAvailable(DAIQUIRI, low)).toBe(1)
  })

  it('任一材料缺庫存資料時回傳 null', () => {
    // 少一項就給不出可信的數字，寧可不給
    expect(servingsAvailable(DAIQUIRI, { 'bacardi-rum': FULL['bacardi-rum'] })).toBeNull()
  })

  it('不佔容積的裝飾不影響杯數', () => {
    const withGarnish = [...DAIQUIRI, { slug: 'lime-wheel', amount: 1, unit: 'slice' }]
    expect(servingsAvailable(withGarnish, FULL)).toBe(11)
  })

  it('材料用完時為 0 而非負數', () => {
    const empty = { ...FULL, 'bacardi-rum': { bottleMl: 700, price: 700, remainingMl: 0 } }
    expect(servingsAvailable(DAIQUIRI, empty)).toBe(0)
  })
})
