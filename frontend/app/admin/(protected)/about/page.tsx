'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  AdminPageHeader,
  Field,
  FieldGrid,
  FormSkeleton,
  ImageUrlField,
  SaveBar,
  StatusToasts,
  TextArea,
  useDirtyState,
  useUnsavedChangesWarning,
} from '@/components/admin/form-kit'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { cn } from '@/lib/utils'
import {
  AdminAbout,
  AdminAboutAssociation,
  AdminAboutHighlight,
  AdminAboutTeamMember,
  getAdminAbout,
  updateAdminAbout,
} from '@/lib/api'
import { TEAM_SOCIAL_FIELDS, isValidSocialUrl } from '@/lib/team-social-links'
import { getAdminToken } from '@/lib/admin-auth'
import {
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  LayoutTemplate,
  Pencil,
  Plus,
  Sparkles,
  Target,
  Trash2,
  UserPlus,
  Users2,
} from 'lucide-react'

const defaultAbout: AdminAbout & { associations: AdminAboutAssociation[] } = {
  heroTitle: 'About Us',
  heroSubtitle: 'We are a Nepal-based trekking company focused on safe, authentic, and responsibly operated Himalayan experiences.',
  heroImageUrl: '',
  missionTitle: 'Our Mission',
  missionBody: 'Our mission is to deliver safe, memorable, and responsibly operated trekking journeys while supporting local livelihoods and preserving mountain environments for future generations.',
  storyTitle: 'Our Story',
  storyBody: "Gele Trekking began with a local team of mountain professionals who believed travelers deserve honest guidance, strong safety standards, and authentic connections with Nepal's mountain culture. Today, we continue the same approach—small details handled well, local teams treated fairly, and every itinerary built for a meaningful Himalayan experience.",
  highlights: [
    { title: 'Excellence', description: 'We maintain the highest standards in safety, service, and experiences for all our trekkers.' },
    { title: 'Community', description: 'We believe in building lasting relationships with our guides, porters, and trekking community.' },
    { title: 'Expertise', description: 'Our team brings decades of combined experience trekking the Himalayan mountains.' },
    { title: 'Sustainability', description: "We are committed to preserving Nepal's natural beauty for future generations." },
  ],
  whyChooseUs: [
    'Licensed and experienced local guide team with strong mountain safety practices.',
    'Transparent pricing with practical pre-trip guidance and itinerary support.',
    'Responsible operations that support local communities and porter welfare.',
    'Personalized service from first inquiry to post-trek follow-up.',
  ],
  stats: [],
  teamTitle: 'Meet Our Team',
  teamMembers: [],
  associations: [
    { name: 'Nepal Government', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/Screenshot%202026-03-22%20123026.png' },
    { name: 'Nepal Tourism Board', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/Nepal-Tourism-Board_Logo-compact.jpg' },
    { name: 'Nepal Mountaineering Association', logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/logo-header.png' },
    { name: "Trekking Agencies' Association of Nepal", logoUrl: 'https://ik.imagekit.io/dj8jxmvvw/taan-logo.jpg' },
  ],
}

/** Borderless input that reveals its border on hover/focus, so cards read like the published page. */
const inlineInput =
  'border-transparent bg-transparent shadow-none hover:border-input focus-visible:border-primary dark:bg-transparent'

/** Section of the editor: icon + heading row, then free-form content (no wrapping card). */
function Block({
  id,
  icon,
  title,
  description,
  count,
  actions,
  children,
}: {
  id: string
  icon: ReactNode
  title: string
  description?: ReactNode
  count?: number
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="flex items-center gap-2 text-base font-semibold text-foreground">
              {title}
              {count !== undefined && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">{count}</span>
              )}
            </h2>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

/** Dashed "add" tile used at the end of card grids. */
function AddTile({ onClick, icon, label, className }: { onClick: () => void; icon: ReactNode; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      {icon}
      {label}
    </button>
  )
}

const yearsGuiding = (since?: number | null) => {
  if (!since) return null
  const years = new Date().getFullYear() - since
  return years > 0 ? years : null
}

type Editing = { kind: 'member' | 'association'; index: number } | null

export default function AdminAboutPage() {
  const [form, setForm] = useState<AdminAbout & { associations: AdminAboutAssociation[] }>(defaultAbout)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')
  const [editing, setEditing] = useState<Editing>(null)
  const [heroImageBroken, setHeroImageBroken] = useState(false)
  const { dirty, markSaved, baseline } = useDirtyState(form)
  useUnsavedChangesWarning(dirty)

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
      const incomingAssociations = ((data as any).associations || []).filter(
        (item: AdminAboutAssociation) => item.name?.trim() || item.logoUrl?.trim()
      )

      const next = {
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
        teamTitle: fallbackText(data.teamTitle, defaultAbout.teamTitle),
        teamMembers: (data.teamMembers || []).filter((member) => member.name?.trim() || member.role?.trim()),
        associations: incomingAssociations.length > 0 ? incomingAssociations : defaultAbout.associations,
      }
      setForm(next)
      markSaved(next)
      setLastUpdatedAt(data.updatedAt || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load about content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    setHeroImageBroken(false)
  }, [form.heroImageUrl])

  const updateHighlight = (index: number, next: Partial<AdminAboutHighlight>) => {
    setForm((prev) => {
      const highlights = [...(prev.highlights || [])]
      highlights[index] = { ...(highlights[index] || { title: '', description: '' }), ...next }
      return { ...prev, highlights }
    })
  }

  const updateTeamMember = (index: number, next: Partial<AdminAboutTeamMember>) => {
    setForm((prev) => {
      const teamMembers = [...(prev.teamMembers || [])]
      teamMembers[index] = { ...(teamMembers[index] || { name: '', role: '', description: '', imageUrl: '' }), ...next }
      return { ...prev, teamMembers }
    })
  }

  const updateAssociation = (index: number, next: Partial<AdminAboutAssociation>) => {
    setForm((prev) => {
      const associations = [...(prev.associations || [])]
      associations[index] = { ...(associations[index] || { name: '', logoUrl: '' }), ...next }
      return { ...prev, associations }
    })
  }

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }
    for (const [index, member] of (form.teamMembers || []).entries()) {
      for (const { key, label } of TEAM_SOCIAL_FIELDS) {
        const value = member.social?.[key]?.trim()
        if (value && !isValidSocialUrl(value)) {
          setError(`${member.name || `Team member ${index + 1}`}: enter a complete HTTP or HTTPS URL for ${label}.`)
          setEditing({ kind: 'member', index })
          return
        }
      }
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateAdminAbout(token, form)
      setMessage('About page saved.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save about page')
    } finally {
      setSaving(false)
    }
  }

  type ListKey = 'highlights' | 'whyChooseUs' | 'stats' | 'teamMembers' | 'associations'

  const moveItem = (key: ListKey, index: number, direction: -1 | 1) =>
    setForm((prev) => {
      const list = [...((prev[key] as unknown[]) || [])]
      const target = index + direction
      if (target < 0 || target >= list.length) return prev
      ;[list[index], list[target]] = [list[target], list[index]]
      return { ...prev, [key]: list }
    })

  const removeItem = (key: ListKey, index: number) =>
    setForm((prev) => ({ ...prev, [key]: ((prev[key] as unknown[]) || []).filter((_, i) => i !== index) }))

  /** Move/remove controls. On pointer devices they appear on hover/focus of the parent `group`. */
  const itemActions = (listKey: ListKey, index: number, length: number, label: string, options: { reveal?: boolean; vertical?: boolean } = {}) => (
    <div
      className={cn(
        'flex shrink-0 items-center rounded-lg',
        options.vertical && 'flex-col',
        options.reveal && 'transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100'
      )}
    >
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => moveItem(listKey, index, -1)} aria-label={`Move ${label} up`}><ArrowUp className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === length - 1} onClick={() => moveItem(listKey, index, 1)} aria-label={`Move ${label} down`}><ArrowDown className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(listKey, index)} aria-label={`Remove ${label}`}><Trash2 className="h-4 w-4" /></Button>
    </div>
  )

  const onDiscard = () => {
    const saved = baseline()
    if (saved) setForm(saved)
  }

  const highlights = form.highlights || []
  const whyChooseUs = form.whyChooseUs || []
  const stats = form.stats || []
  const teamMembers = form.teamMembers || []
  const associations = form.associations || []

  const editingMember = editing?.kind === 'member' ? teamMembers[editing.index] : undefined
  const editingAssociation = editing?.kind === 'association' ? associations[editing.index] : undefined
  const memberHasInvalidSocial = (member: AdminAboutTeamMember) =>
    TEAM_SOCIAL_FIELDS.some(({ key }) => {
      const value = member.social?.[key]?.trim()
      return !!value && !isValidSocialUrl(value)
    })

  const sections = [
    { id: 'header', label: 'Header' },
    { id: 'story', label: 'Story & mission' },
    { id: 'values', label: 'Values', count: highlights.length },
    { id: 'why', label: 'Why us', count: whyChooseUs.length },
    { id: 'stats', label: 'Numbers', count: stats.length },
    { id: 'team', label: 'Team', count: teamMembers.length, invalid: teamMembers.some(memberHasInvalidSocial) },
    { id: 'associations', label: 'Memberships', count: associations.length },
  ]

  const heroUrl = (form.heroImageUrl || '').trim()

  return (
    <div className="space-y-6">
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="About page"
        description="Your story, values, team and memberships. Long texts support formatting and links like [our treks](/destinations)."
        actions={
          <Button variant="outline" asChild className="gap-2">
            <a href="/about" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> View page</a>
          </Button>
        }
      />

      {loading ? (
        <FormSkeleton rows={4} />
      ) : (
        <>
          {/* Section jump bar */}
          <nav aria-label="About page sections" className="sticky top-16 z-20 -mx-1 overflow-x-auto bg-background/90 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <ul className="flex w-max gap-1.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {section.label}
                    {section.count !== undefined && <span className="tabular-nums text-muted-foreground/70">{section.count}</span>}
                    {section.invalid && <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-label="has errors" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12 pb-4">
            {/* ── Header ───────────────────────────────────────── */}
            <Block id="header" icon={<LayoutTemplate className="h-4.5 w-4.5" />} title="Page header" description="The first thing visitors see. The preview updates as you type.">
              <div className="relative isolate flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 p-6 text-white shadow-sm md:min-h-64 md:p-10">
                {heroUrl && !heroImageBroken && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroUrl} alt="" onError={() => setHeroImageBroken(true)} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden="true" />
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider backdrop-blur">
                  Preview
                </span>
                <p className="text-3xl font-bold tracking-tight md:text-4xl">{form.heroTitle || 'About Us'}</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">{form.heroSubtitle}</p>
                {!heroUrl && (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-xs text-white/80">
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" /> No header photo
                  </span>
                )}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <Field label="Title">
                    <Input className="h-10" placeholder="About Us" value={form.heroTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroTitle: e.target.value }))} />
                  </Field>
                  <Field label="Introduction" count={{ value: form.heroSubtitle, max: 220, recommended: true }}>
                    <TextArea rows={3} value={form.heroSubtitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))} />
                  </Field>
                </div>
                <ImageUrlField label="Header photo" value={form.heroImageUrl} onChange={(heroImageUrl) => setForm((prev) => ({ ...prev, heroImageUrl }))} size="header" hint="Shown faintly behind the heading." />
              </div>
            </Block>

            {/* ── Story & mission ──────────────────────────────── */}
            <Block id="story" icon={<BookOpen className="h-4.5 w-4.5" />} title="Story & mission" description="Click a heading to rename it.">
              <div className="grid gap-5 xl:grid-cols-2">
                {([
                  { key: 'story', icon: <BookOpen className="h-4 w-4" />, accent: 'border-t-primary', titleKey: 'storyTitle', bodyKey: 'storyBody', placeholder: 'Our Story', rows: 7 },
                  { key: 'mission', icon: <Target className="h-4 w-4" />, accent: 'border-t-amber-500', titleKey: 'missionTitle', bodyKey: 'missionBody', placeholder: 'Our Mission', rows: 7 },
                ] as const).map((part) => (
                  <article key={part.key} className={cn('min-w-0 space-y-3 rounded-xl border border-t-4 border-border bg-card p-4 shadow-sm md:p-5', part.accent)}>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground" aria-hidden="true">{part.icon}</span>
                      <Input
                        aria-label={`${part.placeholder} heading`}
                        className={cn(inlineInput, 'h-10 px-2 text-lg font-semibold md:text-lg')}
                        placeholder={part.placeholder}
                        value={form[part.titleKey] || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [part.titleKey]: e.target.value }))}
                      />
                    </div>
                    <MarkdownEditor
                      aria-label={part.placeholder}
                      value={form[part.bodyKey] || ''}
                      onChange={(value) => setForm((prev) => ({ ...prev, [part.bodyKey]: value }))}
                      rows={part.rows}
                    />
                  </article>
                ))}
              </div>
            </Block>

            {/* ── Values ───────────────────────────────────────── */}
            <Block id="values" icon={<Sparkles className="h-4.5 w-4.5" />} title="Values" count={highlights.length} description="Short cards, e.g. Safety, Community, Expertise.">
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((highlight, index) => (
                  <article key={index} className="group relative rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow focus-within:shadow-md hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-hidden="true">
                        {(highlight.title || '?').trim().charAt(0).toUpperCase() || index + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <Input
                          aria-label={`Value ${index + 1} title`}
                          className={cn(inlineInput, 'h-9 px-2 text-base font-semibold')}
                          value={highlight.title}
                          onChange={(e) => updateHighlight(index, { title: e.target.value })}
                          placeholder="e.g. Safety first"
                        />
                        <TextArea
                          aria-label={`Value ${index + 1} description`}
                          rows={2}
                          className={cn(inlineInput, 'min-h-0 px-2 py-1.5 text-muted-foreground')}
                          value={highlight.description}
                          onChange={(e) => updateHighlight(index, { description: e.target.value })}
                          placeholder="One or two sentences"
                        />
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 rounded-lg bg-card/90">
                      {itemActions('highlights', index, highlights.length, highlight.title || 'value', { reveal: true })}
                    </div>
                  </article>
                ))}
                <AddTile
                  icon={<Plus className="h-5 w-5" />}
                  label="Add value"
                  onClick={() => setForm((prev) => ({ ...prev, highlights: [...(prev.highlights || []), { title: '', description: '' }] }))}
                />
              </div>
            </Block>

            {/* ── Why choose us ────────────────────────────────── */}
            <Block id="why" icon={<CheckCircle2 className="h-4.5 w-4.5" />} title="Why choose us" count={whyChooseUs.length} description="Short reasons, shown as a checklist. Links like [trek packages](/destinations) work.">
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                {whyChooseUs.map((point, index) => (
                  <li key={index} className="group flex items-start gap-3 px-3 py-2.5 transition-colors focus-within:bg-muted/40 hover:bg-muted/40 md:px-4">
                    <CheckCircle2 className="mt-2.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <TextArea
                      rows={1}
                      className={cn(inlineInput, 'min-h-0 flex-1 px-2 py-2')}
                      value={point}
                      placeholder="A reason travellers should pick you"
                      aria-label={`Reason ${index + 1}`}
                      onChange={(e) => setForm((prev) => ({ ...prev, whyChooseUs: (prev.whyChooseUs || []).map((item, i) => (i === index ? e.target.value : item)) }))}
                    />
                    {itemActions('whyChooseUs', index, whyChooseUs.length, 'reason', { reveal: true })}
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, whyChooseUs: [...(prev.whyChooseUs || []), ''] }))}
                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:px-4"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" /> Add reason
                  </button>
                </li>
              </ul>
            </Block>

            {/* ── Numbers ──────────────────────────────────────── */}
            <Block id="stats" icon={<BarChart3 className="h-4.5 w-4.5" />} title="Numbers" count={stats.length} description="Optional highlights such as “15+ years” or “2,000 trekkers”.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="group relative rounded-xl border border-border bg-card px-3 pb-4 pt-9 text-center shadow-sm">
                    <div className="absolute right-1 top-1">{itemActions('stats', index, stats.length, stat.label || 'number', { reveal: true })}</div>
                    <Input
                      aria-label={`Number ${index + 1} value`}
                      className={cn(inlineInput, 'h-12 text-center text-3xl font-bold tracking-tight text-primary md:text-3xl')}
                      placeholder="15+"
                      value={stat.value}
                      onChange={(e) => setForm((prev) => ({ ...prev, stats: (prev.stats || []).map((item, i) => (i === index ? { ...item, value: e.target.value } : item)) }))}
                    />
                    <Input
                      aria-label={`Number ${index + 1} label`}
                      className={cn(inlineInput, 'mt-1 h-8 text-center text-sm text-muted-foreground')}
                      placeholder="Years of experience"
                      value={stat.label}
                      onChange={(e) => setForm((prev) => ({ ...prev, stats: (prev.stats || []).map((item, i) => (i === index ? { ...item, label: e.target.value } : item)) }))}
                    />
                  </div>
                ))}
                <AddTile
                  icon={<Plus className="h-5 w-5" />}
                  label="Add number"
                  onClick={() => setForm((prev) => ({ ...prev, stats: [...(prev.stats || []), { label: '', value: '' }] }))}
                />
              </div>
            </Block>

            {/* ── Team ─────────────────────────────────────────── */}
            <Block id="team" icon={<Users2 className="h-4.5 w-4.5" />} title="Team" count={teamMembers.length} description="Click a person to edit their profile.">
              <Field label="Section heading" className="max-w-md">
                <Input className="h-10" placeholder="Meet Our Team" value={form.teamTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, teamTitle: e.target.value }))} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {teamMembers.map((member, index) => {
                  const years = yearsGuiding(member.guidingSince)
                  const socialCount = TEAM_SOCIAL_FIELDS.filter(({ key }) => member.social?.[key]?.trim()).length
                  const invalid = memberHasInvalidSocial(member)
                  return (
                    <article key={index} className={cn('group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md', invalid ? 'border-destructive/60' : 'border-border')}>
                      <button
                        type="button"
                        onClick={() => setEditing({ kind: 'member', index })}
                        className="flex flex-1 flex-col items-center px-4 pb-4 pt-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        aria-label={`Edit ${member.name || 'team member'}`}
                      >
                        <span className="relative h-20 w-20 overflow-hidden rounded-full bg-muted ring-4 ring-primary/10">
                          {member.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                              {(member.name || '?').trim().charAt(0).toUpperCase() || '?'}
                            </span>
                          )}
                        </span>
                        <span className="mt-3 block w-full truncate font-semibold text-foreground">{member.name || 'New team member'}</span>
                        <span className="block w-full truncate text-sm text-primary">{member.role || 'Add a role'}</span>
                        {member.description && <span className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{member.description}</span>}
                        <span className="mt-3 flex flex-wrap justify-center gap-1.5">
                          {years && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{years} yrs guiding</span>}
                          {member.licenceNumber && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              <Award className="h-3 w-3" aria-hidden="true" /> Licensed
                            </span>
                          )}
                          {socialCount > 0 && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{socialCount} social</span>}
                          {invalid && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">Fix social link</span>}
                        </span>
                      </button>
                      <div className="flex items-center justify-between border-t border-border px-2 py-1">
                        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setEditing({ kind: 'member', index })}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        {itemActions('teamMembers', index, teamMembers.length, member.name || 'team member')}
                      </div>
                    </article>
                  )
                })}
                <AddTile
                  className="min-h-64"
                  icon={<UserPlus className="h-6 w-6" />}
                  label="Add team member"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, teamMembers: [...(prev.teamMembers || []), { name: '', role: '', description: '', imageUrl: '' }] }))
                    setEditing({ kind: 'member', index: teamMembers.length })
                  }}
                />
              </div>
            </Block>

            {/* ── Memberships ──────────────────────────────────── */}
            <Block id="associations" icon={<Building2 className="h-4.5 w-4.5" />} title="Memberships" count={associations.length} description="Organisations you're registered with, shown as a logo wall. Click a logo to edit.">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {associations.map((association, index) => (
                  <article key={index} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                    <button
                      type="button"
                      onClick={() => setEditing({ kind: 'association', index })}
                      aria-label={`Edit ${association.name || 'organisation'}`}
                      className="flex flex-1 flex-col items-center gap-3 p-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="flex h-20 w-full items-center justify-center rounded-lg bg-white p-2 dark:bg-white/95">
                        {association.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={association.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />
                        )}
                      </span>
                      <span className="line-clamp-2 text-xs font-medium leading-snug text-foreground">{association.name || 'Unnamed organisation'}</span>
                    </button>
                    <div className="flex justify-center border-t border-border py-0.5">
                      {itemActions('associations', index, associations.length, association.name || 'organisation')}
                    </div>
                  </article>
                ))}
                <AddTile
                  className="min-h-40"
                  icon={<Plus className="h-5 w-5" />}
                  label="Add organisation"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, associations: [...(prev.associations || []), { name: '', logoUrl: '' }] }))
                    setEditing({ kind: 'association', index: associations.length })
                  }}
                />
              </div>
            </Block>
          </div>
        </>
      )}

      {/* ── Side panel editor for team members & memberships ── */}
      <Sheet open={!!(editingMember || editingAssociation)} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
          {editing && editingMember && (
            <>
              <SheetHeader className="border-b border-border px-6 py-5">
                <SheetTitle>{editingMember.name || 'New team member'}</SheetTitle>
                <SheetDescription>Profile shown in the team section of the About page.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <FieldGrid>
                  <Field label="Name"><Input className="h-10" value={editingMember.name} onChange={(e) => updateTeamMember(editing.index, { name: e.target.value })} /></Field>
                  <Field label="Role"><Input className="h-10" placeholder="e.g. Lead guide" value={editingMember.role} onChange={(e) => updateTeamMember(editing.index, { role: e.target.value })} /></Field>
                </FieldGrid>
                <ImageUrlField label="Photo" aspect="square" value={editingMember.imageUrl} onChange={(imageUrl) => updateTeamMember(editing.index, { imageUrl })} hint="Square portrait works best." />
                <Field label="Bio">
                  <TextArea rows={4} value={editingMember.description} onChange={(e) => updateTeamMember(editing.index, { description: e.target.value })} />
                </Field>
                <FieldGrid>
                  <Field label="Guide licence number" hint="Optional. Shown on the About page.">
                    <Input className="h-10" maxLength={60} placeholder="e.g. 12345" value={editingMember.licenceNumber || ''} onChange={(e) => updateTeamMember(editing.index, { licenceNumber: e.target.value })} />
                  </Field>
                  <Field label="Guiding since (year)" hint="Optional. Years of experience are worked out from this.">
                    <Input
                      className="h-10"
                      type="number"
                      inputMode="numeric"
                      min={1950}
                      max={new Date().getFullYear()}
                      placeholder="e.g. 2004"
                      value={editingMember.guidingSince ?? ''}
                      onChange={(e) => updateTeamMember(editing.index, { guidingSince: e.target.value ? Number(e.target.value) : null })}
                    />
                  </Field>
                </FieldGrid>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-foreground">Social profiles <span className="font-normal text-muted-foreground">(optional)</span></legend>
                  {TEAM_SOCIAL_FIELDS.map(({ key, label, placeholder }) => {
                    const value = editingMember.social?.[key] || ''
                    return (
                      <Field key={key} label={label} error={value.trim() && !isValidSocialUrl(value.trim()) ? 'Use a full link starting with https://' : undefined}>
                        <Input className="h-10" type="url" value={value} placeholder={placeholder} onChange={(e) => updateTeamMember(editing.index, { social: { ...editingMember.social, [key]: e.target.value } })} />
                      </Field>
                    )
                  })}
                </fieldset>
              </div>
            </>
          )}
          {editing && editingAssociation && (
            <>
              <SheetHeader className="border-b border-border px-6 py-5">
                <SheetTitle>{editingAssociation.name || 'New organisation'}</SheetTitle>
                <SheetDescription>Logo shown in the memberships section of the About page.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <Field label="Organisation name">
                  <Input className="h-10" placeholder="e.g. Nepal Tourism Board" value={editingAssociation.name} onChange={(e) => updateAssociation(editing.index, { name: e.target.value })} />
                </Field>
                <ImageUrlField label="Logo" aspect="logo" value={editingAssociation.logoUrl} onChange={(logoUrl) => updateAssociation(editing.index, { logoUrl })} hint="A transparent PNG or SVG looks best." />
              </div>
            </>
          )}
          <SheetFooter className="border-t border-border px-6 py-4">
            <Button type="button" onClick={() => setEditing(null)}>Done</Button>
            <p className="text-center text-xs text-muted-foreground">Changes are kept here until you save the page.</p>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {!loading && (
        <SaveBar
          dirty={dirty}
          saving={saving}
          onSave={() => void onSave()}
          onDiscard={dirty ? onDiscard : undefined}
          saveLabel="Save about page"
          status={!dirty && !saving && lastUpdatedAt ? `Last saved ${new Date(lastUpdatedAt).toLocaleString()}` : undefined}
        />
      )}
    </div>
  )
}
