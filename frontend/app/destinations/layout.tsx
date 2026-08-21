import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Nepal Trekking Packages & Destinations',
  description: 'Compare Everest, Annapurna, Langtang, Manaslu, Mustang, and other Nepal trekking packages with itineraries, altitude, seasons, and prices.',
  path: '/destinations',
  image: '/images/region-everest.jpg',
})

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
