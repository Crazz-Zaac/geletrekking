'use client'

import { useConfirm } from '@/components/admin/use-confirm'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ExternalLink, GripVertical, Home, Mountain, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react'
import {
  AdminPageHeader,
  EmptyState,
  Field,
  ImageListField,
  ImageUrlField,
  ListEditor,
  SaveBar,
  StatusToasts,
  TextArea,
  ToggleField,
  useDirtyState,
  useUnsavedChangesWarning,
} from '@/components/admin/form-kit'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { cn } from '@/lib/utils'
import {
  AdminTrek,
  createAdminTrek,
  deleteAdminTrek,
  getAdminTreks,
  updateAdminTrek,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type TabKey = 'basic' | 'details' | 'itinerary' | 'essentials' | 'includes' | 'packing' | 'faqs' | 'offers' | 'media'

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

type PricingTierForm = {
  name: "Economic" | "Comfort"
  price_usd: number
  price_gbp: number
  includes: string
}

type TripEssentialForm = {
  title: string
  summary: string
  detail: string
}

type AvailabilityRangeForm = {
  start_date: string
  end_date: string
  status: 'available' | 'limited' | 'booked'
  note: string
}

type TrekForm = {
  name: string
  slug: string
  description: string
  region: string
  region_description: string
  best_season: string
  availability: AvailabilityRangeForm[]
  season_tag: string
  image_url: string
  gallery_images: string
  trek_map_embed_url: string
  map_image_url: string
  duration_days: number
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  max_altitude_meters: number
  trip_length_km: number
  acclimatization_days: number
  daily_activity_hours: string
  wifi_availability: string
  group_size_min: number
  group_size_max: number
  tour_type: string
  transportation: string
  start_point: string
  end_point: string
  price_usd: number
  price_gbp: number
  pricing_tiers: PricingTierForm[]
  // coordinates and location name for live weather fetching
  latitude: number
  longitude: number
  location_name: string
  highlights: string
  includes: string
  excludes: string
  what_to_pack: string
  trip_essentials: TripEssentialForm[]
  itinerary: ItineraryDay[]
  faqs: FaqItem[]
  has_offer: boolean
  offer_type: string
  offer_description: string
  offer_discount_percent: number
  discounted_price_usd: number
  discounted_price_gbp: number
  offer_valid_from: string
  offer_valid_to: string
  is_optional: boolean
  is_active: boolean
  is_featured: boolean
  featured_order: number
}

const DISTANCE_ACTIVITY_OPTIONS = [
  "🥾 Hike",
  "🚗 Drive",
  "🚙 Jeep Drive",
  "🚌 Bus",
  "✈️ Flight",
  "🚁 Helicopter",
  "🚲 Bike",
  "🚤 Boat",
  "🚶 Walk",
  "🐎 Horse",
  "🛶 Raft / Canoe",
] as const

const parseDistanceActivity = (value: string) => {
  const trimmed = value.trim()
  const separatorIndex = trimmed.lastIndexOf(" - ")
  const activityText = separatorIndex >= 0 ? trimmed.slice(0, separatorIndex) : trimmed
  const activities = activityText
    .split(" + ")
    .map((item) => item.trim())
    .filter((item) => DISTANCE_ACTIVITY_OPTIONS.includes(item as (typeof DISTANCE_ACTIVITY_OPTIONS)[number]))
  const km = separatorIndex >= 0 ? trimmed.slice(separatorIndex + 3) : activities.length > 0 ? "" : trimmed

  return {
    activities,
    km: km.replace(/\s*km$/i, "").trim(),
  }
}

const formatDistanceActivity = (activities: string[], km: string) => {
  const cleanedKm = km.replace(/\s*km$/i, "").trim()
  const activityText = activities.join(" + ")

  if (activityText && cleanedKm) return activityText + " - " + cleanedKm + " km"
  if (activityText) return activityText
  if (cleanedKm) return cleanedKm + " km"
  return ""
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

const stripListMarker = (value: string) =>
  value.trim().replace(/^(?:[-*•]\s+|\d+[.)]\s+)/, "").trim()

const splitListItems = (value: string) =>
  value.split("\n").map(stripListMarker).filter(Boolean)

const defaultTripEssentials = (): TripEssentialForm[] => ([
  { title: "Communication", summary: "", detail: "" },
  { title: "Accommodation", summary: "", detail: "" },
  { title: "Toilet and Shower", summary: "", detail: "" },
  { title: "Food and Drink", summary: "", detail: "" },
])

const mergeTripEssentials = (items: AdminTrek["trip_essentials"] = []): TripEssentialForm[] => {
  const savedByTitle = new Map(items.map((item) => [item.title.toLowerCase(), item]))
  return defaultTripEssentials().map((item) => {
    const saved = savedByTitle.get(item.title.toLowerCase())
    return {
      title: item.title,
      summary: saved?.summary || "",
      detail: saved?.detail || "",
    }
  })
}

const defaultPricingTiers = (): PricingTierForm[] => ([
  { name: 'Economic', price_usd: 0, price_gbp: 0, includes: '' },
  { name: 'Comfort', price_usd: 0, price_gbp: 0, includes: '' },
])

const initialForm: TrekForm = {
  name: '',
  slug: '',
  description: '',
  region: '',
  region_description: '',
  best_season: '',
  availability: [],
  season_tag: '',
  image_url: '',
  gallery_images: '',
  trek_map_embed_url: '',
  map_image_url: '',
  duration_days: 10,
  difficulty: 'Moderate',
  max_altitude_meters: 0,
  trip_length_km: 0,
  acclimatization_days: 0,
  daily_activity_hours: '',
  wifi_availability: '',
  group_size_min: 1,
  group_size_max: 15,
  tour_type: '',
  transportation: '',
  start_point: '',
  end_point: '',
  price_usd: 0,
  price_gbp: 0,
  pricing_tiers: defaultPricingTiers(),
  latitude: 0,
  longitude: 0,
  location_name: '',
  highlights: '',
  includes: '',
  excludes: '',
  what_to_pack: '',
  trip_essentials: defaultTripEssentials(),
  itinerary: [emptyDay()],
  faqs: [emptyFaq()],
  has_offer: false,
  offer_type: '',
  offer_description: '',
  offer_discount_percent: 0,
  discounted_price_usd: 0,
  discounted_price_gbp: 0,
  offer_valid_from: '',
  offer_valid_to: '',
  is_optional: false,
  is_active: true,
  is_featured: false,
  featured_order: 0,
}

function formToPayload(form: TrekForm): Partial<AdminTrek> {
  const pricingTiers = form.pricing_tiers.map((tier) => ({
    name: tier.name,
    price_usd: tier.price_usd || 0,
    price_gbp: tier.price_gbp || 0,
    includes: tier.includes ? splitListItems(tier.includes) : [],
  }))
  const usdPrices = pricingTiers.map((tier) => tier.price_usd || 0).filter((price) => price > 0)
  const gbpPrices = pricingTiers.map((tier) => tier.price_gbp || 0).filter((price) => price > 0)

  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim(),
    region: form.region.trim() || undefined,
    region_description: form.region_description.trim() || undefined,
    best_season: form.best_season.trim() || undefined,
    availability: form.availability
      .filter((range) => range.start_date && range.end_date)
      .map((range) => ({ start_date: range.start_date, end_date: range.end_date, status: range.status, note: range.note.trim() })),
    season_tag: form.season_tag.trim() || undefined,
    image_url: form.image_url.trim() || undefined,
    gallery_images: form.gallery_images
      ? form.gallery_images.split('\n').map((s) => s.trim()).filter(Boolean)
      : [],
    trek_map_embed_url: form.trek_map_embed_url.trim() || undefined,
    map_image_url: form.map_image_url.trim() || undefined,
    duration_days: form.duration_days,
    difficulty: form.difficulty,
    max_altitude_meters: form.max_altitude_meters || undefined,
    trip_length_km: form.trip_length_km || undefined,
    acclimatization_days: form.acclimatization_days || undefined,
    daily_activity_hours: form.daily_activity_hours.trim() || undefined,
    wifi_availability: form.wifi_availability.trim() || undefined,
    group_size_min: form.group_size_min,
    group_size_max: form.group_size_max,
    tour_type: form.tour_type.trim() || undefined,
    transportation: form.transportation.trim() || undefined,
    start_point: form.start_point.trim() || undefined,
    end_point: form.end_point.trim() || undefined,
    price_usd: usdPrices.length > 0 ? Math.min(...usdPrices) : form.price_usd,
    price_gbp: gbpPrices.length > 0 ? Math.min(...gbpPrices) : form.price_gbp,
    pricing_tiers: pricingTiers,
    // only send coordinates if both are filled in
    latitude: form.latitude || undefined,
    longitude: form.longitude || undefined,
    location_name: form.location_name.trim() || undefined,
    highlights: form.highlights ? splitListItems(form.highlights) : [],
    includes: form.includes ? splitListItems(form.includes) : [],
    excludes: form.excludes ? splitListItems(form.excludes) : [],
    what_to_pack: form.what_to_pack ? splitListItems(form.what_to_pack) : [],
    trip_essentials: form.trip_essentials
      .map((item) => ({
        title: item.title.trim(),
        summary: item.summary.trim(),
        detail: item.detail.trim(),
      }))
      .filter((item) => item.title && item.summary && item.detail),
    itinerary: form.itinerary.filter((d) => d.title.trim()),
    faqs: form.faqs.filter((f) => f.question.trim() && f.answer.trim()),
    has_offer: form.has_offer,
    offer_type: form.offer_type.trim() || undefined,
    offer_title: form.offer_type.trim() || undefined,
    offer_description: form.offer_description.trim() || undefined,
    offer_discount_percent: form.offer_discount_percent || undefined,
    discounted_price_usd: form.discounted_price_usd || undefined,
    discounted_price_gbp: form.discounted_price_gbp || undefined,
    offer_valid_from: form.offer_valid_from || undefined,
    offer_valid_to: form.offer_valid_to || undefined,
    is_optional: form.is_optional,
    is_active: form.is_active,
    is_featured: form.is_featured,
    featured_order: form.is_featured ? Math.max(0, Math.round(Number(form.featured_order) || 0)) : 0,
  }
}

function trekToForm(item: AdminTrek): TrekForm {
  return {
    name: item.name || '',
    slug: item.slug || '',
    description: item.description || '',
    region: item.region || '',
    region_description: item.region_description || '',
    best_season: item.best_season || '',
    availability: (item.availability || [])
      .filter((range) => range.start_date && range.end_date)
      .map((range) => ({
        start_date: range.start_date.slice(0, 10),
        end_date: range.end_date.slice(0, 10),
        status: range.status || 'available',
        note: range.note || '',
      })),
    season_tag: item.season_tag || '',
    image_url: item.image_url || '',
    gallery_images: (item.gallery_images || []).join('\n'),
    trek_map_embed_url: item.trek_map_embed_url || '',
    map_image_url: item.map_image_url || '',
    duration_days: item.duration_days || 10,
    difficulty: item.difficulty || 'Moderate',
    max_altitude_meters: item.max_altitude_meters || 0,
    trip_length_km: item.trip_length_km || 0,
    acclimatization_days: item.acclimatization_days || 0,
    daily_activity_hours: item.daily_activity_hours || '',
    wifi_availability: item.wifi_availability || '',
    group_size_min: item.group_size_min || 1,
    group_size_max: item.group_size_max || 15,
    tour_type: item.tour_type || '',
    transportation: item.transportation || '',
    start_point: item.start_point || '',
    end_point: item.end_point || '',
    price_usd: item.price_usd || 0,
    price_gbp: item.price_gbp || 0,
    pricing_tiers: item.pricing_tiers && item.pricing_tiers.length > 0
      ? defaultPricingTiers().map((defaultTier) => {
          const savedTier = item.pricing_tiers?.find((tier) => tier.name === defaultTier.name)
          return {
            name: defaultTier.name,
            price_usd: savedTier?.price_usd || 0,
            price_gbp: savedTier?.price_gbp || 0,
            includes: (savedTier?.includes || []).join('\n'),
          }
        })
      : [
          { name: 'Economic', price_usd: item.price_usd || 0, price_gbp: item.price_gbp || 0, includes: (item.includes || []).join('\n') },
          { name: 'Comfort', price_usd: 0, price_gbp: 0, includes: '' },
        ],
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    location_name: item.location_name || '',
    highlights: (item.highlights || []).join('\n'),
    includes: (item.includes || []).join('\n'),
    excludes: (item.excludes || []).join('\n'),
    what_to_pack: (item.what_to_pack || []).join('\n'),
    trip_essentials: mergeTripEssentials(item.trip_essentials),
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
    offer_discount_percent: item.offer_discount_percent || 0,
    discounted_price_usd: item.discounted_price_usd || 0,
    discounted_price_gbp: item.discounted_price_gbp || 0,
    offer_valid_from: item.offer_valid_from ? item.offer_valid_from.slice(0, 10) : '',
    offer_valid_to: item.offer_valid_to ? item.offer_valid_to.slice(0, 10) : '',
    is_optional: item.is_optional ?? false,
    is_active: item.is_active ?? true,
    is_featured: item.is_featured ?? false,
    featured_order: item.featured_order ?? 0,
  }
}

// Lists stored as one item per line (bullets optional) <-> array for ListEditor.
// Keep inner/trailing spaces so items stay editable while typing; only drop empty lines.
const linesToList = (value: string) => (value || '').split(/\r?\n/).map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, '')).filter((line) => line.trim() !== '')
const listToLines = (items: string[]) => items.join('\n')

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'details', label: 'Trek Details' },
  { key: 'media', label: 'Media' },
  { key: 'itinerary', label: 'Itinerary' },
  { key: 'essentials', label: 'Trip Essentials' },
  { key: 'includes', label: 'Includes / Excludes' },
  { key: 'packing', label: 'Special Equipment' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'offers', label: 'Offers' },
]

type LineupRowProps = {
  item: AdminTrek
  index: number
  total: number
  dimmed: boolean
  busy: boolean
  onMove: (index: number, direction: -1 | 1) => void
  onRemove: (item: AdminTrek) => void
  onDragEnd: () => void
}

/** One draggable row in the Homepage line-up. Drag by the grip (mouse or touch), or focus it and use ↑/↓. */
function LineupRow({ item, index, total, dimmed, busy, onMove, onRemove, onDragEnd }: LineupRowProps) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      as="li"
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.02, boxShadow: '0 12px 28px -8px rgba(0,0,0,0.3)', zIndex: 10 }}
      className={cn('relative flex items-center gap-2 rounded-lg border border-border bg-background px-1.5 py-1.5', dimmed && 'opacity-60')}
    >
      <button
        type="button"
        disabled={busy}
        onPointerDown={(event) => {
          if (busy) return
          event.preventDefault()
          controls.start(event)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' && index > 0) { event.preventDefault(); onMove(index, -1) }
          if (event.key === 'ArrowDown' && index < total - 1) { event.preventDefault(); onMove(index, 1) }
        }}
        aria-label={`Reorder ${item.name}, position ${index + 1} of ${total}. Drag, or use the up and down arrow keys.`}
        title="Drag to reorder"
        className="flex h-8 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing disabled:cursor-wait"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-5 text-center text-xs font-semibold text-muted-foreground">{index + 1}</span>
      <div className="pointer-events-none h-8 w-11 shrink-0 overflow-hidden rounded bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {item.image_url ? <img src={item.image_url} alt="" draggable={false} className="h-full w-full object-cover" loading="lazy" /> : null}
      </div>
      <p className="min-w-0 flex-1 select-none truncate text-sm text-foreground">
        {item.name}
        <span className="ml-2 text-xs text-muted-foreground">{[item.region, item.difficulty].filter(Boolean).join(' · ')}</span>
        {!item.is_active && <Badge variant="outline" className="ml-2">Hidden: not shown</Badge>}
      </p>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" disabled={busy} onClick={() => onRemove(item)} aria-label={`Remove ${item.name} from the homepage`}><X className="h-3.5 w-3.5" /></Button>
    </Reorder.Item>
  )
}

export default function AdminTreksPage() {
  const [askConfirm, confirmDialog] = useConfirm()
  const [items, setItems] = useState<AdminTrek[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TrekForm>(initialForm)
  const [activeTab, setActiveTab] = useState<TabKey>('basic')
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [query, setQuery] = useState('')
  const { dirty, markSaved } = useDirtyState(form)
  useUnsavedChangesWarning(showForm && dirty)

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
    const next = trekToForm(item)
    setForm(next)
    markSaved(next)
    setSubmitted(false)
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
    setSubmitted(true)
    if (!form.name.trim() || !form.description.trim()) {
      setError('Add the trek name and description (Basic info tab).')
      setActiveTab('basic')
      return
    }
    const invalidAvailabilityRange = form.availability.find((range) =>
      range.start_date && range.end_date && range.start_date > range.end_date
    )
    if (invalidAvailabilityRange) {
      setError('Availability range start date must be before end date.')
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
        setMessage('Trek saved.')
      } else {
        await createAdminTrek(token, payload)
        setMessage('Trek created.')
      }
      onReset()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trek')
    } finally {
      setSaving(false)
    }
  }

  // ---- Homepage line-up (featured treks and their order) ----
  const HOMEPAGE_SLOTS = 6
  const featuredItems = useMemo(() => {
    const position = (item: AdminTrek) => (item.featured_order && item.featured_order > 0 ? item.featured_order : Number.MAX_SAFE_INTEGER)
    return items.filter((item) => item.is_featured).sort((a, b) => position(a) - position(b))
  }, [items])
  const [lineupBusy, setLineupBusy] = useState(false)

  /** Save featured flags/positions for the given treks, numbering `ordered` 1..n. */
  const saveLineup = async (ordered: AdminTrek[], removed?: AdminTrek) => {
    if (!token) { setError('Missing admin token. Please login again.'); return }
    setLineupBusy(true)
    setError('')
    setMessage('')
    try {
      const changes: Array<{ id: string; payload: Partial<AdminTrek> }> = []
      ordered.forEach((item, index) => {
        if (!item.is_featured || item.featured_order !== index + 1) {
          changes.push({ id: item._id, payload: { is_featured: true, featured_order: index + 1 } })
        }
      })
      if (removed) changes.push({ id: removed._id, payload: { is_featured: false, featured_order: 0 } })
      for (const change of changes) await updateAdminTrek(token, change.id, change.payload)
      // Update locally so the list doesn't flash a reload.
      setItems((prev) => prev.map((item) => {
        const change = changes.find((c) => c.id === item._id)
        return change ? { ...item, ...change.payload } : item
      }))
      setMessage('Homepage line-up saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update the homepage line-up')
      await refresh()
    } finally {
      setLineupBusy(false)
    }
  }

  const toggleFeatured = (item: AdminTrek) =>
    item.is_featured
      ? saveLineup(featuredItems.filter((f) => f._id !== item._id), item)
      : saveLineup([...featuredItems, item])

  // Local copy that follows the pointer while dragging; saved when the drag ends.
  const [lineupOrder, setLineupOrder] = useState<AdminTrek[]>([])
  const lineupOrderRef = useRef<AdminTrek[]>([])
  useEffect(() => {
    setLineupOrder(featuredItems)
    lineupOrderRef.current = featuredItems
  }, [featuredItems])
  const onLineupReorder = (next: AdminTrek[]) => {
    lineupOrderRef.current = next
    setLineupOrder(next)
  }
  const commitLineupDrag = () => {
    const next = lineupOrderRef.current
    const changed = next.some((item, index) => featuredItems[index]?._id !== item._id)
    if (changed) void saveLineup(next)
  }

  const moveFeatured = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= featuredItems.length) return
    const next = [...featuredItems]
    ;[next[index], next[target]] = [next[target], next[index]]
    void saveLineup(next)
  }

  const onDelete = async (item: AdminTrek) => {
    if (!token) { setError('Missing admin token. Please login again.'); return }
    const confirmed = await askConfirm({ title: `Delete "${item.name}"?`, description: 'The trek page will be removed from the website.' })
    if (!confirmed) return
    try {
      await deleteAdminTrek(token, item._id)
      setMessage('Trek deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trek')
    }
  }

  const updateAvailabilityRange = <Field extends keyof AvailabilityRangeForm>(index: number, field: Field, value: AvailabilityRangeForm[Field]) => {
    setForm((prev) => {
      const updated = [...prev.availability]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, availability: updated }
    })
  }

  const addAvailabilityRange = () => {
    setForm((prev) => ({
      ...prev,
      availability: [...prev.availability, { start_date: '', end_date: '', status: 'available', note: '' }],
    }))
  }

  const removeAvailabilityRange = (index: number) => {
    setForm((prev) => ({ ...prev, availability: prev.availability.filter((_, i) => i !== index) }))
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

  const updatePricingTier = (index: number, field: keyof PricingTierForm, value: string | number) => {
    setForm((prev) => {
      const updated = [...prev.pricing_tiers]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, pricing_tiers: updated }
    })
  }

  const textarea = (
    placeholder: string,
    value: string,
    onChange: (v: string) => void,
    rows = 3
  ) => <TextArea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />

  const field = (label: string, input: React.ReactNode, hint?: string) => (
    <Field label={label} hint={hint}>{input}</Field>
  )


  const closeEditor = async () => {
    if (dirty && !(await askConfirm({ title: 'Discard unsaved changes?', description: 'Your edits to this trek will be lost.', confirmLabel: 'Discard' }))) return
    onReset()
  }

  const editingItem = editingId ? items.find((item) => item._id === editingId) : null
  const visibleItems = items.filter((item) => {
    const q = query.trim().toLowerCase()
    return !q || [item.name, item.region, item.slug].some((value) => (value || '').toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">
      {confirmDialog}

      <StatusToasts error={error} message={message} />
      {!showForm && (
        <AdminPageHeader
          title="Treks"
          description={`${stats.total} treks · ${stats.active} visible · ${stats.optional} also under Activities`}
          actions={
            <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(initialForm); markSaved(initialForm); setSubmitted(false); setActiveTab('basic') }} className="gap-2">
              <Plus className="h-4 w-4" /> New trek
            </Button>
          }
        />
      )}

      {showForm && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" className="-ml-2 gap-1.5 text-muted-foreground" onClick={() => void closeEditor()}>
              <ArrowLeft className="h-4 w-4" /> All treks
            </Button>
            {editingItem?.is_active && (editingItem.slug || editingItem._id) && (
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <a href={`/trek/${editingItem.slug || editingItem._id}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> View live</a>
              </Button>
            )}
          </div>
          <AdminPageHeader title={editingId ? form.name || 'Edit trek' : 'New trek'} description="Only the name and description are required. Everything else can be filled in later." />

          <div className="sticky z-10 -mx-4 overflow-x-auto border-b border-border bg-muted/30 px-4 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }}>
            <div className="flex min-w-max gap-1" role="tablist" aria-label="Trek sections">
              {TABS.map((tab) => {
                const invalid = tab.key === 'basic' && submitted && (!form.name.trim() || !form.description.trim())
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'relative flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      activeTab === tab.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.label}
                    {invalid && <span className="h-2 w-2 rounded-full bg-destructive" aria-label="has errors" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" role="tabpanel">

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
                  {field('Best months', (
                    <Input
                      placeholder="e.g. Mar–Apr, Oct–Nov"
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

                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Available date ranges</h3>
                      <p className="text-xs text-muted-foreground">Add departure and return dates. Status and notes appear in the public departure calendar.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addAvailabilityRange}>
                      + Add range
                    </Button>
                  </div>
                  {form.availability.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No availability ranges added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {form.availability.map((range, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border border-border bg-background p-3">
                          {field("Start date", (
                            <Input
                              type="date"
                              value={range.start_date}
                              onChange={(e) => updateAvailabilityRange(index, "start_date", e.target.value)}
                            />
                          ))}
                          {field("End date", (
                            <Input
                              type="date"
                              value={range.end_date}
                              onChange={(e) => updateAvailabilityRange(index, "end_date", e.target.value)}
                            />
                          ))}
                          {field('Departure status', (
                            <select
                              aria-label={`Departure ${index + 1} status`}
                              value={range.status}
                              onChange={(e) => updateAvailabilityRange(index, 'status', e.target.value as AvailabilityRangeForm['status'])}
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="available">Open</option>
                              <option value="limited">Few left</option>
                              <option value="booked">Full</option>
                            </select>
                          ))}
                          {field('Departure note (optional)', (
                            <Input value={range.note} onChange={(e) => updateAvailabilityRange(index, 'note', e.target.value)} placeholder="Details for this departure" />
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => removeAvailabilityRange(index)} className="self-end sm:col-span-2">
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {field('Region description (used on homepage region cards)', textarea(
                  'Short summary for this trekking region',
                  form.region_description,
                  (v) => setForm((p) => ({ ...p, region_description: v })),
                  3
                ))}
                <div className="grid grid-cols-1 gap-3 pt-1 lg:grid-cols-3">
                  <ToggleField label="Visible on website" description="Hidden treks stay here as drafts." checked={form.is_active} onCheckedChange={(is_active) => setForm((p) => ({ ...p, is_active }))} />
                  <ToggleField label="Featured on homepage" description="Shown first under Popular Trek Packages." checked={form.is_featured} onCheckedChange={(is_featured) => setForm((p) => ({ ...p, is_featured }))} />
                  <ToggleField label="Also list under Activities" description="For short or optional treks." checked={form.is_optional} onCheckedChange={(is_optional) => setForm((p) => ({ ...p, is_optional }))} />
                </div>
                {form.is_featured && (
                  <Field label="Homepage position" hint="1 shows first. Leave 0 to place it after the numbered treks. You can also reorder from the trek list.">
                    <Input
                      type="number"
                      min={0}
                      max={999}
                      className="h-10 w-32"
                      value={form.featured_order}
                      onChange={(e) => setForm((p) => ({ ...p, featured_order: Number(e.target.value) || 0 }))}
                    />
                  </Field>
                )}

                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Key Information</h3>
                    <p className="text-xs text-muted-foreground">These fields power the trek detail KPIs.</p>
                  </div>
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
                    {field('Trip length (km)', (
                      <Input
                        type="number"
                        value={form.trip_length_km}
                        onChange={(e) => setForm((p) => ({ ...p, trip_length_km: Number(e.target.value) || 0 }))}
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
                    {field('Acclimatization days', (
                      <Input
                        type="number"
                        value={form.acclimatization_days}
                        onChange={(e) => setForm((p) => ({ ...p, acclimatization_days: Number(e.target.value) || 0 }))}
                      />
                    ))}
                    {field('Daily activity hours', (
                      <Input
                        placeholder="e.g. 5-7 hrs"
                        value={form.daily_activity_hours}
                        onChange={(e) => setForm((p) => ({ ...p, daily_activity_hours: e.target.value }))}
                      />
                    ))}
                    {field('WiFi availability', (
                      <Input
                        placeholder="e.g. Available, Limited"
                        value={form.wifi_availability}
                        onChange={(e) => setForm((p) => ({ ...p, wifi_availability: e.target.value }))}
                      />
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
                    {field('Trip Start', (
                      <Input
                        placeholder="e.g. Kathmandu"
                        value={form.start_point}
                        onChange={(e) => setForm((p) => ({ ...p, start_point: e.target.value }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* trek details tab */}
            {activeTab === 'details' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Package pricing tiers</h3>
                      <p className="text-xs text-muted-foreground">Economic and Comfort appear as expandable rows on the public trek page.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {form.pricing_tiers.map((tier, index) => (
                        <div key={tier.name} className="rounded-md border border-border bg-background p-3 space-y-3">
                          <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {field('Price USD', (
                              <Input
                                type="number"
                                value={tier.price_usd}
                                onChange={(e) => updatePricingTier(index, 'price_usd', Number(e.target.value) || 0)}
                              />
                            ))}
                            {field('Price GBP', (
                              <Input
                                type="number"
                                value={tier.price_gbp}
                                onChange={(e) => updatePricingTier(index, 'price_gbp', Number(e.target.value) || 0)}
                              />
                            ))}
                          </div>
                          {field(`${tier.name} includes`, (
                            <ListEditor items={linesToList(tier.includes)} onChange={(items) => updatePricingTier(index, 'includes', listToLines(items))} placeholder="e.g. Guide service" />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
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

                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Highlights</h3>
                    <p className="text-xs text-muted-foreground">Add one highlight per line. Bullets or numbers are optional and will be cleaned on save.</p>
                  </div>
                  <ListEditor items={linesToList(form.highlights)} onChange={(items) => setForm((p) => ({ ...p, highlights: listToLines(items) }))} placeholder="e.g. Sunrise views from Kala Patthar" emptyText="No highlights yet." />
                </div>
              </div>
            )}

            {/* media tab */}
            {activeTab === 'media' && (
              <div className="space-y-3">
                <ImageUrlField label="Cover photo" value={form.image_url} onChange={(image_url) => setForm((p) => ({ ...p, image_url }))} hint="Used on the trek page header and trek cards. Landscape, at least 1600 px wide." />
                {field('More photos', (
                  <ImageListField images={linesToList(form.gallery_images)} onChange={(images) => setForm((p) => ({ ...p, gallery_images: listToLines(images) }))} />
                ))}
                <ImageUrlField label="Route map" value={form.map_image_url} onChange={(map_image_url) => setForm((p) => ({ ...p, map_image_url }))} hint="Shown uncropped, so wide, tall or square maps all work." />
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
                      <MarkdownEditor value={day.description} onChange={(value) => updateDay(index, 'description', value)} rows={4} placeholder="Describe the day: route, highlights, overnight stop…" />
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {field('Altitude', (
                        <Input
                          placeholder="e.g. 3440m"
                          value={day.altitude}
                          onChange={(e) => updateDay(index, 'altitude', e.target.value)}
                        />
                      ))}
                      {field('Distance', (() => {
                        const distance = parseDistanceActivity(day.distance)

                        return (
                          <div className="space-y-2">
                            <details className="group relative">
                              <summary className="flex h-9 cursor-pointer list-none items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
                                <span className={distance.activities.length ? "truncate" : "truncate text-muted-foreground"}>
                                  {distance.activities.length ? distance.activities.join(" + ") : "Select travel modes"}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                              </summary>
                              <div className="absolute z-20 mt-1 grid max-h-56 w-full overflow-y-auto rounded-md border border-input bg-background p-2 shadow-md">
                                {DISTANCE_ACTIVITY_OPTIONS.map((option) => {
                                  const checked = distance.activities.includes(option)

                                  return (
                                    <label key={option} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-foreground hover:bg-muted/50">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          const activities = e.target.checked
                                            ? [...distance.activities, option]
                                            : distance.activities.filter((item) => item !== option)
                                          updateDay(index, 'distance', formatDistanceActivity(activities, distance.km))
                                        }}
                                        className="h-4 w-4 rounded border-input"
                                      />
                                      <span className="truncate">{option}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            </details>
                            <Input
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9.]*"
                              placeholder="km"
                              value={distance.km}
                              onChange={(e) => updateDay(index, 'distance', formatDistanceActivity(distance.activities, e.target.value))}
                            />
                          </div>
                        )
                      })())}
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

            {/* trip essentials tab */}
            {activeTab === "essentials" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">Trip Essentials cards</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill each card separately. Cards with both summary and detail are shown on the public trek page.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {form.trip_essentials.map((item, index) => (
                    <div key={item.title} className="rounded-md border border-border bg-background p-4 space-y-3">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      {field("Short summary", (
                        <Input
                          value={item.summary}
                          onChange={(e) => setForm((p) => {
                            const updated = [...p.trip_essentials]
                            updated[index] = { ...updated[index], summary: e.target.value }
                            return { ...p, trip_essentials: updated }
                          })}
                          placeholder="Short line shown before expansion"
                        />
                      ))}
                      {field("Expanded detail", (
                        <textarea
                          value={item.detail}
                          onChange={(e) => setForm((p) => {
                            const updated = [...p.trip_essentials]
                            updated[index] = { ...updated[index], detail: e.target.value }
                            return { ...p, trip_essentials: updated }
                          })}
                          rows={4}
                          placeholder="Full details shown after Read more"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-vertical"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* includes and excludes tab */}
            {activeTab === 'includes' && (
              <div className="space-y-4">
                {field('Included in the price', (
                  <ListEditor items={linesToList(form.includes)} onChange={(items) => setForm((p) => ({ ...p, includes: listToLines(items) }))} placeholder="e.g. All airport transfers" />
                ), 'Tip: paste a list to add several items at once.')}
                {field('Not included (paid separately)', (
                  <ListEditor items={linesToList(form.excludes)} onChange={(items) => setForm((p) => ({ ...p, excludes: listToLines(items) }))} placeholder="e.g. International flights" />
                ))}
              </div>
            )}

            {/* special equipment tab */}
            {activeTab === 'packing' && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">Trek-specific equipment</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add only special gear this trek requires beyond the general packing list. The public page will also link to the{' '}
                    <a
                      href="/guides/gear-and-equipment"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:text-primary/80"
                    >
                      gear and equipment guide
                    </a>
                    .
                  </p>
                </div>
                {field('Special equipment', (
                  <ListEditor items={linesToList(form.what_to_pack)} onChange={(items) => setForm((p) => ({ ...p, what_to_pack: listToLines(items) }))} placeholder="e.g. Microspikes for icy sections" emptyText="No special equipment listed." />
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
                <ToggleField label="Special offer" description="Show a discount badge and offer details on this trek." checked={form.has_offer} onCheckedChange={(has_offer) => setForm((p) => ({ ...p, has_offer }))} />
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
                      {field('Offer discount percent', (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={form.offer_discount_percent}
                          onChange={(e) => setForm((p) => ({ ...p, offer_discount_percent: Number(e.target.value) || 0 }))}
                        />
                      ))}
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

          </div>

          <SaveBar
            dirty={dirty || !editingId}
            saving={saving}
            onSave={() => void onSave()}
            onDiscard={() => void closeEditor()}
            discardLabel="Cancel"
            saveLabel={editingId ? 'Save trek' : 'Create trek'}
          />
        </div>
      )}

      {!showForm && (
        <div className="space-y-4">
          {!loading && items.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4 shadow-sm" aria-labelledby="homepage-lineup-heading">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 id="homepage-lineup-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Home className="h-4 w-4 text-primary" aria-hidden="true" /> Homepage line-up
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Popular Trek Packages shows {HOMEPAGE_SLOTS} treks. Starred treks come first in this order (drag <GripVertical className="inline h-3 w-3" aria-hidden="true" /> to reorder); empty spots are filled automatically.
                    Treks with an active special offer also appear in the Special Offers band above it.
                  </p>
                </div>
                <Badge variant="outline" className={featuredItems.length > HOMEPAGE_SLOTS ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}>
                  {Math.min(featuredItems.length, HOMEPAGE_SLOTS)} of {HOMEPAGE_SLOTS} picked{featuredItems.length > HOMEPAGE_SLOTS ? ` (+${featuredItems.length - HOMEPAGE_SLOTS} only under region filters)` : ''}
                </Badge>
              </div>
              {featuredItems.length === 0 ? (
                <p className="mt-3 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                  No treks picked yet: the homepage shows the newest treks. Click the <Star className="inline h-3 w-3" aria-hidden="true" /> on a trek below to pick it.
                </p>
              ) : (
                <>
                {/* Shows the 6 homepage rows; any extra starred treks scroll inside the panel. */}
                <Reorder.Group
                  as="ol"
                  axis="y"
                  values={lineupOrder}
                  onReorder={onLineupReorder}
                  layoutScroll
                  className="mt-3 flex max-h-[19.5rem] flex-col gap-1.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]"
                  aria-label="Featured treks in homepage order"
                >
                  {lineupOrder.map((item, index) => (
                    <LineupRow
                      key={item._id}
                      item={item}
                      index={index}
                      total={lineupOrder.length}
                      dimmed={index >= HOMEPAGE_SLOTS}
                      busy={lineupBusy}
                      onMove={moveFeatured}
                      onRemove={(row) => void toggleFeatured(row)}
                      onDragEnd={commitLineupDrag}
                    />
                  ))}
                </Reorder.Group>
                {featuredItems.length > HOMEPAGE_SLOTS && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Scroll for {featuredItems.length - HOMEPAGE_SLOTS} more. Treks after #{HOMEPAGE_SLOTS} only show when visitors pick their region.
                  </p>
                )}
                </>
              )}
            </section>
          )}
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input type="search" className="h-10 pl-9" placeholder="Search treks or regions…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search treks" />
          </div>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />)}</div>
          ) : items.length === 0 ? (
            <EmptyState icon={<Mountain className="h-5 w-5" />} title="No treks yet" description="Add your first trekking package." />
          ) : visibleItems.length === 0 ? (
            <EmptyState icon={<Search className="h-5 w-5" />} title="No matching treks" />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {visibleItems.map((item) => (
                <li key={item._id} className="flex items-center gap-4 p-3 transition-colors hover:bg-muted/40 sm:p-4">
                  <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Mountain className="h-5 w-5" /></div>}
                  </div>
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onEdit(item)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <Badge variant="outline" className={item.is_active ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : ''}>{item.is_active ? 'Visible' : 'Hidden'}</Badge>
                      {item.is_featured && <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700"><Star className="h-3 w-3" /> Featured</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[item.region, item.duration_days ? `${item.duration_days} days` : null, item.difficulty, item.price_usd ? `$${item.price_usd}` : null].filter(Boolean).join(' · ')}
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('h-8 w-8', item.is_featured ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground')}
                      disabled={lineupBusy}
                      onClick={() => void toggleFeatured(item)}
                      aria-pressed={!!item.is_featured}
                      aria-label={item.is_featured ? `Remove ${item.name} from the homepage` : `Feature ${item.name} on the homepage`}
                      title={item.is_featured ? 'Featured on homepage (click to remove)' : 'Feature on homepage'}
                    >
                      <Star className={cn('h-4 w-4', item.is_featured && 'fill-current')} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void onDelete(item)} aria-label={`Delete ${item.name}`}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
