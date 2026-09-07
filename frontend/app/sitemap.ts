import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { IS_STATIC } from '@/lib/staticMode'
import { getClassicRecipes, getPrepRecipes } from '@/lib/staticData'

/**
 * sitemap.xml
 *
 * 靜態版於建置期把 51 道配方與 18 種備料的網址全部列出，
 * 搜尋引擎才找得到這些頁面——它們只從配方庫的清單連過去，
 * 少了 sitemap 會被視為深層頁面而收錄得很慢。
 */
export const dynamic = 'force-static'

const STATIC_ROUTES = [
  '/', '/recipes', '/prep', '/engine', '/academy', '/my-bar', '/shopping-list',
  '/party', '/batch', '/tools', '/tools/abv', '/tools/convert', '/tools/cost',
  '/tools/dilution', '/tools/nutrition', '/flavor-wheel', '/glossary',
  '/world-map', '/famous-bars', '/hall-of-fame', '/mocktails', '/quiz',
  '/mood', '/compare', '/random', '/personality', '/history',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const pages: MetadataRoute.Sitemap = STATIC_ROUTES.map(path => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }))

  // 詳情頁的網址來自 repo 內的資料檔；完整版另有使用者配方，
  // 但那些屬於個人內容，不列入公開的 sitemap。
  if (IS_STATIC) {
    for (const r of getClassicRecipes()) {
      pages.push({
        url: absoluteUrl(`/recipes/${r.slug ?? r.id}`),
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.8,
      })
    }
    for (const r of getPrepRecipes()) {
      pages.push({
        url: absoluteUrl(`/prep/${r.slug ?? r.id}`),
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.6,
      })
    }
  }
  return pages
}
