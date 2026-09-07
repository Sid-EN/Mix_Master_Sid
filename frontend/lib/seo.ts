/**
 * 站台 metadata 與結構化資料
 *
 * 先前全站 50 多個頁面共用同一組 title 與 description：
 * 搜尋結果與社群分享預覽長得一模一樣，看不出點進去會是什麼。
 * 這裡集中管理各頁的標題、描述與 Open Graph 資訊。
 */
import type { Metadata } from 'next'

export const SITE_NAME = 'MixMaster'
export const SITE_TAGLINE = '智慧調酒平台'
export const SITE_DESCRIPTION =
  '從認識一瓶酒，到掌握一杯酒的藝術。51 道經典配方、風味分析、調酒學院與實用計算器。'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

/**
 * 站台的正式網址。
 *
 * Open Graph 的 url 與 image 必須是絕對路徑，社群平台才抓得到——
 * 相對路徑會讓分享預覽變成空白。靜態版與完整版的網域不同，
 * 因此由建置期環境變數決定。
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (BASE_PATH ? `https://sid-en.github.io${BASE_PATH}` : 'http://localhost:6880')
).replace(/\/$/, '')

/** 站內路徑轉為含 basePath 的絕對網址 */
export function absoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${clean === '/' ? '' : clean}`
}

/**
 * 社群分享預覽圖。
 *
 * 由 app/opengraph-image.tsx 於建置期產生。根層會自動帶上，
 * 但頁面一旦自行宣告 openGraph 就會整組取代掉，因此每頁都要明確帶上，
 * 否則分享出去只有文字、沒有圖。
 */
export const OG_IMAGE = {
  // 一律用 .png 結尾：靜態版有同名實體檔，完整版由 next.config.js 的
  // rewrite 導向產生器路由。沒有副檔名時 GitHub Pages 會以
  // application/octet-stream 提供，社群平台會直接拒絕顯示。
  url: absoluteUrl('/opengraph-image.png'),
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
}

export interface PageSeo {
  title: string
  /**
   * 此頁是否為一段路由的父層。
   *
   * 中介 layout 若只給字串標題，其下所有頁面都會失去根層的
   * title.template，標題就少了站名。設為 true 會一併帶上樣板。
   */
  isSegmentRoot?: boolean
  description?: string
  /** 站內路徑，例如 /recipes/classic-daiquiri */
  path?: string
  /** 額外關鍵字 */
  keywords?: string[]
  type?: 'website' | 'article'
}

/**
 * 產生單一頁面的 metadata。
 *
 * 標題不重複帶上站名——Next 的 title.template 已負責這件事，
 * 這裡再加一次會變成「經典黛綺麗 | MixMaster | MixMaster」。
 */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  keywords,
  type = 'website',
  isSegmentRoot = false,
}: PageSeo): Metadata {
  const url = absoluteUrl(path)
  return {
    // default 本身仍會套用上層的樣板，因此這裡不能自己再帶一次站名，
    // 否則會變成「配方資料庫 — MixMaster — MixMaster」。
    title: isSegmentRoot
      ? { default: title, template: `%s — ${SITE_NAME}` }
      : title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'zh_TW',
      type,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [OG_IMAGE.url],
    },
  }
}

/** 摘要文字裁切至適合預覽的長度，避免在句中被平台截斷 */
export function summarise(text: string | undefined, max = 155): string {
  if (!text) return SITE_DESCRIPTION
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1)}…`
}

export interface RecipeLd {
  nameZh?: string
  nameEn?: string
  descriptionZh?: string
  description?: string
  slug?: string
  method?: string
  ingredients?: { nameZh?: string; name?: string; amount?: number | string; unit?: string }[]
  steps?: string[]
  garnish?: string
}

/**
 * 配方的 schema.org 結構化資料。
 *
 * 讓搜尋引擎知道這是一份食譜而不是普通文章，
 * 搜尋結果才可能顯示材料與步驟摘要。
 */
export function recipeJsonLd(r: RecipeLd): Record<string, unknown> {
  const name = r.nameZh || r.nameEn || '調酒配方'
  const ingredients = (r.ingredients ?? []).map(ing => {
    const label = ing.nameZh || ing.name || ''
    const amount = ing.amount ? `${ing.amount}${ing.unit ? ` ${ing.unit}` : ''}` : ''
    return amount ? `${label} ${amount}`.trim() : label
  }).filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name,
    description: summarise(r.descriptionZh || r.description),
    url: r.slug ? absoluteUrl(`/recipes/${r.slug}`) : undefined,
    recipeCategory: 'Cocktail',
    recipeCuisine: 'Bar',
    recipeYield: '1 杯',
    recipeIngredient: ingredients,
    // 裝飾也是一個步驟，附在最後才是完整的做法
    recipeInstructions: [
      ...(r.steps ?? []),
      ...(r.garnish ? [`裝飾：${r.garnish}`] : []),
    ].map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
  }
}
