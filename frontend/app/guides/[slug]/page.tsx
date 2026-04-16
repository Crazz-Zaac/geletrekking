import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getGuideBySlug, type TravelGuide } from '@/lib/api'
import { calculateReadingTime } from '@/lib/guide-utils'
import { GuideHero } from '@/components/guide-hero'
import { ReadingProgressBar } from '@/components/reading-progress-bar'
import { GuideContentClient } from '@/components/guide-content-client'
import { marked } from 'marked'
import GuideContent from '@/components/guide-content'

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>
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
      <ReadingProgressBar />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-28 pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <Link href="/guides" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Guides
            </Link>
          </div>

          {/* Hero Section */}
          <GuideHero guide={guide} readingTime={readingTime} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">
            {/* Content Area */}
            <div>
              <Card className="border-border/70 shadow-sm overflow-hidden">
                <div className="p-8 md:p-10">
                  <GuideContent html={contentHtml} />
                </div>
              </Card>

              {/* Related Actions */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <Footer />
    </>
  )
}

