import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Nepal Trekking Blog',
  description: 'Read Gele Trekking stories, Nepal trekking tips, route guides, gear advice, and local Himalayan travel insight.',
  path: '/blog',
})

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
