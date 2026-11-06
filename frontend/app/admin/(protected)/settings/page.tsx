'use client'

import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  AdminPageHeader,
  Field,
  FieldGrid,
  FormSection,
  FormSkeleton,
  ImageUrlField,
  SaveBar,
  StatusToasts,
  useDirtyState,
  useUnsavedChangesWarning,
} from '@/components/admin/form-kit'
import { AdminSiteSettings, getAdminSettings, updateAdminSettings } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

const defaultSettings: AdminSiteSettings = {
  siteName: '',
  logoUrl: '',
  contactHeroImageUrl: '',
  bookingHeroImageUrl: '',
  phone: '',
  email: '',
  address: '',
  officeHoursWeekdays: '',
  officeHoursWeekend: '',
  mapEmbedUrl: '',
  navigation: {
    activitiesEnabled: true,
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp: '',
  },
}

type SocialKey = keyof NonNullable<AdminSiteSettings['social']>

const SOCIAL_FIELDS: Array<{ key: SocialKey; label: string; placeholder: string }> = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/yourpage' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/yourhandle' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/@yourchannel' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/company/…' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/yourhandle' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/9779800000000' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(form: AdminSiteSettings) {
  const errors: Record<string, string> = {}
  if (form.email && !EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  const map = (form.mapEmbedUrl || '').trim()
  if (map && !/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(map)) {
    errors.mapEmbedUrl = 'Use the embed link (https://www.google.com/maps/embed?pb=…), not a share link or iframe code.'
  }
  for (const { key } of SOCIAL_FIELDS) {
    const value = (form.social?.[key] || '').trim()
    if (value && key !== 'whatsapp' && !/^https:\/\//.test(value)) errors[`social.${key}`] = 'Use the full link starting with https://'
  }
  return errors
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<AdminSiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const { dirty, markSaved, baseline } = useDirtyState(form)
  useUnsavedChangesWarning(dirty)

  const token = getAdminToken()
  const errors = useMemo(() => validate(form), [form])
  const visibleErrors = showErrors ? errors : {}

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminSettings()
      const next = {
        ...defaultSettings,
        ...data,
        social: { ...defaultSettings.social, ...(data.social || {}) },
      }
      setForm(next)
      markSaved(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deep links from admin search (e.g. /admin/settings#social): scroll once the
  // sections have rendered.
  useEffect(() => {
    if (loading) return
    const id = window.location.hash.slice(1)
    if (!id) return
    const section = document.getElementById(id)
    if (!section) return
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    section.classList.add('ring-2', 'ring-primary/40', 'ring-offset-4', 'ring-offset-background')
    const timer = window.setTimeout(() => section.classList.remove('ring-2', 'ring-primary/40', 'ring-offset-4', 'ring-offset-background'), 1800)
    return () => window.clearTimeout(timer)
  }, [loading])

  const set = <K extends keyof AdminSiteSettings>(key: K, value: AdminSiteSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const updateSocial = (key: SocialKey, value: string) =>
    setForm((prev) => ({ ...prev, social: { ...(prev.social || {}), [key]: value } }))

  const onSave = async () => {
    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }
    if (Object.keys(errors).length > 0) {
      setShowErrors(true)
      setError('Please fix the highlighted fields.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateAdminSettings(token, form)
      setMessage('Site settings saved.')
      setShowErrors(false)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const onDiscard = () => {
    const saved = baseline()
    if (saved) setForm(saved)
    setShowErrors(false)
  }

  const linkedin = (form.social?.linkedin || '').trim()

  return (
    <div className="space-y-8">
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="Site settings"
        description="Branding, contact details and social links used across the whole website."
      />

      {loading ? (
        <FormSkeleton rows={4} />
      ) : (
        <>
          <FormSection id="branding" title="Branding" description="Your company name and logo as shown in the header and browser tab.">
            <Field label="Site name" hint="Used in the header, footer and page titles.">
              <Input className="h-10" placeholder="Gele Trekking" value={form.siteName || ''} onChange={(e) => set('siteName', e.target.value)} />
            </Field>
            <ImageUrlField
              label="Logo"
              aspect="logo"
              value={form.logoUrl}
              onChange={(value) => set('logoUrl', value)}
              hint="Square PNG or SVG with a transparent background works best."
            />
          </FormSection>

          <FormSection id="page-heroes" title="Page header images" description="Background photos behind the headings of the Contact and Book pages.">
            <ImageUrlField
              label="Contact page"
              value={form.contactHeroImageUrl}
              onChange={(value) => set('contactHeroImageUrl', value)}
              hint="Landscape photo, at least 1600 px wide."
            />
            <ImageUrlField
              label="Booking page"
              value={form.bookingHeroImageUrl}
              onChange={(value) => set('bookingHeroImageUrl', value)}
              hint="Landscape photo, at least 1600 px wide."
            />
          </FormSection>

          <FormSection id="contact" title="Contact & location" description="Shown on the Contact page, footer, floating contact button and in search results.">
            <FieldGrid>
              <Field label="Phone" hint="Include the country code, e.g. +977.">
                <Input className="h-10" type="tel" inputMode="tel" placeholder="+977 98…" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
              </Field>
              <Field label="Email" error={visibleErrors.email}>
                <Input className="h-10" type="email" inputMode="email" placeholder="hello@geletrekking.com" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
              </Field>
            </FieldGrid>
            <Field label="Office address">
              <Input className="h-10" placeholder="Street, City, Postal code" value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <FieldGrid>
              <Field label="Office hours: weekdays">
                <Input className="h-10" placeholder="Sun–Fri: 9:00 AM – 6:00 PM" value={form.officeHoursWeekdays || ''} onChange={(e) => set('officeHoursWeekdays', e.target.value)} />
              </Field>
              <Field label="Office hours: weekend">
                <Input className="h-10" placeholder="Sat: by appointment" value={form.officeHoursWeekend || ''} onChange={(e) => set('officeHoursWeekend', e.target.value)} />
              </Field>
            </FieldGrid>
            <Field
              label="Google Maps embed link"
              error={visibleErrors.mapEmbedUrl}
              hint={<>In Google Maps: <strong>Share → Embed a map</strong>, copy only the link inside <code className="rounded bg-muted px-1">src=&quot;…&quot;</code>.</>}
            >
              <Input className="h-10" type="url" placeholder="https://www.google.com/maps/embed?pb=…" value={form.mapEmbedUrl || ''} onChange={(e) => set('mapEmbedUrl', e.target.value)} />
            </Field>
          </FormSection>

          <FormSection id="social" title="Social media" description="Icons in the header and footer link here. Official company profiles also go into search-engine data.">
            <FieldGrid>
              {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                <Field
                  key={key}
                  label={label}
                  error={visibleErrors[`social.${key}`]}
                  hint={
                    key === 'linkedin' && /linkedin\.com\/in\//i.test(linkedin)
                      ? 'This is a personal profile. Use the company page (linkedin.com/company/…) so it counts as an official profile.'
                      : undefined
                  }
                >
                  <Input className="h-10" type="url" placeholder={placeholder} value={form.social?.[key] || ''} onChange={(e) => updateSocial(key, e.target.value)} />
                </Field>
              ))}
            </FieldGrid>
          </FormSection>

          <SaveBar dirty={dirty} saving={saving} onSave={onSave} onDiscard={dirty ? onDiscard : undefined} saveLabel="Save settings" />
        </>
      )}
    </div>
  )
}
