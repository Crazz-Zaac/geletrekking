import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Liability Waiver',
  description: 'The assumption of risk and release of liability that guests accept when trekking with Gele Trekking.',
  path: '/liability-waiver',
})

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children
}
