'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { cn } from '@/lib/utils'
import { TrekCardCompact } from '@/components/trek-card-compact'

const PER_VIEW = 6
const ALL = 'All'

/**
 * Homepage "Popular Trek Packages": region filter chips over a 3-column grid
 * (a swipeable row on phones). `treks` arrives already ranked: featured treks
 * in their admin order first, then the rest.
 */
export function PopularTreks({ treks, totalCount }: { treks: Trek[]; totalCount: number }) {
  const [region, setRegion] = useState<string>(ALL)

  const regions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const trek of treks) counts.set(trek.region, (counts.get(trek.region) ?? 0) + 1)
    return [...counts.entries()]
      .filter(([name]) => name !== 'Other')
      .sort((a, b) => b[1] - a[1])
  }, [treks])

  const shown = useMemo(
    () => (region === ALL ? treks : treks.filter((trek) => trek.region === region)).slice(0, PER_VIEW),
    [region, treks]
  )

  const viewAllHref = region === ALL ? '/destinations' : `/destinations?region=${encodeURIComponent(region)}`
  const viewAllCount = region === ALL ? totalCount : regions.find(([name]) => name === region)?.[1] ?? 0

  return (
    <section className="bg-background py-16 md:py-20" aria-labelledby="popular-treks-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[69.5rem]">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Our Top Picks</p>
            <h2 id="popular-treks-heading" className="text-balance font-serif text-4xl font-bold text-foreground">
              Popular Trek Packages
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            View all {viewAllCount > 0 ? `${viewAllCount} ` : ''}{region === ALL ? 'treks' : `${region} treks`}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {regions.length > 1 && (
          <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter treks by region">
            {[[ALL, treks.length] as const, ...regions].map(([name, count]) => {
              const active = region === name
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRegion(name)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted'
                  )}
                >
                  {name === ALL ? 'All regions' : name}
                  {name !== ALL && <span className={cn('text-xs', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{count}</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Phones: swipeable row with the next card peeking. Tablet+: grid. */}
        <div
          key={region}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(17.5rem,21rem))] sm:justify-center sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 animate-in fade-in duration-300"
        >
          {shown.map((trek) => (
            <TrekCardCompact key={trek.id} trek={trek} className="w-[80%] shrink-0 snap-start sm:w-auto" />
          ))}
        </div>
      </div>
    </section>
  )
}
