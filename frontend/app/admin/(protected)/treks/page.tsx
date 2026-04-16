'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AdminTrek,
  createAdminTrek,
  deleteAdminTrek,
  getAdminTreks,
  updateAdminTrek,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type TabKey = 'basic' | 'details' | 'itinerary' | 'includes' | 'faqs' | 'offers' | 'media'

type ItineraryDay = {
  day: number
  title: string
  description: string
  altitude: string
  distance: string
  accommodation: string
}

type FaqItem = {
  question: string
  answer: string
}

type TrekForm = {
  name: string
  slug: string
  description: string
  region: string
  best_season: string
  season_tag: string
  image_url: string
  gallery_images: string
  trek_map_embed_url: string
  duration_days: number
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  max_altitude_meters: number
  group_size_min: number
  group_size_max: number
  tour_type: string
  transportation: string
  start_point: string
  end_point: string
  price_usd: number
  price_gbp: number
  // coordinates and location name for live weather fetching
  latitude: number
  longitude: number
  location_name: string
  highlights: string
  includes: string
  excludes: string
  itinerary: ItineraryDay[]
  faqs: FaqItem[]
  has_offer: boolean
  offer_type: string
  offer_description: string
  discounted_price_usd: number
  discounted_price_gbp: number
  offer_valid_from: string
  offer_valid_to: string
  is_optional: boolean
  is_active: boolean
  is_featured: boolean
}

const emptyDay = (): ItineraryDay => ({
  day: 1,
  title: '',
  description: '',
  altitude: '',
  distance: '',
  accommodation: '',
})

const emptyFaq = (): FaqItem => ({ question: '', answer: '' })

const initialForm: TrekForm = {
  name: '',
  slug: '',
  description: '',
  region: '',
  best_season: '',
  season_tag: '',
  image_url: '',
  gallery_images: '',
  trek_map_embed_url: '',
  duration_days: 10,
  difficulty: 'Moderate',
  max_altitude_meters: 0,
  group_size_min: 1,
  group_size_max: 15,
  tour_type: '',
  transportation: '',
  start_point: '',
  end_point: '',
  price_usd: 0,
  price_gbp: 0,
  latitude: 0,
  longitude: 0,
  location_name: '',
  highlights: '',
  includes: '',
  excludes: '',
  itinerary: [emptyDay()],
  faqs: [emptyFaq()],
  has_offer: false,
  offer_type: '',
  offer_description: '',
  discounted_price_usd: 0,
  discounted_price_gbp: 0,
  offer_valid_from: '',
  offer_valid_to: '',
  is_optional: false,
  is_active: true,
  is_featured: false,
}

function formToPayload(form: TrekForm): Partial<AdminTrek> {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim(),
    region: form.region.trim() || undefined,
    best_season: form.best_season.trim() || undefined,
    season_tag: form.season_tag.trim() || undefined,
    image_url: form.image_url.trim() || undefined,
    gallery_images: form.gallery_images
      ? form.gallery_images.split('\n').map((s) => s.trim()).filter(Boolean)
      : [],
    trek_map_embed_url: form.trek_map_embed_url.trim() || undefined,
    duration_days: form.duration_days,
    difficulty: form.difficulty,
    max_altitude_meters: form.max_altitude_meters || undefined,
    group_size_min: form.group_size_min,
    group_size_max: form.group_size_max,
    tour_type: form.tour_type.trim() || undefined,
    transportation: form.transportation.trim() || undefined,
    start_point: form.start_point.trim() || undefined,
    end_point: form.end_point.trim() || undefined,
    price_usd: form.price_usd,
    price_gbp: form.price_gbp,
    // only send coordinates if both are filled in
    latitude: form.latitude || undefined,
    longitude: form.longitude || undefined,
    location_name: form.location_name.trim() || undefined,
    highlights: form.highlights
      ? form.highlights.split('\n').map((s) => s.trim()).filter(Boolean)
      : [],
    includes: form.includes
      ? form.includes.split('\n').map((s) => s.trim()).filter(Boolean)
      : [],
    excludes: form.excludes
      ? form.excludes.split('\n').map((s) => s.trim()).filter(Boolean)
      : [],
    itinerary: form.itinerary.filter((d) => d.title.trim()),
    faqs: form.faqs.filter((f) => f.question.trim() && f.answer.trim()),
    has_offer: form.has_offer,
    offer_type: form.offer_type.trim() || undefined,
    offer_title: form.offer_type.trim() || undefined,
    offer_description: form.offer_description.trim() || undefined,
    discounted_price_usd: form.discounted_price_usd || undefined,
    discounted_price_gbp: form.discounted_price_gbp || undefined,
    offer_valid_from: form.offer_valid_from || undefined,
    offer_valid_to: form.offer_valid_to || undefined,
    is_optional: form.is_optional,
    is_active: form.is_active,
    is_featured: form.is_featured,
  }
}

function trekToForm(item: AdminTrek): TrekForm {
  return {
    name: item.name || '',
    slug: item.slug || '',
    description: item.description || '',
    region: item.region || '',
    best_season: item.best_season || '',
    season_tag: item.season_tag || '',
    image_url: item.image_url || '',
    gallery_images: (item.gallery_images || []).join('\n'),
    trek_map_embed_url: item.trek_map_embed_url || '',
    duration_days: item.duration_days || 10,
    difficulty: item.difficulty || 'Moderate',
    max_altitude_meters: item.max_altitude_meters || 0,
    group_size_min: item.group_size_min || 1,
    group_size_max: item.group_size_max || 15,
    tour_type: item.tour_type || '',
    transportation: item.transportation || '',
    start_point: item.start_point || '',
    end_point: item.end_point || '',
    price_usd: item.price_usd || 0,
    price_gbp: item.price_gbp || 0,
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    location_name: item.location_name || '',
    highlights: (item.highlights || []).join('\n'),
    includes: (item.includes || []).join('\n'),
    excludes: (item.excludes || []).join('\n'),
    itinerary:
      item.itinerary && item.itinerary.length > 0
        ? item.itinerary.map((d) => ({
            day: d.day,
            title: d.title,
            description: d.description || '',
            altitude: d.altitude || '',
            distance: d.distance || '',
            accommodation: d.accommodation || '',
          }))
        : [emptyDay()],
    faqs:
      item.faqs && item.faqs.length > 0
        ? item.faqs.map((f) => ({ question: f.question, answer: f.answer }))
        : [emptyFaq()],
    has_offer: item.has_offer || false,
    offer_type: item.offer_type || item.offer_title || '',
    offer_description: item.offer_description || '',
    discounted_price_usd: item.discounted_price_usd || 0,
    discounted_price_gbp: item.discounted_price_gbp || 0,
    offer_valid_from: item.offer_valid_from ? item.offer_valid_from.slice(0, 10) : '',
    offer_valid_to: item.offer_valid_to ? item.offer_valid_to.slice(0, 10) : '',
    is_optional: item.is_optional ?? false,
    is_active: item.is_active ?? true,
    is_featured: item.is_featured ?? false,
  }
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'details', label: 'Trek Details' },
  { key: 'media', label: 'Media' },
  { key: 'itinerary', label: 'Itinerary' },
  { key: 'includes', label: 'Includes / Excludes' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'offers', label: 'Offers' },
]

export default function AdminTreksPage() {
  const [items, setItems] = useState<AdminTrek[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TrekForm>(initialForm)
  const [activeTab, setActiveTab] = useState<TabKey>('basic')
  const [showForm, setShowForm] = useState(false)

  const token = getAdminToken()

  const stats = useMemo(() => {
    const total = items.length
    const destinations = items.filter((item) => !item.is_optional).length
    const optional = items.filter((item) => !!item.is_optional).length
    const active = items.filter((item) => !!item.is_active).length
    return { total, destinations, optional, active }
  }, [items])

  const refresh = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await getAdminTreks(token)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load treks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onEdit = (item: AdminTrek) => {
    setEditingId(item._id)
    setForm(trekToForm(item))
    setActiveTab('basic')
    setShowForm(true)
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onReset = () => {
    setEditingId(null)
    setForm(initialForm)
    setActiveTab('basic')
    setShowForm(false)
  }

  const onSave = async () => {
    if (!token) { setError('Missing admin token. Please login again.'); return }
    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and description are required.')
      setActiveTab('basic')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = formToPayload(form)
      if (editingId) {
        await updateAdminTrek(token, editingId, payload)
        setMessage('Trek updated successfully.')
      } else {
        await createAdminTrek(token, payload)
        setMessage('Trek created successfully.')
      }
      onReset()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trek')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item: AdminTrek) => {
    if (!token) { setError('Missing admin token. Please login again.'); return }
    const confirmed = window.confirm(`Delete trek "${item.name}"?`)
    if (!confirmed) return
    try {
      await deleteAdminTrek(token, item._id)
      setMessage('Trek deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trek')
    }
  }

  const updateDay = (index: number, field: keyof ItineraryDay, value: string | number) => {
    setForm((prev) => {
      const updated = [...prev.itinerary]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, itinerary: updated }
    })
  }

  const addDay = () => {
    setForm((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { ...emptyDay(), day: prev.itinerary.length + 1 }],
    }))
  }

  const removeDay = (index: number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, i) => i !== index)
        .map((d, i) => ({ ...d, day: i + 1 })),
    }))
  }

  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    setForm((prev) => {
      const updated = [...prev.faqs]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, faqs: updated }
    })
  }

  const addFaq = () => setForm((prev) => ({ ...prev, faqs: [...prev.faqs, emptyFaq()] }))

  const removeFaq = (index: number) => {
    setForm((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }))
  }

  const textarea = (
    placeholder: string,
    value: string,
    onChange: (v: string) => void,
    rows = 3
  ) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
    />
  )

  const field = (label: string, input: React.ReactNode) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {input}
    </div>
  )


  // Text editing utilities for textareas
  const insertMarkdown = (fieldName: 'dayDescription' | 'includes' | 'excludes' | 'dayAltitude', index: number | null, before: string, after: string = '', placeholder: string = '') => {
    let currentValue = ''
    let setter: (v: string) => void = () => {}

    if (fieldName === 'dayDescription' && index !== null) {
      currentValue = form.itinerary[index]?.description || ''
      setter = (v) => updateDay(index, 'description', v)
    } else if (fieldName === 'includes') {
      currentValue = form.includes
      setter = (v) => setForm((p) => ({ ...p, includes: v }))
    } else if (fieldName === 'excludes') {
      currentValue = form.excludes
      setter = (v) => setForm((p) => ({ ...p, excludes: v }))
    }

    const textarea = document.querySelector(`textarea[data-field="${fieldName}-${index}"]`) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = currentValue.substring(start, end) || placeholder
    const newValue = currentValue.substring(0, start) + before + selectedText + after + currentValue.substring(end)

    setter(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length + selectedText.length, start + before.length + selectedText.length)
    }, 0)
  }

  const TextToolbar = ({ fieldName, index }: { fieldName: 'dayDescription' | 'includes' | 'excludes', index?: number }) => (
    <div className="border border-input rounded-t-md bg-muted/30 p-2 flex flex-wrap gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => insertMarkdown(fieldName, index ?? null, '**', '**', 'bold text')}
        className="h-7 w-7 p-0"
        title="Bold"
      >
        <strong>B</strong>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => insertMarkdown(fieldName, index ?? null, '_', '_', 'italic text')}
        className="h-7 w-7 p-0"
        title="Italic"
      >
        <em>I</em>
      </Button>
      <div className="w-px bg-border mx-1" />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => insertMarkdown(fieldName, index ?? null, '- ', '', 'List item')}
        className="h-7 px-2 text-xs"
        title="Bullet List"
      >
        • List
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => insertMarkdown(fieldName, index ?? null, '1. ', '', 'Item')}
        className="h-7 px-2 text-xs"
        title="Numbered List"
      >
        1. List
      </Button>
    </div>
  )


  return (
    <div className="space-y-6">

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Destinations', value: stats.destinations },
          { label: 'Optional', value: stats.optional },
          { label: 'Active', value: stats.active },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      {!showForm && (
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(initialForm) }}>
          + New Trek
        </Button>
      )}

      {showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Trek' : 'Create Trek'}</CardTitle>
            <CardDescription>
              Fill in all tabs before saving. Only name and description are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* basic info tab */}
            {activeTab === 'basic' && (
              <div className="space-y-3">
                {field('Trek name', (
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                ))}
                {field('Slug — leave empty to auto-generate from name', (
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  />
                ))}
                {field('Description', textarea('Write a full description of the trek', form.description, (v) => setForm((p) => ({ ...p, description: v })), 5))}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {field('Region', (
                    <Input
                      placeholder="e.g. Everest, Annapurna, Langtang"
                      value={form.region}
                      onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                    />
                  ))}
                  {field('Best season', (
                    <Input
                      placeholder="e.g. Oct–Nov, Mar–May"
                      value={form.best_season}
                      onChange={(e) => setForm((p) => ({ ...p, best_season: e.target.value }))}
                    />
                  ))}
                  {field('Season tag', (
                    <Input
                      placeholder="e.g. Autumn, Spring"
                      value={form.season_tag}
                      onChange={(e) => setForm((p) => ({ ...p, season_tag: e.target.value }))}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
                    Active — visible to users
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_optional} onChange={(e) => setForm((p) => ({ ...p, is_optional: e.target.checked }))} />
                    Add to activities
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} />
                    Featured on homepage
                  </label>
                </div>
              </div>
            )}

            {/* trek details tab */}
            {activeTab === 'details' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {field('Duration (days)', (
                    <Input
                      type="number"
                      value={form.duration_days}
                      onChange={(e) => setForm((p) => ({ ...p, duration_days: Number(e.target.value) || 0 }))}
                    />
                  ))}
                  {field('Max altitude (meters)', (
                    <Input
                      type="number"
                      value={form.max_altitude_meters}
                      onChange={(e) => setForm((p) => ({ ...p, max_altitude_meters: Number(e.target.value) || 0 }))}
                    />
                  ))}
                  {field('Difficulty', (
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value as TrekForm['difficulty'] }))}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Hard">Hard</option>
                    </select>
                  ))}
                  {field('Min group size', (
                    <Input
                      type="number"
                      value={form.group_size_min}
                      onChange={(e) => setForm((p) => ({ ...p, group_size_min: Number(e.target.value) || 1 }))}
                    />
                  ))}
                  {field('Max group size', (
                    <Input
                      type="number"
                      value={form.group_size_max}
                      onChange={(e) => setForm((p) => ({ ...p, group_size_max: Number(e.target.value) || 15 }))}
                    />
                  ))}
                  {field('Price USD', (
                    <Input
                      type="number"
                      value={form.price_usd}
                      onChange={(e) => setForm((p) => ({ ...p, price_usd: Number(e.target.value) || 0 }))}
                    />
                  ))}
                  {field('Price GBP', (
                    <Input
                      type="number"
                      value={form.price_gbp}
                      onChange={(e) => setForm((p) => ({ ...p, price_gbp: Number(e.target.value) || 0 }))}
                    />
                  ))}
                  {field('Tour type', (
                    <Input
                      placeholder="e.g. Private, Group, Small Group"
                      value={form.tour_type}
                      onChange={(e) => setForm((p) => ({ ...p, tour_type: e.target.value }))}
                    />
                  ))}
                  {field('Transportation', (
                    <Input
                      placeholder="e.g. Fly Kathmandu–Lukla"
                      value={form.transportation}
                      onChange={(e) => setForm((p) => ({ ...p, transportation: e.target.value }))}
                    />
                  ))}
                  {field('Start point', (
                    <Input
                      placeholder="e.g. Kathmandu"
                      value={form.start_point}
                      onChange={(e) => setForm((p) => ({ ...p, start_point: e.target.value }))}
                    />
                  ))}
                  {field('End point', (
                    <Input
                      placeholder="e.g. Lukla"
                      value={form.end_point}
                      onChange={(e) => setForm((p) => ({ ...p, end_point: e.target.value }))}
                    />
                  ))}
                </div>

                {/* weather coordinates section */}
                <p className="text-sm font-medium pt-2">
                  Weather location — used to show live weather on the trek detail page
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {field('Location name', (
                    <Input
                      placeholder="e.g. Namche Bazaar"
                      value={form.location_name}
                      onChange={(e) => setForm((p) => ({ ...p, location_name: e.target.value }))}
                    />
                  ))}
                  {field('Latitude', (
                    <Input
                      type="number"
                      placeholder="e.g. 27.8069"
                      value={form.latitude || ''}
                      onChange={(e) => setForm((p) => ({ ...p, latitude: Number(e.target.value) || 0 }))}
                    />
                  ))}
                  {field('Longitude', (
                    <Input
                      type="number"
                      placeholder="e.g. 86.7144"
                      value={form.longitude || ''}
                      onChange={(e) => setForm((p) => ({ ...p, longitude: Number(e.target.value) || 0 }))}
                    />
                  ))}
                </div>

                {field('Highlights — one per line', textarea('e.g. Stand at Everest Base Camp', form.highlights, (v) => setForm((p) => ({ ...p, highlights: v })), 4))}
              </div>
            )}

            {/* media tab */}
            {activeTab === 'media' && (
              <div className="space-y-3">
                {field('Main cover image URL', (
                  <Input
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                  />
                ))}
                {field('Gallery image URLs — one per line', textarea('https://image1.jpg\nhttps://image2.jpg', form.gallery_images, (v) => setForm((p) => ({ ...p, gallery_images: v })), 5))}
                {field('Google Maps embed URL', (
                  <Input
                    placeholder="https://maps.google.com/maps?..."
                    value={form.trek_map_embed_url}
                    onChange={(e) => setForm((p) => ({ ...p, trek_map_embed_url: e.target.value }))}
                  />
                ))}
              </div>
            )}

            {/* itinerary tab */}
            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                {form.itinerary.map((day, index) => (
                  <div key={index} className="rounded-md border border-border p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary shrink-0 px-3 py-2 bg-primary/10 rounded">Day {day.day}</span>
                      <Input
                        placeholder="e.g. Arrive Kathmandu"
                        value={day.title}
                        onChange={(e) => updateDay(index, 'title', e.target.value)}
                        className="flex-1"
                      />
                      {form.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDay(index)}
                          className="text-xs text-red-500 hover:text-red-700 shrink-0"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {field('Day description', (
                      <>
                        <TextToolbar fieldName="dayDescription" index={index} />
                        <textarea
                          data-field={`dayDescription-${index}`}
                          placeholder="What happens on this day"
                          value={day.description}
                          onChange={(e) => updateDay(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm resize-vertical"
                        />
                      </>
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {field('Altitude', (
                        <Input
                          placeholder="e.g. 3440m"
                          value={day.altitude}
                          onChange={(e) => updateDay(index, 'altitude', e.target.value)}
                        />
                      ))}
                      {field('Distance', (
                        <Input
                          placeholder="e.g. 12 km"
                          value={day.distance}
                          onChange={(e) => updateDay(index, 'distance', e.target.value)}
                        />
                      ))}
                      {field('Accommodation', (
                        <Input
                          placeholder="e.g. Teahouse in Namche"
                          value={day.accommodation}
                          onChange={(e) => updateDay(index, 'accommodation', e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addDay}>
                  + Add Day
                </Button>
              </div>
            )}

            {/* includes and excludes tab */}
            {activeTab === 'includes' && (
              <div className="space-y-4">
                {field('What is included in the price — one item per line', (
                <>
                  <TextToolbar fieldName="includes" />
                  <textarea
                    data-field="includes-null"
                    placeholder="e.g. All airport transfers"
                    value={form.includes}
                    onChange={(e) => setForm((p) => ({ ...p, includes: e.target.value }))}
                    rows={6}
                    className="w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm resize-vertical"
                  />
                </>
              ))}
                {field('What the trekker pays separately — one item per line', (
                <>
                  <TextToolbar fieldName="excludes" />
                  <textarea
                    data-field="excludes-null"
                    placeholder="e.g. International flights"
                    value={form.excludes}
                    onChange={(e) => setForm((p) => ({ ...p, excludes: e.target.value }))}
                    rows={6}
                    className="w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm resize-vertical"
                  />
                </>
              ))}
              </div>
            )}

            {/* faqs tab */}
            {activeTab === 'faqs' && (
              <div className="space-y-4">
                {form.faqs.map((faq, index) => (
                  <div key={index} className="rounded-md border border-border p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary shrink-0 px-3 py-2 bg-primary/10 rounded">FAQ {index + 1}</span>
                      <Input
                        placeholder="e.g. Do I need prior experience?"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        className="flex-1"
                      />
                      {form.faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="text-xs text-red-500 hover:text-red-700 shrink-0"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {field('Answer', textarea('Write the answer here', faq.answer, (v) => updateFaq(index, 'answer', v), 3))}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFaq}>
                  + Add FAQ
                </Button>
              </div>
            )}

            {/* offers tab */}
            {activeTab === 'offers' && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.has_offer}
                    onChange={(e) => setForm((p) => ({ ...p, has_offer: e.target.checked }))}
                  />
                  This trek has an active offer or discount
                </label>
                {form.has_offer && (
                  <div className="space-y-3">
                    {field('Offer type', (
                      <Input
                        placeholder="e.g. Summer Deal, Christmas Discount"
                        value={form.offer_type}
                        onChange={(e) => setForm((p) => ({ ...p, offer_type: e.target.value }))}
                      />
                    ))}
                    {field('Offer description', textarea('Describe the offer', form.offer_description, (v) => setForm((p) => ({ ...p, offer_description: v })), 3))}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {field('Discounted price USD', (
                        <Input
                          type="number"
                          value={form.discounted_price_usd}
                          onChange={(e) => setForm((p) => ({ ...p, discounted_price_usd: Number(e.target.value) || 0 }))}
                        />
                      ))}
                      {field('Discounted price GBP', (
                        <Input
                          type="number"
                          value={form.discounted_price_gbp}
                          onChange={(e) => setForm((p) => ({ ...p, discounted_price_gbp: Number(e.target.value) || 0 }))}
                        />
                      ))}
                      {field('Offer valid from', (
                        <Input
                          type="date"
                          value={form.offer_valid_from}
                          onChange={(e) => setForm((p) => ({ ...p, offer_valid_from: e.target.value }))}
                        />
                      ))}
                      {field('Offer valid until', (
                        <Input
                          type="date"
                          value={form.offer_valid_to}
                          onChange={(e) => setForm((p) => ({ ...p, offer_valid_to: e.target.value }))}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button onClick={onSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Trek' : 'Create Trek'}
              </Button>
              <Button variant="outline" onClick={onReset}>Cancel</Button>
            </div>

          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>All Treks</CardTitle>
            <CardDescription>Click Edit to load a trek into the form above.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading treks...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No treks yet.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-auto pr-1">
                {items.map((item) => (
                  <div key={item._id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.duration_days || 0} days •
                          ${item.price_usd || 0} USD •
                          {item.difficulty || 'Moderate'} •
                          {item.region || 'No region'} •
                          {item.is_active ? 'Active' : 'Inactive'}
                          {item.is_featured ? ' • Featured' : ''}
                          {item.is_optional ? ' • Optional' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>Edit</Button>
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

    </div>
  )
}