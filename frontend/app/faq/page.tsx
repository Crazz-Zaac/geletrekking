import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { generalFAQ } from '@/lib/faq-data'
import { getAdminFaq, type AdminFaq } from '@/lib/api'
import { JsonLd } from '@/components/json-ld'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import { faqAnchor, faqTopicOf } from '@/lib/faq-topics'
import { FaqBrowser, FaqSidebar, type FaqEntry } from './FaqBrowser'

export const dynamic = 'force-dynamic'

const loadFaq = async (): Promise<AdminFaq> => {
  try {
    const data = await getAdminFaq()
    const faqs = (data.faqs || []).filter((item) => item.question?.trim() && item.answer?.trim())
    return {
      heroTitle: data.heroTitle || generalFAQ.heroTitle,
      heroSubtitle: data.heroSubtitle || generalFAQ.heroSubtitle,
      heroImageUrl: data.heroImageUrl || '',
      faqs: faqs.length > 0 ? faqs.sort((a, b) => (a.order || 0) - (b.order || 0)) : generalFAQ.faqs.map((item, index) => ({ ...item, order: index })),
    }
  } catch {
    return {
      heroTitle: generalFAQ.heroTitle,
      heroSubtitle: generalFAQ.heroSubtitle,
      heroImageUrl: '',
      faqs: generalFAQ.faqs.map((item, index) => ({ ...item, order: index })),
    }
  }
}

export default async function FAQPage() {
  const faq = await loadFaq()
  const faqItems = faq.faqs || []
  const heroImageUrl = (faq.heroImageUrl || '').trim()
  const faqSchema = faqJsonLd(faqItems)

  // Unique, stable anchors so every answer can be linked to (/faq#question-slug).
  const used = new Set<string>()
  const entries: FaqEntry[] = faqItems.map((item) => {
    const base = faqAnchor(item.question) || 'question'
    let anchor = base
    for (let n = 2; used.has(anchor); n++) anchor = `${base}-${n}`
    used.add(anchor)
    return { question: item.question, answer: item.answer, topic: faqTopicOf(item), anchor }
  })

  return (
    <>
      <JsonLd
        data={[
          ...(faqSchema ? [faqSchema] : []),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        ]}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          {heroImageUrl ? (
            <Image src={heroImageUrl} alt="" fill priority sizes="100vw" className="object-cover opacity-15" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-slate-950/80" />
          <div className="container relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Help centre</p>
            <h1 className="text-3xl font-bold md:text-5xl">{faq.heroTitle}</h1>
            <p className="mt-3 max-w-2xl text-base text-primary-foreground/80 md:text-lg">
              {(faq.heroSubtitle || '').trim().replace(/([^.!?])$/, '$1.')}{' '}
              {entries.length} answers about planning, booking and life on the trail.
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                <FaqBrowser items={entries} />
              </div>
              <FaqSidebar />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
