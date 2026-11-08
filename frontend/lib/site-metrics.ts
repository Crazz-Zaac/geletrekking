/** Gele started in the trekking industry (as a porter) in 1998 and has led treks since 2004. */
export const FOUNDER_SINCE_YEAR = 1998
export const FOUNDER_LEADER_SINCE_YEAR = 2004
export const COMPANY_FOUNDED_YEAR = 2024

/** Whole five-year steps since 1998, e.g. "25+" from 2023 to 2027, so the claim is never overstated. */
function yearsSince(year: number) {
  const years = new Date().getFullYear() - year
  return `${Math.max(5, Math.floor(years / 5) * 5)}+`
}

export const SITE_METRICS = {
  /** Gele's whole career, an estimate from the owner, so it is shown as approximate. */
  trekkersGuided: '~500',
  founderYearsGuiding: yearsSince(FOUNDER_SINCE_YEAR),
  googleReviewRating: '4.8',
} as const

export const GOOGLE_REVIEW_RATING = SITE_METRICS.googleReviewRating

export const COMPANY_FOUNDING_STORY = `Founded in ${COMPANY_FOUNDED_YEAR} by Gele Bishokarma, who has worked in the Himalaya since ${FOUNDER_SINCE_YEAR}.`
