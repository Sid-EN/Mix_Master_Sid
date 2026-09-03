export interface FoodPairing {
  nameZh: string
  nameEn: string
  icon: string
  category: 'appetizer' | 'seafood' | 'meat' | 'cheese' | 'dessert' | 'snack' | 'fruit'
  categoryZh: string
  description: string
  bestWith: string[]
  avoidWith: string[]
}

export const foodPairings: FoodPairing[] = [
  // ── 🥗 開胃小品 Appetizer ──────────────────────────────────
  {
    nameZh: '布魯塞塔',
    nameEn: 'Bruschetta',
    icon: '🍅',
    category: 'appetizer',
    categoryZh: '開胃小品',
    description: '番茄羅勒的清新酸甜，與柑橘系或草本調酒相得益彰',
    bestWith: ['citrus', 'herbal', 'gin', 'dry', 'light', 'vodka', 'aperol'],
    avoidWith: ['smoky', 'heavy', 'cream'],
  },
  {
    nameZh: '生蠔',
    nameEn: 'Raw Oysters',
    icon: '🦪',
    category: 'appetizer',
    categoryZh: '開胃小品',
    description: '海洋鮮味需要乾爽俐落的酒體來襯托，避免甜膩',
    bestWith: ['dry', 'crisp', 'champagne', 'sparkling', 'gin', 'vodka', 'citrus', 'clean'],
    avoidWith: ['sweet', 'cream', 'smoky', 'bourbon'],
  },
  {
    nameZh: '炸薯條',
    nameEn: 'French Fries',
    icon: '🍟',
    category: 'appetizer',
    categoryZh: '開胃小品',
    description: '油炸的鹹香配上微苦的酒飲，清爽解膩',
    bestWith: ['bitter', 'hoppy', 'ipa', 'beer', 'citrus', 'light', 'dry'],
    avoidWith: ['sweet', 'cream', 'floral'],
  },
  {
    nameZh: '墨西哥玉米片',
    nameEn: 'Nachos',
    icon: '🌮',
    category: 'appetizer',
    categoryZh: '開胃小品',
    description: '辛辣起司配龍舌蘭基底的調酒，墨西哥風情的完美搭配',
    bestWith: ['tequila', 'mezcal', 'spicy', 'lime', 'citrus', 'agave', 'margarita'],
    avoidWith: ['floral', 'delicate', 'champagne'],
  },
  {
    nameZh: '橄欖',
    nameEn: 'Olives',
    icon: '🫒',
    category: 'appetizer',
    categoryZh: '開胃小品',
    description: '鹹鮮橄欖是馬丁尼的經典伴侶，乾型調酒的最佳良伴',
    bestWith: ['dry', 'gin', 'vodka', 'martini', 'vermouth', 'herbal', 'bitter'],
    avoidWith: ['sweet', 'tropical', 'cream', 'fruit'],
  },
  {
    nameZh: '火腿拼盤',
    nameEn: 'Charcuterie',
    icon: '🥓',
    category: 'appetizer',
    categoryZh: '開胃小品',
    description: '醃製肉品的豐富風味，與苦味草本調酒形成美妙平衡',
    bestWith: ['bitter', 'herbal', 'amaro', 'negroni', 'vermouth', 'whisky', 'bourbon'],
    avoidWith: ['sweet', 'tropical', 'cream'],
  },
  {
    nameZh: '烤麵包佐鷹嘴豆泥',
    nameEn: 'Hummus & Pita',
    icon: '🫓',
    category: 'appetizer',
    categoryZh: '開胃小品',
    description: '綿密的鷹嘴豆泥搭配清爽草本調酒，地中海風情',
    bestWith: ['herbal', 'citrus', 'gin', 'light', 'dry', 'vodka'],
    avoidWith: ['smoky', 'heavy', 'bourbon'],
  },
  {
    nameZh: '春捲',
    nameEn: 'Spring Rolls',
    icon: '🥟',
    category: 'appetizer',
    categoryZh: '開胃小品',
    description: '清爽蔬菜春捲與柑橘或薑味調酒的亞洲風搭配',
    bestWith: ['citrus', 'ginger', 'light', 'vodka', 'sake', 'gin', 'tropical'],
    avoidWith: ['heavy', 'smoky', 'bourbon'],
  },

  // ── 🦐 海鮮 Seafood ───────────────────────────────────────
  {
    nameZh: '烤蝦',
    nameEn: 'Grilled Shrimp',
    icon: '🦐',
    category: 'seafood',
    categoryZh: '海鮮',
    description: '炭烤蝦的甜美搭配熱帶水果風味，柑橘調提升鮮味',
    bestWith: ['citrus', 'tropical', 'rum', 'tequila', 'lime', 'light', 'coconut'],
    avoidWith: ['heavy', 'cream', 'bitter'],
  },
  {
    nameZh: '鮭魚',
    nameEn: 'Salmon',
    icon: '🐟',
    category: 'seafood',
    categoryZh: '海鮮',
    description: '油脂豐富的鮭魚與煙燻威士忌風味相輔相成',
    bestWith: ['smoky', 'whisky', 'scotch', 'bourbon', 'oak', 'aged', 'peaty'],
    avoidWith: ['sweet', 'tropical', 'cream'],
  },
  {
    nameZh: '蟹肉',
    nameEn: 'Crab',
    icon: '🦀',
    category: 'seafood',
    categoryZh: '海鮮',
    description: '細緻蟹肉適合清淡琴酒基底，讓鮮甜滋味綻放',
    bestWith: ['gin', 'light', 'citrus', 'dry', 'cucumber', 'elderflower', 'clean'],
    avoidWith: ['smoky', 'heavy', 'bourbon', 'bitter'],
  },
  {
    nameZh: '鮪魚塔塔',
    nameEn: 'Tuna Tartare',
    icon: '🍣',
    category: 'seafood',
    categoryZh: '海鮮',
    description: '生鮪魚的純淨口感需要乾淨俐落的柑橘調酒來映襯',
    bestWith: ['citrus', 'clean', 'gin', 'vodka', 'sake', 'dry', 'yuzu', 'light'],
    avoidWith: ['smoky', 'heavy', 'cream', 'sweet'],
  },
  {
    nameZh: '烤干貝',
    nameEn: 'Seared Scallops',
    icon: '🥘',
    category: 'seafood',
    categoryZh: '海鮮',
    description: '煎烤干貝的焦糖化甜味，與香檳或奶油調酒優雅結合',
    bestWith: ['champagne', 'sparkling', 'butter', 'citrus', 'light', 'vodka', 'clean'],
    avoidWith: ['smoky', 'bitter', 'heavy'],
  },

  // ── 🥩 肉類 Meat ──────────────────────────────────────────
  {
    nameZh: '牛排',
    nameEn: 'Steak',
    icon: '🥩',
    category: 'meat',
    categoryZh: '肉類',
    description: '炭烤牛排的濃郁肉香，與波本或煙燻調酒是天作之合',
    bestWith: ['smoky', 'bourbon', 'whisky', 'strong', 'oak', 'aged', 'rye', 'manhattan'],
    avoidWith: ['light', 'floral', 'delicate', 'sparkling'],
  },
  {
    nameZh: '燒烤肋排',
    nameEn: 'BBQ Ribs',
    icon: '🍖',
    category: 'meat',
    categoryZh: '肉類',
    description: '煙燻烤肋排搭配波本威士忌調酒，煙與火的饗宴',
    bestWith: ['bourbon', 'smoky', 'whisky', 'strong', 'bbq', 'rye', 'cola'],
    avoidWith: ['light', 'floral', 'champagne', 'delicate'],
  },
  {
    nameZh: '鴨胸',
    nameEn: 'Duck Breast',
    icon: '🦆',
    category: 'meat',
    categoryZh: '肉類',
    description: '鴨肉的野味與莓果風味、紅酒基底調酒完美融合',
    bestWith: ['berry', 'wine', 'red', 'port', 'cassis', 'herbal', 'rosemary'],
    avoidWith: ['tropical', 'coconut', 'cream'],
  },
  {
    nameZh: '羊排',
    nameEn: 'Lamb Chops',
    icon: '🐑',
    category: 'meat',
    categoryZh: '肉類',
    description: '羊排與迷迭香草本調酒的地中海經典組合',
    bestWith: ['herbal', 'rosemary', 'gin', 'bitter', 'amaro', 'whisky', 'aged'],
    avoidWith: ['sweet', 'tropical', 'cream', 'fruit'],
  },
  {
    nameZh: '雞肉串燒',
    nameEn: 'Chicken Skewers',
    icon: '🍢',
    category: 'meat',
    categoryZh: '肉類',
    description: '烤雞肉的百搭性，柑橘或輕爽調酒皆宜',
    bestWith: ['citrus', 'light', 'gin', 'vodka', 'beer', 'lemon', 'ginger'],
    avoidWith: ['heavy', 'smoky'],
  },

  // ── 🧀 起司 Cheese ─────────────────────────────────────────
  {
    nameZh: '布里起司',
    nameEn: 'Brie',
    icon: '🧀',
    category: 'cheese',
    categoryZh: '起司',
    description: '綿密奶油質地的布里，與氣泡酒或香檳調酒是經典搭配',
    bestWith: ['champagne', 'sparkling', 'elderflower', 'light', 'dry', 'prosecco'],
    avoidWith: ['smoky', 'heavy', 'bitter'],
  },
  {
    nameZh: '帕瑪森',
    nameEn: 'Parmesan',
    icon: '🧀',
    category: 'cheese',
    categoryZh: '起司',
    description: '陳年帕瑪森的鮮味結晶，與陳年烈酒或苦味利口酒共鳴',
    bestWith: ['aged', 'amaro', 'whisky', 'bourbon', 'bitter', 'vermouth', 'sherry'],
    avoidWith: ['tropical', 'sweet', 'cream'],
  },
  {
    nameZh: '藍紋起司',
    nameEn: 'Blue Cheese',
    icon: '🧀',
    category: 'cheese',
    categoryZh: '起司',
    description: '濃烈的藍紋起司需要甜度來平衡，波特酒風格最佳',
    bestWith: ['sweet', 'port', 'honey', 'dessert', 'sherry', 'fortified', 'walnut'],
    avoidWith: ['dry', 'citrus', 'light', 'clean'],
  },
  {
    nameZh: '切達起司',
    nameEn: 'Cheddar',
    icon: '🧀',
    category: 'cheese',
    categoryZh: '起司',
    description: '切達的堅果奶香與威士忌或蘋果調酒的經典英式搭配',
    bestWith: ['whisky', 'apple', 'cider', 'bourbon', 'aged', 'scotch', 'oak'],
    avoidWith: ['tropical', 'floral', 'coconut'],
  },
  {
    nameZh: '山羊起司',
    nameEn: 'Goat Cheese',
    icon: '🐐',
    category: 'cheese',
    categoryZh: '起司',
    description: '山羊起司的酸香搭配柑橘草本調酒，清新不膩',
    bestWith: ['citrus', 'herbal', 'gin', 'light', 'dry', 'sauvignon', 'elderflower'],
    avoidWith: ['heavy', 'smoky', 'bourbon', 'cream'],
  },

  // ── 🍰 甜點 Dessert ────────────────────────────────────────
  {
    nameZh: '巧克力慕斯',
    nameEn: 'Chocolate Mousse',
    icon: '🍫',
    category: 'dessert',
    categoryZh: '甜點',
    description: '濃郁巧克力搭配咖啡或奶油利口酒調酒，甜蜜享受',
    bestWith: ['coffee', 'cream', 'espresso', 'kahlua', 'baileys', 'chocolate', 'rum'],
    avoidWith: ['citrus', 'dry', 'bitter', 'gin'],
  },
  {
    nameZh: '提拉米蘇',
    nameEn: 'Tiramisu',
    icon: '🍰',
    category: 'dessert',
    categoryZh: '甜點',
    description: '咖啡馬斯卡彭的義式經典，搭配濃縮咖啡馬丁尼完美',
    bestWith: ['espresso', 'coffee', 'cream', 'kahlua', 'amaretto', 'vodka', 'martini'],
    avoidWith: ['citrus', 'dry', 'herbal', 'bitter'],
  },
  {
    nameZh: '焦糖布丁',
    nameEn: 'Crème Brûlée',
    icon: '🍮',
    category: 'dessert',
    categoryZh: '甜點',
    description: '焦糖布丁的香草甜蜜與波本的香草橡木風味一拍即合',
    bestWith: ['vanilla', 'bourbon', 'cream', 'caramel', 'aged', 'cognac', 'brandy'],
    avoidWith: ['citrus', 'bitter', 'dry', 'gin'],
  },
  {
    nameZh: '水果塔',
    nameEn: 'Fruit Tart',
    icon: '🥧',
    category: 'dessert',
    categoryZh: '甜點',
    description: '新鮮水果塔搭配氣泡或接骨木花調酒，優雅清新',
    bestWith: ['sparkling', 'elderflower', 'champagne', 'prosecco', 'floral', 'light', 'berry'],
    avoidWith: ['smoky', 'heavy', 'bourbon', 'bitter'],
  },
  {
    nameZh: '馬卡龍',
    nameEn: 'Macaron',
    icon: '🧁',
    category: 'dessert',
    categoryZh: '甜點',
    description: '精緻馬卡龍與香檳或花香調酒，法式優雅的極致',
    bestWith: ['champagne', 'floral', 'sparkling', 'elderflower', 'rose', 'prosecco', 'light'],
    avoidWith: ['smoky', 'bitter', 'heavy', 'bourbon'],
  },
  {
    nameZh: '冰淇淋',
    nameEn: 'Ice Cream',
    icon: '🍨',
    category: 'dessert',
    categoryZh: '甜點',
    description: '香草冰淇淋淋上利口酒，或搭配甜味調酒的放縱享受',
    bestWith: ['cream', 'vanilla', 'coffee', 'kahlua', 'baileys', 'amaretto', 'rum'],
    avoidWith: ['dry', 'bitter', 'herbal'],
  },

  // ── 🍿 小食 Snack ──────────────────────────────────────────
  {
    nameZh: '堅果',
    nameEn: 'Mixed Nuts',
    icon: '🥜',
    category: 'snack',
    categoryZh: '小食',
    description: '烘烤堅果的油脂香氣與陳年威士忌的木質調完美呼應',
    bestWith: ['whisky', 'aged', 'bourbon', 'scotch', 'oak', 'sherry', 'cognac'],
    avoidWith: ['tropical', 'floral', 'light'],
  },
  {
    nameZh: '黑巧克力',
    nameEn: 'Dark Chocolate',
    icon: '🍫',
    category: 'snack',
    categoryZh: '小食',
    description: '苦甜巧克力與蘭姆酒或干邑的深邃風味層層堆疊',
    bestWith: ['rum', 'cognac', 'brandy', 'coffee', 'espresso', 'aged', 'whisky'],
    avoidWith: ['citrus', 'light', 'gin', 'dry'],
  },
  {
    nameZh: '爆米花',
    nameEn: 'Popcorn',
    icon: '🍿',
    category: 'snack',
    categoryZh: '小食',
    description: '輕盈的爆米花搭配氣泡酒或清爽調酒，休閒隨性',
    bestWith: ['sparkling', 'light', 'champagne', 'beer', 'prosecco', 'vodka', 'citrus'],
    avoidWith: ['heavy', 'smoky', 'bitter'],
  },
  {
    nameZh: '毛豆',
    nameEn: 'Edamame',
    icon: '🫛',
    category: 'snack',
    categoryZh: '小食',
    description: '日式毛豆配清酒或琴酒調酒，簡單而美好',
    bestWith: ['sake', 'gin', 'light', 'citrus', 'vodka', 'clean', 'dry', 'yuzu'],
    avoidWith: ['heavy', 'smoky', 'cream'],
  },
  {
    nameZh: '起司條',
    nameEn: 'Cheese Sticks',
    icon: '🧀',
    category: 'snack',
    categoryZh: '小食',
    description: '酥炸起司條的鹹香，需要清爽調酒來平衡油脂',
    bestWith: ['light', 'citrus', 'beer', 'gin', 'vodka', 'dry', 'sparkling'],
    avoidWith: ['sweet', 'cream', 'heavy'],
  },

  // ── 🍎 水果 Fruit ──────────────────────────────────────────
  {
    nameZh: '莓果拼盤',
    nameEn: 'Berry Platter',
    icon: '🍓',
    category: 'fruit',
    categoryZh: '水果',
    description: '新鮮莓果與琴酒或伏特加調酒，自然的果香疊加',
    bestWith: ['gin', 'vodka', 'berry', 'light', 'sparkling', 'elderflower', 'prosecco'],
    avoidWith: ['smoky', 'heavy', 'bourbon', 'bitter'],
  },
  {
    nameZh: '熱帶水果',
    nameEn: 'Tropical Fruits',
    icon: '🥭',
    category: 'fruit',
    categoryZh: '水果',
    description: '芒果鳳梨的熱帶風情搭配蘭姆酒或龍舌蘭，陽光滿溢',
    bestWith: ['rum', 'tequila', 'tropical', 'coconut', 'mango', 'pineapple', 'passion'],
    avoidWith: ['smoky', 'bitter', 'amaro'],
  },
  {
    nameZh: '柑橘片',
    nameEn: 'Citrus Slices',
    icon: '🍊',
    category: 'fruit',
    categoryZh: '水果',
    description: '柳橙檸檬片是任何柑橘系調酒的天然好搭檔',
    bestWith: ['citrus', 'gin', 'vodka', 'tequila', 'rum', 'lemon', 'lime', 'orange'],
    avoidWith: ['cream', 'coffee', 'heavy'],
  },
  {
    nameZh: '葡萄',
    nameEn: 'Grapes',
    icon: '🍇',
    category: 'fruit',
    categoryZh: '水果',
    description: '新鮮葡萄與白蘭地或氣泡酒的優雅果香對話',
    bestWith: ['brandy', 'cognac', 'champagne', 'sparkling', 'wine', 'prosecco', 'light'],
    avoidWith: ['smoky', 'heavy', 'bitter'],
  },
  {
    nameZh: '蘋果片',
    nameEn: 'Apple Slices',
    icon: '🍎',
    category: 'fruit',
    categoryZh: '水果',
    description: '蘋果的清甜搭配蘋果白蘭地或威士忌，秋日的溫暖',
    bestWith: ['apple', 'cider', 'calvados', 'whisky', 'bourbon', 'cinnamon', 'aged'],
    avoidWith: ['tropical', 'coconut', 'heavy'],
  },
]

const CATEGORY_ICONS: Record<string, string> = {
  appetizer: '🥗',
  seafood: '🦐',
  meat: '🥩',
  cheese: '🧀',
  dessert: '🍰',
  snack: '🍿',
  fruit: '🍎',
}

/**
 * Score a food pairing against a recipe's characteristics.
 * Higher score = better match.
 */
function scorePairing(food: FoodPairing, keywords: string[]): number {
  let score = 0
  const lowerKeywords = keywords.map(k => k.toLowerCase())

  for (const kw of lowerKeywords) {
    for (const best of food.bestWith) {
      if (kw.includes(best) || best.includes(kw)) {
        score += 2
      }
    }
    for (const avoid of food.avoidWith) {
      if (kw.includes(avoid) || avoid.includes(kw)) {
        score -= 3
      }
    }
  }

  return score
}

/**
 * Extract flavor keywords from a recipe object.
 * Handles both camelCase and snake_case field names.
 */
function extractKeywords(recipe: any): string[] {
  const keywords: string[] = []

  // Flavor profile primary flavors
  const fp = recipe.flavorProfile || recipe.flavor_profile
  if (fp) {
    const primary = fp.primary || fp.primaryFlavors || fp.primary_flavors || []
    keywords.push(...primary)

    if (fp.description) {
      keywords.push(...fp.description.split(/[\s,，、]+/).filter((w: string) => w.length > 2))
    }
  }

  // Tags
  const tags = recipe.tags || []
  keywords.push(...tags)

  // Base spirit / ingredients
  const ingredients = recipe.ingredients || []
  for (const ing of ingredients) {
    const name = typeof ing === 'string'
      ? ing
      : (ing.name || ing.ingredientName || ing.ingredient_name || '')
    if (name) keywords.push(name)
  }

  // Method
  if (recipe.method) keywords.push(recipe.method)

  // Name (can hint at flavors)
  if (recipe.nameEn || recipe.name_en) {
    keywords.push(...(recipe.nameEn || recipe.name_en).split(/\s+/))
  }

  return keywords.filter(Boolean)
}

export interface ScoredPairing extends FoodPairing {
  score: number
  categoryIcon: string
}

/**
 * Get recommended food pairings for a recipe, sorted by match score.
 * Returns top matches (4-6 items), ensuring category diversity.
 */
export function getRecommendedPairings(recipe: any, limit = 6): ScoredPairing[] {
  const keywords = extractKeywords(recipe)

  const scored: ScoredPairing[] = foodPairings
    .map(food => ({
      ...food,
      score: scorePairing(food, keywords),
      categoryIcon: CATEGORY_ICONS[food.category] || '🍽️',
    }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)

  // Ensure category diversity: max 2 per category in top results
  const result: ScoredPairing[] = []
  const categoryCounts: Record<string, number> = {}

  for (const item of scored) {
    const count = categoryCounts[item.category] || 0
    if (count < 2) {
      result.push(item)
      categoryCounts[item.category] = count + 1
    }
    if (result.length >= limit) break
  }

  // If we still need items, fill from remaining (never exceeding the caller's limit)
  const floor = Math.min(4, limit)
  if (result.length < floor) {
    for (const item of scored) {
      if (!result.includes(item)) {
        result.push(item)
        if (result.length >= floor) break
      }
    }
  }

  return result
}

/**
 * Get all pairings scored against a recipe.
 */
export function getAllScoredPairings(recipe: any): ScoredPairing[] {
  const keywords = extractKeywords(recipe)

  return foodPairings
    .map(food => ({
      ...food,
      score: scorePairing(food, keywords),
      categoryIcon: CATEGORY_ICONS[food.category] || '🍽️',
    }))
    .sort((a, b) => b.score - a.score)
}
