'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getGuides, getGuidesByCategory, type TravelGuide } from '@/lib/api'
import { getGuideMenuIcon } from '@/lib/guide-menu'

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Plan Your Trek Adventure
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Essential guides to prepare for your trekking journey.
            </p>

            <div className="max-w-2xl mx-auto mb-8 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={() => setSelectedCategory(null)}
                variant={selectedCategory === null ? 'default' : 'outline'}
              >
                All Guides
              </Button>
              {uniqueCategories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading guides...</p>
          ) : filteredGuides.length === 0 ? (
            <p className="text-center text-muted-foreground">No guides found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides
                .sort((a, b) => a.order - b.order)
                .map((guide) => {
                  const GuideIcon = getGuideMenuIcon(guide)
                  return (
                    <Link key={guide._id || guide.slug} href={`/guides/${guide.slug}`}>
                      <Card className="h-full border-border hover:border-primary/40 transition-colors">
                        <CardHeader>
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                            <GuideIcon className="w-5 h-5" />
                          </div>
                          <CardTitle>{guide.title}</CardTitle>
                          <CardDescription>{guide.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{guide.description}</p>
                          <div className="text-sm text-primary inline-flex items-center gap-1 font-medium">
                            Read Guide <ArrowRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function GuidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GuidesContent />
    </Suspense>
  )
}
