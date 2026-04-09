/* ── Achievement Badge System ─────────────────────────────── */

export interface UserStats {
  recipesViewed: number
  recipesTried: number
  academySections: number
  quizzesCompleted: number
  favoritesCount: number
  ratingsCount: number
  myBarCount: number
  totalRecipes: number
  totalAcademySections: number
  hour: number
  currentMonth: number
  seasonsUsed: number[]   // 0=spring 1=summer 2=autumn 3=winter
  daysUsed: number
  bestQuizScore: number   // 0-100
}

export type AchievementCategory = 'exploration' | 'creation' | 'knowledge' | 'collection' | 'special'
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Achievement {
  id: string
  nameZh: string
  nameEn: string
  icon: string
  description: string
  category: AchievementCategory
  tier: AchievementTier
  condition: (stats: UserStats) => boolean
  progress?: (stats: UserStats) => { current: number; target: number }
}

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
}

export const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: '銅',
  silver: '銀',
  gold: '金',
  platinum: '白金',
}

export const CATEGORY_META: Record<AchievementCategory, { icon: string; label: string }> = {
  exploration: { icon: '🗺️', label: '探索' },
  creation:    { icon: '🍸', label: '創作' },
  knowledge:   { icon: '📚', label: '知識' },
  collection:  { icon: '⭐', label: '收藏' },
  special:     { icon: '🌟', label: '特殊' },
}

export const ACHIEVEMENTS: Achievement[] = [
  /* ── 🗺️ Exploration ──────────────────────────────────────── */
  {
    id: 'first-step',
    nameZh: '初探者',
    nameEn: 'First Step',
    icon: '👣',
    description: '瀏覽你的第一個酒譜',
    category: 'exploration',
    tier: 'bronze',
    condition: s => s.recipesViewed >= 1,
    progress: s => ({ current: Math.min(s.recipesViewed, 1), target: 1 }),
  },
  {
    id: 'taster',
    nameZh: '品酒師',
    nameEn: 'Taster',
    icon: '🍷',
    description: '瀏覽 10 個酒譜',
    category: 'exploration',
    tier: 'silver',
    condition: s => s.recipesViewed >= 10,
    progress: s => ({ current: Math.min(s.recipesViewed, 10), target: 10 }),
  },
  {
    id: 'connoisseur',
    nameZh: '鑑賞家',
    nameEn: 'Connoisseur',
    icon: '🎩',
    description: '瀏覽 30 個酒譜',
    category: 'exploration',
    tier: 'gold',
    condition: s => s.recipesViewed >= 30,
    progress: s => ({ current: Math.min(s.recipesViewed, 30), target: 30 }),
  },
  {
    id: 'encyclopedia',
    nameZh: '百科全書',
    nameEn: 'Encyclopedia',
    icon: '📖',
    description: '瀏覽所有酒譜',
    category: 'exploration',
    tier: 'platinum',
    condition: s => s.totalRecipes > 0 && s.recipesViewed >= s.totalRecipes,
    progress: s => ({ current: Math.min(s.recipesViewed, s.totalRecipes), target: s.totalRecipes }),
  },

  /* ── 🍸 Creation ─────────────────────────────────────────── */
  {
    id: 'first-sip',
    nameZh: '初嚐者',
    nameEn: 'First Sip',
    icon: '🥂',
    description: '嘗試製作你的第一杯調酒',
    category: 'creation',
    tier: 'bronze',
    condition: s => s.recipesTried >= 1,
    progress: s => ({ current: Math.min(s.recipesTried, 1), target: 1 }),
  },
  {
    id: 'apprentice',
    nameZh: '調酒學徒',
    nameEn: 'Apprentice',
    icon: '🧑‍🍳',
    description: '嘗試製作 5 杯調酒',
    category: 'creation',
    tier: 'silver',
    condition: s => s.recipesTried >= 5,
    progress: s => ({ current: Math.min(s.recipesTried, 5), target: 5 }),
  },
  {
    id: 'mixologist',
    nameZh: '調酒師',
    nameEn: 'Mixologist',
    icon: '🍹',
    description: '嘗試製作 15 杯調酒',
    category: 'creation',
    tier: 'gold',
    condition: s => s.recipesTried >= 15,
    progress: s => ({ current: Math.min(s.recipesTried, 15), target: 15 }),
  },
  {
    id: 'grand-master',
    nameZh: '大師',
    nameEn: 'Grand Master',
    icon: '👑',
    description: '嘗試製作 30 杯調酒',
    category: 'creation',
    tier: 'platinum',
    condition: s => s.recipesTried >= 30,
    progress: s => ({ current: Math.min(s.recipesTried, 30), target: 30 }),
  },

  /* ── 📚 Knowledge ────────────────────────────────────────── */
  {
    id: 'curious',
    nameZh: '求知者',
    nameEn: 'Curious',
    icon: '🔍',
    description: '完成 1 個學院單元',
    category: 'knowledge',
    tier: 'bronze',
    condition: s => s.academySections >= 1,
    progress: s => ({ current: Math.min(s.academySections, 1), target: 1 }),
  },
  {
    id: 'scholar',
    nameZh: '學者',
    nameEn: 'Scholar',
    icon: '📝',
    description: '完成 5 個學院單元',
    category: 'knowledge',
    tier: 'silver',
    condition: s => s.academySections >= 5,
    progress: s => ({ current: Math.min(s.academySections, 5), target: 5 }),
  },
  {
    id: 'polymath',
    nameZh: '博學家',
    nameEn: 'Polymath',
    icon: '🎓',
    description: '完成所有學院單元',
    category: 'knowledge',
    tier: 'gold',
    condition: s => s.totalAcademySections > 0 && s.academySections >= s.totalAcademySections,
    progress: s => ({ current: Math.min(s.academySections, s.totalAcademySections), target: s.totalAcademySections }),
  },
  {
    id: 'quiz-master',
    nameZh: '問答王',
    nameEn: 'Quiz Master',
    icon: '❓',
    description: '完成 5 次測驗',
    category: 'knowledge',
    tier: 'silver',
    condition: s => s.quizzesCompleted >= 5,
    progress: s => ({ current: Math.min(s.quizzesCompleted, 5), target: 5 }),
  },
  {
    id: 'perfect-score',
    nameZh: '滿分達人',
    nameEn: 'Perfect Score',
    icon: '💯',
    description: '在測驗中獲得滿分',
    category: 'knowledge',
    tier: 'gold',
    condition: s => s.bestQuizScore >= 100,
  },

  /* ── ⭐ Collection ───────────────────────────────────────── */
  {
    id: 'collector',
    nameZh: '收藏家',
    nameEn: 'Collector',
    icon: '📌',
    description: '收藏 3 個酒譜',
    category: 'collection',
    tier: 'bronze',
    condition: s => s.favoritesCount >= 3,
    progress: s => ({ current: Math.min(s.favoritesCount, 3), target: 3 }),
  },
  {
    id: 'curator',
    nameZh: '品味家',
    nameEn: 'Curator',
    icon: '🏛️',
    description: '收藏 10 個酒譜',
    category: 'collection',
    tier: 'silver',
    condition: s => s.favoritesCount >= 10,
    progress: s => ({ current: Math.min(s.favoritesCount, 10), target: 10 }),
  },
  {
    id: 'critic',
    nameZh: '評論家',
    nameEn: 'Critic',
    icon: '⭐',
    description: '為 5 個酒譜評分',
    category: 'collection',
    tier: 'silver',
    condition: s => s.ratingsCount >= 5,
    progress: s => ({ current: Math.min(s.ratingsCount, 5), target: 5 }),
  },
  {
    id: 'bar-owner',
    nameZh: '酒吧老闆',
    nameEn: 'Bar Owner',
    icon: '🏪',
    description: '在我的吧台加入 20 種材料',
    category: 'collection',
    tier: 'silver',
    condition: s => s.myBarCount >= 20,
    progress: s => ({ current: Math.min(s.myBarCount, 20), target: 20 }),
  },
  {
    id: 'warehouse',
    nameZh: '倉庫管理員',
    nameEn: 'Warehouse',
    icon: '🏭',
    description: '在我的吧台加入 50 種材料',
    category: 'collection',
    tier: 'gold',
    condition: s => s.myBarCount >= 50,
    progress: s => ({ current: Math.min(s.myBarCount, 50), target: 50 }),
  },

  /* ── 🌟 Special ──────────────────────────────────────────── */
  {
    id: 'night-owl',
    nameZh: '夜貓子',
    nameEn: 'Night Owl',
    icon: '🦉',
    description: '在午夜之後使用應用程式',
    category: 'special',
    tier: 'bronze',
    condition: s => s.hour >= 0 && s.hour < 5,
  },
  {
    id: 'all-seasons',
    nameZh: '四季飲者',
    nameEn: 'All Seasons',
    icon: '🌏',
    description: '在四個季節都使用過應用程式',
    category: 'special',
    tier: 'gold',
    condition: s => s.seasonsUsed.length >= 4,
    progress: s => ({ current: s.seasonsUsed.length, target: 4 }),
  },
  {
    id: 'loyal',
    nameZh: '忠實用戶',
    nameEn: 'Loyal',
    icon: '💎',
    description: '在 7 個不同的日子使用應用程式',
    category: 'special',
    tier: 'silver',
    condition: s => s.daysUsed >= 7,
    progress: s => ({ current: Math.min(s.daysUsed, 7), target: 7 }),
  },
]

/* ── Helpers ─────────────────────────────────────────────── */

export function getSeason(month: number): number {
  if (month >= 3 && month <= 5) return 0   // spring
  if (month >= 6 && month <= 8) return 1   // summer
  if (month >= 9 && month <= 11) return 2  // autumn
  return 3                                  // winter
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string
}

export interface AchievementStore {
  unlockedAchievements: UnlockedAchievement[]
  seasonsUsed: number[]
  daysUsed: string[]
}

const ACHIEVEMENTS_KEY = 'mixmaster-achievements'

export function loadAchievementStore(): AchievementStore {
  if (typeof window === 'undefined') return { unlockedAchievements: [], seasonsUsed: [], daysUsed: [] }
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
    if (!raw) return { unlockedAchievements: [], seasonsUsed: [], daysUsed: [] }
    const parsed = JSON.parse(raw)
    return {
      unlockedAchievements: parsed.unlockedAchievements ?? [],
      seasonsUsed: parsed.seasonsUsed ?? [],
      daysUsed: parsed.daysUsed ?? [],
    }
  } catch {
    return { unlockedAchievements: [], seasonsUsed: [], daysUsed: [] }
  }
}

export function saveAchievementStore(store: AchievementStore) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(store))
  } catch { /* quota */ }
}

export function gatherUserStats(store: AchievementStore): UserStats {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const hour = now.getHours()
  const month = now.getMonth() + 1
  const season = getSeason(month)

  // Progress data
  let recipesViewed = 0
  let recipesTried = 0
  let academySections = 0
  let quizzesCompleted = 0
  try {
    const raw = localStorage.getItem('mixmaster-progress')
    if (raw) {
      const p = JSON.parse(raw)
      recipesViewed = Array.isArray(p.recipesViewed) ? p.recipesViewed.length : 0
      recipesTried = Array.isArray(p.recipesTried) ? p.recipesTried.length : 0
      academySections = Array.isArray(p.academySectionsRead) ? p.academySectionsRead.length : 0
      quizzesCompleted = typeof p.quizzesCompleted === 'number' ? p.quizzesCompleted : 0
    }
  } catch { /* ignore */ }

  // Favorites data
  let favoritesCount = 0
  let ratingsCount = 0
  try {
    const raw = localStorage.getItem('mixmaster-favorites')
    if (raw) {
      const fav = JSON.parse(raw) as Record<string, { saved?: boolean; rating?: number }>
      for (const v of Object.values(fav)) {
        if (v.saved) favoritesCount++
        if (v.rating && v.rating > 0) ratingsCount++
      }
    }
  } catch { /* ignore */ }

  // My Bar data
  let myBarCount = 0
  try {
    const raw = localStorage.getItem('mixmaster-my-bar')
    if (raw) {
      const ids = JSON.parse(raw)
      myBarCount = Array.isArray(ids) ? ids.length : 0
    }
  } catch { /* ignore */ }

  // Quiz history – best score
  let bestQuizScore = 0
  try {
    const raw = localStorage.getItem('mixmaster-quiz-history')
    if (raw) {
      const h = JSON.parse(raw) as { bestScores?: Record<string, number> }
      if (h.bestScores) {
        for (const score of Object.values(h.bestScores)) {
          if (score > bestQuizScore) bestQuizScore = score
        }
      }
    }
  } catch { /* ignore */ }

  // Update season and days tracking
  const seasonsUsed = [...new Set([...store.seasonsUsed, season])]
  const daysUsedArr = store.daysUsed.includes(today) ? store.daysUsed : [...store.daysUsed, today]

  return {
    recipesViewed,
    recipesTried,
    academySections,
    quizzesCompleted,
    favoritesCount,
    ratingsCount,
    myBarCount,
    totalRecipes: 51,
    totalAcademySections: 10,
    hour,
    currentMonth: month,
    seasonsUsed,
    daysUsed: daysUsedArr.length,
    bestQuizScore,
  }
}
