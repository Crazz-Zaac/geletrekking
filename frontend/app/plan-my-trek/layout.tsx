import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Plan My Nepal Trek',
  description: 'Plan a custom Nepal trekking itinerary with Gele Trekking based on your dates, fitness, route interests, budget, and travel style.',
  path: '/plan-my-trek',
})

export default function PlanMyTrekLayout({ children }: { children: React.ReactNode }) {
  return children
}
