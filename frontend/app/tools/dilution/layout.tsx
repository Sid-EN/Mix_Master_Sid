import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '稀釋模擬器',
  description: '模擬搖盪與攪拌造成的稀釋與溫度變化。',
  path: '/tools/dilution',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
