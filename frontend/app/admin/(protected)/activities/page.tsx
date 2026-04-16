'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminActivity,
  createAdminActivity,
  deleteAdminActivity,
  getAdminActivities,
  updateAdminActivity,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { AlertCircle, CalendarDays, Plus, X, Trash2 } from 'lucide-react'
import { marked } from 'marked'

type ActivityForm = {
  title: string
  slug: string
  category: 'Day Tour' | 'Adrenaline' | 'Wildlife' | 'Water Sports'
  shortDescription: string
  fullDescription: string
  price: number
  currency: string
  duration: string
  maxAltitude: string
  difficultyLevel: 'Easy' | 'Moderate' | 'Difficult' | 'Technical'
  groupSizeMin: number
  groupSizeMax: number
  mainImage: string
  galleryImages: string[]
  metaTitle: string
  metaDescription: string
  videoUrl: string
  displayOrder: number
  itinerary: Array<{ day: number; title: string; description: string }>
  includes: string[]
  excludes: string[]
  tags: string
  isFeatured: boolean
  isActive: boolean
  description: string
  date: string
  image: string
}

const CATEGORIES: ActivityForm['category'][] = ['Day Tour', 'Adrenaline', 'Wildlife', 'Water Sports']
const DIFFICULTIES: ActivityForm['difficultyLevel'][] = ['Easy', 'Moderate', 'Difficult', 'Technical']

const initialForm: ActivityForm = {
  title: '',
  slug: '',
  category: 'Day Tour',
  shortDescription: '',
  fullDescription: '',
  price: 0,
  currency: 'USD',
  duration: '',
  maxAltitude: '',
  difficultyLevel: 'Easy',
  groupSizeMin: 1,
  groupSizeMax: 10,
  mainImage: '',
  galleryImages: [],
  metaTitle: '',
  metaDescription: '',
  videoUrl: '',
  displayOrder: 0,
  itinerary: [{ day: 1, title: '', description: '' }],
  includes: [],
  excludes: [],
  tags: '',
  isFeatured: false,
  isActive: false,
  description: '',
  date: '',
  image: '',
}

type EditorSection = 'basic' | 'logistics' | 'media' | 'controls' | 'itinerary'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminActivitiesPage() {
  const [items, setItems] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ActivityForm>(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editorSection, setEditorSection] = useState<EditorSection>('basic')
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(false)
  const [descriptionPreviewHtml, setDescriptionPreviewHtml] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [galleryInputValue, setGalleryInputValue] = useState('')
  const [includesInput, setIncludesInput] = useState('')
  const [excludesInput, setExcludesInput] = useState('')

  const token = getAdminToken()

  const refresh = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getAdminActivities(token)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const startEdit = (item: AdminActivity) => {
    setEditingId(item._id)
    setForm({
      title: item.title,
      slug: item.slug || slugify(item.title),
      category: item.category || 'Day Tour',
      shortDescription: item.shortDescription || item.description || '',
      fullDescription: item.fullDescription || item.description || '',
      price: item.price || 0,
      currency: item.currency || 'USD',
      duration: item.duration || '',
      maxAltitude: item.maxAltitude || '',
      difficultyLevel: item.difficultyLevel || 'Easy',
      groupSizeMin: item.groupSizeMin || 1,
      groupSizeMax: item.groupSizeMax || 10,
      mainImage: item.mainImage || item.image || '',
      galleryImages: item.galleryImages || [],
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      videoUrl: item.videoUrl || '',
      displayOrder: item.displayOrder || 0,
      itinerary: item.itinerary && item.itinerary.length > 0 ? item.itinerary.map((entry, index) => ({
        day: entry.day || index + 1,
        title: entry.title || '',
        description: entry.description || '',
      })) : [{ day: 1, title: '', description: '' }],
      includes: item.includes || [],
      excludes: item.excludes || [],
      tags: (item.tags || []).join(', '),
      isFeatured: item.isFeatured ?? false,
      isActive: typeof item.isActive === 'boolean' ? item.isActive : item.isPublished ?? false,
      description: item.description || item.shortDescription || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      image: item.image || item.mainImage || '',
    })
    setGalleryInputValue('')
    setIncludesInput('')
    setExcludesInput('')
  }

  const startCreate = () => {
    setEditingId('new')
    setForm(initialForm)
    setGalleryInputValue('')
    setIncludesInput('')
    setExcludesInput('')
    setEditorSection('basic')
  }

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    if (!form.title.trim() || !form.fullDescription.trim()) {
      setError('Title and full description are required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      category: form.category,
      shortDescription: form.title.trim(),
      fullDescription: form.fullDescription.trim(),
      price: form.price || 0,
      currency: form.currency.trim() || 'USD',
      duration: form.duration.trim(),
      maxAltitude: form.maxAltitude.trim(),
      difficultyLevel: form.difficultyLevel,
      groupSizeMin: form.groupSizeMin || 1,
      groupSizeMax: form.groupSizeMax || 1,
      mainImage: form.mainImage.trim() || null,
      galleryImages: form.galleryImages.filter((img: string) => img.trim()),
      metaTitle: form.metaTitle.trim(),
      metaDescription: form.metaDescription.trim(),
      videoUrl: form.videoUrl.trim(),
      displayOrder: form.displayOrder || 0,
      itinerary: form.itinerary
        .map((entry, index) => ({
          day: Number(entry.day) || index + 1,
          title: entry.title.trim(),
          description: entry.description.trim(),
        }))
        .filter((entry) => entry.title),
      includes: form.includes.filter((item: string) => item.trim()),
      excludes: form.excludes.filter((item: string) => item.trim()),
      tags: form.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      description: form.fullDescription.trim(),
      date: form.date || new Date().toISOString().slice(0, 10),
      image: form.mainImage.trim() || null,
      isPublished: form.isActive,
    }

    try {
      if (editingId && editingId !== 'new') {
        await updateAdminActivity(token, editingId, payload)
        setMessage('Activity updated successfully.')
      } else {
        await createAdminActivity(token, payload)
        setMessage('Activity created successfully.')
      }
      setEditingId(null)
      setForm(initialForm)
      setGalleryInputValue('')
      setIncludesInput('')
      setExcludesInput('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save activity')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item: AdminActivity) => {
    if (!token) return
    if (!window.confirm('Delete this activity?')) return

    try {
      await deleteAdminActivity(token, item._id)
      setMessage('Activity deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity')
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = search.toLowerCase().trim()
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query) ||
        (item.tags || []).some((tag) => tag.toLowerCase().includes(query))

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && (item.isActive || item.isPublished)) ||
        (statusFilter === 'inactive' && !(item.isActive || item.isPublished))

      return matchesSearch && matchesStatus
    })
  }, [items, search, statusFilter])

  const updateItinerary = (index: number, key: 'day' | 'title' | 'description', value: string | number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }))
  }

  const addItineraryDay = () => {
    setForm((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: '', description: '' }],
    }))
  }

  const removeItineraryDay = (index: number) => {
    setForm((prev) => {
      const next = prev.itinerary.filter((_, itemIndex) => itemIndex !== index)
      return {
        ...prev,
        itinerary: next.length > 0 ? next.map((item, itemIndex) => ({ ...item, day: itemIndex + 1 })) : [{ day: 1, title: '', description: '' }],
      }
    })
  }

  const addGalleryImage = () => {
    if (galleryInputValue.trim()) {
      setForm((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, galleryInputValue.trim()],
      }))
      setGalleryInputValue('')
    }
  }

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }))
  }

  const addIncludeItem = () => {
    if (includesInput.trim()) {
      setForm((prev) => ({
        ...prev,
        includes: [...prev.includes, includesInput.trim()],
      }))
      setIncludesInput('')
    }
  }

  const removeIncludeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index),
    }))
  }

  const addExcludeItem = () => {
    if (excludesInput.trim()) {
      setForm((prev) => ({
        ...prev,
        excludes: [...prev.excludes, excludesInput.trim()],
      }))
      setExcludesInput('')
    }
  }

  const removeExcludeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      excludes: prev.excludes.filter((_, i) => i !== index),
    }))
  }

  const insertMarkdown = (before: string, after = '', placeholder = '') => {
    const fieldSelector = 'activity-full-description'
    const textarea = document.querySelector<HTMLTextAreaElement>(`textarea[data-field='${fieldSelector}']`)
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = form.fullDescription || ''
    const selected = current.slice(start, end) || placeholder
    const nextValue = `${current.slice(0, start)}${before}${selected}${after}${current.slice(end)}`

    setForm((prev) => ({ ...prev, fullDescription: nextValue }))

    requestAnimationFrame(() => {
      textarea.focus()
      const selectionStart = start + before.length
      const selectionEnd = selectionStart + selected.length
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const renderDescriptionPreview = async () => {
    const html = await marked(form.fullDescription || '')
    setDescriptionPreviewHtml(html as string)
  }

  useEffect(() => {
    if (!showDescriptionPreview) return
    void renderDescriptionPreview()
  }, [showDescriptionPreview, form.fullDescription])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground mt-1">Manage and organize all activity offerings</p>
        </div>
        <Button onClick={startCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Activity
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {message ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <p className="text-emerald-700 text-sm">{message}</p>
          </CardContent>
        </Card>
      ) : null}

      {!editingId && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Library</CardTitle>
            <CardDescription>Search, filter and edit all activity entries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                placeholder="Search title, description or tags"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="md:col-span-2"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading activities...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching activities found.</p>
            ) : (
              <div className="space-y-2 max-h-[680px] overflow-auto pr-1">
                {filteredItems.map((item) => (
                  <div key={item._id} className="rounded-md border border-border p-3 hover:bg-muted/50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {(item.date ? new Date(item.date).toLocaleDateString() : 'No date')} • {(item.isActive || item.isPublished) ? 'Active' : 'Hidden'}
                          {item.isFeatured && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded font-medium">Featured</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.shortDescription || item.description}</p>
                        {(item.tags || []).length > 0 ? (
                          <p className="text-xs text-muted-foreground mt-1">Tags: {(item.tags || []).join(', ')}</p>
                        ) : null}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {editingId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId === 'new' ? 'Create Activity' : 'Edit Activity'}</CardTitle>
            <CardDescription>Structured activity editor with rich text, logistics, media, SEO, and itinerary fields.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              {[
                { key: 'basic', label: 'Basic Information' },
                { key: 'logistics', label: 'Logistics & Pricing' },
                { key: 'media', label: 'Media & SEO' },
                { key: 'controls', label: 'UI Controls' },
                { key: 'itinerary', label: 'Itinerary & Inclusion' },
              ].map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setEditorSection(section.key as EditorSection)}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    editorSection === section.key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {editorSection === 'basic' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Title *</label>
                  <Input placeholder="e.g., Everest Base Camp Trek" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL Slug</label>
                    <div className="flex gap-2">
                      <Input placeholder="everest-base-camp" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} />
                      <Button type="button" variant="outline" onClick={() => setForm((prev) => ({ ...prev, slug: slugify(prev.title) }))} className="shrink-0">Generate</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category *</label>
                    <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as ActivityForm['category'] }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Description *</label>
                  <p className="text-xs text-muted-foreground mb-2">Rich content in markdown format</p>
                  <div className="rounded-md border border-input overflow-hidden h-96 flex flex-col">
                    <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/50 px-2 py-2">
                      <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('**', '**', 'bold text')} title="Bold">B</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('*', '*', 'italic text')} title="Italic">I</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('## ', '', 'Heading')} title="Heading">H2</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('- ', '', 'List item')} title="List">List</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('[', '](https://)', 'Link text')} title="Link">Link</Button>
                      <Button type="button" size="sm" variant={showDescriptionPreview ? "default" : "ghost"} onClick={() => setShowDescriptionPreview((value) => !value)} className="ml-auto">
                        {showDescriptionPreview ? '👁️ Preview On' : '👁️ Preview Off'}
                      </Button>
                    </div>
                    <textarea
                      data-field="activity-full-description"
                      value={form.fullDescription}
                      onChange={(e) => setForm((prev) => ({ ...prev, fullDescription: e.target.value }))}
                      placeholder="Detailed description with markdown support..."
                      className="flex-1 px-3 py-2 text-sm bg-background resize-none"
                    />
                  </div>
                </div>

                {showDescriptionPreview && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preview</label>
                    <div className="rounded-md border border-input bg-background p-4 h-96 overflow-auto text-sm">
                      <div className="markdown-content prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: descriptionPreviewHtml }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {editorSection === 'logistics' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 p-5 rounded-lg border border-blue-200/50 dark:border-blue-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">💰 Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price</label>
                      <Input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))} placeholder="500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Currency</label>
                      <Input value={form.currency} onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))} placeholder="USD" maxLength={3} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Order</label>
                      <Input type="number" value={form.displayOrder} onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) || 0 }))} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/20 dark:to-amber-950/10 p-5 rounded-lg border border-amber-200/50 dark:border-amber-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">⏱️ Duration & Physical</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration</label>
                      <Input value={form.duration} onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))} placeholder="e.g., 5 Days" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Altitude</label>
                      <Input value={form.maxAltitude} onChange={(e) => setForm((prev) => ({ ...prev, maxAltitude: e.target.value }))} placeholder="e.g., 5,364m" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/20 dark:to-emerald-950/10 p-5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">👥 Difficulty & Group Size</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty</label>
                      <select value={form.difficultyLevel} onChange={(e) => setForm((prev) => ({ ...prev, difficultyLevel: e.target.value as ActivityForm['difficultyLevel'] }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {DIFFICULTIES.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Size</label>
                      <Input type="number" value={form.groupSizeMin} onChange={(e) => setForm((prev) => ({ ...prev, groupSizeMin: Number(e.target.value) || 1 }))} min="1" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Size</label>
                      <Input type="number" value={form.groupSizeMax} onChange={(e) => setForm((prev) => ({ ...prev, groupSizeMax: Number(e.target.value) || 1 }))} min="1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editorSection === 'media' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/20 dark:to-purple-950/10 p-5 rounded-lg border border-purple-200/50 dark:border-purple-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">🎬 Hero Image</h3>
                  <p className="text-xs text-muted-foreground">Appears as full-width image on activity detail page</p>
                  <Input value={form.mainImage} onChange={(e) => setForm((prev) => ({ ...prev, mainImage: e.target.value }))} placeholder="https://example.com/image.jpg" />
                  {form.mainImage && (
                    <div className="rounded-lg overflow-hidden border border-border h-48">
                      <img src={form.mainImage} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-cyan-50/50 dark:from-cyan-950/20 dark:to-cyan-950/10 p-5 rounded-lg border border-cyan-200/50 dark:border-cyan-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">🖼️ Gallery Images</h3>
                  <p className="text-xs text-muted-foreground">Additional images for the detail page</p>
                  <div className="flex gap-2">
                    <Input
                      value={galleryInputValue}
                      onChange={(e) => setGalleryInputValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { addGalleryImage(); e.preventDefault() } }}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button onClick={addGalleryImage} type="button" variant="outline">Add</Button>
                  </div>
                  {form.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {form.galleryImages.map((img, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-border h-40">
                          <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                          <button onClick={() => removeGalleryImage(index)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 p-5 rounded-lg border border-red-200/50 dark:border-red-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">🎥 Video</h3>
                  <Input value={form.videoUrl} onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/..." />
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10 p-5 rounded-lg border border-green-200/50 dark:border-green-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">🔍 SEO Metadata</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta Title (50-60 chars)</label>
                    <Input value={form.metaTitle} onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta Description (150-160 chars)</label>
                    <textarea rows={3} value={form.metaDescription} onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {editorSection === 'controls' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-50/50 dark:from-indigo-950/20 dark:to-indigo-950/10 p-5 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">🏷️ Organization</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <Input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="trek, hiking, mountain" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-violet-50/50 dark:from-violet-950/20 dark:to-violet-950/10 p-5 rounded-lg border border-violet-200/50 dark:border-violet-800/30 space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">👁️ Visibility</h3>
                  <label className="flex items-center gap-3 p-3 rounded-md border border-input hover:bg-muted/50 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked, isFeatured: e.target.checked ? prev.isFeatured : false }))} className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">Show Activity</p>
                      <p className="text-xs text-muted-foreground">Display on public Activities page</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-md border border-input transition-all ${
                    form.isActive
                      ? 'hover:bg-muted/50 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed bg-muted/30'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                      disabled={!form.isActive}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium">Mark as Featured</p>
                      <p className="text-xs text-muted-foreground">
                        {form.isActive ? 'Highlight as premium/recommended' : 'Enable "Show Activity" to use this'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {editorSection === 'itinerary' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">📅 Itinerary</h3>
                  <div className="space-y-3">
                    {form.itinerary.map((entry, index) => (
                      <div key={index} className="rounded-lg border border-border bg-gradient-to-r from-background to-muted/30 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-primary shrink-0 px-3 py-2 bg-primary/10 rounded">Day {entry.day}</span>
                          <Input value={entry.title} onChange={(e) => updateItinerary(index, 'title', e.target.value)} placeholder="Day title" className="font-medium flex-1" />
                          {form.itinerary.length > 1 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeItineraryDay(index)} className="h-8 w-8 p-0 shrink-0">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <textarea rows={5} value={entry.description} onChange={(e) => updateItinerary(index, 'description', e.target.value)} placeholder="Description..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addItineraryDay} className="w-full">+ Add Day</Button>
                  </div>
                </div>

                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 space-y-3">
                  <h3 className="font-semibold text-sm">✅ What's Included</h3>
                  <div className="space-y-2">
                    {form.includes.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border group">
                        <span className="flex-1 text-sm">{item}</span>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeIncludeItem(index)} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input value={includesInput} onChange={(e) => setIncludesInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { addIncludeItem(); e.preventDefault() } }} placeholder="Add item..." />
                      <Button type="button" variant="outline" onClick={addIncludeItem}>Add</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50/50 dark:bg-red-950/20 p-5 rounded-lg border border-red-200/50 dark:border-red-800/30 space-y-3">
                  <h3 className="font-semibold text-sm">❌ What's Excluded</h3>
                  <div className="space-y-2">
                    {form.excludes.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border group">
                        <span className="flex-1 text-sm">{item}</span>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeExcludeItem(index)} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input value={excludesInput} onChange={(e) => setExcludesInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { addExcludeItem(); e.preventDefault() } }} placeholder="Add item..." />
                      <Button type="button" variant="outline" onClick={addExcludeItem}>Add</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button onClick={onSave} disabled={saving}>{saving ? '⏳ Saving...' : editingId === 'new' ? '➕ Create' : '💾 Update'}</Button>
              <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
