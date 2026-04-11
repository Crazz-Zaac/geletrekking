'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RegistrationDocument,
  getRegistrationsAffiliations,
  updateRegistrationDocument,
  addRegistrationDocument,
  deleteRegistrationDocument,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { FileText, Trash2, Edit2, Plus, Eye, File } from 'lucide-react'

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

export default function AdminCompanyPage() {
  const [documents, setDocuments] = useState<RegistrationDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [form, setForm] = useState<DocumentForm>(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [openDialog, setOpenDialog] = useState(false)

  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getRegistrationsAffiliations()
      setDocuments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

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
    setOpenDialog(true)
  }

  const onReset = () => {
    setEditingCode(null)
    setForm(initialForm)
    setOpenDialog(false)
  }

  const onSave = async () => {
    if (!form.title || !form.code) {
      setError('Title and code are required')
      return
    }

    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (editingCode) {
        await updateRegistrationDocument(token, editingCode, {
          documentUrl: form.documentUrl,
          documentType: form.documentType,
          status: form.status,
        })
        setMessage('Document updated successfully.')
      } else {
        await addRegistrationDocument(token, {
          title: form.title,
          code: form.code,
          description: form.description,
        })
        setMessage('Document added successfully.')
      }
      await refresh()
      onReset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (code: string) => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await deleteRegistrationDocument(token, code)
      setMessage('Document deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Company Management</h2>
        <p className="text-muted-foreground mt-1">Manage registrations and affiliations documents.</p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registrations & Affiliations</CardTitle>
                  <CardDescription>Upload and manage official company documents.</CardDescription>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => onReset()} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingCode ? 'Edit' : 'Add'} Document</DialogTitle>
                      <DialogDescription>
                        {editingCode ? 'Update the document details.' : 'Add a new registration or affiliation document.'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {error ? <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded">{error}</p> : null}
                      {message ? <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 p-3 rounded">{message}</p> : null}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Title *</label>
                          <Input
                            placeholder="e.g., Company Registration Certificate"
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Code *</label>
                          <Input
                            placeholder="e.g., DOC-01"
                            value={form.code}
                            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                            disabled={saving || !!editingCode}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea
                          placeholder="Brief description of the document..."
                          value={form.description}
                          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                          disabled={saving}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Document URL</label>
                        <div className="space-y-3">
                          <Input
                            placeholder="Enter document URL (e.g., https://...)"
                            value={form.documentUrl}
                            onChange={(e) => setForm((prev) => ({ ...prev, documentUrl: e.target.value }))}
                            disabled={saving}
                            type="url"
                          />
                          {form.documentUrl && (
                            <a
                              href={form.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-block"
                            >
                              Preview document
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Document Type</label>
                          <Select value={form.documentType} onValueChange={(value) => setForm((prev) => ({ ...prev, documentType: value as any }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">Image (JPG, PNG, etc)</SelectItem>
                              <SelectItem value="pdf">PDF Document</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Status</label>
                          <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as any }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="placeholder">Placeholder</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="uploaded">Uploaded</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={onSave}
                          disabled={saving || !form.title || !form.code}
                          className="flex-1"
                        >
                          {saving ? 'Saving...' : editingCode ? 'Update Document' : 'Add Document'}
                        </Button>
                        <Button onClick={onReset} variant="outline" disabled={saving}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              {error && !openDialog ? <p className="text-sm text-red-600 mb-4 bg-red-50 dark:bg-red-950 p-3 rounded">{error}</p> : null}
              {message && !openDialog ? <p className="text-sm text-emerald-600 mb-4 bg-emerald-50 dark:bg-emerald-950 p-3 rounded">{message}</p> : null}

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents yet. Create one to get started.</p>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div key={doc.code} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <h4 className="font-semibold text-foreground">{doc.title}</h4>
                            <p className="text-xs text-muted-foreground">{doc.code}</p>
                          </div>
                        </div>
                        {doc.description && <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              doc.status === 'uploaded'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : doc.status === 'pending'
                                  ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
                                  : 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {doc.documentType === 'image' ? (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Image
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <File className="w-3 h-3" />
                                PDF
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        {doc.documentUrl && (
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded transition"
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => onEdit(doc)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded transition"
                          disabled={saving}
                          title="Edit document"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition"
                              disabled={saving}
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-3">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(doc.code)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
