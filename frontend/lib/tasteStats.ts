/**
 * 口味統計
 *
 * 「風味偏好」是使用者自己填的理想值；這裡算的是**實際行為**——
 * 你收藏、做過、給高分的酒，實際上偏向什麼口味。兩者常常不一樣，
 * 而後者才反映真正的喜好。
 *
 * 全部由本機資料推導，不需要伺服器，靜態版一樣可用。
 */
import type { RecipeData } from './recipeData'

export interface FavouriteEntry {
  saved?: boolean
  rating?: number
  savedAt?: string
}

export interface TasteInput {
  /** mixmaster-favorites 的內容 */
  favourites: Record<string, FavouriteEntry>
  /** 做過的配方 slug（mixmaster-progress 的 recipesTried） */
  tried: string[]
}

export interface FlavourAverages {
  acid: number
  sweet: number
  bitter: number
  punch: number
}

export interface CountedItem {
  key: string
  label: string
  count: number
}

export interface TasteStats {
  /** 納入統計的配方數；為 0 時其餘欄位皆為 null */
  sampleSize: number
  flavour: FlavourAverages | null
  /** 全站平均，作為對照基準 */
  baseline: FlavourAverages | null
  /** 相對全站平均的差距（正值代表你偏好較高） */
  difference: FlavourAverages | null
  topIngredients: CountedItem[]
  methods: CountedItem[]
  topTags: CountedItem[]
  /** 最偏好的面向，用於一句話總結；資料不足時為 null */
  headline: string | null
}

const FLAVOUR_KEYS = ['acid', 'sweet', 'bitter', 'punch'] as const
const FLAVOUR_LABELS: Record<string, string> = {
  acid: '酸度', sweet: '甜度', bitter: '苦度', punch: '酒感',
}
const METHOD_LABELS: Record<string, string> = {
  shake: '搖盪法', stir: '攪拌法', build: '直調法', blend: '攪打法', throw: '拋接法',
}

/**
 * 每份配方的權重。
 *
 * 收藏或做過即計入；有評分時以評分調整（3 分為基準），
 * 讓「做過但不喜歡」不會和「五星最愛」等重。
 * 評分 1 分仍保留少量權重——你確實接觸過它。
 */
export function weightOf(entry: FavouriteEntry | undefined, tried: boolean): number {
  const saved = entry?.saved === true
  if (!saved && !tried) return 0
  const rating = entry?.rating
  if (typeof rating === 'number' && rating >= 1 && rating <= 5) return rating / 3
  return 1
}

function averageFlavour(
  samples: { flavour: Partial<FlavourAverages>; weight: number }[],
): FlavourAverages | null {
  if (samples.length === 0) return null
  const totals: Record<string, number> = {}
  const weights: Record<string, number> = {}
  for (const { flavour, weight } of samples) {
    for (const key of FLAVOUR_KEYS) {
      const value = flavour[key]
      if (typeof value !== 'number') continue      // 缺值不當成 0，直接不計入
      totals[key] = (totals[key] ?? 0) + value * weight
      weights[key] = (weights[key] ?? 0) + weight
    }
  }
  if (FLAVOUR_KEYS.every(k => !weights[k])) return null
  return {
    acid: weights.acid ? totals.acid / weights.acid : 0,
    sweet: weights.sweet ? totals.sweet / weights.sweet : 0,
    bitter: weights.bitter ? totals.bitter / weights.bitter : 0,
    punch: weights.punch ? totals.punch / weights.punch : 0,
  }
}

function topOf(counts: Map<string, number>, labels: Record<string, string>, max: number) {
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: labels[key] ?? key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, max)
}

/**
 * 由實際行為推導口味統計。
 *
 * 沒有任何收藏或紀錄時回傳 sampleSize 0 且其餘為 null，
 * 而不是回傳一組全 0 的數字——那會被讀成「你什麼都不喜歡」。
 */
export function computeTasteStats(
  input: TasteInput,
  data: RecipeData,
  topCount = 5,
): TasteStats {
  const triedSet = new Set(input.tried ?? [])
  const bySlug = new Map(data.recipes.map(r => [r.slug ?? r.id, r]))

  const samples: { flavour: Partial<FlavourAverages>; weight: number }[] = []
  const ingredientCounts = new Map<string, number>()
  const methodCounts = new Map<string, number>()
  const tagCounts = new Map<string, number>()
  let sampleSize = 0

  const slugs = new Set([...Object.keys(input.favourites ?? {}), ...triedSet])
  for (const slug of slugs) {
    const recipe = bySlug.get(slug)
    if (!recipe) continue                     // 已刪除或非經典配方
    const weight = weightOf(input.favourites?.[slug], triedSet.has(slug))
    if (weight <= 0) continue

    sampleSize++
    const flavour = (recipe as { flavorProfile?: Partial<FlavourAverages> | null }).flavorProfile
    if (flavour) samples.push({ flavour, weight })

    for (const ing of recipe.ingredients ?? []) {
      ingredientCounts.set(ing.slug, (ingredientCounts.get(ing.slug) ?? 0) + 1)
    }
    const method = (recipe as { method?: string }).method
    if (method) methodCounts.set(method, (methodCounts.get(method) ?? 0) + 1)
    for (const tag of (recipe as { tags?: string[] }).tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  if (sampleSize === 0) {
    return {
      sampleSize: 0, flavour: null, baseline: null, difference: null,
      topIngredients: [], methods: [], topTags: [], headline: null,
    }
  }

  const flavour = averageFlavour(samples)
  const baseline = averageFlavour(
    data.recipes
      .map(r => (r as { flavorProfile?: Partial<FlavourAverages> | null }).flavorProfile)
      .filter((f): f is Partial<FlavourAverages> => !!f)
      .map(f => ({ flavour: f, weight: 1 })),
  )

  const difference = flavour && baseline
    ? {
        acid: flavour.acid - baseline.acid,
        sweet: flavour.sweet - baseline.sweet,
        bitter: flavour.bitter - baseline.bitter,
        punch: flavour.punch - baseline.punch,
      }
    : null

  let headline: string | null = null
  if (difference) {
    const [key, value] = FLAVOUR_KEYS
      .map(k => [k, difference[k]] as const)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0]
    if (Math.abs(value) >= 0.05) {
      headline = `你偏好${FLAVOUR_LABELS[key]}比平均${value > 0 ? '高' : '低'}的酒`
    } else {
      headline = '你的口味相當均衡，沒有明顯偏向'
    }
  }

  return {
    sampleSize,
    flavour,
    baseline,
    difference,
    topIngredients: topOf(ingredientCounts, data.ingredientNames ?? {}, topCount),
    methods: topOf(methodCounts, METHOD_LABELS, 5),
    topTags: topOf(tagCounts, {}, topCount),
    headline,
  }
}

export { FLAVOUR_KEYS, FLAVOUR_LABELS, METHOD_LABELS }
