'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getActivities, type PublicActivity } from '@/lib/api'
import { getActivityMenuIcon, getActivityMenuLabel } from '@/lib/activity-menu'
import {
  ArrowLeft,
  Share2,
  Calendar,
  Users,
  Zap,
  Clock,
  Mountain,
  CheckCircle2,
  XCircle,
  Star,
  Trophy,
} from 'lucide-react'

interface ActivityDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const [activity, setActivity] = useState<PublicActivity | null>(null)
  const [slug, setSlug] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const { slug: pageSlug } = await params
      setSlug(pageSlug)

      try {
        const data = await getActivities()
        const found = data.find((a) => a.slug === pageSlug) || null
        setActivity(found)
        if (!found) {
          router.push('/not-found')
        }
      } catch {
        setActivity(null)
        router.push('/not-found')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params, router])

  if (loading || !activity) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    )
  }

  const Icon = getActivityMenuIcon(activity)

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-16">
        <div className="px-4 md:px-6 py-6 md:py-8 pb-32">
          <div className="container mx-auto space-y-6">
            {/* Back Button */}
            <Link href="/activities" className="inline-flex items-center gap-2 text-sm text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg px-4 py-2 transition font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            {/* Hero Card */}
            <div className="rounded-lg overflow-hidden relative h-48" style={{ backgroundColor: '#CC8B79' }}>

              <div className="absolute top-3 right-3">
                <button className="w-7 h-7 rounded-full bg-black/25 border border-white/20 backdrop-blur flex items-center justify-center text-white/70 hover:bg-black/35 transition">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative p-5 h-full flex flex-col justify-end space-y-3">
                <h1 className="text-3xl font-semibold text-white line-clamp-3">
                  {getActivityMenuLabel(activity)}
                </h1>

                <div className="flex gap-2 flex-wrap">
                  {activity.duration && (
                    <span className="text-xs border border-white/22 bg-white/12 text-white/80 rounded-full px-3 py-1 font-medium">
                      {activity.duration}
                    </span>
                  )}
                  {activity.difficultyLevel && (
                    <span className="text-xs border border-orange-400/40 bg-orange-500/20 text-orange-100 rounded-full px-3 py-1 font-medium">
                      {activity.difficultyLevel}
                    </span>
                  )}
                  {activity.maxAltitude && (
                    <span className="text-xs border border-purple-400/40 bg-purple-500/20 text-purple-100 rounded-full px-3 py-1 font-medium">
                      {activity.maxAltitude}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {activity.currency}{activity.price || 'POA'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 uppercase">PRICE</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {activity.groupSizeMin}–{activity.groupSizeMax || '?'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 uppercase">Group</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-foreground">4.8</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase">Rating</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-foreground">120+</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase">Reviews</p>
              </div>
              {activity.maxAltitude && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">{activity.maxAltitude}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase">Max altitude</p>
                </div>
              )}
              {activity.date && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(activity.date).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase">Best season</p>
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <ActivityDetailTabs activity={activity} />
          </div>
        </div>

      </main>

      <Footer />
    </>
  )
}

function ActivityDetailTabs({ activity }: { activity: PublicActivity }) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'included', label: 'Included' },
    { id: 'reviews', label: 'Reviews' },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-semibold px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'text-foreground border-foreground'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Panel */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {activity.fullDescription && (
            <p className="text-base text-muted-foreground leading-7">
              {activity.fullDescription}
            </p>
          )}

          {/* Highlights */}
          <div className="grid grid-cols-3 gap-2">
            {activity.duration && (
              <div className="bg-muted rounded-lg p-3">
                <div className="w-7 h-7 rounded bg-blue-100 flex items-center justify-center mb-2">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Daily trek</p>
                <p className="text-base font-semibold text-foreground">5-7 hrs avg</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-2">
              {activity.tags.map((tag) => (
                <span key={tag} className="text-sm border border-border rounded-full px-3 py-1.5 text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Itinerary Panel */}
      {activeTab === 'itinerary' && (
        <div className="space-y-0">
          {activity.itinerary && activity.itinerary.length > 0 ? (
            activity.itinerary.map((item, idx) => (
              <div key={idx} className="flex gap-3 pb-4 relative">
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <div className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-semibold flex items-center justify-center z-10">
                    {item.day}
                  </div>
                  {idx < (activity.itinerary?.length || 0) - 1 && (
                    <div className="w-0.5 h-12 bg-border mt-2" />
                  )}
                </div>
                <div className="pt-0.5 flex-1">
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 leading-6">{item.description}</p>
                  )}
                  {idx === 0 && (
                    <span className="inline-block text-xs bg-blue-100 text-blue-900 rounded px-2 py-1 mt-2 font-medium">
                      Trekking · {activity.duration}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No itinerary details available.</p>
          )}
        </div>
      )}

      {/* Included Panel */}
      {activeTab === 'included' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activity.includes && activity.includes.length > 0 && (
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-base font-semibold text-foreground">What's included</p>
              </div>
              <ul className="space-y-2">
                {activity.includes.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-muted-foreground leading-6">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activity.excludes && activity.excludes.length > 0 && (
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-base font-semibold text-foreground">What's excluded</p>
              </div>
              <ul className="space-y-2">
                {activity.excludes.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-muted-foreground leading-6">
                    <XCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Reviews Panel */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="space-y-2 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-foreground">4.8</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">120+ reviews</p>
          </div>

          <div className="space-y-2">
            {['5', '4', '3', '2', '1'].map((rating) => (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-5 text-right text-muted-foreground">{rating}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-700"
                    style={{ width: ['82%', '13%', '4%', '1%', '0%'][parseInt(rating) - 1] }}
                  />
                </div>
                <span className="w-10 text-right text-muted-foreground">{['82', '13', '4', '1', '0'][parseInt(rating) - 1]}</span>
              </div>
            ))}
          </div>

          {/* Sample Reviews */}
          <div className="space-y-3 mt-6">
            {[
              { name: 'Sarah R.', date: 'March 2025', text: 'Guide was phenomenal with encyclopaedic knowledge. The acclimatisation days are well-planned.' },
              { name: 'James M.', date: 'October 2024', text: 'Life-changing experience. Teahouses were basic but the warmth of Sherpa hosts was amazing.' },
            ].map((review, idx) => (
              <div key={idx} className="bg-muted rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-6">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
