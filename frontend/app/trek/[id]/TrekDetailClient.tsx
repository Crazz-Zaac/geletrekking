'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTrekWeather } from '@/hooks/use-trek-weather'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingForm, FAQAccordion } from '@/components/booking-form';
import type { Trek } from '@/lib/data';
import { getTrekFAQBySlug } from '@/lib/faq-data';
import {
  BedDouble,
  Bus,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  ClipboardList,
  CloudSun,
  Compass,
  Droplet,
  Eye,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Info,
  MapPin,
  Mountain,
  Download,
  Route,
  Sparkles,
  Star,
  Sun,
  Thermometer,
  Timer,
  Utensils,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  X,
  Activity,
  Users,
  Wifi,
  Wind,
} from 'lucide-react';

interface TrekDetailClientProps {
  trek: Trek;
}

function getAltitudeLabel(maxAltitude: number) {
  if (maxAltitude >= 5000) return 'Extreme High Altitude';
  if (maxAltitude >= 4000) return 'High Altitude';
  if (maxAltitude >= 3000) return 'Moderate Altitude';
  return 'Low Altitude';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type SectionHeaderProps = {
  index: string
  title: string
  icon: typeof Sparkles
}

function SectionHeader({ index, title, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[#E6F1F5] text-[#004D67]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#004D67]">Section {index}</p>
          <h2 className="text-2xl md:text-[28px] font-bold text-foreground leading-tight">{title}</h2>
        </div>
      </div>
      <div className="h-px bg-border" />
    </div>
  )
}

type FormattedTextBlock =
  | { type: "paragraph"; text: string }
  | { type: "ul" | "ol"; items: string[] }

const unorderedListPattern = /^[-*•]\s+(.+)$/
const orderedListPattern = /^\d+[.)]\s+(.+)$/

function getFormattedTextBlocks(value: string): FormattedTextBlock[] {
  const blocks: FormattedTextBlock[] = []
  const lines = value.split("\n")

  lines.forEach((rawLine) => {
    const line = rawLine.trim()
    const unorderedMatch = line.match(unorderedListPattern)
    const orderedMatch = line.match(orderedListPattern)

    if (!line) return

    if (unorderedMatch) {
      const previous = blocks[blocks.length - 1]
      if (previous?.type === "ul") {
        previous.items.push(unorderedMatch[1].trim())
      } else {
        blocks.push({ type: "ul", items: [unorderedMatch[1].trim()] })
      }
      return
    }

    if (orderedMatch) {
      const previous = blocks[blocks.length - 1]
      if (previous?.type === "ol") {
        previous.items.push(orderedMatch[1].trim())
      } else {
        blocks.push({ type: "ol", items: [orderedMatch[1].trim()] })
      }
      return
    }

    const previous = blocks[blocks.length - 1]
    if (previous?.type === "paragraph") {
      previous.text = previous.text + " " + line
    } else {
      blocks.push({ type: "paragraph", text: line })
    }
  })

  return blocks
}

function FormattedText({ value }: { value: string }) {
  const blocks = getFormattedTextBlocks(value)

  if (blocks.length === 0) return null

  return (
    <div className="space-y-3 text-muted-foreground">
      {blocks.map((block, blockIndex) => {
        if (block.type === "paragraph") {
          return <p key={block.type + "-" + blockIndex}>{block.text}</p>
        }

        const ListTag = block.type
        return (
          <ListTag key={block.type + "-" + blockIndex} className={block.type === "ol" ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>
            {block.items.map((item, itemIndex) => (
              <li key={item + "-" + itemIndex}>{item}</li>
            ))}
          </ListTag>
        )
      })}
    </div>
  )
}

export default function TrekDetailClient({
  trek,
}: TrekDetailClientProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [downloadingItinerary, setDownloadingItinerary] = useState(false);
  const [expandedPricingTier, setExpandedPricingTier] = useState<string | null>(null);
  const [expandedEssential, setExpandedEssential] = useState<string | null>(null);
  const weather = useTrekWeather(trek?.latitude, trek?.longitude)
  const { settings, social } = useSiteSettings()
  const fallbackFaqs = getTrekFAQBySlug(trek.slug)?.faqs || []
  const trekFaqs = trek.faqs && trek.faqs.length > 0 ? trek.faqs : fallbackFaqs
  const pricingTiers = trek.pricingTiers && trek.pricingTiers.length > 0
    ? trek.pricingTiers
    : [
        {
          name: 'Economic',
          priceUsd: trek.price,
          includes: trek.includes || [],
        },
      ]
  const specialEquipmentItems = trek.whatToPack || []

  const formatMetric = (value?: number, unit?: string) =>
    typeof value === 'number' && value > 0
      ? `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`
      : 'On request'

  const primaryKpis = [
    { label: 'Duration', value: formatMetric(trek.duration, 'days'), icon: CalendarRange },
    { label: 'Max Altitude', value: formatMetric(trek.maxAltitude, 'm'), icon: Mountain },
    { label: 'Trip Length', value: formatMetric(trek.tripLengthKm, 'km'), icon: Route },
  ]

  const secondaryKpis = [
    { label: 'Difficulty', value: trek.difficulty || 'Moderate', icon: ShieldCheck },
    { label: 'Best months', value: trek.bestSeason || 'All year', icon: Sun },
    {
      label: 'Acclimatization',
      value:
        typeof trek.acclimatizationDays === 'number' && trek.acclimatizationDays > 0
          ? String(trek.acclimatizationDays) + " rest day" + (trek.acclimatizationDays > 1 ? "s" : "")
          : 'On request',
      icon: BedDouble,
    },
    { label: 'Per day activity', value: trek.dailyActivityHours || 'On request', icon: Activity },
    { label: 'WiFi', value: trek.wifiAvailability || 'Available', icon: Wifi },
  ]

  const tertiaryKpis = [
    { label: 'Trip Start', value: trek.startPoint || 'On request', icon: MapPin },
    { label: 'Transport', value: trek.transportation || 'On request', icon: Bus },
    { label: 'Group size', value: trek.groupSize || 'Flexible', icon: Users },
    { label: 'Tour type', value: trek.tourType || 'Group / Private', icon: Compass },
    { label: 'Altitude level', value: getAltitudeLabel(trek.maxAltitude), icon: TrendingUp },
  ]

  const defaultTripEssentials = [
    {
      id: 'communication',
      icon: Wifi,
      title: 'Communication',
      summary: 'Signal gets patchy above lower villages.',
      detail: 'Phone reception and internet are limited in remote areas. Some teahouses offer paid WiFi, often slow. Guides carry emergency contact support for urgent situations.',
    },
    {
      id: 'accommodation',
      icon: BedDouble,
      title: 'Accommodation',
      summary: 'Twin-share rooms, pre-booked every night.',
      detail: 'All trek nights are arranged in advance, usually in twin-share teahouse rooms. Room standards can vary in remote settlements and at higher elevation.',
    },
    {
      id: 'toilet-shower',
      icon: Droplet,
      title: 'Toilet and shower',
      summary: 'Facilities vary by teahouse.',
      detail: 'Facilities range from comfortable to basic depending on the village. Bring personal toiletries, quick-dry towel, and small cash for paid hot showers where available.',
    },
    {
      id: 'food-drink',
      icon: Utensils,
      title: 'Food and drink',
      summary: 'Local dishes, prices rise with altitude.',
      detail: 'Menus usually include rice, noodles, potatoes, soups, hot drinks, and some international options. Bottled water and snacks become more expensive as supplies move higher.',
    },
  ]


  const tripEssentials = (trek.tripEssentials && trek.tripEssentials.length > 0 ? trek.tripEssentials : defaultTripEssentials)
    .filter((item) => !item.title.toLowerCase().includes('tip'))
    .map((item, index) => {
    const title = item.title.toLowerCase()
    const icon = title.includes('communication') || title.includes('wifi')
      ? Wifi
      : title.includes('accommodation') || title.includes('stay')
        ? BedDouble
        : title.includes('toilet') || title.includes('shower')
          ? Droplet
          : title.includes('food') || title.includes('drink')
            ? Utensils
            : defaultTripEssentials[index]?.icon || Compass

    return {
      ...item,
      id: item.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join("-") || "essential-" + index,
      icon,
    }
  })

  const navItems = useMemo(
    () => [
      { id: 'trek-overview', label: 'Overview' },
      { id: 'trek-highlights', label: 'Highlights' },
      { id: 'trek-itinerary', label: 'Itinerary' },
      { id: 'trek-trip-essentials', label: 'Essentials' },
      { id: 'trek-includes', label: 'Included' },
      { id: 'trek-excludes', label: 'Excluded' },
      { id: 'trek-map', label: 'Map' },
      { id: 'trek-special-equipment', label: 'Equipment' },
      { id: 'trek-gallery', label: 'Gallery' },
      { id: 'trek-faq', label: 'FAQ' },
      { id: 'booking-inquiry-section', label: 'Inquiry Form' },
    ],
    []
  )

  const [activeSection, setActiveSection] = useState<string>('trek-overview')

  const scrollToBooking = () => {
    const node = document.getElementById('booking-inquiry-section')
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToSection = (sectionId: string) => {
    const node = document.getElementById(sectionId)
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const getSectionTop = (id: string) => document.getElementById(id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY

    const updateActiveSection = () => {
      const offset = 140
      let current = navItems[0]?.id

      navItems.forEach((item) => {
        const top = getSectionTop(item.id)
        if (top - offset <= 0) {
          current = item.id
        }
      })

      if (current && current !== activeSection) {
        setActiveSection(current)
      }
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [navItems, activeSection])

  const handleDownloadItinerary = async () => {
    if (downloadingItinerary) return

    setDownloadingItinerary(true)

    try {
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF({ unit: "mm", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 14
      const footerTop = pageHeight - 22
      const contentWidth = pageWidth - margin * 2
      let cursorY = margin

      type PdfImage = { dataUrl: string; format: "PNG" | "JPEG" }
      type SocialLink = { label: string; url: string }

      const toImage = async (src?: string): Promise<PdfImage | null> => {
        if (!src) return null

        try {
          const response = await fetch(src, { cache: "force-cache" })
          if (!response.ok) return null

          const blob = await response.blob()
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result || ""))
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })

          return {
            dataUrl,
            format: dataUrl.includes("image/jpeg") || dataUrl.includes("image/jpg") ? "JPEG" : "PNG",
          }
        } catch {
          return null
        }
      }

      const logo = await toImage(settings.logoUrl || "/geletrekking.png")
      const mapImage = await toImage(trek.mapImageUrl)
      const companyName = settings.siteName || "Gele Trekking"
      const contactPhone = settings.phone || "+977 985 123 4567"
      const contactEmail = settings.email || "info@geletrekking.com"
      const contactAddress = settings.address || "Thamel, Kathmandu 44600, Nepal"
      const socialLinks: SocialLink[] = [
        { label: "Facebook", url: social.facebook },
        { label: "Instagram", url: social.instagram },
        { label: "YouTube", url: social.youtube },
        { label: "LinkedIn", url: social.linkedin },
        { label: "WhatsApp", url: social.whatsapp },
        { label: "Twitter", url: social.twitter },
      ].filter((item) => Boolean(item.url))
      const tipGuideline = "Tipping is not mandatory, but it is a meaningful way to express gratitude for the services provided, in line with trekking traditions. It typically occurs on the final night of the trek, often accompanied by a celebration with the team. During this time, the support team shares their joy and emotions. The leader will guide the group in collecting the tips, which are then distributed by one of the group members to the team. The recommended tip for each Sherpa is $ 90 to $ 100, or an amount of your choice, excluding the trip leader. For the trip leader, depending on the group size, the suggested contribution is USD $40-$50 per person. However, the amount is entirely at your discretion and can be adjusted as you see fit."

      pdf.setProperties({
        title: trek.title + " Complete Itinerary",
        subject: "Trek itinerary and package details",
        author: companyName,
      })

      const setText = (size: number, style: "normal" | "bold" = "normal", color: [number, number, number] = [28, 35, 39]) => {
        pdf.setFont("helvetica", style)
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
        withOpacity(0.06, () => {
          const size = 118
          pdf.addImage(logo.dataUrl, logo.format, (pageWidth - size) / 2, 86, size, size)
        })
      }

      const drawFooter = () => {
        pdf.setDrawColor(218, 226, 230)
        pdf.line(margin, footerTop - 5, pageWidth - margin, footerTop - 5)
        setText(8, "normal", [73, 85, 91])
        pdf.text(companyName + " | " + contactPhone + " | " + contactEmail, margin, footerTop)
        pdf.text(contactAddress, margin, footerTop + 5)

        let linkX = margin
        socialLinks.slice(0, 5).forEach((link) => {
          const label = link.label
          const width = pdf.getTextWidth(label)
          if (linkX + width > pageWidth - margin) return
          setText(8, "bold", [0, 77, 103])
          pdf.text(label, linkX, footerTop + 11)
          pdf.link(linkX, footerTop + 7, width, 5, { url: link.url })
          linkX += width + 6
        })
      }

      const decoratePage = (includeWatermark = true) => {
        if (includeWatermark) drawWatermark()
        drawFooter()
      }

      const addPage = (includeWatermark = true) => {
        pdf.addPage()
        cursorY = margin
        decoratePage(includeWatermark)
      }

      const ensureSpace = (needed = 10) => {
        if (cursorY + needed <= footerTop - 8) return
        addPage()
      }

      const addSection = (title: string) => {
        ensureSpace(16)
        cursorY += 4
        pdf.setFillColor(230, 241, 245)
        pdf.roundedRect(margin, cursorY - 6, contentWidth, 9, 2, 2, "F")
        setText(12, "bold", [0, 77, 103])
        pdf.text(title.toUpperCase(), margin + 4, cursorY)
        cursorY += 9
      }

      const addParagraph = (text?: string, size = 10, indent = 0) => {
        if (!text) return
        setText(size, "normal", [43, 52, 57])
        const lines = pdf.splitTextToSize(text, contentWidth - indent)
        lines.forEach((line: string) => {
          ensureSpace(6)
          pdf.text(line, margin + indent, cursorY)
          cursorY += 5
        })
      }

      const addBulletList = (items: string[]) => {
        items.filter(Boolean).forEach((item) => {
          ensureSpace(7)
          setText(10, "normal", [43, 52, 57])
          pdf.circle(margin + 1.5, cursorY - 1.2, 0.8, "F")
          const lines = pdf.splitTextToSize(item, contentWidth - 7)
          lines.forEach((line: string, index: number) => {
            pdf.text(line, margin + 6, cursorY)
            if (index < lines.length - 1) {
              cursorY += 5
              ensureSpace(6)
            }
          })
          cursorY += 5
        })
      }

      const addKeyValueGrid = (items: { label: string; value: string }[]) => {
        const columnGap = 7
        const columnWidth = (contentWidth - columnGap) / 2
        items.forEach((item, index) => {
          const x = margin + (index % 2) * (columnWidth + columnGap)
          if (index % 2 === 0) ensureSpace(19)
          pdf.setDrawColor(218, 226, 230)
          pdf.setFillColor(250, 252, 252)
          pdf.roundedRect(x, cursorY, columnWidth, 15, 2, 2, "FD")
          setText(7, "bold", [0, 77, 103])
          pdf.text(item.label.toUpperCase(), x + 3, cursorY + 5)
          setText(10, "bold", [28, 35, 39])
          pdf.text(pdf.splitTextToSize(item.value || "On request", columnWidth - 6), x + 3, cursorY + 11)
          if (index % 2 === 1 || index === items.length - 1) cursorY += 18
        })
      }

      const addLinkedText = (label: string, url: string) => {
        if (!url) return
        ensureSpace(6)
        setText(10, "bold", [0, 77, 103])
        pdf.text(label, margin, cursorY)
        pdf.link(margin, cursorY - 4, pdf.getTextWidth(label), 6, { url })
        cursorY += 6
      }

      const addCover = () => {
        decoratePage()
        if (logo) pdf.addImage(logo.dataUrl, logo.format, margin, margin, 28, 28)
        setText(9, "bold", [0, 77, 103])
        pdf.text(companyName.toUpperCase(), margin + 34, margin + 8)
        setText(8, "normal", [73, 85, 91])
        pdf.text("Complete trek itinerary packet", margin + 34, margin + 14)

        cursorY = 62
        setText(24, "bold", [22, 31, 36])
        pdf.text(pdf.splitTextToSize(trek.title, contentWidth), margin, cursorY)
        cursorY += 15
        setText(11, "normal", [73, 85, 91])
        pdf.text(trek.region + " | " + trek.duration + " days | " + trek.difficulty, margin, cursorY)
        cursorY += 9
        addParagraph("Prepared on " + new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }), 10)
        cursorY += 6
        addKeyValueGrid(primaryKpis.map((item) => ({ label: item.label, value: item.value })))

        cursorY += 4
        addSection("Contact Details")
        addParagraph(contactPhone + " | " + contactEmail)
        addParagraph(contactAddress)
        socialLinks.slice(0, 5).forEach((link) => addLinkedText(link.label, link.url))
      }


      const addCenteredImageBlock = (image: PdfImage, maxHeight: number) => {
        let imageWidth = contentWidth
        let imageHeight = maxHeight

        try {
          const props = pdf.getImageProperties(image.dataUrl)
          const scale = Math.min(contentWidth / props.width, maxHeight / props.height)
          imageWidth = props.width * scale
          imageHeight = props.height * scale
        } catch {
          imageHeight = Math.min(maxHeight, contentWidth * 0.62)
        }

        const imageX = margin + (contentWidth - imageWidth) / 2
        const imageY = cursorY + Math.max(0, (maxHeight - imageHeight) / 2)
        pdf.addImage(image.dataUrl, image.format, imageX, imageY, imageWidth, imageHeight)
        cursorY = imageY + imageHeight + 6
      }

      addCover()

      addPage()
      addSection("Basic Info")
      addKeyValueGrid([
        ...primaryKpis,
        ...secondaryKpis,
        ...tertiaryKpis,
      ].map((item) => ({ label: item.label, value: item.value })))

      addSection("Trek Details")
      addParagraph(trek.fullDescription || "Trek details are currently being prepared.")
      if (trek.highlights.length > 0) {
        cursorY += 2
        setText(11, "bold", [28, 35, 39])
        pdf.text("Trek highlights", margin, cursorY)
        cursorY += 6
        addBulletList(trek.highlights)
      }
      if (pricingTiers.length > 0) {
        cursorY += 2
        setText(11, "bold", [28, 35, 39])
        pdf.text("Package options", margin, cursorY)
        cursorY += 6
        pricingTiers.forEach((tier) => {
          addParagraph(tier.name + " - USD " + tier.priceUsd.toLocaleString(), 10)
          addBulletList(tier.includes || [])
        })
      }

      addSection("Itinerary")
      trek.itinerary.forEach((day) => {
        ensureSpace(24)
        setText(11, "bold", [0, 77, 103])
        pdf.text("Day " + day.day + ": " + day.title, margin, cursorY)
        cursorY += 6
        addParagraph(day.description)
        const meta = "Altitude: " + (day.altitude ? day.altitude + "m" : "N/A") + " | Distance: " + (day.distance || "N/A") + " | Stay: " + (day.accommodation || "N/A")
        setText(8, "bold", [73, 85, 91])
        ensureSpace(5)
        pdf.text(meta, margin, cursorY)
        cursorY += 8
      })

      addSection("Trip Essentials")
      tripEssentials.forEach((item) => {
        ensureSpace(20)
        setText(11, "bold", [0, 77, 103])
        pdf.text(item.title, margin, cursorY)
        cursorY += 6
        addParagraph(item.summary, 10)
        addParagraph(item.detail, 9)
        cursorY += 2
      })

      addSection("Includes")
      addBulletList(trek.includes)
      addSection("Excludes")
      addBulletList(trek.excludes)

      if (specialEquipmentItems.length > 0) {
        addSection("Special Equipment")
        addBulletList(specialEquipmentItems)
      }

      addSection("Tip guideline")
      addParagraph(tipGuideline, 9)

      addPage(false)
      addSection("Map")
      if (mapImage) {
        addCenteredImageBlock(mapImage, footerTop - cursorY - 10)
      } else if (trek.mapImageUrl) {
        addParagraph("Map image could not be embedded in the PDF. Open the live map image below:")
        addLinkedText("Open trek map", trek.mapImageUrl)
      } else {
        addParagraph("Map details are currently not available for this trek.")
      }

      pdf.save(trek.slug + "-complete-itinerary.pdf")
    } finally {
      setDownloadingItinerary(false)
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-0 h-[34vh] min-h-[240px] max-h-[380px] overflow-hidden"
      >
        <Image
          src={trek.image}
          alt={trek.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto space-y-2"
          >
            <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
              <Badge className="bg-primary text-white">{trek.region}</Badge>
              <Badge variant="outline" className="text-white border-white">{trek.difficulty}</Badge>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-2xl md:text-4xl font-bold text-balance max-w-4xl leading-tight">
              {trek.title}
            </motion.h1>
          </motion.div>
        </div>
      </motion.section>

      <section className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className={isActive ? 'bg-primary text-white hover:bg-primary/90' : 'text-muted-foreground'}
                >
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="mb-5">
            <SectionHeader index="01" title="Key Information" icon={Sparkles} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {primaryKpis.map((info) => {
              const InfoIcon = info.icon
              return (
                <div key={info.label} className="rounded-lg bg-[#004D67] px-4 py-3 text-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-white/75 text-[10px] font-semibold uppercase tracking-wider">
                    <InfoIcon className="h-3.5 w-3.5" />
                    {info.label}
                  </div>
                  <p className="mt-2 text-lg md:text-xl font-semibold tracking-tight">{info.value}</p>
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {secondaryKpis.map((info) => {
              const InfoIcon = info.icon
              return (
                <Card key={info.label} className="p-3 border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <InfoIcon className="w-3.5 h-3.5 text-[#004D67]" />
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{info.label}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{info.value}</p>
                </Card>
              )
            })}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mt-2.5">
            {tertiaryKpis.map((info) => {
              const InfoIcon = info.icon
              return (
                <Card key={info.label} className="p-3 border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <InfoIcon className="w-3.5 h-3.5 text-[#004D67]" />
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{info.label}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{info.value}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-background">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
              <motion.div id="trek-highlights" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="02" title="Trek Highlights" icon={Star} />
                <ul className="space-y-3">
                  {trek.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground">
                      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div id="trek-overview" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="03" title="About The Trek" icon={Info} />
                <p className="text-base md:text-[17px] text-muted-foreground leading-relaxed">{trek.fullDescription}</p>
              </motion.div>

              <motion.div id="trek-itinerary" variants={itemVariants} className="space-y-5 scroll-mt-36">
                <SectionHeader index="04" title="Itinerary Timeline" icon={Route} />
                <div className="relative border-l border-border ml-3 space-y-5">
                  {trek.itinerary.map((day) => (
                    <div key={day.day} className="relative pl-8">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary" />
                      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <Badge className="bg-primary text-white">Day {day.day}</Badge>
                              <h3 className="font-bold text-foreground text-base md:text-lg">{day.title}</h3>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 shrink-0 mt-0.5"
                          >
                            {expandedDay === day.day ? 'Hide details' : 'Show details'}
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedDay === day.day ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {expandedDay === day.day && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <FormattedText value={day.description} />
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1.5 text-xs font-semibold">
                            <Mountain className="w-3.5 h-3.5" />
                            Altitude: {day.altitude ? `${day.altitude}m` : 'N/A'}
                          </span>
                          {day.distance ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 px-3 py-1.5 text-xs font-semibold">
                              <MapPin className="w-3.5 h-3.5" />
                              Distance: {day.distance}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-3 py-1.5 text-xs font-semibold">
                            <BedDouble className="w-3.5 h-3.5" />
                            Stay: {day.accommodation}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div id="trek-trip-essentials" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="05" title="Trip Essentials" icon={Compass} />
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-stretch">
                  {tripEssentials.map((item, index) => {
                    const EssentialIcon = item.icon
                    const isExpanded = expandedEssential === item.id

                    return (
                      <Card key={item.id} className={"h-full border-border bg-card p-4 " + (tripEssentials.length === 4 && index > 2 ? "md:col-span-6" : tripEssentials.length > 4 && index > 2 ? "md:col-span-3" : "md:col-span-2")}>
                        <div className="min-h-[104px]">
                          <EssentialIcon className="h-5 w-5 text-[#004D67]" />
                          <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{item.summary}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 h-8 px-3 text-xs"
                          onClick={() => setExpandedEssential(isExpanded ? null : item.id)}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </Button>
                        {isExpanded ? (
                          <div className="mt-3 text-[13px] leading-6 text-muted-foreground">
                            <p>{item.detail}</p>
                          </div>
                        ) : null}
                      </Card>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <SectionHeader index="06" title="What's Covered" icon={ClipboardList} />
                <Card className="overflow-hidden border-border scroll-mt-36">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div id="trek-includes" className="px-5 py-4 md:py-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Included</p>
                      <ul className="mt-3 divide-y divide-border text-sm">
                        {trek.includes.map((item) => (
                          <li key={item} className="flex items-center gap-3 py-3">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                            <span className="text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div id="trek-excludes" className="px-5 py-4 md:py-5 border-t border-border md:border-t-0 md:border-l">
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose-700">Excluded</p>
                      <ul className="mt-3 divide-y divide-border text-sm">
                        {trek.excludes.map((item) => (
                          <li key={item} className="flex items-center gap-3 py-3">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                              <X className="h-4 w-4" />
                            </span>
                            <span className="text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div id="trek-map" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="07" title="Map" icon={MapPin} />
                <Card className="border-border overflow-hidden">
                  {trek.mapImageUrl ? (
                    <img
                      src={trek.mapImageUrl}
                      alt={trek.title + " route map"}
                      className="h-auto max-h-[720px] w-full object-contain bg-muted/20"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex min-h-[220px] items-center justify-center bg-muted/20 px-6 py-10 text-center">
                      <p className="text-sm text-muted-foreground">Route map image will be added soon.</p>
                    </div>
                  )}
                </Card>
              </motion.div>

              <motion.div id="trek-special-equipment" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="08" title="Special Equipment" icon={ClipboardList} />
                <Card className="border-border p-5 md:p-6 space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Trek-specific gear notes</p>
                      <p className="text-sm text-muted-foreground">
                        Review the full Nepal trekking packing list, then add these trek-specific items if listed by our team.
                      </p>
                    </div>
                    <Link
                      href="/guides/gear-and-equipment"
                      className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                    >
                      General packing list
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {specialEquipmentItems.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {specialEquipmentItems.map((item) => (
                        <li key={item} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5">
                      <p className="text-sm text-muted-foreground">
                        No extra trek-specific equipment has been added for this itinerary yet. Use the general packing list as your baseline.
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>

              <motion.div id="trek-gallery" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="09" title="Gallery" icon={ImageIcon} />
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/gallery?trek=${trek.slug}`}
                    className="text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    See More →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(trek.gallery.length > 0 ? trek.gallery : [trek.image]).map((img, idx) => (
                    <div key={`${img}-${idx}`} className="relative h-56 rounded-xl overflow-hidden border border-border">
                      <Image
                        src={img}
                        alt={`${trek.title} gallery ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div id="trek-faq" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="10" title="FAQ" icon={HelpCircle} />
                {trekFaqs.length > 0 ? (
                  <FAQAccordion faqs={trekFaqs} />
                ) : (
                  <Card className="border-border p-5">
                    <p className="text-sm text-muted-foreground">
                      FAQs for this destination will be added soon. Please contact us for trek-specific questions.
                    </p>
                  </Card>
                )}
              </motion.div>

              <motion.div id="booking-inquiry-section" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="11" title="Booking Inquiry Form" icon={FileText} />
                <Card className="border-border p-6 md:p-8">
                  <BookingForm trek={trek} />
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-6">
                <Link href="/destinations">
                  <Button variant="outline" className="border-primary text-primary">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Destinations
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.aside variants={itemVariants} className="space-y-6 h-fit sticky top-32 w-full lg:max-w-sm lg:ml-auto">
              <Card className="border-border bg-white p-5 md:p-6 transition-all hover:shadow-md">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Price of the Trek</p>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">Choose your package</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Per person pricing. Expand a tier to see what is included.</p>
                  </div>

                  <div className="space-y-2">
                    {pricingTiers.map((tier) => {
                      const isExpanded = expandedPricingTier === tier.name
                      return (
                        <div key={tier.name} className="rounded-lg border border-border bg-background overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedPricingTier(isExpanded ? null : tier.name)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                            aria-expanded={isExpanded}
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-foreground">{tier.name}</span>
                              <span className="block text-xs text-muted-foreground">Package tier</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-3">
                              <span className="text-lg font-bold text-foreground">USD {tier.priceUsd.toLocaleString()}</span>
                              <ChevronDown className={isExpanded ? "h-4 w-4 text-muted-foreground transition-transform rotate-180" : "h-4 w-4 text-muted-foreground transition-transform"} />
                            </span>
                          </button>

                          {isExpanded ? (
                            <div className="border-t border-border px-4 py-4 space-y-4">
                              {tier.includes.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                  {tier.includes.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-foreground">
                                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">Tier details will be confirmed by our team.</p>
                              )}

                              <Button className="w-full" onClick={scrollToBooking}>
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Inquire for {tier.name}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>

                  {trek.offerDiscountPercent ? (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[11px] px-3 py-1">Save {trek.offerDiscountPercent}% today</Badge>
                  ) : null}
                </div>

                <div className="my-5 h-px bg-border" />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><CalendarRange className="w-4 h-4 text-primary" /> {trek.duration} days</div>
                    <div className="flex items-center gap-2"><Mountain className="w-4 h-4 text-primary" /> {trek.maxAltitude}m</div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {trek.groupSize}</div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleDownloadItinerary} disabled={downloadingItinerary}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF itinerary
                  </Button>
                </div>
              </Card>

              <Card className="border-border bg-white p-6 transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{trek.locationName || trek.region}</p>
                    <p className="text-xs text-muted-foreground">Live conditions vary by altitude</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {weather.status === 'ready' ? weather.data.temp : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {weather.status === 'ready' ? weather.data.condition : '—'}
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-border" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Droplet className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                      <p className="font-semibold text-foreground">{weather.status === 'ready' ? weather.data.humidity : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wind className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Wind</p>
                      <p className="font-semibold text-foreground">{weather.status === 'ready' ? weather.data.wind : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Visibility</p>
                      <p className="font-semibold text-foreground">—</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Feels like</p>
                      <p className="font-semibold text-foreground">{weather.status === 'ready' ? weather.data.temp : '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground transition">
                    <MapPin className="h-3.5 w-3.5" /> {trek.region}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground transition">
                    <Bus className="h-3.5 w-3.5" /> {trek.transportation || 'On request'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground transition">
                    <TrendingUp className="h-3.5 w-3.5" /> {getAltitudeLabel(trek.maxAltitude)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground transition">
                    <Wind className="h-3.5 w-3.5" /> Seasonal shifts
                  </span>
                </div>
              </Card>
            </motion.aside>
          </motion.div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="container mx-auto px-4 py-3 grid grid-cols-2 gap-2">
          <Button className="w-full" onClick={scrollToBooking}>Book This Trek</Button>
          <Button variant="outline" className="w-full" onClick={handleDownloadItinerary} disabled={downloadingItinerary}>
            <Download className="w-4 h-4 mr-2" />
            Itinerary PDF
          </Button>
        </div>
      </div>
    </main>
  );
}
