import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { treks } from '@/lib/data';
import { getTreks } from '@/lib/api';
import TrekDetailClient from './TrekDetailClient';

interface TrekDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TrekDetailPage({ params }: TrekDetailPageProps) {
  const { id: trekId } = await params

  let trekList = treks;

  try {
    const apiTreks = await getTreks();
    if (apiTreks.length > 0) {
      trekList = apiTreks;
    }
  } catch {
    // fallback to local data
  }

  const trek = trekList.find((t) => t.id === trekId || t.slug === trekId);

  if (!trek) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <TrekDetailClient trek={trek} />
      <Footer />
    </>
  );
}
