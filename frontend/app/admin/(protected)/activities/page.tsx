'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AdminActivity,
  createAdminActivity,
  deleteAdminActivity,
  getAdminActivities,
  updateAdminActivity,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { AlertCircle, CalendarDays, FileText, LayoutDashboard, ListChecks, Plus } from 'lucide-react'
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
  galleryImages: string
  metaTitle: string
  metaDescription: string
  videoUrl: string
  displayOrder: number
  itinerary: Array<{ day: number; title: string; description: string }>
  includes: string
  excludes: string
  tags: string
  isFeatured: boolean
  isTopPick: boolean
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
  galleryImages: '',
  metaTitle: '',
  metaDescription: '',
  videoUrl: '',
  displayOrder: 0,
  itinerary: [{ day: 1, title: '', description: '' }],
  includes: '',
  excludes: '',
  tags: '',
  isFeatured: false,
  isTopPick: false,
  isActive: true,
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
  const [activeTab, setActiveTab] = useState('overview')
  const [editorSection, setEditorSection] = useState<EditorSection>('basic')
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(false)
  const [descriptionPreviewHtml, setDescriptionPreviewHtml] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

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
      galleryImages: (item.galleryImages || []).join('\n'),
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      videoUrl: item.videoUrl || '',
      displayOrder: item.displayOrder || 0,
      itinerary: item.itinerary && item.itinerary.length > 0 ? item.itinerary.map((entry, index) => ({
        day: entry.day || index + 1,
        title: entry.title || '',
        description: entry.description || '',
      })) : [{ day: 1, title: '', description: '' }],
      includes: (item.includes || []).join('\n'),
      excludes: (item.excludes || []).join('\n'),
      tags: (item.tags || []).join(', '),
      isFeatured: !!item.isFeatured,
      isTopPick: !!item.isTopPick,
      isActive: typeof item.isActive === 'boolean' ? item.isActive : !!item.isPublished,
      description: item.description || item.shortDescription || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      image: item.image || item.mainImage || '',
    })
    setActiveTab('editor')
  }

  const startCreate = () => {
    setEditingId(null)
    setForm(initialForm)
    setActiveTab('editor')
  }

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    if (!form.title.trim() || !form.shortDescription.trim()) {
      setError('Title and short description are required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      category: form.category,
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      price: form.price || 0,
      currency: form.currency.trim() || 'USD',
      duration: form.duration.trim(),
      maxAltitude: form.maxAltitude.trim(),
      difficultyLevel: form.difficultyLevel,
      groupSizeMin: form.groupSizeMin || 1,
      groupSizeMax: form.groupSizeMax || 1,
      mainImage: form.mainImage.trim() || null,
      galleryImages: form.galleryImages.split('\n').map((item) => item.trim()).filter(Boolean),
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
      includes: form.includes.split('\n').map((item) => item.trim()).filter(Boolean),
      excludes: form.excludes.split('\n').map((item) => item.trim()).filter(Boolean),
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      isFeatured: form.isFeatured,
      isTopPick: form.isTopPick,
      isActive: form.isActive,
      description: form.shortDescription.trim(),
      date: form.date || new Date().toISOString().slice(0, 10),
      image: form.mainImage.trim() || null,
      isPublished: form.isActive,
    }

    try {
      if (editingId) {
        await updateAdminActivity(token, editingId, payload)
        setMessage('Activity updated successfully.')
      } else {
        await createAdminActivity(token, payload)
        setMessage('Activity created successfully.')
      }
      startCreate()
      setActiveTab('manage')
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

  const stats = useMemo(() => {
    const active = items.filter((item) => item.isActive || item.isPublished).length
    const hidden = items.length - active
    const tagged = items.filter((item) => item.tags && item.tags.length > 0).length
    return { total: items.length, active, hidden, tagged }
  }, [items])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground mt-1">Manage activities with destination-style structure, rich descriptions, and menu visibility controls.</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="w-4 h-4" />Overview</TabsTrigger>
          <TabsTrigger value="manage" className="gap-2"><ListChecks className="w-4 h-4" />Manage</TabsTrigger>
          <TabsTrigger value="editor" className="gap-2"><FileText className="w-4 h-4" />{editingId ? 'Edit' : 'Create'}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardDescription>Total Activities</CardDescription><CardTitle>{stats.total}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle>{stats.active}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Hidden</CardDescription><CardTitle>{stats.hidden}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>With Tags</CardDescription><CardTitle>{stats.tagged}</CardTitle></CardHeader></Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Content Tips</CardTitle>
              <CardDescription>Keep descriptions concise and include tags for better Activities menu grouping.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Use tags like <span className="font-medium text-foreground">trek, safety, community</span> to improve automatic section mapping.</p>
              <p>Add an image URL for richer cards on the Activities page.</p>
              <p>Use <span className="font-medium text-foreground">isActive</span> to hide seasonal activities without deleting them.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
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
                    <div key={item._id} className="rounded-md border border-border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {(item.date ? new Date(item.date).toLocaleDateString() : 'No date')} • {(item.isActive || item.isPublished) ? 'Active' : 'Hidden'}
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
        </TabsContent>

        <TabsContent value="editor">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Activity' : 'Create Activity'}</CardTitle>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Short Description *</label>
                    <p className="text-xs text-muted-foreground mb-1">1-2 sentences shown on activity cards</p>
                    <textarea rows={2} value={form.shortDescription} onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))} placeholder="e.g., Experience the breathtaking views and challenge of reaching Everest Base Camp on this guided trek." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Description</label>
                    <p className="text-xs text-muted-foreground mb-2">Rich content in markdown format. Use formatting buttons below.</p>
                    <div className="rounded-md border border-input overflow-hidden">
                      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/30 px-2 py-2">
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('**', '**', 'bold text')}>Bold</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('*', '*', 'italic text')}>Italic</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('## ', '', 'Heading')}>H2</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('- ', '', 'List item')}>List</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('[', '](https://)', 'Link text')}>Link</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setShowDescriptionPreview((value) => !value)}>
                          {showDescriptionPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>
                      </div>
                      <textarea
                        data-field="activity-full-description"
                        rows={10}
                        value={form.fullDescription}
                        onChange={(e) => setForm((prev) => ({ ...prev, fullDescription: e.target.value }))}
                        placeholder="Detailed description with markdown support. E.g., ## Day 1\nAcclimatization day at Kathmandu..."
                        className="w-full px-3 py-2 text-sm bg-background resize-vertical"
                      />
                    </div>

                    {showDescriptionPreview ? (
                      <div className="rounded-md border border-input bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Description Preview</p>
                        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: descriptionPreviewHtml }} />
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {editorSection === 'logistics' && (
                <div className="space-y-6">
                  {/* Pricing Section */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Pricing Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Price per Person</label>
                        <Input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))} placeholder="500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Currency Code</label>
                        <Input value={form.currency} onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))} placeholder="USD, EUR, GBP, etc." maxLength={3} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Display Order</label>
                        <Input type="number" value={form.displayOrder} onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) || 0 }))} placeholder="0" />
                      </div>
                    </div>
                  </div>

                  {/* Duration & Physical Details */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Duration & Physical Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration</label>
                        <Input value={form.duration} onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))} placeholder="e.g., 5 Days, 1 Week, Full Day" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Altitude</label>
                        <Input value={form.maxAltitude} onChange={(e) => setForm((prev) => ({ ...prev, maxAltitude: e.target.value }))} placeholder="e.g., 5,364m or 17,598 ft" />
                      </div>
                    </div>
                  </div>

                  {/* Difficulty & Group Size */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Difficulty & Group Size</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Difficulty Level</label>
                        <select value={form.difficultyLevel} onChange={(e) => setForm((prev) => ({ ...prev, difficultyLevel: e.target.value as ActivityForm['difficultyLevel'] }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          {DIFFICULTIES.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Group Size</label>
                        <Input type="number" value={form.groupSizeMin} onChange={(e) => setForm((prev) => ({ ...prev, groupSizeMin: Number(e.target.value) || 1 }))} placeholder="1" min="1" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Maximum Group Size</label>
                        <Input type="number" value={form.groupSizeMax} onChange={(e) => setForm((prev) => ({ ...prev, groupSizeMax: Number(e.target.value) || 1 }))} placeholder="10" min="1" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {editorSection === 'media' && (
                <div className="space-y-6">
                  {/* Images */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Images</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Main/Hero Image URL</label>
                      <p className="text-xs text-muted-foreground">Shown as hero image on activity detail page</p>
                      <Input value={form.mainImage} onChange={(e) => setForm((prev) => ({ ...prev, mainImage: e.target.value }))} placeholder="https://example.com/hero-image.jpg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gallery Images</label>
                      <p className="text-xs text-muted-foreground">One URL per line. Displayed in image grid on detail page</p>
                      <textarea rows={4} value={form.galleryImages} onChange={(e) => setForm((prev) => ({ ...prev, galleryImages: e.target.value }))} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                  </div>

                  {/* Video */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Video</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Video Embed URL</label>
                      <p className="text-xs text-muted-foreground">YouTube or Vimeo embed URL (e.g., https://www.youtube.com/embed/...)</p>
                      <Input value={form.videoUrl} onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ" />
                    </div>
                  </div>

                  {/* SEO */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">SEO Metadata</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meta Title</label>
                      <p className="text-xs text-muted-foreground">Appears in browser title and search results (50-60 chars)</p>
                      <Input value={form.metaTitle} onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))} placeholder="Everest Base Camp Trek - 5 Day Adventure" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meta Description</label>
                      <p className="text-xs text-muted-foreground">Search engine snippet (150-160 chars)</p>
                      <textarea rows={3} value={form.metaDescription} onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))} placeholder="Join our guided Everest Base Camp trek. Experience stunning Himalayan views, acclimatization, and expert mountaineering guides." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {editorSection === 'controls' && (
                <div className="space-y-6">
                  {/* Tags & Organization */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Organization</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags</label>
                      <p className="text-xs text-muted-foreground">Comma-separated keywords (e.g., trek, safety, community). Used to group activities in menus.</p>
                      <Input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="trek, hiking, mountain, family-friendly" />
                    </div>
                  </div>

                  {/* Visibility & Features */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-sm">Visibility & Features</h3>
                    <label className="flex items-start gap-3 p-3 rounded-md border border-input hover:bg-muted/50 cursor-pointer transition">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} className="mt-1" />
                      <div>
                        <p className="text-sm font-medium">Show Activity</p>
                        <p className="text-xs text-muted-foreground">Enable to display on the public Activities page</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 rounded-md border border-input hover:bg-muted/50 cursor-pointer transition">
                      <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} className="mt-1" />
                      <div>
                        <p className="text-sm font-medium">Mark as Featured</p>
                        <p className="text-xs text-muted-foreground">Badge activity as HOT or BESTSELLER</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 rounded-md border border-input hover:bg-muted/50 cursor-pointer transition">
                      <input type="checkbox" checked={form.isTopPick} onChange={(e) => setForm((prev) => ({ ...prev, isTopPick: e.target.checked }))} className="mt-1" />
                      <div>
                        <p className="text-sm font-medium">Mark as Top Pick</p>
                        <p className="text-xs text-muted-foreground">Highlight as a recommended activity in featured section</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {editorSection === 'itinerary' && (
                <div className="space-y-6">
                  {/* Itinerary Days */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">Itinerary</h3>
                        <p className="text-xs text-muted-foreground">Day-by-day breakdown of the activity</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {form.itinerary.map((entry, index) => (
                        <div key={index} className="rounded-md border border-input bg-background p-4 space-y-2">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-primary">Day {entry.day}</p>
                            {form.itinerary.length > 1 ? (
                              <Button type="button" size="sm" variant="destructive" onClick={() => removeItineraryDay(index)}>Remove</Button>
                            ) : null}
                          </div>
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Day Number</label>
                                <Input type="number" value={entry.day} onChange={(e) => updateItinerary(index, 'day', Number(e.target.value) || index + 1)} placeholder="1" min="1" />
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-medium text-muted-foreground">Day Title</label>
                                <Input value={entry.title} onChange={(e) => updateItinerary(index, 'title', e.target.value)} placeholder="e.g., Acclimatization at Namche Bazaar" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Description</label>
                              <textarea rows={2} value={entry.description} onChange={(e) => updateItinerary(index, 'description', e.target.value)} placeholder="Detailed description of activities, meals, accommodation, etc." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addItineraryDay} className="w-full">+ Add Itinerary Day</Button>
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm">What's Included</h3>
                      <p className="text-xs text-muted-foreground">Items included in the activity price. One item per line.</p>
                    </div>
                    <textarea rows={5} value={form.includes} onChange={(e) => setForm((prev) => ({ ...prev, includes: e.target.value }))} placeholder="Professional guide&#10;Accommodation (3 nights)&#10;All meals&#10;Transportation&#10;Permits" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>

                  {/* Exclusions */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm">What's Excluded</h3>
                      <p className="text-xs text-muted-foreground">Items NOT included in the price. One item per line.</p>
                    </div>
                    <textarea rows={5} value={form.excludes} onChange={(e) => setForm((prev) => ({ ...prev, excludes: e.target.value }))} placeholder="Personal insurance&#10;International flights&#10;Meals not mentioned&#10;Optional activities" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Activity' : 'Create Activity'}</Button>
                {editingId ? <Button variant="outline" onClick={startCreate}>Cancel</Button> : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
