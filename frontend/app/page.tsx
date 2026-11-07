import { buildMetadata } from '@/lib/seo'
import { HomepageGreetingWidget } from '@/components/homepage-greeting-widget'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { Trek } from '@/lib/data'
import { treks } from '@/lib/data'
import { getBlogs, getTreks, getSiteReviews } from '@/lib/api'
import { HeroSection } from './home/hero-section'
import { WhyUsSection } from './home/why-us-section'
import { BlogHighlights } from './home/blog-highlights'
import { BookingCTA } from './home/booking-cta'
import { StatsBar } from './home/stats-bar'
import { GoogleReviews } from '@/components/google-reviews'
import { PopularTreks } from './home/popular-treks'
import { SpecialOffers } from './home/special-offers'

export const metadata = buildMetadata({
  title: 'Gele Trekking — Nepal Trekking & Himalaya Tours',
  description: 'Founded in 2024 by Gele, a guide with 15+ years in the Himalaya. Explore Nepal trekking packages, local guides, and private Himalayan adventures.',
  path: '/',
  keywords: ['Nepal trekking packages', 'guided Himalayan treks', 'local Nepal trekking agency'],
})

/**
 * Order for "Popular Trek Packages": featured treks first (by their admin
 * position; 0 = no preference goes after numbered ones), then other treks,
 * with treks already shown under Special Offers last to avoid repeats.
 */
function rankForHomepage(treks: Trek[], offerIds: Set<string>): Trek[] {
  const position = (trek: Trek) => (trek.featuredOrder && trek.featuredOrder > 0 ? trek.featuredOrder : Number.MAX_SAFE_INTEGER)
  const featured = treks.filter((trek) => trek.isFeatured).sort((a, b) => position(a) - position(b))
  const rest = treks.filter((trek) => !trek.isFeatured)
  return [...featured, ...rest.filter((trek) => !offerIds.has(trek.id)), ...rest.filter((trek) => offerIds.has(trek.id))]
}

export default async function HomePage() {
  const [apiTreks, apiBlogs, reviews] = await Promise.all([
    getTreks(),
    getBlogs(),
    getSiteReviews(),
  ])

  const activeTreks = apiTreks.length > 0 ? apiTreks : treks
  const activeBlogs = apiBlogs
  const offerTreks = activeTreks.filter((trek) => trek.hasOffer).slice(0, 4)
  const popularTreks = rankForHomepage(activeTreks, new Set(offerTreks.map((trek) => trek.id)))

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <main>
          <HeroSection />
          <StatsBar />

        <SpecialOffers treks={offerTreks} />

        <PopularTreks treks={popularTreks} totalCount={activeTreks.length} />

        <WhyUsSection />
        <section className="py-16 md:py-20 bg-primary overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-12">
              <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">What Trekkers Say</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white text-balance">
                Stories from the Trail
              </h2>
            </div>
            <GoogleReviews data={reviews} />
          </div>
        </section>
        <BlogHighlights posts={activeBlogs} />
        <BookingCTA />
        </main>
      </div>
      <Footer />
      <HomepageGreetingWidget />
    </>
  )
}
