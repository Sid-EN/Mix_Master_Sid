import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '調酒學院',
  description: '從基酒認識到技法練習：烈酒、葡萄酒、冰、器皿、裝飾與分子調酒。',
  path: '/academy',
  isSegmentRoot: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
