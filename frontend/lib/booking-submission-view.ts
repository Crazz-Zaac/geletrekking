import {
  defaultBookingFormConfig,
  normalizeBookingFormConfig,
  preBookingFormConfig,
  type BookingFormConfig,
} from '@/lib/booking-form-config'

export type SubmissionSection = { title: string; rows: Array<{ label: string; value: string }> }

const humanize = (key: string) =>
  key
    .replace(/^custom_/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase())

const asText = (value: unknown) => (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value ?? '').trim())

export const isPreBooking = (formData: Record<string, unknown> | undefined) => formData?.submissionSource === 'Pre-booking Form'

/**
 * Answers grouped and labelled as the guest saw them. Uses the form that
 * guest was actually sent when it's known. Answers left blank are dropped, but
 * ticks always show so a "No" is visible.
 */
export function buildSubmissionSections(formData: Record<string, unknown> | undefined, linkConfig?: BookingFormConfig): SubmissionSection[] {
  const data = formData || {}
  const preBooking = isPreBooking(data)
  const config = preBooking ? preBookingFormConfig : linkConfig ? normalizeBookingFormConfig(linkConfig) : defaultBookingFormConfig
  const shown = new Set<string>(['submissionSource'])
  // The server fills these in from "Full name" and friends on pre-bookings.
  if (preBooking) ['firstName', 'lastName', 'mobileWhatsapp', 'trekPackage'].forEach((key) => shown.add(key))

  const sections: SubmissionSection[] = config.map((section) => ({
    title: section.title,
    rows: section.fields.flatMap((field) => {
      shown.add(field.id)
      // A tick box missing from older answers was never asked, so it isn't a "No".
      if (field.type === 'checkbox' && !(field.id in data)) return []
      const value = asText(field.type === 'checkbox' ? data[field.id] === true : data[field.id])
      return value ? [{ label: field.label, value }] : []
    }),
  }))

  const others = Object.entries(data)
    .filter(([key]) => !shown.has(key))
    .flatMap(([key, value]) => (asText(value) ? [{ label: humanize(key), value: asText(value) }] : []))
  if (others.length > 0) sections.push({ title: 'Other answers', rows: others })

  return sections.filter((section) => section.rows.length > 0)
}

/** Digits for a wa.me link, or null if this can't be a WhatsApp number. */
export function whatsappDigits(phone?: string) {
  const digits = (phone || '').replace(/\D/g, '')
  return digits.length >= 7 ? digits : null
}

export function formatBookingDate(date?: string | null) {
  if (!date) return ''
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export type LinkState = 'active' | 'submitted' | 'expired' | 'off'

export function linkState(link: { isActive: boolean; submittedAt?: string; expiresAt: string }, now = Date.now()): LinkState {
  if (link.submittedAt) return 'submitted'
  if (!link.isActive) return 'off'
  return new Date(link.expiresAt).getTime() > now ? 'active' : 'expired'
}
