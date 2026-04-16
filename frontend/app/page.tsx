import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { TrekCard } from '@/components/trek-card'
import { TestimonialsCarousel } from '@/components/testimonials-carousel'
import { treks, regions, blogPosts } from '@/lib/data'
import { getBlogs, getTestimonials, getTreks } from '@/lib/api'
import { HeroSection } from './home/hero-section'
import { WhyUsSection } from './home/why-us-section'
import { RegionsSection } from './home/regions-section'
import { BlogHighlights } from './home/blog-highlights'
import { BookingCTA } from './home/booking-cta'
import { StatsBar } from './home/stats-bar'

export default async function HomePage() {
  const [apiTreks, apiBlogs, apiTestimonials] = await Promise.all([
    getTreks(),
    getBlogs(),
    getTestimonials(),
  ])

  const activeTreks = apiTreks.length > 0 ? apiTreks : treks
  const activeBlogs = apiBlogs.length > 0 ? apiBlogs : blogPosts
  const offerTreks = activeTreks.filter((trek) => trek.hasOffer).slice(0, 4)
  const featuredTreks = activeTreks.filter((trek) => trek.isFeatured).slice(0, 4).length > 0 
    ? activeTreks.filter((trek) => trek.isFeatured).slice(0, 4)
    : activeTreks.slice(0, 4)

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />

        {offerTreks.length > 0 ? (
          <section className="py-10 md:py-12 bg-gradient-to-b from-red-50/70 to-background dark:from-red-950/10 dark:to-background border-y border-red-200/60 dark:border-red-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
                <div>
                  <p className="text-red-600 dark:text-red-400 text-sm font-semibold uppercase tracking-widest mb-2">Limited Time Deals</p>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-balance">
                    Special Offer Treks
                  </h2>
                </div>
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-5 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-colors shrink-0"
                >
                  Explore All Deals
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {offerTreks.map((trek) => (
                  <TrekCard key={`offer-${trek.id}`} trek={trek} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Featured Treks */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Our Top Picks</p>
                <h2 className="font-serif text-4xl font-bold text-foreground text-balance">
                  Popular Trek Packages
                </h2>
              </div>
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary border border-primary px-5 py-2.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
              >
                View All Treks
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTreks.map((trek) => (
                <TrekCard key={trek.id} trek={trek} />
              ))}
            </div>
          </div>
        </section>

        <WhyUsSection />
        <TestimonialsCarousel testimonials={apiTestimonials} />
        <RegionsSection regions={regions} />
        <BlogHighlights posts={activeBlogs} />
        <BookingCTA />
      </main>
      <Footer />
    </>
  )
}
