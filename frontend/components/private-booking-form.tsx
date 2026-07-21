'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, FileText, Loader2, Send } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { getPrivateBookingFormLink, submitPrivateBookingSubmission } from '@/lib/api'
import {
  createEmptyBookingFormState,
  defaultBookingFormConfig,
  getBookingFieldMap,
  normalizeBookingFormConfig,
  type BookingFormFieldConfig,
  type BookingFormState,
} from '@/lib/booking-form-config'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PrivateBookingFormProps {
  token: string
  trek?: Trek
  treks?: Trek[]
  requireTrek?: boolean
}

export function PrivateBookingForm({ token, trek, treks = [], requireTrek = false }: PrivateBookingFormProps) {
  const [step, setStep] = useState(0)
  const [formConfig, setFormConfig] = useState(defaultBookingFormConfig)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missingFieldIds, setMissingFieldIds] = useState<string[]>([])
  const [honeypot, setHoneypot] = useState('')
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now())
  const [captchaToken, setCaptchaToken] = useState('')
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0)
  const [form, setForm] = useState<BookingFormState>(() => createEmptyBookingFormState(defaultBookingFormConfig, trek))
  const [linkLoading, setLinkLoading] = useState(true)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [downloadPdf, setDownloadPdf] = useState<{ dataUri: string; filename: string } | null>(null)

  const rawTurnstileSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
  const hasPlaceholderTurnstileKey = /your_turnstile_site_key|your-site-key|changeme|placeholder/i.test(rawTurnstileSiteKey)
  const turnstileSiteKey = hasPlaceholderTurnstileKey ? '' : rawTurnstileSiteKey
  const requiresCaptcha = Boolean(turnstileSiteKey)
  const selectedTrek = useMemo(() => treks.find((item) => item.title === form.trekPackage) || trek, [form.trekPackage, trek, treks])
  const needsAltitudeCoverage = (selectedTrek?.maxAltitude || 0) > 5000
  const fieldMap = useMemo(() => getBookingFieldMap(formConfig), [formConfig])
  const activeSection = formConfig[step] || formConfig[0]

  const isFieldVisible = (field: BookingFormFieldConfig) => {
    if (field.id === 'trekPackage' && !requireTrek && !trek && treks.length === 0) return false
    if (field.condition === 'sharedAccommodation') return form.accommodationPreference === 'Shared'
    if (field.condition === 'altitudeCoverage') return needsAltitudeCoverage
    return true
  }

  const getMissingRequiredFields = (sections = formConfig) => sections.flatMap((section) => section.fields).filter((field) => {
    if (!field.required || !isFieldVisible(field)) return false
    const value = form[field.id]
    return typeof value === 'boolean' ? !value : !String(value || '').trim()
  })

  const currentMissingFields = getMissingRequiredFields([activeSection])
  const currentStepComplete = currentMissingFields.length === 0
  const requiredConsentFields = ['agreeTerms', 'acceptLiabilityWaiver'].filter((id) => fieldMap.has(id))
  const consentComplete = requiredConsentFields.every((id) => form[id] === true)
  const isCaptchaReady = !requiresCaptcha || Boolean(captchaToken)
  const canSubmit = !submitting && getMissingRequiredFields().length === 0 && consentComplete && isCaptchaReady
  const progressValue = ((step + 1) / formConfig.length) * 100

  useEffect(() => {
    let cancelled = false
    const loadLink = async () => {
      try {
        const link = await getPrivateBookingFormLink(token)
        if (cancelled) return
        const nextConfig = normalizeBookingFormConfig(link.formConfig)
        const nameParts = (link.clientName || '').trim().split(/\s+/).filter(Boolean)
        setFormConfig(nextConfig)
        setForm((prev) => ({
          ...createEmptyBookingFormState(nextConfig, trek),
          ...prev,
          email: prev.email || link.clientEmail || '',
          trekPackage: prev.trekPackage || link.trekPackage || '',
          firstName: prev.firstName || nameParts[0] || '',
          lastName: prev.lastName || nameParts.slice(1).join(' '),
        }))
        setLinkError(null)
      } catch (err) {
        if (!cancelled) setLinkError(err instanceof Error ? err.message : 'This private booking form link is not available.')
      } finally {
        if (!cancelled) setLinkLoading(false)
      }
    }

    void loadLink()
    return () => { cancelled = true }
  }, [token, trek])

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setMissingFieldIds((prev) => prev.filter((item) => item !== field))
  }

  const downloadLocalPdf = (dataUri: string, filename: string) => {
    const link = document.createElement('a')
    link.href = dataUri
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const validateStep = () => {
    const missing = getMissingRequiredFields([activeSection])
    if (missing.length > 0) {
      setMissingFieldIds(missing.map((field) => field.id))
      setError(`Please complete: ${missing.map((field) => field.label).join(', ')}.`)
      return false
    }
    setError(null)
    setMissingFieldIds([])
    return true
  }

  const validateAll = () => {
    const missing = getMissingRequiredFields()
    if (missing.length > 0) {
      const firstSectionIndex = formConfig.findIndex((section) => section.fields.some((field) => field.id === missing[0].id))
      setStep(Math.max(0, firstSectionIndex))
      setMissingFieldIds(missing.map((field) => field.id))
      setError(`Please complete: ${missing.map((field) => field.label).join(', ')}.`)
      return false
    }
    if (!consentComplete) {
      setStep(Math.max(0, formConfig.findIndex((section) => section.id === 'consent')))
      setError('Please accept the required consent items before submitting.')
      return false
    }
    setError(null)
    setMissingFieldIds([])
    return true
  }

  const generatePdf = async () => {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 16
    const contentWidth = pageWidth - margin * 2
    let y = 18

    const addText = (text: string, size = 10, style: 'normal' | 'bold' = 'normal') => {
      pdf.setFont('helvetica', style)
      pdf.setFontSize(size)
      const lines = pdf.splitTextToSize(text || '-', contentWidth)
      lines.forEach((line: string) => {
        if (y > pageHeight - 18) {
          pdf.addPage()
          y = 18
        }
        pdf.text(line, margin, y)
        y += size > 11 ? 7 : 5
      })
    }

    pdf.setProperties({ title: 'Gele Trekking Booking Form' })
    addText('Gele Trekking Booking Form', 16, 'bold')
    addText(`Submitted: ${new Date().toLocaleString()}`)
    y += 3

    formConfig.forEach((section) => {
      if (y > pageHeight - 35) {
        pdf.addPage()
        y = 18
      }
      addText(section.title, 12, 'bold')
      section.fields.forEach((field) => {
        if (!isFieldVisible(field)) return
        const value = form[field.id]
        addText(`${field.label}: ${typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '-'}`)
      })
      y += 2
    })

    return pdf.output('datauristring')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    if (requiresCaptcha && !captchaToken) {
      setError('Please complete captcha verification before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const pdfBase64 = await generatePdf()
      const result = await submitPrivateBookingSubmission(token, {
        formData: form,
        pdfBase64,
        website: honeypot,
        formStartedAt,
        captchaToken,
      })

      if (!result.success) {
        setError(result.message)
        if (result.message.toLowerCase().includes('captcha')) {
          setCaptchaToken('')
          setTurnstileRenderKey((value) => value + 1)
        }
        return
      }

      const filename = ('gele-trekking-booking-' + (String(form.firstName) || 'client') + '-' + (String(form.lastName) || 'form') + '.pdf').toLowerCase().replace(/[^a-z0-9.-]+/g, '-')
      setDownloadPdf({ dataUri: pdfBase64, filename })
      downloadLocalPdf(pdfBase64, filename)
      setSubmitted(true)
      setHoneypot('')
      setFormStartedAt(Date.now())
      setCaptchaToken('')
      setTurnstileRenderKey((value) => value + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create the PDF form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full h-11 px-4 rounded-md border border-input bg-background text-foreground shadow-xs placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring text-sm'
  const textareaClass = 'w-full min-h-28 px-4 py-3 rounded-md border border-input bg-background text-foreground shadow-xs placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring text-sm'
  const fieldShell = (field: BookingFormFieldConfig, children: React.ReactNode, wide = false) => {
    const missing = missingFieldIds.includes(field.id)
    return (
      <div className={wide ? 'sm:col-span-2 space-y-1.5' : 'space-y-1.5'}>
        <label className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
          <span>{field.label}</span>
          {field.required ? <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-700">Required</span> : null}
        </label>
        {children}
        {missing ? <p className="flex items-center gap-1.5 text-xs text-red-600"><CircleAlert className="h-3.5 w-3.5" /> {field.label} is required.</p> : null}
      </div>
    )
  }

  const renderField = (field: BookingFormFieldConfig) => {
    if (!isFieldVisible(field)) return null
    const hasError = missingFieldIds.includes(field.id)
    const className = `${inputClass} ${hasError ? 'border-red-400 focus:ring-red-200' : ''}`

    if (field.id === 'trekPackage') {
      return fieldShell(field, (
        <select value={String(form.trekPackage || '')} onChange={(e) => updateField('trekPackage', e.target.value)} className={className} autoComplete="off" aria-invalid={hasError}>
          <option value="">Select a trek</option>
          {trek && !treks.some((item) => item.title === trek.title) ? <option value={trek.title}>{trek.title}</option> : null}
          {treks.map((item) => <option key={item.id} value={item.title}>{item.title}</option>)}
        </select>
      ))
    }

    if (field.id === 'agreeTerms') {
      return (
        <label className={`sm:col-span-2 flex items-start gap-3 rounded-md border bg-background p-4 text-sm shadow-xs ${hasError ? 'border-red-400 bg-red-50' : 'border-border'}`}>
          <Checkbox checked={form.agreeTerms === true} onCheckedChange={(checked) => updateField('agreeTerms', checked === true)} />
          <span>I agree to the <Link href="/terms" className="text-primary underline underline-offset-2" target="_blank">Terms and Conditions</Link>.</span>
        </label>
      )
    }

    if (field.id === 'acceptLiabilityWaiver' || field.id === 'photoMarketingConsent') {
      return (
        <label className={`sm:col-span-2 flex items-start gap-3 rounded-md border bg-background p-4 text-sm shadow-xs ${hasError ? 'border-red-400 bg-red-50' : 'border-border'}`}>
          <Checkbox checked={form[field.id] === true} onCheckedChange={(checked) => updateField(field.id, checked === true)} />
          <span>{field.id === 'acceptLiabilityWaiver' ? 'I accept the liability waiver.' : 'I consent to my photos being used for marketing.'}</span>
        </label>
      )
    }

    if (field.type === 'checkbox') {
      return (
        <label className={`sm:col-span-2 flex items-start gap-3 rounded-md border bg-background p-4 text-sm shadow-xs ${hasError ? 'border-red-400 bg-red-50' : 'border-border'}`}>
          <Checkbox checked={form[field.id] === true} onCheckedChange={(checked) => updateField(field.id, checked === true)} />
          <span>{field.label}</span>
        </label>
      )
    }

    if (field.type === 'textarea') {
      return fieldShell(field, (
        <textarea value={String(form[field.id] || '')} onChange={(e) => updateField(field.id, e.target.value)} placeholder={field.placeholder} rows={3} className={(hasError ? textareaClass + ' border-red-400 focus:ring-red-200' : textareaClass) + ' resize-none'} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} aria-invalid={hasError} />
      ), true)
    }

    if (field.type === 'select') {
      return fieldShell(field, (
        <select value={String(form[field.id] || '')} onChange={(e) => updateField(field.id, e.target.value)} className={className} autoComplete="off" aria-invalid={hasError}>
          <option value="">Select</option>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ))
    }

    return fieldShell(field, (
      <input type={field.type} value={String(form[field.id] || '')} onChange={(e) => updateField(field.id, e.target.value)} placeholder={field.placeholder} className={className} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} aria-invalid={hasError} />
    ))
  }

  if (linkLoading) {
    return <div className="rounded-lg border border-border bg-muted/20 p-5 text-sm text-muted-foreground">Checking private form link...</div>
  }

  if (linkError) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">{linkError}</div>
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-xl font-bold text-foreground mb-2">Booking Form Submitted</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Your PDF form is now available to admins in the dashboard. A copy has been downloaded in this browser.
        </p>
        {downloadPdf ? (
          <button
            type="button"
            onClick={() => downloadLocalPdf(downloadPdf.dataUri, downloadPdf.filename)}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Download another copy
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <div className="overflow-hidden rounded-lg border border-border bg-background shadow-xs">
        <div className="space-y-4 border-b border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Section {step + 1} of {formConfig.length}</p>
              <h3 className="mt-1 text-xl font-bold text-foreground">{activeSection.title}</h3>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground">
              {Math.round(progressValue)}% complete
            </div>
          </div>
          <Progress value={progressValue} />
          <Tabs value={String(step)} onValueChange={(value) => { setStep(Number(value)); setError(null) }}>
            <TabsList className="flex h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
              {formConfig.map((section, index) => {
                const missingCount = getMissingRequiredFields([section]).length
                const complete = missingCount === 0
                return (
                  <TabsTrigger key={section.id} value={String(index)} className="min-w-[150px] justify-start gap-2 whitespace-normal rounded-md border border-border bg-background px-3 py-2 text-left text-xs leading-tight data-[state=active]:border-primary data-[state=active]:bg-primary/5">
                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${complete ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="line-clamp-2">{section.title}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
        <div className="p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{currentStepComplete ? 'This section is complete.' : `${currentMissingFields.length} required field(s) remaining in this section.`}</p>
            <span className="w-fit rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{activeSection.fields.length} fields</span>
          </div>

          {error ? <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p> : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeSection.fields.map((field) => <div key={field.id} className="contents">{renderField(field)}</div>)}
        {activeSection.id === 'consent' && requiresCaptcha ? (
          <div className="sm:col-span-2 rounded-lg bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Security verification</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isCaptchaReady ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}`}>
                {isCaptchaReady ? 'Verified' : 'Required'}
              </span>
            </div>
            <TurnstileWidget
              key={turnstileRenderKey}
              siteKey={turnstileSiteKey}
              onVerify={(value) => { setCaptchaToken(value); setError(null) }}
              onExpire={() => setCaptchaToken('')}
              onError={() => { setCaptchaToken(''); setError('Captcha failed to load. Verify Turnstile site key domain settings and disable ad blockers for this site.') }}
            />
          </div>
        ) : null}
        {activeSection.id === 'consent' && !requiresCaptcha ? (
          <p className="sm:col-span-2 text-sm text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
            {hasPlaceholderTurnstileKey ? 'Captcha key is a placeholder. Set a real `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to show verification.' : 'Captcha is not configured in this environment.'}
          </p>
        ) : null}
          </div>
        </div>
      </div>

      <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" tabIndex={-1} className="hidden" aria-hidden="true" />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
        <button type="button" onClick={() => { setError(null); setStep((value) => Math.max(0, value - 1)) }} disabled={step === 0 || submitting} className="inline-flex items-center justify-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {step < formConfig.length - 1 ? (
          <button type="button" onClick={() => validateStep() && setStep((value) => Math.min(formConfig.length - 1, value + 1))} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="submit" disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Creating PDF...' : 'Submit PDF Form'}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed flex gap-2">
        <FileText className="w-4 h-4 shrink-0" />
        Admins download the PDF from the protected dashboard. No PDF copy is emailed; you can download your copy immediately after submission.
      </p>
    </form>
  )
}
