import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { JsonLd } from '@/components/json-ld'
import { getGuideBySlug } from '@/lib/api'
import { breadcrumbJsonLd, buildMetadata, stripMarkdown } from '@/lib/seo'
import { PackingListClient, type PackingSection } from './PackingListClient'

export const metadata: Metadata = buildMetadata({
  title: 'Free Printable Nepal Trekking Packing List',
  description:
    'A printable, tick-off packing checklist for trekking in Nepal: clothing, footwear, bags, sleeping gear, health and hygiene, and the small items people forget.',
  path: '/packing-list',
})

/** Turn the gear guide's "## Section" + "- item" Markdown into checklist groups. */
function parseSections(markdown: string): PackingSection[] {
  const sections: PackingSection[] = []
  let current: PackingSection | null = null
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim()
    const heading = line.match(/^#{2,3}\s+(.+)$/)
    if (heading) {
      current = { title: stripMarkdown(heading[1]), items: [] }
      sections.push(current)
      continue
    }
    const item = line.match(/^[-*+]\s+(.+)$/)
    if (item && current) current.items.push(stripMarkdown(item[1]))
  }
  return sections.filter((section) => section.items.length > 0)
}

export default async function PackingListPage() {
  const guide = await getGuideBySlug('gear-and-equipment').catch(() => null)
  const sections = guide?.content ? parseSections(guide.content) : []

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Packing list', path: '/packing-list' }])} />
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="min-h-screen bg-background pt-16 print:pt-0">
        <PackingListClient sections={sections} />
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  )
}
