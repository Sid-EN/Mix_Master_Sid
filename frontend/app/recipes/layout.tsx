import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '配方資料庫',
  description: '51 道經典與創意調酒配方，含材料、步驟、風味分析與平衡評分。',
  path: '/recipes',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
