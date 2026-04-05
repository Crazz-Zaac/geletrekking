'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getAdminFaq, updateAdminFaq, type AdminFaq, type AdminFaqItem } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { Trash2, Plus, AlertCircle, CheckCircle, HelpCircle, GripVertical } from 'lucide-react'

const defaultFaq: Required<AdminFaq> = {
  heroTitle: 'Frequently Asked Questions',
  heroSubtitle:
    'Helpful answers about trekking seasons, permits, difficulty, insurance, and planning your Himalayan adventure.',
  faqs: [],
}

export default function AdminFaqPage() {
  const [form, setForm] = useState<Required<AdminFaq>>(defaultFaq)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminFaq()
      const heroTitle = (data.heroTitle || '').trim() || defaultFaq.heroTitle
      const heroSubtitle = (data.heroSubtitle || '').trim() || defaultFaq.heroSubtitle
      const faqs = (data.faqs || []).filter((f) => f.question?.trim() || f.answer?.trim())
      setForm({ heroTitle, heroSubtitle, faqs })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const updateFaqItem = (index: number, next: Partial<AdminFaqItem>) => {
    setForm((prev) => {
      const faqs = [...prev.faqs]
      faqs[index] = { ...faqs[index], ...next }
      return { ...prev, faqs }
    })
  }

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '', order: prev.faqs.length }],
    }))
  }

  const removeFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs
        .filter((_, idx) => idx !== index)
        .map((f, i) => ({ ...f, order: i })),
    }))
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
      await updateAdminFaq(token, {
        ...form,
        faqs: form.faqs.map((f, i) => ({ ...f, order: i })),
      })
      setMessage('FAQ page updated successfully.')
      setTimeout(() => setMessage(''), 5000)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ page')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">FAQ Page Editor</h1>
          <p className="text-muted-foreground">Manage questions and answers shown on the public FAQ page</p>
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

        <div className="space-y-6">

          {/* ── Hero Section ── */}
          <Card className="border-border shadow-lg">
            <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-background">
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>The heading and subtitle shown at the top of the FAQ page</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <span className="ml-3 text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Page Title</label>
                    <Input
                      value={form.heroTitle}
                      onChange={(e) => setForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                      placeholder="e.g., Frequently Asked Questions"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subtitle</label>
                    <Textarea
                      value={form.heroSubtitle}
                      onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                      placeholder="Brief description shown below the title..."
                      rows={3}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.heroSubtitle?.length || 0} characters
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── FAQ Items ── */}
          <Card className="border-border shadow-lg">
            <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-background">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>FAQ Items</CardTitle>
                  <CardDescription className="mt-1">Add, edit or remove questions and answers</CardDescription>
                </div>
                {!loading && (
                  <Button variant="outline" size="sm" onClick={addFaq} className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <span className="ml-3 text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-violet-50/50 to-indigo-50/50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 pt-1 text-muted-foreground shrink-0">
                          <GripVertical className="w-4 h-4" />
                          <span className="text-xs font-medium w-5 text-center">{index + 1}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Question</label>
                            <Input
                              value={faq.question}
                              onChange={(e) => updateFaqItem(index, { question: e.target.value })}
                              placeholder="e.g., What is the best trekking season?"
                              className="h-9 bg-white dark:bg-slate-950"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Answer</label>
                            <Textarea
                              value={faq.answer}
                              onChange={(e) => updateFaqItem(index, { answer: e.target.value })}
                              placeholder="Provide a clear and helpful answer..."
                              rows={3}
                              className="text-sm bg-white dark:bg-slate-950"
                            />
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFaq(index)}
                          className="shrink-0 mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {form.faqs.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No FAQ items yet. Add your first question!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Save Button ── */}
          {!loading && (
            <div className="flex items-center justify-end pt-2">
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
          )}

        </div>
      </div>
    </div>
  )
}
