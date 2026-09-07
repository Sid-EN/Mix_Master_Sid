import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '個人儀表板',
  description: '你的學習進度、品飲紀錄與口味統計。',
  path: '/dashboard',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
