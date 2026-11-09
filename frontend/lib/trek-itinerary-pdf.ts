import type { Trek } from '@/lib/data'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/contact-links'
import { loadPdfImage, loadPdfLogo, type PdfImage } from '@/lib/pdf-images'
import { COMPANY_REGISTRATION_LINE } from '@/lib/site-metrics'
import { buildItineraryRows } from '@/lib/trek-itinerary'

type Colour = [number, number, number]
type KeyValue = { label: string; value: string }

export type TrekItineraryPdfData = {
  trek: Trek
  settings: { siteName?: string; logoUrl?: string; phone?: string; email?: string; address?: string }
  socialLinks: Array<{ label: string; url: string }>
  summary: KeyValue[]
  details: KeyValue[]
  packages: Array<{ name: string; priceUsd: number; wasPriceUsd?: number; includes: string[] }>
  essentials: Array<{ title: string; summary?: string; detail?: string }>
  equipment: string[]
  faqs: Array<{ question: string; answer: string }>
}

const BRAND: Colour = [0, 77, 103]
const INK: Colour = [22, 31, 36]
const BODY: Colour = [43, 52, 57]
const MUTED: Colour = [91, 104, 111]
const RULE: Colour = [212, 222, 227]
const TINT: Colour = [240, 246, 248]

const MARGIN = 16
const HEADER_BOTTOM = 25
const FOOTER_HEIGHT = 20
const WEBSITE = 'www.geletrekking.com'
const COVER_RATIO = 2.2

const TIP_GUIDELINE =
  'Tipping is not mandatory, but it is a meaningful way to express gratitude for the services provided, in line with trekking traditions. It typically occurs on the final night of the trek, often accompanied by a celebration with the team. During this time, the support team shares their joy and emotions. The leader will guide the group in collecting the tips, which are then distributed by one of the group members to the team. The recommended tip for each Sherpa is $ 90 to $ 100, or an amount of your choice, excluding the trip leader. For the trip leader, depending on the group size, the suggested contribution is USD $40-$50 per person. However, the amount is entirely at your discretion and can be adjusted as you see fit.'
const LOAD_CARRYING =
  "Gele Trekking is committed to bringing attention to the potential brain damage being caused to countless Nepalese by the common practice of carrying heavy loads on their heads, known as 'head carrying'. Gele Trekking has pledged to make this a top focus for their treks and to actively seek solutions, including having one sherpa accompany each guest and to supporting further research on this critical health concern. By choosing Gele Trekking, our guests are providing support from around the world to help protect and nurture the minds of Nepalese in Nepal."

/** The built-in PDF fonts cover Latin characters only, so anything else would print as junk. */
export function pdfText(value?: string | number | null) {
  return String(value ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s*(→|->)\s*/g, ' to ')
    .replace(/·/g, '-')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/^ /gm, '')
    .trim()
}

const documentReference = (trek: Trek, issued: Date) => {
  const initials = pdfText(trek.title).split(/[^A-Za-z]+/).filter(Boolean).map((word) => word[0].toUpperCase()).join('').slice(0, 5)
  return `GT-${initials}-${issued.toISOString().slice(0, 10).replace(/-/g, '')}`
}

/** Builds the itinerary and saves it. Rejects rather than producing a PDF without its logo or map. */
export async function downloadTrekItineraryPdf({ trek, settings, socialLinks, summary, details, packages, essentials, equipment, faqs }: TrekItineraryPdfData) {
  const { jsPDF } = await import('jspdf')

  const [logo, map, coverPhoto, loadCarryingOne, loadCarryingTwo] = await Promise.all([
    loadPdfLogo(settings.logoUrl),
    loadPdfImage(trek.mapImageUrl, { enlargeTo: 1600 }),
    loadPdfImage(trek.image, { maxWidth: 1920, cropRatio: COVER_RATIO }),
    loadPdfImage('/images/load_carrying_1.JPG', { maxWidth: 640 }),
    loadPdfImage('/images/load_carrying_2.JPG', { maxWidth: 640 }),
  ])
  if (trek.mapImageUrl && !map) throw new Error('The route map could not be loaded.')

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const issued = new Date()
  const issuedLabel = issued.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const reference = documentReference(trek, issued)
  const companyName = pdfText(settings.siteName) || 'Gele Trekking'
  const displayName = companyName === companyName.toUpperCase() ? companyName.replace(/\S+/g, (word) => word[0] + word.slice(1).toLowerCase()) : companyName
  const phone = pdfText(settings.phone) || CONTACT_PHONE
  const email = pdfText(settings.email) || CONTACT_EMAIL
  const address = pdfText(settings.address)
  const trekTitle = pdfText(trek.title)

  pdf.setProperties({ title: `${trekTitle} - Itinerary`, subject: 'Trek itinerary and package details', author: displayName, creator: displayName })

  const pageWidth = () => pdf.internal.pageSize.getWidth()
  const pageHeight = () => pdf.internal.pageSize.getHeight()
  const contentWidth = () => pageWidth() - MARGIN * 2
  const contentBottom = () => pageHeight() - FOOTER_HEIGHT - 4

  let y = HEADER_BOTTOM + 8
  let sectionNumber = 0
  let contentsTop = 0
  const contents: Array<{ number: string; title: string; page: number }> = []

  const setText = (size: number, style: 'normal' | 'bold' = 'normal', colour: Colour = BODY) => {
    pdf.setFont('helvetica', style)
    pdf.setFontSize(size)
    pdf.setTextColor(...colour)
  }
  const rule = (x1: number, atY: number, x2: number, colour: Colour = RULE, width = 0.25) => {
    pdf.setDrawColor(...colour)
    pdf.setLineWidth(width)
    pdf.line(x1, atY, x2, atY)
  }
  const placeLogo = (x: number, top: number, height: number) => pdf.addImage(logo.dataUrl, logo.format, x, top, height * (logo.width / logo.height), height, 'company-logo', 'FAST')

  const drawWatermark = () => {
    const api = pdf as unknown as { GState?: new (value: { opacity: number }) => unknown; setGState?: (state: unknown) => void }
    if (!api.GState || !api.setGState) return
    api.setGState(new api.GState({ opacity: 0.045 }))
    placeLogo((pageWidth() - 112) / 2, (pageHeight() - 112) / 2, 112)
    api.setGState(new api.GState({ opacity: 1 }))
  }

  const newPage = (orientation: 'portrait' | 'landscape' = 'portrait', watermark = true) => {
    pdf.addPage('a4', orientation)
    y = HEADER_BOTTOM + 8
    if (watermark) drawWatermark()
  }
  const ensureSpace = (needed: number) => {
    if (y + needed > contentBottom()) newPage()
  }

  const addSection = (title: string) => {
    ensureSpace(24)
    sectionNumber += 1
    y += 5
    setText(13, 'bold', BRAND)
    const number = String(sectionNumber).padStart(2, '0')
    pdf.text(number, MARGIN, y)
    contents.push({ number, title: pdfText(title), page: pdf.getCurrentPageInfo().pageNumber })
    setText(13, 'bold', INK)
    pdf.text(pdfText(title), MARGIN + 10, y)
    y += 2.5
    rule(MARGIN, y, pageWidth() - MARGIN, BRAND, 0.5)
    y += 7
  }

  const addSubheading = (text: string) => {
    ensureSpace(13)
    setText(10.5, 'bold', BRAND)
    pdf.splitTextToSize(pdfText(text), contentWidth()).forEach((line: string) => {
      ensureSpace(6)
      setText(10.5, 'bold', BRAND)
      pdf.text(line, MARGIN, y)
      y += 5
    })
    y += 0.5
  }

  const addParagraph = (text?: string, size = 9.5, gap = 3) => {
    const clean = pdfText(text)
    if (!clean) return
    const lineHeight = size * 0.5
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(size)
    pdf.splitTextToSize(clean, contentWidth()).forEach((line: string) => {
      ensureSpace(lineHeight + 1)
      setText(size, 'normal', BODY)
      pdf.text(line, MARGIN, y)
      y += lineHeight
    })
    y += gap
  }

  const addBullets = (items: string[]) => {
    items.map(pdfText).filter(Boolean).forEach((item) => {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9.5)
      const lines: string[] = pdf.splitTextToSize(item, contentWidth() - 6)
      ensureSpace(lines.length === 1 ? 6 : 10)
      pdf.setFillColor(...BRAND)
      pdf.circle(MARGIN + 1.2, y - 1.2, 0.65, 'F')
      lines.forEach((line) => {
        ensureSpace(5.5)
        setText(9.5, 'normal', BODY)
        pdf.text(line, MARGIN + 6, y)
        y += 4.75
      })
      y += 0.75
    })
    y += 2
  }

  /** Label and value pairs in two columns, like a data sheet. */
  const addFacts = (items: KeyValue[]) => {
    const columnWidth = (contentWidth() - 6) / 2
    const labelWidth = 30
    const heightOf = (item: KeyValue) => {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      return Math.max(1, pdf.splitTextToSize(pdfText(item.value) || 'On request', columnWidth - labelWidth - 3).length) * 4.4 + 3.6
    }
    for (let index = 0; index < items.length; index += 2) {
      const pair = items.slice(index, index + 2)
      const rowHeight = Math.max(...pair.map(heightOf))
      ensureSpace(rowHeight)
      pair.forEach((item, column) => {
        const x = MARGIN + column * (columnWidth + 6)
        setText(8, 'normal', MUTED)
        pdf.text(pdfText(item.label), x, y + 4.4)
        setText(9, 'bold', INK)
        pdf.text(pdf.splitTextToSize(pdfText(item.value) || 'On request', columnWidth - labelWidth - 3), x + labelWidth, y + 4.4)
        rule(x, y + rowHeight, x + columnWidth)
      })
      y += rowHeight
    }
    y += 5
  }

  const addItineraryTable = () => {
    const rows = buildItineraryRows(trek.itinerary)
    const widths = [11, 76, 20, 25, contentWidth() - 132]
    const headers = ['Day', 'Route', 'Altitude', 'Distance', 'Overnight']
    const cellsFor = (index: number) => {
      const row = rows[index]
      return [
        String(row.day),
        pdfText(row.route),
        typeof row.altitude === 'number' ? `${row.altitude.toLocaleString('en-US')} m` : '-',
        pdfText(row.distance?.label) || '-',
        pdfText(trek.itinerary[index].accommodation) || '-',
      ]
    }
    const drawHeader = () => {
      pdf.setFillColor(...BRAND)
      pdf.rect(MARGIN, y, contentWidth(), 7, 'F')
      setText(8, 'bold', [255, 255, 255])
      let x = MARGIN
      headers.forEach((header, column) => {
        pdf.text(header, x + 2, y + 4.7)
        x += widths[column]
      })
      y += 7
    }
    ensureSpace(22)
    drawHeader()
    rows.forEach((_, index) => {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8.5)
      const cells = cellsFor(index).map((cell, column) => pdf.splitTextToSize(cell, widths[column] - 3.5) as string[])
      const rowHeight = Math.max(...cells.map((lines) => lines.length)) * 4 + 3.2
      if (y + rowHeight > contentBottom()) {
        newPage()
        drawHeader()
      }
      if (index % 2 === 1) {
        pdf.setFillColor(...TINT)
        pdf.rect(MARGIN, y, contentWidth(), rowHeight, 'F')
      }
      let x = MARGIN
      cells.forEach((lines, column) => {
        setText(8.5, column === 0 ? 'bold' : 'normal', column === 0 ? BRAND : BODY)
        pdf.text(lines, x + 2, y + 4.4)
        x += widths[column]
      })
      y += rowHeight
      rule(MARGIN, y, pageWidth() - MARGIN)
    })
    y += 6
  }

  const addDayByDay = () => {
    trek.itinerary.forEach((day) => {
      ensureSpace(26)
      setText(10.5, 'bold', BRAND)
      const label = `Day ${day.day}`
      pdf.text(label, MARGIN, y)
      setText(10.5, 'bold', INK)
      pdf.text(pdf.splitTextToSize(pdfText(day.title), contentWidth() - 17), MARGIN + 17, y)
      y += 5.5
      addParagraph(day.description, 9.5, 2)
      y += 3
    })
  }

  const addPackages = () => {
    packages.forEach((tier) => {
      ensureSpace(26)
      pdf.setFillColor(...TINT)
      pdf.rect(MARGIN, y, contentWidth(), 10, 'F')
      setText(11, 'bold', INK)
      pdf.text(pdfText(tier.name), MARGIN + 3, y + 6.6)
      const price = `USD ${tier.priceUsd.toLocaleString('en-US')} per person`
      setText(11, 'bold', BRAND)
      const priceWidth = pdf.getTextWidth(price)
      pdf.text(price, pageWidth() - MARGIN - 3 - priceWidth, y + 6.6)
      if (tier.wasPriceUsd) {
        setText(8.5, 'normal', MUTED)
        const was = `was USD ${tier.wasPriceUsd.toLocaleString('en-US')}`
        pdf.text(was, pageWidth() - MARGIN - 6 - priceWidth - pdf.getTextWidth(was), y + 6.6)
      }
      y += 15
      addBullets(tier.includes.length > 0 ? tier.includes : ['Package details will be confirmed by our team.'])
    })
  }

  const addImageRow = (images: PdfImage[]) => {
    if (images.length === 0) return
    const gap = 6
    const slotWidth = (contentWidth() - gap) / 2
    const slotHeight = 70
    ensureSpace(slotHeight + 6)
    images.slice(0, 2).forEach((image, index) => {
      const scale = Math.min(slotWidth / image.width, slotHeight / image.height)
      const width = image.width * scale
      const height = image.height * scale
      pdf.addImage(image.dataUrl, image.format, MARGIN + index * (slotWidth + gap) + (slotWidth - width) / 2, y, width, height, undefined, 'FAST')
    })
    y += slotHeight + 6
  }

  const addRouteMap = (image: PdfImage) => {
    newPage(image.width / image.height > 1.15 ? 'landscape' : 'portrait', false)
    addSection('Route Map')
    const maxWidth = contentWidth()
    const maxHeight = contentBottom() - y - 6
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height)
    const width = image.width * scale
    const height = image.height * scale
    const x = MARGIN + (maxWidth - width) / 2
    pdf.addImage(image.dataUrl, image.format, x, y, width, height, undefined, 'SLOW')
    pdf.setDrawColor(...RULE)
    pdf.setLineWidth(0.3)
    pdf.rect(x, y, width, height)
    setText(8, 'normal', MUTED)
    pdf.text(`${trekTitle}. Route map for planning only; not for navigation.`, x, y + height + 4.5)
    newPage()
  }

  const drawCover = () => {
    drawWatermark()
    pdf.setFillColor(...BRAND)
    pdf.rect(0, 0, pageWidth(), 5, 'F')

    placeLogo(MARGIN, 13, 27)
    const right = pageWidth() - MARGIN
    setText(14, 'bold', BRAND)
    pdf.text(displayName, right, 19, { align: 'right' })
    setText(8.5, 'normal', MUTED)
    const contact = [address, phone, email, WEBSITE].filter(Boolean)
    contact.forEach((line, index) => pdf.text(line, right, 24.5 + index * 4.1, { align: 'right' }))
    y = 47
    rule(MARGIN, y, right, BRAND, 0.6)
    setText(8, 'bold', BODY)
    pdf.text(COMPANY_REGISTRATION_LINE, MARGIN, y + 5)

    y = 64
    setText(9, 'bold', BRAND)
    pdf.text('TREK ITINERARY', MARGIN, y)
    y += 10
    setText(25, 'bold', INK)
    const titleLines: string[] = pdf.splitTextToSize(trekTitle, contentWidth())
    pdf.text(titleLines, MARGIN, y)
    y += (titleLines.length - 1) * 10.5 + 8
    setText(11, 'normal', MUTED)
    pdf.text([pdfText(trek.region), `${trek.duration} days`, pdfText(trek.difficulty)].filter(Boolean).join('  |  '), MARGIN, y)
    y += 8

    if (coverPhoto) {
      const height = contentWidth() / COVER_RATIO
      pdf.addImage(coverPhoto.dataUrl, coverPhoto.format, MARGIN, y, contentWidth(), height, undefined, 'FAST')
      y += height + 9
    } else {
      y += 4
    }

    addFacts([{ label: 'Reference', value: reference }, { label: 'Date of issue', value: issuedLabel }, ...summary])
    contentsTop = y + 2
  }

  /** Filled in last, once every section's page is known. */
  const drawContents = () => {
    pdf.setPage(1)
    const columnWidth = (contentWidth() - 10) / 2
    const perColumn = Math.ceil(contents.length / 2)
    setText(9, 'bold', BRAND)
    pdf.text('CONTENTS', MARGIN, contentsTop)
    contents.forEach((entry, index) => {
      const column = index < perColumn ? 0 : 1
      const x = MARGIN + column * (columnWidth + 10)
      const rowY = contentsTop + 6 + (column === 0 ? index : index - perColumn) * 4.9
      setText(8.5, 'bold', BRAND)
      pdf.text(entry.number, x, rowY)
      setText(8.5, 'normal', BODY)
      pdf.text(entry.title, x + 7, rowY)
      pdf.text(String(entry.page), x + columnWidth, rowY, { align: 'right' })
      pdf.link(x, rowY - 3.5, columnWidth, 4.9, { pageNumber: entry.page })
    })
  }

  /** Drawn last so every page can say how many pages there are. */
  const drawHeadersAndFooters = () => {
    const total = pdf.getNumberOfPages()
    for (let page = 1; page <= total; page += 1) {
      pdf.setPage(page)
      const right = pageWidth() - MARGIN
      if (page > 1) {
        placeLogo(MARGIN, 8, 11)
        setText(10, 'bold', BRAND)
        pdf.text(displayName, MARGIN + 14, 13)
        setText(7.5, 'normal', MUTED)
        pdf.text('Trek itinerary', MARGIN + 14, 17)
        pdf.text(trekTitle, right, 13, { align: 'right' })
        pdf.text(`Ref ${reference}`, right, 17, { align: 'right' })
        rule(MARGIN, 21.5, right, BRAND, 0.4)
      }
      const footerY = pageHeight() - FOOTER_HEIGHT + 5
      rule(MARGIN, footerY - 4, right)
      setText(7.5, 'normal', MUTED)
      pdf.text([displayName, phone, email].join('  |  '), MARGIN, footerY)
      pdf.text([address, COMPANY_REGISTRATION_LINE].filter(Boolean).join(' | '), MARGIN, footerY + 4)
      setText(7.5, 'bold', BRAND)
      const siteWidth = pdf.getTextWidth(WEBSITE)
      pdf.text(WEBSITE, right - siteWidth, footerY)
      pdf.link(right - siteWidth, footerY - 3, siteWidth, 4, { url: 'https://geletrekking.com' })
      setText(7.5, 'normal', MUTED)
      pdf.text(`Page ${page} of ${total}`, right, footerY + 4, { align: 'right' })
    }
  }

  drawCover()

  newPage()
  addSection('Trip Overview')
  addFacts(details)
  addParagraph(trek.fullDescription || 'Trek details are currently being prepared.')
  if (trek.highlights.length > 0) {
    addSubheading('Highlights')
    addBullets(trek.highlights)
  }

  if (map) addRouteMap(map)

  addSection('Itinerary at a Glance')
  addItineraryTable()

  addSection('Day-by-Day Itinerary')
  addDayByDay()

  if (packages.length > 0) {
    addSection('Packages and Prices')
    addPackages()
  }

  addSection("What's Included")
  addBullets(trek.includes)
  addSection("What's Not Included")
  addBullets(trek.excludes)

  if (essentials.length > 0) {
    addSection('Trip Essentials')
    essentials.forEach((item) => {
      addSubheading(item.title)
      addParagraph(item.summary, 9.5, 1)
      addParagraph(item.detail, 9, 3)
    })
  }

  if (equipment.length > 0) {
    addSection('Special Equipment')
    addBullets(equipment)
  }

  addSection('Tipping Guideline')
  addParagraph(TIP_GUIDELINE, 9)

  if (faqs.length > 0) {
    addSection('Frequently Asked Questions')
    faqs.forEach((faq) => {
      addSubheading(faq.question)
      addParagraph(faq.answer, 9)
    })
  }

  addSection('Traditional Load-Carrying in Nepal')
  addParagraph(LOAD_CARRYING, 9)
  addImageRow([loadCarryingOne, loadCarryingTwo].filter((image): image is PdfImage => Boolean(image)))

  addSection('Important Information')
  addParagraph(
    `This itinerary is a guide. Routes, schedules and accommodation may change because of weather, trail conditions, flights or safety decisions. Prices are shown in US dollars as of ${issuedLabel} and are confirmed in writing at booking. Comprehensive travel insurance covering high-altitude trekking and helicopter evacuation is required. All bookings are subject to our Terms and Conditions and Liability Waiver, available at ${WEBSITE}.`,
    9
  )
  if (socialLinks.length > 0) {
    ensureSpace(8)
    let x = MARGIN
    socialLinks.slice(0, 6).forEach((link) => {
      setText(9, 'bold', BRAND)
      const width = pdf.getTextWidth(link.label)
      pdf.text(link.label, x, y)
      pdf.link(x, y - 3.5, width, 5, { url: link.url })
      x += width + 7
    })
  }

  drawContents()
  drawHeadersAndFooters()
  pdf.save(`gele-trekking-${trek.slug}-itinerary.pdf`)
}
