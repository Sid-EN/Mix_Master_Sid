import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'ABV 計算',
  description: '依材料酒精濃度與用量計算成品的酒精度。',
  path: '/tools/abv',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
