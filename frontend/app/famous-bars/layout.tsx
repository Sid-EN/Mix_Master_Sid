import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '世界名吧',
  description: '傳奇酒吧的故事、招牌酒與風格。',
  path: '/famous-bars',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
