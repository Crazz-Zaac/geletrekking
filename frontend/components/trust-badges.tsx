'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BadgeCheck, FileText, ShieldCheck, Star } from 'lucide-react'
import { getTrustSummary, type TrustSummary } from '@/lib/api'
import { cn } from '@/lib/utils'

const GOOGLE_REVIEWS_URL = 'https://search.google.com/local/reviews?placeid=ChIJR_d6frYf6zkR0HAm4EnYRkI'

// Short names for well-known Nepali tourism bodies (falls back to the full name).
const SHORT_NAMES: Record<string, string> = {
  "Trekking Agencies' Association of Nepal": 'TAAN',
  'Nepal Tourism Board': 'Nepal Tourism Board',
  'Nepal Mountaineering Association': 'NMA',
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cn('h-3.5 w-3.5', rating - index >= 0.75 ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
      ))}
    </span>
  )
}

/** One-line Google rating for tight spaces such as the booking card. */
export function TrustRating({ trust }: { trust: TrustSummary | null }) {
  if (!trust || trust.rating === null || !trust.reviewCount) return null
  return (
    <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm text-foreground">
      <RatingStars rating={trust.rating} />
      <span>
        <span className="font-semibold">{trust.rating.toFixed(1)}</span>
        <span className="text-muted-foreground"> · <span className="underline-offset-2 group-hover:underline">{trust.reviewCount} Google reviews</span></span>
      </span>
    </a>
  )
}

/**
 * Compact trust signals for decision points (next to the inquiry form). Shows only what
 * the admin data supports: Google rating, verified registrations, memberships,
 * and links to the booking/cancellation terms.
 */
export function TrustBadges({ trust, className }: { trust: TrustSummary | null; className?: string }) {
  if (!trust) return null
  const memberships = trust.associations.filter((item) => item.name !== 'Nepal Government').map((item) => SHORT_NAMES[item.name] || item.name)

  return (
    <ul className={cn('space-y-2.5 text-sm', className)} aria-label="Why book with us">
      {trust.rating !== null && trust.reviewCount ? (
        <li>
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-foreground">
            <RatingStars rating={trust.rating} />
            <span>
              <span className="font-semibold">{trust.rating.toFixed(1)}</span>
              <span className="text-muted-foreground"> · <span className="underline-offset-2 group-hover:underline">{trust.reviewCount} Google reviews</span></span>
            </span>
          </a>
        </li>
      ) : null}
      {trust.verifiedRegistrations.length > 0 && (
        <li className="flex items-start gap-2">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <Link href="/company/registrations-affiliations" className="text-foreground underline-offset-2 hover:underline">
            Government-registered company in Nepal
          </Link>
        </li>
      )}
      {memberships.length > 0 && (
        <li className="flex items-start gap-2">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span className="text-foreground">Member of {memberships.join(', ')}</span>
        </li>
      )}
      <li className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <Link href="/safety" className="text-foreground underline-offset-2 hover:underline">How we keep you safe</Link>
      </li>
      <li className="flex items-start gap-2">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="text-muted-foreground">
          <Link href="/terms-and-conditions#section-1" className="text-foreground underline-offset-2 hover:underline">Payment</Link>
          {' & '}
          <Link href="/terms-and-conditions#section-2" className="text-foreground underline-offset-2 hover:underline">cancellation terms</Link>
        </span>
      </li>
    </ul>
  )
}

/** Logos + rating row for the footer. Loads the small /api/trust summary once. */
export function FooterTrustRow() {
  const [trust, setTrust] = useState<TrustSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    void getTrustSummary().then((data) => {
      if (!cancelled) setTrust(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!trust || (trust.associations.length === 0 && !trust.reviewCount)) return null

  return (
    <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 py-6 md:flex-row">
      {trust.associations.length > 0 && (
        <div className="flex flex-col items-center gap-3 md:items-start">
          <p className="text-xs uppercase tracking-widest text-white/50">Registered & affiliated with</p>
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {trust.associations.map((association) => (
              <li key={association.name} title={association.name} className="flex h-12 min-w-12 items-center justify-center rounded-lg bg-white px-2 py-1.5">
                {/* Height-led sizing: wide logos (TAAN, NMA) get more width instead of shrinking into a square. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={association.logoUrl} alt={association.name} loading="lazy" className="h-full w-auto max-w-[9rem] object-contain" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {trust.rating !== null && trust.reviewCount ? (
        <div className="flex flex-col items-center gap-2 md:items-end">
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10">
            <span className="text-2xl font-bold">{trust.rating.toFixed(1)}</span>
            <span>
              <RatingStars rating={trust.rating} />
              <span className="block text-xs text-white/70">{trust.reviewCount} reviews on Google</span>
            </span>
          </a>
          <a
            href={trust.writeReviewUrl || 'https://search.google.com/local/writereview?placeid=ChIJR_d6frYf6zkR0HAm4EnYRkI'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/70 underline underline-offset-4 hover:text-white"
          >
            Trekked with us? Write a review
          </a>
        </div>
      ) : null}
    </div>
  )
}
