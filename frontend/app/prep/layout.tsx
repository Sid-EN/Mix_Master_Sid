import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '備料庫',
  description: '糖漿、浸漬、苦精與裝飾的自製配方與保存期限。',
  path: '/prep',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
