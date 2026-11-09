import { useEffect, useMemo, useState } from 'react'
import { getAdminSettings, type AdminSiteSettings } from '@/lib/api'
import { CONTACT_EMAIL, CONTACT_PHONE, DEFAULT_CONTACT_EMAILS, WHATSAPP_URL } from '@/lib/contact-links'

type SocialKey = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp'

const defaultSettings: Required<AdminSiteSettings> = {
  siteName: 'GELE TREKKING',
  logoUrl: '/geletrekking.png',
  contactHeroImageUrl: '',
  bookingHeroImageUrl: '',
  phone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
  contactEmails: DEFAULT_CONTACT_EMAILS,
  address: 'Lalitpur - 4, Lalitpur 44600',
  officeHoursWeekdays: 'Sunday – Friday: 9:00 AM – 6:00 PM',
  officeHoursWeekend: 'Saturday: By appointment only',
  mapEmbedUrl: 'https://maps.google.com/maps?q=Kathmandu%2C%20Nepal&t=&z=12&ie=UTF8&iwloc=&output=embed',
  // Off until the real setting arrives, so a hidden menu can't flash up or appear if loading fails.
  navigation: {
    activitiesEnabled: false,
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp: WHATSAPP_URL,
  },
  registrationsAffiliations: [],
}

function ensureProtocol(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

function normalizeSocialUrl(platform: SocialKey, rawValue?: string): string {
  const value = (rawValue || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value

  const handle = value.replace(/^@/, '').trim()

  if (!handle) return ''

  switch (platform) {
    case 'facebook':
      return `https://facebook.com/${handle}`
    case 'instagram':
      return `https://instagram.com/${handle}`
    case 'twitter':
      return `https://twitter.com/${handle}`
    case 'linkedin':
      return `https://linkedin.com/${handle}`
    case 'youtube':
      return `https://youtube.com/${handle}`
    case 'whatsapp': {
      const digits = handle.replace(/[^0-9]/g, '')
      return digits ? `https://wa.me/${digits}` : ensureProtocol(handle)
    }
    default:
      return ensureProtocol(handle)
  }
}

type LoadedSettings = Required<AdminSiteSettings>

function mergeSettings(data: AdminSiteSettings): LoadedSettings {
  return {
    ...defaultSettings,
    ...data,
    logoUrl: (data.logoUrl || '').trim() || defaultSettings.logoUrl,
    email: (data.email || '').trim() || CONTACT_EMAIL,
    phone: (data.phone || '').trim() || CONTACT_PHONE,
    contactEmails: Array.isArray(data.contactEmails) ? data.contactEmails : DEFAULT_CONTACT_EMAILS,
    navigation: {
      ...defaultSettings.navigation,
      ...(data.navigation || {}),
    },
    social: {
      ...defaultSettings.social,
      ...(data.social || {}),
    },
  }
}

/** Long enough to cover moving between pages; short enough that admin edits show up quickly. */
const SETTINGS_FRESH_MS = 60_000
let sharedRequest: Promise<LoadedSettings> | null = null
let requestedAt = 0
let latestSettings: LoadedSettings | null = null

/** Every component on a page shares this one request. Failures aren't kept, so the next page retries. */
function loadSharedSettings() {
  if (!sharedRequest || Date.now() - requestedAt > SETTINGS_FRESH_MS) {
    requestedAt = Date.now()
    sharedRequest = getAdminSettings()
      .then((data) => {
        latestSettings = mergeSettings(data)
        return latestSettings
      })
      .catch((error) => {
        sharedRequest = null
        throw error
      })
  }
  return sharedRequest
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<LoadedSettings>(() => latestSettings ?? defaultSettings)

  useEffect(() => {
    let cancelled = false
    loadSharedSettings()
      .then((loaded) => {
        if (!cancelled) setSettings(loaded)
      })
      .catch(() => {
        if (!cancelled) setSettings(latestSettings ?? defaultSettings)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const normalizedSocial = useMemo(
    () => ({
      facebook: normalizeSocialUrl('facebook', settings.social.facebook),
      instagram: normalizeSocialUrl('instagram', settings.social.instagram),
      twitter: normalizeSocialUrl('twitter', settings.social.twitter),
      linkedin: normalizeSocialUrl('linkedin', settings.social.linkedin),
      youtube: normalizeSocialUrl('youtube', settings.social.youtube),
      whatsapp: normalizeSocialUrl('whatsapp', settings.social.whatsapp),
    }),
    [settings.social]
  )

  return {
    settings,
    social: normalizedSocial,
  }
}
