import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Nepal Activities, Tours & Adventure Experiences',
  description: 'Explore Nepal activities with Gele Trekking, from adventure trips and cultural tours to wellness experiences and day activities.',
  path: '/activities',
})

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
