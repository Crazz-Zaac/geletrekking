'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUp, Bold, BookOpen, CheckCircle, ExternalLink, FileText, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Loader2, Pencil, Plus, Quote, Save, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createGuide, deleteGuide, getAdminGuides, updateGuide, type TravelGuide } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

const categories = ['Logistics', 'Health & Safety', 'Preparation', 'Guidelines', 'Legal', 'Communication', 'Safety']
const regions = ['General', 'Everest', 'Annapurna', 'Langtang', 'Mustang']

type GuideForm = {
  title: string
  slug: string
  category: string
  description: string
  section: string
  icon: string
  region: string
  content: string
  order: number
  isActive: boolean
}

const slugifyGuide = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const emptyGuide = (order = 1): GuideForm => ({
  title: '',
  slug: '',
  category: 'Preparation',
  description: '',
  section: '',
  icon: 'BookOpen',
  region: 'General',
  content: '',
  order,
  isActive: true,
})

const toGuideForm = (guide: TravelGuide): GuideForm => ({
  title: guide.title || '',
  slug: guide.slug || '',
  category: guide.category || 'Preparation',
  description: guide.description || '',
  section: guide.section || '',
  icon: guide.icon || 'BookOpen',
  region: guide.region || 'General',
  content: guide.content || '',
  order: Number(guide.order) || 0,
  isActive: typeof guide.isActive === 'boolean' ? guide.isActive : true,
})

const TextFormattingTools = ({ disabled = false, onFormat }: { disabled?: boolean; onFormat: (before: string, after?: string, placeholder?: string) => void }) => (
  <div className="rounded-md border border-border bg-background p-1.5 shadow-xs">
    <div className="flex flex-wrap items-center gap-1">
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onFormat('**', '**', 'bold text')} className="h-8 gap-1.5 px-2" title="Bold">
        <Bold className="h-4 w-4" /><span className="text-xs">Bold</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onFormat('*', '*', 'italic text')} className="h-8 gap-1.5 px-2" title="Italic">
        <Italic className="h-4 w-4" /><span className="text-xs">Italic</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onFormat('## ', '', 'Heading')} className="h-8 gap-1.5 px-2" title="Heading">
        <Heading2 className="h-4 w-4" /><span className="text-xs">Heading</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onFormat('- ', '', 'List item')} className="h-8 gap-1.5 px-2" title="Bullet list">
        <List className="h-4 w-4" /><span className="text-xs">Bullet</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onFormat('1. ', '', 'List item')} className="h-8 gap-1.5 px-2" title="Numbered list">
        <ListOrdered className="h-4 w-4" /><span className="text-xs">Numbered</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onFormat('> ', '', 'Quote')} className="h-8 gap-1.5 px-2" title="Quote">
        <Quote className="h-4 w-4" /><span className="text-xs">Quote</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onFormat('[', '](/contact)', 'link text')} className="h-8 gap-1.5 px-2" title="Link">
        <LinkIcon className="h-4 w-4" /><span className="text-xs">Link</span>
      </Button>
    </div>
  </div>
)

export default function AdminTripPlanPage() {
  const [guides, setGuides] = useState<TravelGuide[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<GuideForm>(() => emptyGuide())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const token = getAdminToken()

  const selectedGuide = useMemo(() => guides.find((guide) => guide._id === selectedId), [guides, selectedId])
  const isReadOnly = !!selectedId && !isEditing
  const activeCount = guides.filter((guide) => guide.isActive).length
  const groupedCounts = categories.map((category) => ({
    category,
    count: guides.filter((guide) => guide.category === category).length,
  })).filter((item) => item.count > 0)

  const refreshGuides = async (preferredId?: string) => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getAdminGuides(token)
      const sorted = [...data].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.title.localeCompare(b.title))
      setGuides(sorted)

      const nextSelected = sorted.find((guide) => guide._id === preferredId) || sorted[0]
      if (nextSelected) {
        setSelectedId(nextSelected._id || null)
        setForm(toGuideForm(nextSelected))
        setIsEditing(false)
      } else {
        setSelectedId(null)
        setForm(emptyGuide())
        setIsEditing(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip planning guides')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refreshGuides() }, [])

  const updateForm = (next: Partial<GuideForm>) => {
    setForm((prev) => ({ ...prev, ...next }))
    setMessage('')
    setError('')
  }

  const startNewGuide = () => {
    setSelectedId(null)
    setForm(emptyGuide((guides.length || 0) + 1))
    setIsEditing(true)
    setError('')
    setMessage('')
  }

  const selectGuide = (guide: TravelGuide) => {
    setSelectedId(guide._id || null)
    setForm(toGuideForm(guide))
    setIsEditing(false)
    setError('')
    setMessage('')
  }

  const moveGuide = async (guide: TravelGuide, direction: -1 | 1) => {
    if (!token || !guide._id) return
    const index = guides.findIndex((item) => item._id === guide._id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= guides.length) return

    const targetGuide = guides[target]
    setSaving(true)
    setError('')
    try {
      await updateGuide(token, guide._id, { order: targetGuide.order })
      if (targetGuide._id) await updateGuide(token, targetGuide._id, { order: guide.order })
      await refreshGuides(guide._id)
      setMessage('Guide order updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder guide')
    } finally {
      setSaving(false)
    }
  }

  const handleTextAreaInsert = (beforeText: string, afterText = '', placeholder = 'text') => {
    const textarea = document.getElementById('guide-content') as HTMLTextAreaElement | null
    if (isReadOnly || !textarea) return

    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const value = textarea.value
    const selectedText = value.substring(start, end)
    const content = selectedText || placeholder
    const insertion = `${beforeText}${content}${afterText}`
    const newValue = value.substring(0, start) + insertion + value.substring(end)

    updateForm({ content: newValue })

    setTimeout(() => {
      textarea.focus()
      const cursor = start + insertion.length
      textarea.setSelectionRange(cursor, cursor)
    }, 0)
  }

  const handleSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim() || slugifyGuide(form.title),
      description: form.description.trim(),
      section: form.section.trim(),
      icon: form.icon.trim() || 'BookOpen',
      content: form.content.trim(),
      order: Number(form.order) || 0,
    }

    if (!payload.title || !payload.slug || !payload.content) {
      setError('Title, slug, and content are required before saving.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const saved = selectedId ? await updateGuide(token, selectedId, payload) : await createGuide(token, payload)
      await refreshGuides(saved._id)
      setIsEditing(false)
      setMessage(selectedId ? 'Trip guide updated successfully.' : 'Trip guide created successfully.')
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guide')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !selectedId || !selectedGuide) return
    if (!window.confirm(`Delete "${selectedGuide.title}"? This cannot be undone.`)) return

    setDeleting(true)
    setError('')
    setMessage('')
    try {
      await deleteGuide(token, selectedId)
      await refreshGuides()
      setMessage('Trip guide deleted successfully.')
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guide')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Admin dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Trip Planning Guides</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage the Make Trip Plan content shown on the Guides page and guide detail pages.</p>
        </div>
        <Button variant="outline" asChild className="gap-2 lg:self-center">
          <Link href="/guides" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" /> Preview Guides
          </Link>
        </Button>
      </div>

      {error ? (
        <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="flex max-h-[calc(100vh-8rem)] min-h-0 flex-col overflow-hidden border-border shadow-xs xl:sticky xl:top-24">
          <CardHeader className="border-b border-border bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Guide Library</CardTitle>
                <CardDescription>{guides.length} total, {activeCount} visible on the website</CardDescription>
              </div>
              <Button type="button" size="sm" className="gap-1.5" onClick={startNewGuide}>
                <Plus className="h-4 w-4" /> New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading guides...
              </div>
            ) : guides.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No guides yet. Create the first guide to start building the Guides page.</div>
            ) : (
              <div className="max-h-[calc(100vh-15rem)] divide-y divide-border overflow-y-auto">
                {guides.map((guide, index) => {
                  const isSelected = guide._id === selectedId
                  return (
                    <div key={guide._id || guide.slug} className={`p-4 transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/30'}`}>
                      <button type="button" className="w-full text-left" onClick={() => selectGuide(guide)}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-xs font-semibold text-muted-foreground">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{guide.title}</p>
                              <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${guide.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                                {guide.isActive ? 'Active' : 'Hidden'}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{guide.category} · {guide.slug}</p>
                          </div>
                        </div>
                      </button>
                      <div className="mt-3 flex gap-2 pl-12">
                        <Button type="button" variant="outline" size="sm" disabled={!isEditing || selectedId !== guide._id || index === 0 || saving} onClick={() => moveGuide(guide, -1)} title="Move up">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={!isEditing || selectedId !== guide._id || index === guides.length - 1 || saving} onClick={() => moveGuide(guide, 1)} title="Move down">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border shadow-xs">
          <CardHeader className="border-b border-border bg-muted/20">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>{selectedId ? (isEditing ? 'Edit Guide' : 'Guide Details') : 'Create Guide'}</CardTitle>
                <CardDescription>{isReadOnly ? 'Select Edit to make changes to this guide.' : 'Use Markdown formatting for headings, lists, emphasis, quotes, and links.'}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {selectedId && !isEditing ? (
                  <Button type="button" size="sm" className="gap-1.5" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                ) : selectedId ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => selectedGuide && selectGuide(selectedGuide)}>
                    Cancel
                  </Button>
                ) : null}
                {groupedCounts.slice(0, 2).map((item) => (
                  <span key={item.category} className="rounded-md border border-border bg-background px-3 py-2 font-medium text-foreground">
                    {item.category}: {item.count}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-1.5 text-sm font-medium text-foreground xl:col-span-2">
                Title
                <Input
                  disabled={isReadOnly}
                  value={form.title}
                  onChange={(event) => updateForm({ title: event.target.value, slug: selectedId ? form.slug : slugifyGuide(event.target.value) })}
                  placeholder="Visa Information"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Slug
                <Input disabled={isReadOnly} value={form.slug} onChange={(event) => updateForm({ slug: slugifyGuide(event.target.value) })} placeholder="visa-information" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Category
                <select disabled={isReadOnly} value={form.category} onChange={(event) => updateForm({ category: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Section
                <Input disabled={isReadOnly} value={form.section} onChange={(event) => updateForm({ section: event.target.value })} placeholder="Planning" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Region
                <select disabled={isReadOnly} value={form.region} onChange={(event) => updateForm({ region: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
                  {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Icon name
                <Input disabled={isReadOnly} value={form.icon} onChange={(event) => updateForm({ icon: event.target.value })} placeholder="BookOpen" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Order
                <Input disabled={isReadOnly} type="number" value={form.order} onChange={(event) => updateForm({ order: Number(event.target.value) || 0 })} />
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-foreground">
                <input disabled={isReadOnly} type="checkbox" checked={form.isActive} onChange={(event) => updateForm({ isActive: event.target.checked })} className="h-4 w-4 rounded border-border" />
                Visible on website
              </label>
            </div>

            <label className="space-y-1.5 text-sm font-medium text-foreground">
              Description
              <Textarea disabled={isReadOnly} value={form.description} onChange={(event) => updateForm({ description: event.target.value })} rows={3} placeholder="Short summary shown on the Guides page" />
            </label>

            <div className="space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Guide content</label>
                  <p className="mt-1 text-xs text-muted-foreground">Markdown is supported and rendered on the public guide detail page.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-4 w-4" /> {form.content.trim().split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
              <TextFormattingTools disabled={isReadOnly} onFormat={handleTextAreaInsert} />
              <Textarea
                id="guide-content"
                disabled={isReadOnly}
                value={form.content}
                onChange={(event) => updateForm({ content: event.target.value })}
                placeholder="# Guide title\n\nWrite the complete guide here..."
                rows={18}
                className="font-mono text-sm leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                {selectedId && form.slug ? (
                  <Link href={`/guides/${form.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">
                    Preview this guide
                  </Link>
                ) : (
                  <span>New guide draft</span>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {selectedId && isEditing ? (
                  <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete} disabled={deleting || saving}>
                    {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete
                  </Button>
                ) : null}
                {!isReadOnly ? (
                  <Button type="button" onClick={handleSave} disabled={saving || deleting} size="lg" className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : selectedId ? 'Save Guide' : 'Create Guide'}
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
