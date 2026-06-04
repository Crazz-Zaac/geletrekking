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
  Users,
  Zap,
  Clock,
  Mountain,
  CheckCircle2,
  XCircle,
  Star,
  Trophy,
} from 'lucide-react'
import { marked } from 'marked'

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

      <main className="min-h-screen bg-[#F8F6F1] pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back Button */}
          <Link href="/activities" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-900 transition-colors text-sm font-medium mb-7 group w-fit rounded-full border border-[#E5DFD4] shadow-sm">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to all activities
          </Link>

          {/* Title Section */}
          <div className="mb-7 flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activity.isFeatured && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-[0.18em] rounded-full border border-amber-200/70">
                    Bestseller
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                  📍 {activity.category || 'Activity'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-[1.08] max-w-2xl">
                {getActivityMenuLabel(activity)}
              </h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-600 leading-relaxed">
                Carefully curated trekking experiences with local insight, clear planning, and a smoother booking flow.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-gray-600 border border-[#E5DFD4] shadow-sm transition-colors">
                <Share2 size={18} />
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-gray-600 border border-[#E5DFD4] shadow-sm transition-colors">
                ♡
              </button>
            </div>
          </div>

          {/* Layout */}
          <div className="flex flex-col lg:flex-row gap-10 relative">
            {/* Left Column: Details */}
            <div className="flex-1 min-w-0">
              {/* Hero Image */}
              <div className="relative w-full h-[300px] md:h-[440px] rounded-[26px] overflow-hidden bg-gray-100 mb-7 shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
                {activity.mainImage && (
                  <img
                    src={activity.mainImage}
                    alt={getActivityMenuLabel(activity)}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  />
                )}
                {!activity.mainImage && (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
                <div className="rounded-2xl bg-white border border-[#E5DFD4] px-4 py-3.5 shadow-sm flex items-center gap-3">
                  <Clock size={20} className="text-[#8B6B3D] shrink-0" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-500 font-semibold">Duration</span>
                    <span className="block mt-1 font-semibold text-gray-900 text-[15px] leading-none">{activity.duration || '—'}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-[#E5DFD4] px-4 py-3.5 shadow-sm flex items-center gap-3">
                  <Users size={20} className="text-[#8B6B3D] shrink-0" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-500 font-semibold">Group Size</span>
                    <span className="block mt-1 font-semibold text-gray-900 text-[15px] leading-none">{activity.groupSizeMin}–{activity.groupSizeMax || '?'}</span>
                  </div>
                </div>

                {activity.maxAltitude && (
                  <div className="rounded-2xl bg-white border border-[#E5DFD4] px-4 py-3.5 shadow-sm flex items-center gap-3">
                    <Mountain size={20} className="text-[#8B6B3D] shrink-0" />
                    <div>
                      <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-500 font-semibold">Altitude</span>
                      <span className="block mt-1 font-semibold text-gray-900 text-[15px] leading-none">{activity.maxAltitude}</span>
                    </div>
                  </div>
                )}

                {/* <div className="flex items-center gap-4">
                  <Star size={24} className="text-orange-400" />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg leading-none">4.8/5</span>
                    <span className="text-sm text-gray-500 mt-1">Highly Rated</span>
                  </div>
                </div> */}
              </div>

              {/* Tabs */}
              <ActivityDetailTabs activity={activity} />
            </div>

            {/* Right Column: Booking Widget */}
            <div className="w-full lg:w-[360px] shrink-0">
              <div className="sticky top-28">
                <BookingWidget activity={activity} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

function BookingWidget({ activity }: { activity: PublicActivity }) {
  return (
    <div className="bg-white rounded-[28px] p-6 md:p-7 border border-[#E5DFD4] shadow-[0_14px_45px_rgba(17,24,39,0.06)]">
      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-3xl font-bold text-gray-900">${activity.price || '—'}</span>
        <span className="text-gray-500 font-medium">/ person</span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="rounded-2xl bg-[#F8F6F1] border border-[#E5DFD4] px-4 py-3 flex items-center justify-between">
          <div>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-500 font-semibold">Trip style</span>
            <span className="block mt-1 text-sm font-medium text-gray-900">Guided trekking experience</span>
          </div>
          <Zap size={18} className="text-[#8B6B3D]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F8F6F1] border border-[#E5DFD4] px-4 py-3">
            <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-500 font-semibold">Duration</span>
            <span className="block mt-1 text-sm font-medium text-gray-900">{activity.duration || '—'} days</span>
          </div>
          <div className="rounded-2xl bg-[#F8F6F1] border border-[#E5DFD4] px-4 py-3">
            <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-500 font-semibold">Group</span>
            <span className="block mt-1 text-sm font-medium text-gray-900">{activity.groupSizeMin}–{activity.groupSizeMax || '?'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" strokeWidth={3} />
          <span>Free cancellation up to 24 hours before the activity starts</span>
        </div>
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" strokeWidth={3} />
          <span>Reserve now & pay later to secure your spot</span>
        </div>
      </div>
    </div>
  )
}

function ActivityDetailTabs({ activity }: { activity: PublicActivity }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [descriptionHtml, setDescriptionHtml] = useState('')

  const tabs = ['Overview', 'Itinerary', 'Included']

  useEffect(() => {
    const renderMarkdown = async () => {
      if (activity.fullDescription) {
        const html = await marked(activity.fullDescription)
        setDescriptionHtml(html as string)
      }
    }
    renderMarkdown()
  }, [activity.fullDescription])

  return (
    <div className="mt-12">
      <div className="rounded-[24px] border border-[#E5DFD4] bg-white p-2 shadow-sm">
        <nav className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#004D67] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-[#F8F6F1]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="rounded-[24px] border border-[#E5DFD4] bg-white p-5 md:p-7 shadow-sm max-w-none">
            {descriptionHtml ? (
              <div 
                className="text-gray-600 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ 
                  __html: descriptionHtml
                    .replace(/<h2>/g, '<h2 style="font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: rgb(17, 24, 39);">')
                    .replace(/<h3>/g, '<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: rgb(17, 24, 39);">')
                    .replace(/<p>/g, '<p style="margin-bottom: 1rem; line-height: 1.75;">')
                    .replace(/<ul>/g, '<ul style="list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem;">')
                    .replace(/<li>/g, '<li style="margin-bottom: 0.5rem;">')
                    .replace(/<ol>/g, '<ol style="list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem;">')
                }} 
              />
            ) : activity.fullDescription ? (
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {activity.fullDescription}
              </p>
            ) : null}

            {activity.tags && activity.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
                <div className="flex gap-2 flex-wrap">
                  {activity.tags.map((tag) => (
                    <span key={tag} className="text-sm bg-[#F8F6F1] border border-[#E5DFD4] rounded-full px-3 py-1.5 text-gray-700 hover:border-gray-300 transition">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'Itinerary' && (
          <div className="rounded-[24px] border border-[#E5DFD4] bg-white p-5 md:p-7 shadow-sm">
            {activity.itinerary && activity.itinerary.length > 0 ? (
              <div className="space-y-0">
                {activity.itinerary.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-5 relative">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#004D67] text-white text-xs font-bold flex items-center justify-center z-10 shadow-sm">
                        {item.day}
                      </div>
                      {idx < (activity.itinerary?.length || 0) - 1 && (
                        <div className="w-0.5 h-16 bg-[#E5DFD4] mt-2" />
                      )}
                    </div>
                    <div className="pt-0.5 flex-1 rounded-2xl border border-[#E5DFD4] bg-[#F8F6F1] px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-base font-semibold text-gray-900">{item.title}</p>
                        {idx === 0 && activity.duration && (
                          <span className="inline-block text-[11px] uppercase tracking-[0.18em] bg-white text-[#004D67] rounded-full px-2.5 py-1 font-semibold shrink-0 border border-[#D9E3E8]">
                            {activity.duration} days
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 leading-6 whitespace-pre-wrap">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">No detailed itinerary available.</p>
            )}
          </div>
        )}

        {/* Included Tab */}
        {activeTab === 'Included' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-[24px] border border-[#E5DFD4] bg-white p-5 md:p-7 shadow-sm">
            {activity.includes && activity.includes.length > 0 && (
              <div className="border border-[#DCE8DF] rounded-2xl p-6 bg-green-50/30">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-base font-semibold text-gray-900">What's included</p>
                </div>
                <ul className="space-y-3 text-gray-600 list-none">
                  {activity.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activity.excludes && activity.excludes.length > 0 && (
              <div className="border border-[#E9D7D7] rounded-2xl p-6 bg-red-50/30">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-base font-semibold text-gray-900">What's excluded</p>
                </div>
                <ul className="space-y-3 text-gray-600 list-none">
                  {activity.excludes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
