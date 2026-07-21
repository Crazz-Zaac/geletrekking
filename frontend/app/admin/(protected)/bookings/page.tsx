'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, GripVertical, Link as LinkIcon, ListPlus, PowerOff, Settings2, ShieldCheck, Trash2, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  createAdminBookingFormLink,
  deactivateAdminBookingFormLink,
  deleteAdminBookingFormLink,
  deleteAdminBookingSubmission,
  downloadAdminBookingPdf,
  getAdminBookingFormLinks,
  getAdminBookingSubmissions,
  markAdminBookingRead,
  markAdminBookingUnread,
  type AdminBookingFormLink,
  type AdminBookingSubmission,
  type BookingFieldType,
} from '@/lib/api'
import {
  defaultBookingFormConfig,
  normalizeBookingFormConfig,
  type BookingFormConfig,
  type BookingFormFieldConfig,
} from '@/lib/booking-form-config'
import { getAdminToken } from '@/lib/admin-auth'

const consentLabels: Record<string, string> = {
  agreeTerms: 'Terms accepted',
  acceptLiabilityWaiver: 'Liability waiver accepted',
  photoMarketingConsent: 'Photo marketing consent',
}

const hiddenFields = new Set(['agreeTerms', 'acceptLiabilityWaiver', 'photoMarketingConsent'])
const fieldTypes: BookingFieldType[] = ['text', 'email', 'tel', 'date', 'time', 'textarea', 'select', 'checkbox']
const lockedFieldIds = new Set(['firstName', 'lastName', 'email', 'trekPackage', 'agreeTerms', 'acceptLiabilityWaiver', 'signatureName', 'signatureDate'])

const slugify = (value: string) => value.trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/^([0-9])/, 'field_$1')
const newField = (): BookingFormFieldConfig => ({ id: `custom_${Date.now()}`, label: 'New field', type: 'text' })

export default function AdminBookingsPage() {
  const [items, setItems] = useState<AdminBookingSubmission[]>([])
  const [links, setLinks] = useState<AdminBookingFormLink[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<AdminBookingSubmission | null>(null)
  const [deleteLinkTarget, setDeleteLinkTarget] = useState<AdminBookingFormLink | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [creatingLink, setCreatingLink] = useState(false)
  const [createdUrl, setCreatedUrl] = useState('')
  const [linkForm, setLinkForm] = useState({ clientName: '', clientEmail: '', trekPackage: '', notes: '', ttlDays: 14 })
  const [formConfig, setFormConfig] = useState<BookingFormConfig>(() => normalizeBookingFormConfig(defaultBookingFormConfig))

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
      const [submissionData, linkData] = await Promise.all([
        getAdminBookingSubmissions(token),
        getAdminBookingFormLinks(token),
      ])
      setItems(submissionData)
      setLinks(linkData)
      if (!selectedId && submissionData.length > 0) setSelectedId(submissionData[0]._id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  const filtered = useMemo(() => {
    if (filter === 'unread') return items.filter((item) => !item.isRead)
    if (filter === 'read') return items.filter((item) => item.isRead)
    return items
  }, [filter, items])

  const selected = useMemo(() => items.find((item) => item._id === selectedId) ?? null, [items, selectedId])
  const unreadCount = items.filter((item) => !item.isRead).length
  const activeLinks = links.filter((link) => link.isActive && !link.submittedAt && new Date(link.expiresAt).getTime() > Date.now())

  const createLink = async () => {
    if (!token) return
    setCreatingLink(true)
    setError('')
    setNotice('')
    try {
      const created = await createAdminBookingFormLink(token, { ...linkForm, formConfig })
      const url = `${window.location.origin}${created.path || `/private-booking/${created.token}`}`
      setCreatedUrl(url)
      setLinks((prev) => [created, ...prev])
      setNotice('Private form link activated. Copy it and send it to the client through your approved channel.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create private form link')
    } finally {
      setCreatingLink(false)
    }
  }

  const copyText = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setNotice('Link copied.')
  }

  const deactivateLink = async (link: AdminBookingFormLink) => {
    if (!token) return
    try {
      const updated = await deactivateAdminBookingFormLink(token, link._id)
      setLinks((prev) => prev.map((item) => (item._id === updated._id ? updated : item)))
      setNotice('Private form link deactivated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate link')
    }
  }

  const handleDeleteLink = async () => {
    if (!token || !deleteLinkTarget) return
    try {
      await deleteAdminBookingFormLink(token, deleteLinkTarget._id)
      setLinks((prev) => prev.filter((item) => item._id !== deleteLinkTarget._id))
      setNotice('Private form link deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link')
    } finally {
      setDeleteLinkTarget(null)
    }
  }

  const toggleRead = async () => {
    if (!token || !selected) return
    try {
      const updated = selected.isRead
        ? await markAdminBookingUnread(token, selected._id)
        : await markAdminBookingRead(token, selected._id)
      setItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission')
    }
  }

  const handleDelete = async () => {
    if (!token || !deleteTarget) return
    try {
      await deleteAdminBookingSubmission(token, deleteTarget._id)
      const next = items.filter((item) => item._id !== deleteTarget._id)
      setItems(next)
      if (selectedId === deleteTarget._id) setSelectedId(next[0]?._id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleDownload = async (submission: AdminBookingSubmission) => {
    if (!token) return
    setDownloadingId(submission._id)
    setError('')
    try {
      const blob = await downloadAdminBookingPdf(token, submission._id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = submission.pdfFilename || `booking-form-${submission._id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const updateSection = (sectionIndex: number, patch: Partial<BookingFormConfig[number]>) => {
    setFormConfig((prev) => prev.map((section, index) => (index === sectionIndex ? { ...section, ...patch } : section)))
  }

  const updateField = (sectionIndex: number, fieldIndex: number, patch: Partial<BookingFormFieldConfig>) => {
    setFormConfig((prev) => prev.map((section, index) => {
      if (index !== sectionIndex) return section
      return { ...section, fields: section.fields.map((field, innerIndex) => (innerIndex === fieldIndex ? { ...field, ...patch } : field)) }
    }))
  }

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    setFormConfig((prev) => prev.map((section, index) => {
      if (index !== sectionIndex) return section
      return { ...section, fields: section.fields.filter((_, innerIndex) => innerIndex !== fieldIndex) }
    }))
  }

  const addField = (sectionIndex: number) => {
    setFormConfig((prev) => prev.map((section, index) => (index === sectionIndex ? { ...section, fields: [...section.fields, newField()] } : section)))
  }

  const resetFormConfig = () => setFormConfig(normalizeBookingFormConfig(defaultBookingFormConfig))
  const formatFieldName = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())
  const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
  const compactInputClass = 'w-full rounded-md border border-input bg-background px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/50 disabled:text-muted-foreground'
  const totalFields = formConfig.reduce((sum, section) => sum + section.fields.length, 0)
  const requiredFields = formConfig.reduce((sum, section) => sum + section.fields.filter((field) => field.required).length, 0)

  return (
    <>
      <Tabs defaultValue="links" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="links">Private Links</TabsTrigger>
          <TabsTrigger value="fields">Form Fields</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Activate Private Form Link</CardTitle>
                <CardDescription>Create a client link. It expires after the number of days you set below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {error && <p className="text-sm text-red-600">{error}</p>}
                {notice && <p className="text-sm text-emerald-700">{notice}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Client name" value={linkForm.clientName} onChange={(event) => setLinkForm((prev) => ({ ...prev, clientName: event.target.value }))} />
                  <input className={inputClass} placeholder="Client email" value={linkForm.clientEmail} onChange={(event) => setLinkForm((prev) => ({ ...prev, clientEmail: event.target.value }))} />
                  <input className={inputClass} placeholder="Trek package" value={linkForm.trekPackage} onChange={(event) => setLinkForm((prev) => ({ ...prev, trekPackage: event.target.value }))} />
                  <label className="space-y-1 text-xs font-medium text-muted-foreground">
                    Link expires after days
                    <input className={inputClass} type="number" min={1} max={60} value={linkForm.ttlDays} onChange={(event) => setLinkForm((prev) => ({ ...prev, ttlDays: Number(event.target.value) || 14 }))} />
                  </label>
                  <textarea className={`${inputClass} sm:col-span-2 resize-none`} rows={2} placeholder="Internal notes" value={linkForm.notes} onChange={(event) => setLinkForm((prev) => ({ ...prev, notes: event.target.value }))} />
                </div>
                <Button onClick={createLink} disabled={creatingLink} className="gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  {creatingLink ? 'Activating...' : 'Activate Link'}
                </Button>
                {createdUrl ? (
                  <div className="rounded-md border border-border bg-muted/20 p-3 text-sm space-y-2">
                    <p className="break-all font-medium">{createdUrl}</p>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void copyText(createdUrl)}>
                      <Copy className="w-3.5 h-3.5" /> Copy link
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Private Links</CardTitle>
                <CardDescription>{activeLinks.length} active link(s). Delete expired, inactive, or unused links to keep this list short.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[520px] overflow-auto">
                {links.length === 0 ? <p className="text-sm text-muted-foreground">No private links created yet.</p> : null}
                {links.map((link) => {
                  const active = link.isActive && !link.submittedAt && new Date(link.expiresAt).getTime() > Date.now()
                  const publicUrl = link.path || (link.token ? `/private-booking/${link.token}` : '')
                  return (
                    <div key={link._id} className="rounded-md border border-border p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{link.clientName || 'Unnamed client'}</p>
                          <p className="text-xs text-muted-foreground">{link.clientEmail || 'No email'}{link.trekPackage ? ` | ${link.trekPackage}` : ''}</p>
                          <p className="text-xs text-muted-foreground">Expires {new Date(link.expiresAt).toLocaleString()}</p>
                          {link.notes ? <p className="text-xs text-muted-foreground mt-1">{link.notes}</p> : null}
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${active ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                          {link.submittedAt ? 'Submitted' : active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {active ? (
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void deactivateLink(link)}>
                            <PowerOff className="w-3.5 h-3.5" /> Deactivate
                          </Button>
                        ) : null}
                        {publicUrl ? (
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void copyText(`${window.location.origin}${publicUrl}`)}>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </Button>
                        ) : null}
                        <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteLinkTarget(link)}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card className="border-border overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" /> Private Form Fields
                  </CardTitle>
                  <CardDescription>These fields are saved into the next private link you activate.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <p className="font-semibold text-foreground">{formConfig.length}</p>
                    <p className="text-muted-foreground">Sections</p>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <p className="font-semibold text-foreground">{totalFields}</p>
                    <p className="text-muted-foreground">Fields</p>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <p className="font-semibold text-foreground">{requiredFields}</p>
                    <p className="text-muted-foreground">Required</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetFormConfig}>Reset defaults</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {formConfig.map((section, sectionIndex) => {
                const sectionRequiredCount = section.fields.filter((field) => field.required).length
                return (
                  <section key={section.id} className="overflow-hidden rounded-lg border border-border bg-background">
                    <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                          {sectionIndex + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium text-muted-foreground">Section name</label>
                          <input className="mt-1 w-full border-0 bg-transparent p-0 text-base font-semibold text-foreground outline-none focus:ring-0" value={section.title} onChange={(event) => updateSection(sectionIndex, { title: event.target.value })} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border">{section.fields.length} fields</span>
                        <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border">{sectionRequiredCount} required</span>
                      </div>
                    </div>

                    <div className="divide-y divide-border">
                      {section.fields.map((field, fieldIndex) => {
                        const locked = Boolean(field.locked || lockedFieldIds.has(field.id))
                        return (
                          <div key={`${section.id}-${field.id}-${fieldIndex}`} className="p-3 transition-colors hover:bg-muted/20">
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[24px_minmax(180px,1fr)_minmax(160px,0.8fr)_150px_120px] xl:items-end">
                              <div className="hidden pb-2 text-muted-foreground xl:block">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Label</span>
                                <input className={compactInputClass} value={field.label} onChange={(event) => updateField(sectionIndex, fieldIndex, { label: event.target.value, id: locked ? field.id : slugify(event.target.value) || field.id })} />
                              </label>
                              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                                Field key
                                <input className={compactInputClass} value={field.id} disabled={locked} onChange={(event) => updateField(sectionIndex, fieldIndex, { id: slugify(event.target.value) })} />
                              </label>
                              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                                Validation type
                                <select className={compactInputClass} value={field.type} disabled={locked} onChange={(event) => updateField(sectionIndex, fieldIndex, { type: event.target.value as BookingFieldType })}>
                                  {fieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                                </select>
                              </label>
                              <div className="flex items-center gap-2 pb-1">
                                {locked ? <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-700"><ShieldCheck className="h-3.5 w-3.5" /> Locked</span> : null}
                                <label className="flex items-center gap-2 rounded-full bg-muted/50 px-2 py-1 text-xs font-medium text-foreground">
                                  <Checkbox checked={Boolean(field.required)} onCheckedChange={(checked) => updateField(sectionIndex, fieldIndex, { required: checked === true })} />
                                  Required
                                </label>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                              <input className={compactInputClass} placeholder="Placeholder text" value={field.placeholder || ''} onChange={(event) => updateField(sectionIndex, fieldIndex, { placeholder: event.target.value })} />
                              <input className={compactInputClass} placeholder="Select options, comma separated" disabled={field.type !== 'select'} value={(field.options || []).join(', ')} onChange={(event) => updateField(sectionIndex, fieldIndex, { options: event.target.value.split(',').map((option) => option.trim()).filter(Boolean) })} />
                              <Button variant="outline" size="sm" disabled={locked} className="gap-1.5 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => removeField(sectionIndex, fieldIndex)}>
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="border-t border-border bg-muted/20 p-3">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addField(sectionIndex)}>
                        <ListPlus className="w-3.5 h-3.5" /> Add field to {section.title}
                      </Button>
                    </div>
                  </section>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Booking Forms</CardTitle>
                <CardDescription>{unreadCount} unread submission(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'unread', 'read'] as const).map((item) => (
                    <Button key={item} variant={filter === item ? 'default' : 'outline'} size="sm" onClick={() => setFilter(item)}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => void refresh()}>Refresh</Button>
                </div>

                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading booking forms...</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No booking forms found.</p>
                ) : (
                  <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                    {filtered.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setSelectedId(item._id)}
                        className={`group relative w-full text-left rounded-md border p-3 cursor-pointer transition-colors ${selectedId === item._id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                      >
                        <div className="flex items-center justify-between gap-2 pr-7">
                          <p className="font-semibold text-sm truncate">{item.firstName} {item.lastName}</p>
                          {!item.isRead && <span className="h-2.5 w-2.5 rounded-full bg-sky-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{item.trekPackage}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{item.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                        <button
                          onClick={(event) => { event.stopPropagation(); setDeleteTarget(item) }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete booking form"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Submission Detail</CardTitle>
                <CardDescription>{selected ? 'Review and download the selected PDF form' : 'Select a booking form to view details'}</CardDescription>
              </CardHeader>
              <CardContent>
                {selected ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">{selected.firstName} {selected.lastName}</p>
                      <p className="text-sm text-muted-foreground">{selected.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md border border-border p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground">Trek</p>
                        <p className="font-medium">{selected.trekPackage}</p>
                      </div>
                      <div className="rounded-md border border-border p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground">Dates</p>
                        <p className="font-medium">{selected.trekStartDate || 'TBC'} to {selected.trekEndDate || 'TBC'}</p>
                      </div>
                      <div className="rounded-md border border-border p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground">Phone / WhatsApp</p>
                        <p className="font-medium">{selected.mobileWhatsapp || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="rounded-md border border-border p-3 bg-muted/20 text-sm max-h-[340px] overflow-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(selected.formData || {}).filter(([key]) => !hiddenFields.has(key)).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground">{formatFieldName(key)}</p>
                            <p className="font-medium break-words">{String(value || '-')}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(consentLabels).map(([key, label]) => (
                          <p key={key} className="text-xs text-muted-foreground">{label}: <span className="font-medium text-foreground">{selected.formData?.[key] ? 'Yes' : 'No'}</span></p>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" onClick={toggleRead}>{selected.isRead ? 'Mark as Unread' : 'Mark as Read'}</Button>
                      <Button onClick={() => void handleDownload(selected)} disabled={downloadingId === selected._id} className="gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        {downloadingId === selected._id ? 'Downloading...' : 'Download PDF'}
                      </Button>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 gap-1.5" onClick={() => setDeleteTarget(selected)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No booking form selected.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the booking form from <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteLinkTarget} onOpenChange={(open) => !open && setDeleteLinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete private link?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the private link for <strong>{deleteLinkTarget?.clientName || 'this client'}</strong>. Submitted booking forms are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
