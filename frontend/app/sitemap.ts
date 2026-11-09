import type { MetadataRoute } from 'next'
import { getActivities, getBlogs, getGuides, getTreks } from '@/lib/api'
import { SITE_URL } from '@/lib/seo'
import { getTrekPath } from '@/lib/trek-path'

const staticRoutes = [
  '',
  '/about',
  '/destinations',
  '/activities',
  '/guides',
  '/blog',
  '/gallery',
  '/faq',
  '/contact',
  '/book',
  '/plan-my-trek',
  '/safety',
  '/packing-list',
  '/company/registrations-affiliations',
  '/privacy-policy',
  '/terms-and-conditions',
  '/liability-waiver',
  '/disclaimer',
]

// Google ignores priority/changefreq but uses lastModified when it is accurate,
// so only send a date when the record has a real one.
function route(path: string, updatedAt?: string) {
  const date = updatedAt ? new Date(updatedAt) : null
  return {
    url: `${SITE_URL}${path}`,
    ...(date && !Number.isNaN(date.getTime()) ? { lastModified: date } : {}),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [treks, blogs, guidesData, activities] = await Promise.all([
    getTreks().catch(() => []),
    getBlogs().catch(() => []),
    getGuides().catch(() => ({ guides: [] })),
    getActivities().catch(() => []),
  ])

  return [
    ...staticRoutes.map((path) => route(path)),
    ...treks.map((trek) => route(getTrekPath(trek), trek.updatedAt)),
    ...blogs.map((post) => route(`/blog/${post.slug}`, post.updatedAt)),
    ...(guidesData.guides || []).map((guide) => route(`/guides/${guide.slug}`, guide.updatedAt)),
    ...activities.map((activity) => route(`/activities/${activity.slug}`, activity.updatedAt)),
  ]
}
