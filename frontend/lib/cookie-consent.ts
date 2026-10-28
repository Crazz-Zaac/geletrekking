export const COOKIE_CONSENT_KEY = 'gele-cookie-consent-v1'
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000

export interface CookiePreference {
  version: 1
  externalMedia: boolean
  savedAt: number
}

export function parseCookiePreference(raw: string | null, now = Date.now()): CookiePreference | null {
  try {
    const value = JSON.parse(raw || 'null')
    if (value?.version !== 1 || typeof value.externalMedia !== 'boolean' ||
      typeof value.savedAt !== 'number' || !Number.isFinite(value.savedAt) ||
      value.savedAt > now || now - value.savedAt >= CONSENT_MAX_AGE_MS) return null
    return value as CookiePreference
  } catch {
    return null
  }
}
