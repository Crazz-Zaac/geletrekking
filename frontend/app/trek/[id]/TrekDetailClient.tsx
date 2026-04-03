'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTrekWeather } from '@/hooks/use-trek-weather'
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingForm, FAQAccordion } from '@/components/booking-form';
import type { Trek } from '@/lib/data';
import {
  BedDouble,
  Bus,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  CircleDollarSign,
  CloudSun,
  Compass,
  MapPin,
  Mountain,
  Download,
  ShieldCheck,
  TrendingUp,
  Users,
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

export default function TrekDetailClient({
  trek,
}: TrekDetailClientProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const weather = useTrekWeather(trek?.latitude, trek?.longitude)

  const keyTrekInformation = [
    { label: 'Duration', value: `${trek.duration} days`, icon: CalendarRange },
    { label: 'Difficulty', value: trek.difficulty, icon: ShieldCheck },
    { label: 'Max Altitude', value: `${trek.maxAltitude}m`, icon: Mountain },
    { label: 'Best Season', value: trek.bestSeason, icon: CalendarRange },
    { label: 'Altitude Level', value: getAltitudeLabel(trek.maxAltitude), icon: Mountain },
    { label: 'Transportation', value: trek.transportation, icon: Bus },
    { label: 'Tour Type', value: trek.tourType, icon: Compass },
    { label: 'Group Size', value: trek.groupSize, icon: Users },
  ];

  const handleDownloadItinerary = () => {
    const itineraryContent = [
      `${trek.title} - Detailed Itinerary`,
      '',
      `Region: ${trek.region}`,
      `Duration: ${trek.duration} days`,
      `Difficulty: ${trek.difficulty}`,
      `Max Altitude: ${trek.maxAltitude}m`,
      `Best Season: ${trek.bestSeason}`,
      '',
      'Day-by-Day Plan',
      '----------------',
      ...trek.itinerary.map((day) => {
        const details = [
          `Day ${day.day}: ${day.title}`,
          `Description: ${day.description}`,
          `Altitude: ${day.altitude ? `${day.altitude}m` : 'N/A'}`,
          `Distance: ${day.distance ?? 'N/A'}`,
          `Accommodation: ${day.accommodation}`,
        ];

        return details.join('\n');
      }),
      '',
      'Cost Includes',
      '-------------',
      ...trek.includes.map((item) => `- ${item}`),
      '',
      'Cost Excludes',
      '-------------',
      ...trek.excludes.map((item) => `- ${item}`),
    ].join('\n\n');

    const file = new Blob([itineraryContent], { type: 'text/plain;charset=utf-8' });
    const fileUrl = URL.createObjectURL(file);

    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = `${trek.slug}-itinerary.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <main className="min-h-screen bg-background">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-0 h-[42vh] min-h-[300px] max-h-[460px] overflow-hidden"
      >
        <Image
          src={trek.image}
          alt={trek.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto space-y-3"
          >
            <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
              <Badge className="bg-primary text-white">{trek.region}</Badge>
              <Badge variant="outline" className="text-white border-white">{trek.difficulty}</Badge>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-balance max-w-4xl leading-tight">
              {trek.title}
            </motion.h1>
          </motion.div>
        </div>
      </motion.section>

      <section className="relative z-10 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Key Trek Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {keyTrekInformation.map((info) => {
              const InfoIcon = info.icon;
              return (
                <Card key={info.label} className="p-4 border-border">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <InfoIcon className="w-4 h-4" />
                    <p className="text-xs text-muted-foreground font-semibold">{info.label}</p>
                  </div>
                  <p className="font-semibold text-foreground mt-1">{info.value}</p>
                </Card>
              );
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
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">About this trek</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{trek.fullDescription}</p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Trek Highlights</h2>
                <ul className="space-y-3">
                  {trek.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-3xl font-bold text-foreground">Itinerary Timeline</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadItinerary}
                    className="border-primary/30 text-primary hover:bg-primary/10 w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Itinerary
                  </Button>
                </div>
                <div className="relative border-l border-border ml-3 space-y-5">
                  {trek.itinerary.map((day) => (
                    <div key={day.day} className="relative pl-8">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary" />
                      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <Badge className="bg-primary text-white">Day {day.day}</Badge>
                              <h3 className="font-bold text-foreground text-lg">{day.title}</h3>
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

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Cost Includes</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    {trek.includes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="border-border p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Cost Excludes</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    {trek.excludes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-red-600">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Map</h2>
                <Card className="border-border overflow-hidden">
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
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-3xl font-bold text-foreground">Gallery</h2>
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

              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">FAQ</h2>
                <FAQAccordion faqs={trek.faqs} />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Booking Inquiry Form</h2>
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

            <motion.aside variants={itemVariants} className="space-y-6 h-fit sticky top-20">
              <Card className="border-border p-6 md:p-8 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Price of the Trek</p>
                  <p className="text-4xl font-bold text-primary">${trek.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Per person • Custom private departures available</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><CalendarRange className="w-4 h-4 text-primary" /> {trek.duration} days</div>
                  <div className="flex items-center gap-2"><Mountain className="w-4 h-4 text-primary" /> {trek.maxAltitude}m</div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {trek.groupSize}</div>
                  <div className="flex items-center gap-2"><CircleDollarSign className="w-4 h-4 text-primary" /> Flexible quote</div>
                </div>
              </Card>

              <Card className="border-sky-300/40 bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-indigo-500/10 p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground text-xl">Current Weather</h3>
                  <CloudSun className="w-5 h-5 text-sky-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {trek.locationName || trek.region} • Live mountain conditions vary by altitude
                </p>

                {weather.status === 'loading' && (
                  <p className="text-sm text-muted-foreground">Loading weather...</p>
                )}

                {weather.status === 'unavailable' && (
                  <p className="text-sm text-muted-foreground">Weather data unavailable for this location.</p>
                )}

                {weather.status === 'ready' && (
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center justify-between">
                      <span className="text-muted-foreground">Condition</span>
                      <span className="font-medium">{weather.data.condition}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="font-medium">{weather.data.temp}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-muted-foreground">Humidity</span>
                      <span className="font-medium">{weather.data.humidity}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wind</span>
                      <span className="font-medium">{weather.data.wind}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1"><Compass className="w-3.5 h-3.5" /> {trek.region}</p>
                  <p className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {getAltitudeLabel(trek.maxAltitude)}</p>
                  <p className="flex items-center gap-1"><Bus className="w-3.5 h-3.5" /> {trek.transportation}</p>
                  <p className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Seasonal shifts</p>
                </div>
              </Card>
            </motion.aside>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
