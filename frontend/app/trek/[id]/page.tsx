import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getTrekByIdentifier } from '@/lib/api';
import { getTrekPath } from '@/lib/trek-path';
import TrekDetailClient from './TrekDetailClient';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, trekJsonLd, truncateDescription } from '@/lib/seo';

interface TrekDetailPageProps {
  params: Promise<{ id: string }>
}

const loadTrek = cache((identifier: string) => getTrekByIdentifier(identifier));

export async function generateMetadata({ params }: TrekDetailPageProps): Promise<Metadata> {
  const { id: trekId } = await params;
  const trek = await loadTrek(trekId);

  if (!trek) {
    return buildMetadata({
      title: 'Trek Not Found',
      description: 'This Gele Trekking package could not be found.',
      path: `/trek/${trekId}`,
    });
  }

  return buildMetadata({
    title: `${trek.title} - ${trek.duration} Days Itinerary, Cost & Guide`,
    description: truncateDescription(trek.shortDescription || trek.fullDescription, `${trek.title} guided trek in Nepal with Gele Trekking.`),
    path: getTrekPath(trek),
    image: trek.image,
  });
}

export default async function TrekDetailPage({ params }: TrekDetailPageProps) {
  const { id: trekId } = await params

  const trek = await loadTrek(trekId);

  if (!trek) {
    notFound();
  }

  const canonicalPath = getTrekPath(trek);

  if (`/trek/${encodeURIComponent(trekId)}` !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  return (
    <>
      <JsonLd data={[
        trekJsonLd(trek, canonicalPath),
        faqJsonLd(trek.faqs),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Destinations', path: '/destinations' },
          { name: trek.title, path: canonicalPath },
        ]),
      ].filter(Boolean) as Record<string, unknown>[]} />
      <Navbar />
      <TrekDetailClient trek={trek} />
      <Footer />
    </>
  );
}
