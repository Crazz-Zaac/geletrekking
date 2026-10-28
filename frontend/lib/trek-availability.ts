import type { TrekAvailabilityRange } from '@/lib/data'

export interface CalendarAvailabilityRange extends TrekAvailabilityRange {
  startDate: string
  endDate: string
}

export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null
}

export function getCalendarRanges(ranges: TrekAvailabilityRange[]): CalendarAvailabilityRange[] {
  return ranges
    .filter((range) =>
      (range.status === undefined || range.status === 'available') &&
      parseCalendarDate(range.startDate) && parseCalendarDate(range.endDate) &&
      range.startDate <= range.endDate
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate))
}

export function getAvailabilityYears(ranges: CalendarAvailabilityRange[]): number[] {
  const years = new Set<number>()
  for (const range of ranges) {
    for (let year = Number(range.startDate.slice(0, 4)); year <= Number(range.endDate.slice(0, 4)); year++) {
      years.add(year)
    }
  }
  return [...years].sort((a, b) => a - b)
}

export function getMonthDays(year: number, month: number, weekStartsOn: 0 | 1 = 0): (string | null)[] {
  const firstDay = (new Date(Date.UTC(year, month, 1)).getUTCDay() - weekStartsOn + 7) % 7
  const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay + 1
    return day > 0 && day <= dayCount
      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : null
  })
}

export function getRangesForDate(date: string, ranges: CalendarAvailabilityRange[]): CalendarAvailabilityRange[] {
  return ranges.filter((range) => range.startDate <= date && date <= range.endDate)
}

export type DepartureStatus = 'available' | 'limited' | 'booked'
export type DepartureRange = CalendarAvailabilityRange & { status: DepartureStatus }

export function getDepartureRanges(ranges: TrekAvailabilityRange[]): DepartureRange[] {
  return ranges
    .filter((range) => parseCalendarDate(range.startDate) && parseCalendarDate(range.endDate) && range.startDate <= range.endDate)
    .filter((range) => range.status === undefined || ['available', 'limited', 'booked'].includes(range.status))
    .map((range) => ({ ...range, status: range.status || 'available' } as DepartureRange))
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate))
}

export function getMonthDepartures(ranges: DepartureRange[], year: number, month: number): DepartureRange[] {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
  return ranges.filter((range) => range.startDate.startsWith(prefix))
}

export function getDepartureStatus(ranges: DepartureRange[]): DepartureStatus | undefined {
  if (ranges.some((range) => range.status === 'available')) return 'available'
  if (ranges.some((range) => range.status === 'limited')) return 'limited'
  return ranges.length ? 'booked' : undefined
}

export function formatCalendarDate(value: string): string {
  const date = parseCalendarDate(value)
  return date ? new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(date) : value
}

export function formatCalendarRange(range: CalendarAvailabilityRange): string {
  return `${formatCalendarDate(range.startDate)} – ${formatCalendarDate(range.endDate)}`
}
