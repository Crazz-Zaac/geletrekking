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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Homepage Hero</h1>
        <p className="text-sm text-muted-foreground">Update the hero image, copy, and primary CTA displayed on the homepage.</p>
      </div>

      {error ? <Card className="border-red-200 bg-red-50"><CardContent className="pt-6 text-red-700 text-sm">{error}</CardContent></Card> : null}
      {message ? <Card className="border-emerald-200 bg-emerald-50"><CardContent className="pt-6 text-emerald-700 text-sm">{message}</CardContent></Card> : null}

      {loading ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">Loading hero section...</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Hero Copy</CardTitle>
                <CardDescription>Main headline and supporting message.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    placeholder="Trek the World's\nGreatest Mountains"
                    value={form.title || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Use a line break (press Enter) to control emphasis.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Subtitle</label>
                  <textarea
                    rows={4}
                    value={form.subtitle || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Supporting message under the title"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Media & Overlay</CardTitle>
                <CardDescription>Background image and gradient overlay styling.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Background image URL</label>
                  <Input
                    placeholder="https://..."
                    value={form.backgroundImage || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, backgroundImage: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Overlay CSS</label>
                  <Input
                    placeholder="linear-gradient(...)"
                    value={form.overlay || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, overlay: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Example: linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8))</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Primary Call To Action</CardTitle>
                <CardDescription>Displayed as the main hero button.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">CTA text</label>
                  <Input
                    placeholder="Explore Treks"
                    value={form.ctaText || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, ctaText: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">CTA link</label>
                  <Input
                    placeholder="/destinations"
                    value={form.ctaLink || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, ctaLink: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving} className="min-w-32">
                {saving ? 'Saving...' : 'Save Hero'}
              </Button>
            </div>
          </div>

          <Card className="border-border h-fit xl:sticky xl:top-24">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>Preview how the hero background will appear.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border overflow-hidden">
                <div
                  className="h-60 bg-cover bg-center"
                  style={{
                    backgroundImage: `${form.overlay || ''}${form.overlay ? ', ' : ''}url('${form.backgroundImage || '/images/hero-himalaya.jpg'}')`,
                  }}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Headline</p>
                <p className="text-base font-semibold text-foreground whitespace-pre-line">{form.title || 'Hero headline goes here'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Subtitle</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{form.subtitle || 'Supporting hero message goes here.'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
