import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import Navbar from '../components/layout/Navbar'
import { FavoritesProvider } from '../components/FavoritesContext'
import { ProgressProvider } from '../components/ProgressContext'
import { ThemeProvider } from '../components/ThemeContext'
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'MixMaster — 智慧調酒平台',
  description: '從認識一瓶酒，到掌握一杯酒的藝術',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MixMaster',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F5A623',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <FavoritesProvider>
            <ProgressProvider>
              <Navbar />
              <div className="pt-16">
                {children}
              </div>
            </ProgressProvider>
          </FavoritesProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
