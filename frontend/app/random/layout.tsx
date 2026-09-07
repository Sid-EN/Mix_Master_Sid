import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '隨機一杯',
  description: '不知道喝什麼時，讓它幫你決定。',
  path: '/random',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
