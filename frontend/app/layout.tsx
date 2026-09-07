import type { Metadata, Viewport } from 'next'

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
  title: 'MixMaster — 智慧調酒平台',
  description: '從認識一瓶酒，到掌握一杯酒的藝術',
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
        <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
          <FavoritesProvider>
            <ProgressProvider>
              <Navbar />
              <div className="pt-16">
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
