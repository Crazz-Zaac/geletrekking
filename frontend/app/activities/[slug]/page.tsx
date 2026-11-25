import { notFound } from 'next/navigation'
import { getActivities } from '@/lib/api'
import { ActivityDetailClient } from './ActivityDetailClient'

interface ActivityDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { slug } = await params
  const activities = await getActivities().catch(() => [])
  const activity = activities.find((item) => item.slug === slug)
  if (!activity) notFound()
  return <ActivityDetailClient activity={activity} />
}
