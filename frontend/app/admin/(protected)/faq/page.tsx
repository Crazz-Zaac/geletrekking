'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, HelpCircle, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AdminPageHeader,
  EmptyState,
  Field,
  FormSection,
  FormSkeleton,
  ImageUrlField,
  SaveBar,
  StatusToasts,
  TextArea,
  useDirtyState,
  useUnsavedChangesWarning,
} from '@/components/admin/form-kit'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { useConfirm } from '@/components/admin/use-confirm'
import { getAdminFaq, updateAdminFaq, type AdminFaq, type AdminFaqItem } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { FAQ_TOPICS, SUGGESTED_FAQS, faqTopicOf } from '@/lib/faq-topics'

const topicLabel = (id: string) => FAQ_TOPICS.find((topic) => topic.id === id)?.label ?? id

const emptyFaq = (order = 0): AdminFaqItem => ({ question: '', answer: '', order, category: '' })

export default function AdminFaqPage() {
  const [form, setForm] = useState<AdminFaq>({ heroTitle: '', heroSubtitle: '', heroImageUrl: '', faqs: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [askConfirm, confirmDialog] = useConfirm()
  const { dirty, markSaved, baseline } = useDirtyState(form)
  useUnsavedChangesWarning(dirty)
  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminFaq()
      const faqs = (data.faqs || []).sort((a, b) => (a.order || 0) - (b.order || 0))
      const next: AdminFaq = {
        heroTitle: data.heroTitle || 'Frequently Asked Questions',
        heroSubtitle: data.heroSubtitle || 'Helpful answers about trekking seasons, permits, difficulty, insurance, and planning your Himalayan adventure.',
        heroImageUrl: data.heroImageUrl || '',
        faqs: faqs.map((item, index) => ({ ...item, order: index })),
        updatedAt: data.updatedAt,
      }
      setForm(next)
      markSaved(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const faqs = form.faqs || []

  const updateFaq = (index: number, next: Partial<AdminFaqItem>) =>
    setForm((prev) => ({ ...prev, faqs: (prev.faqs || []).map((item, i) => (i === index ? { ...item, ...next } : item)) }))

  const addFaq = () => {
    setForm((prev) => ({ ...prev, faqs: [...(prev.faqs || []), emptyFaq(prev.faqs?.length || 0)] }))
    setOpenIndex(faqs.length)
    window.requestAnimationFrame(() => document.getElementById(`faq-question-${faqs.length}`)?.focus())
  }

  const removeFaq = async (index: number) => {
    const question = faqs[index]?.question.trim()
    if (question && !(await askConfirm({ title: 'Delete this question?', description: `"${question}" will be removed when you save.` }))) return
    setForm((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })),
    }))
    setOpenIndex(null)
  }

  const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const missingSuggestions = SUGGESTED_FAQS.filter(
    (suggestion) => !faqs.some((item) => normalise(item.question) === normalise(suggestion.question))
  )

  const addSuggestions = () => {
    if (missingSuggestions.length === 0) return
    setForm((prev) => {
      const current = prev.faqs || []
      const added = missingSuggestions.map((item, i) => ({ ...item, order: current.length + i }))
      return { ...prev, faqs: [...current, ...added] }
    })
    setOpenIndex(null)
    setMessage(`${missingSuggestions.length} suggested questions added at the end of the list. Review them, then click Save FAQ to publish.`)
  }

  const moveFaq = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const next = [...(prev.faqs || [])]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...prev, faqs: next.map((item, i) => ({ ...item, order: i })) }
    })
    setOpenIndex((current) => (current === index ? index + direction : current))
  }

  const onSave = async () => {
    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }
    const incomplete = faqs.filter((item) => !!item.question.trim() !== !!item.answer.trim()).length
    if (incomplete > 0) {
      setError(`${incomplete} question(s) are missing a question or an answer. Complete or delete them before saving.`)
      return
    }
    const cleaned = faqs
      .map((item, index) => ({ question: item.question.trim(), answer: item.answer.trim(), order: index, category: item.category || '' }))
      .filter((item) => item.question && item.answer)

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const saved = await updateAdminFaq(token, { ...form, faqs: cleaned })
      const next = { ...form, ...saved, faqs: saved.faqs || [] }
      setForm(next)
      markSaved(next)
      setMessage('FAQ page saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ page')
    } finally {
      setSaving(false)
    }
  }

  const onDiscard = () => {
    const saved = baseline()
    if (saved) setForm(saved)
    setOpenIndex(null)
  }

  return (
    <div className="space-y-8">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="FAQ"
        description="Questions and answers shown on the public FAQ page."
        actions={
          <Button variant="outline" asChild className="gap-2">
            <a href="/faq" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> View page
            </a>
          </Button>
        }
      />

      {loading ? (
        <FormSkeleton rows={2} />
      ) : (
        <>
          <FormSection title="Page header" description="Title, intro text and background photo at the top of the FAQ page.">
            <Field label="Title">
              <Input className="h-10" value={form.heroTitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroTitle: e.target.value }))} placeholder="Frequently Asked Questions" />
            </Field>
            <Field label="Intro text" count={{ value: form.heroSubtitle, max: 200, recommended: true }}>
              <TextArea rows={2} value={form.heroSubtitle || ''} onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))} />
            </Field>
            <ImageUrlField
              label="Background photo"
              value={form.heroImageUrl}
              onChange={(value) => setForm((prev) => ({ ...prev, heroImageUrl: value }))}
              hint="Shown behind the heading with a dark overlay."
            />
          </FormSection>

          <FormSection
            stacked
            title={`Questions (${faqs.length})`}
            description="Click a question to edit it. Answers support formatting and links such as [Contact us](/contact)."
            actions={
              <div className="flex flex-wrap gap-2">
                {missingSuggestions.length > 0 ? (
                  <Button type="button" variant="outline" onClick={addSuggestions} className="gap-1.5">
                    <Sparkles className="h-4 w-4" /> Add {missingSuggestions.length} suggested questions
                  </Button>
                ) : null}
                <Button type="button" onClick={addFaq} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add question
                </Button>
              </div>
            }
          >
            {faqs.length === 0 ? (
              <EmptyState icon={<HelpCircle className="h-5 w-5" />} title="No questions yet" description="Add the questions trekkers ask most often." />
            ) : (
              <ol className="space-y-2">
                {faqs.map((faq, index) => {
                  const open = openIndex === index
                  const incomplete = !faq.question.trim() || !faq.answer.trim()
                  return (
                    <li key={index} className={cn('rounded-lg border bg-background transition-shadow', open ? 'border-primary/40 shadow-sm' : 'border-border')}>
                      <div className="flex items-center gap-2 p-2 pl-3">
                        <button
                          type="button"
                          onClick={() => setOpenIndex(open ? null : index)}
                          aria-expanded={open}
                          aria-controls={`faq-panel-${index}`}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
                          <span className={cn('truncate text-sm font-medium', faq.question.trim() ? 'text-foreground' : 'italic text-muted-foreground')}>
                            {faq.question.trim() || 'New question'}
                          </span>
                          {faq.question.trim() ? (
                            <Badge variant="secondary" className="hidden shrink-0 font-normal sm:inline-flex">
                              {topicLabel(faqTopicOf(faq))}
                              {!faq.category ? ' (auto)' : ''}
                            </Badge>
                          ) : null}
                          {incomplete && <Badge variant="outline" className="shrink-0 border-amber-300 text-amber-700">Incomplete</Badge>}
                          <ChevronDown className={cn('ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
                        </button>
                        <div className="flex shrink-0 items-center">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => moveFaq(index, -1)} aria-label="Move up">
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === faqs.length - 1} onClick={() => moveFaq(index, 1)} aria-label="Move down">
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void removeFaq(index)} aria-label="Delete question">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {open && (
                        <div id={`faq-panel-${index}`} className="space-y-4 border-t border-border p-4">
                          <Field label="Question" required>
                            <Input id={`faq-question-${index}`} className="h-10" value={faq.question} onChange={(e) => updateFaq(index, { question: e.target.value })} placeholder="e.g. Do I need a permit for the Everest Base Camp trek?" />
                          </Field>
                          <Field label="Topic" hint="The tab this question appears under on the FAQ page. Automatic picks one from the question text.">
                            <select
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-72"
                              value={faq.category || ''}
                              onChange={(e) => updateFaq(index, { category: e.target.value })}
                            >
                              <option value="">Automatic ({topicLabel(faqTopicOf({ question: faq.question }))})</option>
                              {FAQ_TOPICS.map((topic) => (
                                <option key={topic.id} value={topic.id}>{topic.label}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Answer" required>
                            <MarkdownEditor value={faq.answer} onChange={(answer) => updateFaq(index, { answer })} rows={6} placeholder="Write a clear, helpful answer…" />
                          </Field>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </FormSection>

          <SaveBar
            dirty={dirty}
            saving={saving}
            onSave={onSave}
            onDiscard={dirty ? onDiscard : undefined}
            saveLabel="Save FAQ"
            status={!dirty && !saving && form.updatedAt ? `Last saved ${new Date(form.updatedAt).toLocaleString()}` : undefined}
          />
        </>
      )}
    </div>
  )
}
