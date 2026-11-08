import type { ItineraryDay } from '@/lib/data'

export type TravelMode = 'hike' | 'drive' | 'flight'
export type DayFact = { kind: 'time' | 'ascent' | 'descent' | 'included' | 'stay'; label: string; value: string }

export type ItineraryRow = {
  day: number
  place: string
  /** "Phakding → Namche", or just the place when the trek doesn't move on. */
  route: string
  altitude?: number
  distance: { label: string; mode?: TravelMode } | null
  /** Short walking time for the summary row, e.g. "6–7 hrs". */
  walkingHours?: string
  isAcclimatisation: boolean
  facts: DayFact[]
  /** The description without the bullets that were moved into `facts`. */
  body: string
}

/** Same-place second nights only count as acclimatisation at altitude. */
const ACCLIMATISATION_MIN_ALTITUDE = 3000

const MODE_WORDS: Array<[RegExp, TravelMode, string]> = [
  [/flight|fly/i, 'flight', 'Flight'],
  [/drive|jeep|bus/i, 'drive', 'Drive'],
  [/hike|trek|walk/i, 'hike', 'Hike'],
]

function modeOf(word: string) {
  return MODE_WORDS.find(([pattern]) => pattern.test(word))
}

/** Compares place names despite spelling drift: "Lo-Manthang"/"Lo Manthang", "Machermo"/"Machhermo". */
export function samePlace(a: string, b: string) {
  const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(.)\1+/g, '$1')
  return key(a) === key(b)
}

/**
 * Turns admin text like "✈️ Flight + 🥾 Hike - 143 km Flight &  6.4 km Hike km"
 * into "Flight 143 km · Hike 6.4 km".
 */
export function parseDistance(raw?: string): ItineraryRow['distance'] {
  const text = (raw || '').replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return null

  const pairs = [...text.matchAll(/(\d+(?:\.\d+)?)\s*km\s*(flight|drive|hike|trek|walk)/gi)]
  if (pairs.length > 0) {
    const label = pairs.map((match) => `${modeOf(match[2])?.[2]} ${match[1]} km`).join(' · ')
    return { label, mode: modeOf(pairs[pairs.length - 1][2])?.[1] }
  }

  const amount = text.match(/\d+(?:\.\d+)?(?:\s*\+\s*\d+(?:\.\d+)?)*/)?.[0].replace(/\s/g, '')
  if (!amount) return null
  const lead = text.split(/\s-\s/)[0]
  const modes = lead
    .split('+')
    .map((part) => modeOf(part))
    .filter((mode): mode is NonNullable<typeof mode> => Boolean(mode))
  if (modes.length === 0) return { label: `${amount} km` }
  return { label: `${modes.map((mode) => mode[2]).join(' + ')} ${amount} km`, mode: modes[modes.length - 1][1] }
}

function tidyLine(line: string) {
  let value = line.trim().replace(/[.,;]+$/, '')
  if ((value.match(/\)/g) || []).length > (value.match(/\(/g) || []).length) value = value.replace(/\)\s*$/, '')
  return value.replace(/\s+/g, ' ')
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function elevationValue(line: string) {
  if (/same\s+elevation/i.test(line)) return 'Same elevation'
  const match = line.match(/([\d,]+)\s*(?:m|meters?|metres?)\b(?:\s*\(\s*([\d,]+)\s*(?:ft|feet)\s*\))?/i)
  if (!match) return tidyLine(line.replace(/^[^:]*:\s*/, ''))
  return match[2] ? `${match[1]} m (${match[2]} ft)` : `${match[1]} m`
}

/** Moves the recognised bullets out of a day's description; anything else stays in the text. */
export function extractDayFacts(description: string) {
  const facts: DayFact[] = []
  const times: string[] = []
  const kept: string[] = []
  let walkingHours: string | undefined

  for (const rawLine of description.split('\n')) {
    const bullet = rawLine.match(/^\s*[•*-]\s*(.+)$/)
    if (!bullet) {
      if (rawLine.trim()) kept.push(rawLine.trim())
      continue
    }
    const line = bullet[1].replace(/^•\s*/, '').trim()

    if (/^(trek|hike|walk|drive|flight|travel|acclimati[sz]ation)\b.*\b(hours?|hrs?|minutes?|mins?)\b/i.test(line)) {
      const value = tidyLine(line)
      times.push(value)
      const hours = value.match(/^(?:trek|hike|walk)(?:\s+for|\s*:)?\s*(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*hours?$/i)
      if (hours && !walkingHours) walkingHours = `${hours[1]}–${hours[2]} hrs`
    } else if (/^ascent\b/i.test(line) || /^the same elevation/i.test(line)) {
      facts.push({ kind: 'ascent', label: 'Ascent', value: elevationValue(line) })
    } else if (/^descent\b/i.test(line)) {
      facts.push({ kind: 'descent', label: 'Descent', value: elevationValue(line) })
    } else if (/^includes?\b/i.test(line)) {
      facts.push({ kind: 'included', label: 'Included', value: capitalise(tidyLine(line.replace(/^includes?\s+(the\s+)?/i, ''))) })
    } else {
      kept.push(`• ${line}`)
    }
  }

  if (times.length > 0) facts.unshift({ kind: 'time', label: 'Time', value: times.join(' · ') })
  return { facts, walkingHours, body: kept.join('\n') }
}

export function buildItineraryRows(days: ItineraryDay[]): ItineraryRow[] {
  return days.map((day, index) => {
    const previous = days[index - 1]
    const place = day.title.trim()
    const stayedPut = Boolean(previous) && samePlace(previous.title, place)
    const hasOwnRoute = /\s(to|-|–)\s|→|->/i.test(place)
    const { facts, walkingHours, body } = extractDayFacts(day.description || '')
    const stay = (day.accommodation || '').trim()
    return {
      day: day.day,
      place,
      route: previous && !stayedPut && !hasOwnRoute ? `${previous.title.trim()} → ${place}` : place,
      altitude: day.altitude,
      distance: parseDistance(day.distance),
      walkingHours,
      isAcclimatisation:
        stayedPut && day.altitude !== undefined && day.altitude === previous.altitude && day.altitude >= ACCLIMATISATION_MIN_ALTITUDE,
      facts: stay ? [...facts, { kind: 'stay', label: 'Overnight', value: stay }] : facts,
      body,
    }
  })
}

const NUMBER = String.raw`\d{1,3}(?:,\d{3})+|\d+`
const UNIT = String.raw`\s*(?:m\b|met(?:er|re)s?\b)`
const HIGHEST_POINT_ON_EARTH = 8849

/** Where the overnight figure sits in admin text. A leading comma means "no overnight figure, only a note". */
function locateAltitude(text: string) {
  if (/^\s*,/.test(text)) return null
  const match =
    text.match(new RegExp(`overnight\\D*?(${NUMBER})(?:${UNIT})?`, 'i')) ??
    text.match(new RegExp(`(${NUMBER})${UNIT}`, 'i')) ??
    (/\b(?:ft|feet)\b/i.test(text) ? null : text.match(new RegExp(`(${NUMBER})`)))
  if (!match || match.index === undefined) return null
  return {
    metres: Number(match[1].replace(/,/g, '')),
    start: match.index,
    end: match.index + match[0].length,
  }
}

/**
 * Reads the overnight altitude from what admins type, e.g. "Elevation: 1,860
 * meters (6,102 feet)" or "Elevation overnight 4,810 meters, Summit 6,189
 * meters". Prefers a figure labelled overnight, then the first in metres.
 */
export function parseAltitude(value?: string | number | null): number | undefined {
  const found = locateAltitude(String(value ?? ''))
  return found && found.metres > 0 && found.metres <= HIGHEST_POINT_ON_EARTH ? found.metres : undefined
}

export const isImpossibleAltitude = (metres: string) => Number(metres) > HIGHEST_POINT_ON_EARTH

/** Splits stored altitude text into the overnight figure and anything else noted, for the admin form. */
export function splitAltitude(value?: string | null): { metres: string; note: string } {
  const text = value ?? ''
  const found = locateAltitude(text)
  if (!found) return { metres: '', note: text.replace(/^[\s,;:-]+/, '') }
  const before = text
    .slice(0, found.start)
    .replace(/\b(?:elevation|altitude|overnight)\b|:/gi, '')
    .replace(/^[\s,;-]+|[\s,;-]+$/g, '')
  const after = text.slice(found.end).replace(/^[\s,;:-]+/, '')
  // Stray letters before the number ("s 3000 meters") are typing slips, not notes.
  const kept = /\d/.test(before) ? before : ''
  return { metres: String(found.metres), note: [kept, after].filter(Boolean).join(', ') }
}

export function joinAltitude(metres: string, note: string): string {
  if (!metres) return note ? `, ${note}` : ''
  return note ? `${metres} meters, ${note}` : `${metres} meters`
}
