'use client'

import { useMemo, useState, type ComponentProps } from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, BedDouble, ChevronDown, ChevronsDownUp, ChevronsUpDown, Mountain, Plus, Route, Trash2 } from 'lucide-react'
import { Field } from '@/components/admin/form-kit'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { AltitudeChart } from '@/components/trek-itinerary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  buildItineraryRows,
  isImpossibleAltitude,
  joinAltitude,
  parseAltitude,
  samePlace,
  splitAltitude,
} from '@/lib/trek-itinerary'
import { cn } from '@/lib/utils'

export type EditableDay = {
  day: number
  title: string
  description: string
  altitude: string
  distance: string
  accommodation: string
}

const TRAVEL_MODES = [
  '🥾 Hike',
  '🚗 Drive',
  '🚙 Jeep Drive',
  '🚌 Bus',
  '✈️ Flight',
  '🚁 Helicopter',
  '🚲 Bike',
  '🚤 Boat',
  '🚶 Walk',
  '🐎 Horse',
  '🛶 Raft / Canoe',
] as const

function parseDistance(value: string) {
  const trimmed = value.trim()
  const separatorIndex = trimmed.lastIndexOf(' - ')
  const activityText = separatorIndex >= 0 ? trimmed.slice(0, separatorIndex) : trimmed
  const modes = activityText
    .split(' + ')
    .map((item) => item.trim())
    .filter((item) => TRAVEL_MODES.includes(item as (typeof TRAVEL_MODES)[number]))
  const km = separatorIndex >= 0 ? trimmed.slice(separatorIndex + 3) : modes.length > 0 ? '' : trimmed
  return { modes, km: km.replace(/\s*km$/i, '').trim() }
}

function formatDistance(modes: string[], km: string) {
  const cleanedKm = km.replace(/\s*km$/i, '').trim()
  const modeText = modes.join(' + ')
  if (modeText && cleanedKm) return `${modeText} - ${cleanedKm} km`
  if (modeText) return modeText
  return cleanedKm ? `${cleanedKm} km` : ''
}

function InputWithUnit({ unit, className, ...props }: ComponentProps<typeof Input> & { unit?: string }) {
  return (
    <div className="relative">
      <Input {...props} className={cn(unit && 'pr-10', className)} />
      {unit ? (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground" aria-hidden="true">
          {unit}
        </span>
      ) : null}
    </div>
  )
}

function dayProblems(days: EditableDay[], index: number): string[] {
  const day = days[index]
  const problems: string[] = []
  if (!day.title.trim()) problems.push('Add a place name. Days without one are not saved.')
  const { metres } = splitAltitude(day.altitude)
  if (!metres) problems.push('Add the overnight altitude so this day appears on the chart.')
  else if (isImpossibleAltitude(metres)) problems.push('This altitude is higher than Everest. Please check the number.')
  const altitude = parseAltitude(day.altitude)
  if (altitude !== undefined && day.title.trim()) {
    const earlier = days
      .slice(0, index)
      .find((other) => samePlace(other.title, day.title) && parseAltitude(other.altitude) !== undefined && parseAltitude(other.altitude) !== altitude)
    if (earlier) {
      problems.push(`${earlier.title.trim()} is ${parseAltitude(earlier.altitude)?.toLocaleString('en-US')} m on day ${earlier.day}. Should these match?`)
    }
  }
  return problems
}

const iconButton =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'

export function ItineraryEditor({
  days,
  onChange,
  confirmRemove,
}: {
  days: EditableDay[]
  onChange: (days: EditableDay[]) => void
  confirmRemove: (day: EditableDay) => Promise<boolean>
}) {
  // A brand-new trek starts with its only day open; saved treks start as a tidy list.
  const [open, setOpen] = useState<Set<number>>(() => new Set(days.length === 1 && !days[0].title ? [0] : []))
  const problems = useMemo(() => days.map((_, index) => dayProblems(days, index)), [days])
  const toCheck = problems.flatMap((list, index) => (list.length ? [index] : []))
  const chartRows = useMemo(
    () =>
      buildItineraryRows(
        days.map((day) => ({ ...day, title: day.title || `Day ${day.day}`, altitude: parseAltitude(day.altitude) }))
      ).filter((row): row is (typeof row) & { altitude: number } => row.altitude !== undefined),
    [days]
  )
  const allOpen = days.length > 0 && open.size === days.length

  const update = (index: number, patch: Partial<EditableDay>) =>
    onChange(days.map((day, i) => (i === index ? { ...day, ...patch } : day)))

  const reveal = (index: number) => {
    setOpen((current) => new Set(current).add(index))
    window.requestAnimationFrame(() => {
      document.getElementById(`itinerary-editor-day-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current)
      if (!next.delete(index)) next.add(index)
      return next
    })

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    const reordered = [...days]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    onChange(reordered.map((day, i) => ({ ...day, day: i + 1 })))
    setOpen((current) => {
      const next = new Set(current)
      const first = next.has(index)
      const second = next.has(target)
      next.delete(index)
      next.delete(target)
      if (first) next.add(target)
      if (second) next.add(index)
      return next
    })
  }

  const remove = async (index: number) => {
    if (!(await confirmRemove(days[index]))) return
    onChange(days.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 })))
    setOpen((current) => {
      const next = new Set<number>()
      current.forEach((value) => {
        if (value < index) next.add(value)
        if (value > index) next.add(value - 1)
      })
      return next
    })
  }

  const add = () => {
    const index = days.length
    onChange([...days, { day: index + 1, title: '', description: '', altitude: '', distance: '', accommodation: '' }])
    reveal(index)
  }

  const stayOptions = [...new Set(days.map((day) => day.accommodation.trim()).filter(Boolean))]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{days.length} {days.length === 1 ? 'day' : 'days'}</span>
          {toCheck.length > 0 ? (
            <>
              {' · '}
              <button
                type="button"
                onClick={() => setOpen(new Set(toCheck))}
                className="font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400"
              >
                {toCheck.length} to check
              </button>
            </>
          ) : null}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(allOpen ? new Set() : new Set(days.map((_, index) => index)))}
        >
          {allOpen ? <ChevronsDownUp className="mr-1.5 h-4 w-4" /> : <ChevronsUpDown className="mr-1.5 h-4 w-4" />}
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>

      {chartRows.length >= 2 ? (
        <AltitudeChart rows={chartRows} selected={null} onSelect={(day) => reveal(days.findIndex((item) => item.day === day))} />
      ) : null}

      <datalist id="itinerary-stay-options">
        {stayOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <ol className="space-y-2">
        {days.map((day, index) => {
          const isOpen = open.has(index)
          const altitude = splitAltitude(day.altitude)
          const distance = parseDistance(day.distance)
          const metres = parseAltitude(day.altitude)
          const distanceSummary = [
            distance.modes.map((mode) => mode.split(' ')[0]).join(' '),
            distance.km && `${distance.km}${/^[\d.]+$/.test(distance.km) ? ' km' : ''}`,
          ]
            .filter(Boolean)
            .join(' ')
          const panelId = `itinerary-editor-panel-${index}`

          return (
            <li
              key={index}
              id={`itinerary-editor-day-${index}`}
              className={cn('scroll-mt-24 rounded-xl border bg-card transition-shadow', isOpen ? 'border-primary/40 shadow-sm' : 'border-border')}
            >
              <div className="flex flex-wrap items-center gap-1 pr-1.5 sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex min-w-0 flex-1 basis-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary sm:basis-0"
                >
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
                  <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold tabular-nums text-primary">Day {day.day}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-sm font-semibold', day.title.trim() ? 'text-foreground' : 'font-normal italic text-muted-foreground')}>
                      {day.title.trim() || 'Untitled day'}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                      {metres !== undefined ? (
                        <span className="inline-flex items-center gap-1">
                          <Mountain className="h-3 w-3" aria-hidden="true" />
                          {metres.toLocaleString('en-US')} m
                        </span>
                      ) : null}
                      {distanceSummary ? (
                        <span className="inline-flex items-center gap-1">
                          <Route className="h-3 w-3" aria-hidden="true" />
                          {distanceSummary}
                        </span>
                      ) : null}
                      {day.accommodation.trim() ? (
                        <span className="inline-flex max-w-44 items-center gap-1">
                          <BedDouble className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{day.accommodation.trim()}</span>
                        </span>
                      ) : null}
                    </span>
                  </span>
                  {problems[index].length > 0 ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-label="Needs checking" />
                  ) : null}
                </button>
                <div className={cn('ml-auto flex shrink-0 items-center gap-1 max-sm:pb-1', !isOpen && 'max-sm:hidden')}>
                <button type="button" className={iconButton} onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move day ${day.day} up`} title="Move up">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" className={iconButton} onClick={() => move(index, 1)} disabled={index === days.length - 1} aria-label={`Move day ${day.day} down`} title="Move down">
                  <ArrowDown className="h-4 w-4" />
                </button>
                {days.length > 1 ? (
                  <button
                    type="button"
                    className={cn(iconButton, 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10')}
                    onClick={() => void remove(index)}
                    aria-label={`Remove day ${day.day}`}
                    title="Remove day"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
                </div>
              </div>

              {isOpen ? (
                <div id={panelId} className="space-y-5 border-t border-border p-4">
                  {problems[index].length > 0 ? (
                    <ul className="space-y-1 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                      {problems[index].map((problem) => (
                        <li key={problem}>{problem}</li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.5fr)]">
                    <Field label="Place" className="sm:col-span-2 lg:col-span-1">
                      <Input placeholder="e.g. Namche" value={day.title} onChange={(event) => update(index, { title: event.target.value })} />
                    </Field>
                    <Field label="Overnight altitude">
                      <InputWithUnit
                        unit="m"
                        inputMode="numeric"
                        placeholder="3440"
                        value={altitude.metres}
                        onChange={(event) => update(index, { altitude: joinAltitude(event.target.value.replace(/\D/g, '').slice(0, 5), altitude.note) })}
                      />
                    </Field>
                    <Field label="Also reached (optional)">
                      <Input
                        placeholder="e.g. Summit 6,189 m"
                        value={altitude.note}
                        onChange={(event) => update(index, { altitude: joinAltitude(altitude.metres, event.target.value) })}
                      />
                    </Field>
                  </div>

                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-foreground">How they travel</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {TRAVEL_MODES.map((mode) => {
                        const selected = distance.modes.includes(mode)
                        return (
                          <button
                            key={mode}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              update(index, {
                                distance: formatDistance(selected ? distance.modes.filter((item) => item !== mode) : [...distance.modes, mode], distance.km),
                              })
                            }
                            className={cn(
                              'rounded-full border px-3 py-1.5 text-sm transition-colors',
                              selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted'
                            )}
                          >
                            {mode}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    <Field label="Distance">
                      <InputWithUnit
                        unit={/^[\d.]*$/.test(distance.km) ? 'km' : undefined}
                        placeholder="6.4"
                        value={distance.km}
                        onChange={(event) => update(index, { distance: formatDistance(distance.modes, event.target.value) })}
                      />
                    </Field>
                    <Field label="Where they sleep">
                      <Input
                        list="itinerary-stay-options"
                        placeholder="e.g. Teahouse in Namche"
                        value={day.accommodation}
                        onChange={(event) => update(index, { accommodation: event.target.value })}
                      />
                    </Field>
                  </div>

                  <Field label="What happens this day">
                    <MarkdownEditor
                      value={day.description}
                      onChange={(value) => update(index, { description: value })}
                      rows={5}
                      placeholder="Describe the day: route, highlights, overnight stop."
                    />
                  </Field>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>

      <Button type="button" variant="outline" onClick={add} className="w-full border-dashed">
        <Plus className="mr-1.5 h-4 w-4" />
        Add day {days.length + 1}
      </Button>
    </div>
  )
}
