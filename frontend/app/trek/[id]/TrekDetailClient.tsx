'use client';

import { TrustBadges, TrustRating } from '@/components/trust-badges';
import { TrekReviews } from '@/components/trek-reviews';
import { ShareTrek } from '@/components/share-trek';
import { getTrekPath } from '@/lib/trek-path';
import { applyOfferToTier } from '@/lib/trek-offer'
import { PackingListCta } from '@/components/packing-list-cta';
import type { SiteReviews, TrustSummary } from '@/lib/api';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/hooks/use-site-settings'
import { toast } from 'sonner'
import { getAdminSettings } from '@/lib/api'
import { Toaster } from '@/components/ui/sonner'
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingForm, FAQAccordion, type BookingFormPrefill } from '@/components/booking-form';
import type { Trek } from '@/lib/data';
import { TrekAvailabilityCalendar } from '@/components/trek-availability-calendar';
import { TrekItinerary } from '@/components/trek-itinerary';
import { getTrekFAQBySlug } from '@/lib/faq-data';
import {
  BedDouble,
  Bus,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  ClipboardList,
  Compass,
  Droplet,
  Eye,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Info,
  MapPin,
  Mountain,
  Package,
  Download,
  Loader2,
  Route,
  Sparkles,
  Star,
  Sun,
  Timer,
  Utensils,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  X,
  Activity,
  Users,
  Wifi,
} from 'lucide-react';

interface TrekDetailClientProps {
  trek: Trek;
  trust?: TrustSummary | null;
  reviews?: SiteReviews | null;
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
  title: string
  icon: typeof Sparkles
}

function SectionHeader({ title, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[#E6F1F5] text-[#004D67]">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-2xl md:text-[28px] font-bold text-foreground leading-tight">{title}</h2>
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
  trust = null,
  reviews = null,
}: TrekDetailClientProps) {
  const [downloadingItinerary, setDownloadingItinerary] = useState(false);
  const [expandedPricingTier, setExpandedPricingTier] = useState<string | null>(null);
  const [inquiryPrefill, setInquiryPrefill] = useState<BookingFormPrefill | null>(null);
  const [expandedEssential, setExpandedEssential] = useState<string | null>(null);
  const { settings, social } = useSiteSettings()
  const fallbackFaqs = getTrekFAQBySlug(trek.slug)?.faqs || []
  const trekFaqs = trek.faqs && trek.faqs.length > 0 ? trek.faqs : fallbackFaqs
  const offerPrices = { percent: trek.offerDiscountPercent, originalPrice: trek.originalPrice, salePrice: trek.price }
  const pricingTiers: { name: string; priceUsd: number; wasPriceUsd?: number; includes: string[] }[] =
    trek.pricingTiers && trek.pricingTiers.length > 0
      ? trek.pricingTiers.map((tier) => {
          const offer = applyOfferToTier(tier.priceUsd, offerPrices)
          return { ...tier, priceUsd: offer.price, wasPriceUsd: offer.wasPrice }
        })
      : [
          {
            name: 'Economic',
            priceUsd: trek.price,
            wasPriceUsd: trek.originalPrice,
            includes: trek.includes || [],
          },
        ]
  const pricingTierOrder: Record<string, number> = { Comfort: 0, Economic: 1 }
  const orderedPricingTiers = [...pricingTiers].sort((a, b) => {
    const orderDiff = (pricingTierOrder[a.name] ?? 2) - (pricingTierOrder[b.name] ?? 2)
    if (orderDiff !== 0) return orderDiff
    return a.name.localeCompare(b.name)
  })
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

  const tripPreparationEssential = {
    id: 'trip-preparation',
    icon: ClipboardList,
    title: 'Trip Preparation',
    summary: "Prepare by improving your fitness, arranging travel documents and insurance, and packing suitable trekking gear. Bring only lightweight equipment and your personal medications. Follow your guide's advice, maintain a positive mindset for a safe and enjoyable trek.",
    detail: 'Proper preparation is essential for a safe and enjoyable trek. Maintain good fitness before departure and ensure your passport, visa, travel insurance, and permits are in order. Pack clothing and equipment as recommended on the packing list. Share your itinerary and emergency contacts with family or friends, and carry some USD cash for remote areas. If you have any medical conditions, consult your doctor and inform your guide. Mountain weather can affect travel plans, so flexibility and a positive attitude are important. Respect local customs, protect the environment, and support local communities throughout your journey.',
  }

  const traditionalLoadCarryingEssential = {
    id: 'traditional-load-carrying',
    icon: Package,
    title: 'Traditional Load-Carrying in Nepal',
    summary: 'Gele Trekking supports safer alternatives to heavy head carrying and works to protect Nepalese trekking staff.',
    detail: "Gele Trekking is committed to bringing attention to the potential brain damage being caused to countless Nepalese by the common practice of carrying heavy loads on their heads, known as 'head carrying'. Gele Trekking has pledged to make this a top focus for their treks and to actively seek solutions, including having one sherpa accompany each guest and to supporting further research on this critical health concern. By choosing Gele Trekking, our guests are providing support from around the world to help protect and nurture the minds of Nepalese in Nepal.",
  }

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
    tripPreparationEssential,
    traditionalLoadCarryingEssential,
  ]


  const tripEssentialSource = trek.tripEssentials && trek.tripEssentials.length > 0 ? trek.tripEssentials : defaultTripEssentials
  const normalizeEssentialTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const hasTripPreparation = tripEssentialSource.some((item) => normalizeEssentialTitle(item.title) === 'trip preparation')
  const hasTraditionalLoadCarrying = tripEssentialSource.some((item) => normalizeEssentialTitle(item.title).includes('traditional load carrying'))
  const tripEssentialWithRequiredItems = [
    ...tripEssentialSource,
    ...(hasTripPreparation ? [] : [tripPreparationEssential]),
    ...(hasTraditionalLoadCarrying ? [] : [traditionalLoadCarryingEssential]),
  ]
  const tripPreparationIndex = tripEssentialWithRequiredItems.findIndex((item) => normalizeEssentialTitle(item.title) === 'trip preparation')
  const loadCarryingIndex = tripEssentialWithRequiredItems.findIndex((item) => normalizeEssentialTitle(item.title).includes('traditional load carrying'))
  if (tripPreparationIndex >= 0 && loadCarryingIndex >= 0 && loadCarryingIndex !== tripPreparationIndex + 1) {
    const [loadCarryingItem] = tripEssentialWithRequiredItems.splice(loadCarryingIndex, 1)
    const nextTripPreparationIndex = tripEssentialWithRequiredItems.findIndex((item) => normalizeEssentialTitle(item.title) === 'trip preparation')
    tripEssentialWithRequiredItems.splice(nextTripPreparationIndex + 1, 0, loadCarryingItem)
  }

  const tripEssentials = tripEssentialWithRequiredItems
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
              : title.includes('preparation') || title.includes('prepare')
                ? ClipboardList
                : title.includes('traditional load') || title.includes('porter') || title.includes('load carrying')
                  ? Package
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
      { id: 'trek-availability', label: 'Dates' },
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

  const sectionNavRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const nav = sectionNavRef.current
    const chip = nav?.querySelector<HTMLElement>('[data-active="true"]')
    if (!nav || !chip) return
    nav.scrollTo({ left: chip.offsetLeft - (nav.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' })
  }, [activeSection])

  const scrollToBooking = () => {
    const node = document.getElementById('booking-inquiry-section')
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Photos above the form can finish loading mid-scroll and push it down the page.
    window.setTimeout(() => {
      const top = node.getBoundingClientRect().top
      if (top > window.innerHeight / 2 || top < 0) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 1500)
  }

  const inquireAbout = (choice: BookingFormPrefill) => {
    setInquiryPrefill(choice)
    scrollToBooking()
  }

  const inquireAboutDeparture = ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const label = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    inquireAbout({ date: startDate, dateLabel: `${label(startDate)} to ${label(endDate)}` })
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
      // On desktop the calendar sits in the side column, level with the main
      // sections, so it can't be used to work out what is being read.
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      let current = navItems[0]?.id
      let closestTop = Number.NEGATIVE_INFINITY

      navItems.forEach((item) => {
        if (isDesktop && item.id === 'trek-availability') return
        const top = getSectionTop(item.id)
        if (top - offset <= 0 && top > closestTop) {
          closestTop = top
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
      const { downloadTrekItineraryPdf } = await import('@/lib/trek-itinerary-pdf')
      // Always the current details, even if someone clicks before the page has loaded them.
      const latestSettings = await getAdminSettings().catch(() => null)
      await downloadTrekItineraryPdf({
        trek,
        settings: { ...settings, ...latestSettings },
        socialLinks: [
          { label: 'Facebook', url: social.facebook },
          { label: 'Instagram', url: social.instagram },
          { label: 'YouTube', url: social.youtube },
          { label: 'LinkedIn', url: social.linkedin },
          { label: 'WhatsApp', url: social.whatsapp },
        ].filter((item) => Boolean(item.url)),
        summary: primaryKpis.map(({ label, value }) => ({ label, value })),
        details: [...secondaryKpis, ...tertiaryKpis].map(({ label, value }) => ({ label, value })),
        packages: orderedPricingTiers,
        essentials: tripEssentials,
        equipment: specialEquipmentItems,
        faqs: trekFaqs,
      })
    } catch {
      toast.error("We couldn't create the PDF. Please check your connection and try again.")
    } finally {
      setDownloadingItinerary(false)
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" richColors closeButton />
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
          sizes="100vw"
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
        <div className="container mx-auto flex items-center gap-2 px-4 py-2 md:px-6">
          <div
            ref={sectionNavRef}
            className="relative -ml-4 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pl-4 [scrollbar-width:none] md:ml-0 md:pl-0 [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  data-active={isActive}
                  aria-current={isActive ? 'location' : undefined}
                  className={`shrink-0 px-2.5 ${isActive ? 'bg-primary text-white hover:bg-primary/90' : 'text-muted-foreground'}`}
                >
                  {item.label}
                </Button>
              )
            })}
          </div>
          <ShareTrek title={trek.title} path={getTrekPath(trek)} variant="bar" />
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 border-primary text-primary hover:bg-primary/10 hover:text-primary"
            onClick={handleDownloadItinerary}
            disabled={downloadingItinerary}
            aria-label="Download itinerary PDF"
          >
            {downloadingItinerary ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{downloadingItinerary ? 'Preparing…' : 'Download Itinerary'}</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </section>

      <section className="relative z-10 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="mb-5">
            <SectionHeader title="Key Information" icon={Sparkles} />
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
                <SectionHeader title="Trek Highlights" icon={Star} />
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
                <SectionHeader title="About The Trek" icon={Info} />
                <p className="text-base md:text-[17px] text-muted-foreground leading-relaxed">{trek.fullDescription}</p>
              </motion.div>

              <motion.div id="trek-itinerary" variants={itemVariants} className="space-y-5 scroll-mt-36">
                <SectionHeader title="Itinerary" icon={Route} />
                <TrekItinerary
                  days={trek.itinerary}
                  maxAltitude={trek.maxAltitude}
                  renderText={(value) => <FormattedText value={value} />}
                />
              </motion.div>

              <motion.div id="trek-trip-essentials" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader title="Trip Essentials" icon={Compass} />
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-stretch">
                  {tripEssentials.map((item, index) => {
                    const EssentialIcon = item.icon
                    const isExpanded = expandedEssential === item.id

                    return (
                      <Card key={item.id} className={"h-full border-border bg-card p-4 " + (tripEssentials.length === 4 && index > 2 ? "md:col-span-6" : tripEssentials.length === 5 && index > 2 ? "md:col-span-3" : "md:col-span-2")}>
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
                <SectionHeader title="What's Covered" icon={ClipboardList} />
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
                <SectionHeader title="Map" icon={MapPin} />
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
                <SectionHeader title="Special Equipment" icon={ClipboardList} />
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
                <PackingListCta />
              </motion.div>

              <motion.div id="trek-gallery" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader title="Gallery" icon={ImageIcon} />
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
                        sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 767px) 45vw, (max-width: 1023px) 30vw, 22vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div id="trek-faq" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader title="FAQ" icon={HelpCircle} />
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

              {reviews?.available && reviews.reviews.length > 0 ? (
                <motion.div variants={itemVariants} className="space-y-4">
                  <SectionHeader title="What Trekkers Say" icon={Star} />
                  <TrekReviews reviews={reviews} trekTitle={trek.title} />
                </motion.div>
              ) : null}

              <motion.div id="booking-inquiry-section" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader title="Booking Inquiry Form" icon={FileText} />
                {trust && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <TrustBadges trust={trust} className="grid gap-x-6 gap-y-2.5 space-y-0 sm:grid-cols-2" />
                  </div>
                )}
                <Card className="border-border p-6 md:p-8">
                  <BookingForm trek={trek} packageOptions={orderedPricingTiers.map((tier) => tier.name)} prefill={inquiryPrefill} />
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

            <motion.aside variants={itemVariants} className="space-y-6 h-fit w-full lg:sticky lg:top-[7.5rem] lg:ml-auto lg:max-h-[calc(100vh-8rem)] lg:max-w-sm lg:overflow-y-auto">
              <Card className="gap-0 border-border bg-white p-5 md:p-5 transition-all hover:shadow-md">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Choose your package</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Per person. Tap a package to see what&apos;s included.</p>
                    {trust && <div className="mt-2"><TrustRating trust={trust} /></div>}
                  </div>

                  <div className="space-y-2">
                    {orderedPricingTiers.map((tier) => {
                      const isExpanded = expandedPricingTier === tier.name
                      return (
                        <div key={tier.name} className="rounded-lg border border-border bg-background overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedPricingTier(isExpanded ? null : tier.name)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
                            aria-expanded={isExpanded}
                          >
                            <span className="min-w-0 text-sm font-semibold text-foreground">{tier.name}</span>
                            <span className="flex shrink-0 items-center gap-3">
                              <span className="text-right leading-tight">
                                {tier.wasPriceUsd ? <span className="block text-xs text-muted-foreground line-through">USD {tier.wasPriceUsd.toLocaleString()}</span> : null}
                                <span className={tier.wasPriceUsd ? "text-lg font-bold text-red-600" : "text-lg font-bold text-foreground"}>USD {tier.priceUsd.toLocaleString()}</span>
                              </span>
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

                              <Button className="w-full" onClick={() => inquireAbout({ packageTier: tier.name })}>
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

                <div className="my-4 h-px bg-border" />

                <div className="space-y-4">
                  <TrekAvailabilityCalendar key={trek.id} ranges={trek.availabilityRanges || []} onSelectDeparture={inquireAboutDeparture} />

                  <Button className="w-full" onClick={() => (expandedPricingTier ? inquireAbout({ packageTier: expandedPricingTier }) : scrollToBooking())}>
                    Send an inquiry
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </Card>

            </motion.aside>
          </motion.div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="container mx-auto px-4 py-3">
          <Button className="w-full" onClick={scrollToBooking}>Book This Trek</Button>
        </div>
      </div>
    </main>
  );
}
