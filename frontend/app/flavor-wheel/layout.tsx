import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '風味輪',
  description: '以 15 個維度拆解調酒風味，找出你偏好的座標。',
  path: '/flavor-wheel',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
