'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Bold, CheckCircle, ExternalLink, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Loader2, Plus, Quote, Save, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getAdminFaq, updateAdminFaq, type AdminFaq, type AdminFaqItem } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

const emptyFaq = (order = 0): AdminFaqItem => ({ question: '', answer: '', order })

const TextFormattingTools = ({ onFormat }: { onFormat: (before: string, after?: string, placeholder?: string) => void }) => (
  <div className="mb-2 rounded-md border border-border bg-background p-1.5 shadow-xs">
    <div className="flex flex-wrap items-center gap-1">
      <Button type="button" variant="ghost" size="sm" onClick={() => onFormat('**', '**', 'bold text')} className="h-8 gap-1.5 px-2" title="Bold">
        <Bold className="h-4 w-4" /><span className="text-xs">Bold</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onFormat('*', '*', 'italic text')} className="h-8 gap-1.5 px-2" title="Italic">
        <Italic className="h-4 w-4" /><span className="text-xs">Italic</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onFormat('## ', '', 'Heading')} className="h-8 gap-1.5 px-2" title="Heading">
        <Heading2 className="h-4 w-4" /><span className="text-xs">Heading</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onFormat('- ', '', 'List item')} className="h-8 gap-1.5 px-2" title="Bullet list">
        <List className="h-4 w-4" /><span className="text-xs">Bullet</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onFormat('1. ', '', 'List item')} className="h-8 gap-1.5 px-2" title="Numbered list">
        <ListOrdered className="h-4 w-4" /><span className="text-xs">Numbered</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onFormat('> ', '', 'Quote')} className="h-8 gap-1.5 px-2" title="Quote">
        <Quote className="h-4 w-4" /><span className="text-xs">Quote</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onFormat('[', '](/contact)', 'link text')} className="h-8 gap-1.5 px-2" title="Link">
        <LinkIcon className="h-4 w-4" /><span className="text-xs">Link</span>
      </Button>
    </div>
  </div>
)

export default function AdminFaqPage() {
  const [form, setForm] = useState<AdminFaq>({ heroTitle: '', heroSubtitle: '', faqs: [emptyFaq()] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [draftFaq, setDraftFaq] = useState<AdminFaqItem>(() => emptyFaq())
  const [addError, setAddError] = useState('')
  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminFaq()
      const faqs = (data.faqs || []).sort((a, b) => (a.order || 0) - (b.order || 0))
      setForm({
        heroTitle: data.heroTitle || 'Frequently Asked Questions',
        heroSubtitle: data.heroSubtitle || 'Helpful answers about trekking seasons, permits, difficulty, insurance, and planning your Himalayan adventure.',
        faqs: faqs.length > 0 ? faqs.map((item, index) => ({ ...item, order: index })) : [emptyFaq()],
        updatedAt: data.updatedAt,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  const updateFaq = (index: number, next: Partial<AdminFaqItem>) => {
    setForm((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)),
    }))
  }

  const openAddFaq = () => {
    setDraftFaq(emptyFaq(form.faqs?.length || 0))
    setAddError('')
    setAddDialogOpen(true)
  }

  const closeAddFaq = () => {
    setAddDialogOpen(false)
    setDraftFaq(emptyFaq())
    setAddError('')
  }

  const addFaq = () => {
    const question = draftFaq.question.trim()
    const answer = draftFaq.answer.trim()

    if (!question || !answer) {
      setAddError('Please add both a question and an answer before adding the FAQ.')
      return
    }

    setForm((prev) => {
      const next = [...(prev.faqs || []), { question, answer, order: prev.faqs?.length || 0 }]
      return { ...prev, faqs: next.map((item, itemIndex) => ({ ...item, order: itemIndex })) }
    })
    closeAddFaq()
  }

  const removeFaq = (index: number) => {
    setForm((prev) => {
      const next = (prev.faqs || []).filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, order: itemIndex }))
      return { ...prev, faqs: next.length > 0 ? next : [emptyFaq()] }
    })
  }

  const moveFaq = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const next = [...(prev.faqs || [])]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      const current = next[index]
      next[index] = next[target]
      next[target] = current
      return { ...prev, faqs: next.map((item, itemIndex) => ({ ...item, order: itemIndex })) }
    })
  }

  const handleTextAreaInsert = (textareaId: string, beforeText: string, afterText = '', placeholder = 'text') => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null
    if (!textarea) return

    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const value = textarea.value
    const selectedText = value.substring(start, end)
    const content = selectedText || placeholder
    const insertion = `${beforeText}${content}${afterText}`
    const newValue = value.substring(0, start) + insertion + value.substring(end)
    const index = Number(textareaId.replace('faq-answer-', ''))

    if (!Number.isNaN(index)) updateFaq(index, { answer: newValue })

    setTimeout(() => {
      textarea.focus()
      const cursor = start + insertion.length
      textarea.setSelectionRange(cursor, cursor)
    }, 0)
  }

  const handleDraftTextAreaInsert = (beforeText: string, afterText = '', placeholder = 'text') => {
    const textarea = document.getElementById('new-faq-answer') as HTMLTextAreaElement | null
    if (!textarea) return

    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const value = textarea.value
    const selectedText = value.substring(start, end)
    const content = selectedText || placeholder
    const insertion = `${beforeText}${content}${afterText}`
    const newValue = value.substring(0, start) + insertion + value.substring(end)

    setDraftFaq((prev) => ({ ...prev, answer: newValue }))

    setTimeout(() => {
      textarea.focus()
      const cursor = start + insertion.length
      textarea.setSelectionRange(cursor, cursor)
    }, 0)
  }

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    const faqs = (form.faqs || [])
      .map((item, index) => ({ question: item.question.trim(), answer: item.answer.trim(), order: index }))
      .filter((item) => item.question && item.answer)

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const saved = await updateAdminFaq(token, { ...form, faqs })
      setForm((prev) => ({ ...prev, ...saved, faqs: saved.faqs && saved.faqs.length > 0 ? saved.faqs : [emptyFaq()] }))
      setMessage('FAQ page updated successfully.')
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ page')
    } finally {
      setSaving(false)
    }
  }

  const completeFaqCount = (form.faqs || []).filter((item) => item.question.trim() && item.answer.trim()).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Admin dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">FAQ Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create, update, delete, and reorder the general FAQ entries shown on the public FAQ page.</p>
        </div>
        <Button variant="outline" asChild className="gap-2 lg:self-center">
          <a href="/faq" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" /> Preview FAQ
          </a>
        </Button>
      </div>

      {error ? (
        <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">{message}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="overflow-hidden border-border shadow-xs">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>General FAQ Editor</CardTitle>
              <CardDescription>Answers support Markdown formatting and links such as [Contact us](/contact).</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-border bg-background px-3 py-2 font-medium text-foreground">{completeFaqCount} complete</span>
              <span className="rounded-md border border-border bg-background px-3 py-2 font-medium text-foreground">{form.faqs?.length || 0} total</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-4 md:p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading FAQ content...
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-foreground">
                  Page title
                  <Input value={form.heroTitle || ''} onChange={(event) => setForm((prev) => ({ ...prev, heroTitle: event.target.value }))} placeholder="Frequently Asked Questions" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-foreground">
                  Page subtitle
                  <Textarea value={form.heroSubtitle || ''} onChange={(event) => setForm((prev) => ({ ...prev, heroSubtitle: event.target.value }))} rows={3} placeholder="Helpful answers about trekking..." />
                </label>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <div className="flex flex-col gap-3 border-b border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">FAQ Entries</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Blank questions or answers are skipped when saving.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={openAddFaq}>
                    <Plus className="h-4 w-4" /> Add FAQ
                  </Button>
                </div>

                <div className="divide-y divide-border">
                  {(form.faqs || []).map((faq, index) => (
                    <div key={index} className="grid gap-4 p-4 xl:grid-cols-[120px_1fr_auto] xl:items-start">
                      <div>
                        <p className="text-sm font-semibold text-foreground">FAQ {index + 1}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Order {index + 1}</p>
                      </div>
                      <div className="space-y-3">
                        <label className="space-y-1.5 text-sm font-medium text-foreground">
                          Question
                          <Input value={faq.question} onChange={(event) => updateFaq(index, { question: event.target.value })} placeholder="Enter a frequently asked question" />
                        </label>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Answer</label>
                          <TextFormattingTools onFormat={(before, after, placeholder) => handleTextAreaInsert(`faq-answer-${index}`, before, after, placeholder)} />
                          <Textarea
                            id={`faq-answer-${index}`}
                            value={faq.answer}
                            onChange={(event) => updateFaq(index, { answer: event.target.value })}
                            placeholder="Write the answer. Use the link tool for redirects."
                            rows={5}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 xl:flex-col">
                        <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => moveFaq(index, -1)} title="Move up">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={index === (form.faqs?.length || 1) - 1} onClick={() => moveFaq(index, 1)} title="Move down">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => removeFaq(index)} title="Delete FAQ">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Last updated: <span className="font-medium text-foreground">{form.updatedAt ? new Date(form.updatedAt).toLocaleString() : 'Not saved yet'}</span>
                </p>
                <Button onClick={onSave} disabled={saving} size="lg" className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save FAQ'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={(open) => (open ? setAddDialogOpen(true) : closeAddFaq())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-primary/30 shadow-2xl sm:max-w-2xl">
          <DialogHeader className="rounded-md border border-primary/15 bg-primary/5 p-4">
            <DialogTitle>Add FAQ</DialogTitle>
            <DialogDescription>
              Create the new question here. It will be added to the FAQ list after you confirm it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {addError ? (
              <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                <AlertDescription className="text-red-800 dark:text-red-200">{addError}</AlertDescription>
              </Alert>
            ) : null}

            <label className="space-y-1.5 text-sm font-medium text-foreground">
              Question
              <Input
                autoFocus
                value={draftFaq.question}
                onChange={(event) => {
                  setDraftFaq((prev) => ({ ...prev, question: event.target.value }))
                  setAddError('')
                }}
                placeholder="Enter a frequently asked question"
              />
            </label>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Answer</label>
              <TextFormattingTools onFormat={handleDraftTextAreaInsert} />
              <Textarea
                id="new-faq-answer"
                value={draftFaq.answer}
                onChange={(event) => {
                  setDraftFaq((prev) => ({ ...prev, answer: event.target.value }))
                  setAddError('')
                }}
                placeholder="Write the answer. Use the link tool for redirects."
                rows={7}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeAddFaq}>
              Cancel
            </Button>
            <Button type="button" className="gap-1.5" onClick={addFaq}>
              <Plus className="h-4 w-4" /> Add FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
