'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminAbout,
  AdminAboutHighlight,
  AdminAboutStat,
  getAdminAbout,
  updateAdminAbout,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

const defaultAbout: AdminAbout = {
  heroTitle: '',
  heroSubtitle: '',
  heroImageUrl: '',
  missionTitle: '',
  missionBody: '',
  storyTitle: '',
  storyBody: '',
  highlights: [],
  stats: [],
}

export default function AdminAboutPage() {
  const [form, setForm] = useState<AdminAbout>(defaultAbout)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminAbout()
      setForm({
        ...defaultAbout,
        ...data,
        highlights: data.highlights || [],
        stats: data.stats || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load about content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const updateHighlight = (index: number, next: Partial<AdminAboutHighlight>) => {
    setForm((prev) => {
      const highlights = [...(prev.highlights || [])]
      highlights[index] = { ...(highlights[index] || { title: '', description: '' }), ...next }
      return { ...prev, highlights }
    })
  }

  const updateStat = (index: number, next: Partial<AdminAboutStat>) => {
    setForm((prev) => {
      const stats = [...(prev.stats || [])]
      stats[index] = { ...(stats[index] || { label: '', value: '' }), ...next }
      return { ...prev, stats }
    })
  }

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await updateAdminAbout(token, form)
      setMessage('About page updated successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save about page')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>About Page</CardTitle>
        <CardDescription>Full editable About content with highlights and stats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading about page...</p>
        ) : (
          <>
            <Input placeholder="Hero title" value={form.heroTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroTitle: e.target.value }))} />
            <textarea rows={3} value={form.heroSubtitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))} placeholder="Hero subtitle" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <Input placeholder="Hero image URL" value={form.heroImageUrl || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroImageUrl: e.target.value }))} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input placeholder="Mission title" value={form.missionTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, missionTitle: e.target.value }))} />
              <Input placeholder="Story title" value={form.storyTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, storyTitle: e.target.value }))} />
            </div>
            <textarea rows={4} value={form.missionBody || ''} onChange={(e) => setForm((prev) => ({ ...prev, missionBody: e.target.value }))} placeholder="Mission body" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <textarea rows={4} value={form.storyBody || ''} onChange={(e) => setForm((prev) => ({ ...prev, storyBody: e.target.value }))} placeholder="Story body" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />

            <div className="rounded-md border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Highlights</p>
                <Button variant="outline" size="sm" onClick={() => setForm((prev) => ({ ...prev, highlights: [...(prev.highlights || []), { title: '', description: '' }] }))}>Add</Button>
              </div>
              {(form.highlights || []).map((highlight, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2">
                  <Input value={highlight.title} onChange={(e) => updateHighlight(index, { title: e.target.value })} placeholder="Title" />
                  <Input value={highlight.description} onChange={(e) => updateHighlight(index, { description: e.target.value })} placeholder="Description" />
                  <Button variant="destructive" size="sm" onClick={() => setForm((prev) => ({ ...prev, highlights: (prev.highlights || []).filter((_, idx) => idx !== index) }))}>Remove</Button>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Stats</p>
                <Button variant="outline" size="sm" onClick={() => setForm((prev) => ({ ...prev, stats: [...(prev.stats || []), { label: '', value: '' }] }))}>Add</Button>
              </div>
              {(form.stats || []).map((stat, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                  <Input value={stat.label} onChange={(e) => updateStat(index, { label: e.target.value })} placeholder="Label" />
                  <Input value={stat.value} onChange={(e) => updateStat(index, { value: e.target.value })} placeholder="Value" />
                  <Button variant="destructive" size="sm" onClick={() => setForm((prev) => ({ ...prev, stats: (prev.stats || []).filter((_, idx) => idx !== index) }))}>Remove</Button>
                </div>
              ))}
            </div>

            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save About Page'}</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
