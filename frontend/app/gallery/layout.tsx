import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Nepal Trekking Photo Gallery',
  description: 'See Himalayan trekking photos from Everest, Annapurna, Langtang, Mustang, Manaslu, and Gele Trekking journeys across Nepal.',
  path: '/gallery',
})

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
