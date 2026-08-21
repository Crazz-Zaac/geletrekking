import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Nepal Trekking FAQs',
  description: 'Find answers to common Nepal trekking questions about permits, altitude, packing, safety, seasons, payments, guides, and booking.',
  path: '/faq',
})

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
