import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import type { Metadata } from 'next';
import { AboutPageClient } from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About Us | Gele Trekking',
  description:
    'Learn about Gele Trekking, our local mountain team, safety standards, legal affiliations, and the values behind our Himalayan adventures.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | Gele Trekking',
    description:
      'Meet our local trekking team and see why travellers trust Gele Trekking for safe, authentic Himalayan experiences.',
    type: 'website',
    url: '/about',
  },
};

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
