'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Backpack, CalendarDays, Clock3, FileCheck, HeartPulse, Mountain, Search, X } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getGuides, type TravelGuide } from '@/lib/api'
import { getGuideMenuIcon } from '@/lib/guide-menu'
import { GELE_CALL_URL } from '@/lib/contact-links'
import { cn } from '@/lib/utils'

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

/**
 * The guides read as a plan: what to do first, second… Each admin category maps
 * to a step; unknown categories become extra steps at the end.
 */
type Step = {
  category: string
  title: string
  blurb: string
  icon: React.ComponentType<{ className?: string }>
  tone: { tile: string; ring: string; number: string }
}

const STEPS: Step[] = [
  {
    category: 'Preparation',
    title: 'Prepare',
    blurb: 'When to go, what to pack and how to get trek-fit.',
    icon: Backpack,
    tone: { tile: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', ring: 'hover:border-amber-300', number: 'bg-amber-500' },
  },
  {
    category: 'Logistics',
    title: 'Permits & logistics',
    blurb: 'Visas, permits and staying connected in Nepal.',
    icon: FileCheck,
    tone: { tile: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300', ring: 'hover:border-sky-300', number: 'bg-sky-600' },
  },
  {
    category: 'Health & Safety',
    title: 'Health & safety',
    blurb: 'Altitude, medicine and staying well on the trail.',
    icon: HeartPulse,
    tone: { tile: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300', ring: 'hover:border-rose-300', number: 'bg-rose-600' },
  },
  {
    category: 'Guidelines',
    title: 'On the trail',
    blurb: 'Insurance, guide etiquette and trail rules.',
    icon: Mountain,
    tone: { tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', ring: 'hover:border-emerald-300', number: 'bg-emerald-600' },
  },
]

const FALLBACK_TONE: Step['tone'] = { tile: 'bg-primary/10 text-primary', ring: 'hover:border-primary/40', number: 'bg-primary' }

const anchorFor = (category: string) => `step-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

function GuidesContent({ initialGuides }: { initialGuides: TravelGuide[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [allGuides, setAllGuides] = useState<TravelGuide[]>(initialGuides)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(initialGuides.length === 0)

  useEffect(() => {
    // Data is rendered on the server; only fetch in the browser as a fallback.
    if (initialGuides.length > 0) return
    const loadData = async () => {
      setLoading(true)
      try {
        setAllGuides((await getGuides()).guides || [])
      } catch {
        setAllGuides([])
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [initialGuides.length])

  useEffect(() => {
    setSearchQuery(searchParams?.get('q') || '')
  }, [searchParams])

  // Old ?category= links jump to that step.
  useEffect(() => {
    const category = searchParams?.get('category')
    if (!category) return
    const timer = window.setTimeout(() => document.getElementById(anchorFor(category))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    return () => window.clearTimeout(timer)
  }, [searchParams])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (value.trim()) params.set('q', value.trim())
    else params.delete('q')
    params.delete('category')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const steps = useMemo(() => {
    const known = new Set(STEPS.map((step) => step.category))
    const extra = Array.from(new Set(allGuides.map((guide) => guide.category)))
      .filter((category) => category && !known.has(category))
      .sort()
      .map<Step>((category) => ({ category, title: category, blurb: '', icon: Mountain, tone: FALLBACK_TONE }))
    return [...STEPS, ...extra]
  }, [allGuides])

  const q = searchQuery.toLowerCase().trim()
  const sections = useMemo(
    () =>
      steps
        .map((step) => ({
          step,
          guides: allGuides
            .filter((guide) => guide.category === step.category)
            .filter((guide) => !q || guide.title.toLowerCase().includes(q) || guide.description.toLowerCase().includes(q) || (guide.content || '').toLowerCase().includes(q))
            .sort((a, b) => (a.order || 0) - (b.order || 0)),
          total: allGuides.filter((guide) => guide.category === step.category).length,
        }))
        .filter((section) => section.total > 0),
    [steps, allGuides, q]
  )
  const matchCount = sections.reduce((sum, section) => sum + section.guides.length, 0)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        {/* Header */}
        <section className="relative overflow-hidden bg-[oklch(0.25_0.04_230)] text-white">
          <div className="absolute inset-0 bg-[url('/images/hero-himalaya.jpg')] bg-cover bg-center opacity-40" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.2_0.04_230)] via-black/40 to-black/10" aria-hidden="true" />
          <div className="container relative mx-auto px-4 pb-24 pt-14 md:px-6 md:pb-28 md:pt-20">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">Plan your trek</p>
              <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">Everything to sort out before you go</h1>
              <p className="mt-4 text-base leading-relaxed text-white/85 md:text-lg">
                {allGuides.length > 0 ? `${allGuides.length} short guides` : 'Short guides'} from our local team, in the order you&apos;ll need them: from packing to permits to life on the trail.
              </p>
              <label className="relative mt-8 block max-w-lg">
                <span className="sr-only">Search the guides</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search, e.g. permits, altitude, insurance"
                  className="h-12 w-full rounded-full border-0 bg-white pl-11 pr-4 text-sm text-foreground shadow-lg outline-none ring-0 placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
                />
              </label>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6">
          {/* Step overview */}
          {sections.length > 0 && (
            <nav aria-label="Planning steps" className="relative z-10 -mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
              {sections.map(({ step, total }, index) => {
                const Icon = step.icon
                return (
                  <a
                    key={step.category}
                    href={`#${anchorFor(step.category)}`}
                    className={cn('group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none', step.tone.ring)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', step.tone.tile)}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">Step {index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{total} guide{total === 1 ? '' : 's'}</p>
                    </div>
                  </a>
                )
              })}
            </nav>
          )}

          {q && (
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                {matchCount} guide{matchCount === 1 ? '' : 's'} match <span className="font-medium text-foreground">“{searchQuery.trim()}”</span>
              </span>
              <button type="button" onClick={() => handleSearchChange('')} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 hover:bg-muted">
                <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear search
              </button>
            </div>
          )}

          {/* Steps */}
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading guides…</div>
          ) : matchCount === 0 ? (
            <div className="mx-auto my-16 max-w-md rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-medium text-foreground">{allGuides.length === 0 ? 'Guides are on their way.' : 'No guides match your search.'}</p>
              <p className="mt-1 text-sm text-muted-foreground">Ask us directly and we&apos;ll answer within a day.</p>
              <a href={GELE_CALL_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Book a free 15-min call
              </a>
            </div>
          ) : (
            <div className="space-y-14 py-12 md:py-16">
              {sections.map(({ step, guides }) => {
                if (guides.length === 0) return null
                const stepNumber = steps.findIndex((s) => s.category === step.category) + 1
                return (
                  <section key={step.category} id={anchorFor(step.category)} aria-labelledby={`${anchorFor(step.category)}-title`} className="scroll-mt-24">
                    <div className="mb-6 flex items-start gap-4">
                      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white', step.tone.number)}>
                        {stepNumber}
                      </span>
                      <div>
                        <h2 id={`${anchorFor(step.category)}-title`} className="font-serif text-2xl font-bold text-foreground md:text-3xl">{step.title}</h2>
                        {step.blurb && <p className="mt-1 text-muted-foreground">{step.blurb}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {guides.map((guide) => (
                        <GuideCard key={guide._id || guide.slug} guide={guide} tone={step.tone} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          {/* Help */}
          <aside className="mb-16 grid gap-4 md:grid-cols-2">
            <Link href="/packing-list" className="group flex items-center gap-5 rounded-3xl border border-border bg-accent/10 p-6 transition-colors hover:border-accent/50 md:p-8">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-white">
                <Backpack className="h-7 w-7" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-serif text-xl font-bold text-foreground">Free trekking packing list</span>
                <span className="mt-1 block text-sm text-muted-foreground">The checklist our guides use, season by season.</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-foreground">Get the list <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </span>
            </Link>
            <a href={GELE_CALL_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 rounded-3xl bg-primary p-6 text-primary-foreground transition-opacity hover:opacity-95 md:p-8">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <CalendarDays className="h-7 w-7" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-serif text-xl font-bold">Still have questions?</span>
                <span className="mt-1 block text-sm text-primary-foreground/80">Book a free 15-minute call with a local trekking expert.</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold">Pick a time <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </span>
            </a>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}

function GuideCard({ guide, tone }: { guide: TravelGuide; tone: Step['tone'] }) {
  const GuideIcon = getGuideMenuIcon(guide)
  const readTime = estimateReadTime(guide.content || '')
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={cn(
        'group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none',
        tone.ring
      )}
    >
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone.tile)}>
        <GuideIcon className="h-5 w-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{guide.title}</span>
        {guide.description && <span className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{guide.description}</span>}
        <span className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {readTime} min read
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
        </span>
      </span>
    </Link>
  )
}

export function GuidesClient({ initialGuides }: { initialGuides: TravelGuide[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-16" />}>
      <GuidesContent initialGuides={initialGuides} />
    </Suspense>
  )
}
