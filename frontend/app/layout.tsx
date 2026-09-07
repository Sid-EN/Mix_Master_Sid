import type { Metadata, Viewport } from 'next'
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '../lib/seo'

/**
 * GitHub Pages 的專案站台位於 /<repo>/ 之下。
 * Next 不會替 metadata 中的路徑加上 basePath，寫死斜線開頭會全部 404。
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''
import '../styles/globals.css'
import Navbar from '../components/layout/Navbar'
import { AuthProvider } from '../components/AuthContext'
import SyncAgent from '../components/SyncAgent'
import InstallPrompt from '../components/InstallPrompt'
import { FavoritesProvider } from '../components/FavoritesContext'
import { ProgressProvider } from '../components/ProgressContext'
import { ThemeProvider } from '../components/ThemeContext'
import { I18nProvider } from '../components/I18nContext'
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration'
import PageTransition from '../components/PageTransition'
import AchievementChecker from '../components/AchievementChecker'

export const metadata: Metadata = {
  // metadataBase 讓各頁的相對路徑自動補成絕對網址；
  // 少了它，Open Graph 的圖片與 url 會是相對路徑，社群平台抓不到預覽。
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // 各頁只需給自己的標題，站名由此補上
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['調酒', '雞尾酒', 'cocktail', '配方', '調酒教學', 'bartending', 'MixMaster'],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'zh_TW',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    // 明確指定，才不會沿用 Next 檔案慣例產生的無副檔名網址
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
  manifest: `${BASE_PATH}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MixMaster',
  },
  icons: {
    icon: `${BASE_PATH}/icons/icon.svg`,
    apple: `${BASE_PATH}/icons/icon-192.png`,
  },
}

export const viewport: Viewport = {
  themeColor: '#F5A623',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" data-theme="dark" suppressHydrationWarning>
      <body>
        {/*
          跳至主要內容：以鍵盤瀏覽時，若沒有這個連結，
          每一頁都得先按過導覽列的二十幾個項目才能到內容。
          平時隱藏，取得焦點時才顯示。
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200]
                     focus:px-4 focus:py-2 focus:bg-bg-tertiary focus:text-neon-amber
                     focus:border focus:border-neon-amber focus:rounded"
        >
          跳至主要內容
        </a>
        <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
          <FavoritesProvider>
            <ProgressProvider>
              <Navbar />
              <div className="pt-16" id="main-content" tabIndex={-1}>
                <PageTransition>
                  {children}
                </PageTransition>
              </div>
              <AchievementChecker />
              <SyncAgent />
              <InstallPrompt />
            </ProgressProvider>
          </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
        </I18nProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
