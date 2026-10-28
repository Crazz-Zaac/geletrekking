import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How Gele Trekking handles inquiries, personal information, cookies, and optional embedded content.',
  path: '/privacy-policy',
})

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children
}
