import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getActivities } from '@/lib/api'
import { ActivitiesClient } from './ActivitiesClient'

// Server component: fetches data so the full listing (H1, cards, links) is in
// the HTML that search engines receive. Filters stay interactive in the client.
export default async function Page() {
  // null = server fetch failed; the client will retry in the browser.
  const activities = await getActivities().catch(() => null)
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Activities', path: '/activities' }])} />
      <ActivitiesClient initialActivities={activities} />
    </>
  )
}
