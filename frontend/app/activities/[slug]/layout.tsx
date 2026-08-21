import type { Metadata } from 'next'
import { JsonLd } from '@/components/json-ld'
import { getActivities } from '@/lib/api'
import { breadcrumbJsonLd, buildMetadata, truncateDescription } from '@/lib/seo'
import { getActivityMenuLabel } from '@/lib/activity-menu'

interface ActivityParams {
  params: Promise<{ slug: string }>
}

interface ActivityLayoutProps extends ActivityParams {
  children: React.ReactNode
}

async function loadActivity(slug: string) {
  try {
    const activities = await getActivities()
    return activities.find((activity) => activity.slug === slug) || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: ActivityParams): Promise<Metadata> {
  const { slug } = await params
  const activity = await loadActivity(slug)

  if (!activity) {
    return buildMetadata({
      title: 'Activity Not Found',
      description: 'This Gele Trekking activity could not be found.',
      path: `/activities/${slug}`,
    })
  }

  const title = getActivityMenuLabel(activity)
  return buildMetadata({
    title,
    description: truncateDescription(activity.shortDescription || activity.fullDescription || activity.description || '', `${title} with Gele Trekking in Nepal.`),
    path: `/activities/${activity.slug}`,
    image: activity.mainImage || activity.image || undefined,
  })
}

export default async function ActivityLayout({ children, params }: ActivityLayoutProps) {
  const { slug } = await params
  const activity = await loadActivity(slug)

  return (
    <>
      {activity ? (
        <JsonLd data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Activities', path: '/activities' },
          { name: getActivityMenuLabel(activity), path: `/activities/${activity.slug}` },
        ])} />
      ) : null}
      {children}
    </>
  )
}
