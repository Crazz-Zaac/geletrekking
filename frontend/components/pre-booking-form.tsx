'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { submitPreBookingSubmission } from '@/lib/api'
import {
  createEmptyBookingFormState,
  preBookingFormConfig,
  type BookingFormFieldConfig,
  type BookingFormState,
} from '@/lib/booking-form-config'
import { BookingWizard, type BookingSubmitResult } from '@/components/booking-wizard'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { loadPdfLogo } from '@/lib/pdf-images'
import { COMPANY_REGISTRATION_LINE } from '@/lib/site-metrics'

interface PreBookingFormProps {
  trek?: Trek
  treks?: Trek[]
  requireTrek?: boolean
}

export function PreBookingForm({ trek, treks = [], requireTrek = true }: PreBookingFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [formStartedAt] = useState<number>(() => Date.now())
  const [form, setForm] = useState<BookingFormState>(() => ({
    ...createEmptyBookingFormState(preBookingFormConfig, trek),
    nameOfTrekRoute: trek?.title || '',
  }))

  const { settings } = useSiteSettings()
  const selectedTrek = useMemo(() => treks.find((item) => item.title === form.nameOfTrekRoute) || trek, [form.nameOfTrekRoute, trek, treks])
  const needsAltitudeCoverage = (selectedTrek?.maxAltitude || 0) > 5000

  const isFieldVisible = (field: BookingFormFieldConfig) => {
    if (field.id === 'nameOfTrekRoute' && !requireTrek && !trek && treks.length === 0) return false
    if (field.condition === 'sharedAccommodation') return form.roomPreference === 'Shared (included)'
    if (field.condition === 'altitudeCoverage') return needsAltitudeCoverage
    return true
  }

  const updateField = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }))

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

    const logo = await loadPdfLogo(settings.logoUrl)
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
      pdf.text(COMPANY_REGISTRATION_LINE, margin, footerTop + 4.5)
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

  const handleSubmit = async ({ captchaToken, honeypot }: { captchaToken: string; honeypot: string }): Promise<BookingSubmitResult> => {
    const pdfBase64 = await generatePdf()
    const result = await submitPreBookingSubmission({
      formData: form,
      pdfBase64,
      website: honeypot,
      formStartedAt,
      captchaToken,
    })
    if (!result.success) return { ok: false, message: result.message }

    downloadLocalPdf(pdfBase64, getPdfFilename())
    setSubmitted(true)
    return { ok: true }
  }

  if (submitted) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Thank you{form.fullName ? `, ${String(form.fullName).trim().split(/\s+/)[0]}` : ''}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;ve received your pre-booking details and will reply to the email address you gave us. A PDF copy has been saved to your device.
        </p>
      </div>
    )
  }

  return (
    <BookingWizard
      sections={preBookingFormConfig}
      form={form}
      onFieldChange={updateField}
      isFieldVisible={isFieldVisible}
      trekField={{
        id: 'nameOfTrekRoute',
        placeholder: 'Select a trek route',
        options: [...new Set([...(trek ? [trek.title] : []), ...treks.map((item) => item.title), 'Custom trek route / not sure yet'])],
      }}
      draftKey="pre-booking"
      onRestoreDraft={(draft) => setForm((prev) => ({ ...prev, ...draft }))}
      submitLabel="Submit pre-booking form"
      onSubmit={handleSubmit}
    />
  )
}
