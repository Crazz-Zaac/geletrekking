'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminSiteSettings,
  getAdminSettings,
  updateAdminSettings,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

const defaultSettings: AdminSiteSettings = {
  siteName: '',
  logoUrl: '',
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

export default function AdminSettingsPage() {
  const [form, setForm] = useState<AdminSiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getAdminSettings()
      setForm({
        ...defaultSettings,
        ...data,
        social: {
          ...defaultSettings.social,
          ...(data.social || {}),
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateAdminSettings(token, form)
      setMessage('Settings updated successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSocial = (key: keyof NonNullable<AdminSiteSettings['social']>, value: string) => {
    setForm((prev) => ({
      ...prev,
      social: {
        ...(prev.social || {}),
        [key]: value,
      },
    }))
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Manage your website branding, contact details, social links, and navigation behavior.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        ) : (
          <>
            <section className="rounded-md border border-border p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Branding</h3>
                <p className="text-xs text-muted-foreground mt-1">Control your site identity and primary logo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Site name</label>
                  <Input
                    placeholder="Gele Trekking"
                    value={form.siteName || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Logo URL</label>
                  <Input
                    placeholder="https://..."
                    value={form.logoUrl || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  />
                </div>
              </div>

              {form.logoUrl ? (
                <div className="rounded-md border border-border bg-muted/30 p-3 w-fit">
                  <p className="text-xs text-muted-foreground mb-2">Logo preview</p>
                  <img src={form.logoUrl} alt="Logo preview" className="h-16 w-16 rounded-md border border-border object-cover" />
                </div>
              ) : null}
            </section>

            <section className="rounded-md border border-border p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Contact & Location</h3>
                <p className="text-xs text-muted-foreground mt-1">This data is used across contact pages, footer, and legal pages.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    placeholder="+977..."
                    value={form.phone || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    placeholder="contact@..."
                    value={form.email || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Address</label>
                <Input
                  placeholder="Office address"
                  value={form.address || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Office hours (weekdays)</label>
                  <Input
                    placeholder="Sunday – Friday: 9:00 AM – 6:00 PM"
                    value={form.officeHoursWeekdays || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, officeHoursWeekdays: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Office hours (weekend)</label>
                  <Input
                    placeholder="Saturday: By appointment only"
                    value={form.officeHoursWeekend || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, officeHoursWeekend: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Map embed URL</label>
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-muted text-[11px] font-semibold text-muted-foreground"
                    title="Paste only the src URL from Google Maps Share > Embed a map. Do not use maps.app.goo.gl share links or the full iframe code."
                  >
                    ?
                  </span>
                </div>
                <Input
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  value={form.mapEmbedUrl || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, mapEmbedUrl: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Use the iframe src URL from Google Maps Embed a map, for example https://www.google.com/maps/embed?pb=...</p>
              </div>
            </section>

            <section className="rounded-md border border-border p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Social Links</h3>
                <p className="text-xs text-muted-foreground mt-1">Use full URLs or handles based on your preference.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Facebook</label>
                  <Input placeholder="facebook.com/yourpage" value={form.social?.facebook || ''} onChange={(e) => updateSocial('facebook', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Instagram</label>
                  <Input placeholder="instagram.com/yourhandle" value={form.social?.instagram || ''} onChange={(e) => updateSocial('instagram', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Twitter / X</label>
                  <Input placeholder="x.com/yourhandle" value={form.social?.twitter || ''} onChange={(e) => updateSocial('twitter', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">LinkedIn</label>
                  <Input placeholder="linkedin.com/company/..." value={form.social?.linkedin || ''} onChange={(e) => updateSocial('linkedin', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">YouTube</label>
                  <Input placeholder="youtube.com/@yourchannel" value={form.social?.youtube || ''} onChange={(e) => updateSocial('youtube', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">WhatsApp</label>
                  <Input placeholder="wa.me/number or number" value={form.social?.whatsapp || ''} onChange={(e) => updateSocial('whatsapp', e.target.value)} />
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-1">
              <Button onClick={onSave} disabled={saving} className="min-w-36">
                {saving ? 'Saving...' : 'Save Site Settings'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
