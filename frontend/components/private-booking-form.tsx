'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Download, Mail, MessageCircle } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { getPrivateBookingFormLink, submitPrivateBookingSubmission } from '@/lib/api'
import {
  createEmptyBookingFormState,
  defaultBookingFormConfig,
  normalizeBookingFormConfig,
  type BookingFormFieldConfig,
  type BookingFormState,
} from '@/lib/booking-form-config'
import { BookingWizard, type BookingSubmitResult } from '@/components/booking-wizard'
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/contact-links'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { loadPdfLogo } from '@/lib/pdf-images'
import { COMPANY_REGISTRATION_LINE } from '@/lib/site-metrics'

interface PrivateBookingFormProps {
  token: string
  trek?: Trek
  treks?: Trek[]
  requireTrek?: boolean
}

function ContactHelp() {
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
        <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp us
      </a>
      <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
        <Mail className="h-4 w-4" aria-hidden="true" /> {CONTACT_EMAIL}
      </a>
    </div>
  )
}

export function PrivateBookingForm({ token, trek, treks = [], requireTrek = false }: PrivateBookingFormProps) {
  const [formConfig, setFormConfig] = useState(defaultBookingFormConfig)
  const [submitted, setSubmitted] = useState(false)
  const [formStartedAt] = useState<number>(() => Date.now())
  const [form, setForm] = useState<BookingFormState>(() => createEmptyBookingFormState(defaultBookingFormConfig, trek))
  const [linkLoading, setLinkLoading] = useState(true)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [downloadPdf, setDownloadPdf] = useState<{ dataUri: string; filename: string } | null>(null)

  const selectedTrek = useMemo(() => treks.find((item) => item.title === form.trekPackage) || trek, [form.trekPackage, trek, treks])
  const needsAltitudeCoverage = (selectedTrek?.maxAltitude || 0) > 5000
  const { settings } = useSiteSettings()

  const isFieldVisible = (field: BookingFormFieldConfig) => {
    if (field.id === 'trekPackage' && !requireTrek && !trek && treks.length === 0) return false
    if (field.condition === 'sharedAccommodation') return form.accommodationPreference === 'Shared'
    if (field.condition === 'altitudeCoverage') return needsAltitudeCoverage
    return true
  }

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

  const updateField = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }))

  const getPdfFilename = () => ('gele-trekking-booking-' + (String(form.firstName) || 'client') + '-' + (String(form.lastName) || 'form') + '.pdf').toLowerCase().replace(/[^a-z0-9.-]+/g, '-')

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
    const headerHeight = 30
    const footerTop = pageHeight - 18
    const contentWidth = pageWidth - margin * 2
    let y = headerHeight + 12

    const logo = await loadPdfLogo(settings.logoUrl)
    const companyName = settings.siteName || 'GELE TREKKING'
    const contactLine = [settings.phone, settings.email].filter(Boolean).join(' | ')

    pdf.setProperties({
      title: 'Gele Trekking Booking Form',
      subject: 'Private booking form submission',
      author: companyName,
    })

    const setText = (size: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [28, 35, 39]) => {
      pdf.setFont('helvetica', style)
      pdf.setFontSize(size)
      pdf.setTextColor(color[0], color[1], color[2])
    }

    const withOpacity = (opacity: number, draw: () => void) => {
      const doc = pdf as unknown as { GState?: new (value: { opacity: number }) => unknown; setGState?: (state: unknown) => void }
      if (!doc.GState || !doc.setGState) return

      try {
        doc.setGState(new doc.GState({ opacity }))
        draw()
      } finally {
        doc.setGState(new doc.GState({ opacity: 1 }))
      }
    }

    const drawWatermark = () => {
      if (!logo) return
      withOpacity(0.05, () => {
        const size = 112
        pdf.addImage(logo.dataUrl, logo.format, (pageWidth - size) / 2, 92, size, size)
      })
    }

    const drawHeader = () => {
      pdf.setFillColor(250, 252, 252)
      pdf.rect(0, 0, pageWidth, headerHeight, 'F')
      pdf.setDrawColor(218, 226, 230)
      pdf.line(margin, headerHeight, pageWidth - margin, headerHeight)

      if (logo) pdf.addImage(logo.dataUrl, logo.format, margin, 7, 18, 18)

      setText(15, 'bold', [22, 31, 36])
      pdf.text('Gele Trekking Booking Form', pageWidth / 2, 15, { align: 'center' })
      setText(8, 'normal', [91, 104, 111])
      pdf.text(companyName.toUpperCase(), pageWidth / 2, 21, { align: 'center' })
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

    const decoratePage = () => {
      drawWatermark()
      drawHeader()
      drawFooter()
    }

    const addPage = () => {
      pdf.addPage()
      y = headerHeight + 12
      decoratePage()
    }

    const ensureSpace = (needed = 10) => {
      if (y + needed <= footerTop - 8) return
      addPage()
    }

    const addSectionTitle = (title: string) => {
      ensureSpace(18)
      y += 3
      pdf.setFillColor(230, 241, 245)
      pdf.setDrawColor(202, 217, 224)
      pdf.roundedRect(margin, y - 7, contentWidth, 11, 2, 2, 'FD')
      setText(11, 'bold', [0, 77, 103])
      pdf.text(title.toUpperCase(), margin + 4, y)
      y += 11
    }

    const addField = (label: string, rawValue: string | boolean | undefined) => {
      const value = typeof rawValue === 'boolean' ? (rawValue ? 'Yes' : 'No') : String(rawValue || '-').trim() || '-'
      const labelWidth = 50
      const labelLines = pdf.splitTextToSize(label.toUpperCase(), labelWidth - 6)
      const valueLines = pdf.splitTextToSize(value, contentWidth - labelWidth - 6)
      const rowHeight = Math.max(9, labelLines.length * 4 + 4, valueLines.length * 5 + 4)
      ensureSpace(rowHeight + 2)

      pdf.setDrawColor(232, 237, 240)
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(margin, y - 5, contentWidth, rowHeight, 1.5, 1.5, 'FD')
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

    formConfig.forEach((section) => {
      addSectionTitle(section.title)
      section.fields.forEach((field) => {
        if (!isFieldVisible(field)) return
        addField(field.label, form[field.id])
      })
      y += 2
    })

    return pdf.output('datauristring')
  }

  const handleDownloadCopy = async () => {
    const dataUri = await generatePdf()
    const filename = getPdfFilename()
    setDownloadPdf({ dataUri, filename })
    downloadLocalPdf(dataUri, filename)
  }

  const handleSubmit = async ({ captchaToken, honeypot }: { captchaToken: string; honeypot: string }): Promise<BookingSubmitResult> => {
    const pdfBase64 = await generatePdf()
    const result = await submitPrivateBookingSubmission(token, {
      formData: form,
      pdfBase64,
      website: honeypot,
      formStartedAt,
      captchaToken,
    })
    if (!result.success) return { ok: false, message: result.message }

    const filename = getPdfFilename()
    setDownloadPdf({ dataUri: pdfBase64, filename })
    downloadLocalPdf(pdfBase64, filename)
    setSubmitted(true)
    return { ok: true }
  }

  if (linkLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading your form">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (linkError) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-5">
        <h2 className="font-semibold text-foreground">This link isn&apos;t available</h2>
        <p className="mt-1 text-sm text-muted-foreground">{linkError} Please contact us and we&apos;ll send you a new one.</p>
        <ContactHelp />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Thank you{form.firstName ? `, ${String(form.firstName)}` : ''}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;ve received your booking form and will be in touch soon. A PDF copy has been saved to your device.
        </p>
        {downloadPdf ? (
          <button
            type="button"
            onClick={() => downloadLocalPdf(downloadPdf.dataUri, downloadPdf.filename)}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-semibold hover:bg-muted/60"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Download another copy
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <BookingWizard
      sections={formConfig}
      form={form}
      onFieldChange={updateField}
      isFieldVisible={isFieldVisible}
      trekField={{ id: 'trekPackage', placeholder: 'Select a trek', options: [...new Set([...(trek ? [trek.title] : []), ...treks.map((item) => item.title)])] }}
      draftKey={`private:${token.slice(0, 16)}`}
      onRestoreDraft={(draft) => setForm((prev) => ({ ...prev, ...draft }))}
      submitLabel="Submit booking form"
      onSubmit={handleSubmit}
      onDownloadCopy={handleDownloadCopy}
    />
  )
}
