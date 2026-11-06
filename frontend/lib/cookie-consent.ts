// Cookie / third-party content consent.
//
// Follows common GDPR/ePrivacy practice: optional categories are off by
// default, "Reject all" is as easy as "Accept all", choices are per category,
// expire after 6 months, and everyone is asked again when CONSENT_VERSION
// changes (new categories or providers).

export const COOKIE_CONSENT_KEY = 'gele-cookie-consent'
/** Older storage keys, removed when a new choice is saved. */
export const LEGACY_COOKIE_CONSENT_KEYS = ['gele-cookie-consent-v1']
/** Bump when categories or providers change, so visitors are asked again. */
export const CONSENT_VERSION = 2
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000

export type OptionalConsentCategory = 'media'

export interface ConsentCategoryInfo {
  id: 'necessary' | OptionalConsentCategory
  label: string
  description: string
  providers: string[]
  required?: boolean
}

export const CONSENT_CATEGORIES: ConsentCategoryInfo[] = [
  {
    id: 'necessary',
    label: 'Strictly necessary',
    description:
      'Needed for the site to work and stay secure: spam and bot protection on forms, admin sign-in, dismissed notices and remembering this choice. These cannot be turned off.',
    providers: ['Gele Trekking', 'Cloudflare (security and bot protection)'],
    required: true,
  },
  {
    id: 'media',
    label: 'Maps & videos',
    description:
      'Shows the Google map on the Contact page and YouTube videos inside blog posts. These services may set their own cookies and receive your IP address.',
    providers: ['Google Maps', 'YouTube (privacy-enhanced mode)'],
  },
]

export interface CookiePreference {
  version: typeof CONSENT_VERSION
  media: boolean
  savedAt: number
}

export function parseCookiePreference(raw: string | null, now = Date.now()): CookiePreference | null {
  try {
    const value = JSON.parse(raw || 'null')
    if (
      value?.version !== CONSENT_VERSION ||
      typeof value.media !== 'boolean' ||
      typeof value.savedAt !== 'number' ||
      !Number.isFinite(value.savedAt) ||
      value.savedAt > now ||
      now - value.savedAt >= CONSENT_MAX_AGE_MS
    ) {
      return null
    }
    return { version: CONSENT_VERSION, media: value.media, savedAt: value.savedAt }
  } catch {
    return null
  }
}

export function createCookiePreference(choices: Record<OptionalConsentCategory, boolean>, now = Date.now()): CookiePreference {
  return { version: CONSENT_VERSION, media: !!choices.media, savedAt: now }
}
