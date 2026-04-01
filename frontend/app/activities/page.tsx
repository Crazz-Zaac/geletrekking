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

type ColumnTitle = 'Adventures' | 'Wellness & Safety' | 'Culture & Community'

const columnTitles: ColumnTitle[] = ['Adventures', 'Wellness & Safety', 'Culture & Community']

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
          <div className="container mx-auto px-4 md:px-6 space-y-8">
            {loading ? (
              <Card className="p-6 text-sm text-muted-foreground">Loading activities...</Card>
            ) : activities.length === 0 ? (
              <Card className="p-6 space-y-3">
                <p className="font-semibold text-foreground">No activities published yet.</p>
                <p className="text-sm text-muted-foreground">Check back soon or contact us for custom plans.</p>
                <Link href="/contact">
                  <Button className="mt-2">Contact Us</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {columnTitles.map((title) => (
                  <Card key={title} className="p-5 border-border">
                    <h2 className="text-lg font-bold text-foreground mb-4">{title}</h2>
                    <div className="space-y-4">
                      {grouped[title].length > 0 ? (
                        grouped[title].map((activity) => {
                          const Icon = getActivityMenuIcon(activity)
                          return (
                            <Link key={activity._id} href={`/activities/${activity.slug}`}>
                              <div className="rounded-lg border border-border p-4 bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                                <div className="flex items-start gap-3">
                                  <span className="mt-1 inline-flex rounded-md bg-primary/10 p-2">
                                    <Icon className="w-4 h-4 text-primary" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground hover:text-primary transition-colors">{getActivityMenuLabel(activity)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {[activity.category, activity.duration, activity.date ? new Date(activity.date).toLocaleDateString() : null]
                                        .filter(Boolean)
                                        .join(' • ')}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{activity.shortDescription || activity.description}</p>
                                    {activity.tags && activity.tags.length > 0 ? (
                                      <div className="mt-3 flex flex-wrap gap-1.5">
                                        {activity.tags.slice(0, 3).map((tag) => (
                                          <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          )
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">No items in this section yet.</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
