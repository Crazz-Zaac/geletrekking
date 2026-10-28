import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Terms and Conditions',
  description: 'Read Gele Trekking booking terms, payment and cancellation conditions, and trip responsibilities.',
  path: '/terms-and-conditions',
})

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children
}
