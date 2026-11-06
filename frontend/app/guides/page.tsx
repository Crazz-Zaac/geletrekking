import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getGuides } from '@/lib/api'
import { GuidesClient } from './GuidesClient'

// Server component: fetches data so the full listing (H1, cards, links) is in
// the HTML that search engines receive. Filters stay interactive in the client.
export default async function Page() {
  const { guides } = await getGuides()
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Travel Guides', path: '/guides' }])} />
      <GuidesClient initialGuides={guides || []} />
    </>
  )
}
