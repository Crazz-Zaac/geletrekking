import type { Metadata } from 'next'
import { getRegistrationsAffiliations } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import RegistrationsAffiliationsContent from './content'

export const metadata: Metadata = buildMetadata({
  title: 'Registrations & Affiliations',
  description: 'View Gele Trekking’s official company registration certificates and industry affiliation documents in Nepal.',
  path: '/company/registrations-affiliations',
  keywords: ['Gele Trekking registration', 'Nepal trekking company certificates', 'Gele Trekking affiliations'],
})

export default async function RegistrationsAffiliationsPage() {
  const documents = await getRegistrationsAffiliations()
  return (
    <>
      <Navbar />
      <RegistrationsAffiliationsContent documents={documents} />
      <Footer />
    </>
  )
}
