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
import { Mountain, Heart, Users, ArrowRight, Calendar, MapPin } from 'lucide-react'

type ColumnTitle = 'Adventures' | 'Wellness & Safety' | 'Culture & Community'

const columnTitles: ColumnTitle[] = ['Adventures', 'Wellness & Safety', 'Culture & Community']

// Category metadata for better presentation
const categoryMeta: Record<ColumnTitle, { icon: React.ReactNode; description: string; color: string }> = {
  'Adventures': {
    icon: <Mountain className="w-8 h-8" />,
    description: 'Thrilling expeditions and challenging treks through stunning landscapes',
    color: 'from-orange-500 to-red-500',
  },
  'Wellness & Safety': {
    icon: <Heart className="w-8 h-8" />,
    description: 'Focus on health, safety, and well-being in every adventure',
    color: 'from-green-500 to-emerald-500',
  },
  'Culture & Community': {
    icon: <Users className="w-8 h-8" />,
    description: 'Connect with local communities and experience authentic cultural exchanges',
    color: 'from-blue-500 to-cyan-500',
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="py-14 border-b border-border bg-gradient-to-br from-primary/10 via-accent/10 to-background">
          <div className="container mx-auto px-4 md:px-6">
            <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
              Activities
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">Explore Our Activities</h1>
            <p className="text-muted-foreground mt-4 max-w-3xl">
              Curated experiences managed by our admin team, from adventure programs to community and safety-focused initiatives.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            {loading ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading activities...</p>
              </Card>
            ) : activities.length === 0 ? (
              <Card className="p-8 space-y-3 text-center">
                <p className="font-semibold text-lg text-foreground">No activities published yet.</p>
                <p className="text-sm text-muted-foreground">Check back soon or contact us for custom plans.</p>
                <Link href="/contact">
                  <Button className="mt-4">Contact Us</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-16">
                {columnTitles.map((title) => {
                  const meta = categoryMeta[title]
                  const hasActivities = grouped[title].length > 0

                  return (
                    <div key={title} className="space-y-8">
                      {/* Category Header */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className={`bg-gradient-to-br ${meta.color} p-3 rounded-xl text-white shadow-lg`}>
                            {meta.icon}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
                            <p className="text-muted-foreground mt-1 max-w-2xl">{meta.description}</p>
                          </div>
                        </div>
                        <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                      </div>

                      {/* Activities Grid */}
                      {hasActivities ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {grouped[title].map((activity) => {
                            const Icon = getActivityMenuIcon(activity)
                            return (
                              <Link key={activity._id} href={`/activities/${activity.slug}`}>
                                <Card className="h-full overflow-hidden border-border hover:border-primary transition-all group cursor-pointer hover:shadow-lg">
                                  {/* Card Top Section with Icon */}
                                  <div className={`bg-gradient-to-br ${meta.color} text-white p-6 flex items-center justify-between`}>
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wider opacity-90">{title}</p>
                                      <h3 className="text-xl font-bold mt-2 group-hover:translate-x-1 transition-transform">
                                        {getActivityMenuLabel(activity)}
                                      </h3>
                                    </div>
                                    <span className="inline-flex rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                                      <Icon className="w-6 h-6 text-white" />
                                    </span>
                                  </div>

                                  {/* Card Content */}
                                  <div className="p-6 space-y-4">
                                    {/* Meta Information */}
                                    <div className="space-y-2">
                                      {activity.duration && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                          <span>{activity.duration}</span>
                                        </div>
                                      )}
                                      {activity.category && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                          <span>{activity.category}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {activity.shortDescription || activity.description}
                                    </p>

                                    {/* Tags */}
                                    {activity.tags && activity.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-2 pt-2">
                                        {activity.tags.slice(0, 2).map((tag) => (
                                          <Badge key={tag} variant="secondary" className="text-xs">
                                            #{tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* CTA Button */}
                                    <div className="pt-4 border-t border-border">
                                      <div className="flex items-center justify-between text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                                        <span>View Details</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              </Link>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground">No activities in this section yet. Check back soon!</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
