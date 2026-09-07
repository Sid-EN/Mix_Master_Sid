/**
 * 建置期直接讀取的靜態資料
 *
 * 靜態匯出時沒有後端可呼叫，改由 repo 內的 JSON 取得。
 * 資料由 scripts/prepare-static-data.mjs 於建置前複製至 frontend/data/。
 */
import classicRecipes from '@/data/classic_recipes.json'
import ingredients from '@/data/ingredients.json'
import prepRecipes from '@/data/prep_recipes.json'

const ingredientIndex: Record<string, any> = Object.fromEntries(
  (ingredients as any[]).map(i => [i.id, i]),
)

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
  return (classicRecipes as any[]).map(withIngredientNames)
}

export function getClassicRecipe(slug: string) {
  const found = (classicRecipes as any[]).find(
    r => r.id === slug || r.slug === slug,
  )
  return found ? withIngredientNames(found) : null
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
