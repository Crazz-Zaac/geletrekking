import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getBlogs } from '@/lib/api'
import { BlogListClient } from './BlogListClient'

// Server component: fetches data so the full listing (H1, cards, links) is in
// the HTML that search engines receive. Filters stay interactive in the client.
export default async function Page() {
  const posts = await getBlogs()
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])} />
      <BlogListClient initialPosts={posts} />
    </>
  )
}
