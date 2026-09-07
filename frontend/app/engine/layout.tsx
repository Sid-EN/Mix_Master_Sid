import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '智慧配方引擎',
  description: '輸入手邊的材料與想要的風味，自動生成平衡的原創配方。',
  path: '/engine',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
