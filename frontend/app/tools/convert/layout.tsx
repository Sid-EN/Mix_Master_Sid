import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '單位換算',
  description: 'oz、ml、cl、tsp、dash 之間的即時換算。',
  path: '/tools/convert',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
