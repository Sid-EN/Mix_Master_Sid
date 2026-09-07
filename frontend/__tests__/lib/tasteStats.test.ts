/**
 * 口味統計
 *
 * 重點在於「沒有資料時不要編造結論」，以及權重要反映實際喜好：
 * 做過但給 1 分和五星最愛不該等重。
 */
import { computeTasteStats, weightOf } from '@/lib/tasteStats'
import type { RecipeData } from '@/lib/recipeData'

const DATA: RecipeData = {
  ingredientNames: { gin: '琴酒', campari: '金巴利', lime: '萊姆汁', rum: '蘭姆酒' },
  recipes: [
    {
      id: 'sour', slug: 'sour', nameZh: '酸酒', method: 'shake',
      tags: ['sour', 'classic'],
      ingredients: [{ slug: 'rum', amount: 2, unit: 'oz' }, { slug: 'lime', amount: 1, unit: 'oz' }],
      flavorProfile: { acid: 0.9, sweet: 0.5, bitter: 0.05, punch: 0.5 },
    } as never,
    {
      id: 'bitter', slug: 'bitter', nameZh: '苦酒', method: 'stir',
      tags: ['bitter', 'classic'],
      ingredients: [{ slug: 'gin', amount: 1, unit: 'oz' }, { slug: 'campari', amount: 1, unit: 'oz' }],
      flavorProfile: { acid: 0.1, sweet: 0.3, bitter: 0.9, punch: 0.7 },
    } as never,
    {
      id: 'plain', slug: 'plain', nameZh: '清爽', method: 'build',
      tags: ['highball'],
      ingredients: [{ slug: 'gin', amount: 1, unit: 'oz' }],
      flavorProfile: { acid: 0.3, sweet: 0.3, bitter: 0.3, punch: 0.3 },
    } as never,
  ],
}

const stats = (favourites: Record<string, unknown>, tried: string[] = []) =>
  computeTasteStats({ favourites: favourites as never, tried }, DATA)

describe('weightOf', () => {
  it('沒收藏也沒做過時不計入', () => {
    expect(weightOf(undefined, false)).toBe(0)
    expect(weightOf({ saved: false }, false)).toBe(0)
  })

  it('收藏或做過即計入', () => {
    expect(weightOf({ saved: true }, false)).toBe(1)
    expect(weightOf(undefined, true)).toBe(1)
  })

  it('評分調整權重，五星重於一星', () => {
    // 做過但不喜歡，不該和最愛等重
    expect(weightOf({ saved: true, rating: 5 }, true)).toBeCloseTo(5 / 3)
    expect(weightOf({ saved: true, rating: 1 }, true)).toBeCloseTo(1 / 3)
  })

  it('低分仍保留權重——你確實接觸過它', () => {
    expect(weightOf({ saved: true, rating: 1 }, true)).toBeGreaterThan(0)
  })

  it('忽略超出範圍的評分', () => {
    expect(weightOf({ saved: true, rating: 9 }, false)).toBe(1)
  })
})

describe('computeTasteStats', () => {
  it('沒有任何資料時不編造結論', () => {
    // 回傳全 0 會被讀成「你什麼都不喜歡」
    const s = stats({})
    expect(s.sampleSize).toBe(0)
    expect(s.flavour).toBeNull()
    expect(s.headline).toBeNull()
    expect(s.topIngredients).toEqual([])
  })

  it('只計入收藏或做過的配方', () => {
    expect(stats({ sour: { saved: true } }).sampleSize).toBe(1)
    expect(stats({ sour: { saved: false } }).sampleSize).toBe(0)
    expect(stats({}, ['bitter']).sampleSize).toBe(1)
  })

  it('同一配方既收藏又做過只算一次', () => {
    expect(stats({ sour: { saved: true } }, ['sour']).sampleSize).toBe(1)
  })

  it('忽略資料中不存在的配方', () => {
    expect(stats({ 'no-such-recipe': { saved: true } }).sampleSize).toBe(0)
  })

  it('算出風味平均', () => {
    const s = stats({ sour: { saved: true } })
    expect(s.flavour!.acid).toBeCloseTo(0.9)
    expect(s.flavour!.bitter).toBeCloseTo(0.05)
  })

  it('評分高的配方對平均影響較大', () => {
    const loved = stats({ sour: { saved: true, rating: 5 }, bitter: { saved: true, rating: 1 } })
    const equal = stats({ sour: { saved: true }, bitter: { saved: true } })
    expect(loved.flavour!.acid).toBeGreaterThan(equal.flavour!.acid)
  })

  it('與全站平均比較後給出差距', () => {
    const s = stats({ sour: { saved: true } })
    expect(s.baseline).not.toBeNull()
    expect(s.difference!.acid).toBeGreaterThan(0)     // 只喝酸酒的人偏酸
    expect(s.difference!.bitter).toBeLessThan(0)
  })

  it('以一句話總結最明顯的偏好', () => {
    expect(stats({ sour: { saved: true } }).headline).toContain('酸度')
    expect(stats({ bitter: { saved: true } }).headline).toContain('苦度')
  })

  it('沒有明顯偏向時如實說出', () => {
    // 專用資料：兩道配方對稱分布，全都喜歡即等於落在全站平均上
    const symmetric: RecipeData = {
      ingredientNames: {},
      recipes: [
        { id: 'low', slug: 'low', method: 'stir', tags: [], ingredients: [],
          flavorProfile: { acid: 0.2, sweet: 0.2, bitter: 0.2, punch: 0.2 } } as never,
        { id: 'high', slug: 'high', method: 'stir', tags: [], ingredients: [],
          flavorProfile: { acid: 0.4, sweet: 0.4, bitter: 0.4, punch: 0.4 } } as never,
      ],
    }
    const s = computeTasteStats(
      { favourites: { low: { saved: true }, high: { saved: true } }, tried: [] }, symmetric)
    expect(s.difference!.acid).toBeCloseTo(0)
    expect(s.headline).toContain('均衡')
  })

  it('明顯偏離平均時指出方向', () => {
    // 只喝清爽的酒，酒感自然低於全站平均
    expect(stats({ plain: { saved: true } }).headline).toContain('低')
  })

  it('統計最常出現的材料並使用中文名稱', () => {
    const s = stats({ sour: { saved: true }, bitter: { saved: true }, plain: { saved: true } })
    expect(s.topIngredients[0]).toEqual({ key: 'gin', label: '琴酒', count: 2 })
  })

  it('統計調製手法', () => {
    const s = stats({ sour: { saved: true }, bitter: { saved: true } })
    expect(s.methods.map(m => m.label).sort()).toEqual(['搖盪法', '攪拌法'])
  })

  it('統計標籤', () => {
    const s = stats({ sour: { saved: true }, bitter: { saved: true } })
    expect(s.topTags[0]).toEqual({ key: 'classic', label: 'classic', count: 2 })
  })

  it('缺少風味資料的配方仍計入次數統計', () => {
    const noFlavour: RecipeData = {
      ingredientNames: { gin: '琴酒' },
      recipes: [{ id: 'x', slug: 'x', nameZh: 'X', method: 'stir',
                  ingredients: [{ slug: 'gin', amount: 1, unit: 'oz' }] } as never],
    }
    const s = computeTasteStats({ favourites: { x: { saved: true } }, tried: [] }, noFlavour)
    expect(s.sampleSize).toBe(1)
    expect(s.topIngredients[0].count).toBe(1)
    // 沒有任何風味資料就不給風味平均，而不是給 0
    expect(s.flavour).toBeNull()
  })
})
