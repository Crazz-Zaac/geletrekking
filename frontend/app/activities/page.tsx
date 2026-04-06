'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getActivities, type PublicActivity } from '@/lib/api'
import { getActivityMenuColumn, getActivityMenuIcon, getActivityMenuLabel } from '@/lib/activity-menu'
import {
  Mountain,
  Heart,
  Users,
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  Compass,
} from 'lucide-react'

type ColumnTitle = 'Adventures' | 'Wellness & Safety' | 'Culture & Community'

const columnTitles: ColumnTitle[] = ['Adventures', 'Wellness & Safety', 'Culture & Community']

const categoryMeta: Record<
  ColumnTitle,
  {
    icon: React.ReactNode
    description: string
    color: string
    softBg: string
    accent: string
  }
> = {
  Adventures: {
    icon: <Mountain className="w-7 h-7" />,
    description: 'Thrilling expeditions and unforgettable trekking moments across breathtaking landscapes.',
    color: 'from-orange-500 via-amber-500 to-red-500',
    softBg: 'from-orange-500/10 via-amber-500/10 to-red-500/10',
    accent: 'text-orange-600',
  },
  'Wellness & Safety': {
    icon: <Heart className="w-7 h-7" />,
    description: 'Programs designed around care, preparation, health, and confidence throughout your journey.',
    color: 'from-emerald-500 via-green-500 to-lime-500',
    softBg: 'from-emerald-500/10 via-green-500/10 to-lime-500/10',
    accent: 'text-emerald-600',
  },
  'Culture & Community': {
    icon: <Users className="w-7 h-7" />,
    description: 'Meaningful experiences that connect travelers with local traditions, stories, and communities.',
    color: 'from-sky-500 via-blue-500 to-cyan-500',
    softBg: 'from-sky-500/10 via-blue-500/10 to-cyan-500/10',
    accent: 'text-sky-600',
  },
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<PublicActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActivities()
        setActivities(data)
      } catch {
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const grouped = useMemo(() => {
    const initial: Record<ColumnTitle, PublicActivity[]> = {
      Adventures: [],
      'Wellness & Safety': [],
      'Culture & Community': [],
    }

    activities.forEach((activity) => {
      initial[getActivityMenuColumn(activity)].push(activity)
    })

    return initial
  }, [activities])

  const totalActivities = activities.length

  const filledSections = useMemo(
    () => columnTitles.filter((title) => grouped[title].length > 0),
    [grouped]
  )

  const emptySections = useMemo(
    () => columnTitles.filter((title) => grouped[title].length === 0),
    [grouped]
  )

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

          <div className="container relative mx-auto px-4 md:px-6 py-16 md:py-24">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 backdrop-blur px-4 py-2 text-xs font-semibold text-primary shadow-sm">
                <Sparkles className="w-4 h-4" />
                Carefully curated experiences
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                Explore Our
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Activities
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-7">
                Discover adventure programs, wellness-focused experiences, and community-centered
                journeys thoughtfully prepared by our team.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link href="/contact">Book Your Adventure</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                  <Link href="/gallery">View Gallery</Link>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                <div className="rounded-2xl border border-border bg-background/70 backdrop-blur p-4 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{totalActivities}</p>
                  <p className="text-sm text-muted-foreground">Published activities</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 backdrop-blur p-4 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{columnTitles.length}</p>
                  <p className="text-sm text-muted-foreground">Experience categories</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 backdrop-blur p-4 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Curated with care</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            {loading ? (
              <Card className="p-12 text-center rounded-3xl">
                <p className="text-muted-foreground">Loading activities...</p>
              </Card>
            ) : activities.length === 0 ? (
              <Card className="p-10 text-center rounded-3xl border-border shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Compass className="w-7 h-7" />
                </div>
                <p className="font-semibold text-xl text-foreground">No activities published yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back soon or contact us for a custom adventure plan.
                </p>
                <Link href="/contact">
                  <Button className="mt-6 rounded-full px-6">Book Your Adventure</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-20">
                {filledSections.map((title) => {
                  const meta = categoryMeta[title]

                  return (
                    <section key={title} className="space-y-8">
                      <div className={`rounded-3xl border border-border bg-gradient-to-br ${meta.softBg} p-6 md:p-8`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className={`bg-gradient-to-br ${meta.color} p-4 rounded-2xl text-white shadow-lg`}>
                              {meta.icon}
                            </div>

                            <div>
                              <div className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                {grouped[title].length} activities
                              </div>

                              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground">
                                {title}
                              </h2>
                              <p className="mt-2 max-w-2xl text-muted-foreground leading-7">
                                {meta.description}
                              </p>
                            </div>
                          </div>

                          <div className="hidden md:flex items-center">
                            <div className="h-16 w-16 rounded-full bg-background/70 border border-border flex items-center justify-center shadow-sm">
                              <span className={meta.accent}>{meta.icon}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {grouped[title].map((activity) => {
                          const Icon = getActivityMenuIcon(activity)

                          return (
                            <Link key={activity._id} href={`/activities/${activity.slug}`} className="group">
                              <Card className="relative h-full overflow-hidden rounded-3xl border-border bg-card/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/40">
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.color}`} />

                                <div className="p-6 pb-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <Badge
                                        variant="secondary"
                                        className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide"
                                      >
                                        {title}
                                      </Badge>

                                      <h3 className="mt-4 text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                        {getActivityMenuLabel(activity)}
                                      </h3>
                                    </div>

                                    <div className={`shrink-0 rounded-2xl bg-gradient-to-br ${meta.color} p-3 text-white shadow-md`}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                  </div>
                                </div>

                                <div className="px-6 pb-6 space-y-5">
                                  <div className="grid grid-cols-1 gap-3">
                                    {activity.duration && (
                                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
                                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span className="text-muted-foreground">{activity.duration}</span>
                                      </div>
                                    )}

                                    {activity.category && (
                                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
                                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span className="text-muted-foreground">{activity.category}</span>
                                      </div>
                                    )}
                                  </div>

                                  <p className="text-sm leading-6 text-muted-foreground line-clamp-3">
                                    {activity.shortDescription || activity.description}
                                  </p>

                                  {activity.tags && activity.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {activity.tags.slice(0, 3).map((tag) => (
                                        <span
                                          key={tag}
                                          className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="pt-2">
                                    <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 transition-colors group-hover:border-primary/40">
                                      <span className="text-sm font-semibold text-foreground">
                                        View Details
                                      </span>
                                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:translate-x-1">
                                        <ArrowRight className="w-4 h-4" />
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </Link>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}

                {emptySections.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                          More Experiences Coming Soon
                        </h2>
                        <p className="mt-2 text-muted-foreground max-w-2xl">
                          We’re preparing more curated experiences in these categories.
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {emptySections.length} category{emptySections.length === 1 ? '' : 'ies'} not yet published
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {emptySections.map((title) => {
                        const meta = categoryMeta[title]

                        return (
                          <Card
                            key={title}
                            className="rounded-3xl border border-dashed border-border bg-muted/30 p-6"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`bg-gradient-to-br ${meta.color} p-3 rounded-2xl text-white shadow-sm`}>
                                {meta.icon}
                              </div>

                              <div className="flex-1">
                                <div className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  Coming soon
                                </div>

                                <h3 className="mt-3 text-xl font-bold text-foreground">
                                  {title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                  {meta.description}
                                </p>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}