import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Travel Disclaimer',
  description: 'Read Gele Trekking travel information, website disclaimers, and Himalayan trip planning limitations.',
  path: '/disclaimer',
})

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children
}
