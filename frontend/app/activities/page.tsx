'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { getActivities, type PublicActivity } from '@/lib/api'
import { getActivityMenuColumn } from '@/lib/activity-menu'
import { ActivityCard } from '@/components/activity-card'
import {
  Star,
  Compass,
  Search,
  X,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react'

type CategoryKey = 'Adventures' | 'Wellness' | 'Culture'
type FilterCategory = CategoryKey | 'All'
type SortOption = 'recommended' | 'az' | 'priceLow' | 'priceHigh' | 'durationShort'

function isSortOption(value: string | null): value is SortOption {
  return (
    value === 'recommended' ||
    value === 'az' ||
    value === 'priceLow' ||
    value === 'priceHigh' ||
    value === 'durationShort'
  )
}

function parseDurationDays(duration: string | undefined): number {
  if (!duration) return Number.POSITIVE_INFINITY
  const match = duration.match(/\d+/)
  return match ? Number.parseInt(match[0], 10) : Number.POSITIVE_INFINITY
}

const categoryMeta: Record<
  CategoryKey,
  {
    label: string
    key: string
    color: string
    bgColor: string
    accentColor: string
  }
> = {
  Adventures: {
    label: 'Adventures',
    key: 'o',
    color: '#D85A30',
    bgColor: '#FAECE7',
    accentColor: 'text-orange-600',
  },
  Wellness: {
    label: 'Wellness',
    key: 'g',
    color: '#1D9E75',
    bgColor: '#E1F5EE',
    accentColor: 'text-green-600',
  },
  Culture: {
    label: 'Culture',
    key: 'b',
    color: '#378ADD',
    bgColor: '#E6F1FB',
    accentColor: 'text-blue-600',
  },
}

function ActivitiesContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activities, setActivities] = useState<PublicActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recommended')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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

  useEffect(() => {
    const categoryParam = searchParams?.get('category') || 'All'
    const queryParam = searchParams?.get('q') || ''
    const sortParam = searchParams?.get('sort')
    const tagsParam = searchParams?.get('tags') || ''

    const parsedCategory: FilterCategory =
      categoryParam === 'Adventures' || categoryParam === 'Wellness' || categoryParam === 'Culture'
        ? categoryParam
        : 'All'

    const parsedTags = tagsParam
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    setActiveCategory(parsedCategory)
    setSearchQuery(queryParam)
    setSortBy(isSortOption(sortParam) ? sortParam : 'recommended')
    setActiveTags(new Set(parsedTags))
  }, [searchParams])

  const updateUrl = (next: {
    category: FilterCategory
    q: string
    sort: SortOption
    tags: Set<string>
  }) => {
    const params = new URLSearchParams(searchParams?.toString() || '')

    if (next.category !== 'All') params.set('category', next.category)
    else params.delete('category')

    if (next.q.trim()) params.set('q', next.q.trim())
    else params.delete('q')

    if (next.sort !== 'recommended') params.set('sort', next.sort)
    else params.delete('sort')

    if (next.tags.size > 0) params.set('tags', Array.from(next.tags).join(','))
    else params.delete('tags')

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    activities.forEach((activity) => {
      if (activity.tags) {
        activity.tags.forEach((tag) => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [activities])

  // Get category from activity
  const getCategoryKey = (activity: PublicActivity): CategoryKey => {
    const column = getActivityMenuColumn(activity)
    if (column === 'Wellness & Safety') return 'Wellness'
    if (column === 'Culture & Community') return 'Culture'
    return 'Adventures'
  }

  const filteredActivities = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    const result = activities.filter((activity) => {
      const cat = getCategoryKey(activity)
      const catOk = activeCategory === 'All' || cat === activeCategory
      const tagOk =
        activeTags.size === 0 ||
        [...activeTags].every((tag) => (activity.tags || []).includes(tag))

      const queryOk =
        query.length === 0 ||
        activity.title.toLowerCase().includes(query) ||
        activity.shortDescription.toLowerCase().includes(query) ||
        (activity.tags || []).some((tag) => tag.toLowerCase().includes(query))

      return catOk && tagOk && queryOk
    })

    if (sortBy === 'az') {
      return result.sort((a, b) => a.title.localeCompare(b.title))
    }

    if (sortBy === 'priceLow') {
      return result.sort((a, b) => a.price - b.price)
    }

    if (sortBy === 'priceHigh') {
      return result.sort((a, b) => b.price - a.price)
    }

    if (sortBy === 'durationShort') {
      return result.sort((a, b) => parseDurationDays(a.duration) - parseDurationDays(b.duration))
    }

    return result.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return Number(b.isFeatured) - Number(a.isFeatured)
      return (a.displayOrder || 0) - (b.displayOrder || 0)
    })
  }, [activities, activeCategory, activeTags, searchQuery, sortBy])

  // Get visible tags based on current category filter
  const visibleTags = useMemo(() => {
    const catFiltered = activeCategory === 'All' 
      ? activities 
      : activities.filter((a) => getCategoryKey(a) === activeCategory)
    const tags = new Set<string>()
    catFiltered.forEach((activity) => {
      if (activity.tags) {
        activity.tags.forEach((tag) => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [activities, activeCategory])

  // Top picks (activities marked as featured)
  const topPicks = useMemo(
    () => activities.filter((activity) => activity.isFeatured).slice(0, 3),
    [activities]
  )

  const categoryCounts = useMemo(() => {
    const counts = {
      All: activities.length,
      Adventures: activities.filter((activity) => getCategoryKey(activity) === 'Adventures').length,
      Wellness: activities.filter((activity) => getCategoryKey(activity) === 'Wellness').length,
      Culture: activities.filter((activity) => getCategoryKey(activity) === 'Culture').length,
    }

    return counts
  }, [activities])

  const handleCategoryChange = (cat: FilterCategory) => {
    setActiveCategory(cat)
    const nextTags = new Set<string>()
    setActiveTags(nextTags)
    updateUrl({
      category: cat,
      q: searchQuery,
      sort: sortBy,
      tags: nextTags,
    })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = new Set(activeTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setActiveTags(newTags)
    updateUrl({
      category: activeCategory,
      q: searchQuery,
      sort: sortBy,
      tags: newTags,
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateUrl({
      category: activeCategory,
      q: value,
      sort: sortBy,
      tags: activeTags,
    })
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    updateUrl({
      category: activeCategory,
      q: searchQuery,
      sort: value,
      tags: activeTags,
    })
  }

  const clearFilters = () => {
    setActiveCategory('All')
    const nextTags = new Set<string>()
    setActiveTags(nextTags)
    setSearchQuery('')
    setSortBy('recommended')
    router.replace(pathname, { scroll: false })
  }

  const activeFilterChips = [
    activeCategory !== 'All' ? { key: 'category', label: 'Category', value: activeCategory } : null,
    searchQuery.trim() ? { key: 'q', label: 'Search', value: searchQuery.trim() } : null,
    ...Array.from(activeTags).map((tag) => ({ key: `tag-${tag}`, label: 'Tag', value: `#${tag}` })),
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto px-4 md:px-6 py-8 space-y-4">
            <div className="h-28 rounded-2xl border border-border bg-muted animate-pulse" />
            <div className="h-16 rounded-xl border border-border bg-muted animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-72 rounded-2xl border border-border bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="px-4 md:px-6 py-6 md:py-8">
          <div className="container mx-auto max-w-6xl">
            <section className="mb-6 rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-background to-accent/10 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Activities In Nepal</h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
                    Explore curated day tours, adventure add-ons, cultural experiences, and wellness activities to complement your trek.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {filteredActivities.length} matching activit{filteredActivities.length === 1 ? 'y' : 'ies'}
                </div>
              </div>
            </section>

            {/* Top Picks Section */}
            {topPicks.length > 0 && activeCategory === 'All' && searchQuery.trim() === '' && activeTags.size === 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1">
                    <Star className="w-3 h-3 fill-amber-700 text-amber-700" />
                    <span className="text-xs font-semibold text-amber-900">Top picks</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Highest rated by our travellers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {topPicks.map((activity) => {
                    const cat = getCategoryKey(activity)
                    const meta = categoryMeta[cat]

                    return (
                      <ActivityCard
                        key={activity._id}
                        activity={activity}
                        categoryLabel={meta.label}
                      />
                    )
                  })}
                </div>

                <hr className="border-border/30 my-8" />
              </div>
            )}

            {/* Controls and Filters */}
            <div className="sticky top-16 z-20 mb-6 rounded-xl border border-border bg-background/95 backdrop-blur p-4 md:p-5">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-foreground">All activities</h2>
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1">
                  {filteredActivities.length} activit{filteredActivities.length === 1 ? 'y' : 'ies'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px_120px] gap-2.5 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search activity, description, or tag..."
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(event) => handleSortChange(event.target.value as SortOption)}
                  className="hidden md:block h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="az">Sort: A → Z</option>
                  <option value="priceLow">Sort: Price low → high</option>
                  <option value="priceHigh">Sort: Price high → low</option>
                  <option value="durationShort">Sort: Duration short first</option>
                </select>

                <Button variant="outline" className="hidden md:flex h-10" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>

              <div className="md:hidden mb-4 flex gap-2">
                <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen} direction="bottom">
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                      Filters & Sort
                      {activeFilterChips.length > 0 ? ` (${activeFilterChips.length})` : ''}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="max-h-[85vh]">
                    <DrawerHeader>
                      <DrawerTitle>Filters & Sort</DrawerTitle>
                      <DrawerDescription>
                        Refine activities by category, tags, and sorting preferences.
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-4 pb-2 overflow-y-auto space-y-5">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Sort by</p>
                        <select
                          value={sortBy}
                          onChange={(event) => handleSortChange(event.target.value as SortOption)}
                          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <option value="recommended">Recommended</option>
                          <option value="az">A → Z</option>
                          <option value="priceLow">Price low → high</option>
                          <option value="priceHigh">Price high → low</option>
                          <option value="durationShort">Duration short first</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Category</p>
                        <div className="flex flex-wrap gap-2">
                          {(['All', 'Adventures', 'Wellness', 'Culture'] as FilterCategory[]).map((cat) => (
                            <button
                              key={`mobile-${cat}`}
                              onClick={() => handleCategoryChange(cat)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                                activeCategory === cat
                                  ? `text-white border-transparent ${
                                      cat === 'Adventures'
                                        ? 'bg-orange-700'
                                        : cat === 'Wellness'
                                          ? 'bg-green-700'
                                          : cat === 'Culture'
                                            ? 'bg-blue-700'
                                            : 'bg-gray-700'
                                    }`
                                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              {cat} <span className="ml-1 opacity-80">({categoryCounts[cat]})</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {visibleTags.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {visibleTags.map((tag) => (
                              <button
                                key={`mobile-tag-${tag}`}
                                onClick={() => handleTagToggle(tag)}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                  activeTags.has(tag)
                                    ? 'bg-amber-100 text-amber-900 border-amber-200'
                                    : 'border-border bg-background text-muted-foreground hover:border-border'
                                }`}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <DrawerFooter>
                      <Button variant="outline" onClick={clearFilters}>Clear all</Button>
                      <DrawerClose asChild>
                        <Button>Show results</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>

              {/* Category Filters */}
              <div className="hidden md:flex flex-wrap gap-2 mb-4">
                {(['All', 'Adventures', 'Wellness', 'Culture'] as FilterCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      activeCategory === cat
                        ? `text-white border-transparent ${
                            cat === 'Adventures'
                              ? 'bg-orange-700'
                              : cat === 'Wellness'
                                ? 'bg-green-700'
                                : cat === 'Culture'
                                  ? 'bg-blue-700'
                                  : 'bg-gray-700'
                          }`
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cat} <span className="ml-1 opacity-80">({categoryCounts[cat]})</span>
                  </button>
                ))}
              </div>

              {/* Tag Filters */}
              {visibleTags.length > 0 && (
                <div className="hidden md:flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground font-semibold">Tags:</span>
                  {visibleTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        activeTags.has(tag)
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : 'border-border bg-background text-muted-foreground hover:border-border'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {activeFilterChips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.key}
                      onClick={() => {
                        if (chip.key === 'category') {
                          handleCategoryChange('All')
                          return
                        }

                        if (chip.key === 'q') {
                          handleSearchChange('')
                          return
                        }

                        if (chip.key.startsWith('tag-')) {
                          const tag = chip.key.replace('tag-', '')
                          handleTagToggle(tag)
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {chip.label}: {chip.value}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Activities Grid */}
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 border border-border rounded-2xl bg-muted/20">
                <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2">No activities match your current filters.</p>
                <p className="text-sm text-muted-foreground mb-5">Try removing a tag, switching category, or broadening your search.</p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
                  <Button asChild>
                    <Link href="/contact">Ask for recommendations</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map((activity) => {
                  const cat = getCategoryKey(activity)
                  const meta = categoryMeta[cat]

                  return (
                    <ActivityCard
                      key={activity._id}
                      activity={activity}
                      categoryLabel={meta.label}
                    />
                  )
                })}
              </div>
            )}

            <section className="mt-10 rounded-2xl border border-border bg-gradient-to-r from-background via-primary/5 to-accent/5 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">Not sure which activity fits your plan?</h3>
                  <p className="text-sm md:text-base text-muted-foreground mt-1.5">
                    Share your trek itinerary and we’ll suggest the best add-on activities based on your dates, fitness, and interests.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Button asChild>
                    <Link href="/contact">Talk to an expert <ArrowRight className="w-4 h-4 ml-1" /></Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/guides">Read planning guides</Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ActivitiesContent />
    </Suspense>
  )
}
