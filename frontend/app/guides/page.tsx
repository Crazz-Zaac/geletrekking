'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Phone } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getGuides, getGuidesByCategory, type TravelGuide } from '@/lib/api'
import { getGuideMenuIcon } from '@/lib/guide-menu'

/* ─────────────────────────────────────────────
   Tailwind utility: line-clamp-2 / line-clamp-3
   are available in Tailwind v3+
───────────────────────────────────────────── */

function GuidesContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams?.get('category')

  const [guides, setGuides] = useState<TravelGuide[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        if (selectedCategory) {
          const categoryGuides = await getGuidesByCategory(selectedCategory)
          setGuides(categoryGuides)
        } else {
          const data = await getGuides()
          setGuides(data.guides || [])
        }
      } catch {
        setGuides([])
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [selectedCategory])

  const filteredGuides = useMemo(
    () =>
      guides.filter(
        (guide) =>
          guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guide.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [guides, searchQuery]
  )

  const uniqueCategories = useMemo(
    () => Array.from(new Set(guides.map((guide) => guide.category))).sort(),
    [guides]
  )

  // First guide is "featured", rest go into the grid
  const [featuredGuide, ...remainingGuides] = filteredGuides.sort((a, b) => a.order - b.order)

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#eeede9] dark:bg-[#1e1e1c] pt-28 pb-16">
        <div className="container mx-auto max-w-6xl px-4">

          {/* ── Hero ── */}
          <div className="bg-[#f5f4f0] dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl p-8 mb-3.5 flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl font-medium text-[#1a1a18] dark:text-[#f0efe9] mb-1.5">
                Plan Your Trek Adventure
              </h1>
              <p className="text-sm text-[#6b6a65] dark:text-[#9b9a94] leading-relaxed">
                Essential guides to prepare for your trekking journey — from gear to safety.
              </p>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategory === null
                    ? 'bg-[#EAF3DE] text-[#27500A] border-[#97C459]'
                    : 'bg-white dark:bg-[#2c2c2a] text-[#6b6a65] dark:text-[#9b9a94] border-black/10 dark:border-white/9 hover:border-black/20'
                }`}
              >
                All Guides · {guides.length}
              </button>
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#EAF3DE] text-[#27500A] border-[#97C459]'
                      : 'bg-white dark:bg-[#2c2c2a] text-[#6b6a65] dark:text-[#9b9a94] border-black/10 dark:border-white/9 hover:border-black/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* ── Search bar ── */}
          <div className="mb-3.5 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6a65] dark:text-[#9b9a94]"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f5f4f0] dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-[#1a1a18] dark:text-[#f0efe9] placeholder:text-[#6b6a65] dark:placeholder:text-[#9b9a94] outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors"
            />
          </div>

          {/* ── Body ── */}
          {loading ? (
            <div className="bg-[#f5f4f0] dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl p-8 text-center text-[13px] text-[#6b6a65] dark:text-[#9b9a94]">
              Loading guides…
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="bg-[#f5f4f0] dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl p-8 text-center text-[13px] text-[#6b6a65] dark:text-[#9b9a94]">
              No guides found.
            </div>
          ) : (
            <>
              {/* Featured + sidebar */}
              {featuredGuide && (
                <div className="grid gap-3.5 mb-3.5" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)' }}>

                  {/* Featured card */}
                  <FeaturedCard guide={featuredGuide} />

                  {/* Right column: up to 2 small cards + empty state if needed */}
                  <div className="flex flex-col gap-3.5">
                    {remainingGuides.slice(0, 2).map((guide) => (
                      <SmallCard key={guide._id || guide.slug} guide={guide} />
                    ))}
                    {remainingGuides.length < 2 && (
                      <div className="bg-[#f5f4f0] dark:bg-[#262624] border border-dashed border-black/18 dark:border-white/16 rounded-xl p-5 flex-1 flex flex-col items-center justify-center gap-2.5 text-center">
                        <svg className="w-5 h-5 text-[#6b6a65] dark:text-[#9b9a94]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                        </svg>
                        <p className="text-[12px] font-medium text-[#1a1a18] dark:text-[#f0efe9]">More coming soon</p>
                        <p className="text-[11px] text-[#6b6a65] dark:text-[#9b9a94] leading-relaxed">
                          Additional guides <br/> are in development
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Remaining guides grid */}
              {remainingGuides.length > 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-3.5">
                  {remainingGuides.slice(2).map((guide) => (
                    <GridCard key={guide._id || guide.slug} guide={guide} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Footer CTA ── */}
          <div className="bg-white dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium text-[#1a1a18] dark:text-[#f0efe9]">Can't find what you're looking for?</p>
              <p className="text-[12px] text-[#6b6a65] dark:text-[#9b9a94] mt-0.5">We build custom activity programs on request.</p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6b6a65] dark:text-[#9b9a94] bg-[#f5f4f0] dark:bg-[#2c2c2a] border border-black/18 dark:border-white/16 rounded-lg px-3 py-1.5 hover:bg-[#eeede9] dark:hover:bg-[#333330] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Contact us
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

/* ── Sub-components ─────────────────────────────── */

function FeaturedCard({ guide }: { guide: TravelGuide }) {
  const GuideIcon = getGuideMenuIcon(guide)
  return (
    <Link href={`/guides/${guide.slug}`} className="block bg-white dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl overflow-hidden hover:border-black/20 dark:hover:border-white/20 transition-colors">
      {/* Green header band */}
      <div className="bg-[#EAF3DE] dark:bg-[#1d3309] px-6 py-5 border-b border-[#C0DD97] dark:border-[#2e5010]">
        <p className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#3B6D11] mb-2">
          Featured · {guide.category}
        </p>
        <h2 className="text-lg font-medium text-[#27500A] leading-tight mb-1.5">{guide.title}</h2>
        <p className="text-sm text-[#3B6D11] leading-relaxed line-clamp-2">{guide.description}</p>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Icon + category chip */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
            <GuideIcon className="w-3.5 h-3.5 text-[#3B6D11]" />
          </div>
          <span className="text-xs bg-[#EAF3DE] text-[#27500A] font-medium px-2 py-1 rounded-full">
            #{guide.category?.toLowerCase().replace(/\s+/g, '-')}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3B6D11] bg-[#EAF3DE] border border-[#97C459] rounded-lg px-3.5 py-1.5 hover:bg-[#C0DD97] transition-colors">
          Read Guide
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  )
}

function SmallCard({ guide }: { guide: TravelGuide }) {
  const GuideIcon = getGuideMenuIcon(guide)
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="bg-white dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl p-4 flex flex-col gap-2.5 hover:border-black/18 dark:hover:border-white/16 transition-colors flex-1"
    >
      <div className="flex items-center gap-2">
        <div className="w-[26px] h-[26px] rounded-lg bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
          <GuideIcon className="w-3 h-3 text-[#3B6D11]" />
        </div>
        <span className="text-sm font-medium text-[#1a1a18] dark:text-[#f0efe9]">{guide.title}</span>
      </div>
      <p className="text-sm text-[#6b6a65] dark:text-[#9b9a94] leading-relaxed line-clamp-2 flex-1">
        {guide.description}
      </p>
      <div className="flex items-center justify-between text-xs text-[#6b6a65] dark:text-[#9b9a94]">
        <span>{guide.category}</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  )
}

function GridCard({ guide }: { guide: TravelGuide }) {
  const GuideIcon = getGuideMenuIcon(guide)
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="bg-white dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl overflow-hidden hover:border-black/18 dark:hover:border-white/16 transition-colors flex flex-col"
    >
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] rounded-lg bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
            <GuideIcon className="w-3 h-3 text-[#3B6D11]" />
          </div>
          <span className="text-xs font-medium text-[#3B6D11] uppercase tracking-wide">{guide.category}</span>
        </div>
        <h3 className="text-sm font-medium text-[#1a1a18] dark:text-[#f0efe9]">{guide.title}</h3>
        <p className="text-sm text-[#6b6a65] dark:text-[#9b9a94] leading-relaxed line-clamp-3 flex-1">
          {guide.description}
        </p>
      </div>
      <div className="px-4 pb-4">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-[#3B6D11]">
          Read Guide <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}

/* ── Page export ─────────────────────────────────── */

export default function GuidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eeede9] dark:bg-[#1e1e1c]" />}>
      <GuidesContent />
    </Suspense>
  )
}
