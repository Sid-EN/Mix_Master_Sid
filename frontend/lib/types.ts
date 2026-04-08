/**
 * types.ts — MixMaster 全域 TypeScript 型別定義
 */

// ── 風味維度 ────────────────────────────────────────────────
export const FLAVOR_DIMENSIONS = [
  'citrus',       // 0
  'tropical',     // 1
  'berry',        // 2
  'stone_fruit',  // 3
  'herbal',       // 4
  'floral',       // 5
  'spicy',        // 6
  'earthy',       // 7
  'smoky',        // 8
  'nutty',        // 9
  'vanilla',      // 10
  'caramel',      // 11
  'bitter',       // 12
  'umami',        // 13
  'oak',          // 14
] as const

export type FlavorDimension = typeof FLAVOR_DIMENSIONS[number]
export type FlavorVector = [
  number, number, number, number, number,
  number, number, number, number, number,
  number, number, number, number, number
]

// ── 材料型別 ────────────────────────────────────────────────
export type IngredientCategory =
  | 'base_spirit' | 'liqueur' | 'fortified_wine'
  | 'wine' | 'beer' | 'mixer' | 'juice'
  | 'syrup' | 'bitter' | 'fresh' | 'dairy' | 'egg' | 'garnish'

export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'exotic'

export interface Ingredient {
  id: string
  name: string
  nameZh: string
  brand?: string
  category: IngredientCategory
  subcategory?: string
  abv: number
  sugarContent?: number
  acidPH?: number
  bitterUnit?: number
  caloriesPer30ml?: number
  flavorVector: FlavorVector
  flavorTags: FlavorDimension[]
  aroma: string[]
  taste: string[]
  finish?: string
  origin?: string
  productionMethod?: string
  aging?: string
  rarity: RarityLevel
  colorHex: string
  description: string
  descriptionZh: string
  substitutes?: string[]
  pairingBonus?: Record<string, number>
  imageUrl?: string
  tags?: string[]
}

// ── 配方型別 ────────────────────────────────────────────────
export type RecipeMethod = 'shake' | 'stir' | 'build' | 'roll' | 'throw'
export type RecipeGrade = 'A' | 'B' | 'C' | 'D'
export type RecipeType = 'classic' | 'generated' | 'user'

export interface RecipeIngredientItem {
  ingredientId: string
  ingredientName: string
  ingredientNameZh: string
  amount: number
  unit: string
  isOptional?: boolean
  notes?: string
}

export interface FlavorProfile {
  vector: number[]
  primaryFlavors: string[]
  description: string
}

export interface AlternativeSuggestion {
  issue: string
  suggestion: string
  replaceSlugs: string[]
}

export interface Recipe {
  nameEn: string
  nameZh: string
  method: RecipeMethod
  glassType: string
  balanceScore: number
  grade: RecipeGrade
  ingredients: RecipeIngredientItem[]
  steps: string[]
  garnish?: string
  flavorProfile: FlavorProfile
  alternatives?: AlternativeSuggestion[]
}

export interface GenerateRecipeRequest {
  availableIngredients: string[]
  preferences?: {
    style?: 'sour' | 'sweet' | 'bitter' | 'refreshing' | 'strong'
    glass?: string
    maxIngredients?: number
    isAlcoholic?: boolean
  }
  userLevel?: 1 | 2 | 3 | 4 | 5
}

export interface GenerateRecipeResponse {
  success: boolean
  recipe: Recipe
  insights: {
    balanceAnalysis: string
    tipsForImprovement?: string
  }
}

// ── 學院型別 ────────────────────────────────────────────────
export type AcademyLevel = 1 | 2 | 3 | 4 | 5

export interface AcademyArticle {
  slug: string
  title: string
  titleZh: string
  category: 'tools' | 'techniques' | 'wine' | 'spirits' | 'curriculum'
  level: AcademyLevel
  readingTimeMin: number
  tags: string[]
  excerpt: string
}

export interface CurriculumLevel {
  level: AcademyLevel
  name: string
  weeks: string
  coreSkills: string[]
  capstoneProject: string
  unlockRequirement?: string
}

// ── UI 狀態型別 ─────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

// ── API 共用型別 ─────────────────────────────────────────────
export interface ApiError {
  detail: string
  status: number
}

export interface PaginatedResponse<T> {
  total: number
  items: T[]
}
