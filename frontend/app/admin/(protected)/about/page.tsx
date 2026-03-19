'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AdminAbout,
  AdminAboutHighlight,
  getAdminAbout,
  updateAdminAbout,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

const defaultAbout: AdminAbout = {
  heroTitle: 'About Us',
  heroSubtitle: 'We are a Nepal-based trekking company focused on safe, authentic, and responsibly operated Himalayan experiences.',
  heroImageUrl: '',
  missionTitle: 'Our Mission',
  missionBody: 'Our mission is to deliver safe, memorable, and responsibly operated trekking journeys while supporting local livelihoods and preserving mountain environments for future generations.',
  storyTitle: 'Our Story',
  storyBody: 'Gele Trekking began with a local team of mountain professionals who believed travelers deserve honest guidance, strong safety standards, and authentic connections with Nepal\'s mountain culture. Today, we continue the same approach—small details handled well, local teams treated fairly, and every itinerary built for a meaningful Himalayan experience.',
  highlights: [
    {
      title: 'Excellence',
      description: 'We maintain the highest standards in safety, service, and experiences for all our trekkers.',
    },
    {
      title: 'Community',
      description: 'We believe in building lasting relationships with our guides, porters, and trekking community.',
    },
    {
      title: 'Expertise',
      description: 'Our team brings decades of combined experience trekking the Himalayan mountains.',
    },
    {
      title: 'Sustainability',
      description: 'We are committed to preserving Nepal\'s natural beauty for future generations.',
    },
  ],
  whyChooseUs: [
    'Licensed and experienced local guide team with strong mountain safety practices.',
    'Transparent pricing with practical pre-trip guidance and itinerary support.',
    'Responsible operations that support local communities and porter welfare.',
    'Personalized service from first inquiry to post-trek follow-up.',
  ],
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

      const fallbackText = (incoming?: string, fallback?: string) => {
        const value = (incoming || '').trim()
        return value.length > 0 ? value : (fallback || '')
      }

      const incomingHighlights = (data.highlights || []).filter((item) => item.title?.trim() || item.description?.trim())
      const incomingWhyChoose = (data.whyChooseUs || []).map((item) => item.trim()).filter(Boolean)

      setForm({
        ...data,
        heroTitle: fallbackText(data.heroTitle, defaultAbout.heroTitle),
        heroSubtitle: fallbackText(data.heroSubtitle, defaultAbout.heroSubtitle),
        heroImageUrl: data.heroImageUrl || '',
        missionTitle: fallbackText(data.missionTitle, defaultAbout.missionTitle),
        missionBody: fallbackText(data.missionBody, defaultAbout.missionBody),
        storyTitle: fallbackText(data.storyTitle, defaultAbout.storyTitle),
        storyBody: fallbackText(data.storyBody, defaultAbout.storyBody),
        highlights: incomingHighlights.length > 0 ? incomingHighlights : (defaultAbout.highlights || []),
        whyChooseUs: incomingWhyChoose.length > 0 ? incomingWhyChoose : (defaultAbout.whyChooseUs || []),
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
    <Card className="border-border bg-gradient-to-b from-background to-muted/20">
      <CardHeader className="border-b border-border">
        <CardTitle>About Page Content Studio</CardTitle>
        <CardDescription>Manage the same blocks shown on the public About page.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading about page...</p>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-background p-4 md:p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Hero Section</h3>
              <Input
                placeholder="Page heading (About title)"
                value={form.heroTitle || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
              />
              <Textarea
                rows={3}
                value={form.heroSubtitle || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                placeholder="Top intro paragraph"
              />
            </div>

            <div className="rounded-xl border border-border bg-background p-4 md:p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Story & Mission</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Story section title"
                  value={form.storyTitle || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, storyTitle: e.target.value }))}
                />
                <Input
                  placeholder="Mission section title"
                  value={form.missionTitle || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, missionTitle: e.target.value }))}
                />
              </div>
              <Textarea
                rows={5}
                value={form.storyBody || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, storyBody: e.target.value }))}
                placeholder="Story paragraph"
              />
              <Textarea
                rows={5}
                value={form.missionBody || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, missionBody: e.target.value }))}
                placeholder="Mission paragraph"
              />
            </div>

            <div className="rounded-xl border border-border bg-background p-4 md:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wide">Our Values</p>
                <Button variant="outline" size="sm" onClick={() => setForm((prev) => ({ ...prev, highlights: [...(prev.highlights || []), { title: '', description: '' }] }))}>Add Value</Button>
              </div>
              {(form.highlights || []).map((highlight, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 rounded-md border border-border/70 p-2">
                  <Input value={highlight.title} onChange={(e) => updateHighlight(index, { title: e.target.value })} placeholder="Title" />
                  <Input value={highlight.description} onChange={(e) => updateHighlight(index, { description: e.target.value })} placeholder="Description" />
                  <Button variant="destructive" size="sm" onClick={() => setForm((prev) => ({ ...prev, highlights: (prev.highlights || []).filter((_, idx) => idx !== index) }))}>Remove</Button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-background p-4 md:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wide">Why Choose Us</p>
                <Button variant="outline" size="sm" onClick={() => setForm((prev) => ({ ...prev, whyChooseUs: [...(prev.whyChooseUs || []), ''] }))}>Add Point</Button>
              </div>
              {(form.whyChooseUs || []).map((point, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 rounded-md border border-border/70 p-2">
                  <Input value={point} onChange={(e) => setForm((prev) => {
                    const next = [...(prev.whyChooseUs || [])]
                    next[index] = e.target.value
                    return { ...prev, whyChooseUs: next }
                  })} placeholder="Bullet point text" />
                  <Button variant="destructive" size="sm" onClick={() => setForm((prev) => ({ ...prev, whyChooseUs: (prev.whyChooseUs || []).filter((_, idx) => idx !== index) }))}>Remove</Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end">
              <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save About Page'}</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
