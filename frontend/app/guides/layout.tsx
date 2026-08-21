import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Nepal Trekking Guides & Travel Advice',
  description: 'Practical Nepal trekking guides covering permits, packing, altitude, routes, seasons, culture, and planning advice from Gele Trekking.',
  path: '/guides',
})

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children
}
