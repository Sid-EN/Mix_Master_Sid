import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '購物清單',
  description: '把配方缺少的材料一次帶走，支援數量彙總與純文字匯出。',
  path: '/shopping-list',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
