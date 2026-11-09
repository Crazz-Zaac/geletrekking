import type { BookingFormFieldConfig, BookingFormState } from '@/lib/booking-form-config'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\d\s.-]{7,24}$/
/** Consent the backend and terms depend on, even if an admin unticks "required". */
const ALWAYS_REQUIRED = new Set(['agreeTerms', 'acceptLiabilityWaiver'])

const AUTOCOMPLETE: Record<string, string> = {
  firstName: 'given-name',
  lastName: 'family-name',
  fullName: 'name',
  email: 'email',
  mobileWhatsapp: 'tel',
  phoneNumber: 'tel',
  dateOfBirth: 'bday',
  countryOfResidence: 'country-name',
}

/** Browser autofill for the guest's own details only; passport, medical and contact-person fields stay off. */
export const autocompleteFor = (fieldId: string) => AUTOCOMPLETE[fieldId] || 'off'

export const isNameField = (fieldId: string) => ['firstName', 'lastName', 'fullName', 'signatureName', 'emergencyContactName'].includes(fieldId)

const todayIso = () => new Date().toISOString().slice(0, 10)
const text = (form: BookingFormState, id: string) => String(form[id] ?? '').trim()

export const isFieldRequired = (field: BookingFormFieldConfig) => Boolean(field.required) || ALWAYS_REQUIRED.has(field.id)

/** Why this answer can't be accepted, or null if it's fine. */
export function getFieldProblem(field: BookingFormFieldConfig, form: BookingFormState, today = todayIso()): string | null {
  const raw = form[field.id]
  if (field.type === 'checkbox') return isFieldRequired(field) && raw !== true ? 'Please tick this to continue.' : null

  const value = String(raw ?? '').trim()
  if (!value) return isFieldRequired(field) ? 'This is required.' : null

  if (field.type === 'email' && !EMAIL_RE.test(value)) return 'Enter a valid email address, like name@example.com.'
  if (field.type === 'tel' && (!PHONE_RE.test(value) || value.replace(/\D/g, '').length < 7)) return 'Enter a phone number with its country code, like +44 7700 900123.'

  if (field.id === 'dateOfBirth' && value >= today) return 'Your date of birth must be in the past.'
  if (field.id === 'passportExpiryDate' && value < today) return 'This passport has expired.'
  if (field.id === 'trekEndDate' && text(form, 'trekStartDate') && value < text(form, 'trekStartDate')) return "The trek can't end before it starts."
  if (field.id === 'departureDate' && text(form, 'arrivalDate') && value < text(form, 'arrivalDate')) return "You can't leave before you arrive."
  return null
}

const addMonths = (date: string, months: number) => {
  const next = new Date(`${date}T00:00:00Z`)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next.toISOString().slice(0, 10)
}

/** Something worth checking that doesn't stop the guest from continuing. */
export function getFieldNotice(field: BookingFormFieldConfig, form: BookingFormState, today = todayIso()): string | null {
  const value = text(form, field.id)
  if (!value) return null
  if (field.id === 'trekStartDate' && value < today) return 'This date is in the past. Please check it.'
  if (field.id === 'passportExpiryDate' && value >= today) {
    const arrival = text(form, 'arrivalDate') || text(form, 'trekStartDate') || today
    if (value < addMonths(arrival, 6)) return 'Nepal usually requires a passport valid for at least 6 months after you arrive. Please check yours.'
  }
  return null
}

/** Sensible limits for the browser's date picker. */
export function getDateLimits(fieldId: string, form: BookingFormState, today = todayIso()): { min?: string; max?: string } {
  if (fieldId === 'dateOfBirth') return { max: today }
  if (fieldId === 'passportExpiryDate') return { min: today }
  if (fieldId === 'trekEndDate') return { min: text(form, 'trekStartDate') || undefined }
  if (fieldId === 'departureDate') return { min: text(form, 'arrivalDate') || undefined }
  return {}
}

const DRAFT_PREFIX = 'gele-booking-draft:'

/** A guest's unfinished answers, for this browser tab only. Ticks and signatures are never kept. */
export function readBookingDraft(key: string): BookingFormState | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_PREFIX + key)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0 ? parsed : null
  } catch {
    return null
  }
}

export function saveBookingDraft(key: string, form: BookingFormState) {
  try {
    const kept = Object.fromEntries(Object.entries(form).filter(([id, value]) => typeof value === 'string' && value !== '' && !id.startsWith('signature')))
    sessionStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(kept))
  } catch {
    // Private windows can refuse storage; the form still works.
  }
}

export function clearBookingDraft(key: string) {
  try {
    sessionStorage.removeItem(DRAFT_PREFIX + key)
  } catch {
    // Nothing to clear.
  }
}
