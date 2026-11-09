import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarClock, Clock, Tag } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { getTrekPath } from '@/lib/trek-path'
import { ShareTrek } from '@/components/share-trek'
import { DifficultyLabel, OfferRibbon } from '@/components/trek-card-compact'
import { cn } from '@/lib/utils'

function formatEndDate(value?: string) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date)
}

/** Horizontal "deal" card: photo left, offer details right. About a third the height of a grid card. */
export function OfferCard({ trek, className, showShare = true }: { trek: Trek; className?: string; showShare?: boolean }) {
  const ends = formatEndDate(trek.offerValidTo)
  return (
    <Link
      href={getTrekPath(trek)}
      className={cn(
        'group relative flex overflow-hidden rounded-2xl border border-red-200/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-500/25 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className
      )}
    >
      <OfferRibbon size={100} />
      <div className="relative w-32 shrink-0 overflow-hidden bg-muted sm:w-44">
        <Image
          src={trek.image}
          alt={trek.title}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          sizes="(max-width: 639px) 128px, 176px"
        />
        {trek.offerDiscountPercent ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-red-600 px-2 py-1 text-xs font-extrabold leading-none text-white shadow">
            -{trek.offerDiscountPercent}%
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
          {ends ? <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> : <Tag className="h-3.5 w-3.5" aria-hidden="true" />}
          {ends ? `Offer ends ${ends}` : trek.offerType || 'Limited-time offer'}
        </p>
        <h3 className="mt-1 font-serif text-base font-bold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-red-700 sm:text-lg">
          {trek.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {trek.duration > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {trek.duration} days
            </span>
          )}
          <DifficultyLabel difficulty={trek.difficulty} />
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
          <p className="leading-tight">
            {trek.originalPrice ? <span className="mr-1.5 text-xs text-muted-foreground line-through">${trek.originalPrice.toLocaleString()}</span> : null}
            <span className="text-lg font-bold text-red-600">${trek.price.toLocaleString()}</span>
            <span className="ml-1 text-[11px] text-muted-foreground">pp</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {showShare ? <ShareTrek title={trek.title} path={getTrekPath(trek)} /> : null}
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-red-600 transition-all group-hover:gap-2 dark:text-red-400">
              View deal
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/** Compact special-offers band: horizontal deal cards, 480px wide on tablet and up. */
export function SpecialOffers({ treks }: { treks: Trek[] }) {
  if (treks.length === 0) return null
  return (
    <section
      className="border-y border-red-200/60 bg-gradient-to-b from-red-50/70 to-background py-10 dark:border-red-500/20 dark:from-red-950/10 dark:to-background md:py-12"
      aria-labelledby="special-offers-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">Limited Time Deals</p>
            <h2 id="special-offers-heading" className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Special Offer Treks
            </h2>
          </div>
          <Link
            href="/destinations"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:border-red-500/40 dark:text-red-400"
          >
            Explore All Deals
          </Link>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,30rem)] md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {treks.map((trek) => (
            <OfferCard key={trek.id} trek={trek} className="min-h-[9.5rem] w-[90%] shrink-0 snap-start md:w-auto" />
          ))}
        </div>
      </div>
    </section>
  )
}
