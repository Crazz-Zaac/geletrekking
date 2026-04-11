'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { getActivities, type PublicActivity } from '@/lib/api'
import { getActivityMenuColumn, getActivityMenuIcon, getActivityMenuLabel } from '@/lib/activity-menu'
import {
  Star,
  Compass,
} from 'lucide-react'

type CategoryKey = 'Adventures' | 'Wellness' | 'Culture'

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

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<PublicActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())

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

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const cat = getCategoryKey(activity)
      const catOk = activeCategory === 'All' || cat === activeCategory
      const tagOk = activeTags.size === 0 || (activity.tags && [...activeTags].every((t) => activity.tags?.includes(t)))
      return catOk && tagOk
    })
  }, [activities, activeCategory, activeTags])

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

  // Top picks (activities with highest rating or featured flag)
  const topPicks = useMemo(() => {
    return activities
      .filter((a) => a.description && a.description.length > 0) // Filter complete activities
      .sort((a, b) => (b.duration || '').localeCompare(a.duration || ''))
      .slice(0, 3)
  }, [activities])

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    setActiveTags(new Set()) // Clear tags when changing category
  }

  const handleTagToggle = (tag: string) => {
    const newTags = new Set(activeTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setActiveTags(newTags)
  }

  const clearFilters = () => {
    setActiveCategory('All')
    setActiveTags(new Set())
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto px-4 md:px-6 py-12">
            <Card className="p-12 text-center rounded-2xl">
              <p className="text-muted-foreground">Loading activities...</p>
            </Card>
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
            {/* Top Picks Section */}
            {topPicks.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1">
                    <Star className="w-3 h-3 fill-amber-700 text-amber-700" />
                    <span className="text-xs font-semibold text-amber-900">Top picks</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Highest rated by our travellers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                  {topPicks.map((activity) => {
                    const cat = getCategoryKey(activity)
                    const meta = categoryMeta[cat]
                    const Icon = getActivityMenuIcon(activity)

                    return (
                      <Link key={activity._id} href={`/activities/${activity.slug}`}>
                        <Card
                          className={`relative h-full border-2 border-primary/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer`}
                          style={{ borderTopColor: meta.color, borderTopWidth: '3px' }}
                        >
                          <div
                            className="h-16 flex items-center justify-center text-2xl relative"
                            style={{ backgroundColor: meta.bgColor }}
                          >
                            <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-blue-50 text-blue-900 text-[10px] font-semibold rounded px-2 py-1">
                              <Star className="w-3 h-3 fill-blue-900" />
                              Top pick
                            </div>
                            <Icon className="w-7 h-7" />
                          </div>

                          <div className="p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                              {meta.label}
                            </p>
                            <p className="text-sm font-semibold text-foreground mb-2 line-clamp-2">
                              {getActivityMenuLabel(activity)}
                            </p>

                            {activity.tags && activity.tags.length > 0 && (
                              <div className="flex gap-1 mb-3 flex-wrap">
                                {activity.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="text-[10px] border border-border rounded-full px-2 py-0.5 text-muted-foreground">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="border-t border-border bg-muted/40 px-3 py-2 flex justify-between items-center text-xs">
                            <span className="font-semibold text-foreground">
                              {activity.duration || 'Custom'}
                            </span>
                            <span className="text-muted-foreground">{activity.category || 'Trek'}</span>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>

                <hr className="border-border/30 my-8" />
              </div>
            )}

            {/* Controls and Filters */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-foreground">All activities</h2>
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1">
                  {filteredActivities.length} activit{filteredActivities.length === 1 ? 'y' : 'ies'}
                </span>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['All', 'Adventures', 'Wellness', 'Culture'].map((cat) => (
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
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tag Filters */}
              {visibleTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
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
            </div>

            {/* Activities Grid */}
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No activities match these filters.</p>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredActivities.map((activity) => {
                  const cat = getCategoryKey(activity)
                  const meta = categoryMeta[cat]
                  const Icon = getActivityMenuIcon(activity)

                  return (
                    <Link key={activity._id} href={`/activities/${activity.slug}`}>
                      <Card
                        className="relative h-full border border-border rounded-lg overflow-hidden hover:border-border/80 transition-colors cursor-pointer"
                        style={{ borderTopColor: meta.color, borderTopWidth: '3px' }}
                      >
                        <div
                          className="h-16 flex items-center justify-center text-2xl"
                          style={{ backgroundColor: meta.bgColor }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>

                        <div className="p-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                            {meta.label}
                          </p>
                          <p className="text-sm font-semibold text-foreground mb-2 line-clamp-2">
                            {getActivityMenuLabel(activity)}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                            {activity.shortDescription || activity.description}
                          </p>

                          {activity.tags && activity.tags.length > 0 && (
                            <div className="flex gap-1 mb-3 flex-wrap">
                              {activity.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className={`text-[10px] border rounded-full px-2 py-0.5 ${
                                    activeTags.has(tag)
                                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                                      : 'border-border text-muted-foreground'
                                  }`}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-border bg-muted/40 px-3 py-2 flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground">
                            {activity.duration || 'Custom'}
                          </span>
                          <span className="text-muted-foreground">{activity.category || 'Trek'}</span>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
