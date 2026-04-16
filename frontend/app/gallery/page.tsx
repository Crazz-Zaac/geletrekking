import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GalleryContent } from './GalleryContent';

type BackendGalleryItem = {
  _id: string;
  title?: string;
  imageUrl?: string;
  category?: string;
  isFeatured?: boolean;
};

type BackendHeroResponse = {
  heroImageUrl?: string;
};

type GalleryItem = {
  id: string;
  image: string;
  trekTitle: string;
  region: string;
  isFeatured: boolean;
};

async function fetchGalleryData() {
  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000';
  
  try {
    const [itemsRes, heroRes] = await Promise.all([
      fetch(`${apiUrl}/api/gallery`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/gallery/hero`, { cache: 'no-store' }),
    ]);

    let items: GalleryItem[] = [];
    let heroImageUrl = '';

    if (itemsRes.ok) {
      const galleryItems: BackendGalleryItem[] = await itemsRes.json();
      items = galleryItems
        .filter((item) => item.imageUrl)
        .map((item) => ({
          id: item._id,
          image: item.imageUrl || '',
          trekTitle: item.title || 'Untitled',
          region: item.category || 'Uncategorized',
          isFeatured: Boolean(item.isFeatured),
        }));
    }

    if (heroRes.ok) {
      const hero: BackendHeroResponse = await heroRes.json();
      heroImageUrl = hero.heroImageUrl || '';
    }

    return { items, heroImageUrl };
  } catch (err) {
    console.error('Failed to fetch gallery data:', err);
    return { items: [], heroImageUrl: '' };
  }
}

export default async function GalleryPage() {
  const { items, heroImageUrl } = await fetchGalleryData();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <GalleryContent initialItems={items} heroImageUrl={heroImageUrl} />
      </main>
      <Footer />
    </>
  );
}