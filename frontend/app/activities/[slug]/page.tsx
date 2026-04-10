import Link from 'next/link'
import { notFound } from 'next/navigation'
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

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { slug } = await params

  let activity: PublicActivity | null = null

  try {
    const data = await getActivities()
    activity = data.find((a) => a.slug === slug) || null
  } catch {
    activity = null
  }

  if (!activity) {
    notFound()
  }

  const Icon = getActivityMenuIcon(activity)

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pt-16">
        {activity.mainImage && (
          <section className="relative h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden">
            <img
              src={activity.mainImage}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/20" />

            <div className="absolute top-8 left-4 md:left-6">
              <Link
                href="/activities"
                className="inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 text-white backdrop-blur hover:bg-black/50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Activities</span>
              </Link>
            </div>

            <div className="absolute inset-x-0 bottom-0">
              <div className="container mx-auto px-4 md:px-6 pb-8 md:pb-12">
                <div className="max-w-4xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex rounded-2xl bg-white/10 p-3 border border-white/20 backdrop-blur">
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {activity.category && (
                      <Badge className="bg-white/15 text-white border border-white/25 hover:bg-white/20">
                        {activity.category}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
                    {getActivityMenuLabel(activity)}
                  </h1>

                  {activity.shortDescription && (
                    <p className="mt-4 max-w-2xl text-base md:text-xl text-white/90 leading-7 drop-shadow">
                      {activity.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {!activity.mainImage && (
          <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <div className="container mx-auto px-4 md:px-6 py-14 md:py-20">
              <Link
                href="/activities"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Activities
              </Link>

              <div className="mt-6 max-w-4xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex rounded-2xl bg-primary/10 p-3 border border-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  {activity.category && (
                    <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15">
                      {activity.category}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  {getActivityMenuLabel(activity)}
                </h1>

                {activity.shortDescription && (
                  <p className="mt-4 max-w-2xl text-base md:text-xl text-muted-foreground leading-7">
                    {activity.shortDescription}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="py-8 md:py-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {activity.duration && (
                  <Card className="rounded-3xl p-5 border-border/60 bg-card/80 backdrop-blur shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Duration
                        </p>
                        <p className="mt-1 font-semibold text-foreground">{activity.duration}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {activity.price !== undefined && (
                  <Card className="rounded-3xl p-5 border-primary/20 bg-primary/5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/15 p-3">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Starting Price
                        </p>
                        <p className="mt-1 font-semibold text-foreground">
                          {activity.currency} {activity.price}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {activity.groupSizeMin && (
                  <Card className="rounded-3xl p-5 border-border/60 bg-card/80 backdrop-blur shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Group Size
                        </p>
                        <p className="mt-1 font-semibold text-foreground">
                          {activity.groupSizeMin}-{activity.groupSizeMax}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {activity.difficultyLevel && (
                  <Card className="rounded-3xl p-5 border-border/60 bg-card/80 backdrop-blur shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Difficulty
                        </p>
                        <p className="mt-1 font-semibold text-foreground">{activity.difficultyLevel}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-3 space-y-8">
                {activity.fullDescription && (
                  <Card className="rounded-[2rem] p-6 md:p-8 border-border/60 shadow-sm">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-foreground">
                      Overview
                    </h2>
                    <p className="text-muted-foreground leading-8 whitespace-pre-wrap">
                      {activity.fullDescription}
                    </p>
                  </Card>
                )}

                {activity.itinerary && activity.itinerary.length > 0 && (
                  <section>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-foreground">
                      Itinerary
                    </h2>

                    <div className="space-y-4">
                      {activity.itinerary.map((item, idx) => (
                        <Card
                          key={idx}
                          className="rounded-[2rem] p-6 md:p-7 border-border/60 shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                {item.day}
                              </div>
                            </div>

                            <div className="flex-1 pt-1">
                              <h3 className="text-lg md:text-xl font-semibold text-foreground">
                                {item.title}
                              </h3>
                              {item.description && (
                                <p className="mt-2 text-sm md:text-base text-muted-foreground leading-7">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {(activity.includes || activity.excludes) && (
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activity.includes && activity.includes.length > 0 && (
                      <Card className="rounded-[2rem] p-6 md:p-8 border-green-200/40 bg-gradient-to-br from-green-50/60 to-background dark:from-green-950/20 dark:border-green-900/30">
                        <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                          What&apos;s Included
                        </h3>
                        <ul className="space-y-3">
                          {activity.includes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm md:text-base text-muted-foreground leading-7">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {activity.excludes && activity.excludes.length > 0 && (
                      <Card className="rounded-[2rem] p-6 md:p-8 border-red-200/40 bg-gradient-to-br from-red-50/60 to-background dark:from-red-950/20 dark:border-red-900/30">
                        <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
                          <XCircle className="w-6 h-6 text-red-600" />
                          What&apos;s Excluded
                        </h3>
                        <ul className="space-y-3">
                          {activity.excludes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm md:text-base text-muted-foreground leading-7">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </section>
                )}

                {activity.galleryImages && activity.galleryImages.length > 0 && (
                  <section>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-foreground">
                      Gallery
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {activity.galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative overflow-hidden rounded-2xl bg-muted aspect-square shadow-sm"
                        >
                          <img
                            src={img}
                            alt={`${activity.title} - ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activity.videoUrl && (
                  <section>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-foreground">
                      Experience Preview
                    </h2>
                    <Card className="rounded-[2rem] overflow-hidden border-border/60 shadow-sm">
                      <div className="aspect-video bg-muted">
                        <iframe
                          src={activity.videoUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </Card>
                  </section>
                )}
              </div>

              <aside className="xl:col-span-1">
                <div className="sticky top-28 space-y-6">
                  <div className="rounded-[2rem] bg-gradient-to-br from-primary to-primary/85 p-7 text-white shadow-xl">
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                          Book Your Adventure
                        </p>

                        {activity.price !== undefined && (
                          <div className="mt-4">
                            <p className="text-sm text-white/75">Starting from</p>
                            <p className="mt-2 text-4xl font-bold leading-none">
                              {activity.currency}{' '}
                              <span className="text-3xl">{activity.price}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {activity.maxAltitude && (
                          <div className="flex items-start gap-3">
                            <Mountain className="w-5 h-5 text-white/85 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                                Max Altitude
                              </p>
                              <p className="mt-1 text-sm font-semibold">{activity.maxAltitude}</p>
                            </div>
                          </div>
                        )}

                        {activity.date && (
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-white/85 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                                Availability
                              </p>
                              <p className="mt-1 text-sm font-semibold">
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
                            <Users className="w-5 h-5 text-white/85 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                                Group Size
                              </p>
                              <p className="mt-1 text-sm font-semibold">
                                {activity.groupSizeMin}-{activity.groupSizeMax} people
                              </p>
                            </div>
                          </div>
                        )}

                        {activity.difficultyLevel && (
                          <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-white/85 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                                Difficulty
                              </p>
                              <p className="mt-1 text-sm font-semibold">{activity.difficultyLevel}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-2">
                        <Link href="/contact" className="block">
                          <Button className="w-full h-12 bg-white text-primary hover:bg-white/90 font-bold text-base rounded-full shadow-lg">
                            <Trophy className="w-5 h-5 mr-2" />
                            Book Now
                          </Button>
                        </Link>

                        <Link href="/contact" className="block">
                          <Button
                            variant="outline"
                            className="w-full h-11 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                          >
                            Get More Info
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {activity.tags && activity.tags.length > 0 && (
                    <Card className="rounded-[2rem] p-6 border-border/60 shadow-sm">
                      <h3 className="font-bold text-foreground mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {activity.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-full cursor-default"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-border/50 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Ready to Start Your Adventure?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-8">
                Join us for an unforgettable experience and let our team help you plan every detail.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="block">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold">
                    <Trophy className="w-5 h-5 mr-2" />
                    Book Now
                  </Button>
                </Link>

                <Link href="/contact" className="block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold"
                  >
                    Request Information
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}