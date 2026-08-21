import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Book a Nepal Trek',
  description: 'Start your Nepal trek booking with Gele Trekking and share your preferred route, dates, group size, and travel plans.',
  path: '/book',
})

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children
}
