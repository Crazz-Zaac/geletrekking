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

const HEALTH_CONSENT_FIELD: BookingFormFieldConfig = { id: 'healthDataConsent', label: 'Health information consent', type: 'checkbox', required: true, locked: true }
const HEALTH_FIELD_IDS = new Set(['medicalConditions', 'currentMedications', 'highAltitudeExperience', 'fitnessLevel', 'foodPreferenceAllergies'])

/** Forms saved or sent before this consent existed still ask about health, so they need it too. */
const withHealthConsent = (config: BookingFormConfig): BookingFormConfig => {
  const fields = config.flatMap((section) => section.fields)
  if (fields.some((field) => field.id === HEALTH_CONSENT_FIELD.id) || !fields.some((field) => HEALTH_FIELD_IDS.has(field.id))) return config
  const home = config.findIndex((section) => section.fields.some((field) => field.id === 'acceptLiabilityWaiver'))
  const sectionIndex = home >= 0 ? home : config.length - 1
  return config.map((section, index) => {
    if (index !== sectionIndex) return section
    const after = section.fields.findIndex((field) => field.id === 'acceptLiabilityWaiver')
    const insertAt = after >= 0 ? after + 1 : section.fields.length
    return { ...section, fields: [...section.fields.slice(0, insertAt), HEALTH_CONSENT_FIELD, ...section.fields.slice(insertAt)] }
  })
}

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
      { id: 'arrivalTime', label: 'Flight arrival time', type: 'text', placeholder: 'HH:MM or 2:30 PM' },
      { id: 'arrivalFlightNumber', label: 'Arrival airline name and flight number', type: 'text' },
      { id: 'departureDate', label: 'Flight departure date', type: 'date' },
      { id: 'departureTime', label: 'Flight departure time', type: 'text', placeholder: 'HH:MM or 2:30 PM' },
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
      { id: 'insurancePolicyNumber', label: 'Travel insurance policy number', type: 'text', required: true },
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
      { id: 'emergencyContactName', label: 'Emergency contact person name', type: 'text', required: true },
      { id: 'emergencyContactNumber', label: 'Emergency contact number', type: 'tel', required: true },
      { id: 'emergencyContactRelationship', label: 'Emergency contact email', type: 'email', required: true },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    fields: [
      { id: 'paymentMethod', label: 'Preferred payment method', type: 'select', required: true, options: ['Bank transfer', 'Credit card', 'PayPal', 'Cash'] },
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
      HEALTH_CONSENT_FIELD,
      { id: 'photoMarketingConsent', label: 'Photo marketing consent', type: 'checkbox' },
      { id: 'signatureName', label: 'Typed signature', type: 'text', required: true, locked: true },
      { id: 'signatureDate', label: 'Signature date', type: 'date', required: true, locked: true },
    ],
  },
]

/** The public /book form. Not editable per link. */
export const preBookingFormConfig: BookingFormConfig = [
  {
    id: 'personal',
    title: 'Personal Information',
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', required: true },
      { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { id: 'nationality', label: 'Nationality', type: 'text', required: true },
      { id: 'phoneNumber', label: 'Phone Number (country code)', type: 'tel', required: true, placeholder: '+977 ...' },
      { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
      // Only needed once a booking is confirmed; the private form asks for them then.
      { id: 'passportNumber', label: 'Passport Number', type: 'text' },
      { id: 'passportExpiryDate', label: 'Passport Expiry Date', type: 'date' },
    ],
  },
  {
    id: 'trek',
    title: 'Trek Details',
    fields: [
      { id: 'nameOfTrekRoute', label: 'Name of Trek Route', type: 'select', required: true },
      { id: 'trekStartDate', label: 'Trek Start Date', type: 'date', required: true },
      { id: 'trekEndDate', label: 'Trek End Date', type: 'date', required: true },
      { id: 'tripType', label: 'Trip', type: 'select', required: true, options: ['Group', 'Private'] },
      { id: 'roomPreference', label: 'Room', type: 'select', required: true, options: ['Shared (included)', 'Private (extra charge)'] },
      { id: 'insuranceDetailsLater', label: 'Will you provide us with your travel insurance details when you meet your guide?', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'flight',
    title: 'Flight Details',
    fields: [
      { id: 'arrivalAirline', label: 'Arrival Airline', type: 'text' },
      { id: 'arrivalDate', label: 'Arrival Date', type: 'date' },
      { id: 'arrivalTime', label: 'Arrival Time', type: 'text', placeholder: 'HH:MM or 2:30 PM' },
      { id: 'arrivalFlightNumber', label: 'Arrival Flight Number', type: 'text' },
      { id: 'departureAirline', label: 'Departure Airline', type: 'text' },
      { id: 'departureDate', label: 'Departure Date', type: 'date' },
      { id: 'departureTime', label: 'Departure Time', type: 'text', placeholder: 'HH:MM or 2:30 PM' },
      { id: 'departureFlightNumber', label: 'Departure Flight Number', type: 'text' },
    ],
  },
  {
    id: 'payment',
    title: 'Payment Information',
    fields: [
      { id: 'totalAmountDue', label: 'Total Amount Due', type: 'text' },
      { id: 'depositPaid', label: 'Amount of Deposit Paid (advance)', type: 'text' },
      { id: 'balanceRemaining', label: 'Balance Remaining', type: 'text' },
      { id: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Bank Transfer', 'Cash on Arrival', 'Other'] },
      { id: 'balanceAgreement', label: 'I agree to pay the remaining balance at the group meeting prior to the departure date.', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'additional',
    title: 'Additional Information',
    fields: [
      {
        id: 'additionalInformation',
        label: 'Is there any additional information that you would like to share with Gele Trekking to help us ensure that your particular needs are cared for?',
        type: 'textarea',
        placeholder: 'For example, dietary preferences or anything else we should know. Please leave out medical details; we ask for those once your booking is confirmed.',
      },
    ],
  },
  {
    id: 'consent',
    title: 'Consent',
    fields: [
      { id: 'agreeTerms', label: 'Terms and Conditions accepted', type: 'checkbox', required: true },
      { id: 'acceptLiabilityWaiver', label: 'Liability waiver accepted', type: 'checkbox', required: true },
      { id: 'photoMarketingConsent', label: 'Photo marketing consent', type: 'checkbox' },
      { id: 'signatureName', label: 'Typed signature', type: 'text', required: true },
      { id: 'signatureDate', label: 'Signature date', type: 'date', required: true },
    ],
  },
]


const fieldOverrides: Record<string, Partial<BookingFormFieldConfig> | null> = {
  arrivalTime: { type: 'text', placeholder: 'HH:MM or 2:30 PM' },
  departureTime: { type: 'text', placeholder: 'HH:MM or 2:30 PM' },
  arrivalFlightNumber: { label: 'Arrival airline name and flight number' },
  insurancePolicyNumber: { label: 'Travel insurance policy number' },
  altitudeCoveragePolicyNumber: null,
  emergencyContactName: { label: 'Emergency contact person name' },
  emergencyContactRelationship: { label: 'Emergency contact email', type: 'email' },
  paymentMethod: { options: ['Bank transfer', 'Credit card', 'PayPal', 'Cash'] },
}

const applyFieldOverrides = (field: BookingFormFieldConfig): BookingFormFieldConfig | null => {
  if (!(field.id in fieldOverrides)) return field
  const override = fieldOverrides[field.id]
  if (override === null) return null

  const nextType = override.type || field.type
  return {
    ...field,
    ...override,
    type: nextType,
    options: nextType === 'select' ? (override.options || field.options || []) : undefined,
  }
}

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
              return applyFieldOverrides({
                id,
                label,
                type,
                required: Boolean(rawField.required),
                options: type === 'select' ? (rawField.options || []).map(String).map((option) => option.trim()).filter(Boolean) : undefined,
                placeholder: rawField.placeholder ? String(rawField.placeholder).trim() : undefined,
                condition: rawField.condition,
                locked: Boolean(rawField.locked),
              })
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

  return sections.length > 0 ? withHealthConsent(sections) : defaultBookingFormConfig
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
