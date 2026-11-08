'use client'

import { useRef, useState } from 'react'
import { ArrowRight, CalendarPlus, StickyNote, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addCalendarDays, buildDepartures, parseCalendarDate, tripDays, type DepartureRepeat } from '@/lib/trek-availability'
import { cn } from '@/lib/utils'

export type DepartureRange = {
  start_date: string
  end_date: string
  status: 'available' | 'limited' | 'booked'
  note: string
}

const STATUSES: { value: DepartureRange['status']; label: string; selected: string }[] = [
  { value: 'available', label: 'Open', selected: 'bg-emerald-600 text-white' },
  { value: 'limited', label: 'Few left', selected: 'bg-amber-500 text-white' },
  { value: 'booked', label: 'Full', selected: 'bg-slate-700 text-white' },
]

const REPEATS: { value: DepartureRepeat; label: string }[] = [
  { value: 'once', label: 'Just this date' },
  { value: 'weekly', label: 'Every week' },
  { value: 'fortnightly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Every month' },
]

const today = () => new Date().toISOString().slice(0, 10)
const byStart = (a: DepartureRange, b: DepartureRange) => a.start_date.localeCompare(b.start_date) || a.end_date.localeCompare(b.end_date)
const countPast = (list: DepartureRange[]) => list.filter((range) => range.start_date < today()).length

function longDate(date: string) {
  const parsed = parseCalendarDate(date)
  return parsed
    ? parsed.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : ''
}

const quickLabel = 'mb-1 block text-xs font-medium text-muted-foreground'
// Phones open their own date picker when the field is tapped, so the icon can make way for the full date.
const rowDate = 'h-9 px-2 max-sm:px-1.5 max-sm:text-[13px] max-sm:[&::-webkit-calendar-picker-indicator]:hidden'
const selectClass = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm'

export function DepartureDatesEditor({
  ranges,
  tripLength,
  onChange,
}: {
  ranges: DepartureRange[]
  tripLength: number
  onChange: (ranges: DepartureRange[]) => void
}) {
  const [start, setStart] = useState('')
  const [daysOverride, setDaysOverride] = useState('')
  const [repeat, setRepeat] = useState<DepartureRepeat>('once')
  const [until, setUntil] = useState('')
  const [message, setMessage] = useState('')
  const [showPast, setShowPast] = useState(false)
  const [notesOpen, setNotesOpen] = useState<Set<number>>(new Set())
  // Worked out only when the list is sorted, so a row can't jump away mid-edit.
  const [pastCount, setPastCount] = useState(() => countPast(ranges))
  const startRef = useRef<HTMLInputElement>(null)

  const days = daysOverride === '' ? tripLength : Number(daysOverride)
  const planned = buildDepartures({ start, days, repeat, until })
  const existing = new Set(ranges.map((range) => range.start_date))
  const fresh = planned.filter((item) => !existing.has(item.start_date))
  const upcoming = ranges.length - pastCount
  const mismatched = tripLength > 0
    ? ranges.flatMap((range, index) => (index >= pastCount && tripDays(range.start_date, range.end_date) !== tripLength ? [index] : []))
    : []

  const commit = (list: DepartureRange[]) => {
    const sorted = [...list].sort(byStart)
    onChange(sorted)
    setPastCount(countPast(sorted))
    setNotesOpen(new Set())
  }

  const updateRow = (index: number, patch: Partial<DepartureRange>) =>
    onChange(ranges.map((range, i) => (i === index ? { ...range, ...patch } : range)))

  const changeStart = (index: number, value: string) => {
    const range = ranges[index]
    const length = tripDays(range.start_date, range.end_date) || tripLength
    updateRow(index, { start_date: value, end_date: parseCalendarDate(value) && length > 0 ? addCalendarDays(value, length - 1) : range.end_date })
  }

  const add = () => {
    if (fresh.length === 0) return
    commit([...ranges, ...fresh.map((item) => ({ ...item, status: 'available' as const, note: '' }))])
    const skipped = planned.length - fresh.length
    setMessage(`Added ${fresh.length} ${fresh.length === 1 ? 'departure' : 'departures'}${skipped ? `. ${skipped} already existed` : ''}. Remember to save the trek.`)
    setStart('')
    setUntil('')
    startRef.current?.focus()
  }

  const matchAll = () =>
    commit(ranges.map((range, index) => (mismatched.includes(index) ? { ...range, end_date: addCalendarDays(range.start_date, tripLength - 1) } : range)))

  let preview = ''
  if (start && planned.length === 1) preview = `Returns ${longDate(planned[0].end_date)}.`
  else if (planned.length > 1) preview = `${planned.length} departures, ${longDate(planned[0].start_date)} to ${longDate(planned[planned.length - 1].start_date)}.`
  if (preview && fresh.length < planned.length) {
    preview += fresh.length === 0 ? ' Already added.' : ` ${planned.length - fresh.length} already added and will be skipped.`
  }

  const renderRow = (range: DepartureRange, index: number) => {
    const length = tripDays(range.start_date, range.end_date)
    const offLength = tripLength > 0 && length !== tripLength
    const showNote = notesOpen.has(index) || Boolean(range.note)
    return (
      <li
        key={index}
        className="rounded-md border border-border bg-background p-2"
        onBlur={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
          if (ranges.some((item, i) => i > 0 && byStart(ranges[i - 1], item) > 0)) commit(ranges)
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:w-auto sm:grid-cols-[9.5rem_auto_9.5rem]">
            <Input type="date" aria-label={`Departure ${index + 1} start date`} value={range.start_date} onChange={(event) => changeStart(index, event.target.value)} className={rowDate} />
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <Input type="date" aria-label={`Departure ${index + 1} return date`} value={range.end_date} min={range.start_date} onChange={(event) => updateRow(index, { end_date: event.target.value })} className={rowDate} />
          </div>

          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium tabular-nums', offLength ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200' : 'text-muted-foreground')}>
            {length > 0 ? `${length} ${length === 1 ? 'day' : 'days'}` : 'Check dates'}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <div role="group" aria-label={`Departure ${index + 1} status`} className="flex overflow-hidden rounded-md border border-border">
              {STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  aria-pressed={range.status === status.value}
                  onClick={() => updateRow(index, { status: status.value })}
                  className={cn('px-2.5 py-1.5 text-xs font-medium transition-colors', range.status === status.value ? status.selected : 'text-muted-foreground hover:bg-muted')}
                >
                  {status.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label={`${showNote ? 'Note for' : 'Add a note to'} departure ${index + 1}`}
              title="Note for this departure"
              onClick={() => setNotesOpen((current) => new Set(current).add(index))}
              className={cn('inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted', range.note ? 'text-primary' : 'text-muted-foreground')}
            >
              <StickyNote className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Remove departure ${index + 1}`}
              title="Remove"
              onClick={() => commit(ranges.filter((_, i) => i !== index))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {showNote ? (
          <Input
            aria-label={`Departure ${index + 1} note`}
            value={range.note}
            onChange={(event) => updateRow(index, { note: event.target.value })}
            placeholder="Shown on the public calendar, e.g. Led by Gele"
            className="mt-2 h-9"
          />
        ) : null}
      </li>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Departure dates</h3>
          <p className="text-xs text-muted-foreground">Pick a start date and the return date fills in from the trek length. Dates appear on the public calendar after you save.</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          {upcoming} upcoming{pastCount ? ` · ${pastCount} past` : ''}
        </p>
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <div className={cn('grid grid-cols-[5rem_minmax(0,1fr)] gap-3', repeat === 'once' ? 'md:grid-cols-[1.4fr_0.6fr_1.2fr_auto]' : 'md:grid-cols-[1.4fr_0.6fr_1.2fr_1.4fr_auto]')}>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="departure-start" className={quickLabel}>Start date</label>
            <Input
              ref={startRef}
              id="departure-start"
              type="date"
              min={today()}
              value={start}
              onChange={(event) => { setStart(event.target.value); setMessage('') }}
              onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add() } }}
            />
          </div>
          <div>
            <label htmlFor="departure-days" className={quickLabel}>Days</label>
            <Input id="departure-days" type="number" min={1} max={60} value={daysOverride === '' ? tripLength || '' : daysOverride} onChange={(event) => setDaysOverride(event.target.value)} />
          </div>
          <div>
            <label htmlFor="departure-repeat" className={quickLabel}>Repeat</label>
            <select id="departure-repeat" value={repeat} onChange={(event) => setRepeat(event.target.value as DepartureRepeat)} className={selectClass}>
              {REPEATS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          {repeat !== 'once' ? (
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="departure-until" className={quickLabel}>Repeat until</label>
              <Input id="departure-until" type="date" min={start || today()} value={until} onChange={(event) => setUntil(event.target.value)} />
            </div>
          ) : null}
          <div className="col-span-2 flex items-end md:col-span-1">
            <Button type="button" onClick={add} disabled={fresh.length === 0} className="h-10 w-full">
              <CalendarPlus className="mr-1.5 h-4 w-4" />
              {fresh.length > 1 ? `Add ${fresh.length} dates` : 'Add date'}
            </Button>
          </div>
        </div>
        <p className="mt-2 min-h-4 text-xs text-muted-foreground" role="status">{message || preview}</p>
      </div>

      {mismatched.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <span>{mismatched.length} upcoming {mismatched.length === 1 ? 'departure doesn’t' : 'departures don’t'} match the {tripLength}-day trek length.</span>
          <button type="button" onClick={matchAll} className="font-semibold underline underline-offset-2">Match return dates to {tripLength} days</button>
        </div>
      ) : null}

      {ranges.length === 0 ? (
        <p className="py-2 text-center text-sm text-muted-foreground">No departures yet. Pick a start date above to add the first one.</p>
      ) : (
        <div className="space-y-2">
          {pastCount > 0 ? (
            <button type="button" onClick={() => setShowPast((value) => !value)} aria-expanded={showPast} className="text-xs font-medium text-primary hover:underline">
              {showPast ? 'Hide' : 'Show'} {pastCount} past {pastCount === 1 ? 'departure' : 'departures'}
            </button>
          ) : null}
          <ol className={cn('space-y-1.5', ranges.length > 8 && 'max-h-[30rem] overflow-y-auto pr-1')}>
            {ranges.map((range, index) => (index >= pastCount || showPast ? renderRow(range, index) : null))}
          </ol>
        </div>
      )}
    </div>
  )
}
