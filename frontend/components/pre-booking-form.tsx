'use client'

import Link from 'next/link'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Download, Loader2, Send } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { submitPreBookingSubmission } from '@/lib/api'
import {
  createEmptyBookingFormState,
  getBookingFieldMap,
  type BookingFormConfig,
  type BookingFormFieldConfig,
  type BookingFormState,
} from '@/lib/booking-form-config'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useSiteSettings } from '@/hooks/use-site-settings'

interface PreBookingFormProps {
  trek?: Trek
  treks?: Trek[]
  requireTrek?: boolean
}

const preBookingFormConfig: BookingFormConfig = [
  {
    id: 'personal',
    title: 'Personal Information',
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', required: true },
      { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { id: 'nationality', label: 'Nationality', type: 'text', required: true },
      { id: 'phoneNumber', label: 'Phone Number (country code)', type: 'tel', required: true, placeholder: '+977 ...' },
      { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
      { id: 'passportNumber', label: 'Passport Number', type: 'text', required: true },
      { id: 'passportExpiryDate', label: 'Passport Expiry Date', type: 'date', required: true },
    ],
  },
  {
    id: 'trek',
    title: 'Trek Details',
    fields: [
      { id: 'nameOfTrekRoute', label: 'Name of Trek Route', type: 'select', required: true },
      { id: 'trekStartDate', label: 'Trek Start Date', type: 'date', required: true },
      { id: 'trekEndDate', label: 'Trek End Date', type: 'date', required: true },
      { id: 'tripType', label: 'Trip', type: 'select', required: true, options: ['Group', 'Private'] },
      { id: 'roomPreference', label: 'Room', type: 'select', required: true, options: ['Shared (included)', 'Private (extra charge)'] },
      { id: 'insuranceDetailsLater', label: 'Will you provide us with your travel insurance details when you meet your guide?', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'flight',
    title: 'Flight Details',
    fields: [
      { id: 'arrivalAirline', label: 'Arrival Airline', type: 'text' },
      { id: 'arrivalDate', label: 'Arrival Date', type: 'date' },
      { id: 'arrivalTime', label: 'Arrival Time', type: 'time' },
      { id: 'arrivalFlightNumber', label: 'Arrival Flight Number', type: 'text' },
      { id: 'departureAirline', label: 'Departure Airline', type: 'text' },
      { id: 'departureDate', label: 'Departure Date', type: 'date' },
      { id: 'departureTime', label: 'Departure Time', type: 'time' },
      { id: 'departureFlightNumber', label: 'Departure Flight Number', type: 'text' },
    ],
  },
  {
    id: 'payment',
    title: 'Payment Information',
    fields: [
      { id: 'totalAmountDue', label: 'Total Amount Due', type: 'text' },
      { id: 'depositPaid', label: 'Amount of Deposit Paid (advance)', type: 'text' },
      { id: 'balanceRemaining', label: 'Balance Remaining', type: 'text' },
      { id: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Bank Transfer', 'Cash on Arrival', 'Other'] },
      { id: 'balanceAgreement', label: 'I agree to pay the remaining balance at the group meeting prior to the departure date.', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'additional',
    title: 'Additional Information',
    fields: [
      {
        id: 'additionalInformation',
        label: 'Is there any additional information that you would like to share with Gele Trekking to help us ensure that your particular needs are cared for?',
        type: 'textarea',
        placeholder: 'For example, dietary requirements, allergies, etc. If so, please explain here.',
      },
    ],
  },
  {
    id: 'consent',
    title: 'Consent',
    fields: [
      { id: 'agreeTerms', label: 'Terms and Conditions accepted', type: 'checkbox', required: true },
      { id: 'acceptLiabilityWaiver', label: 'Liability waiver accepted', type: 'checkbox', required: true },
      { id: 'photoMarketingConsent', label: 'Photo marketing consent', type: 'checkbox' },
      { id: 'signatureName', label: 'Typed signature', type: 'text', required: true },
      { id: 'signatureDate', label: 'Signature date', type: 'date', required: true },
    ],
  },
]

export function PreBookingForm({ trek, treks = [], requireTrek = true }: PreBookingFormProps) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missingFieldIds, setMissingFieldIds] = useState<string[]>([])
  const [honeypot, setHoneypot] = useState('')
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now())
  const [captchaToken, setCaptchaToken] = useState('')
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0)
  const [downloadPdf, setDownloadPdf] = useState<{ dataUri: string; filename: string } | null>(null)
  const [form, setForm] = useState<BookingFormState>(() => ({
    ...createEmptyBookingFormState(preBookingFormConfig, trek),
    nameOfTrekRoute: trek?.title || '',
  }))

  const { settings } = useSiteSettings()

  const rawTurnstileSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
  const hasPlaceholderTurnstileKey = /your_turnstile_site_key|your-site-key|changeme|placeholder/i.test(rawTurnstileSiteKey)
  const turnstileSiteKey = hasPlaceholderTurnstileKey ? '' : rawTurnstileSiteKey
  const requiresCaptcha = Boolean(turnstileSiteKey)
  const fieldMap = useMemo(() => getBookingFieldMap(preBookingFormConfig), [])
  const activeSection = preBookingFormConfig[step] || preBookingFormConfig[0]
  const selectedTrek = useMemo(() => treks.find((item) => item.title === form.nameOfTrekRoute) || trek, [form.nameOfTrekRoute, trek, treks])
  const needsAltitudeCoverage = (selectedTrek?.maxAltitude || 0) > 5000

  const isFieldVisible = (field: BookingFormFieldConfig) => {
    if (field.id === 'nameOfTrekRoute' && !requireTrek && !trek && treks.length === 0) return false
    if (field.condition === 'sharedAccommodation') return form.roomPreference === 'Shared (included)'
    if (field.condition === 'altitudeCoverage') return needsAltitudeCoverage
    return true
  }

  const getMissingRequiredFields = (sections = preBookingFormConfig) => sections.flatMap((section) => section.fields).filter((field) => {
    if (!field.required || !isFieldVisible(field)) return false
    const value = form[field.id]
    return typeof value === 'boolean' ? !value : !String(value || '').trim()
  })

  const requiredConsentFields = ['agreeTerms', 'acceptLiabilityWaiver'].filter((id) => fieldMap.has(id))
  const consentComplete = requiredConsentFields.every((id) => form[id] === true)
  const isCaptchaReady = !requiresCaptcha || Boolean(captchaToken)
  const canSubmit = !submitting && getMissingRequiredFields().length === 0 && consentComplete && isCaptchaReady
  const currentMissingFields = getMissingRequiredFields([activeSection])
  const progressValue = ((step + 1) / preBookingFormConfig.length) * 100

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setMissingFieldIds((prev) => prev.filter((item) => item !== field))
    setError(null)
  }

  const validateStep = () => {
    const missing = getMissingRequiredFields([activeSection])
    if (missing.length > 0) {
      setMissingFieldIds(missing.map((field) => field.id))
      setError(`Please complete: ${missing.map((field) => field.label).join(', ')}.`)
      return false
    }
    setMissingFieldIds([])
    setError(null)
    return true
  }

  const validateAll = () => {
    const missing = getMissingRequiredFields()
    if (missing.length > 0) {
      const firstSectionIndex = preBookingFormConfig.findIndex((section) => section.fields.some((field) => field.id === missing[0].id))
      setStep(Math.max(0, firstSectionIndex))
      setMissingFieldIds(missing.map((field) => field.id))
      setError(`Please complete: ${missing.map((field) => field.label).join(', ')}.`)
      return false
    }
    if (!consentComplete) {
      setStep(Math.max(0, preBookingFormConfig.findIndex((section) => section.id === 'consent')))
      setError('Please accept the required consent items before submitting.')
      return false
    }
    setMissingFieldIds([])
    setError(null)
    return true
  }

  const getPdfFilename = () => ('gele-trekking-pre-booking-' + (String(form.fullName) || 'client') + '.pdf').toLowerCase().replace(/[^a-z0-9.-]+/g, '-')

  const createPdfBlobUrl = (dataUri: string) => {
    const base64 = dataUri.includes(',') ? dataUri.split(',').pop() || '' : dataUri
    const binary = window.atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  }

  const downloadLocalPdf = (dataUri: string, filename: string) => {
    const href = createPdfBlobUrl(dataUri)
    const link = document.createElement('a')
    link.href = href
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(href), 1000)
  }

  const generatePdf = async () => {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 16
    const headerHeight = 28
    const footerTop = pageHeight - 18
    const contentWidth = pageWidth - margin * 2
    let y = headerHeight + 12

    type PdfImage = { dataUrl: string; format: 'PNG' | 'JPEG' }
    const toImage = async (src?: string): Promise<PdfImage | null> => {
      if (!src) return null
      try {
        const response = await fetch(src, { cache: 'force-cache' })
        if (!response.ok) return null
        const blob = await response.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ''))
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        return { dataUrl, format: dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg') ? 'JPEG' : 'PNG' }
      } catch {
        return null
      }
    }

    const logo = await toImage(settings.logoUrl || '/geletrekking.png')
    const companyName = settings.siteName || 'GELE TREKKING'
    const contactLine = [settings.phone, settings.email].filter(Boolean).join(' | ')

    pdf.setProperties({ title: 'Gele Trekking Pre-booking Form', subject: 'Pre-booking form submission', author: companyName })
    const setText = (size: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [28, 35, 39]) => {
      pdf.setFont('helvetica', style)
      pdf.setFontSize(size)
      pdf.setTextColor(color[0], color[1], color[2])
    }
    const drawHeader = () => {
      pdf.setDrawColor(218, 226, 230)
      pdf.line(margin, headerHeight, pageWidth - margin, headerHeight)
      if (logo) pdf.addImage(logo.dataUrl, logo.format, margin, 6, 18, 18)
      setText(15, 'bold', [22, 31, 36])
      pdf.text('Gele Trekking Pre-booking Form', pageWidth / 2, 14, { align: 'center' })
      setText(8, 'normal', [91, 104, 111])
      pdf.text(companyName.toUpperCase(), pageWidth / 2, 20, { align: 'center' })
      pdf.text(new Date().toLocaleDateString(), pageWidth - margin, 14, { align: 'right' })
    }
    const drawFooter = () => {
      pdf.setDrawColor(218, 226, 230)
      pdf.line(margin, footerTop - 5, pageWidth - margin, footerTop - 5)
      setText(8, 'normal', [91, 104, 111])
      pdf.text(companyName, margin, footerTop)
      if (contactLine) pdf.text(contactLine, pageWidth - margin, footerTop, { align: 'right' })
    }
    const decoratePage = () => { drawHeader(); drawFooter() }
    const addPage = () => { pdf.addPage(); y = headerHeight + 12; decoratePage() }
    const ensureSpace = (needed = 10) => { if (y + needed > footerTop - 8) addPage() }
    const addSectionTitle = (title: string) => {
      ensureSpace(16)
      y += 3
      pdf.setDrawColor(202, 217, 224)
      pdf.rect(margin, y - 7, contentWidth, 10)
      setText(10, 'bold', [28, 35, 39])
      pdf.text(title.toUpperCase(), margin + 3, y)
      y += 10
    }
    const addField = (label: string, rawValue: string | boolean | undefined) => {
      const value = typeof rawValue === 'boolean' ? (rawValue ? 'Yes' : 'No') : String(rawValue || '-').trim() || '-'
      const labelWidth = 55
      const labelLines = pdf.splitTextToSize(label.toUpperCase(), labelWidth - 5)
      const valueLines = pdf.splitTextToSize(value, contentWidth - labelWidth - 5)
      const rowHeight = Math.max(9, labelLines.length * 4 + 4, valueLines.length * 5 + 4)
      ensureSpace(rowHeight + 2)
      pdf.setDrawColor(232, 237, 240)
      pdf.rect(margin, y - 5, contentWidth, rowHeight)
      setText(8, 'bold', [73, 85, 91])
      pdf.text(labelLines, margin + 3, y)
      setText(10, 'normal', [28, 35, 39])
      pdf.text(valueLines, margin + labelWidth + 3, y)
      y += rowHeight + 2
    }

    decoratePage()
    setText(9, 'normal', [73, 85, 91])
    pdf.text('Submitted: ' + new Date().toLocaleString(), margin, y)
    y += 9

    preBookingFormConfig.forEach((section) => {
      addSectionTitle(section.title)
      section.fields.forEach((field) => { if (isFieldVisible(field)) addField(field.label, form[field.id]) })
      y += 2
    })

    return pdf.output('datauristring')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validateAll()) return
    if (requiresCaptcha && !captchaToken) {
      setError('Please complete captcha verification before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    let pdfBase64 = ''
    try {
      pdfBase64 = await generatePdf()
    } catch (err) {
      setSubmitting(false)
      setError(err instanceof Error ? err.message : 'Unable to create the PDF form. Please try again.')
      return
    }

    const result = await submitPreBookingSubmission({
      formData: form,
      pdfBase64,
      website: honeypot,
      formStartedAt,
      captchaToken,
    })

    setSubmitting(false)

    if (!result.success) {
      setError(result.message)
      if (result.message.toLowerCase().includes('captcha')) {
        setCaptchaToken('')
        setTurnstileRenderKey((value) => value + 1)
      }
      return
    }

    const filename = getPdfFilename()
    setDownloadPdf({ dataUri: pdfBase64, filename })
    downloadLocalPdf(pdfBase64, filename)
    setSubmitted(true)
    setHoneypot('')
    setFormStartedAt(Date.now())
    setCaptchaToken('')
    setTurnstileRenderKey((value) => value + 1)
  }

  const inputClass = 'w-full h-11 px-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 text-sm'
  const textareaClass = 'w-full min-h-28 px-3 py-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 text-sm resize-none'
  const fieldShell = (field: BookingFormFieldConfig, children: ReactNode, wide = false) => {
    const missing = missingFieldIds.includes(field.id)
    return (
      <div className={wide ? 'sm:col-span-2 space-y-1.5' : 'space-y-1.5'}>
        <label className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
          <span>{field.label}</span>
          {field.required ? <span className="text-xs font-normal text-muted-foreground">Required</span> : null}
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

    if (field.id === 'nameOfTrekRoute') {
      return fieldShell(field, (
        <select value={String(form.nameOfTrekRoute || '')} onChange={(event) => updateField('nameOfTrekRoute', event.target.value)} className={className} aria-invalid={hasError}>
          <option value="">Select a trek route</option>
          {trek && !treks.some((item) => item.title === trek.title) ? <option value={trek.title}>{trek.title}</option> : null}
          {treks.map((item) => <option key={item.id} value={item.title}>{item.title}</option>)}
          <option value="Custom trek route / not sure yet">Custom trek route / not sure yet</option>
        </select>
      ))
    }

    if (field.id === 'agreeTerms') {
      return (
        <label className={`sm:col-span-2 flex items-start gap-3 rounded-md border bg-background p-4 text-sm ${hasError ? 'border-red-400' : 'border-border'}`}>
          <Checkbox checked={form.agreeTerms === true} onCheckedChange={(checked) => updateField('agreeTerms', checked === true)} />
          <span>I agree to the <Link href="/terms" className="text-primary underline underline-offset-2" target="_blank">Terms and Conditions</Link>.</span>
        </label>
      )
    }

    if (field.id === 'acceptLiabilityWaiver' || field.id === 'photoMarketingConsent') {
      return (
        <label className={`sm:col-span-2 flex items-start gap-3 rounded-md border bg-background p-4 text-sm ${hasError ? 'border-red-400' : 'border-border'}`}>
          <Checkbox checked={form[field.id] === true} onCheckedChange={(checked) => updateField(field.id, checked === true)} />
          <span>{field.id === 'acceptLiabilityWaiver' ? 'I accept the liability waiver.' : 'I consent to my photos being used for marketing.'}</span>
        </label>
      )
    }

    if (field.type === 'checkbox') {
      const yesOnly = field.id === 'insuranceDetailsLater' || field.id === 'balanceAgreement'
      return (
        <label className={`sm:col-span-2 flex items-start gap-3 rounded-md border bg-background p-4 text-sm ${hasError ? 'border-red-400' : 'border-border'}`}>
          <Checkbox checked={form[field.id] === true} onCheckedChange={(checked) => updateField(field.id, checked === true)} />
          <span>{field.label}{yesOnly ? ' Yes' : ''}</span>
        </label>
      )
    }

    if (field.type === 'textarea') {
      return fieldShell(field, <textarea value={String(form[field.id] || '')} onChange={(event) => updateField(field.id, event.target.value)} placeholder={field.placeholder} rows={3} className={(hasError ? textareaClass + ' border-red-400 focus:ring-red-200' : textareaClass)} aria-invalid={hasError} />, true)
    }

    if (field.type === 'select') {
      return fieldShell(field, (
        <select value={String(form[field.id] || '')} onChange={(event) => updateField(field.id, event.target.value)} className={className} aria-invalid={hasError}>
          <option value="">Select</option>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ))
    }

    return fieldShell(field, <input type={field.type} value={String(form[field.id] || '')} onChange={(event) => updateField(field.id, event.target.value)} placeholder={field.placeholder} className={className} aria-invalid={hasError} />)
  }

  if (submitted) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md border border-border">
          <CheckCircle2 className="h-8 w-8 text-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Pre-booking Form Sent</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Thank you. We have received your pre-booking details. A PDF copy has been downloaded in this browser.</p>
      {downloadPdf ? (
          <button
            type="button"
            onClick={() => downloadLocalPdf(downloadPdf.dataUri, downloadPdf.filename)}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Download another copy
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
        This form is stored securely through Gele Trekking's backend. It is not sent to Gmail or any other external email provider.
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div className="space-y-4 border-b border-border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Section {step + 1} of {preBookingFormConfig.length}</p>
              <h3 className="mt-1 text-xl font-bold text-foreground">{activeSection.title}</h3>
            </div>
            <div className="text-sm text-muted-foreground">{Math.round(progressValue)}% complete</div>
          </div>
          <Progress value={progressValue} />
          <select value={String(step)} onChange={(event) => { setStep(Number(event.target.value)); setError(null) }} className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-1 focus:ring-foreground/30 sm:hidden" aria-label="Pre-booking form section">
            {preBookingFormConfig.map((section, index) => <option key={section.id} value={String(index)}>{index + 1}. {section.title}</option>)}
          </select>
          <div className="hidden grid-cols-2 gap-2 sm:grid lg:grid-cols-4">
            {preBookingFormConfig.map((section, index) => {
              const missingCount = getMissingRequiredFields([section]).length
              const complete = missingCount === 0
              const selected = step === index
              return (
                <button key={section.id} type="button" onClick={() => { setStep(index); setError(null) }} className={`flex min-h-14 items-center gap-2 rounded-md border px-3 py-2 text-left text-xs leading-tight ${selected ? 'border-foreground bg-background text-foreground' : 'border-border bg-background text-muted-foreground'}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${complete ? 'border-foreground text-foreground' : 'border-border text-muted-foreground'}`}>{index + 1}</span>
                  <span className="min-w-0 flex-1"><span className="line-clamp-2 font-semibold">{section.title}</span>{!complete ? <span className="mt-0.5 block text-[11px] text-muted-foreground">{missingCount} left</span> : null}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{currentMissingFields.length === 0 ? 'This section is complete.' : `${currentMissingFields.length} required field(s) remaining in this section.`}</p>
            <span className="text-xs text-muted-foreground">{activeSection.fields.length} fields</span>
          </div>
          {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeSection.fields.map((field) => <div key={field.id} className="contents">{renderField(field)}</div>)}
            {activeSection.id === 'consent' && requiresCaptcha ? (
              <div className="space-y-3 rounded-md border border-border bg-background p-4 sm:col-span-2">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-foreground">Security verification</p><span className="text-xs font-medium text-muted-foreground">{isCaptchaReady ? 'Verified' : 'Required'}</span></div>
                <TurnstileWidget key={turnstileRenderKey} siteKey={turnstileSiteKey} onVerify={(value) => { setCaptchaToken(value); setError(null) }} onExpire={() => setCaptchaToken('')} onError={() => { setCaptchaToken(''); setError('Captcha failed to load. Verify Turnstile site key domain settings and disable ad blockers for this site.') }} />
              </div>
            ) : null}
            {activeSection.id === 'consent' && !requiresCaptcha ? <p className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground sm:col-span-2">{hasPlaceholderTurnstileKey ? 'Captcha key is a placeholder. Set a real `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to show verification.' : 'Captcha is not configured in this environment.'}</p> : null}
          </div>
        </div>
      </div>
      <input type="text" name="website" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} autoComplete="off" tabIndex={-1} className="hidden" aria-hidden="true" />
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => { setError(null); setStep((value) => Math.max(0, value - 1)) }} disabled={step === 0 || submitting} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-50"><ArrowLeft className="h-4 w-4" /> Back</button>
        {step < preBookingFormConfig.length - 1 ? (
          <button type="button" onClick={() => validateStep() && setStep((value) => Math.min(preBookingFormConfig.length - 1, value + 1))} className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background">Next <ArrowRight className="h-4 w-4" /></button>
        ) : (
          <button type="submit" disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{submitting ? 'Submitting...' : 'Submit Pre-booking Form'}</button>
        )}
      </div>
    </form>
  )
}
