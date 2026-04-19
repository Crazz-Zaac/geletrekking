'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Phone } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getGuides, type TravelGuide } from '@/lib/api'
import { getGuideMenuIcon } from '@/lib/guide-menu'

/* ─────────────────────────────────────────────
   Tailwind utility: line-clamp-2 / line-clamp-3
   are available in Tailwind v3+
───────────────────────────────────────────── */

type SortOption = 'recommended' | 'newest' | 'az' | 'readTime'

function isSortOption(value: string | null): value is SortOption {
  return value === 'recommended' || value === 'newest' || value === 'az' || value === 'readTime'
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

function getUpdatedLabel(guide: TravelGuide): string {
  const dateValue = guide.updatedAt || guide.createdAt
  if (!dateValue) return 'Updated recently'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Updated recently'

  return `Updated ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}

function GuidesContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [allGuides, setAllGuides] = useState<TravelGuide[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recommended')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await getGuides()
        setAllGuides(data.guides || [])
      } catch {
        setAllGuides([])
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  useEffect(() => {
    const categoryParam = searchParams?.get('category') || null
    const queryParam = searchParams?.get('q') || ''
    const sortParam = searchParams?.get('sort')

    setSelectedCategory(categoryParam)
    setSearchQuery(queryParam)
    setSortBy(isSortOption(sortParam) ? sortParam : 'recommended')
  }, [searchParams])

  const updateUrl = (nextCategory: string | null, nextQuery: string, nextSort: SortOption) => {
    const params = new URLSearchParams(searchParams?.toString() || '')

    if (nextCategory) params.set('category', nextCategory)
    else params.delete('category')

    if (nextQuery.trim()) params.set('q', nextQuery.trim())
    else params.delete('q')

    if (nextSort !== 'recommended') params.set('sort', nextSort)
    else params.delete('sort')

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const handleCategoryToggle = (category: string | null) => {
    const nextCategory = selectedCategory === category ? null : category
    setSelectedCategory(nextCategory)
    updateUrl(nextCategory, searchQuery, sortBy)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateUrl(selectedCategory, value, sortBy)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    updateUrl(selectedCategory, searchQuery, value)
  }

  const handleClearAll = () => {
    setSelectedCategory(null)
    setSearchQuery('')
    setSortBy('recommended')
    router.replace(pathname, { scroll: false })
  }

  const filteredGuides = useMemo(
    () =>
      allGuides
        .filter((guide) => (selectedCategory ? guide.category === selectedCategory : true))
        .filter(
          (guide) =>
            guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [allGuides, selectedCategory, searchQuery]
  )

  const sortedGuides = useMemo(() => {
    const items = [...filteredGuides]

    if (sortBy === 'newest') {
      return items.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return bTime - aTime
      })
    }

    if (sortBy === 'az') {
      return items.sort((a, b) => a.title.localeCompare(b.title))
    }

    if (sortBy === 'readTime') {
      return items.sort((a, b) => estimateReadTime(b.content || '') - estimateReadTime(a.content || ''))
    }

    return items.sort((a, b) => {
      const aScore = (a.viewCount || 0) * 2 - (a.order || 0)
      const bScore = (b.viewCount || 0) * 2 - (b.order || 0)
      return bScore - aScore
    })
  }, [filteredGuides, sortBy])

  const uniqueCategories = useMemo(
    () => Array.from(new Set(allGuides.map((guide) => guide.category))).sort(),
    [allGuides]
  )

  const suggestedGuides = useMemo(
    () =>
      [...allGuides]
        .sort((a, b) => {
          const aScore = (a.viewCount || 0) * 2 - (a.order || 0)
          const bScore = (b.viewCount || 0) * 2 - (b.order || 0)
          return bScore - aScore
        })
        .slice(0, 3),
    [allGuides]
  )

  const activeFilters = [
    selectedCategory ? { key: 'category', label: 'Category', value: selectedCategory } : null,
    searchQuery.trim() ? { key: 'q', label: 'Search', value: searchQuery.trim() } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>

  // First guide is "featured", rest go into the grid
  const [featuredGuide, ...remainingGuides] = sortedGuides

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
              <p className="text-xs text-[#6b6a65] dark:text-[#9b9a94] mt-2">
                {allGuides.length} guide{allGuides.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-[#6b6a65] dark:text-[#9b9a94] rounded-lg bg-white/60 dark:bg-[#2c2c2a] border border-black/10 dark:border-white/9 px-3 py-2">
              <span>Showing</span>
              <span className="font-medium text-[#1a1a18] dark:text-[#f0efe9]">
                {sortedGuides.length}
              </span>
              <span>result{sortedGuides.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* ── Sticky controls ── */}
          <div className="sticky top-16 z-20 mb-3.5">
            <div className="bg-[#f5f4f0]/95 dark:bg-[#262624]/95 backdrop-blur border border-black/10 dark:border-white/9 rounded-xl p-3.5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px_120px] gap-2.5">
                <div className="relative">
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
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full bg-white dark:bg-[#2c2c2a] border border-black/10 dark:border-white/9 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-[#1a1a18] dark:text-[#f0efe9] placeholder:text-[#6b6a65] dark:placeholder:text-[#9b9a94] outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="bg-white dark:bg-[#2c2c2a] border border-black/10 dark:border-white/9 rounded-xl px-3 py-2.5 text-[13px] text-[#1a1a18] dark:text-[#f0efe9] outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="az">Sort: A → Z</option>
                  <option value="readTime">Sort: Longest Read</option>
                </select>

                <button
                  onClick={handleClearAll}
                  className="text-xs font-medium px-3 py-2.5 rounded-xl border bg-white dark:bg-[#2c2c2a] text-[#6b6a65] dark:text-[#9b9a94] border-black/10 dark:border-white/9 hover:border-black/20 transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryToggle(null)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    selectedCategory === null
                      ? 'bg-[#EAF3DE] text-[#27500A] border-[#97C459]'
                      : 'bg-white dark:bg-[#2c2c2a] text-[#6b6a65] dark:text-[#9b9a94] border-black/10 dark:border-white/9 hover:border-black/20'
                  }`}
                >
                  All Guides · {allGuides.length}
                </button>
                {uniqueCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
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

              {/* Active filter chips */}
              {activeFilters.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => {
                        if (filter.key === 'category') handleCategoryToggle(null)
                        if (filter.key === 'q') handleSearchChange('')
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/14 dark:border-white/14 bg-white/90 dark:bg-[#2c2c2a] px-3 py-1.5 text-xs font-medium text-[#1a1a18] dark:text-[#f0efe9]"
                    >
                      {filter.label}: {filter.value}
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <p className="text-xs text-[#6b6a65] dark:text-[#9b9a94] mb-3.5">
            Showing {sortedGuides.length} guide{sortedGuides.length !== 1 ? 's' : ''}
          </p>

          {/* ── Body ── */}
          {loading ? (
            <div className="bg-[#f5f4f0] dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl p-8 text-center text-[13px] text-[#6b6a65] dark:text-[#9b9a94]">
              Loading guides…
            </div>
          ) : sortedGuides.length === 0 ? (
            <div className="bg-[#f5f4f0] dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl p-8 text-center text-[13px] text-[#6b6a65] dark:text-[#9b9a94] space-y-4">
              <p>No guides found for the current filters.</p>
              <button
                onClick={handleClearAll}
                className="text-xs font-medium px-3 py-2 rounded-lg border bg-white dark:bg-[#2c2c2a] text-[#6b6a65] dark:text-[#9b9a94] border-black/14 dark:border-white/14 hover:border-black/20"
              >
                Reset filters
              </button>

              {suggestedGuides.length > 0 ? (
                <div className="pt-4 border-t border-black/10 dark:border-white/10 text-left">
                  <p className="text-xs uppercase tracking-wide mb-2 text-[#6b6a65] dark:text-[#9b9a94]">Suggested guides</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {suggestedGuides.map((guide) => (
                      <GridCard key={guide._id || guide.slug} guide={guide} compact />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              {/* Featured + sidebar */}
              {featuredGuide && (
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3.5 mb-3.5">

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
              <p className="text-[13px] font-medium text-[#1a1a18] dark:text-[#f0efe9]">Need help choosing the right guide?</p>
              <p className="text-[12px] text-[#6b6a65] dark:text-[#9b9a94] mt-0.5">Talk to a trekking expert for personalized preparation advice.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6b6a65] dark:text-[#9b9a94] bg-[#f5f4f0] dark:bg-[#2c2c2a] border border-black/18 dark:border-white/16 rounded-lg px-3 py-1.5 hover:bg-[#eeede9] dark:hover:bg-[#333330] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Talk to an expert
            </Link>
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
  const readTime = estimateReadTime(guide.content || '')
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

        <div className="mb-3 text-[11px] text-[#6b6a65] dark:text-[#9b9a94] flex flex-wrap items-center gap-2">
          <span>{readTime} min read</span>
          <span>•</span>
          <span>{getUpdatedLabel(guide)}</span>
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
  const readTime = estimateReadTime(guide.content || '')
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
        <span>{guide.category} · {readTime} min read</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  )
}

function GridCard({ guide, compact = false }: { guide: TravelGuide; compact?: boolean }) {
  const GuideIcon = getGuideMenuIcon(guide)
  const readTime = estimateReadTime(guide.content || '')
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="bg-white dark:bg-[#262624] border border-black/10 dark:border-white/9 rounded-xl overflow-hidden hover:border-black/18 dark:hover:border-white/16 transition-colors flex flex-col"
    >
      <div className={`${compact ? 'p-3' : 'p-4'} flex flex-col gap-2.5 flex-1`}>
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] rounded-lg bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
            <GuideIcon className="w-3 h-3 text-[#3B6D11]" />
          </div>
          <span className="text-xs font-medium text-[#3B6D11] uppercase tracking-wide">{guide.category}</span>
        </div>
        <h3 className="text-sm font-medium text-[#1a1a18] dark:text-[#f0efe9]">{guide.title}</h3>
        <p className={`text-sm text-[#6b6a65] dark:text-[#9b9a94] leading-relaxed ${compact ? 'line-clamp-2' : 'line-clamp-3'} flex-1`}>
          {guide.description}
        </p>
        <p className="text-[11px] text-[#6b6a65] dark:text-[#9b9a94]">{readTime} min read</p>
      </div>
      <div className={`${compact ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
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
