import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '公開配方目錄',
  description: '瀏覽其他調酒愛好者發布的原創配方，追蹤喜歡的創作者。',
  path: '/discover',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
