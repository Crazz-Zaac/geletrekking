'use client'

import { useEffect, useState } from 'react'
import { Edit2, ExternalLink, File, FileText, Image as ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react'
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
  getRegistrationsAffiliations,
  updateRegistrationDocument,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type DocumentForm = {
  title: string
  code: string
  description: string
  documentUrl: string
  documentType: 'image' | 'pdf'
  status: 'placeholder' | 'uploaded' | 'pending'
}

const initialForm: DocumentForm = {
  title: '',
  code: '',
  description: '',
  documentUrl: '',
  documentType: 'image',
  status: 'placeholder',
}

const STATUS_STYLE: Record<DocumentForm['status'], string> = {
  uploaded: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  pending: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  placeholder: 'border-border bg-muted text-muted-foreground',
}

const STATUS_LABEL: Record<DocumentForm['status'], string> = {
  uploaded: 'Verified',
  pending: 'Pending',
  placeholder: 'Placeholder',
}

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
      setDocuments(await getRegistrationsAffiliations())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const openNew = () => {
    setEditingCode(null)
    setForm(initialForm)
    setSubmitted(false)
    setPanelOpen(true)
  }

  const onEdit = (doc: RegistrationDocument) => {
    setEditingCode(doc.code)
    setForm({
      title: doc.title,
      code: doc.code,
      description: doc.description,
      documentUrl: doc.documentUrl,
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

  const errors = {
    title: !form.title.trim() ? 'Title is required.' : undefined,
    code: !form.code.trim() ? 'Code is required.' : !editingCode && documents.some((doc) => doc.code === form.code.trim()) ? 'This code is already used.' : undefined,
    documentUrl: form.documentUrl && !/^https?:\/\//.test(form.documentUrl.trim()) ? 'Use a full link starting with https://' : undefined,
  }

  const onSave = async () => {
    setSubmitted(true)
    if (errors.title || errors.code || errors.documentUrl) return
    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        documentUrl: form.documentUrl.trim(),
        documentType: form.documentType,
        status: form.status,
      }
      if (editingCode) {
        await updateRegistrationDocument(token, editingCode, payload)
        setMessage('Document updated.')
      } else {
        await addRegistrationDocument(token, { ...payload, code: form.code.trim() })
        setMessage('Document added.')
      }
      setPanelOpen(false)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (doc: RegistrationDocument) => {
    if (!(await askConfirm({ title: `Delete "${doc.title}"?`, description: 'The document will be removed from the Registrations & Affiliations page.' }))) return
    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteRegistrationDocument(token, doc.code)
      setMessage('Document deleted.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
    } finally {
      setSaving(false)
    }
  }

  const shownErrors = submitted ? errors : { title: undefined, code: undefined, documentUrl: undefined }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="Company & registrations"
        description="Licences, registrations and memberships shown on the public Registrations & Affiliations page."
        actions={
          <>
            <Button variant="outline" asChild className="gap-2">
              <a href="/company/registrations-affiliations" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> View page
              </a>
            </Button>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" /> Add document
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
          title="No documents yet"
          description="Add your company registration, tourism licence and association memberships."
          action={<Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add document</Button>}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {documents.map((doc) => (
            <li key={doc.code} className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {doc.documentType === 'pdf' ? <File className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-foreground">{doc.title}</p>
                  <Badge variant="outline" className={STATUS_STYLE[doc.status]}>{STATUS_LABEL[doc.status]}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {doc.code} · {doc.documentType === 'pdf' ? 'PDF' : 'Image'}
                  {!doc.documentUrl && ' · no file linked'}
                </p>
                {doc.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{doc.description}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
                {doc.documentUrl && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${doc.title}`}>
                      <ExternalLink className="h-4 w-4" />
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
          ))}
        </ul>
      )}

      <Sheet open={panelOpen} onOpenChange={(open) => !saving && setPanelOpen(open)}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
          <SheetHeader className="border-b border-border p-5">
            <SheetTitle>{editingCode ? 'Edit document' : 'Add document'}</SheetTitle>
            <SheetDescription>{editingCode ? `Code ${editingCode}` : 'A registration, licence or membership certificate.'}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <Field label="Title" required error={shownErrors.title}>
              <Input className="h-10" placeholder="e.g. Tourism Industry Licence" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            </Field>
            <Field label="Code" required error={shownErrors.code} hint={editingCode ? 'The code cannot be changed after creation.' : 'A short unique ID, e.g. NTB-LICENCE.'}>
              <Input className="h-10" placeholder="e.g. NTB-LICENCE" value={form.code} disabled={!!editingCode} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s+/g, '-') }))} />
            </Field>
            <Field label="Description">
              <TextArea rows={3} placeholder="What the document certifies, issuing authority, number…" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </Field>
            <Field label="Document link" error={shownErrors.documentUrl} hint="Link to the uploaded image or PDF (ImageKit, Backblaze, Cloudinary…).">
              <Input className="h-10" type="url" placeholder="https://…" value={form.documentUrl} onChange={(e) => setUrl(e.target.value)} />
            </Field>
            {form.documentUrl && form.documentType === 'image' && /^https?:\/\//.test(form.documentUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.documentUrl} alt="" className="max-h-56 w-full rounded-lg border border-border bg-muted/40 object-contain" />
            )}
            <FieldGrid>
              <Field label="File type">
                <SelectInput value={form.documentType} onChange={(e) => setForm((prev) => ({ ...prev, documentType: e.target.value as DocumentForm['documentType'] }))}>
                  <option value="image">Image</option>
                  <option value="pdf">PDF</option>
                </SelectInput>
              </Field>
              <Field label="Status" hint="Only verified documents show a file link to visitors.">
                <SelectInput value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as DocumentForm['status'] }))}>
                  <option value="uploaded">Verified (file visible)</option>
                  <option value="pending">Pending</option>
                  <option value="placeholder">Placeholder</option>
                </SelectInput>
              </Field>
            </FieldGrid>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t border-border p-4">
            <Button variant="ghost" onClick={() => setPanelOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={onSave} disabled={saving} className="min-w-28">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingCode ? 'Save changes' : 'Add document'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
