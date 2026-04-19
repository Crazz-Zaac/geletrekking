import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Eye, CalendarDays } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getGuideBySlug, type TravelGuide } from '@/lib/api'
import { calculateReadingTime } from '@/lib/guide-utils'
import { GuideHero } from '@/components/guide-hero'
import { GuideContentClient } from '@/components/guide-content-client'
import { marked } from 'marked'
import GuideContent from '@/components/guide-content'

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>
}

function formatGuideDate(value?: string): string {
  if (!value) return 'Recently updated'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently updated'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params

  let guide: TravelGuide | null = null
  let contentHtml = ''
  let readingTime = 0

  try {
    const data = await getGuideBySlug(slug)
    guide = data
    if (data?.content) {
      contentHtml = (await marked(data.content)) as string
      readingTime = calculateReadingTime(data.content)
    }
  } catch {
    guide = null
  }

  if (!guide) {
    notFound()
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-28 pb-28 md:pb-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-8 space-y-4">
            <Link href="/guides" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Guides
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                {guide.category}
              </Badge>
              {guide.section ? <Badge variant="outline">{guide.section}</Badge> : null}
              {guide.region ? <Badge variant="outline">{guide.region}</Badge> : null}
            </div>

            <Card className="border-border/70 bg-background/80 p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>{guide.viewCount?.toLocaleString() || 0} views</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span>Updated {formatGuideDate(guide.updatedAt || guide.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Practical travel guidance</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Hero Section */}
          <GuideHero guide={guide} readingTime={readingTime} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8">
            {/* Content Area */}
            <div>
              <Card className="border-border/70 shadow-sm overflow-hidden">
                <div className="border-b border-border/60 bg-muted/20 px-8 md:px-10 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guide Content</p>
                </div>
                <div className="p-8 md:p-10">
                  <GuideContent html={contentHtml} />
                </div>
              </Card>

              {/* Related Actions */}
              <Card className="mt-8 border-border/70 p-5 md:p-6 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-foreground">Need personalized trek advice?</h3>
                    <p className="text-sm text-muted-foreground mt-1">Our team can help you turn this guide into a real itinerary.</p>
                  </div>
                  <Link href="/contact" className="shrink-0">
                    <Button>Talk to a Trek Expert</Button>
                  </Link>
                </div>
              </Card>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/guides" className="block">
                  <Button variant="outline" className="w-full">
                    Browse all guides
                  </Button>
                </Link>
                <Link href="/contact" className="block">
                  <Button className="w-full">
                    Have questions? Contact us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <GuideContentClient content={contentHtml} guide={guide} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="container mx-auto px-4 py-3 grid grid-cols-2 gap-2">
          <Link href="/contact" className="block">
            <Button className="w-full">Talk to Expert</Button>
          </Link>
          <Link href="/guides" className="block">
            <Button variant="outline" className="w-full">More Guides</Button>
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}

