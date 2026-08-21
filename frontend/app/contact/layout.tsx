import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Contact Gele Trekking',
  description: 'Contact Gele Trekking for Nepal trek planning, custom itineraries, booking questions, permit advice, and local Himalayan travel support.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
