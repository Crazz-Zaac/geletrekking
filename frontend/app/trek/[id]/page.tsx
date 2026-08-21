import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { treks } from '@/lib/data';
import { getTreks } from '@/lib/api';
import TrekDetailClient from './TrekDetailClient';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, trekJsonLd, truncateDescription } from '@/lib/seo';

interface TrekDetailPageProps {
  params: Promise<{ id: string }>
}

async function loadTrek(trekId: string) {
  let trekList = treks;

  try {
    const apiTreks = await getTreks();
    if (apiTreks.length > 0) {
      trekList = apiTreks;
    }
  } catch {
    // fallback to local data
  }

  return trekList.find((t) => t.id === trekId || t.slug === trekId) || null;
}

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
    path: `/trek/${trek.slug || trek.id}`,
    image: trek.image,
  });
}

export default async function TrekDetailPage({ params }: TrekDetailPageProps) {
  const { id: trekId } = await params

  const trek = await loadTrek(trekId);

  if (!trek) {
    notFound();
  }

  return (
    <>
      <JsonLd data={[
        trekJsonLd(trek, `/trek/${trek.slug || trek.id}`),
        faqJsonLd(trek.faqs),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Destinations', path: '/destinations' },
          { name: trek.title, path: `/trek/${trek.slug || trek.id}` },
        ]),
      ].filter(Boolean) as Record<string, unknown>[]} />
      <Navbar />
      <TrekDetailClient trek={trek} />
      <Footer />
    </>
  );
}
