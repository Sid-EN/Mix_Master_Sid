export type Locale = 'zh-TW' | 'en' | 'ja'

export const LOCALES: Locale[] = ['zh-TW', 'en', 'ja']

export const LOCALE_META: Record<Locale, { flag: string; label: string; labelNative: string }> = {
  'zh-TW': { flag: '🇹🇼', label: '繁體中文', labelNative: '繁體中文' },
  en:      { flag: '🇺🇸', label: 'English',  labelNative: 'English' },
  ja:      { flag: '🇯🇵', label: '日本語',    labelNative: '日本語' },
}

export const DEFAULT_LOCALE: Locale = 'zh-TW'

export interface TranslationSet {
  // Navigation
  nav_home: string
  nav_engine: string
  nav_recipes: string
  nav_academy: string
  nav_tools: string
  nav_myBar: string
  nav_mySpace: string
  nav_favorites: string
  nav_allFeatures: string
  nav_prep: string
  nav_batch: string
  nav_compare: string
  nav_quiz: string
  nav_search: string
  nav_flavorPref: string

  // Mega menu columns
  mega_create: string
  mega_mySpace: string
  mega_tools: string
  mega_learn: string

  // Mega menu items
  mega_engineDesc: string
  mega_recipesDesc: string
  mega_prepDesc: string
  mega_compareDesc: string
  mega_dashboardLabel: string
  mega_dashboardDesc: string
  mega_myBarDesc: string
  mega_favoritesDesc: string
  mega_achievementsLabel: string
  mega_achievementsDesc: string
  mega_batchDesc: string
  mega_abvLabel: string
  mega_abvDesc: string
  mega_costLabel: string
  mega_costDesc: string
  mega_convertLabel: string
  mega_convertDesc: string
  mega_academyDesc: string
  mega_wineLabel: string
  mega_wineDesc: string
  mega_spiritsLabel: string
  mega_spiritsDesc: string
  mega_techniquesLabel: string
  mega_techniquesDesc: string
  mega_quizDesc: string
  mega_flavorWheelLabel: string
  mega_flavorWheelDesc: string
  mega_worldMapLabel: string
  mega_worldMapDesc: string
  mega_historyLabel: string
  mega_historyDesc: string
  mega_hallOfFameLabel: string
  mega_hallOfFameDesc: string

  // Common UI
  loading: string
  error: string
  back: string
  search: string
  filter: string
  viewMore: string
  viewAll: string
  close: string
  save: string
  reset: string
  confirm: string
  cancel: string
  submit: string
  searchPlaceholder: string

  // Homepage
  home_subtitle: string
  home_tagline: string
  home_aiPlatform: string
  home_ctaEngine: string
  home_ctaAcademy: string
  home_ctaRecipes: string
  home_coreModules: string
  home_coreTitle: string
  home_featuredCocktail: string
  home_todayClassic: string
  home_viewRecipe: string
  home_statRecipes: string
  home_statIngredients: string
  home_statLevels: string
  home_statDimensions: string

  // Feature cards
  home_engineTitle: string
  home_engineDesc: string
  home_academyTitle: string
  home_academyDesc: string
  home_recipesTitle: string
  home_recipesDesc: string

  // Engine
  engine_title: string
  engine_subtitle: string
  engine_selectIngredients: string
  engine_generate: string
  engine_generating: string
  engine_result: string
  engine_tryAgain: string

  // Recipes
  recipes_title: string
  recipes_subtitle: string
  recipes_difficulty: string
  recipes_ingredients: string
  recipes_steps: string
  recipes_flavorProfile: string
  recipes_method: string
  recipes_origin: string
  recipes_servings: string

  // Academy
  academy_title: string
  academy_subtitle: string
  academy_wine: string
  academy_spirits: string
  academy_techniques: string
  academy_moreCourses: string

  // Footer
  footer_coreFeatures: string
  footer_tools: string
  footer_academy: string
  footer_developer: string
  footer_apiDocs: string
  footer_status: string
  footer_platformData: string
  footer_copyright: string
  footer_madeWith: string
  footer_tagline: string

  // Theme
  theme_toggleLight: string
  theme_toggleDark: string

  // Achievements / Progress
  achievement_title: string
  achievement_badges: string
  achievement_progress: string
  achievement_level: string
  achievement_xp: string

  // Language
  lang_switch: string
}
