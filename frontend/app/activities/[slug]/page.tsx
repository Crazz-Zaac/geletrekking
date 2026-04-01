'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getActivities, type PublicActivity } from '@/lib/api'
import { getActivityMenuIcon, getActivityMenuLabel } from '@/lib/activity-menu'
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Zap,
  Mountain,
  Trophy,
} from 'lucide-react'

interface ActivityDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const [activity, setActivity] = useState<PublicActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState('')

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const data = await getActivities()
        const found = data.find((a) => a.slug === slug)
        setActivity(found || null)
      } catch {
        setActivity(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto px-4 md:px-6 py-12">
            <p className="text-muted-foreground">Loading activity...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!activity) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold mb-4">Activity Not Found</h1>
              <p className="text-muted-foreground mb-6">The activity you're looking for doesn't exist or has been removed.</p>
              <Link href="/activities">
                <Button>Back to Activities</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const Icon = getActivityMenuIcon(activity)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pt-16">
        {/* Hero Section - Enhanced */}
        {activity.mainImage && (
          <section className="relative h-96 md:h-[500px] overflow-hidden group">
            <img
              src={activity.mainImage}
              alt={activity.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-30% to-transparent" />
            
            {/* Breadcrumb Navigation */}
            <div className="absolute top-8 left-4 md:left-6">
              <Link href="/activities" className="inline-flex items-center gap-2 text-white hover:text-white/80 transition">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Activities</span>
              </Link>
            </div>
          </section>
        )}

        {/* Header Section */}
        <section className="relative -mt-20 md:-mt-32 z-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl">
              {/* Title and Category */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex rounded-xl bg-primary/15 p-3 border border-primary/20">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                      {activity.category}
                    </Badge>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 text-white drop-shadow-lg">
                    {getActivityMenuLabel(activity)}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-md">
                    {activity.shortDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid - Enhanced */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activity.duration && (
                  <Card className="p-4 md:p-6 bg-card hover:bg-card/80 hover:border-primary/50 transition-all cursor-default border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Duration</p>
                        <p className="font-bold text-sm md:text-base mt-1">{activity.duration}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {activity.price !== undefined && (
                  <Card className="p-4 md:p-6 bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Starting Price</p>
                        <p className="font-bold text-sm md:text-base mt-1">
                          {activity.currency} {activity.price}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {activity.groupSizeMin && (
                  <Card className="p-4 md:p-6 bg-card hover:bg-card/80 hover:border-primary/50 transition-all cursor-default border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Group Size</p>
                        <p className="font-bold text-sm md:text-base mt-1">
                          {activity.groupSizeMin}-{activity.groupSizeMax}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {activity.difficultyLevel && (
                  <Card className="p-4 md:p-6 bg-card hover:bg-card/80 hover:border-primary/50 transition-all cursor-default border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Difficulty</p>
                        <p className="font-bold text-sm md:text-base mt-1">{activity.difficultyLevel}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content - Sticky Sidebar Layout */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Description */}
                {activity.fullDescription && (
                  <Card className="p-6 md:p-8 bg-card border-border/50 hover:border-border transition-colors">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                      <span className="inline-block w-1 h-8 bg-primary rounded-full"></span>
                      Overview
                    </h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {activity.fullDescription}
                    </p>
                  </Card>
                )}

                {/* Itinerary */}
                {activity.itinerary && activity.itinerary.length > 0 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                      <span className="inline-block w-1 h-8 bg-primary rounded-full"></span>
                      Itinerary
                    </h2>
                    <div className="space-y-4">
                      {activity.itinerary.map((item, idx) => (
                        <Card key={idx} className="p-6 bg-card border-border/50 hover:border-primary/30 hover:shadow-sm transition-all group cursor-default">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-base group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                                {item.day}
                              </span>
                            </div>
                            <div className="flex-1 pt-1">
                              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                              {item.description && (
                                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Includes & Excludes */}
                {(activity.includes || activity.excludes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activity.includes && activity.includes.length > 0 && (
                      <Card className="p-6 md:p-8 bg-gradient-to-br from-green-50/50 to-transparent border-green-200/30 dark:from-green-950/20 dark:to-transparent dark:border-green-900/30">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                          What's Included
                        </h3>
                        <ul className="space-y-3">
                          {activity.includes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 group">
                              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-sm text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {activity.excludes && activity.excludes.length > 0 && (
                      <Card className="p-6 md:p-8 bg-gradient-to-br from-red-50/50 to-transparent border-red-200/30 dark:from-red-950/20 dark:to-transparent dark:border-red-900/30">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                          <XCircle className="w-6 h-6 text-red-600" />
                          What's Excluded
                        </h3>
                        <ul className="space-y-3">
                          {activity.excludes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 group">
                              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-sm text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                )}

                {/* Gallery */}
                {activity.galleryImages && activity.galleryImages.length > 0 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                      <span className="inline-block w-1 h-8 bg-primary rounded-full"></span>
                      Gallery
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {activity.galleryImages.map((img, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-lg bg-muted aspect-square">
                          <img
                            src={img}
                            alt={`${activity.title} - ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {activity.videoUrl && (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                      <span className="inline-block w-1 h-8 bg-primary rounded-full"></span>
                      Experience Preview
                    </h2>
                    <Card className="p-0 overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-muted">
                        <iframe
                          src={activity.videoUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Enhanced CTA */}
              <aside className="space-y-6">
                {/* Primary CTA Card - More Prominent */}
                <Card className="p-8 sticky top-32 bg-gradient-to-br from-primary/95 to-primary/85 border-0 text-white shadow-2xl hover:shadow-3xl transition-shadow max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-white/90 uppercase tracking-wider">Book Your Adventure</p>
                      {activity.price !== undefined && (
                        <div className="mt-3">
                          <p className="text-white/80 text-sm">Starting from</p>
                          <p className="text-4xl md:text-5xl font-bold mt-1">
                            {activity.currency} <span className="text-3xl md:text-4xl">{activity.price}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/20 space-y-4 pt-6">
                      {activity.maxAltitude && (
                        <div className="flex items-start gap-3 pb-4 border-b border-white/20">
                          <Mountain className="w-5 h-5 text-white/90 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-white/80 font-medium">Max Altitude</p>
                            <p className="text-sm font-semibold mt-1">{activity.maxAltitude}</p>
                          </div>
                        </div>
                      )}

                      {activity.date && (
                        <div className="flex items-start gap-3 pb-4 border-b border-white/20">
                          <Calendar className="w-5 h-5 text-white/90 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-white/80 font-medium">Availability</p>
                            <p className="text-sm font-semibold mt-1">
                              {new Date(activity.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {activity.groupSizeMin && (
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-white/90 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-white/80 font-medium">Group Size</p>
                            <p className="text-sm font-semibold mt-1">
                              {activity.groupSizeMin}-{activity.groupSizeMax} people
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <Link href="/contact" className="block">
                        <Button className="w-full h-12 md:h-14 bg-white text-primary hover:bg-gray-100 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all">
                          <Trophy className="w-5 h-5 mr-2" />
                          Book Now
                        </Button>
                      </Link>

                      <Link href="/contact" className="block">
                        <Button variant="outline" className="w-full h-11 border-white/30 text-white hover:bg-white/10 font-semibold">
                          Get More Info
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>

                {/* Highlights Card */}
                {activity.difficultyLevel && (
                  <Card className="p-6 bg-card border-border/50">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Activity Highlights
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm font-medium">{activity.difficultyLevel} difficulty level</span>
                      </div>
                      {activity.category && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-sm font-medium">{activity.category} adventure</span>
                        </div>
                      )}
                      {activity.duration && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-sm font-medium">{activity.duration} duration</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Tags */}
                {activity.tags && activity.tags.length > 0 && (
                  <Card className="p-6 bg-card border-border/50">
                    <h3 className="font-bold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {activity.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-default hover:border-primary/50 transition-colors">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </aside>
            </div>
          </div>
        </section>

        {/* CTA Section at Bottom */}
        <section className="py-16 border-t border-border/50 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl">
              <div className="text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Adventure?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join us for an unforgettable experience. Limited spots available for the next departure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact" className="block">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold">
                      <Trophy className="w-5 h-5 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                  <Link href="/contact" className="block">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold">
                      Request Information
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
