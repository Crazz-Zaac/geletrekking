'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Building2, Edit2, ExternalLink, Eye, File, FileText, Image as ImageIcon, Loader2, Plus, ShieldAlert, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AdminPageHeader, EmptyState, Field, FieldGrid, SelectInput, StatusToasts, TextArea } from '@/components/admin/form-kit'
import { useConfirm } from '@/components/admin/use-confirm'
import {
  RegistrationDocument,
  addRegistrationDocument,
  deleteRegistrationDocument,
  getAdminRegistrationsAffiliations,
  updateRegistrationDocument,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type Kind = 'registration' | 'membership'
type Status = 'placeholder' | 'uploaded' | 'pending'

type DocumentForm = {
  kind: Kind
  title: string
  code: string
  issuer: string
  referenceNumber: string
  issuedOn: string
  validUntil: string
  verifyUrl: string
  logoUrl: string
  description: string
  documentUrl: string
  documentType: 'image' | 'pdf'
  status: Status
}

const initialForm: DocumentForm = {
  kind: 'registration',
  title: '',
  code: '',
  issuer: '',
  referenceNumber: '',
  issuedOn: '',
  validUntil: '',
  verifyUrl: '',
  logoUrl: '',
  description: '',
  documentUrl: '',
  documentType: 'image',
  status: 'uploaded',
}

const STATUS_STYLE: Record<Status, string> = {
  uploaded: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  pending: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  placeholder: 'border-border bg-muted text-muted-foreground',
}

const STATUS_LABEL: Record<Status, string> = {
  uploaded: 'Published',
  pending: 'Coming soon',
  placeholder: 'Hidden',
}

const today = () => new Date().toISOString().slice(0, 10)
const isHttps = (value: string) => /^https:\/\/\S+$/i.test(value.trim())
const codeFromTitle = (title: string) =>
  title.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'DOC'

const previewHref = (code: string) => `/api/settings/registrations-affiliations/${encodeURIComponent(code)}/preview?size=full&v=${Date.now()}`

export default function AdminCompanyPage() {
  const [documents, setDocuments] = useState<RegistrationDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [form, setForm] = useState<DocumentForm>(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [askConfirm, confirmDialog] = useConfirm()

  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      setDocuments(await getAdminRegistrationsAffiliations(token || ''))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const update = <K extends keyof DocumentForm>(key: K, value: DocumentForm[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  const openNew = (kind: Kind = 'registration') => {
    setEditingCode(null)
    setForm({ ...initialForm, kind })
    setSubmitted(false)
    setPanelOpen(true)
  }

  const onEdit = (doc: RegistrationDocument) => {
    setEditingCode(doc.code)
    setForm({
      kind: doc.kind || 'registration',
      title: doc.title,
      code: doc.code,
      issuer: doc.issuer || '',
      referenceNumber: doc.referenceNumber || '',
      issuedOn: doc.issuedOn || '',
      validUntil: doc.validUntil || '',
      verifyUrl: doc.verifyUrl || '',
      logoUrl: doc.logoUrl || '',
      description: doc.description || '',
      documentUrl: doc.documentUrl || '',
      documentType: doc.documentType,
      status: doc.status,
    })
    setSubmitted(false)
    setPanelOpen(true)
  }

  const setUrl = (documentUrl: string) =>
    setForm((prev) => ({
      ...prev,
      documentUrl,
      // Detect the type from the link so admins rarely need to pick it.
      documentType: /\.pdf(\?|#|$)/i.test(documentUrl) ? 'pdf' : /\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i.test(documentUrl) ? 'image' : prev.documentType,
    }))

  const code = editingCode || form.code.trim() || codeFromTitle(form.title)
  const errors = {
    title: !form.title.trim() ? 'Title is required.' : undefined,
    code: !editingCode && documents.some((doc) => doc.code === code) ? 'This ID is already used. Type a different one.' : undefined,
    documentUrl: form.documentUrl && !isHttps(form.documentUrl) ? 'Use a full link starting with https://' : undefined,
    verifyUrl: form.verifyUrl && !isHttps(form.verifyUrl) ? 'Use a full link starting with https://' : undefined,
    logoUrl: form.logoUrl && !isHttps(form.logoUrl) ? 'Use a full link starting with https://' : undefined,
    validUntil: form.issuedOn && form.validUntil && form.validUntil < form.issuedOn ? 'Must be after the issue date.' : undefined,
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const onSave = async () => {
    setSubmitted(true)
    if (hasErrors) return
    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = {
        kind: form.kind,
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        referenceNumber: form.referenceNumber.trim(),
        issuedOn: form.issuedOn,
        validUntil: form.validUntil,
        verifyUrl: form.verifyUrl.trim(),
        logoUrl: form.logoUrl.trim(),
        description: form.description.trim(),
        documentUrl: form.documentUrl.trim(),
        documentType: form.documentType,
        status: form.status,
      }
      if (editingCode) {
        await updateRegistrationDocument(token, editingCode, payload)
        setMessage('Saved.')
      } else {
        await addRegistrationDocument(token, { ...payload, code })
        setMessage('Added.')
      }
      setPanelOpen(false)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (doc: RegistrationDocument) => {
    if (!(await askConfirm({ title: `Delete "${doc.title}"?`, description: 'It will be removed from the Registrations & Affiliations page.' }))) return
    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteRegistrationDocument(token, doc.code)
      setMessage('Deleted.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const shown = submitted ? errors : ({} as Partial<typeof errors>)

  const warningsFor = (doc: RegistrationDocument) => {
    const warnings: string[] = []
    if (doc.status === 'placeholder') return warnings
    if (!doc.referenceNumber) warnings.push(doc.kind === 'membership' ? 'Add the member number' : 'Add the registration number')
    if (doc.validUntil && doc.validUntil < today()) warnings.push('Validity date has passed: upload the renewed certificate')
    if (doc.kind === 'membership' && !doc.verifyUrl) warnings.push('Add a “verify” link to the member directory')
    if (doc.status === 'uploaded' && !doc.documentUrl && doc.kind !== 'membership') warnings.push('Published without a file')
    return warnings
  }

  const renderGroup = (kind: Kind, title: string, icon: React.ReactNode, items: RegistrationDocument[]) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">{icon}{title} <span className="font-normal text-muted-foreground">({items.length})</span></h2>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => openNew(kind)}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          {kind === 'membership' ? 'No memberships yet. Add TAAN, NTB, NMA… with your member numbers.' : 'No registrations yet.'}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((doc) => {
            const warnings = warningsFor(doc)
            return (
              <li key={doc.code} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                  {doc.kind === 'membership' && doc.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doc.logoUrl} alt="" className="h-full w-full bg-white object-contain p-1" />
                  ) : doc.documentType === 'pdf' ? <File className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">{doc.title}</p>
                    <Badge variant="outline" className={STATUS_STYLE[doc.status]}>{STATUS_LABEL[doc.status]}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[doc.issuer, doc.referenceNumber && `No. ${doc.referenceNumber}`, doc.documentUrl ? (doc.documentType === 'pdf' ? 'PDF' : 'Image') : 'no file'].filter(Boolean).join(' · ')}
                  </p>
                  {warnings.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {warnings.map((w) => (
                        <li key={w} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400"><AlertTriangle className="h-3 w-3 shrink-0" />{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
                  {doc.status === 'uploaded' && doc.documentUrl && doc.documentType === 'image' && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={previewHref(doc.code)} target="_blank" rel="noopener noreferrer" aria-label={`Watermarked preview of ${doc.title}`} title="What visitors see (watermarked)">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(doc)} disabled={saving} aria-label={`Edit ${doc.title}`}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void onDelete(doc)} disabled={saving} aria-label={`Delete ${doc.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )

  const isMembership = form.kind === 'membership'

  return (
    <div className="space-y-6">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="Company & registrations"
        description="Registrations, licences and memberships on the public Registrations & Affiliations page. Certificate images are watermarked automatically."
        actions={
          <>
            <Button variant="outline" asChild className="gap-2">
              <a href="/company/registrations-affiliations" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> View page
              </a>
            </Button>
            <Button onClick={() => openNew()} className="gap-2">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="Nothing added yet"
          description="Add your company registration, tourism licence and association memberships."
          action={<Button onClick={() => openNew()} className="gap-2"><Plus className="h-4 w-4" /> Add</Button>}
        />
      ) : (
        <div className="space-y-8">
          {renderGroup('registration', 'Registrations & licences', <Building2 className="h-4 w-4 text-primary" />, documents.filter((d) => (d.kind || 'registration') === 'registration'))}
          {renderGroup('membership', 'Memberships & affiliations', <Users className="h-4 w-4 text-primary" />, documents.filter((d) => d.kind === 'membership'))}
        </div>
      )}

      <Sheet open={panelOpen} onOpenChange={(open) => !saving && setPanelOpen(open)}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-border p-5">
            <SheetTitle>{editingCode ? 'Edit' : 'Add'} {isMembership ? 'membership' : 'registration'}</SheetTitle>
            <SheetDescription>{isMembership ? 'An association your company belongs to.' : 'A government registration or licence.'}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            <section className="space-y-5" aria-labelledby="doc-details-heading">
              <h3 id="doc-details-heading" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
              <div className="space-y-5">
                <Field label="Type">
                  <SelectInput value={form.kind} onChange={(e) => update('kind', e.target.value as Kind)}>
                    <option value="registration">Registration / licence (government)</option>
                    <option value="membership">Membership (association)</option>
                  </SelectInput>
                </Field>
                <Field label={isMembership ? 'Membership name' : 'Title'} required error={shown.title}>
                  <Input className="h-10" placeholder={isMembership ? 'e.g. TAAN Membership' : 'e.g. Tourism Industry Licence'} value={form.title} onChange={(e) => update('title', e.target.value)} />
                </Field>
                <Field label={isMembership ? 'Association' : 'Issued by'} hint={isMembership ? undefined : 'The government office that issued it.'}>
                  <Input className="h-10" placeholder={isMembership ? "e.g. Trekking Agencies' Association of Nepal" : 'e.g. Office of the Company Registrar'} value={form.issuer} onChange={(e) => update('issuer', e.target.value)} />
                </Field>
                <Field label={isMembership ? 'Member number' : 'Registration / licence number'} hint="Shown on the page so visitors can check it with the issuer.">
                  <Input className="h-10 font-mono" value={form.referenceNumber} onChange={(e) => update('referenceNumber', e.target.value)} />
                </Field>
                <FieldGrid>
                  <Field label={isMembership ? 'Member since' : 'Issued on'}>
                    <Input className="h-10" type="date" value={form.issuedOn} onChange={(e) => update('issuedOn', e.target.value)} />
                  </Field>
                  <Field label="Valid until" hint="For licences renewed yearly. Optional." error={shown.validUntil}>
                    <Input className="h-10" type="date" value={form.validUntil} onChange={(e) => update('validUntil', e.target.value)} />
                  </Field>
                </FieldGrid>
                <Field label="Verify link" error={shown.verifyUrl} hint={isMembership ? "The association's member directory or your profile there." : 'Official page where your registration can be looked up. Optional.'}>
                  <Input className="h-10" type="url" placeholder="https://…" value={form.verifyUrl} onChange={(e) => update('verifyUrl', e.target.value)} />
                </Field>
                {isMembership && (
                  <Field label="Logo link" error={shown.logoUrl} hint="Optional. If empty, the matching logo from the About page is used.">
                    <Input className="h-10" type="url" placeholder="https://…" value={form.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} />
                  </Field>
                )}
                <Field label="Short note" hint="Optional, one or two sentences.">
                  <TextArea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
                </Field>
              </div>
            </section>

            <section className="space-y-5 border-t border-border pt-6" aria-labelledby="doc-file-heading">
              <h3 id="doc-file-heading" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certificate file</h3>
              <div className="space-y-5">
                <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                  <p className="flex items-center gap-1.5 font-semibold"><ShieldAlert className="h-4 w-4" /> Before uploading</p>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                    <li>Black out citizenship numbers, signatures and home addresses.</li>
                    <li>Keep the company name and registration number readable.</li>
                    <li>Use a JPG or PNG: images are watermarked automatically. PDFs are shown as uploaded.</li>
                  </ul>
                </div>
                <Field label="File link" error={shown.documentUrl} hint="The original stays private. Visitors only see a watermarked copy.">
                  <Input className="h-10" type="url" placeholder="https://ik.imagekit.io/…" value={form.documentUrl} onChange={(e) => setUrl(e.target.value)} />
                </Field>
                {form.documentUrl && form.documentType === 'image' && isHttps(form.documentUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.documentUrl} alt="" className="max-h-56 w-full rounded-lg border border-border bg-muted/40 object-contain" />
                )}
                <FieldGrid>
                  <Field label="File type">
                    <SelectInput value={form.documentType} onChange={(e) => update('documentType', e.target.value as DocumentForm['documentType'])}>
                      <option value="image">Image (watermarked)</option>
                      <option value="pdf">PDF (not watermarked)</option>
                    </SelectInput>
                  </Field>
                  <Field label="Visibility">
                    <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as Status)}>
                      <option value="uploaded">Published</option>
                      <option value="pending">Coming soon (details, no file)</option>
                      <option value="placeholder">Hidden</option>
                    </SelectInput>
                  </Field>
                </FieldGrid>
                {!editingCode && (
                  <Field label="Internal ID" error={shown.code} hint={`Optional. Defaults to ${codeFromTitle(form.title)}. Can't be changed later.`}>
                    <Input className="h-10" placeholder={codeFromTitle(form.title)} value={form.code} onChange={(e) => update('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]+/g, '-'))} />
                  </Field>
                )}
              </div>
            </section>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t border-border p-4">
            <Button variant="ghost" onClick={() => setPanelOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={onSave} disabled={saving} className="min-w-28">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingCode ? 'Save changes' : 'Add'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
