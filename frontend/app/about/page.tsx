import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';
import { breadcrumbJsonLd, buildMetadata, SITE_URL } from '@/lib/seo';
import { getAdminAbout, getSiteReviews, getTrustSummary, type AdminAbout } from '@/lib/api';
import { FOUNDER_SINCE_YEAR, SITE_METRICS } from '@/lib/site-metrics';
import { AboutContent } from './AboutContent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description: `Gele Bishokarma has worked in the Nepal Himalaya since ${FOUNDER_SINCE_YEAR}: porter, award-winning trek leader for Intrepid and Exodus, and now founder of Gele Trekking. Meet our team and our one guest, one porter policy.`,
  path: '/about',
  image: '/images/about-team.jpg',
  keywords: ['Gele Bishokarma', 'Gele Trekking founder', 'Nepal trekking guide since 1998', 'one guest one porter', 'Nepal trekking company'],
});

export default async function AboutPage() {
  const [about, reviews, trust] = await Promise.all([
    getAdminAbout().catch(() => null as AdminAbout | null),
    getSiteReviews(),
    getTrustSummary(),
  ]);

  const founder = about?.teamMembers?.find((member) => /founder/i.test(member.role)) ?? about?.teamMembers?.[0];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About Us', path: '/about' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            url: `${SITE_URL}/about`,
            name: 'About Gele Trekking',
            about: {
              '@type': 'TravelAgency',
              '@id': `${SITE_URL}/#organization`,
              name: 'Gele Trekking',
              founder: {
                '@type': 'Person',
                name: founder?.name || 'Gele Bishokarma',
                jobTitle: founder?.role || 'Founder & Lead Guide',
                ...(founder?.imageUrl ? { image: founder.imageUrl } : {}),
                description: `Trekking professional in the Nepal Himalaya since ${FOUNDER_SINCE_YEAR} (${SITE_METRICS.founderYearsGuiding} years).`,
              },
            },
          },
        ]}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <AboutContent about={about} reviews={reviews} trust={trust} />
      </main>
      <Footer />
    </>
  );
}
