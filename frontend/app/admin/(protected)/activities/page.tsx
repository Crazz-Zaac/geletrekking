'use client'

import { useConfirm } from '@/components/admin/use-confirm'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  AdminPageHeader,
  EmptyState,
  Field,
  FieldGrid,
  FormSection,
  ImageListField,
  ImageUrlField,
  ListEditor,
  SaveBar,
  SectionNav,
  SelectInput,
  StatusToasts,
  TextArea,
  ToggleField,
  useDirtyState,
  useUnsavedChangesWarning,
} from '@/components/admin/form-kit'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { cn } from '@/lib/utils'
import {
  AdminActivity,
  AdminSiteSettings,
  createAdminActivity,
  deleteAdminActivity,
  getAdminActivities,
  getAdminSettings,
  updateAdminActivity,
  updateAdminSettings,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { Activity as ActivityIcon, ArrowLeft, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'

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
  const [askConfirm, confirmDialog] = useConfirm()
  const [items, setItems] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ActivityForm>(initialForm)
  const [siteSettings, setSiteSettings] = useState<AdminSiteSettings | null>(null)
  const [navSaving, setNavSaving] = useState(false)
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
  const [submitted, setSubmitted] = useState(false)
  const { dirty, markSaved } = useDirtyState(form)
  useUnsavedChangesWarning(!!editingId && dirty)

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
      const [data, settings] = await Promise.all([getAdminActivities(token), getAdminSettings()])
      setItems(data)
      setSiteSettings(settings)
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
    const next: ActivityForm = {
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
    }
    setForm(next)
    markSaved(next)
    setSubmitted(false)
    window.scrollTo({ top: 0 })
    setGalleryInputValue('')
    setIncludesInput('')
    setExcludesInput('')
  }

  const startCreate = () => {
    setEditingId('new')
    setForm(initialForm)
    markSaved(initialForm)
    setSubmitted(false)
    window.scrollTo({ top: 0 })
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

    setSubmitted(true)
    if (!form.title.trim() || !form.fullDescription.trim()) {
      setError('Add a title and the full description before saving.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      category: form.category,
      shortDescription: form.shortDescription.trim() || form.title.trim(),
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
        setMessage('Activity saved.')
      } else {
        await createAdminActivity(token, payload)
        setMessage('Activity created.')
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
    if (!(await askConfirm({ title: `Delete "${item.title}"?`, description: 'The activity page will be removed from the website.' }))) return

    try {
      await deleteAdminActivity(token, item._id)
      setMessage('Activity deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity')
    }
  }

  const onToggleActivitiesNav = async (nextValue: boolean) => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setNavSaving(true)
    setError('')
    setMessage('')

    try {
      const base = siteSettings || {}
      const payload: AdminSiteSettings = {
        ...base,
        navigation: {
          ...(base.navigation || {}),
          activitiesEnabled: nextValue,
        },
      }
      const updated = await updateAdminSettings(token, payload)
      setSiteSettings(updated)
      setMessage(nextValue ? 'Activities now appear in the site menu.' : 'Activities hidden from the site menu.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update navigation setting')
    } finally {
      setNavSaving(false)
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

  const closeEditor = async () => {
    if (dirty && !(await askConfirm({ title: 'Discard unsaved changes?', description: 'Your edits to this activity will be lost.', confirmLabel: 'Discard' }))) return
    setEditingId(null)
  }

  const set = <K extends keyof ActivityForm>(key: K, value: ActivityForm[K]) => setForm((prev) => ({ ...prev, [key]: value }))
  const titleError = submitted && !form.title.trim() ? 'Add a title.' : undefined
  const descriptionError = submitted && !form.fullDescription.trim() ? 'Write the full description.' : undefined
  const editingItem = editingId && editingId !== 'new' ? items.find((item) => item._id === editingId) : null
  const navEnabled = siteSettings?.navigation?.activitiesEnabled ?? true

  if (editingId) {
    return (
      <div className="space-y-6">
        {confirmDialog}
        <StatusToasts error={error} message={message} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" className="-ml-2 gap-1.5 text-muted-foreground" onClick={() => void closeEditor()}>
            <ArrowLeft className="h-4 w-4" /> All activities
          </Button>
          {editingItem?.slug && (editingItem.isActive || editingItem.isPublished) && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <a href={`/activities/${editingItem.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> View live</a>
            </Button>
          )}
        </div>
        <AdminPageHeader title={editingId === 'new' ? 'New activity' : form.title || 'Edit activity'} />

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="min-w-0 space-y-8">
            <FormSection id="basics" title="Basics" description="Name, category and the description visitors read.">
              <Field label="Title" required error={titleError}>
                <Input className="h-11 text-base font-medium" placeholder="e.g. Kathmandu Valley day tour" value={form.title} onChange={(e) => set('title', e.target.value)} />
              </Field>
              <FieldGrid>
                <Field label="Web address" hint="Leave empty to create it from the title.">
                  <div className="flex items-center overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20">
                    <span className="shrink-0 border-r border-border bg-muted px-2.5 py-2.5 text-xs text-muted-foreground">/activities/</span>
                    <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder={slugify(form.title) || 'activity-name'} style={{ border: 0, boxShadow: 'none' }} className="h-10 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none" />
                  </div>
                </Field>
                <Field label="Category" required>
                  <SelectInput value={form.category} onChange={(e) => set('category', e.target.value as ActivityForm['category'])}>
                    {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </SelectInput>
                </Field>
              </FieldGrid>
              <Field label="Short description" hint="One sentence for the activity card." count={{ value: form.shortDescription, max: 140, recommended: true }}>
                <TextArea rows={2} className="min-h-0" placeholder="e.g. Explore three UNESCO heritage sites in one day with a local guide." value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
              </Field>
              <Field label="Full description" required error={descriptionError}>
                <MarkdownEditor value={form.fullDescription} onChange={(value) => set('fullDescription', value)} rows={12} placeholder="Describe the experience, highlights and what to expect…" />
              </Field>
            </FormSection>

            <FormSection id="logistics" title="Price & logistics" description="Shown in the activity's key facts.">
              <FieldGrid cols={3}>
                <Field label="Price">
                  <div className="flex">
                    <input value={form.currency} onChange={(e) => set('currency', e.target.value.toUpperCase().slice(0, 3))} aria-label="Currency" className="h-10 w-16 rounded-l-lg rounded-r-none border border-r-0 border-input bg-muted px-2 text-center text-sm" />
                    <Input type="number" min={0} inputMode="decimal" className="h-10 rounded-l-none" value={form.price || ''} placeholder="0" onChange={(e) => set('price', Number(e.target.value) || 0)} />
                  </div>
                </Field>
                <Field label="Duration">
                  <Input className="h-10" placeholder="e.g. 6 hours" value={form.duration} onChange={(e) => set('duration', e.target.value)} />
                </Field>
                <Field label="Max altitude">
                  <Input className="h-10" placeholder="e.g. 2,175 m" value={form.maxAltitude} onChange={(e) => set('maxAltitude', e.target.value)} />
                </Field>
                <Field label="Difficulty">
                  <SelectInput value={form.difficultyLevel} onChange={(e) => set('difficultyLevel', e.target.value as ActivityForm['difficultyLevel'])}>
                    {DIFFICULTIES.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Group size" error={form.groupSizeMin > form.groupSizeMax ? 'Minimum is larger than maximum.' : undefined}>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} className="h-10" aria-label="Minimum group size" value={form.groupSizeMin} onChange={(e) => set('groupSizeMin', Number(e.target.value) || 1)} />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input type="number" min={1} className="h-10" aria-label="Maximum group size" value={form.groupSizeMax} onChange={(e) => set('groupSizeMax', Number(e.target.value) || 1)} />
                  </div>
                </Field>
                <Field label="Sort order" hint="Lower numbers appear first.">
                  <Input type="number" className="h-10" value={form.displayOrder} onChange={(e) => set('displayOrder', Number(e.target.value) || 0)} />
                </Field>
              </FieldGrid>
            </FormSection>

            <FormSection
              id="itinerary"
              title="Itinerary"
              description="Optional day-by-day or step-by-step plan. Steps without a title are skipped."
            >
              <ol className="space-y-3">
                {form.itinerary.map((entry, index) => (
                  <li key={index} className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Day {entry.day}</span>
                      <Input className="h-10 flex-1 font-medium" placeholder="Title of this day / step" value={entry.title} onChange={(e) => updateItinerary(index, 'title', e.target.value)} aria-label={`Day ${entry.day} title`} />
                      {form.itinerary.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeItineraryDay(index)} aria-label={`Remove day ${entry.day}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <TextArea rows={3} placeholder="What happens on this day…" value={entry.description} onChange={(e) => updateItinerary(index, 'description', e.target.value)} aria-label={`Day ${entry.day} description`} />
                  </li>
                ))}
              </ol>
              <Button type="button" variant="outline" onClick={addItineraryDay} className="w-full gap-1.5"><Plus className="h-4 w-4" /> Add day</Button>
            </FormSection>

            <FormSection id="includes" title="Included / excluded" description="Paste a list to add several items at once.">
              <Field label="What's included">
                <ListEditor items={form.includes} onChange={(includes) => set('includes', includes)} placeholder="e.g. Licensed guide" emptyText="Nothing listed yet." />
              </Field>
              <Field label="What's not included">
                <ListEditor items={form.excludes} onChange={(excludes) => set('excludes', excludes)} placeholder="e.g. Entrance fees" emptyText="Nothing listed yet." />
              </Field>
            </FormSection>

            <FormSection id="media" title="Photos & video">
              <ImageUrlField label="Main photo" value={form.mainImage} onChange={(value) => set('mainImage', value)} hint="Shown at the top of the activity page and on its card." />
              <Field label="More photos">
                <ImageListField images={form.galleryImages} onChange={(galleryImages) => set('galleryImages', galleryImages)} />
              </Field>
              <Field label="YouTube video" hint="Embed link, e.g. https://www.youtube.com/embed/…">
                <Input className="h-10" type="url" placeholder="https://www.youtube.com/embed/…" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
              </Field>
            </FormSection>

            <FormSection id="seo" title="Search engines" description="How the page appears in Google. Leave empty to use the title and short description.">
              <Field label="Search title" count={{ value: form.metaTitle, max: 60, recommended: true }}>
                <Input className="h-10" placeholder={form.title} value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} />
              </Field>
              <Field label="Search description" count={{ value: form.metaDescription, max: 160, recommended: true }}>
                <TextArea rows={2} className="min-h-0" placeholder={form.shortDescription} value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
              </Field>
              <div className="space-y-0.5 rounded-lg border border-border bg-background p-3">
                <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">geletrekking.com › activities › {form.slug || slugify(form.title) || '…'}</p>
                <p className="line-clamp-1 text-base text-[#1a0dab] dark:text-[#8ab4f8]">{form.metaTitle || form.title || 'Activity title'}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{form.metaDescription || form.shortDescription || 'Description shown in search results.'}</p>
              </div>
              <Field label="Tags" hint="Separate with commas; used for search and filters.">
                <Input className="h-10" placeholder="culture, heritage, kathmandu" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
              </Field>
            </FormSection>

            <FormSection id="visibility" title="Visibility">
              <ToggleField
                label="Show on the website"
                description="Hidden activities stay here as drafts."
                checked={form.isActive}
                onCheckedChange={(isActive) => setForm((prev) => ({ ...prev, isActive, isFeatured: isActive ? prev.isFeatured : false }))}
              />
              <ToggleField
                label="Featured"
                description={form.isActive ? 'Highlighted in the Top picks section.' : 'Show the activity first to feature it.'}
                checked={form.isFeatured}
                disabled={!form.isActive}
                onCheckedChange={(isFeatured) => set('isFeatured', isFeatured)}
              />
            </FormSection>
          </div>

          <div className="xl:sticky xl:top-20 xl:self-start">
            <SectionNav
              sections={[
                { id: 'basics', label: 'Basics', invalid: !!(titleError || descriptionError) },
                { id: 'logistics', label: 'Price & logistics' },
                { id: 'itinerary', label: 'Itinerary' },
                { id: 'includes', label: 'Included' },
                { id: 'media', label: 'Photos & video' },
                { id: 'seo', label: 'Search engines' },
                { id: 'visibility', label: 'Visibility' },
              ]}
            />
          </div>
        </div>

        <SaveBar
          dirty={dirty || editingId === 'new'}
          saving={saving}
          onSave={() => void onSave()}
          onDiscard={() => void closeEditor()}
          discardLabel="Cancel"
          saveLabel={editingId === 'new' ? 'Create activity' : 'Save activity'}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="Activities"
        description="Day tours and add-on experiences on the Activities page."
        actions={<Button onClick={startCreate} className="gap-2"><Plus className="h-4 w-4" /> New activity</Button>}
      />

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div>
          <p className="text-sm font-medium text-foreground">Show “Activities” in the site menu</p>
          <p className="text-xs text-muted-foreground">Turn off while you have no activities to offer.</p>
        </div>
        <Switch checked={navEnabled} disabled={navSaving || !siteSettings} onCheckedChange={(value) => void onToggleActivitiesNav(value)} aria-label="Show Activities in the site menu" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Filter activities">
          {(['all', 'active', 'inactive'] as const).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={statusFilter === key} onClick={() => setStatusFilter(key)} className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors', statusFilter === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {key === 'all' ? 'All' : key === 'active' ? 'Visible' : 'Hidden'}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" className="h-10 pl-9" placeholder="Search activities…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search activities" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<ActivityIcon className="h-5 w-5" />} title="No activities yet" description="Add day tours or experiences trekkers can book alongside a trek." action={<Button onClick={startCreate} className="gap-2"><Plus className="h-4 w-4" /> New activity</Button>} />
      ) : filteredItems.length === 0 ? (
        <EmptyState icon={<Search className="h-5 w-5" />} title="No matching activities" />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {filteredItems.map((item) => {
            const visible = !!(item.isActive || item.isPublished)
            const image = item.mainImage || item.image
            return (
              <li key={item._id} className="flex items-center gap-4 p-3 transition-colors hover:bg-muted/40 sm:p-4">
                <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {image ? <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ActivityIcon className="h-5 w-5" /></div>}
                </div>
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => startEdit(item)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">{item.title}</p>
                    <Badge variant="outline" className={visible ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : ''}>{visible ? 'Visible' : 'Hidden'}</Badge>
                    {item.isFeatured && <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700"><Star className="h-3 w-3" /> Featured</Badge>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {[item.category, item.duration, item.price ? `${item.currency || 'USD'} ${item.price}` : null].filter(Boolean).join(' · ')}
                  </p>
                </button>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(item)} aria-label={`Edit ${item.title}`}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void onDelete(item)} aria-label={`Delete ${item.title}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
