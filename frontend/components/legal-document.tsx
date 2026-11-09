import Link from 'next/link'
import type { ReactNode } from 'react'
import { CalendarDays, Clock, FileText, Mail, Printer, type LucideIcon } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { JsonLd } from '@/components/json-ld'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { LegalToc, LegalTocMobile, PrintButton } from '@/components/legal-toc'
import { CONTACT_EMAIL, GELE_CALL_URL, WHATSAPP_URL } from '@/lib/contact-links'
import { breadcrumbJsonLd } from '@/lib/seo'
import { cn } from '@/lib/utils'

export type LegalSection = {
  id: string
  title: string
  icon?: LucideIcon
  /** Paragraphs; **bold** is supported. */
  body: string[]
  /** Optional bullet list shown after the first paragraph. */
  points?: string[]
}

export type LegalHighlight = { icon: LucideIcon; title: string; text: string }

const RELATED = [
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/liability-waiver', label: 'Liability Waiver' },
  { href: '/disclaimer', label: 'Health & Safety Disclaimer' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
]

function rich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  )
}

function readingMinutes(sections: LegalSection[]) {
  const words = sections
    .flatMap((section) => [...section.body, ...(section.points ?? [])])
    .join(' ')
    .split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export function LegalDocument({
  path,
  eyebrow,
  title,
  intro,
  effective,
  version,
  highlightsTitle,
  highlights,
  notice,
  sections,
  closing,
}: {
  path: string
  eyebrow: string
  title: string
  intro: string
  effective: string
  version?: string
  highlightsTitle: string
  highlights: LegalHighlight[]
  /** Short warning shown above the sections (optional). */
  notice?: { title: string; text: string }
  sections: LegalSection[]
  /** Acceptance statement at the end. */
  closing: string
}) {
  const toc = sections.map(({ id, title: sectionTitle }) => ({ id, title: sectionTitle }))

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: title, path },
        ])}
      />
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="min-h-screen bg-background pt-16 print:pt-0">
        {/* Header */}
        <section className="border-b border-border bg-muted/40 print:bg-transparent">
          <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <FileText className="h-3.5 w-3.5" />
              {eyebrow}
            </p>
            <h1 className="max-w-3xl text-balance text-3xl font-bold text-foreground md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{intro}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Effective {effective}
              </span>
              {version ? <span>Version {version}</span> : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readingMinutes(sections)} min read
              </span>
              <span className="inline-flex items-center gap-1.5 print:hidden">
                <Printer className="h-4 w-4" />
                <PrintButton className="font-medium text-primary underline-offset-4 hover:underline" />
              </span>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-24">
                <LegalToc items={toc} />
                <div className="mt-6 border-t border-border pt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Related</p>
                  <ul className="space-y-1.5 text-sm">
                    {RELATED.filter((doc) => doc.href !== path).map((doc) => (
                      <li key={doc.href}>
                        <Link href={doc.href} className="text-muted-foreground hover:text-foreground">
                          {doc.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            <article className="min-w-0 max-w-3xl">
              {/* At a glance */}
              <section aria-labelledby="at-a-glance" className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <h2 id="at-a-glance" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {highlightsTitle}
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {highlights.map(({ icon: Icon, title: itemTitle, text }) => (
                    <li key={itemTitle} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{itemTitle}</span>
                        <span className="text-sm leading-relaxed text-muted-foreground">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  This summary is for convenience. The full text below applies.
                </p>
              </section>

              {notice ? (
                <div role="note" className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                  <p className="font-semibold">{notice.title}</p>
                  <p className="mt-1 leading-relaxed">{notice.text}</p>
                </div>
              ) : null}

              <div className="mt-6">
                <LegalTocMobile items={toc} />
              </div>

              {/* Full text */}
              <div className="mt-4 divide-y divide-border">
                {sections.map((section, index) => {
                  const Icon = section.icon
                  return (
                    <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24 py-8 first:pt-6">
                      <h2 id={`${section.id}-title`} className="group flex items-start gap-3 text-xl font-bold text-foreground md:text-2xl">
                        <span className="mt-1 inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-bold tabular-nums text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1">
                          {section.title}
                          <a
                            href={`#${section.id}`}
                            aria-label={`Link to ${section.title}`}
                            className="ml-2 text-base font-normal text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100 focus:opacity-100 print:hidden"
                          >
                            #
                          </a>
                        </span>
                        {Icon ? <Icon className="mt-1.5 hidden h-5 w-5 shrink-0 text-primary/60 sm:block" aria-hidden="true" /> : null}
                      </h2>
                      <div className="mt-4 space-y-4 pl-0 text-[15px] leading-relaxed text-muted-foreground md:pl-10 md:text-base">
                        {section.body.map((paragraph, paragraphIndex) => (
                          <div key={paragraphIndex} className="space-y-4">
                            <p>{rich(paragraph)}</p>
                            {paragraphIndex === 0 && section.points?.length ? (
                              <ul className="list-disc space-y-2 pl-5 marker:text-primary">
                                {section.points.map((point) => (
                                  <li key={point}>{rich(point)}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>

              {/* Acceptance */}
              <p className="rounded-xl bg-muted/50 p-5 text-sm leading-relaxed text-foreground/80">{closing}</p>

              {/* Questions */}
              <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-white md:p-8 print:hidden">
                <h2 className="text-xl font-bold">Questions before you book?</h2>
                <p className="mt-2 max-w-xl text-sm text-white/75">
                  We’re happy to explain anything here in plain words. Ask us before you confirm your trek.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={GELE_CALL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Book a free call
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white hover:bg-[#1ebe5a]"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-semibold hover:bg-white/10"
                  >
                    <Mail className="h-4 w-4" />
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <nav aria-label="Related documents" className="mt-8 flex flex-wrap gap-2 lg:hidden print:hidden">
                {RELATED.filter((doc) => doc.href !== path).map((doc) => (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    className={cn('inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted')}
                  >
                    {doc.label}
                  </Link>
                ))}
              </nav>
            </article>
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  )
}
