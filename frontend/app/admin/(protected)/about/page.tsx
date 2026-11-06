'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AdminPageHeader,
  EmptyState,
  Field,
  FieldGrid,
  FieldPanel,
  FormSection,
  FormSkeleton,
  ImageUrlField,
  SaveBar,
  SectionNav,
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
import { ArrowDown, ArrowUp, Building2, ChevronDown, ExternalLink, Plus, Trash2, Users2 } from 'lucide-react'

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

export default function AdminAboutPage() {
  const [form, setForm] = useState<AdminAbout & { associations: AdminAboutAssociation[] }>(defaultAbout)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')
  const [openMember, setOpenMember] = useState<number | null>(null)
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

  const itemActions = (listKey: ListKey, index: number, length: number, label: string) => (
    <>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => moveItem(listKey, index, -1)} aria-label={`Move ${label} up`}><ArrowUp className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === length - 1} onClick={() => moveItem(listKey, index, 1)} aria-label={`Move ${label} down`}><ArrowDown className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(listKey, index)} aria-label={`Remove ${label}`}><Trash2 className="h-4 w-4" /></Button>
    </>
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
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_11rem]">
          <div className="min-w-0 space-y-8">
            <FormSection id="header" title="Page header" description="Title, introduction and photo at the top of the page.">
              <Field label="Title">
                <Input className="h-10" placeholder="About Us" value={form.heroTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroTitle: e.target.value }))} />
              </Field>
              <Field label="Introduction" count={{ value: form.heroSubtitle, max: 220, recommended: true }}>
                <TextArea rows={3} value={form.heroSubtitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))} />
              </Field>
              <ImageUrlField label="Header photo" value={form.heroImageUrl} onChange={(heroImageUrl) => setForm((prev) => ({ ...prev, heroImageUrl }))} hint="A team or landscape photo, at least 1600 px wide." />
            </FormSection>

            <FormSection id="story" title="Story & mission">
              <Field label="Story heading">
                <Input className="h-10" placeholder="Our Story" value={form.storyTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, storyTitle: e.target.value }))} />
              </Field>
              <Field label="Story">
                <MarkdownEditor value={form.storyBody || ''} onChange={(storyBody) => setForm((prev) => ({ ...prev, storyBody }))} rows={7} />
              </Field>
              <Field label="Mission heading">
                <Input className="h-10" placeholder="Our Mission" value={form.missionTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, missionTitle: e.target.value }))} />
              </Field>
              <Field label="Mission">
                <MarkdownEditor value={form.missionBody || ''} onChange={(missionBody) => setForm((prev) => ({ ...prev, missionBody }))} rows={5} />
              </Field>
            </FormSection>

            <FormSection id="values" title="Values" description="Short cards, e.g. Safety, Community, Expertise.">
              {highlights.map((highlight, index) => (
                <FieldPanel key={index} title={highlight.title || `Value ${index + 1}`} actions={itemActions('highlights', index, highlights.length, 'value')}>
                  <Field label="Title">
                    <Input className="h-10" value={highlight.title} onChange={(e) => updateHighlight(index, { title: e.target.value })} placeholder="e.g. Safety first" />
                  </Field>
                  <Field label="Description">
                    <TextArea rows={2} className="min-h-0" value={highlight.description} onChange={(e) => updateHighlight(index, { description: e.target.value })} />
                  </Field>
                </FieldPanel>
              ))}
              <Button type="button" variant="outline" className="w-full gap-1.5" onClick={() => setForm((prev) => ({ ...prev, highlights: [...(prev.highlights || []), { title: '', description: '' }] }))}>
                <Plus className="h-4 w-4" /> Add value
              </Button>
            </FormSection>

            <FormSection id="why" title="Why choose us" description="Short reasons, one per point. Links like [trek packages](/destinations) work.">
              {whyChooseUs.map((point, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                  <TextArea
                    rows={2}
                    className="min-h-0 flex-1"
                    value={point}
                    aria-label={`Reason ${index + 1}`}
                    onChange={(e) => setForm((prev) => ({ ...prev, whyChooseUs: (prev.whyChooseUs || []).map((item, i) => (i === index ? e.target.value : item)) }))}
                  />
                  <div className="flex shrink-0 flex-col sm:flex-row">{itemActions('whyChooseUs', index, whyChooseUs.length, 'reason')}</div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full gap-1.5" onClick={() => setForm((prev) => ({ ...prev, whyChooseUs: [...(prev.whyChooseUs || []), ''] }))}>
                <Plus className="h-4 w-4" /> Add reason
              </Button>
            </FormSection>

            <FormSection id="stats" title="Numbers" description="Optional highlights such as “15+ years” or “2,000 trekkers”.">
              {stats.length === 0 && <p className="text-sm text-muted-foreground">No numbers added.</p>}
              {stats.map((stat, index) => (
                <div key={index} className="flex items-end gap-2">
                  <FieldGrid className="flex-1">
                    <Field label="Number">
                      <Input className="h-10" placeholder="e.g. 15+" value={stat.value} onChange={(e) => setForm((prev) => ({ ...prev, stats: (prev.stats || []).map((item, i) => (i === index ? { ...item, value: e.target.value } : item)) }))} />
                    </Field>
                    <Field label="Label">
                      <Input className="h-10" placeholder="e.g. Years of experience" value={stat.label} onChange={(e) => setForm((prev) => ({ ...prev, stats: (prev.stats || []).map((item, i) => (i === index ? { ...item, label: e.target.value } : item)) }))} />
                    </Field>
                  </FieldGrid>
                  <div className="flex shrink-0 pb-1">{itemActions('stats', index, stats.length, 'number')}</div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full gap-1.5" onClick={() => setForm((prev) => ({ ...prev, stats: [...(prev.stats || []), { label: '', value: '' }] }))}>
                <Plus className="h-4 w-4" /> Add number
              </Button>
            </FormSection>

            <FormSection id="team" title="Team" description="Click a person to edit their profile.">
              <Field label="Section heading">
                <Input className="h-10" placeholder="Meet Our Team" value={form.teamTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, teamTitle: e.target.value }))} />
              </Field>
              {teamMembers.length === 0 ? (
                <EmptyState icon={<Users2 className="h-5 w-5" />} title="No team members yet" />
              ) : (
                <ul className="space-y-2">
                  {teamMembers.map((member, index) => {
                    const open = openMember === index
                    return (
                      <li key={index} className={cn('rounded-lg border bg-background', open ? 'border-primary/40 shadow-sm' : 'border-border')}>
                        <div className="flex items-center gap-2 p-2 pl-3">
                          <button type="button" onClick={() => setOpenMember(open ? null : index)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {member.imageUrl ? <img src={member.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">{member.name || 'New team member'}</span>
                              <span className="block truncate text-xs text-muted-foreground">{member.role || 'Role'}</span>
                            </span>
                            <ChevronDown className={cn('ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
                          </button>
                          <div className="flex shrink-0">{itemActions('teamMembers', index, teamMembers.length, member.name || 'team member')}</div>
                        </div>
                        {open && (
                          <div className="space-y-4 border-t border-border p-4">
                            <FieldGrid>
                              <Field label="Name"><Input className="h-10" value={member.name} onChange={(e) => updateTeamMember(index, { name: e.target.value })} /></Field>
                              <Field label="Role"><Input className="h-10" placeholder="e.g. Lead guide" value={member.role} onChange={(e) => updateTeamMember(index, { role: e.target.value })} /></Field>
                            </FieldGrid>
                            <ImageUrlField label="Photo" aspect="square" value={member.imageUrl} onChange={(imageUrl) => updateTeamMember(index, { imageUrl })} hint="Square portrait works best." />
                            <Field label="Bio">
                              <TextArea rows={3} value={member.description} onChange={(e) => updateTeamMember(index, { description: e.target.value })} />
                            </Field>
                            <fieldset className="space-y-3">
                              <legend className="text-sm font-medium text-foreground">Social profiles <span className="font-normal text-muted-foreground">(optional)</span></legend>
                              <FieldGrid>
                                {TEAM_SOCIAL_FIELDS.map(({ key, label, placeholder }) => {
                                  const value = member.social?.[key] || ''
                                  return (
                                    <Field key={key} label={label} error={value.trim() && !isValidSocialUrl(value.trim()) ? 'Use a full link starting with https://' : undefined}>
                                      <Input className="h-10" type="url" value={value} placeholder={placeholder} onChange={(e) => updateTeamMember(index, { social: { ...member.social, [key]: e.target.value } })} />
                                    </Field>
                                  )
                                })}
                              </FieldGrid>
                            </fieldset>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => {
                  setForm((prev) => ({ ...prev, teamMembers: [...(prev.teamMembers || []), { name: '', role: '', description: '', imageUrl: '' }] }))
                  setOpenMember(teamMembers.length)
                }}
              >
                <Plus className="h-4 w-4" /> Add team member
              </Button>
            </FormSection>

            <FormSection id="associations" title="Memberships" description="Organisations you're registered with, shown as logos.">
              {associations.length === 0 && <EmptyState icon={<Building2 className="h-5 w-5" />} title="No memberships added" />}
              {associations.map((association, index) => (
                <FieldPanel key={index} title={association.name || `Organisation ${index + 1}`} actions={itemActions('associations', index, associations.length, 'organisation')}>
                  <Field label="Organisation name">
                    <Input className="h-10" placeholder="e.g. Nepal Tourism Board" value={association.name} onChange={(e) => updateAssociation(index, { name: e.target.value })} />
                  </Field>
                  <ImageUrlField label="Logo" aspect="logo" value={association.logoUrl} onChange={(logoUrl) => updateAssociation(index, { logoUrl })} />
                </FieldPanel>
              ))}
              <Button type="button" variant="outline" className="w-full gap-1.5" onClick={() => setForm((prev) => ({ ...prev, associations: [...(prev.associations || []), { name: '', logoUrl: '' }] }))}>
                <Plus className="h-4 w-4" /> Add organisation
              </Button>
            </FormSection>
          </div>

          <div className="xl:sticky xl:top-20 xl:self-start">
            <SectionNav
              sections={[
                { id: 'header', label: 'Page header' },
                { id: 'story', label: 'Story & mission' },
                { id: 'values', label: 'Values' },
                { id: 'why', label: 'Why choose us' },
                { id: 'stats', label: 'Numbers' },
                { id: 'team', label: 'Team' },
                { id: 'associations', label: 'Memberships' },
              ]}
            />
          </div>
        </div>
      )}

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
