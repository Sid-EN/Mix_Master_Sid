import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '派對規劃',
  description: '選好酒單與杯數，算出材料總用量、庫存缺口與預估花費。',
  path: '/party',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
