import type { SiteReview } from '@/lib/api'

export type TrekReview = SiteReview & { mentionsTrek: boolean }

/** Words a guest would actually use for a route, keyed by what appears in the trek's title. */
const ROUTE_WORDS: Array<[title: RegExp, words: RegExp]> = [
  [/everest|sagarmatha/i, /everest|\bebc\b|khumbu|kala pat+h?ar/i],
  [/gokyo|cho la/i, /gokyo|cho la|three passes|3 passes/i],
  [/island peak/i, /island peak|imja/i],
  [/annapurna base camp/i, /annapurna base camp|\babc\b/i],
  [/annapurna circuit/i, /annapurna circuit|annapurna rund|thorong/i],
  [/ghorepani|poon hill/i, /ghorepani|poon hill/i],
  [/mustang/i, /mustang|lo manthang/i],
  [/langtang/i, /langtang/i],
  [/pikey/i, /pikey/i],
  [/valley rim/i, /shivapuri|chisapani|valley rim/i],
]

/** Google adds "(Translated by Google) ... (Original) ..." to translated reviews; visitors only need the first part. */
export function cleanReviewText(text: string) {
  return text.replace(/^\s*\(Translated by Google\)\s*/i, '').split(/\n\s*\(Original\)/i)[0].trim()
}

/** Reviews about this route first, then the most detailed general ones. Only real matches are flagged. */
export function pickTrekReviews(reviews: SiteReview[], trekTitle: string, limit = 3): TrekReview[] {
  const routeWords = ROUTE_WORDS.filter(([title]) => title.test(trekTitle)).map(([, words]) => words)
  return reviews
    .filter((review) => review.rating >= 4 && cleanReviewText(review.text).length >= 60)
    .map((review) => ({ ...review, text: cleanReviewText(review.text), mentionsTrek: routeWords.some((words) => words.test(review.text)) }))
    .sort((a, b) => Number(b.mentionsTrek) - Number(a.mentionsTrek) || b.rating - a.rating || b.text.length - a.text.length)
    .slice(0, limit)
}
