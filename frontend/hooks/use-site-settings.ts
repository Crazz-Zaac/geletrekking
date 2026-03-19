import { useEffect, useMemo, useState } from 'react'
import { getAdminSettings, type AdminSiteSettings } from '@/lib/api'

type SocialKey = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp'

const defaultSettings: Required<AdminSiteSettings> = {
  siteName: 'GELE TREKKING',
  logoUrl: '/geletrekking.png',
  phone: '+977 985 123 4567',
  email: 'info@geletrekking.com',
  address: 'Thamel, Kathmandu 44600, Nepal',
  officeHoursWeekdays: 'Sunday – Friday: 9:00 AM – 6:00 PM',
  officeHoursWeekend: 'Saturday: By appointment only',
  mapEmbedUrl: 'https://maps.google.com/maps?q=Kathmandu%2C%20Nepal&t=&z=12&ie=UTF8&iwloc=&output=embed',
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp: '',
  },
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

export function useSiteSettings() {
  const [settings, setSettings] = useState<Required<AdminSiteSettings>>(defaultSettings)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminSettings()

        const merged: Required<AdminSiteSettings> = {
          ...defaultSettings,
          ...data,
          logoUrl: (data.logoUrl || '').trim() || defaultSettings.logoUrl,
          social: {
            ...defaultSettings.social,
            ...(data.social || {}),
          },
        }

        setSettings(merged)
      } catch {
        setSettings(defaultSettings)
      }
    }

    void load()
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
