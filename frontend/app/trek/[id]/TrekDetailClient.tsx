'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTrekWeather } from '@/hooks/use-trek-weather'
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
  CircleDollarSign,
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

export default function TrekDetailClient({
  trek,
}: TrekDetailClientProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [downloadingItinerary, setDownloadingItinerary] = useState(false);
  const weather = useTrekWeather(trek?.latitude, trek?.longitude)
  const fallbackFaqs = getTrekFAQBySlug(trek.slug)?.faqs || []
  const trekFaqs = trek.faqs && trek.faqs.length > 0 ? trek.faqs : fallbackFaqs

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
          ? `${trek.acclimatizationDays} rest day${trek.acclimatizationDays > 1 ? 's' : ''}`
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

  const navItems = useMemo(
    () => [
      { id: 'trek-overview', label: 'Overview' },
      { id: 'trek-highlights', label: 'Highlights' },
      { id: 'trek-itinerary', label: 'Itinerary' },
      { id: 'trek-includes', label: 'Included' },
      { id: 'trek-excludes', label: 'Excluded' },
      { id: 'trek-map', label: 'Map' },
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

    if (trek.itineraryPdfUrl) {
      window.open(trek.itineraryPdfUrl, '_blank', 'noopener,noreferrer')
      return
    }

    setDownloadingItinerary(true)

    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 14
      const maxWidth = pageWidth - margin * 2
      let cursorY = margin

      const ensureSpace = (needed = 8) => {
        if (cursorY + needed <= pageHeight - margin) return
        pdf.addPage()
        cursorY = margin
      }

      const addHeading = (text: string, size = 16) => {
        ensureSpace(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(size)
        pdf.text(text, margin, cursorY)
        cursorY += 7
      }

      const addBody = (text: string, size = 11) => {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(size)
        const lines = pdf.splitTextToSize(text, maxWidth)
        lines.forEach((line: string) => {
          ensureSpace(6)
          pdf.text(line, margin, cursorY)
          cursorY += 5
        })
      }

      addHeading(`${trek.title} Itinerary`, 18)
      addBody(`${trek.region} • ${trek.duration} days • ${trek.difficulty} • Max altitude ${trek.maxAltitude}m`)
      addBody(`Best season: ${trek.bestSeason}`)
      cursorY += 2

      addHeading('Day-by-Day Plan', 14)
      trek.itinerary.forEach((day) => {
        addHeading(`Day ${day.day}: ${day.title}`, 12)
        addBody(day.description)
        addBody(`Altitude: ${day.altitude ? `${day.altitude}m` : 'N/A'} | Distance: ${day.distance ?? 'N/A'} | Stay: ${day.accommodation}`)
        cursorY += 1
      })

      addHeading('Cost Includes', 14)
      trek.includes.forEach((item) => addBody(`• ${item}`))

      addHeading('Cost Excludes', 14)
      trek.excludes.forEach((item) => addBody(`• ${item}`))

      pdf.save(`${trek.slug}-itinerary.pdf`)
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
                            <p className="text-muted-foreground">{day.description}</p>
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

              <motion.div variants={itemVariants} className="space-y-4">
                <SectionHeader index="05" title="What's Covered" icon={ClipboardList} />
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
                <SectionHeader index="06" title="Map" icon={MapPin} />
                <Card className="border-border overflow-hidden">
                  {trek.mapImageUrl ? (
                    <img
                      src={trek.mapImageUrl}
                      alt={`${trek.title} route map`}
                      className="h-auto w-full object-contain bg-muted/20"
                      loading="lazy"
                    />
                  ) : (
                    <iframe
                      title={`${trek.title} map`}
                      src={
                        trek.mapEmbed ||
                        `https://maps.google.com/maps?q=${encodeURIComponent(`${trek.title}, Nepal`)}&t=&z=7&ie=UTF8&iwloc=&output=embed`
                      }
                      className="w-full h-[380px] border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  )}
                </Card>
              </motion.div>

              <motion.div id="trek-gallery" variants={itemVariants} className="space-y-4 scroll-mt-36">
                <SectionHeader index="07" title="Gallery" icon={ImageIcon} />
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
                <SectionHeader index="08" title="FAQ" icon={HelpCircle} />
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
                <SectionHeader index="09" title="Booking Inquiry Form" icon={FileText} />
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
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Price of the Trek</p>
                  <div className="flex flex-col gap-1">
                    {trek.originalPrice && trek.originalPrice > trek.price ? (
                      <p className="text-xs text-muted-foreground line-through">${trek.originalPrice.toLocaleString()}</p>
                    ) : null}
                    <p className="text-2xl md:text-[34px] font-bold text-foreground leading-none">
                      ${trek.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Per person • Custom private departures available</p>
                  </div>
                  {trek.offerDiscountPercent ? (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[11px] px-3 py-1">Save {trek.offerDiscountPercent}% today</Badge>
                  ) : null}
                </div>

                <div className="my-5 h-px bg-border" />

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><CalendarRange className="w-4 h-4 text-primary" /> {trek.duration} days</div>
                    <div className="flex items-center gap-2"><Mountain className="w-4 h-4 text-primary" /> {trek.maxAltitude}m</div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {trek.groupSize}</div>
                    <div className="flex items-center gap-2"><CircleDollarSign className="w-4 h-4 text-primary" /> Flexible quote</div>
                  </div>

                  <div className="hidden md:block h-12 w-px bg-border" />

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="w-full px-2 sm:px-3 text-[11px] sm:text-xs md:text-sm leading-tight" onClick={scrollToBooking}>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Start Inquiry
                      </Button>
                      <Button variant="outline" className="w-full" onClick={scrollToBooking}>
                        Book Now
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleDownloadItinerary} disabled={downloadingItinerary}>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF itinerary
                    </Button>
                  </div>
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
