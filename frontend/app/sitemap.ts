import type { MetadataRoute } from 'next'
import { getActivities, getBlogs, getGuides, getTreks } from '@/lib/api'
import { SITE_URL } from '@/lib/seo'

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
  '/company/registrations-affiliations',
  '/privacy-policy',
  '/terms',
  '/disclaimer',
]

function route(path: string, priority = 0.7, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly') {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
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
    ...staticRoutes.map((path) => route(path, path === '' ? 1 : 0.75, path === '' ? 'daily' : 'weekly')),
    ...treks.map((trek) => route(`/trek/${trek.slug || trek.id}`, 0.9, 'weekly')),
    ...blogs.map((post) => route(`/blog/${post.slug}`, 0.8, 'weekly')),
    ...(guidesData.guides || []).map((guide) => route(`/guides/${guide.slug}`, 0.75, 'weekly')),
    ...activities.map((activity) => route(`/activities/${activity.slug}`, 0.7, 'weekly')),
  ]
}
