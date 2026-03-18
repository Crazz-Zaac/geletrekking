'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdminHero, getAdminHero, updateAdminHero } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

const defaultHero: AdminHero = {
  title: '',
  subtitle: '',
  backgroundImage: '',
  overlay: '',
  ctaText: '',
  ctaLink: '',
}

export default function AdminHeroPage() {
  const [form, setForm] = useState<AdminHero>(defaultHero)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminHero()
      setForm({ ...defaultHero, ...data })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hero section')
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
      await updateAdminHero(token, form)
      setMessage('Hero section updated successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hero section')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>Manage homepage hero content like in `frontend_old`.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading hero section...</p>
        ) : (
          <>
            <Input placeholder="Title" value={form.title || ''} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            <textarea
              rows={4}
              value={form.subtitle || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Subtitle"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Input placeholder="Background image URL" value={form.backgroundImage || ''} onChange={(e) => setForm((prev) => ({ ...prev, backgroundImage: e.target.value }))} />
            <Input placeholder="Overlay CSS" value={form.overlay || ''} onChange={(e) => setForm((prev) => ({ ...prev, overlay: e.target.value }))} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input placeholder="CTA text" value={form.ctaText || ''} onChange={(e) => setForm((prev) => ({ ...prev, ctaText: e.target.value }))} />
              <Input placeholder="CTA link" value={form.ctaLink || ''} onChange={(e) => setForm((prev) => ({ ...prev, ctaLink: e.target.value }))} />
            </div>
            {form.backgroundImage ? (
              <div className="rounded-md border border-border overflow-hidden">
                <div
                  className="h-44 bg-cover bg-center"
                  style={{
                    backgroundImage: `${form.overlay || ''}, url('${form.backgroundImage}')`,
                  }}
                />
              </div>
            ) : null}
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Hero'}</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
