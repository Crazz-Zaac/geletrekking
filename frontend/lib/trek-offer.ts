export type OfferStatus = { state: 'live' | 'scheduled' | 'ended'; label: string }

export function salePrice(regular: number, percent: number): number {
  return Math.round(regular * (1 - percent / 100))
}

export function percentOff(regular: number, sale: number): number {
  return regular > 0 && sale > 0 && sale < regular ? Math.round(((regular - sale) / regular) * 100) : 0
}

const shortDate = (date: string) =>
  new Date(`${date}T00:00:00.000Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Mirrors the backend: the start and end dates both count as part of the offer. */
export function offerStatus(from: string, to: string, today: string): OfferStatus {
  if (from && today < from) return { state: 'scheduled', label: `Starts ${shortDate(from)}` }
  if (to && today > to) return { state: 'ended', label: `Ended ${shortDate(to)}` }
  return { state: 'live', label: to ? `Live until ${shortDate(to)}` : 'Live with no end date' }
}

export function offerProblem(
  offer: { offer_discount_percent: number; discounted_price_usd: number; offer_valid_from: string; offer_valid_to: string },
  regularUsd: number
): string | null {
  if (offer.discounted_price_usd > 0 && regularUsd > 0 && offer.discounted_price_usd >= regularUsd) {
    return `The sale price must be lower than the regular price of $${regularUsd.toLocaleString('en-US')}.`
  }
  if (offer.offer_discount_percent > 0 && !offer.discounted_price_usd) {
    return 'Add a sale price, otherwise visitors see a discount badge with no lower price.'
  }
  if (offer.offer_valid_from && offer.offer_valid_to && offer.offer_valid_to < offer.offer_valid_from) {
    return 'The offer ends before it starts. Please check the dates.'
  }
  return null
}

/**
 * The price of one package during an offer. The lowest package shows the exact
 * sale price; other packages get the same percentage off.
 */
export function applyOfferToTier(
  tierPrice: number,
  offer: { percent?: number; originalPrice?: number; salePrice: number }
): { price: number; wasPrice?: number } {
  if (!offer.percent || !offer.originalPrice || !tierPrice) return { price: tierPrice }
  const price = tierPrice === offer.originalPrice ? offer.salePrice : salePrice(tierPrice, offer.percent)
  return price < tierPrice ? { price, wasPrice: tierPrice } : { price: tierPrice }
}
