import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * robots.txt
 *
 * 個人頁面（帳號、我的配方、分享連結）不應被索引：
 * 分享連結帶有權杖，被搜尋引擎收錄等同公開。
 */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/recipes/mine', '/shared/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
