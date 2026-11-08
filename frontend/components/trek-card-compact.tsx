import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, Mountain } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { cn } from '@/lib/utils'
import { getTrekPath } from '@/lib/trek-path'

// Difficulty is shown as a coloured label in the card body (always readable,
// unlike a chip on top of a photo).
export const difficultyStyles: Record<Trek['difficulty'], { label: string; dot: string; text: string }> = {
  Easy: { label: 'Easy', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  Moderate: { label: 'Moderate', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  Strenuous: { label: 'Strenuous', dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400' },
  Challenging: { label: 'Challenging', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
}

export function DifficultyLabel({ difficulty, className }: { difficulty: Trek['difficulty']; className?: string }) {
  const style = difficultyStyles[difficulty] ?? difficultyStyles.Moderate
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-semibold', style.text, className)}>
      <span className={cn('h-2 w-2 rounded-full', style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  )
}

/** The red bow on the top-left corner of a card with an active offer. */
export function OfferRibbon({ size = 140 }: { size?: number }) {
  return (
    <div className="pointer-events-none absolute -left-3 -top-3 z-40">
      <Image src="/ribbon.png" alt="" width={size} height={size} className="object-contain drop-shadow-xl" loading="lazy" />
    </div>
  )
}

/** Homepage card: shorter photo, key facts at a glance, price and link on one line. */
export function TrekCardCompact({ trek, className }: { trek: Trek; className?: string }) {
  const hasOffer = Boolean(trek.hasOffer)

  return (
    <Link
      href={getTrekPath(trek)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className
      )}
    >
      {hasOffer ? <OfferRibbon /> : null}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={trek.image}
          alt={trek.title}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          sizes="(max-width: 639px) 80vw, (max-width: 1023px) 45vw, 400px"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
        <span className={cn('absolute rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm', hasOffer ? 'bottom-3 right-3' : 'left-3 top-3')}>
          {trek.region}
        </span>
        {hasOffer && trek.offerDiscountPercent ? (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            {trek.offerDiscountPercent}% off
          </span>
        ) : null}
        {trek.duration > 0 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-xs font-semibold text-white">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {trek.duration} days
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-bold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-primary">
          {trek.title}
        </h3>
        <div className="mb-3 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <DifficultyLabel difficulty={trek.difficulty} />
          {trek.maxAltitude > 0 && (
            <span className="inline-flex items-center gap-1">
              <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
              Max {trek.maxAltitude.toLocaleString()} m
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
          <div className="leading-tight">
            <p className="text-[11px] text-muted-foreground">
              From{' '}
              {hasOffer && trek.originalPrice ? <span className="line-through">${trek.originalPrice.toLocaleString()}</span> : null}
            </p>
            <p className={cn('text-lg font-bold', hasOffer ? 'text-red-600' : 'text-primary')}>
              ${trek.price.toLocaleString()}
              <span className="ml-1 text-[11px] font-normal text-muted-foreground">per person</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
            Details
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}
