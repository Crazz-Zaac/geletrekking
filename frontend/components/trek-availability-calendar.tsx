'use client'

import { useId, useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TrekAvailabilityRange } from '@/lib/data'
import {
  formatCalendarDate,
  formatCalendarRange,
  getAvailabilityYears,
  getDepartureRanges,
  getDepartureStatus,
  getMonthDays,
  type DepartureStatus,
} from '@/lib/trek-availability'
import styles from './trek-availability-calendar.module.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const STATUS_LABELS: Record<DepartureStatus, string> = { available: 'Open', limited: 'Few left', booked: 'Full' }

export function TrekAvailabilityCalendar({ ranges }: { ranges: TrekAvailabilityRange[] }) {
  const id = useId()
  const departures = useMemo(() => getDepartureRanges(ranges), [ranges])
  const years = useMemo(() => getAvailabilityYears(departures), [departures])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const currentYear = new Date().getUTCFullYear()
  const year = selectedYear ?? years.find((value) => value >= currentYear) ?? years.at(-1) ?? currentYear
  const changeYear = (nextYear: number) => setSelectedYear(nextYear)

  return (
    <section id="trek-availability" aria-labelledby={`${id}-title`} className={styles.calendar}>
      <h2 id={`${id}-title`} className={styles.eyebrow}>Departure availability</h2>
      <p className={styles.subtitle}>Tick marks show available dates throughout each trip.</p>
      <div className={styles.yearNavigation}>
        <button type="button" aria-label="Previous year" disabled={year <= 100} onClick={() => changeYear(year - 1)} className={styles.yearButton}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className={styles.year} aria-live="polite">{year}</span>
        <button type="button" aria-label="Next year" disabled={year >= 9999} onClick={() => changeYear(year + 1)} className={styles.yearButton}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
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
      <p className={styles.legend}>
        <span className={styles.available}>✓ Available</span> ·{' '}
        <span className={styles.limited}>✓ Few left</span> · <span className={styles.booked}>Grey: full</span>.
        {' '}Ticks include the start and end dates of each trip.
      </p>
      {!departures.length && <p className={styles.empty}>Departure dates haven’t been published yet. <a href="/contact">Contact us to arrange your dates.</a></p>}
    </section>
  )
}
