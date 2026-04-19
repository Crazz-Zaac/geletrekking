'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AdminAbout,
  AdminAboutAssociation,
  AdminAboutHighlight,
  AdminAboutTeamMember,
  getAdminAbout,
  updateAdminAbout,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { Bold, Italic, Heading2, List, ListOrdered, Quote, Trash2, Plus, AlertCircle, CheckCircle, BookOpen, Heart, Users, Zap, Users2, Link as LinkIcon, Building2, BarChart3, ExternalLink } from 'lucide-react'

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

const TextFormattingTools = ({
  onFormat,
}: {
  onFormat: (before: string, after?: string, placeholder?: string) => void
}) => (
  <div className="rounded-md border border-border bg-muted/50 p-2 mb-2">
    <div className="flex flex-wrap items-center gap-1.5">
      <Button variant="ghost" size="sm" onClick={() => onFormat('**', '**', 'bold text')} className="h-8 px-2" title="Bold">
        <Bold className="w-4 h-4 mr-1" />
        <span className="text-xs">Bold</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onFormat('*', '*', 'italic text')} className="h-8 px-2" title="Italic">
        <Italic className="w-4 h-4 mr-1" />
        <span className="text-xs">Italic</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onFormat('## ', '', 'Heading')} className="h-8 px-2" title="Heading">
        <Heading2 className="w-4 h-4 mr-1" />
        <span className="text-xs">Heading</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onFormat('- ', '', 'List item')} className="h-8 px-2" title="Bullet List">
        <List className="w-4 h-4 mr-1" />
        <span className="text-xs">Bullet</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onFormat('1. ', '', 'List item')} className="h-8 px-2" title="Numbered List">
        <ListOrdered className="w-4 h-4 mr-1" />
        <span className="text-xs">Numbered</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onFormat('> ', '', 'Quote')} className="h-8 px-2" title="Quote">
        <Quote className="w-4 h-4 mr-1" />
        <span className="text-xs">Quote</span>
      </Button>
    </div>
    <p className="mt-2 text-[11px] text-muted-foreground">
      Tip: highlight text first, then click a format option.
    </p>
  </div>
)

export default function AdminAboutPage() {
  const [form, setForm] = useState<AdminAbout & { associations: AdminAboutAssociation[] }>(defaultAbout)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')

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

      setForm({
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
      })
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
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateAdminAbout(token, form)
      setMessage('About page updated successfully.')
      setTimeout(() => setMessage(''), 5000)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save about page')
    } finally {
      setSaving(false)
    }
  }

  const handleTextAreaInsert = (
    textareaId: string,
    beforeText: string,
    afterText = '',
    placeholder = 'text'
  ) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart || 0
      const end = textarea.selectionEnd || 0
      const value = textarea.value
      const selectedText = value.substring(start, end)
      const content = selectedText || placeholder
      const insertion = `${beforeText}${content}${afterText}`
      const newValue = value.substring(0, start) + insertion + value.substring(end)

      if (textareaId === 'heroSubtitle') {
        setForm((prev) => ({ ...prev, heroSubtitle: newValue }))
      } else if (textareaId === 'storyBody') {
        setForm((prev) => ({ ...prev, storyBody: newValue }))
      } else if (textareaId === 'missionBody') {
        setForm((prev) => ({ ...prev, missionBody: newValue }))
      }

      setTimeout(() => {
        textarea.focus()
        const cursor = start + insertion.length
        textarea.setSelectionRange(cursor, cursor)
      }, 0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">About Page Editor</h1>
          <p className="text-muted-foreground">Customize the content shown on your public About page</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-400">Error</p>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {message && (
          <Card className="mb-6 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="flex items-start gap-3 pt-6">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800 dark:text-emerald-300">{message}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-border shadow-lg">
          <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-background">
            <CardTitle>About Page Content</CardTitle>
            <CardDescription>Edit sections that appear on the public About page. Supports markdown formatting.</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading about page...</span>
              </div>
            ) : (
              <Tabs defaultValue="hero" className="w-full">
                <TabsList className="grid w-full grid-cols-7 lg:w-auto mb-6 overflow-x-auto">
                  <TabsTrigger value="hero" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Hero</span>
                  </TabsTrigger>
                  <TabsTrigger value="story" className="gap-2">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Story</span>
                  </TabsTrigger>
                  <TabsTrigger value="values" className="gap-2">
                    <Heart className="w-4 h-4" />
                    <span className="hidden sm:inline">Values</span>
                  </TabsTrigger>
                  <TabsTrigger value="why" className="gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">Why Us</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="gap-2">
                    <Users2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Team</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="associations" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Associates</span>
                  </TabsTrigger>
                </TabsList>

                {/* ── Hero Tab ── */}
                <TabsContent value="hero" className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Hero Section
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Page Heading</label>
                        <Input
                          placeholder="e.g., About Us"
                          value={form.heroTitle || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Subtitle / Introduction</label>
                        <TextFormattingTools
                          onFormat={(before, after, placeholder) =>
                            handleTextAreaInsert('heroSubtitle', before, after, placeholder)
                          }
                        />
                        <Textarea
                          id="heroSubtitle"
                          rows={4}
                          value={form.heroSubtitle || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                          placeholder="Write a compelling introduction..."
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{form.heroSubtitle?.length || 0} characters</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Stats Tab ── */}
                <TabsContent value="stats" className="space-y-6">
                  <div className="bg-gradient-to-br from-cyan-50/50 to-sky-50/50 dark:from-cyan-950/20 dark:to-sky-950/20 p-6 rounded-lg border border-cyan-200/50 dark:border-cyan-800/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        About Page Stats
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setForm((prev) => ({ ...prev, stats: [...(prev.stats || []), { label: '', value: '' }] }))}
                        className="gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add Stat
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5">
                      These cards appear near the top of the public About page.
                    </p>

                    <div className="space-y-3">
                      {(form.stats || []).map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-slate-950 border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Label</label>
                              <Input
                                value={stat.label}
                                onChange={(e) => {
                                  const next = [...(form.stats || [])]
                                  next[index] = { ...next[index], label: e.target.value }
                                  setForm((prev) => ({ ...prev, stats: next }))
                                }}
                                placeholder="e.g., Years Of Local Expertise"
                                className="h-9"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Value</label>
                              <Input
                                value={stat.value}
                                onChange={(e) => {
                                  const next = [...(form.stats || [])]
                                  next[index] = { ...next[index], value: e.target.value }
                                  setForm((prev) => ({ ...prev, stats: next }))
                                }}
                                placeholder="e.g., 15+"
                                className="h-9"
                              />
                            </div>
                            <div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setForm((prev) => ({ ...prev, stats: (prev.stats || []).filter((_, idx) => idx !== index) }))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!form.stats || form.stats.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No stats added yet. Add cards to highlight credibility.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Story & Mission Tab ── */}
                <TabsContent value="story" className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Story & Mission
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Story Section Title</label>
                          <Input
                            placeholder="e.g., Our Story"
                            value={form.storyTitle || ''}
                            onChange={(e) => setForm((prev) => ({ ...prev, storyTitle: e.target.value }))}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Mission Section Title</label>
                          <Input
                            placeholder="e.g., Our Mission"
                            value={form.missionTitle || ''}
                            onChange={(e) => setForm((prev) => ({ ...prev, missionTitle: e.target.value }))}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Story Content</label>
                        <TextFormattingTools
                          onFormat={(before, after, placeholder) =>
                            handleTextAreaInsert('storyBody', before, after, placeholder)
                          }
                        />
                        <Textarea
                          id="storyBody"
                          rows={6}
                          value={form.storyBody || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, storyBody: e.target.value }))}
                          placeholder="Tell your company's origin story..."
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{form.storyBody?.length || 0} characters</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Mission Content</label>
                        <TextFormattingTools
                          onFormat={(before, after, placeholder) =>
                            handleTextAreaInsert('missionBody', before, after, placeholder)
                          }
                        />
                        <Textarea
                          id="missionBody"
                          rows={6}
                          value={form.missionBody || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, missionBody: e.target.value }))}
                          placeholder="Describe your mission and vision..."
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{form.missionBody?.length || 0} characters</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Values Tab ── */}
                <TabsContent value="values" className="space-y-6">
                  <div className="bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-lg border border-red-200/50 dark:border-red-800/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                        Our Values / Highlights
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setForm((prev) => ({ ...prev, highlights: [...(prev.highlights || []), { title: '', description: '' }] }))}
                        className="gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add Value
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(form.highlights || []).map((highlight, index) => (
                        <div key={index} className="bg-white dark:bg-slate-950 border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value {index + 1}</p>
                            <Button variant="destructive" size="sm" onClick={() => setForm((prev) => ({ ...prev, highlights: (prev.highlights || []).filter((_, idx) => idx !== index) }))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title</label>
                              <Input value={highlight.title} onChange={(e) => updateHighlight(index, { title: e.target.value })} placeholder="e.g., Excellence" className="h-9" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                              <Textarea
                                value={highlight.description}
                                onChange={(e) => updateHighlight(index, { description: e.target.value })}
                                placeholder="Describe this value..."
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Why Choose Us Tab ── */}
                <TabsContent value="why" className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-lg border border-green-200/50 dark:border-green-800/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Why Choose Us
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setForm((prev) => ({ ...prev, whyChooseUs: [...(prev.whyChooseUs || []), ''] }))}
                        className="gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add Point
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(form.whyChooseUs || []).map((point, index) => (
                        <div key={index} className="bg-white dark:bg-slate-950 border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Point {index + 1}</p>
                            <Button variant="destructive" size="sm" onClick={() => setForm((prev) => ({ ...prev, whyChooseUs: (prev.whyChooseUs || []).filter((_, idx) => idx !== index) }))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 items-start">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reason</label>
                              <Textarea
                                value={point}
                                onChange={(e) => {
                                  const next = [...(form.whyChooseUs || [])]
                                  next[index] = e.target.value
                                  setForm((prev) => ({ ...prev, whyChooseUs: next }))
                                }}
                                placeholder="Enter a reason to choose us..."
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Team Tab ── */}
                <TabsContent value="team" className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30">
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Section Title</label>
                        <Input
                          placeholder="e.g., Meet Our Team"
                          value={form.teamTitle || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, teamTitle: e.target.value }))}
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Team Members
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setForm((prev) => ({ ...prev, teamMembers: [...(prev.teamMembers || []), { name: '', role: '', description: '', imageUrl: '' }] }))}
                        className="gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add Team Member
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {(form.teamMembers || []).map((member, index) => (
                        <div key={index} className="bg-white dark:bg-slate-950 border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
                                  <Input value={member.name} onChange={(e) => updateTeamMember(index, { name: e.target.value })} placeholder="e.g., John Sherpa" className="h-9" />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
                                  <Input value={member.role} onChange={(e) => updateTeamMember(index, { role: e.target.value })} placeholder="e.g., Lead Guide" className="h-9" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Profile Image URL</label>
                                <div className="flex gap-2">
                                  <Input value={member.imageUrl} onChange={(e) => updateTeamMember(index, { imageUrl: e.target.value })} placeholder="https://example.com/image.jpg or S3 URL" className="h-9" />
                                  {member.imageUrl && (
                                    <Button variant="outline" size="sm" asChild className="h-9">
                                      <a href={member.imageUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="w-4 h-4" /></a>
                                    </Button>
                                  )}
                                </div>
                                {member.imageUrl && (
                                  <div className="mt-2 rounded-lg overflow-hidden border border-border max-w-xs">
                                    <img src={member.imageUrl} alt={member.name} className="w-full h-32 object-cover" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio / Description</label>
                                <Textarea value={member.description} onChange={(e) => updateTeamMember(index, { description: e.target.value })} placeholder="Brief bio about this team member..." rows={3} className="text-sm" />
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Button variant="destructive" size="sm" onClick={() => setForm((prev) => ({ ...prev, teamMembers: (prev.teamMembers || []).filter((_, idx) => idx !== index) }))}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!form.teamMembers || form.teamMembers.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                          <Users2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No team members added yet. Add one to get started!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Associations Tab ── */}
                <TabsContent value="associations" className="space-y-6">
                  <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 p-6 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        Association Logos
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            associations: [...(prev.associations || []), { name: '', logoUrl: '' }],
                          }))
                        }
                        className="gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add Association
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5">
                      These logos appear in the &quot;We&apos;re Associates With&quot; section on the public About page.
                    </p>

                    <div className="space-y-3">
                      {(form.associations || []).map((assoc, index) => (
                        <div key={index} className="bg-white dark:bg-slate-950 border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-start">
                            {/* Name */}
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Organisation Name</label>
                              <Input
                                value={assoc.name}
                                onChange={(e) => updateAssociation(index, { name: e.target.value })}
                                placeholder="e.g., Nepal Tourism Board"
                                className="h-9"
                              />
                            </div>

                            {/* Logo URL */}
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Logo Image URL</label>
                              <div className="flex gap-2">
                                <Input
                                  value={assoc.logoUrl}
                                  onChange={(e) => updateAssociation(index, { logoUrl: e.target.value })}
                                  placeholder="https://example.com/logo.png or ImageKit URL"
                                  className="h-9"
                                />
                                {assoc.logoUrl && (
                                  <Button variant="outline" size="sm" asChild className="h-9 shrink-0">
                                    <a href={assoc.logoUrl} target="_blank" rel="noopener noreferrer">
                                      <LinkIcon className="w-4 h-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Delete */}
                            <div className="flex items-start pt-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    associations: (prev.associations || []).filter((_, idx) => idx !== index),
                                  }))
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Inline logo preview */}
                          {assoc.logoUrl && (
                            <div className="mt-3 inline-flex items-center justify-center rounded-md border border-border bg-muted/30 px-3 py-2 max-w-[140px]">
                              <img
                                src={assoc.logoUrl}
                                alt={assoc.name || 'logo preview'}
                                className="h-10 w-auto max-w-[120px] object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      {(!form.associations || form.associations.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No associations added yet. Add one to get started!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {!loading && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Last updated:{' '}
                  <span className="font-medium text-foreground">
                    {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : 'Not saved yet'}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild className="gap-2">
                    <a href="/about" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Preview Page
                    </a>
                  </Button>
                  <Button onClick={onSave} disabled={saving} size="lg" className="gap-2">
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
