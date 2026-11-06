'use client'

import { useConfirm } from '@/components/admin/use-confirm'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowDown, ArrowUp, BookOpen, ExternalLink, Eye, Heart, Loader2, Phone, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AdminPageHeader,
  EmptyState,
  Field,
  FieldGrid,
  SaveBar,
  SelectInput,
  StatusToasts,
  TextArea,
  ToggleField,
  useDirtyState,
  useUnsavedChangesWarning,
} from '@/components/admin/form-kit'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { cn } from '@/lib/utils'
import { createGuide, deleteGuide, getAdminGuides, updateGuide, type TravelGuide } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

// Icon names the public guides menu understands (lib/guide-menu.ts).
const GUIDE_ICONS = [
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Heart', icon: Heart },
  { name: 'AlertCircle', icon: AlertCircle },
  { name: 'Shield', icon: ShieldCheck },
  { name: 'Phone', icon: Phone },
  { name: 'Eye', icon: Eye },
]

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

export default function AdminTripPlanPage() {
  const [askConfirm, confirmDialog] = useConfirm()
  const [guides, setGuides] = useState<TravelGuide[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<GuideForm>(() => emptyGuide())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { dirty, markSaved, baseline } = useDirtyState(form)
  useUnsavedChangesWarning(dirty)
  const token = getAdminToken()

  const selectedGuide = useMemo(() => guides.find((guide) => guide._id === selectedId), [guides, selectedId])
  const activeCount = guides.filter((guide) => guide.isActive).length

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
        const next = toGuideForm(nextSelected)
        setForm(next)
        markSaved(next)
        setIsEditing(false)
      } else {
        setSelectedId(null)
        setForm(emptyGuide())
        markSaved(emptyGuide())
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

  const confirmLeave = async () =>
    !dirty || (await askConfirm({ title: 'Discard unsaved changes?', description: 'Your edits to this guide will be lost.', confirmLabel: 'Discard' }))

  const startNewGuide = async () => {
    if (!(await confirmLeave())) return
    const next = emptyGuide((guides.length || 0) + 1)
    setSelectedId(null)
    setForm(next)
    markSaved(next)
    setSubmitted(false)
    setIsEditing(true)
    setError('')
    setMessage('')
  }

  const selectGuide = async (guide: TravelGuide) => {
    if (guide._id === selectedId) return
    if (!(await confirmLeave())) return
    const next = toGuideForm(guide)
    setSelectedId(guide._id || null)
    setForm(next)
    markSaved(next)
    setSubmitted(false)
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

    setSubmitted(true)
    if (!payload.title || !payload.slug || !payload.content) {
      setError('Add a title and the guide content before saving.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const saved = selectedId ? await updateGuide(token, selectedId, payload) : await createGuide(token, payload)
      await refreshGuides(saved._id)
      setIsEditing(false)
      setMessage(selectedId ? 'Guide saved.' : 'Guide created.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guide')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !selectedId || !selectedGuide) return
    if (!(await askConfirm({ title: `Delete "${selectedGuide.title}"?`, description: 'The guide page will be removed from the website.' }))) return

    setDeleting(true)
    setError('')
    setMessage('')
    try {
      await deleteGuide(token, selectedId)
      await refreshGuides()
      setMessage('Guide deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guide')
    } finally {
      setDeleting(false)
    }
  }

  const onDiscard = () => {
    const saved = baseline()
    if (saved) setForm(saved)
  }

  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-6">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="Travel guides"
        description="Planning guides on the Guides page: permits, visas, gear, seasons, health and more."
        actions={
          <>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/guides" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> View page</Link>
            </Button>
            <Button onClick={() => void startNewGuide()} className="gap-2"><Plus className="h-4 w-4" /> New guide</Button>
          </>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Library */}
        <nav aria-label="Guides" className="overflow-hidden rounded-xl border border-border bg-card shadow-sm xl:sticky xl:top-20">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Guides</p>
            <p className="text-xs text-muted-foreground">{activeCount} of {guides.length} visible</p>
          </div>
          {loading ? (
            <div className="space-y-2 p-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
          ) : guides.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No guides yet.</p>
          ) : (
            <ul className="max-h-[calc(100dvh-14rem)] overflow-y-auto p-2">
              {guides.map((guide, index) => {
                const selected = guide._id === selectedId
                return (
                  <li key={guide._id || guide.slug} className="group flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void selectGuide(guide)}
                      aria-current={selected ? 'true' : undefined}
                      className={cn(
                        'flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      )}
                    >
                      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums', selected ? 'bg-primary-foreground/15' : 'bg-muted text-muted-foreground')}>{index + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{guide.title}</span>
                        <span className={cn('block truncate text-xs', selected ? 'text-primary-foreground/75' : 'text-muted-foreground')}>
                          {guide.category}{guide.isActive ? '' : ' · hidden'}
                        </span>
                      </span>
                    </button>
                    <div className={cn('flex flex-col opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100', selected && 'opacity-100')}>
                      <button type="button" disabled={index === 0 || saving || dirty} onClick={() => void moveGuide(guide, -1)} className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label={`Move ${guide.title} up`} title={dirty ? 'Save your changes first' : 'Move up'}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" disabled={index === guides.length - 1 || saving || dirty} onClick={() => void moveGuide(guide, 1)} className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label={`Move ${guide.title} down`} title={dirty ? 'Save your changes first' : 'Move down'}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </nav>

        {/* Editor */}
        {loading ? (
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
        ) : (
          <div className="min-w-0 space-y-6">
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">{selectedId ? 'Edit guide' : 'New guide'}</h2>
                  {selectedId && <Badge variant="outline" className={form.isActive ? 'border-emerald-300 text-emerald-700' : ''}>{form.isActive ? 'Visible' : 'Hidden'}</Badge>}
                </div>
                <div className="flex gap-1">
                  {selectedId && form.slug && (
                    <Button variant="ghost" size="sm" asChild className="gap-1.5">
                      <Link href={`/guides/${form.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> View</Link>
                    </Button>
                  )}
                  {selectedId && (
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-destructive" onClick={() => void handleDelete()} disabled={deleting || saving}>
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                    </Button>
                  )}
                </div>
              </div>

              <Field label="Title" required error={submitted && !form.title.trim() ? 'Add a title.' : undefined}>
                <Input
                  className="h-11 text-base font-medium"
                  value={form.title}
                  onChange={(event) => updateForm({ title: event.target.value, slug: selectedId ? form.slug : slugifyGuide(event.target.value) })}
                  placeholder="e.g. Visa information"
                />
              </Field>
              <Field label="Web address" hint={selectedId ? 'Changing this breaks existing links to the guide.' : 'Filled in from the title.'}>
                <div className="flex items-center overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20">
                  <span className="shrink-0 border-r border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground">/guides/</span>
                  <input value={form.slug} onChange={(event) => updateForm({ slug: slugifyGuide(event.target.value) })} placeholder="visa-information" style={{ border: 0, boxShadow: 'none' }} className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
                </div>
              </Field>
              <Field label="Summary" hint="Shown on the Guides page card." count={{ value: form.description, max: 160, recommended: true }}>
                <TextArea rows={2} className="min-h-0" value={form.description} onChange={(event) => updateForm({ description: event.target.value })} placeholder="What trekkers will learn from this guide." />
              </Field>
              <Field label="Guide content" required error={submitted && !form.content.trim() ? 'Write the guide content.' : undefined} hint={`${words} words`}>
                <MarkdownEditor value={form.content} onChange={(content) => updateForm({ content })} rows={18} placeholder="Write the complete guide…" />
              </Field>
            </div>

            <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
              <h3 className="text-sm font-semibold text-foreground">Placement</h3>
              <ToggleField label="Visible on the website" description="Hidden guides stay here as drafts." checked={form.isActive} onCheckedChange={(isActive) => updateForm({ isActive })} />
              <FieldGrid cols={3}>
                <Field label="Category">
                  <SelectInput value={form.category} onChange={(event) => updateForm({ category: event.target.value })}>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Region">
                  <SelectInput value={form.region} onChange={(event) => updateForm({ region: event.target.value })}>
                    {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Section" hint="Optional group label.">
                  <Input className="h-10" value={form.section} onChange={(event) => updateForm({ section: event.target.value })} placeholder="e.g. Planning" />
                </Field>
              </FieldGrid>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Menu icon</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Menu icon">
                  {GUIDE_ICONS.map(({ name, icon: Icon }) => {
                    const selected = form.icon === name
                    return (
                      <button
                        key={name}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={name}
                        title={name}
                        onClick={() => updateForm({ icon: name })}
                        className={cn('flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground')}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Some well-known guides (visa, permits, weather…) use a fixed icon automatically.</p>
              </div>
            </div>

            <SaveBar
              dirty={dirty || !selectedId}
              saving={saving}
              onSave={() => void handleSave()}
              onDiscard={dirty && selectedId ? onDiscard : undefined}
              saveLabel={selectedId ? 'Save guide' : 'Create guide'}
            />
          </div>
        )}
      </div>
    </div>
  )
}
