import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '我的酒櫃',
  description: '記錄手邊材料與庫存，看看現在能調出哪些酒。',
  path: '/my-bar',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
