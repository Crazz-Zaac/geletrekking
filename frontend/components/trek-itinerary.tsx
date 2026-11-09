'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  BedDouble,
  Car,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Clock,
  Footprints,
  Plane,
  TrendingDown,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import type { ItineraryDay } from '@/lib/data'
import { buildItineraryRows, type DayFact, type ItineraryRow, type TravelMode } from '@/lib/trek-itinerary'
import { cn } from '@/lib/utils'

const MODE_ICONS: Record<TravelMode, LucideIcon> = { hike: Footprints, drive: Car, flight: Plane }
const FACT_ICONS: Record<DayFact['kind'], LucideIcon> = {
  time: Clock,
  ascent: TrendingUp,
  descent: TrendingDown,
  included: Utensils,
  stay: BedDouble,
}

const metres = (value: number) => `${value.toLocaleString('en-US')} m`

export function AltitudeChart({
  rows,
  selected,
  onSelect,
}: {
  rows: Array<ItineraryRow & { altitude: number }>
  selected: number | null
  onSelect: (day: number) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const altitudes = rows.map((row) => row.altitude)
  const highest = Math.max(...altitudes)
  const peakRow = rows.find((row) => row.altitude === highest) as (typeof rows)[number]
  const lo = Math.floor(Math.min(...altitudes) / 1000) * 1000
  const hi = Math.max(Math.ceil(highest / 1000) * 1000, lo + 1000)
  const step = hi - lo > 3000 ? 2000 : 1000
  const ticks: number[] = []
  for (let tick = lo; tick <= hi; tick += step) ticks.push(tick)

  const n = rows.length
  const xOf = (index: number) => ((index + 0.5) / n) * 100
  const yOf = (altitude: number) => 100 - ((altitude - lo) / (hi - lo)) * 100
  const line = rows.map((row, index) => `${xOf(index)},${yOf(row.altitude)}`).join(' L')
  const area = `M${xOf(0)},100 L${line} L${xOf(n - 1)},100 Z`

  const shownDay = hovered ?? selected ?? peakRow.day
  const shown = rows.find((row) => row.day === shownDay) ?? peakRow
  const peakIndex = rows.indexOf(peakRow)
  const peakX = xOf(peakIndex)

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-semibold text-foreground">Overnight altitude</h3>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Day {shown.day}</span> · {shown.place} ·{' '}
          <span className="font-semibold text-primary">{metres(shown.altitude)}</span>
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative h-44 w-10 shrink-0 md:h-56" aria-hidden="true">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground"
              style={{ top: `${yOf(tick)}%` }}
            >
              {tick.toLocaleString('en-US')}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-44 md:h-56" onMouseLeave={() => setHovered(null)}>
            {ticks.map((tick) => (
              <span key={tick} aria-hidden="true" className="absolute inset-x-0 border-t border-border/70" style={{ top: `${yOf(tick)}%` }} />
            ))}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path d={area} className="fill-primary/10" />
              <path d={`M${line}`} fill="none" vectorEffect="non-scaling-stroke" className="stroke-primary" strokeWidth={2} strokeLinejoin="round" />
            </svg>

            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute z-10 whitespace-nowrap text-xs font-bold text-accent-foreground',
                peakX < 12 ? 'translate-x-0' : peakX > 88 ? '-translate-x-full' : '-translate-x-1/2'
              )}
              style={{ left: `${peakX}%`, top: `calc(${yOf(highest)}% - 1.6rem)` }}
            >
              {metres(highest)}
            </span>

            {rows.map((row, index) => {
              const active = row.day === (hovered ?? selected)
              const isPeak = index === peakIndex
              return (
                <button
                  key={row.day}
                  type="button"
                  onClick={() => onSelect(row.day)}
                  onMouseEnter={() => setHovered(row.day)}
                  onFocus={() => setHovered(row.day)}
                  onBlur={() => setHovered(null)}
                  aria-label={`Day ${row.day}, ${row.place}, ${metres(row.altitude)}${row.isAcclimatisation ? ', acclimatisation day' : ''}. Open this day.`}
                  className={cn(
                    'absolute inset-y-0 rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary',
                    active && 'bg-primary/10'
                  )}
                  style={{ left: `${(index / n) * 100}%`, width: `${100 / n}%` }}
                >
                  <span
                    className={cn(
                      'absolute left-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full',
                      isPeak
                        ? 'h-3.5 w-3.5 bg-accent ring-2 ring-background'
                        : row.isAcclimatisation
                          ? 'h-3 w-3 border-2 border-accent bg-background'
                          : 'h-2 w-2 bg-primary'
                    )}
                    style={{ top: `${yOf(row.altitude)}%` }}
                  />
                </button>
              )
            })}
          </div>

          <div className="mt-1.5 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} aria-hidden="true">
            {rows.map((row, index) => (
              <span
                key={row.day}
                className={cn(
                  'text-center text-[11px] tabular-nums text-muted-foreground',
                  n > 12 && index % 2 === 1 && 'invisible sm:visible'
                )}
              >
                {row.day}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 pl-12 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Highest night
        </span>
        {rows.some((row) => row.isAcclimatisation) ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-accent bg-background" /> Acclimatisation day
          </span>
        ) : null}
        <span>Metres, by day. Select a day to read it.</span>
      </div>
    </div>
  )
}

function DayRow({
  row,
  open,
  onToggle,
  renderText,
}: {
  row: ItineraryRow
  open: boolean
  onToggle: () => void
  renderText: (value: string) => ReactNode
}) {
  const ModeIcon = row.distance?.mode ? MODE_ICONS[row.distance.mode] : null
  const panelId = `itinerary-day-${row.day}-panel`
  return (
    <li id={`itinerary-day-${row.day}`} className="scroll-mt-36">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:gap-4 md:px-4"
        >
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg leading-none',
              row.isAcclimatisation ? 'bg-accent/15 text-foreground' : 'bg-primary/10 text-primary'
            )}
          >
            <span className="text-[9px] font-semibold uppercase tracking-wider">Day</span>
            <span className="mt-0.5 text-base font-bold tabular-nums">{row.day}</span>
          </span>

          <span className="min-w-0 flex-1 md:flex md:items-center md:justify-between md:gap-4">
            <span className="block min-w-0">
              <span className="font-semibold text-foreground">{row.route}</span>
              {row.isAcclimatisation ? (
                <span className="ml-2 inline-block rounded-full bg-accent/15 px-2 py-0.5 align-middle text-[11px] font-semibold text-foreground">
                  Acclimatisation
                </span>
              ) : null}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground md:mt-0 md:shrink-0 md:justify-end">
              {row.altitude !== undefined ? <span className="font-medium tabular-nums text-foreground/80">{metres(row.altitude)}</span> : null}
              {row.distance ? (
                <span className="inline-flex items-center gap-1">
                  {ModeIcon ? <ModeIcon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  {row.distance.label}
                </span>
              ) : null}
              {row.walkingHours ? <span className="whitespace-nowrap">{row.walkingHours}</span> : null}
            </span>
          </span>

          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </button>
      </h3>

      {open ? (
        <div id={panelId} className="px-3 pb-5 md:pl-[4.75rem] md:pr-10">
          {row.facts.length > 0 ? (
            <dl className="mb-4 grid gap-x-6 gap-y-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2">
              {row.facts.map((fact) => {
                const Icon = FACT_ICONS[fact.kind]
                return (
                  <div key={fact.kind} className="flex gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                      <dd className="text-sm font-medium text-foreground">{fact.value}</dd>
                    </div>
                  </div>
                )
              })}
            </dl>
          ) : null}
          {row.body ? <div className="text-[15px] leading-relaxed">{renderText(row.body)}</div> : null}
        </div>
      ) : null}
    </li>
  )
}

export function TrekItinerary({
  days,
  maxAltitude,
  renderText,
}: {
  days: ItineraryDay[]
  /** The trek's highest point, which can be above any overnight stop. */
  maxAltitude: number
  renderText: (value: string) => ReactNode
}) {
  const rows = useMemo(() => buildItineraryRows(days), [days])
  const [openDays, setOpenDays] = useState<Set<number>>(() => new Set())
  const [selected, setSelected] = useState<number | null>(null)

  const chartRows = rows.filter((row): row is ItineraryRow & { altitude: number } => row.altitude !== undefined)
  const highestNight = chartRows.length ? Math.max(...chartRows.map((row) => row.altitude)) : 0
  const acclimatisationDays = rows.filter((row) => row.isAcclimatisation).length
  const allOpen = rows.length > 0 && openDays.size === rows.length

  const toggle = (day: number) =>
    setOpenDays((current) => {
      const next = new Set(current)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })

  const selectFromChart = (day: number) => {
    setSelected(day)
    setOpenDays((current) => new Set(current).add(day))
    window.requestAnimationFrame(() =>
      document.getElementById(`itinerary-day-${day}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    )
  }

  const summary = [
    `${rows.length} days`,
    acclimatisationDays ? `${acclimatisationDays} acclimatisation ${acclimatisationDays === 1 ? 'day' : 'days'}` : '',
    highestNight ? `Highest night ${metres(highestNight)}` : '',
    maxAltitude > highestNight ? `Highest point ${metres(maxAltitude)}` : '',
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {summary.map((item, index) => (
            <span key={item}>
              {index > 0 ? <span aria-hidden="true"> · </span> : null}
              <span className={index === 0 ? 'font-semibold text-foreground' : ''}>{item}</span>
            </span>
          ))}
        </p>
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setOpenDays(allOpen ? new Set() : new Set(rows.map((row) => row.day)))}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            {allOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      {chartRows.length >= 2 ? <AltitudeChart rows={chartRows} selected={selected} onSelect={selectFromChart} /> : null}

      <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((row) => (
          <DayRow key={row.day} row={row} open={openDays.has(row.day)} onToggle={() => toggle(row.day)} renderText={renderText} />
        ))}
      </ol>
    </div>
  )
}
