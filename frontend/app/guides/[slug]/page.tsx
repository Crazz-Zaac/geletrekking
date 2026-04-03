import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGuideBySlug, type TravelGuide } from '@/lib/api'
import { marked } from 'marked'

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params

  let guide: TravelGuide | null = null
  let contentHtml = ''

  try {
    const data = await getGuideBySlug(slug)
    guide = data
    if (data?.content) {
      contentHtml = (await marked(data.content)) as string
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/guides" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Trip Plan
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
            <div>
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="border-b border-border/60">
                  <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{guide.category}</div>
                  <CardTitle className="text-3xl md:text-4xl leading-tight">{guide.title}</CardTitle>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">{guide.description}</p>
                </CardHeader>
                <CardContent className="py-8 md:py-10">
                  <div className="markdown-content max-w-[92ch] mx-auto" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-1">
              <Card className="xl:sticky xl:top-28 border-border/70 shadow-sm bg-card/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Ready for your adventure?</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">Browse our curated trek packages across Nepal and pick your perfect route.</p>
                </CardHeader>
                <CardContent>
                  <Link href="/destinations" className="block">
                    <Button className="w-full h-11 text-base font-semibold">View Destinations</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
