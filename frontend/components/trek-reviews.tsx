import { ExternalLink, Quote, Star } from 'lucide-react'
import type { SiteReviews } from '@/lib/api'
import { pickTrekReviews } from '@/lib/trek-reviews'

/** Real Google reviews for a trek page, or nothing when there are none to show. */
export function TrekReviews({ reviews, trekTitle }: { reviews: SiteReviews | null; trekTitle: string }) {
  if (!reviews?.available) return null
  const picked = pickTrekReviews(reviews.reviews, trekTitle)
  if (picked.length === 0) return null

  return (
    <div className="space-y-3">
      {reviews.averageRating && reviews.totalReviewCount ? (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="font-semibold text-foreground">{reviews.averageRating.toFixed(1)}</span> from {reviews.totalReviewCount} reviews on Google
        </p>
      ) : null}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
        {picked.map((review) => (
          <figure key={review.id} className="flex w-[85%] shrink-0 snap-center flex-col rounded-xl border border-border bg-card p-4 md:w-auto">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Quote className="h-5 w-5 shrink-0 text-primary/40" aria-hidden="true" />
              {review.mentionsTrek ? <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Mentions this route</span> : null}
            </div>
            <blockquote className="line-clamp-[7] flex-1 text-sm leading-relaxed text-foreground/90">{review.text}</blockquote>
            <figcaption className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
              <span className="min-w-0 truncate font-semibold text-foreground">{review.name}</span>
              {review.url ? (
                <a href={review.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  Read on Google <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
