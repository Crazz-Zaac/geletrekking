'use client'

import { useId, useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TrekAvailabilityRange } from '@/lib/data'
import {
  formatCalendarDate,
  formatCalendarRange,
  getDepartureRanges,
  getDepartureStatus,
  getMonthDays,
  type DepartureRange,
  type DepartureStatus,
} from '@/lib/trek-availability'
import styles from './trek-availability-calendar.module.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const STATUS_LABELS: Record<DepartureStatus, string> = { available: 'Open', limited: 'Few left', booked: 'Full' }

/** Months since year 0, so stepping across a new year is plain arithmetic. */
const monthKey = (date: string) => Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1

function monthsCovered(ranges: DepartureRange[]) {
  const months = new Set<number>()
  ranges.forEach((range) => {
    for (let key = monthKey(range.startDate); key <= monthKey(range.endDate); key += 1) months.add(key)
  })
  return [...months].sort((a, b) => a - b)
}

const openMonths = (departures: DepartureRange[]) => monthsCovered(departures.filter((range) => range.status !== 'booked'))

/** The month to open on: the next one with places, or else this month. */
function firstUsefulMonth(departures: DepartureRange[], thisMonth: number) {
  return openMonths(departures).find((key) => key >= thisMonth) ?? thisMonth
}

function nextOpenMonth(departures: DepartureRange[], after: number) {
  return openMonths(departures).find((key) => key > after)
}

export function TrekAvailabilityCalendar({ ranges, onSelectDeparture }: { ranges: TrekAvailabilityRange[]; onSelectDeparture?: (departure: { startDate: string; endDate: string }) => void }) {
  const id = useId()
  const departures = useMemo(() => getDepartureRanges(ranges), [ranges])
  const [chosenMonth, setChosenMonth] = useState<number | null>(null)
  const now = new Date()
  const firstMonth = useMemo(() => firstUsefulMonth(departures, now.getUTCFullYear() * 12 + now.getUTCMonth()), [departures]) // eslint-disable-line react-hooks/exhaustive-deps
  const shownMonth = chosenMonth ?? firstMonth
  const year = Math.floor(shownMonth / 12)
  const activeMonth = shownMonth % 12
  const nextOpen = nextOpenMonth(departures, shownMonth)

  const [onlyTrips, setOnlyTrips] = useState(false)
  const today = now.toISOString().slice(0, 10)
  const thisMonth = now.getUTCFullYear() * 12 + now.getUTCMonth()
  const thisYear = Math.floor(thisMonth / 12)
  // Every upcoming month with a departure, including full ones: they still have trips.
  const tripMonths = useMemo(() => monthsCovered(departures).filter((key) => key >= thisMonth), [departures, thisMonth])
  const lastYear = Math.max(thisYear + 2, tripMonths.length ? Math.floor(tripMonths[tripMonths.length - 1] / 12) : thisYear)

  const allYears = Array.from({ length: lastYear - thisYear + 1 }, (_, index) => thisYear + index)
  const yearOptions = onlyTrips ? [...new Set(tripMonths.map((key) => Math.floor(key / 12)))] : allYears
  const monthOptions = onlyTrips
    ? tripMonths.filter((key) => Math.floor(key / 12) === year).map((key) => key % 12)
    : MONTHS.map((_, index) => index)

  const previous = onlyTrips ? [...tripMonths].reverse().find((key) => key < shownMonth) : shownMonth > thisMonth ? shownMonth - 1 : undefined
  const next = onlyTrips ? tripMonths.find((key) => key > shownMonth) : shownMonth < lastYear * 12 + 11 ? shownMonth + 1 : undefined

  const changeYear = (nextYear: number) => {
    const sameMonth = nextYear * 12 + activeMonth
    if (onlyTrips) {
      setChosenMonth(tripMonths.includes(sameMonth) ? sameMonth : tripMonths.find((key) => Math.floor(key / 12) === nextYear) ?? shownMonth)
    } else {
      setChosenMonth(Math.max(sameMonth, thisMonth))
    }
  }

  const toggleOnlyTrips = (checked: boolean) => {
    setOnlyTrips(checked)
    if (checked && tripMonths.length && !tripMonths.includes(shownMonth)) {
      setChosenMonth(tripMonths.find((key) => key >= shownMonth) ?? tripMonths[tripMonths.length - 1])
    }
  }

  return (
    <section id="trek-availability" aria-labelledby={`${id}-title`} className={styles.calendar}>
      <h2 id={`${id}-title`} className={styles.eyebrow}>Departure availability</h2>
      <div className={styles.yearNavigation}>
        <button type="button" aria-label="Previous month" disabled={previous === undefined} onClick={() => previous !== undefined && setChosenMonth(previous)} className={styles.yearButton}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <select aria-label="Month" value={activeMonth} onChange={(event) => setChosenMonth(year * 12 + Number(event.target.value))} className={`${styles.select} ${styles.monthSelect}`}>
          {monthOptions.map((index) => (
            <option key={index} value={index} disabled={year * 12 + index < thisMonth}>{MONTHS[index]}</option>
          ))}
        </select>
        <select aria-label="Year" value={year} onChange={(event) => changeYear(Number(event.target.value))} className={styles.select}>
          {yearOptions.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <button type="button" aria-label="Next month" disabled={next === undefined} onClick={() => next !== undefined && setChosenMonth(next)} className={styles.yearButton}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <label className={styles.tripFilter}>
        <input type="checkbox" checked={onlyTrips} disabled={tripMonths.length === 0} onChange={(event) => toggleOnlyTrips(event.target.checked)} />
        Only show months with trips
      </label>
      <div className={styles.monthGrid}>
        {MONTHS.map((month, monthIndex) => {
          const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
          const trips = departures.filter((range) => range.startDate.slice(0, 7) <= prefix && range.endDate.slice(0, 7) >= prefix)
          const status = getDepartureStatus(trips)
          const label = status ? STATUS_LABELS[status] : 'No trips'
          const days = getMonthDays(year, monthIndex, 1)
          const lastDay = days.reduce((last, day, index) => day ? index + 1 : last, 0)
          const visibleDays = days.slice(0, Math.ceil(lastDay / 7) * 7)
          return (
            <div
              role="group"
              key={month}
              data-month={monthIndex + 1}
              aria-label={`${month} ${year}: ${label}`}
              className={styles.month}
              hidden={monthIndex !== activeMonth}
            >
              <span className={styles.monthHeading}>
                <span className={styles.monthName}>{month.slice(0, 3)}</span>
                <span className={`${styles.status} ${status ? styles[status] : styles.noTrips}`}>{label}</span>
              </span>
              <span className={styles.weekdays} aria-hidden="true">
                {WEEKDAYS.map((day) => <span key={day} title={day}>{day.slice(0, 1)}</span>)}
              </span>
              <span className={styles.days}>
                {visibleDays.map((date, index) => {
                  if (!date) return <span key={`empty-${index}`} className={styles.dayCell} />
                  const coveringRanges = trips.filter((range) => range.startDate <= date && date <= range.endDate)
                  const dateStatus = getDepartureStatus(coveringRanges)
                  const description = coveringRanges.map((range) => `${formatCalendarRange(range)}: ${STATUS_LABELS[range.status]}${range.note ? ` — ${range.note}` : ''}`).join('; ')
                  // Any day of a trip selects that trip, which starts on its first day.
                  const bookable = onSelectDeparture
                    ? coveringRanges.filter((range) => (range.status === 'available' || range.status === 'limited') && range.startDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
                    : undefined
                  if (bookable) {
                    return (
                      <span key={date} className={styles.dayCell}>
                        <button
                          type="button"
                          data-available-date={date}
                          data-status={dateStatus}
                          aria-label={`Inquire about the departure ${formatCalendarRange(bookable)}, ${STATUS_LABELS[bookable.status]}`}
                          title={`${formatCalendarDate(date)} — ${description}`}
                          onClick={() => onSelectDeparture?.({ startDate: bookable.startDate, endDate: bookable.endDate })}
                          className={`${styles.day} ${styles.dayButton} ${styles.departureDay} ${styles[`${dateStatus}Day`]}`}
                        >
                          <span aria-hidden="true">{Number(date.slice(-2))}</span>
                          <Check className={styles.tick} strokeWidth={3} aria-hidden="true" />
                        </button>
                      </span>
                    )
                  }
                  return (
                    <span key={date} className={styles.dayCell}>
                      <span
                        role="img"
                        aria-label={`${formatCalendarDate(date)}: ${dateStatus ? STATUS_LABELS[dateStatus] : 'No availability'}`}
                        data-available-date={dateStatus === 'available' || dateStatus === 'limited' ? date : undefined}
                        data-status={dateStatus}
                        title={`${formatCalendarDate(date)}${description ? ` — ${description}` : ': no availability'}`}
                        className={`${styles.day} ${dateStatus ? `${styles.departureDay} ${styles[`${dateStatus}Day`]}` : ''}`}
                      >
                        <span aria-hidden="true">{Number(date.slice(-2))}</span>
                        {(dateStatus === 'available' || dateStatus === 'limited') && <Check className={styles.tick} strokeWidth={3} aria-hidden="true" />}
                      </span>
                    </span>
                  )
                })}
              </span>
            </div>
          )
        })}
      </div>
      {nextOpen !== undefined && !getDepartureStatus(departures.filter((range) => monthKey(range.startDate) <= shownMonth && monthKey(range.endDate) >= shownMonth)) && (
        <p className={styles.nextOpen}>
          No departures this month.{' '}
          <button type="button" className={styles.nextOpenButton} onClick={() => setChosenMonth(nextOpen)}>
            Next: {MONTHS[nextOpen % 12]} {Math.floor(nextOpen / 12)}
          </button>
        </p>
      )}
      <p className={styles.legend}>
        <span className={styles.available}>✓ Available</span> ·{' '}
        <span className={styles.limited}>✓ Few left</span> · <span className={styles.booked}>Grey: full</span>.
        {' '}{onSelectDeparture ? 'Ticks cover each full trip. Select one to inquire.' : 'Ticks include the start and end dates of each trip.'}
      </p>
      {!departures.length && <p className={styles.empty}>Departure dates haven’t been published yet. <a href="/contact">Contact us to arrange your dates.</a></p>}
    </section>
  )
}
