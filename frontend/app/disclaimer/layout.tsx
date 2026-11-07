import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Health & Safety Disclaimer',
  description: 'The risks of high-altitude trekking in Nepal, participant responsibilities and the travel insurance required before trekking with Gele Trekking.',
  path: '/disclaimer',
})

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children
}
