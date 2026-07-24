import Link from 'next/link'
import type { ReactNode } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { generalFAQ } from '@/lib/faq-data'
import { getAdminFaq, type AdminFaq } from '@/lib/api'

const isSafeMarkdownHref = (href: string) => {
  const value = href.trim()
  return value.startsWith('/') || value.startsWith('#') || /^https?:\/\//i.test(value) || /^mailto:/i.test(value) || /^tel:/i.test(value)
}

const renderInlineMarkdown = (text: string): ReactNode[] => {
  const nodes: ReactNode[] = []
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))

    if (match[2] && match[3]) {
      const href = match[3].trim()
      const label = renderInlineMarkdown(match[2])
      if (isSafeMarkdownHref(href)) {
        const isInternal = href.startsWith('/') || href.startsWith('#')
        nodes.push(
          isInternal ? (
            <Link key={match.index} href={href} className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
              {label}
            </Link>
          ) : (
            <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
              {label}
            </a>
          ),
        )
      } else {
        nodes.push(match[2])
      }
    } else if (match[4]) {
      nodes.push(<strong key={match.index} className="font-semibold text-foreground">{renderInlineMarkdown(match[4])}</strong>)
    } else if (match[5]) {
      nodes.push(<em key={match.index}>{renderInlineMarkdown(match[5])}</em>)
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

const MarkdownText = ({ value }: { value: string }) => {
  const lines = value.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) return null

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        if (line.startsWith('## ')) return <h3 key={index} className="text-lg font-bold text-foreground">{renderInlineMarkdown(line.slice(3))}</h3>
        if (line.startsWith('> ')) return <blockquote key={index} className="border-l-2 border-primary pl-3 italic">{renderInlineMarkdown(line.slice(2))}</blockquote>
        return <p key={index}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''))}</p>
      })}
    </div>
  )
}

const loadFaq = async (): Promise<AdminFaq> => {
  try {
    const data = await getAdminFaq()
    const faqs = (data.faqs || []).filter((item) => item.question?.trim() && item.answer?.trim())
    return {
      heroTitle: data.heroTitle || generalFAQ.heroTitle,
      heroSubtitle: data.heroSubtitle || generalFAQ.heroSubtitle,
      faqs: faqs.length > 0 ? faqs.sort((a, b) => (a.order || 0) - (b.order || 0)) : generalFAQ.faqs.map((item, index) => ({ ...item, order: index })),
    }
  } catch {
    return {
      heroTitle: generalFAQ.heroTitle,
      heroSubtitle: generalFAQ.heroSubtitle,
      faqs: generalFAQ.faqs.map((item, index) => ({ ...item, order: index })),
    }
  }
}

export default async function FAQPage() {
  const faq = await loadFaq()
  const faqItems = faq.faqs || []

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-background border-b border-border">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary mb-4">
              FAQ&apos;s
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{faq.heroTitle}</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-4 text-base md:text-lg">
              {faq.heroSubtitle}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="border-border p-5 shadow-xs md:p-7">
                <div className="mb-5 flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">General Questions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Browse the most common planning, safety, payment, and trekking questions.</p>
                  </div>
                  <span className="w-fit rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm font-semibold text-foreground">
                    {faqItems.length} answers
                  </span>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={`${item.question}-${index}`} value={`item-${index + 1}`} className="border-border">
                      <AccordionTrigger className="py-5 text-left text-base font-semibold leading-snug text-foreground hover:text-primary md:text-lg">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
                        <MarkdownText value={item.answer} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>

              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <Card className="border-border p-5 shadow-xs">
                  <h2 className="text-lg font-bold text-foreground">Need a Specific Answer?</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Tell us your trek, travel dates, group size, and concern. Our team will help with a practical answer.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/contact" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                      Contact our team
                    </Link>
                    <Link href="/destinations" className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50">
                      Explore treks
                    </Link>
                  </div>
                </Card>

                <div className="rounded-lg border border-border bg-muted/20 p-5">
                  <h3 className="text-sm font-semibold text-foreground">Helpful Topics</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Permits', 'Insurance', 'Difficulty', 'Payment', 'Packing', 'Best season'].map((topic) => (
                      <span key={topic} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
