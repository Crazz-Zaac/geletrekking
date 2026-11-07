import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getTreks } from '@/lib/api';
import type { Trek } from '@/lib/data';
import { GalleryContent, type GalleryPhoto } from './GalleryContent';
import { Suspense } from 'react';

type BackendGalleryItem = {
  _id: string;
  title?: string;
  imageUrl?: string;
  category?: string;
  isFeatured?: boolean;
};

const STOP_WORDS = new Set(['trek', 'trekking', 'via', 'the', 'and', 'of', 'to']);

function tokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((word) => word && !STOP_WORDS.has(word))
  );
}

/** Best trek for a gallery category, by word overlap (Jaccard ≥ 0.5). */
function matchTrek(category: string, treks: Trek[]) {
  const wanted = tokens(category);
  if (wanted.size === 0) return null;
  let best: { trek: Trek; score: number } | null = null;
  for (const trek of treks) {
    const have = tokens(trek.title);
    let overlap = 0;
    wanted.forEach((word) => {
      if (have.has(word)) overlap += 1;
    });
    const score = overlap / (wanted.size + have.size - overlap);
    if (score >= 0.5 && (!best || score > best.score)) best = { trek, score };
  }
  return best?.trek ?? null;
}

const REGION_KEYWORDS: Array<[RegExp, string]> = [
  [/manaslu/i, 'Manaslu'],
  [/langtang/i, 'Langtang'],
  [/everest|sagarmatha|gokyo|island peak|pikey|khumbu/i, 'Everest'],
  [/mustang/i, 'Mustang'],
  [/annapurna|ghorepani|poon hill|mardi/i, 'Annapurna'],
  [/kathmandu|valley rim/i, 'Kathmandu'],
];

function regionFor(category: string, trek: Trek | null) {
  if (trek && trek.region !== 'Other') return trek.region;
  const text = `${category} ${trek?.title ?? ''}`;
  return REGION_KEYWORDS.find(([pattern]) => pattern.test(text))?.[1] ?? 'Other';
}

async function fetchGalleryData() {
  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000';

  try {
    const [itemsRes, heroRes, treks] = await Promise.all([
      fetch(`${apiUrl}/api/gallery`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/gallery/hero`, { cache: 'no-store' }).catch(() => null),
      getTreks().catch(() => [] as Trek[]),
    ]);
    const hero: { heroImageUrl?: string } = heroRes?.ok ? await heroRes.json().catch(() => ({})) : {};
    const heroImageUrl = hero.heroImageUrl || '';
    if (!itemsRes.ok) return { photos: [], heroImageUrl };

    const galleryItems: BackendGalleryItem[] = await itemsRes.json();
    const matches = new Map<string, Trek | null>();

    const photos = galleryItems
      .filter((item) => item.imageUrl)
      .map<GalleryPhoto>((item) => {
        const category = item.category?.trim() || 'Nepal';
        if (!matches.has(category)) matches.set(category, matchTrek(category, treks));
        const trek = matches.get(category) ?? null;
        return {
          id: item._id,
          image: item.imageUrl || '',
          caption: item.title?.trim() || '',
          trekName: trek?.title ?? category,
          trekSlug: trek?.slug ?? null,
          region: regionFor(category, trek),
          isFeatured: Boolean(item.isFeatured),
        };
      });
    return { photos, heroImageUrl };
  } catch (err) {
    console.error('Failed to fetch gallery data:', err);
    return { photos: [] as GalleryPhoto[], heroImageUrl: '' };
  }
}

export default async function GalleryPage() {
  const { photos, heroImageUrl } = await fetchGalleryData();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <GalleryContent photos={photos} heroImageUrl={heroImageUrl} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
