/**
 * 建置期直接讀取的靜態資料
 *
 * 靜態匯出時沒有後端可呼叫，改由 repo 內的 JSON 取得。
 * 資料由 scripts/prepare-static-data.mjs 於建置前複製至 frontend/data/。
 */
import classicRecipes from '@/data/classic_recipes.json'
import recipeTranslations from '@/data/recipe_translations.json'
import ingredients from '@/data/ingredients.json'
import prepRecipes from '@/data/prep_recipes.json'

const ingredientIndex: Record<string, any> = Object.fromEntries(
  (ingredients as any[]).map(i => [i.id, i]),
)

/**
 * 可翻譯的欄位。
 *
 * 名稱與描述本來就有英文欄位；此處只處理原本僅有中文的內容。
 * 與後端 routes_recipes.py 的 TRANSLATABLE_FIELDS 一致。
 */
const TRANSLATABLE_FIELDS = ['steps', 'garnish', 'tips', 'story', 'pairings'] as const

/**
 * 附上英文內容，形狀與後端一致。
 *
 * 以 <欄位>En 並列而非就地取代：前端要能在不重新取資料的情況下切換語言。
 * 尚未翻譯的欄位不會出現，介面據此回退到中文原文。
 */
function withTranslations(recipe: any) {
  const entry = (recipeTranslations as Record<string, { en?: Record<string, unknown> }>)[recipe.id]
  const english = entry?.en
  if (!english) return recipe

  const out = { ...recipe }
  for (const field of TRANSLATABLE_FIELDS) {
    const value = english[field]
    if (value) out[`${field}En`] = value
  }
  return out
}

/** 補上材料名稱，與後端 API 的回傳形狀一致。 */
function withIngredientNames(recipe: any) {
  return {
    ...recipe,
    ingredients: (recipe.ingredients ?? []).map((ing: any) => ({
      ...ing,
      name: ingredientIndex[ing.slug]?.name ?? ing.name ?? ing.slug ?? '',
      nameZh: ingredientIndex[ing.slug]?.nameZh ?? ing.nameZh ?? '',
    })),
  }
}

export function getClassicRecipes() {
  return (classicRecipes as any[]).map(r => withTranslations(withIngredientNames(r)))
}

export function getClassicRecipe(slug: string) {
  const found = (classicRecipes as any[]).find(
    r => r.id === slug || r.slug === slug,
  )
  return found ? withTranslations(withIngredientNames(found)) : null
}

export function getPrepRecipes() {
  return prepRecipes as any[]
}

export function getPrepRecipe(slug: string) {
  return (prepRecipes as any[]).find(r => r.id === slug || r.slug === slug) ?? null
}

export function getIngredients() {
  return ingredients as any[]
}
