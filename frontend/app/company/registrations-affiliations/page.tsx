import type { Metadata } from 'next'
import { getRegistrationsAffiliations, getTrustSummary, type PublicRegistrationDocument } from '@/lib/api'
import { breadcrumbJsonLd, buildMetadata, SITE_URL } from '@/lib/seo'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { JsonLd } from '@/components/json-ld'
import RegistrationsAffiliationsContent from './content'

export const metadata: Metadata = buildMetadata({
  title: 'Registrations & Affiliations',
  description: 'Gele Trekking’s government registrations, tourism licence and association memberships in Nepal, with registration numbers you can verify yourself.',
  path: '/company/registrations-affiliations',
  keywords: ['Gele Trekking registration', 'Nepal trekking company licence', 'TAAN member trekking agency', 'Gele Trekking affiliations'],
})

/** Registration numbers and memberships as structured data on the organisation. */
function credentialsJsonLd(documents: PublicRegistrationDocument[]) {
  const identifiers = documents
    .filter((doc) => doc.kind !== 'membership' && doc.referenceNumber)
    .map((doc) => ({ '@type': 'PropertyValue', name: doc.title, value: doc.referenceNumber }))
  const memberships = documents
    .filter((doc) => doc.kind === 'membership')
    .map((doc) => ({ '@type': 'Organization', name: doc.issuer || doc.title, ...(doc.verifyUrl ? { url: doc.verifyUrl } : {}) }))
  if (identifiers.length === 0 && memberships.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    ...(identifiers.length ? { identifier: identifiers } : {}),
    ...(memberships.length ? { memberOf: memberships } : {}),
  }
}

export default async function RegistrationsAffiliationsPage() {
  const [documents, trust] = await Promise.all([
    getRegistrationsAffiliations().catch(() => [] as PublicRegistrationDocument[]),
    getTrustSummary(),
  ])
  const credentials = credentialsJsonLd(documents)
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Registrations & Affiliations', path: '/company/registrations-affiliations' },
          ]),
          ...(credentials ? [credentials] : []),
        ]}
      />
      <Navbar />
      <RegistrationsAffiliationsContent documents={documents} associations={trust?.associations ?? []} />
      <Footer />
    </>
  )
}
