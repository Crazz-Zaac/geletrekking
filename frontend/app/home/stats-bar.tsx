import { FOUNDER_LEADER_SINCE_YEAR, SITE_METRICS } from '@/lib/site-metrics'

export function StatsBar({ rating, reviewCount }: { rating: number | null; reviewCount: number | null }) {
  const stats = [
    { value: SITE_METRICS.trekkersGuided, label: 'Trekkers Guided by Gele' },
    { value: SITE_METRICS.founderYearsGuiding, label: 'Years in the Himalaya' },
    { value: String(FOUNDER_LEADER_SINCE_YEAR), label: 'Leading Treks Since' },
    {
      value: `${rating ? rating.toFixed(1) : SITE_METRICS.googleReviewRating}/5`,
      label: reviewCount ? `From ${reviewCount} Google Reviews` : 'Google Rating',
    },
  ]

  return (
    <div className="bg-primary text-primary-foreground py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="font-serif text-3xl font-bold text-accent">{stat.value}</span>
              <span className="text-xs font-medium text-primary-foreground/70 mt-1 uppercase tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-primary-foreground/75">
          Gele’s trekkers have mostly come from Europe, the USA and Australia.
        </p>
      </div>
    </div>
  )
}
