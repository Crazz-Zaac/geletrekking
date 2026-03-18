'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdminSiteSettings, getAdminSettings, updateAdminSettings } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

const defaultSettings: AdminSiteSettings = {
  siteName: '',
  logoUrl: '',
  phone: '',
  email: '',
  address: '',
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
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

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Equivalent to `frontend_old` settings management with editable global site fields.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        ) : (
          <>
            <Input placeholder="Site name" value={form.siteName || ''} onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))} />
            <Input placeholder="Logo URL" value={form.logoUrl || ''} onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))} />
            {form.logoUrl ? <img src={form.logoUrl} alt="Logo preview" className="h-16 w-16 rounded-md border border-border object-cover" /> : null}
            <Input placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            <Input placeholder="Email" value={form.email || ''} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            <Input placeholder="Address" value={form.address || ''} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input placeholder="Facebook" value={form.social?.facebook || ''} onChange={(e) => setForm((prev) => ({ ...prev, social: { ...(prev.social || {}), facebook: e.target.value } }))} />
              <Input placeholder="Instagram" value={form.social?.instagram || ''} onChange={(e) => setForm((prev) => ({ ...prev, social: { ...(prev.social || {}), instagram: e.target.value } }))} />
              <Input placeholder="Twitter" value={form.social?.twitter || ''} onChange={(e) => setForm((prev) => ({ ...prev, social: { ...(prev.social || {}), twitter: e.target.value } }))} />
              <Input placeholder="LinkedIn" value={form.social?.linkedin || ''} onChange={(e) => setForm((prev) => ({ ...prev, social: { ...(prev.social || {}), linkedin: e.target.value } }))} />
            </div>

            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
