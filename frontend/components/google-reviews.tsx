'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, PenLine, Star } from 'lucide-react'
import type { SiteReview, SiteReviews } from '@/lib/api'
import { cn } from '@/lib/utils'

const PLACE_ID = 'ChIJR_d6frYf6zkR0HAm4EnYRkI'
const ALL_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`
const WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`

function GoogleG({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className={className}>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index))
        return (
          <span key={index} className="relative inline-block h-4 w-4">
            <Star className="absolute inset-0 h-4 w-4 text-slate-300" aria-hidden="true" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            </span>
          </span>
        )
      })}
    </span>
  )
}

function timeAgo(value: string | null) {
  if (!value) return ''
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  if (days < 1) return 'today'
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? '' : 's'} ago`
  return `${Math.floor(days / 365)} year${days < 730 ? '' : 's'} ago`
}

const AVATAR_COLORS = ['bg-sky-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-teal-600']

function Avatar({ review }: { review: SiteReview }) {
  const [broken, setBroken] = useState(false)
  const initial = review.name.trim().charAt(0).toUpperCase() || '?'
  const color = AVATAR_COLORS[review.name.length % AVATAR_COLORS.length]
  if (review.avatar && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={review.avatar} alt="" width={40} height={40} loading="lazy" onError={() => setBroken(true)} className="h-10 w-10 shrink-0 rounded-full object-cover" />
  }
  return <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white', color)} aria-hidden="true">{initial}</span>
}

function ReviewCard({ review }: { review: SiteReview }) {
  const [expanded, setExpanded] = useState(false)
  const long = review.text.length > 260
  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-5 text-slate-800 shadow-lg shadow-black/10">
      <header className="flex items-center gap-3">
        <Avatar review={review} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{review.name}</p>
          {review.date && (
            <p className="text-xs text-slate-500">
              <time dateTime={review.date}>{timeAgo(review.date)}</time>
            </p>
          )}
        </div>
        <GoogleG className="h-5 w-5 shrink-0" />
      </header>
      <Stars rating={review.rating} className="mt-3" />
      <p className={cn('mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-700', !expanded && long && 'line-clamp-6')}>{review.text}</p>
      {long && (
        <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-2 self-start text-sm font-medium text-primary hover:underline" aria-expanded={expanded}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </article>
  )
}

export function GoogleReviews({ data }: { data: SiteReviews | null }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const reviews = data?.available ? data.reviews : []
  const writeUrl = data?.writeReviewUrl || WRITE_REVIEW_URL

  const scrollBy = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-review-card]')
    const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.8
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  // No data yet (or the review service is unreachable): link to Google instead.
  if (reviews.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-lg">
        <GoogleG className="h-10 w-10" />
        <p className="text-lg font-semibold text-slate-900">Read what trekkers say about us on Google</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={ALL_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Read our reviews <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href={writeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <PenLine className="h-4 w-4" aria-hidden="true" /> Write a review
          </a>
        </div>
      </div>
    )
  }

  const average = data?.averageRating ?? null
  const total = data?.totalReviewCount ?? reviews.length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-lg sm:flex-row">
        <div className="flex items-center gap-4">
          <GoogleG className="h-9 w-9" />
          <div>
            <div className="flex items-center gap-2">
              {average !== null && <span className="text-2xl font-bold text-slate-900">{average.toFixed(1)}</span>}
              {average !== null && <Stars rating={average} />}
            </div>
            <p className="text-sm text-slate-600">
              Based on{' '}
              <a href={ALL_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 underline underline-offset-2">
                {total} Google review{total === 1 ? '' : 's'}
              </a>
            </p>
          </div>
        </div>
        <a href={writeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <PenLine className="h-4 w-4" aria-hidden="true" /> Write a review
        </a>
      </div>

      {/* Cards: swipe on touch, arrows on desktop */}
      <div className="relative">
        <div
          ref={trackRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
          aria-label="Google reviews"
        >
          {reviews.map((review) => (
            <div key={review.id} data-review-card role="listitem" className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
        {reviews.length > 3 && (
          <>
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous reviews" className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-50 lg:flex">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Next reviews" className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-50 lg:flex">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {data?.showBranding && (
        <p className="text-center text-xs text-white/60">
          Reviews collected via{' '}
          <a href="https://featurable.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
            Featurable
          </a>
        </p>
      )}
    </div>
  )
}
