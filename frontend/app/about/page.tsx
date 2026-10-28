import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { AboutPageClient } from './AboutPageClient';

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description: 'Founded 2024 by Gele, a guide with 15+ years in the Himalaya. Meet our Nepal trekking team and explore our company registration and affiliations.',
  path: '/about',
  image: '/images/about-team.jpg',
  keywords: ['Gele Trekking team', 'Gele Himalayan guide', 'Nepal trekking company registration'],
});

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <AboutPageClient />
      </main>
      <Footer />
    </>
  );
}
