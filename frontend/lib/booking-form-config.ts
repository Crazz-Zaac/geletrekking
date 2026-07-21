import type { Trek } from '@/lib/data'

export type BookingFieldType = 'text' | 'email' | 'tel' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox'

export type BookingFieldCondition = 'sharedAccommodation' | 'altitudeCoverage'

export type BookingFormFieldConfig = {
  id: string
  label: string
  type: BookingFieldType
  required?: boolean
  options?: string[]
  placeholder?: string
  condition?: BookingFieldCondition
  locked?: boolean
}

export type BookingFormSectionConfig = {
  id: string
  title: string
  fields: BookingFormFieldConfig[]
}

export type BookingFormConfig = BookingFormSectionConfig[]

export type BookingFormState = Record<string, string | boolean>

export const today = new Date().toISOString().slice(0, 10)

export const defaultBookingFormConfig: BookingFormConfig = [
  {
    id: 'personal',
    title: 'Personal information',
    fields: [
      { id: 'firstName', label: 'First name', type: 'text', required: true, placeholder: 'First name', locked: true },
      { id: 'lastName', label: 'Last name', type: 'text', required: true, placeholder: 'Last name', locked: true },
      { id: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
      { id: 'nationality', label: 'Nationality', type: 'text', required: true },
      { id: 'countryOfResidence', label: 'Country of residence', type: 'text', required: true },
      { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'] },
      { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com', locked: true },
      { id: 'mobileWhatsapp', label: 'Mobile / WhatsApp', type: 'tel', required: true, placeholder: '+977 ...' },
    ],
  },
  {
    id: 'travel',
    title: 'Travel details',
    fields: [
      { id: 'passportNumber', label: 'Passport number', type: 'text', required: true },
      { id: 'passportExpiryDate', label: 'Passport expiry date', type: 'date', required: true },
      { id: 'passportIssuingCountry', label: 'Passport issuing country', type: 'text', required: true },
      { id: 'trekPackage', label: 'Trek package name/code', type: 'select', required: true, locked: true },
      { id: 'trekStartDate', label: 'Trek start date', type: 'date', required: true },
      { id: 'trekEndDate', label: 'Trek end date', type: 'date', required: true },
      { id: 'arrivalDate', label: 'Flight arrival date', type: 'date' },
      { id: 'arrivalTime', label: 'Flight arrival time', type: 'time' },
      { id: 'arrivalFlightNumber', label: 'Arrival flight number', type: 'text' },
      { id: 'departureDate', label: 'Flight departure date', type: 'date' },
      { id: 'departureTime', label: 'Flight departure time', type: 'time' },
      { id: 'departureFlightNumber', label: 'Departure flight number', type: 'text' },
    ],
  },
  {
    id: 'health',
    title: 'Health and fitness',
    fields: [
      { id: 'medicalConditions', label: 'Pre-existing medical conditions', type: 'textarea', placeholder: 'Write none if not applicable.' },
      { id: 'currentMedications', label: 'Current medications', type: 'textarea', placeholder: 'Write none if not applicable.' },
      { id: 'highAltitudeExperience', label: 'Previous high-altitude trekking experience', type: 'textarea' },
      { id: 'fitnessLevel', label: 'Fitness level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
      { id: 'insuranceProvider', label: 'Travel insurance provider', type: 'text', required: true },
      { id: 'insurancePolicyNumber', label: 'Insurance policy number', type: 'text', required: true },
      { id: 'altitudeCoveragePolicyNumber', label: 'Altitude coverage policy number', type: 'text', condition: 'altitudeCoverage' },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferences and services',
    fields: [
      { id: 'accommodationPreference', label: 'Accommodation preference', type: 'select', required: true, options: ['Single', 'Shared'] },
      { id: 'roommateName', label: 'Roommate name', type: 'text', condition: 'sharedAccommodation' },
      { id: 'foodPreferenceAllergies', label: 'Food preference and allergies', type: 'textarea', required: true },
      { id: 'guide', label: 'Guide', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'porter', label: 'Porter', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'gearRental', label: 'Gear rental', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'airportPickupDropoff', label: 'Airport pickup/drop-off', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'additionalServices', label: 'Additional services required', type: 'textarea' },
    ],
  },
  {
    id: 'emergency',
    title: 'Emergency information',
    fields: [
      { id: 'emergencyContactName', label: 'Emergency contact name', type: 'text', required: true },
      { id: 'emergencyContactNumber', label: 'Emergency contact number', type: 'tel', required: true },
      { id: 'emergencyContactRelationship', label: 'Relationship to emergency contact', type: 'text', required: true },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    fields: [
      { id: 'paymentMethod', label: 'Preferred payment method', type: 'select', required: true, options: ['Bank transfer', 'Credit card', 'PayPal'] },
    ],
  },
  {
    id: 'additional',
    title: 'Additional information',
    fields: [
      { id: 'organizerNote', label: 'Note to the organizer', type: 'textarea' },
      { id: 'specialRequests', label: 'Special requests or requirements', type: 'textarea' },
      { id: 'heardAboutUs', label: 'How did you hear about us?', type: 'text' },
    ],
  },
  {
    id: 'consent',
    title: 'Consent',
    fields: [
      { id: 'agreeTerms', label: 'Terms and Conditions accepted', type: 'checkbox', required: true, locked: true },
      { id: 'acceptLiabilityWaiver', label: 'Liability waiver accepted', type: 'checkbox', required: true, locked: true },
      { id: 'photoMarketingConsent', label: 'Photo marketing consent', type: 'checkbox' },
      { id: 'signatureName', label: 'Typed signature', type: 'text', required: true, locked: true },
      { id: 'signatureDate', label: 'Signature date', type: 'date', required: true, locked: true },
    ],
  },
]

export const normalizeBookingFormConfig = (value: unknown): BookingFormConfig => {
  if (!Array.isArray(value)) return defaultBookingFormConfig

  const sections = value
    .map((section, sectionIndex) => {
      if (!section || typeof section !== 'object') return null
      const rawSection = section as Partial<BookingFormSectionConfig>
      const fields = Array.isArray(rawSection.fields)
        ? rawSection.fields
            .map((field) => {
              if (!field || typeof field !== 'object') return null
              const rawField = field as Partial<BookingFormFieldConfig>
              const type = rawField.type && ['text', 'email', 'tel', 'date', 'time', 'textarea', 'select', 'checkbox'].includes(rawField.type)
                ? rawField.type
                : 'text'
              const id = String(rawField.id || '').trim().replace(/[^A-Za-z0-9_]+/g, '')
              const label = String(rawField.label || '').trim()
              if (!id || !label) return null
              return {
                id,
                label,
                type,
                required: Boolean(rawField.required),
                options: type === 'select' ? (rawField.options || []).map(String).map((option) => option.trim()).filter(Boolean) : undefined,
                placeholder: rawField.placeholder ? String(rawField.placeholder).trim() : undefined,
                condition: rawField.condition,
                locked: Boolean(rawField.locked),
              }
            })
            .filter(Boolean) as BookingFormFieldConfig[]
        : []
      if (fields.length === 0) return null
      return {
        id: String(rawSection.id || `section-${sectionIndex + 1}`).trim().replace(/[^A-Za-z0-9_-]+/g, '-') || `section-${sectionIndex + 1}`,
        title: String(rawSection.title || `Section ${sectionIndex + 1}`).trim(),
        fields,
      }
    })
    .filter(Boolean) as BookingFormConfig

  return sections.length > 0 ? sections : defaultBookingFormConfig
}

export const createEmptyBookingFormState = (config: BookingFormConfig = defaultBookingFormConfig, trek?: Trek): BookingFormState => {
  const state: BookingFormState = {}
  config.forEach((section) => {
    section.fields.forEach((field) => {
      state[field.id] = field.type === 'checkbox' ? false : ''
    })
  })
  state.trekPackage = trek?.title ?? String(state.trekPackage || '')
  state.signatureDate = today
  return state
}

export const getBookingFieldMap = (config: BookingFormConfig) => {
  const map = new Map<string, BookingFormFieldConfig>()
  config.forEach((section) => section.fields.forEach((field) => map.set(field.id, field)))
  return map
}
