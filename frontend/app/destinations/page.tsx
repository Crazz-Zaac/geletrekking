import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getTreks } from '@/lib/api'
import { DestinationsClient } from './DestinationsClient'

// Server component: fetches data so the full listing (H1, cards, links) is in
// the HTML that search engines receive. Filters stay interactive in the client.
export default async function Page() {
  const treks = await getTreks()
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Destinations', path: '/destinations' }])} />
      <DestinationsClient initialTreks={treks} />
    </>
  )
}
